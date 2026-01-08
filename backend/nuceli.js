const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// ⭐ Target from CLI
const target = process.argv[2];

if (!target) {
    console.log("❌ Please provide a target");
    console.log("👉 Usage: node windows_nuclei_trigger.js <domain>");
    process.exit(1);
}

// ⭐ Path to WSL script
const wslScript = "/home/navne/nuclei_scan.js";

// ⭐ Output path in Windows
const outputPath = "C:\\full\\backend\\nuclei_scan_output.json";

// ⭐ WSL Command
const command = `wsl node "${wslScript}" "${target}"`;

console.log(`🚀 Triggering WSL Nuclei Scan for: ${target}\n`);

exec(command, { maxBuffer: 1024 * 1024 * 500 }, (error, stdout, stderr) => {
    if (error) {
        console.error("❌ Error:", error.message);
        return;
    }

    if (stderr && stderr.trim() !== "") {
        console.warn("⚠️ WSL Warning:", stderr);
    }

    console.log("✅ Scan Finished (From WSL)");
    console.log("📄 Output received. Saving JSON...\n");

    // ⭐ Prepare JSON object
    const result = {
        timestamp: new Date().toISOString(),
        target: target,
        nuclei_output: stdout
    };

    // ⭐ Ensure Windows directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // ⭐ Save output JSON
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 4));

    console.log(`💾 Saved at: ${outputPath}`);
});
