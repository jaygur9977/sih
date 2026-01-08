const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// Target domain
const target = "oriental.ac.in";

// Output folder on Windows
const outputDir = "C:\\full\\backend\\reports";

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const jsonFile = path.join(outputDir, "nmap.json");
const xmlFile = path.join(outputDir, "nmap.xml");

// ----------------------------
// Parse Nmap Output → JSON
// ----------------------------
function parseNmapOutput(raw) {
    const lines = raw.split("\n");

    const result = {
        timestamp: new Date().toISOString(),
        target,
        open_ports: [],
        closed_ports: [],
        filtered_ports: null
    };

    for (let line of lines) {
        line = line.trim();

        if (line.match(/^\d+\/tcp/)) {
            const parts = line.split(/\s+/);

            const entry = {
                port: parseInt(parts[0]),
                state: parts[1],
                service: parts[2] || null,
                version: parts.slice(3).join(" ")
            };

            if (entry.state === "open") result.open_ports.push(entry);
            else if (entry.state === "closed") result.closed_ports.push(entry);
        }

        if (line.startsWith("Not shown:")) {
            const m = line.match(/(\d+)/);
            if (m) result.filtered_ports = Number(m[1]);
        }
    }

    return result;
}

// ----------------------------
// Run Nmap in WSL
// ----------------------------
console.log("🚀 Running Nmap...");

const nmapCmd = `wsl nmap -sV ${target} -oX ~/nmap.xml`;

exec(nmapCmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
    if (err) return console.log("❌ Error:", err);

    console.log("✅ Nmap Completed!");

    // Save JSON
    const json = parseNmapOutput(stdout);
    fs.writeFileSync(jsonFile, JSON.stringify(json, null, 4));
    console.log("💾 Saved JSON:", jsonFile);

    // Copy XML from WSL → Windows
    exec("wsl cat ~/nmap.xml", (xmlErr, xmlData) => {
        if (!xmlErr) fs.writeFileSync(xmlFile, xmlData);
        console.log("💾 Saved XML:", xmlFile);

        // ----------------------------
        // Run Nuclei
        // ----------------------------
        console.log("⚡ Running Nuclei...");

        const nucleiCmd = `wsl nuclei -nmap ~/nmap.xml -o ~/nuclei.txt`;
        exec(nucleiCmd, () => {
            exec("wsl cat ~/nuclei.txt", (e, nucleiOut) => {
                fs.writeFileSync(path.join(outputDir, "nuclei.txt"), nucleiOut);
                console.log("🟢 Nuclei Report Saved!");
            });
        });

        // ----------------------------
        // Run Nikto (HTTPS)
        // ----------------------------
        console.log("🔵 Running Nikto...");

        const niktoCmd = `wsl nikto -h https://${target} -o ~/nikto.html -Format html`;
        exec(niktoCmd, () => {
            exec("wsl cat ~/nikto.html", (e, niktoOut) => {
                fs.writeFileSync(path.join(outputDir, "nikto.html"), niktoOut);
                console.log("🔵 Nikto Report Saved!");
            });
        });
    });
});
