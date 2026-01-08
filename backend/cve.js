const fetch = require("node-fetch");
const csv = require("csvtojson");

async function searchExploit(keyword) {
    const url = "https://raw.githubusercontent.com/offensive-security/exploitdb/master/files_exploits.csv";
    
    const csvData = await fetch(url).then(res => res.text());
    const json = await csv().fromString(csvData);

    const results = json.filter(item =>
        item.description.toLowerCase().includes(keyword.toLowerCase())
    );

    return results;
}

(async () => {
    const keyword = process.argv[2] || "apache tomcat jsp";
    const result = await searchExploit(keyword);

    console.log("\n🔎 RESULTS FOR:", keyword.toUpperCase());
    console.log("=======================================\n");

    result.forEach(r => {
        console.log(`ID: ${r.id}
Description: ${r.description}
Platform: ${r.platform}
Type: ${r.type}
Path: ${r.file}
------------------------------------------------`);
    });
})();
