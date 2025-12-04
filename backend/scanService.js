import dns from "dns/promises";
import axios from "axios";
import fetch from "node-fetch";

// =========================== CONFIG ===========================
const SHODAN_API_KEY = "km1gmHtx2FnynRELPxNIZo0mnHTw4yqI";
const IPINFO_TOKEN = "562fd914c530b5";

// =========================== HELPERS ===========================
async function safe(fn, fallback = []) {
  try { return await fn(); } catch { return fallback; }
}

// =========================== DNS MODULE ===========================
async function dohQuery(domain, type) {
  const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`;
  try {
    const res = await fetch(url, { headers: { accept: "application/dns-json" } });
    return await res.json();
  } catch {
    return { Answer: [] };
  }
}

function extract(type, records) {
  return [...new Set(records.filter(r => r.type === type).map(r => r.data))];
}

async function dnsScan(domain) {
  const local = {
    A: await safe(() => dns.resolve4(domain)),
    AAAA: await safe(() => dns.resolve6(domain)),
    MX: await safe(() => dns.resolveMx(domain)),
    NS: await safe(() => dns.resolveNs(domain)),
    TXT: await safe(() => dns.resolveTxt(domain))
  };

  const dohA = await dohQuery(domain, "A");
  const dohAAAA = await dohQuery(domain, "AAAA");
  const dohMX = await dohQuery(domain, "MX");
  const dohNS = await dohQuery(domain, "NS");
  const dohTXT = await dohQuery(domain, "TXT");

  const all = [
    ...(dohA.Answer || []), ...(dohAAAA.Answer || []),
    ...(dohMX.Answer || []), ...(dohNS.Answer || []),
    ...(dohTXT.Answer || [])
  ];

  return {
    local,
    combined: {
      A: extract(1, all),
      AAAA: extract(28, all),
      MX: extract(15, all),
      NS: extract(2, all),
      TXT: extract(16, all)
    }
  };
}

// =========================== IP SCRAPER ===========================
async function getIPs(domain, dnsData) {
  let ips = [];
  ips.push(...dnsData.local.A);
  ips.push(...dnsData.combined.A);
  ips = [...new Set(ips)];
  return ips;
}

// =========================== IPINFO MODULE ===========================
async function ipinfo(ip) {
  try {
    const url = `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`;
    const res = await axios.get(url);
    return res.data;
  } catch {
    return null;
  }
}

// =========================== SHODAN MODULE ===========================
async function shodan(ip) {
  try {
    const url = `https://api.shodan.io/shodan/host/${ip}?key=${SHODAN_API_KEY}`;
    const res = await axios.get(url);
    return res.data;
  } catch {
    return null;
  }
}

// =========================== CRT.SH SUBDOMAIN ENUM ===========================
async function crtsh(domain) {
  try {
    const url = `https://crt.sh/?q=${domain}&output=json`;
    const res = await axios.get(url, { timeout: 15000 });

    if (!Array.isArray(res.data)) return [];

    const subs = res.data
      .flatMap(e => e.name_value.split("\n"))
      .map(s => s.toLowerCase())
      .filter(s => s.includes(domain) && !s.startsWith("*"));

    return [...new Set(subs)];
  } catch {
    return [];
  }
}

// =========================== SUBDOMAIN FILTER ===========================
function filterWebsiteSubdomains(list) {
  const include = [/^www\./, /^m\./, /^mail\./, /^blog\./, /^app/];
  const exclude = [/smtp/, /mx/, /corp/, /debug/, /proxy/, /video/];

  return [...new Set(list)]
    .filter(d => !exclude.some(p => p.test(d)))
    .filter(d => include.some(p => p.test(d)))
    .sort();
}

// =========================== MAIN SCAN FUNCTION ===========================
export async function runPassiveScan(domain) {
  console.log(`🔍 Running integrated passive scan for: ${domain}`);

  try {
    const dnsData = await dnsScan(domain);
    const ips = await getIPs(domain, dnsData);
    const subdomains = await crtsh(domain);
    const filteredSubs = filterWebsiteSubdomains(subdomains);

    const enriched = [];
    for (const ip of ips.slice(0, 3)) { // Limit to 3 IPs for speed
      enriched.push({
        ip,
        ipinfo: await ipinfo(ip),
        shodan: await shodan(ip)
      });
    }

    // SMART DATA for Nmap optimization
    const smart = {
      domain,
      ips,
      subdomains: filteredSubs,
      suggested_nmap_targets: ips.slice(0, 2),
      suggested_commands: [
        `nmap -sV -O ${ips.slice(0, 2).join(" ")}`,
        `nmap -A --top-ports 50 ${ips.slice(0, 2).join(" ")}`,
        `nmap -Pn -T4 -sC -sV ${ips.slice(0, 2).join(" ")}`
      ]
    };

    // USER DATA for display
    const user = {
      domain,
      dns: dnsData,
      ips,
      subdomains: filteredSubs,
      total_subdomains: filteredSubs.length,
      enriched,
      timestamp: new Date().toISOString(),
      scan_id: `scan_${Date.now()}`
    };

    return {
      smart,
      user,
      status: 'completed',
      message: 'Passive scan completed successfully'
    };

  } catch (error) {
    console.error('Scan error:', error);
    return {
      status: 'error',
      message: error.message,
      user: null,
      smart: null
    };
  }
}