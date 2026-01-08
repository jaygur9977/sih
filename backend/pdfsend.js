const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function sendPDF() {
    const pdfPath = "C:/full/backend/1.pdf";

    const form = new FormData();
    form.append("file", fs.createReadStream(pdfPath));

    const webhookUrl = "http://10.11.83.69:5678/webhook/c6e013bd-2091-4eec-968c-54bf7a0e32af";

    try {
        const response = await axios.post(webhookUrl, form, {
            headers: form.getHeaders(),
        });

        console.log("PDF Sent Successfully");
        console.log(response.data);

    } catch (err) {
        console.error("Error:", err.message);
    }
}

sendPDF();