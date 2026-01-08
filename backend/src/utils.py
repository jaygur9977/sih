import json

def load_json(file_path):
    """Load JSON file"""
    with open(file_path, 'r') as f:
        return json.load(f)

def flatten_hosts(json_data):
    """
    Flatten hosts data into chunks for semantic search
    """
    chunks = []
    for host in json_data.get("hosts", []):
        info = f"Host: {host.get('hostname')} ({host.get('ip')})\nOpen Ports: {', '.join(host.get('open_ports', []))}"
        chunks.append(info)

        # Applications
        for app in host.get("applications", []):
            chunks.append(f"Application: {app['name']} Versions: {', '.join(app.get('version', []))}")

        # Vulnerabilities
        for vuln in host.get("vulnerabilities", {}).get("details", []):
            chunks.append(f"Vulnerability: {vuln['name']} (Threat: {vuln['threat']}, Port: {vuln['port']})\nDescription: {vuln['description']}\nSolution: {vuln['solution']}")

        # TLS Certificates
        for cert in host.get("tls_certificates", []):
            chunks.append(f"Certificate Subject: {cert['subject']} Issuer: {cert['issuer']} Valid From: {cert['valid_from']} Valid To: {cert['valid_to']}")
    return chunks

def format_answer(raw_text):
    """Format text for better readability"""
    lines = raw_text.split("\n")
    formatted = ""
    for line in lines:
        if line.strip():
            formatted += "• " + line.strip() + "\n"
    return formatted