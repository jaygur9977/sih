import express from 'express';
import { runPassiveScan } from '../scanService.js';

const router = express.Router();

// Passive scan endpoint
router.post('/passive', async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Domain is required' 
      });
    }

    console.log(`Starting passive scan for: ${domain}`);
    
    // Start scan
    const result = await runPassiveScan(domain);
    
    res.json({
      ...result,
      domain,
      scan_type: 'passive',
      scan_duration: 'completed'
    });

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Active scan endpoint (simulated for now)
router.post('/active', async (req, res) => {
  try {
    const { domain, tools } = req.body;
    
    if (!domain || !tools || !Array.isArray(tools)) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Domain and tools are required' 
      });
    }

    console.log(`Starting active scan for: ${domain} with tools:`, tools);
    
    // Simulate active scanning
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock results based on tools
    const mockResults = {
      nmap: {
        open_ports: [80, 443, 22, 8080],
        services: [
          { port: 80, service: 'http', version: 'nginx/1.18' },
          { port: 443, service: 'https', version: 'Apache/2.4' },
          { port: 22, service: 'ssh', version: 'OpenSSH 8.2' }
        ],
        os_detection: 'Linux 4.15'
      },
      nikto: {
        vulnerabilities: [
          { severity: 'MEDIUM', description: 'X-Frame-Options header not set' },
          { severity: 'LOW', description: 'Cookies without HttpOnly flag' }
        ],
        alerts: ['Server banner discloses version information']
      },
      nuclei: {
        findings: [
          { template: 'http-cve-2021-12345', severity: 'HIGH', matched: true },
          { template: 'http-missing-security-headers', severity: 'MEDIUM', matched: true }
        ]
      },
      openvas: {
        cvss_scores: [7.5, 8.2, 5.3],
        vulnerabilities: [
          { cve: 'CVE-2021-12345', cvss: 7.5, risk: 'HIGH' },
          { cve: 'CVE-2021-67890', cvss: 8.2, risk: 'CRITICAL' }
        ]
      }
    };

    const results = {};
    tools.forEach(tool => {
      if (mockResults[tool]) {
        results[tool] = mockResults[tool];
      }
    });

    res.json({
      status: 'completed',
      domain,
      tools,
      results,
      timestamp: new Date().toISOString(),
      scan_id: `active_${Date.now()}`,
      message: 'Active scan completed successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

export default router;