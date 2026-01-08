// trigger_scan.js
// Usage: Open PowerShell/CMD in C:\full\backend and run: node trigger_scan.js

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const target = "oriental.ac.in";
const winReports = "C:\\full\\backend\\reports";

// ensure reports dir exists on Windows
if (!fs.existsSync(winReports)) fs.mkdirSync(winReports, { recursive: true });

console.log("🔥 Starting full scan workflow...");

// 1) Run nmap inside WSL and save xml in WSL home (~) and then copy to Windows
const nmapCmd = `wsl nmap -sV ${target} -oX ~/nmap.xml`;

// helper to run a shell command and return a Promise
function run(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
        exec(cmd, { maxBuffer: 1024 * 1024 * 50, ...opts }, (err, stdout, stderr) => {
            if (err) return reject({ err, stdout, stderr });
            resolve({ stdout, stderr });
        });
    });
}

(async () => {
    try {
        console.log("🚀 Running Nmap in WSL...");
        const nmapRes = await run(nmapCmd);
        console.log("✅ Nmap finished.");

        // Save simple JSON summary (parse minimal from stdout)
        const raw = nmapRes.stdout || "";
        function parseSimple(raw) {
            const lines = raw.split("\\n");
            const res = { timestamp: new Date().toISOString(), target, open_ports: [], closed_ports: [], filtered_ports_count: null, scan_duration_seconds: null };
            for (let line of lines) {
                line = line.trim();
                if (line.match(/^\\d+\\/tcp/)) {
                    const parts = line.split(/\\s+/);
                    res.open_ports.push({ port: parseInt(parts[0]), state: parts[1], service: parts[2] || null, version: parts.slice(3).join(" ") || null });
                }
                if (line.startsWith("Not shown:")) {
                    const m = line.match(/(\\d+) filtered/);
                    if (m) res.filtered_ports_count = Number(m[1]);
                }
                if (line.startsWith("Nmap done:")) {
                    const m = line.match(/scanned in (.*) seconds/);
                    if (m) res.scan_duration_seconds = Number(m[1]);
                }
            }
            return res;
        }
        const summary = parseSimple(raw);
        const winJsonPath = path.join(winReports, "nmap_summary.json");
        fs.writeFileSync(winJsonPath, JSON.stringify(summary, null, 4));
        console.log("💾 Nmap JSON summary saved to", winJsonPath);

        // Copy XML from WSL to Windows
        console.log("📄 Copying nmap.xml from WSL to Windows...");
        const catXml = await run("wsl cat ~/nmap.xml");
        const xmlPath = path.join(winReports, "nmap.xml");
        fs.writeFileSync(xmlPath, catXml.stdout || "");
        console.log("💾 nmap.xml saved to", xmlPath);

        // 2) Run nuclei using the WSL nmap.xml
        console.log("⚡ Running Nuclei (using nmap.xml)...");
        await run(`wsl nuclei -nmap ~/nmap.xml -o ~/nuclei.txt`).catch(e => {
            // ignore subtle errors but log
            console.warn("⚠ nuclei returned non-zero or warning:", e.stderr || e.err);
        });
        const nucleiTxt = await run("wsl cat ~/nuclei.txt").catch(() => ({ stdout: "" }));
        fs.writeFileSync(path.join(winReports, "nuclei.txt"), nucleiTxt.stdout || "");
        console.log("🟢 Nuclei results saved ->", path.join(winReports, "nuclei.txt"));

        // 3) Run nikto (web scan) and save HTML report
        console.log("🔵 Running Nikto (HTTPS)...");
        await run(`wsl nikto -h https://${target} -o ~/nikto.html -Format html`).catch(e => {
            console.warn("⚠ nikto returned warning/error:", e.stderr || e.err);
        });
        const niktoOut = await run("wsl cat ~/nikto.html").catch(() => ({ stdout: "" }));
        fs.writeFileSync(path.join(winReports, "nikto.html"), niktoOut.stdout || "");
        console.log("🔵 Nikto report saved ->", path.join(winReports, "nikto.html"));

        console.log("🎯 Full workflow finished. Check the folder:", winReports);
    } catch (e) {
        console.error("❌ Scan failed:", e.err ? e.err.message : e);
    }
})();
