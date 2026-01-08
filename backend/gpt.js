// const fs = require("fs");
// const path = require("path");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// // ---- API KEY ----
// const API_KEY = "AIzaSyDtnSClNT_l9rPatLp8iuW1wvmp-rnLbrw";
// if (!API_KEY) {
//   console.error("❌ Please set your API key: set GEMINI_API_KEY=your_key");
//   process.exit(1);
// }

// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
// });

// // ---- Your file names here ----
// const filesToLoad = ["full_security_report.json"]; // change to your file names

// async function analyzeFiles() {
//   try {
//     let combinedText = "";

//     for (const file of filesToLoad) {
//       const filePath = path.join(process.cwd(), file);

//       if (!fs.existsSync(filePath)) {
//         console.error(`❌ File not found: ${file}`);
//         process.exit(1);
//       }

//       const content = fs.readFileSync(filePath, "utf8");

//       combinedText += `\n\n===== FILE: ${file} =====\n${content}`;
//     }

//     console.log("🚀 Sending data to Gemini...\n");

//     const result = await model.generateContent([
//       {
//         text:
//           "Analyze these scan outputs (Nmap, Nuclei, Nikto). Summarize vulnerabilities, technologies, risks clearly.\n" +
//           combinedText,
//       },
//     ]);

//     console.log("\n======== AI OUTPUT ========\n");
//     console.log(result.response.text());
//   } catch (err) {
//     console.error("❌ Error:", err);
//   }
// }

// analyzeFiles();











// const fs = require("fs");
// const path = require("path");
// const readline = require("readline");
// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const API_KEY = "AIzaSyDtnSClNT_l9rPatLp8iuW1wvmp-rnLbrw";
// if (!API_KEY) {
//   console.error("❌ Please set GEMINI_API_KEY key.");
//   process.exit(1);
// }

// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
// });

// const reportFiles = [
//   "full_security_report.json",
//   "output.json",
//   // Add more: "extra_nmap.json", "nikto.json"
// ];

// function loadReport() {
//   const filePath = path.join(process.cwd(), reportFile);

//   if (!fs.existsSync(filePath)) {
//     console.error(`❌ File not found: ${reportFile}`);
//     process.exit(1);
//   }

//   return fs.readFileSync(filePath, "utf8");
// }

// let analyzedSummary = ""; // memory for queries

// async function initializeReport() {
//   console.log("📄 Loading Report...");

//   const reportText = loadReport();

//   console.log("🤖 Analyzing report with Gemini...");

//   const result = await model.generateContent([
//     {
//       text: `
// Summarize the following scan data into a structured format that will be used later
// for Q&A. Extract ONLY facts from the report. Do NOT add anything extra.

// Report:
// ${reportText}
//       `,
//     },
//   ]);

//   analyzedSummary = result.response.text();

//   console.log("\n✅ Report analyzed and stored internally!\n");
//   console.log("👉 Now you can ask questions like:");
//   console.log("- What vulnerabilities exist?")
//   console.log("- What risks are high?")
//   console.log("- Which software versions are outdated?")
//   console.log("- What are the attack vectors?")
//   console.log("- Suggest remediation steps\n")
// }

// // ---- Query handler ----
// async function answerQuery(query) {
//   const result = await model.generateContent([
//     {
//       text: `
// You are answering questions ONLY using this report summary:

// ${analyzedSummary}

// User question: ${query}

// If the answer is not present in the summary, say: "Not found in report."
//       `,
//     },
//   ]);

//   console.log("\n📌 Answer:");
//   console.log(result.response.text());
// }

// // ---- CLI prompt ----
// async function startInteractiveMode() {
//   await initializeReport();

//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   const ask = () => {
//     rl.question("\n❓ Ask a question about the report: ", async (query) => {
//       if (query.toLowerCase() === "exit") {
//         console.log("👋 Exiting");
//         rl.close();
//         return;
//       }

//       await answerQuery(query);

//       ask();
//     });
//   };

//   ask();
// }

// startInteractiveMode();






const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const API_KEY = "AIzaSyDtnSClNT_l9rPatLp8iuW1wvmp-rnLbrw";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Store analyzed reports in memory (in production, use a database)
let analyzedReports = {};

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { query, reportData } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    if (!reportData) {
      return res.json({ 
        answer: "No scan data available. Please run a scan first to get security results that I can analyze." 
      });
    }

    // Convert report data to string for analysis
    const reportText = JSON.stringify(reportData, null, 2);

    // Generate response using Gemini
    const result = await model.generateContent([
      {
        text: `
You are a security expert analyzing scan reports. Use ONLY the following report data to answer questions.
If something is not in the report, say "Not found in the scan report."

SCAN REPORT:
${reportText}

USER QUESTION: ${query}

Provide a clear, structured response focusing on:
1. Direct findings from the report
2. Severity levels of issues found
3. Specific recommendations if applicable
4. Technical details when relevant

Format your response in a clear, readable way. Use bullet points for lists.
`
      },
    ]);

    const answer = result.response.text();

    res.json({ answer });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      answer: "Sorry, I encountered an error while processing your request. Please try again." 
    });
  }
});

module.exports = router;