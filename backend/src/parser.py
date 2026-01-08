import json
from pathlib import Path

def load_json(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data

def flatten_scan_data(json_data):
    """
    Converts nested JSON into retrievable text chunks
    """
    chunks = []

    # Scan summary
    summary = json_data.get("scan_summary", {})
    chunks.append(f"Scan ID: {summary.get('scan_id')}, "
                  f"Start: {summary.get('scan_start')}, "
                  f"End: {summary.get('scan_end')}, "
                  f"Targets: {', '.join([t.get('hostname') for t in summary.get('targets', [])])}, "
                  f"Duration: {summary.get('scan_duration_minutes')} minutes")

    # Hosts info
    for host in json_data.get("hosts", []):
        host_info = f"Host {host['hostname']} ({host['ip']}), Open Ports: {', '.join(host.get('open_ports', []))}"
        chunks.append(host_info)
        for app in host.get("applications", []):
            chunks.append(f"Application: {app['name']}, Version: {', '.join(app.get('version', []))}, CPE: {app.get('cpe')}")
        for vuln in host.get("vulnerabilities", {}).get("details", []):
            vuln_text = (f"Vulnerability: {vuln['name']} (Severity: {vuln['severity']}, Threat: {vuln['threat']}), "
                         f"Port: {vuln.get('port')}, Description: {vuln.get('description')}, "
                         f"Solution: {vuln.get('solution')}")
            chunks.append(vuln_text)

    return chunks