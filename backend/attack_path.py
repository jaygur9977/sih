import json
import sys

ATTACK_PATTERNS = {
    "tls": [
        "Initial Access → Attacker performs Man-in-the-Middle.",
        "Execution → Forces downgrade to weak TLS.",
        "Privilege Escalation → Obtains sensitive session tokens.",
        "Impact → Confidentiality breach + session hijacking."
    ],
    "dh": [
        "Initial Access → Attacker intercepts TLS handshake.",
        "Execution → Exploits weak DH to derive session keys.",
        "Lateral Movement → Break encrypted communication.",
        "Impact → Data exposure + credential theft."
    ],
    "tcp timestamps": [
        "Reconnaissance → Attacker calculates system uptime.",
        "Scanning → Helps identify reboot cycles + patch cycles.",
        "Exploitation → Plans targeted timing-based attacks.",
        "Impact → Improves precision of later attacks."
    ]
}


def load_json(path):
    with open(path, "r") as f:
        return json.load(f)


def categorize(vuln_name, description):
    text = (vuln_name + " " + description).lower()

    if "tls" in text:
        return "tls"
    if "diffie" in text or "dh" in text:
        return "dh"
    if "timestamp" in text:
        return "tcp timestamps"

    return "generic"


def generate_paths(vuln_list):
    results = []

    for vuln in vuln_list:
        name = vuln.get("name", "Unknown")
        desc = vuln.get("description", "")
        severity = vuln.get("severity", "")
        port = vuln.get("port", "")
        cves = vuln.get("cves", [])

        category = categorize(name, desc)
        pattern = ATTACK_PATTERNS.get(category, [
            "Recon → Attacker scans and identifies weakness",
            "Initial Access → Attempts exploiting misconfiguration",
            "Execution → Gains foothold",
            "Impact → System compromise or info disclosure"
        ])

        results.append({
            "vulnerability_name": name,
            "severity": severity,
            "port": port,
            "cves": cves,
            "attack_category": category,
            "attack_path": pattern
        })

    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python attack_path.py normalized.json")
        return
    
    data = load_json(sys.argv[1])

    all_results = []

    for host in data.get("hosts", []):
        host_ip = host.get("ip")
        vuln_section = host.get("vulnerabilities", {})
        details = vuln_section.get("details", [])

        if isinstance(details, list):
            host_results = generate_paths(details)
            all_results.append({
                "host": host_ip,
                "attack_paths": host_results
            })

    out = "attack_paths_output.json"
    with open(out, "w") as f:
        json.dump(all_results, f, indent=4)

    print("\n[✔] Attack path generated successfully!")
    print(f"[→] Saved as: {out}\n")


if __name__ == "__main__":
    main()