// // backend/index.js

// const express = require("express");
// const cors = require("cors");
// const { exec } = require("child_process");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// app.use(cors());

// // SSE endpoint
// app.get("/start-scan", (req, res) => {
//     const target = req.query.target;

//     res.set({
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         "Connection": "keep-alive"
//     });

//     function sendLog(message) {
//         res.write(`data: ${JSON.stringify({ type: "log", message })}\n\n`);
//     }

//     function sendFinal(result) {
//         res.write(`data: ${JSON.stringify({ type: "done", result })}\n\n`);
//     }

//     // Your existing scanning code but with logs streaming:
//     const scripts = {
//         nuclei: "/home/navne/nuclei_scan.js",
//         nmap: "/home/navne/scan.js",
//         nikto: "/home/navne/nikito.js"
//     };

//     async function runCommand(name, script) {
//         return new Promise((resolve) => {
//             sendLog(`▶ Running ${name} scan...`);

//             exec(`wsl node "${script}" "${target}"`,
//                 { maxBuffer: 1024 * 1024 * 500 },
//                 (error, stdout) => {
//                     if (error) {
//                         sendLog(`❌ ${name} Error: ${error.message}`);
//                         return resolve({ error: error.message });
//                     }

//                     sendLog(`✅ ${name} Completed`);
//                     resolve(stdout);
//                 }
//             );
//         });
//     }

//     (async () => {
//         sendLog("⏳ Running all scans...");

//         const nuclei = await runCommand("Nuclei", scripts.nuclei);
//         const nmap = await runCommand("Nmap", scripts.nmap);
//         const nikto = await runCommand("Nikto", scripts.nikto);

//         const finalReport = {
//             target,
//             timestamp: new Date().toISOString(),
//             results: { nuclei, nmap, nikto }
//         };

//         sendFinal(finalReport);
//     })();
// });

// app.listen(5000, () => console.log("Server running on port 5000"));










// backend/index.js

const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

// Utility → convert raw logs into clean arrays
function cleanOutput(raw) {
    if (!raw) return [];

    return raw
        .replace(/\u001b\[[0-9;]*m/g, "")   // remove ANSI colors
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);
}

app.get("/start-scan", (req, res) => {
    const target = req.query.target;

    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    });

    function sendLog(message) {
        res.write(`data: ${JSON.stringify({ type: "log", message })}\n\n`);
    }

    function sendFinal(result) {
        res.write(`data: ${JSON.stringify({ type: "done", result })}\n\n`);
    }

    const scripts = {
        nuclei: "/home/navne/nuclei_scan.js",
        nmap: "/home/navne/scan.js",
        nikto: "/home/navne/nikito.js"
    };

    async function runCommand(name, script) {
        return new Promise((resolve) => {
            sendLog(`▶ Running ${name} scan...`);

            exec(
                `wsl node "${script}" "${target}"`,
                { maxBuffer: 1024 * 1024 * 500 },
                (error, stdout) => {
                    if (error) {
                        sendLog(`❌ ${name} Error: ${error.message}`);
                        return resolve({ error: error.message, raw: "" });
                    }

                    sendLog(`✅ ${name} Completed`);
                    resolve({ raw: stdout });
                }
            );
        });
    }

    (async () => {
        sendLog("⏳ Running all scans...");

        const nuclei = await runCommand("Nuclei", scripts.nuclei);
        const nmap = await runCommand("Nmap", scripts.nmap);
        const nikto = await runCommand("Nikto", scripts.nikto);

        // ---- STRUCTURED FORMAT WITHOUT PARSING ----
        const finalReport = {
            target,
            timestamp: new Date().toISOString(),

            results: {
                nuclei: {
                    raw: nuclei.raw,
                    lines: cleanOutput(nuclei.raw)
                },
                nmap: {
                    raw: nmap.raw,
                    lines: cleanOutput(nmap.raw)
                },
                nikto: {
                    raw: nikto.raw,
                    lines: cleanOutput(nikto.raw)
                }
            }
        };

        sendFinal(finalReport);
    })();
});

app.listen(5000, () => console.log("Server running on port 5000"));
