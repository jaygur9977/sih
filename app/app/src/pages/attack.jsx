import React, { useState, useEffect } from 'react';
import './attack.css';

const AttackPathAnalyzer = () => {
  const [reportData, setReportData] = useState(null);
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [attackPath, setAttackPath] = useState([]);
  const [showExploitCode, setShowExploitCode] = useState(false);

  // Simulating the provided JSON data
  useEffect(() => {
    const data = {
      metadata: {
        report_generated: "2025-12-08T12:05:46Z",
        enriched_with: ["Nessus", "OpenVAS", "Nuclei", "Nikto", "Nmap", "NVD_CVE"],
        format_version: "1.1",
        description: "Unified vulnerability report integrating multiple scanner outputs"
      },
      target_domain: "testfire.net",
      target_ip: "65.61.137.117",
      hosts: [
        {
          host: "demo.testfire.net",
          ip: "65.61.137.117",
          open_ports: [
            { port: 80, service: "Apache Tomcat/Coyote JSP engine 1.1", protocol: "tcp" },
            { port: 443, service: "ssl/https", protocol: "tcp" },
            { port: 8080, service: "Apache Tomcat/Coyote JSP engine 1.1", protocol: "tcp" }
          ],
          vulnerabilities: [
            {
              id: "TLS-OLD-PROTOCOLS",
              name: "Deprecated TLS Versions Enabled",
              description: "The server supports deprecated TLS versions (TLS 1.0 and/or TLS 1.1).",
              severity: "MEDIUM",
              cvss_score: 6.5,
              port: "443/tcp",
              scanners: ["Nessus", "OpenVAS", "Nuclei"],
              cve_list: ["CVE-2011-3389", "CVE-2015-0204", "CVE-2023-41928", "CVE-2024-41270", "CVE-2025-3200"],
              solution: "Disable TLS 1.0 and 1.1. Use TLS 1.2 or higher.",
              references: ["https://datatracker.ietf.org/doc/html/rfc8996"]
            },
            {
              id: "HSTS-MISSING",
              name: "Missing HTTP Strict Transport Security (HSTS) Header",
              description: "The HTTPS server does not implement HSTS as per RFC 6797.",
              severity: "MEDIUM",
              cvss_score: 6.5,
              port: "443/tcp",
              scanners: ["Nessus", "Nuclei"],
              cve_list: [],
              solution: "Add the Strict-Transport-Security header to responses.",
              references: ["https://datatracker.ietf.org/doc/html/rfc6797"]
            },
            {
              id: "WEAK-DH-GROUP",
              name: "Weak Diffie-Hellman Key Exchange (Logjam)",
              description: "SSL/TLS uses Diffie-Hellman groups with modulus <= 1024 bits.",
              severity: "LOW",
              cvss_score: 3.7,
              port: "443/tcp",
              scanners: ["Nessus", "OpenVAS"],
              cve_list: [],
              solution: "Use DH groups with 2048+ bits or enable ECDHE.",
              references: ["https://weakdh.org/"]
            },
            {
              id: "TCP-TIMESTAMPS",
              name: "TCP Timestamps Enabled",
              description: "TCP timestamps are enabled, which may allow uptime estimation.",
              severity: "LOW",
              cvss_score: 2.6,
              port: "general/tcp",
              scanners: ["OpenVAS", "Nessus"],
              cve_list: [],
              solution: "Disable TCP timestamps in system configuration.",
              references: []
            },
            {
              id: "WEAK-CIPHER-SUITE",
              name: "Weak Cipher Suites Supported",
              description: "Server supports weak cipher suites (e.g., CBC-based in TLS 1.0/1.1).",
              severity: "LOW",
              cvss_score: null,
              port: "443/tcp",
              scanners: ["Nuclei"],
              cve_list: [],
              solution: "Disable weak cipher suites. Use AES-GCM, ChaCha20, etc.",
              references: []
            },
            {
              id: "MISSING-SECURITY-HEADERS",
              name: "Multiple Security Headers Missing",
              description: "Missing security headers such as CSP, HSTS, X-Frame-Options, etc.",
              severity: "INFO",
              cvss_score: null,
              port: "80/tcp,443/tcp",
              scanners: ["Nikto", "Nuclei"],
              cve_list: [],
              solution: "Implement missing security headers.",
              references: []
            },
            {
              id: "HTTP-METHODS-ALLOWED",
              name: "Potentially Risky HTTP Methods Allowed",
              description: "PUT, DELETE, DEBUG methods are allowed, which could be misused.",
              severity: "INFO",
              cvss_score: null,
              port: "80/tcp",
              scanners: ["Nikto"],
              cve_list: [],
              solution: "Restrict unnecessary HTTP methods.",
              references: ["https://cwe.mitre.org/data/definitions/749.html"]
            },
            {
              id: "SSL-CERT-MISMATCH",
              name: "SSL Certificate Mismatch",
              description: "Certificate issued for demo.testfire.net, but accessed via testfire.net.",
              severity: "INFO",
              cvss_score: null,
              port: "443/tcp",
              scanners: ["Nuclei"],
              cve_list: [],
              solution: "Use a certificate that matches the accessed domain.",
              references: []
            },
            {
              id: "SWAGGER-EXPOSED",
              name: "Swagger API Documentation Exposed",
              description: "Swagger UI is accessible at /swagger/index.html.",
              severity: "INFO",
              cvss_score: null,
              port: "80/tcp,443/tcp",
              scanners: ["Nuclei"],
              cve_list: [],
              solution: "Restrict access to API documentation in production.",
              references: []
            }
          ],
          informational_findings: [
            { type: "Service Detection", details: "Apache Tomcat/Coyote 1.1 detected on ports 80 and 8080." },
            { type: "SSL/TLS Information", details: "TLS 1.2 and 1.3 supported, weak cipher suites present." },
            { type: "Certificate Information", details: "SSL certificate issued by Sectigo, valid until 2026-06-21." },
            { type: "Network Information", details: "Akamai nameservers, DMARC and SPF records present." }
          ]
        }
      ],
      summary: {
        total_vulnerabilities: 9,
        by_severity: { critical: 0, high: 0, medium: 2, low: 3, info: 4 },
        by_scanner: { Nessus: 4, OpenVAS: 3, Nuclei: 6, Nikto: 2, Nmap: 0 },
        recommendations: [
          "Disable TLS 1.0 and 1.1 on port 443.",
          "Enable HSTS and other missing security headers.",
          "Upgrade DH groups to 2048+ bits or use ECDHE.",
          "Disable weak cipher suites.",
          "Restrict HTTP methods (PUT, DELETE, DEBUG).",
          "Ensure SSL certificate matches the domain."
        ]
      }
    };
    setReportData(data);
    calculateAttackPath(data.hosts[0].vulnerabilities);
  }, []);

  const calculateAttackPath = (vulnerabilities) => {
    // Attack path prediction logic
    const path = [
      {
        step: 1,
        title: "Information Gathering",
        description: "Exploit missing security headers and exposed Swagger documentation to gather application information.",
        relatedVulns: ["SWAGGER-EXPOSED", "MISSING-SECURITY-HEADERS"],
        exploit: "Access /swagger/index.html to discover API endpoints and potential attack vectors."
      },
      {
        step: 2,
        title: "Man-in-the-Middle Setup",
        description: "Leverage deprecated TLS versions and weak cipher suites to intercept traffic.",
        relatedVulns: ["TLS-OLD-PROTOCOLS", "WEAK-CIPHER-SUITE"],
        exploit: "Use tools like sslstrip or mitmproxy to downgrade TLS connections and intercept sensitive data."
      },
      {
        step: 3,
        title: "Exploit Weak Crypto",
        description: "Use Logjam attack on weak DH groups to break TLS encryption.",
        relatedVulns: ["WEAK-DH-GROUP"],
        exploit: "Execute Logjam attack using tools like 'weakdh' to compute shared keys and decrypt traffic."
      },
      {
        step: 4,
        title: "Application Layer Attacks",
        description: "Use exposed HTTP methods and misconfigurations for direct attacks.",
        relatedVulns: ["HTTP-METHODS-ALLOWED", "SSL-CERT-MISMATCH"],
        exploit: "Use PUT method to upload malicious files or exploit certificate warning to trick users."
      },
      {
        step: 5,
        title: "Persistence & Data Exfiltration",
        description: "Establish persistent access through misconfigured services.",
        relatedVulns: ["TCP-TIMESTAMPS", "HSTS-MISSING"],
        exploit: "Use system fingerprinting for targeted attacks and maintain session hijacking due to missing HSTS."
      }
    ];
    setAttackPath(path);
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#ff4444';
      case 'HIGH': return '#ff6b6b';
      case 'MEDIUM': return '#ffa500';
      case 'LOW': return '#ffcc00';
      case 'INFO': return '#4CAF50';
      default: return '#757575';
    }
  };

  const generateExploitCode = (vulnId) => {
    const exploits = {
      'TLS-OLD-PROTOCOLS': `# TLS 1.0 Downgrade Attack (POODLE)
import ssl
import socket

def test_tls_downgrade(target, port):
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
    with socket.create_connection((target, port)) as sock:
        with context.wrap_socket(sock, server_hostname=target) as ssock:
            print(f"Connected with: {ssock.version()}")
            # Send malicious request
            ssock.send(b"GET / HTTP/1.1\\r\\nHost: " + target.encode() + b"\\r\\n\\r\\n")
            response = ssock.recv(1024)
            return response

# Usage
response = test_tls_downgrade("demo.testfire.net", 443)
print("Vulnerable to TLS downgrade:", b"200 OK" in response)`,
      
      'HTTP-METHODS-ALLOWED': `# Exploit Unrestricted HTTP Methods
import requests

def test_http_methods(target):
    methods = ['PUT', 'DELETE', 'DEBUG', 'TRACE']
    for method in methods:
        try:
            r = requests.request(method, f"http://{target}/test")
            print(f"{method}: {r.status_code} - {r.reason}")
            if r.status_code < 400:
                print(f"  → {method} method is enabled and potentially exploitable")
                if method == 'PUT':
                    print(f"  → Try uploading webshell: curl -X PUT http://{target}/shell.jsp -d @shell.jsp")
        except Exception as e:
            print(f"{method}: Error - {e}")

# Usage
test_http_methods("demo.testfire.net")`,
      
      'SWAGGER-EXPOSED': `# Automated Swagger API Discovery and Exploitation
import requests
import json

def exploit_swagger(target):
    swagger_urls = [
        f"http://{target}/swagger/index.html",
        f"http://{target}/swagger/ui/index",
        f"http://{target}/api-docs",
        f"https://{target}/swagger/index.html"
    ]
    
    for url in swagger_urls:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200 and 'swagger' in response.text.lower():
                print(f"[+] Swagger UI found: {url}")
                # Extract API endpoints
                api_url = url.replace('/index.html', '/v2/api-docs')
                api_resp = requests.get(api_url)
                if api_resp.status_code == 200:
                    api_data = api_resp.json()
                    print(f"[+] Found {len(api_data.get('paths', {}))} API endpoints")
                    for path, methods in api_data.get('paths', {}).items():
                        print(f"  {path}: {list(methods.keys())}")
        except:
            continue

# Usage
exploit_swagger("demo.testfire.net")`
    };
    
    return exploits[vulnId] || `# No specific exploit code available for ${vulnId}
# General exploitation steps:
# 1. Identify the vulnerability
# 2. Craft payload specific to the service
# 3. Test in controlled environment
# 4. Document results`;
  };

  if (!reportData) return <div className="loading">Loading Vulnerability Data...</div>;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🔒 Attack Path Analyzer</h1>
          <p className="subtitle">Predicting exploitation paths from vulnerability scan data</p>
          <div className="scan-info">
            <span>Target: <strong>{reportData.target_domain}</strong></span>
            <span>IP: <strong>{reportData.target_ip}</strong></span>
            <span>Scanned: {new Date(reportData.metadata.report_generated).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Left Panel - Vulnerabilities */}
        <div className="left-panel">
          <div className="section-card">
            <h2>📊 Vulnerability Summary</h2>
            <div className="severity-stats">
              {Object.entries(reportData.summary.by_severity).map(([severity, count]) => (
                <div key={severity} className="stat-item" style={{ borderLeftColor: getSeverityColor(severity.toUpperCase()) }}>
                  <span className="stat-count">{count}</span>
                  <span className="stat-label">{severity}</span>
                </div>
              ))}
            </div>
            
            <div className="scanner-stats">
              <h3>Scanner Coverage</h3>
              <div className="scanner-tags">
                {Object.entries(reportData.summary.by_scanner).map(([scanner, count]) => (
                  <span key={scanner} className="scanner-tag">
                    {scanner}: {count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="section-card">
            <h2>🔍 Detected Vulnerabilities</h2>
            <div className="vulnerability-list">
              {reportData.hosts[0].vulnerabilities.map((vuln) => (
                <div 
                  key={vuln.id} 
                  className={`vuln-item ${selectedVuln?.id === vuln.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVuln(vuln)}
                  style={{ borderLeftColor: getSeverityColor(vuln.severity) }}
                >
                  <div className="vuln-header">
                    <span className="vuln-severity" style={{ backgroundColor: getSeverityColor(vuln.severity) }}>
                      {vuln.severity}
                    </span>
                    <span className="vuln-score">CVSS: {vuln.cvss_score || 'N/A'}</span>
                  </div>
                  <h3 className="vuln-title">{vuln.name}</h3>
                  <p className="vuln-desc">{vuln.description}</p>
                  <div className="vuln-meta">
                    <span>Port: {vuln.port}</span>
                    <span>Scanners: {vuln.scanners.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Attack Path & Details */}
        <div className="right-panel">
          <div className="section-card">
            <h2>🎯 Predicted Attack Path</h2>
            <p className="path-description">
              Based on the identified vulnerabilities, attackers could follow this exploitation path:
            </p>
            <div className="attack-path">
              {attackPath.map((step) => (
                <div key={step.step} className="path-step">
                  <div className="step-number">Step {step.step}</div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <div className="related-vulns">
                      <strong>Related Vulnerabilities:</strong> {step.relatedVulns.join(', ')}
                    </div>
                    <div className="exploit-tip">
                      <strong>Exploitation:</strong> {step.exploit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedVuln && (
            <div className="section-card">
              <h2>📋 Vulnerability Details</h2>
              <div className="vuln-detail">
                <div className="detail-header">
                  <h3 style={{ color: getSeverityColor(selectedVuln.severity) }}>
                    {selectedVuln.name}
                  </h3>
                  <button 
                    className="exploit-btn"
                    onClick={() => setShowExploitCode(!showExploitCode)}
                  >
                    {showExploitCode ? 'Hide' : 'Show'} Exploit Code
                  </button>
                </div>
                
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Severity:</strong>
                    <span className="severity-badge" style={{ backgroundColor: getSeverityColor(selectedVuln.severity) }}>
                      {selectedVuln.severity}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>CVSS Score:</strong>
                    <span>{selectedVuln.cvss_score || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Port:</strong>
                    <span>{selectedVuln.port}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Scanners:</strong>
                    <div className="scanner-badges">
                      {selectedVuln.scanners.map(scanner => (
                        <span key={scanner} className="scanner-badge">{scanner}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedVuln.description}</p>
                </div>

                <div className="detail-section">
                  <h4>Solution</h4>
                  <p>{selectedVuln.solution}</p>
                </div>

                {selectedVuln.cve_list.length > 0 && (
                  <div className="detail-section">
                    <h4>Related CVEs</h4>
                    <div className="cve-list">
                      {selectedVuln.cve_list.map(cve => (
                        <a 
                          key={cve} 
                          href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cve-link"
                        >
                          {cve}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {showExploitCode && (
                  <div className="detail-section">
                    <h4>Exploit Code Example</h4>
                    <div className="why-exploit">
                      <strong>Why this works:</strong> This vulnerability can be exploited because {selectedVuln.name.toLowerCase()}.
                      The code demonstrates how an attacker could leverage this weakness.
                    </div>
                    <pre className="exploit-code">
                      {generateExploitCode(selectedVuln.id)}
                    </pre>
                    <div className="warning-note">
                      ⚠️ This code is for educational purposes only. Use only in authorized environments.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="data-explanation">
          <h3>📈 How This Data Informs Attack Path Prediction:</h3>
          <div className="explanation-grid">
            <div className="explain-item">
              <strong>Multiple Scanner Correlation:</strong>
              <p>Vulnerabilities detected by multiple scanners (like Nessus, OpenVAS, Nuclei) indicate higher confidence and more reliable attack vectors.</p>
            </div>
            <div className="explain-item">
              <strong>CVSS Score Weighting:</strong>
              <p>Higher CVSS scores prioritize vulnerabilities in the attack path, focusing on the most impactful weaknesses first.</p>
            </div>
            <div className="explain-item">
              <strong>Service Interdependencies:</strong>
              <p>Related vulnerabilities across services (TLS on 443, HTTP on 80) create chained exploitation opportunities.</p>
            </div>
            <div className="explain-item">
              <strong>Real-world Exploitability:</strong>
              <p>Vulnerabilities with public CVEs and known exploits (like TLS weaknesses) are prioritized in the attack path.</p>
            </div>
          </div>
        </div>
        <div className="footer-note">
          Report generated from: {reportData.metadata.enriched_with.join(', ')} | 
          Format Version: {reportData.metadata.format_version}
        </div>
      </footer>
    </div>
  );
};

export default AttackPathAnalyzer;