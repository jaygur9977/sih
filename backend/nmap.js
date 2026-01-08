// const { exec } = require("child_process");
// const fs = require("fs");
// const path = require("path");

// // ⛔ यह path WSL में scan.js का है → इसे अपने हिसाब से update करें!
// const wslPath = "/home/navne/scan.js";

// // Windows output file path
// const outputPath = "C:\\full\\backend\\nmapscaning.json";

// // Command: WSL के अंदर scan.js run करना
// const command = `wsl node ${wslPath}`;

// console.log("🚀 Triggering WSL Nmap Scan...\n");

// exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
//     if (error) {
//         console.error("❌ Error:", error.message);
//         return;
//     }

//     if (stderr) {
//         console.error("⚠️ stderr:", stderr);
//     }

//     console.log("✅ Scan Finished (From WSL)");
//     console.log("📄 Output received. Saving JSON file...\n");

//     // JSON structure
//     const result = {
//         timestamp: new Date().toISOString(),
//         target: "oriental.ac.in",
//         raw_output: stdout
//     };

//     // Ensure Windows directory exists
//     const dir = path.dirname(outputPath);
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }

//     // Save JSON file
//     fs.writeFileSync(outputPath, JSON.stringify(result, null, 4));

//     console.log(`💾 Saved: ${outputPath}`);
// });




const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

// ⭐ Target from CLI
const target = process.argv[2];

if (!target) {
    console.log("❌ Please provide a target");
    console.log("👉 Usage: node win-trigger.js <domain>");
    process.exit(1);
}

// ⭐ Path to WSL scan.js
const wslPath = "/home/navne/scan.js";

// ⭐ Output file path (Windows)
const outputPath = "C:\\full\\backend\\nmapscaning.json";

// ⭐ Command: WSL → run scan.js with target
const command = `wsl node ${wslPath} ${target}`;

console.log(`🚀 Triggering WSL Nmap Scan for ${target}...\n`);

exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
    if (error) {
        console.error("❌ Error:", error.message);
        return;
    }

    if (stderr && stderr.trim() !== "") {
        console.error("⚠️ stderr:", stderr);
    }

    console.log("✅ Scan Finished (From WSL)");
    console.log("📄 Output received. Saving JSON file...\n");

    // ⭐ JSON structure
    const result = {
        timestamp: new Date().toISOString(),
        target: target,
        raw_output: stdout
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
