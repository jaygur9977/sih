const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function sendTest() {
    const form = new FormData();
    form.append("file", fs.createReadStream("./save.json")); // file path correct hona chahiye

    const url = "http://10.11.83.69:5678/webhook/file-upload"; // EXACT path

    try {
        const res = await axios.post(url, form, {
            headers: form.getHeaders(),
        });
        console.log("SUCCESS:", res.data);
    } catch (err) {
        console.error("ERROR:", err.response?.status, err.response?.data || err.message);
    }
}

sendTest();