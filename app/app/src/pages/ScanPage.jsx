import React, { useState, useEffect } from 'react';
import './ScanPage.css';

// Vulnerability data from your JSON with serial numbers
const vulnerabilityData = {
  "metadata": {
    "report_generated": "2025-12-08T12:05:46Z",
    "enriched_with": ["Nessus", "OpenVAS", "Nuclei", "Nikto", "Nmap", "NVD_CVE"],
    "format_version": "1.1"
  },
  "target_domain": "testfire.net",
  "target_ip": "65.61.137.117",
  "hosts": [
    {
      "host": "demo.testfire.net",
      "ip": "65.61.137.117",
      "open_ports": [
        { "port": 80, "service": "Apache Tomcat/Coyote JSP engine 1.1", "protocol": "tcp" },
        { "port": 443, "service": "ssl/https", "protocol": "tcp" },
        { "port": 8080, "service": "Apache Tomcat/Coyote JSP engine 1.1", "protocol": "tcp" }
      ],
      "vulnerabilities": [
        {
          "serial_no": 1,
          "id": "TLS-OLD-PROTOCOLS",
          "name": "Deprecated TLS Versions Enabled",
          "description": "The server supports deprecated TLS versions (TLS 1.0 and/or TLS 1.1).",
          "severity": "MEDIUM",
          "cvss_score": 6.5,
          "port": "443/tcp",
          "scanners": ["Nessus", "OpenVAS", "Nuclei"],
          "cve_list": ["CVE-2011-3389", "CVE-2015-0204", "CVE-2023-41928", "CVE-2024-41270", "CVE-2025-3200"],
          "solution": "Disable TLS 1.0 and 1.1. Use TLS 1.2 or higher.",
          "references": ["https://datatracker.ietf.org/doc/html/rfc8996"]
        },
        {
          "serial_no": 2,
          "id": "HSTS-MISSING",
          "name": "Missing HTTP Strict Transport Security (HSTS) Header",
          "description": "The HTTPS server does not implement HSTS as per RFC 6797.",
          "severity": "MEDIUM",
          "cvss_score": 6.5,
          "port": "443/tcp",
          "scanners": ["Nessus", "Nuclei"],
          "cve_list": [],
          "solution": "Add the Strict-Transport-Security header to responses.",
          "references": ["https://datatracker.ietf.org/doc/html/rfc6797"]
        },
        {
          "serial_no": 3,
          "id": "WEAK-DH-GROUP",
          "name": "Weak Diffie-Hellman Key Exchange (Logjam)",
          "description": "SSL/TLS uses Diffie-Hellman groups with modulus <= 1024 bits.",
          "severity": "LOW",
          "cvss_score": 3.7,
          "port": "443/tcp",
          "scanners": ["Nessus", "OpenVAS"],
          "cve_list": [],
          "solution": "Use DH groups with 2048+ bits or enable ECDHE.",
          "references": ["https://weakdh.org/"]
        },
        {
          "serial_no": 4,
          "id": "TCP-TIMESTAMPS",
          "name": "TCP Timestamps Enabled",
          "description": "TCP timestamps are enabled, which may allow uptime estimation.",
          "severity": "LOW",
          "cvss_score": 2.6,
          "port": "general/tcp",
          "scanners": ["OpenVAS", "Nessus"],
          "cve_list": [],
          "solution": "Disable TCP timestamps in system configuration.",
          "references": []
        },
        {
          "serial_no": 5,
          "id": "WEAK-CIPHER-SUITE",
          "name": "Weak Cipher Suites Supported",
          "description": "Server supports weak cipher suites (e.g., CBC-based in TLS 1.0/1.1).",
          "severity": "LOW",
          "cvss_score": null,
          "port": "443/tcp",
          "scanners": ["Nuclei"],
          "cve_list": [],
          "solution": "Disable weak cipher suites. Use AES-GCM, ChaCha20, etc.",
          "references": []
        },
        {
          "serial_no": 6,
          "id": "MISSING-SECURITY-HEADERS",
          "name": "Multiple Security Headers Missing",
          "description": "Missing security headers such as CSP, HSTS, X-Frame-Options, etc.",
          "severity": "INFO",
          "cvss_score": null,
          "port": "80/tcp,443/tcp",
          "scanners": ["Nikto", "Nuclei"],
          "cve_list": [],
          "solution": "Implement missing security headers.",
          "references": []
        },
        {
          "serial_no": 7,
          "id": "HTTP-METHODS-ALLOWED",
          "name": "Potentially Risky HTTP Methods Allowed",
          "description": "PUT, DELETE, DEBUG methods are allowed, which could be misused.",
          "severity": "INFO",
          "cvss_score": null,
          "port": "80/tcp",
          "scanners": ["Nikto"],
          "cve_list": [],
          "solution": "Restrict unnecessary HTTP methods.",
          "references": ["https://cwe.mitre.org/data/definitions/749.html"]
        },
        {
          "serial_no": 8,
          "id": "SSL-CERT-MISMATCH",
          "name": "SSL Certificate Mismatch",
          "description": "Certificate issued for demo.testfire.net, but accessed via testfire.net.",
          "severity": "INFO",
          "cvss_score": null,
          "port": "443/tcp",
          "scanners": ["Nuclei"],
          "cve_list": [],
          "solution": "Use a certificate that matches the accessed domain.",
          "references": []
        },
        {
          "serial_no": 9,
          "id": "SWAGGER-EXPOSED",
          "name": "Swagger API Documentation Exposed",
          "description": "Swagger UI is accessible at /swagger/index.html.",
          "severity": "INFO",
          "cvss_score": null,
          "port": "80/tcp,443/tcp",
          "scanners": ["Nuclei"],
          "cve_list": [],
          "solution": "Restrict access to API documentation in production.",
          "references": []
        }
      ]
    }
  ],
  "summary": {
    "total_vulnerabilities": 9,
    "by_severity": { "critical": 0, "high": 0, "medium": 2, "low": 3, "info": 4 },
    "by_scanner": { "Nessus": 4, "OpenVAS": 3, "Nuclei": 6, "Nikto": 2, "Nmap": 0 }
  }
};

// CVSS Score color mapping
const getCVSSColor = (score) => {
  if (!score) return '#6c757d';
  if (score >= 7.0) return '#dc3545'; // Red for high
  if (score >= 4.0) return '#fd7e14'; // Orange for medium
  if (score >= 0.1) return '#ffc107'; // Yellow for low
  return '#6c757d'; // Grey for info
};

// Severity color mapping
const getSeverityColor = (severity) => {
  switch(severity) {
    case 'CRITICAL': return '#dc3545';
    case 'HIGH': return '#fd7e14';
    case 'MEDIUM': return '#ffc107';
    case 'LOW': return '#0dcaf0';
    case 'INFO': return '#6c757d';
    default: return '#6c757d';
  }
};

// Vulnerability Card Component
const VulnerabilityCard = ({ vulnerability }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`vulnerability-card ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="card-front">
        <div className="card-header" style={{ backgroundColor: getSeverityColor(vulnerability.severity) }}>
          <div className="serial-badge">VULN-{vulnerability.serial_no.toString().padStart(3, '0')}</div>
          <h3>{vulnerability.name}</h3>
          <div className="severity-badge">{vulnerability.severity}</div>
        </div>
        <div className="card-body">
          <div className="serial-number">
            <i className="fas fa-hashtag"></i>
            <span className="serial-text">Serial: {vulnerability.serial_no}</span>
          </div>
          <div className="cvss-score" style={{ backgroundColor: getCVSSColor(vulnerability.cvss_score) }}>
            CVSS: {vulnerability.cvss_score || 'N/A'}
          </div>
          <p className="description">{vulnerability.description}</p>
          <div className="scanners">
            <strong>Detected by:</strong>
            <div className="scanner-tags">
              {vulnerability.scanners.map(scanner => (
                <span key={scanner} className="scanner-tag">{scanner}</span>
              ))}
            </div>
          </div>
          <div className="port-info">
            <i className="fas fa-network-wired"></i> {vulnerability.port}
          </div>
          <div className="flip-hint">
            <i className="fas fa-sync-alt"></i> Click to see details
          </div>
        </div>
      </div>
      
      <div className="card-back">
        <div className="card-header" style={{ backgroundColor: getSeverityColor(vulnerability.severity) }}>
          <div className="serial-badge">VULN-{vulnerability.serial_no.toString().padStart(3, '0')}</div>
          <h3>Vulnerability Details</h3>
        </div>
        <div className="card-body">
          <div className="detail-section">
            <h4><i className="fas fa-hashtag"></i> Serial Information</h4>
            <div className="serial-info">
              <div className="serial-item">
                <span className="label">Serial No:</span>
                <span className="value serial-highlight">{vulnerability.serial_no}</span>
              </div>
              <div className="serial-item">
                <span className="label">Vulnerability ID:</span>
                <span className="value">{vulnerability.id}</span>
              </div>
              <div className="serial-item">
                <span className="label">Unique Reference:</span>
                <span className="value">VULN-{vulnerability.serial_no.toString().padStart(3, '0')}</span>
              </div>
            </div>
          </div>
          
          <div className="detail-section">
            <h4><i className="fas fa-tools"></i> Solution</h4>
            <p>{vulnerability.solution}</p>
          </div>
          
          {vulnerability.cve_list.length > 0 && (
            <div className="detail-section">
              <h4><i className="fas fa-shield-alt"></i> Related CVEs</h4>
              <div className="cve-list">
                {vulnerability.cve_list.map(cve => (
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
          
          <div className="detail-section">
            <h4><i className="fas fa-microscope"></i> Detection Sources</h4>
            <div className="source-info">
              <div className="source-item">
                <span className="label">Detected by:</span>
                <span className="value">{vulnerability.scanners.join(', ')}</span>
              </div>
              <div className="source-item">
                <span className="label">Port:</span>
                <span className="value">{vulnerability.port}</span>
              </div>
              <div className="source-item">
                <span className="label">Severity:</span>
                <span className="value" style={{ color: getSeverityColor(vulnerability.severity) }}>
                  {vulnerability.severity}
                </span>
              </div>
            </div>
            <p className="detection-note">
              <i className="fas fa-info-circle"></i> 
              These scanners identified this issue through automated security testing protocols.
              Serial number {vulnerability.serial_no} uniquely identifies this finding in the report.
            </p>
          </div>
          
          {vulnerability.references.length > 0 && (
            <div className="detail-section">
              <h4><i className="fas fa-book"></i> References</h4>
              <ul>
                {vulnerability.references.map((ref, idx) => (
                  <li key={idx}>
                    <a href={ref} target="_blank" rel="noopener noreferrer">{ref}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flip-back">
            <i className="fas fa-arrow-left"></i> Click to go back
          </div>
        </div>
      </div>
    </div>
  );
};

// Chatbot Component
const SecurityChatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm CyberShield Bot. Ask me about vulnerabilities, scanners, or security recommendations. You can ask about specific vulnerabilities by their serial number (e.g., 'Tell me about vulnerability 3').", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    
    // Bot response logic
    const lowerInput = input.toLowerCase();
    let botResponse = "I can help you with information about vulnerabilities, scanners, and remediation steps. Try asking about specific vulnerabilities by their serial number (1-9) or security tools.";
    
    // Check for serial number queries
    const serialMatch = lowerInput.match(/vulnerability\s+(\d+)|serial\s+(\d+)|vuln\s+(\d+)|^(\d+)$/);
    if (serialMatch) {
      const serialNo = serialMatch[1] || serialMatch[2] || serialMatch[3] || serialMatch[4];
      const vuln = vulnerabilityData.hosts[0].vulnerabilities.find(v => v.serial_no == serialNo);
      if (vuln) {
        botResponse = `Vulnerability ${serialNo}: ${vuln.name}\nSeverity: ${vuln.severity}\nCVSS Score: ${vuln.cvss_score || 'N/A'}\nDescription: ${vuln.description}\nDetected by: ${vuln.scanners.join(', ')}\nPort: ${vuln.port}`;
      } else {
        botResponse = `Vulnerability with serial number ${serialNo} not found. Please enter a number between 1 and ${vulnerabilityData.summary.total_vulnerabilities}.`;
      }
    } else if (lowerInput.includes('tls') || lowerInput.includes('ssl')) {
      botResponse = "TLS vulnerabilities (Serial 1, 3, 5) involve outdated protocols or weak configurations. Disable TLS 1.0/1.1 and use strong cipher suites.";
    } else if (lowerInput.includes('scanner') || lowerInput.includes('tool')) {
      botResponse = "This scan used multiple tools: Nessus, OpenVAS, Nuclei, Nikto, and Nmap. Each has different detection capabilities. Check the scanner section for details.";
    } else if (lowerInput.includes('fix') || lowerInput.includes('solution')) {
      botResponse = "Solutions include disabling weak protocols, enabling security headers, updating cipher suites, and proper certificate management. See each vulnerability's details.";
    } else if (lowerInput.includes('severity') || lowerInput.includes('critical')) {
      botResponse = "Severity levels: CRITICAL (red), HIGH (orange), MEDIUM (yellow), LOW (blue), INFO (gray). No critical vulnerabilities found in this scan.";
    } else if (lowerInput.includes('list') || lowerInput.includes('all')) {
      const vulnList = vulnerabilityData.hosts[0].vulnerabilities.map(v => `${v.serial_no}. ${v.name} (${v.severity})`).join('\n');
      botResponse = `All vulnerabilities (${vulnerabilityData.summary.total_vulnerabilities} total):\n\n${vulnList}`;
    }
    
    setTimeout(() => {
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    }, 500);
    
    setInput('');
  };

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header" onClick={() => setIsMinimized(!isMinimized)}>
        <h3><i className="fas fa-robot"></i> Security Assistant</h3>
        <button className="minimize-btn">
          {isMinimized ? <i className="fas fa-chevron-up"></i> : <i className="fas fa-chevron-down"></i>}
        </button>
      </div>
      
      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < msg.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about vulnerabilities (e.g., 'vulnerability 3')..."
            />
            <button onClick={handleSend}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const vulnerabilities = vulnerabilityData.hosts[0].vulnerabilities;
  
  const filteredVulnerabilities = vulnerabilities.filter(vuln => {
    const matchesFilter = filter === 'ALL' || vuln.severity === filter.toUpperCase();
    const matchesSearch = searchTerm === '' || 
      vuln.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.scanners.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      vuln.serial_no.toString().includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="security-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-shield-alt"></i>
            <h1>CyberShield Security Dashboard</h1>
          </div>
          <div className="scan-info">
            <div className="target-info">
              <span className="target-label">Target:</span>
              <span className="target-value">{vulnerabilityData.target_domain}</span>
              <span className="ip-badge">{vulnerabilityData.target_ip}</span>
            </div>
            <div className="scan-time">
              <i className="far fa-clock"></i> Scan: {new Date(vulnerabilityData.metadata.report_generated).toLocaleString()}
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card total">
          <i className="fas fa-bug"></i>
          <div>
            <h3>{vulnerabilityData.summary.total_vulnerabilities}</h3>
            <p>Total Vulnerabilities</p>
          </div>
        </div>
        
        {Object.entries(vulnerabilityData.summary.by_severity).map(([severity, count]) => (
          <div key={severity} className="stat-card" style={{ borderLeftColor: getSeverityColor(severity.toUpperCase()) }}>
            <i className="fas fa-exclamation-circle"></i>
            <div>
              <h3>{count}</h3>
              <p>{severity.charAt(0).toUpperCase() + severity.slice(1)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="dashboard-controls">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by serial, name, or scanner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map(severity => (
            <button
              key={severity}
              className={`filter-btn ${filter === severity ? 'active' : ''}`}
              onClick={() => setFilter(severity)}
              style={filter === severity ? { backgroundColor: getSeverityColor(severity) } : {}}
            >
              {severity}
            </button>
          ))}
        </div>
      </div>

      {/* Serial Counter */}
      <div className="serial-counter">
        <div className="serial-info-card">
          <i className="fas fa-list-ol"></i>
          <div className="serial-info-content">
            <h3>Vulnerability Serial Numbers</h3>
            <p>Each vulnerability has a unique serial number (1-{vulnerabilityData.summary.total_vulnerabilities}) for easy reference</p>
            <div className="serial-range">
              <span className="serial-start">VULN-001</span>
              <i className="fas fa-arrow-right"></i>
              <span className="serial-end">VULN-{vulnerabilityData.summary.total_vulnerabilities.toString().padStart(3, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vulnerability Grid */}
      <div className="vulnerabilities-grid">
        {filteredVulnerabilities.length > 0 ? (
          filteredVulnerabilities.map(vuln => (
            <VulnerabilityCard key={vuln.serial_no} vulnerability={vuln} />
          ))
        ) : (
          <div className="no-results">
            <i className="fas fa-search"></i>
            <h3>No vulnerabilities found matching your criteria</h3>
          </div>
        )}
      </div>

      {/* Scanner Info */}
      <div className="scanner-info-section">
        <h2><i className="fas fa-tools"></i> Detection Tools Used</h2>
        <div className="scanner-grid">
          {Object.entries(vulnerabilityData.summary.by_scanner).map(([scanner, count]) => (
            <div key={scanner} className="scanner-card">
              <div className="scanner-icon">
                {scanner === 'Nessus' && <i className="fas fa-search"></i>}
                {scanner === 'OpenVAS' && <i className="fas fa-eye"></i>}
                {scanner === 'Nuclei' && <i className="fas fa-bullseye"></i>}
                {scanner === 'Nikto' && <i className="fas fa-spider"></i>}
                {scanner === 'Nmap' && <i className="fas fa-sitemap"></i>}
              </div>
              <h3>{scanner}</h3>
              <p>{count} findings</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chatbot */}
      <SecurityChatbot />

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Security Dashboard v1.1 • Enriched with NVD CVE Data • Report ID: {vulnerabilityData.metadata.report_generated}</p>
        <div className="serial-summary">
          <i className="fas fa-hashtag"></i>
          <span>Report contains {vulnerabilityData.summary.total_vulnerabilities} vulnerabilities with serial numbers 1-{vulnerabilityData.summary.total_vulnerabilities}</span>
        </div>
        <p className="footer-note">
          <i className="fas fa-exclamation-triangle"></i> This is a security assessment report. All findings should be reviewed and addressed by security professionals.
        </p>
      </footer>
    </div>
  );
};

export default App;