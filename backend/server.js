// server.js
// Express wrapper for integrated passive scanning pipeline
// NO .env REQUIRED — Everything configured inside this file

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const dns = require('dns').promises
const axios = require('axios')
const fetch = require('node-fetch')   // v2
const fs = require('fs')
const path = require('path')

// ============================
// 🔧 CONFIG (Editable)
// ============================
const CONFIG = {
  PORT: 3001,
  SHODAN_API_KEY: "km1gmHtx2FnynRELPxNIZo0mnHTw4yqI",   // ← your real key (optional)
  IPINFO_TOKEN: "562fd914c530b5",                       // ← your real key (optional)
  WRITE_FILES: false                                    // save JSON files yes/no
}

console.log("CONFIG:", CONFIG)

// ============================ HELPERS ============================
async function safe(fn, fallback = []) {
  try { return await fn() } catch (e) { return fallback }
}

async function dohQuery(domain, type) {
  const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`
  try {
    const res = await fetch(url, { headers: { accept: 'application/dns-json' } })
    return await res.json()
  } catch (e) {
    return { Answer: [] }
  }
}

function extract(type, records) {
  return [...new Set(records.filter(r => r.type === type).map(r => r.data))]
}

async function dnsScan(domain) {
  const local = {
    A: await safe(() => dns.resolve4(domain), []),
    AAAA: await safe(() => dns.resolve6(domain), []),
    MX: await safe(() => dns.resolveMx(domain), []),
    NS: await safe(() => dns.resolveNs(domain), []),
    TXT: await safe(() => dns.resolveTxt(domain), [])
  }

  const dohA = await dohQuery(domain, "A")
  const dohAAAA = await dohQuery(domain, "AAAA")
  const dohMX = await dohQuery(domain, "MX")
  const dohNS = await dohQuery(domain, "NS")
  const dohTXT = await dohQuery(domain, "TXT")

  const all = [
    ...(dohA.Answer || []), ...(dohAAAA.Answer || []),
    ...(dohMX.Answer || []), ...(dohNS.Answer || []),
    ...(dohTXT.Answer || [])
  ]

  return {
    local,
    combined: {
      A: extract(1, all),
      AAAA: extract(28, all),
      MX: extract(15, all),
      NS: extract(2, all),
      TXT: extract(16, all)
    }
  }
}

// ============================ IP SCRAPER ============================
async function getIPs(domain, dnsData) {
  let ips = []
  ips.push(...(dnsData.local.A || []))
  ips.push(...(dnsData.combined.A || []))
  ips = [...new Set(ips)]
  return ips
}

// ============================ IPINFO ENRICHMENT ============================
async function ipinfo(ip) {
  if (!CONFIG.IPINFO_TOKEN) return null
  try {
    const url = `https://ipinfo.io/${ip}?token=${CONFIG.IPINFO_TOKEN}`
    const res = await axios.get(url)
    return res.data
  } catch {
    return null
  }
}

// ============================ SHODAN ============================
async function shodan(ip) {
  if (!CONFIG.SHODAN_API_KEY) return null
  try {
    const url = `https://api.shodan.io/shodan/host/${ip}?key=${CONFIG.SHODAN_API_KEY}`
    const res = await axios.get(url)
    return res.data
  } catch {
    return null
  }
}

// ============================ CRT.SH (subdomains) ============================
async function crtsh(domain) {
  try {
    const url = `https://crt.sh/?q=${domain}&output=json`
    const res = await axios.get(url, { timeout: 15000 })

    if (!Array.isArray(res.data)) return []

    const subs = res.data
      .flatMap(e => e.name_value.split("\n"))
      .map(s => s.toLowerCase())
      .filter(s => s.includes(domain) && !s.startsWith('*'))

    return [...new Set(subs)]
  } catch {
    return []
  }
}

function filterWebsiteSubdomains(list) {
  const include = [/^www\./, /^m\./, /^mail\./, /^blog\./, /^app/]
  const exclude = [/smtp/, /mx/, /corp/, /debug/, /proxy/, /video/]

  return [...new Set(list || [])]
    .filter(d => !exclude.some(p => p.test(d)))
    .filter(d => include.some(p => p.test(d)))
    .sort()
}

// ============================ EXECUTE PASSIVE SCAN ============================
async function runPassive(domain) {
  const dnsData = await dnsScan(domain)
  const ips = await getIPs(domain, dnsData)
  const subdomains = await crtsh(domain)
  const filteredSubs = filterWebsiteSubdomains(subdomains)

  const enriched = []
  for (const ip of ips) {
    enriched.push({
      ip,
      ipinfo: await ipinfo(ip),
      shodan: await shodan(ip)
    })
  }

  const smart = {
    domain,
    ips,
    subdomains: filteredSubs,
    suggested_nmap_targets: ips,
    suggested_commands: [
      `nmap -sV -O ${ips.join(" ")}`,
      `nmap -A --top-ports 50 ${ips.join(" ")}`,
      `nmap -Pn -T4 -sC -sV ${ips.join(" ")}`
    ]
  }

  const user = {
    domain,
    dns: dnsData,
    ips,
    subdomains: filteredSubs,
    total_subdomains: filteredSubs.length,
    enriched
  }

  if (CONFIG.WRITE_FILES) {
    fs.writeFileSync("smart_nmap_input.json", JSON.stringify(smart, null, 2))
    fs.writeFileSync("passive_result.json", JSON.stringify(user, null, 2))
  }

  return { smart, user }
}

// ============================ EXPRESS SERVER ============================
const app = express()
app.use(cors())
app.use(bodyParser.json({ limit: '10mb' }))

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Passive Scan API running" })
})

app.post("/api/scan/passive", async (req, res) => {
  const domain = req.body?.domain?.trim()
  if (!domain) return res.status(400).json({ status: "error", message: "Domain is required" })

  try {
    const { user, smart } = await runPassive(domain)
    return res.json({ status: "completed", domain, user, smart })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ status: "error", message: "Scan failed" })
  }
})

app.listen(CONFIG.PORT, () => {
  console.log(`🚀 Passive Scan Server running at http://localhost:${CONFIG.PORT}`)
})











// const express = require("express");
// const { exec } = require("child_process");
// const path = require("path");
// const app = express();

// app.get("/scan", (req, res) => {
//     const target = req.query.target || "scanme.nmap.org";

//     exec(`nmap -oX - ${target}`, (err, stdout) => {
//         if (err) return res.status(500).json({ error: err.message });

//         // XML → JSON convert
//         const xml2js = require("xml2js");
//         xml2js.parseString(stdout, (err, result) => {
//             if (err) return res.status(500).json({ error: err });

//             res.json(result);
//         });
//     });
// });

// app.listen(5000, () => console.log("Backend running on port 5000"));
