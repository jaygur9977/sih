const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// ⭐ Target from Windows CLI
const target = process.argv[2];

if (!target) {
    console.log("❌ Please provide a target");
    console.log("👉 Usage: node windows_nikto_trigger.js <domain>");
    process.exit(1);
}

// ⭐ WSL path where nikto.js exists
const wslScript = "/home/navne/nikito.js";

// ⭐ Output file (Windows)
const outputPath = "C:\\full\\backend\\nikto_scan_output.json";

// ⭐ Build WSL command
const command = `wsl node "${wslScript}" "${target}"`;

console.log(`🚀 Triggering WSL Nikto Scan for: ${target}\n`);

exec(command, { maxBuffer: 1024 * 1024 * 300 }, (error, stdout, stderr) => {
    if (error) {
        console.error("❌ Error:", error.message);
        return;
    }

    if (stderr && stderr.trim() !== "") {
        console.warn("⚠️ WSL Warning:", stderr);
    }

    console.log("✅ Nikto Scan Finished (via WSL)");
    console.log("📄 Saving results to JSON...\n");

    // ⭐ Create JSON structure
    const result = {
        timestamp: new Date().toISOString(),
        target: target,
        nikto_output: stdout
    };

    // ⭐ Ensure folder exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // ⭐ Save JSON
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 4));

    console.log(`💾 Saved: ${outputPath}`);
});
