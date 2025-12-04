const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  // Passive scan
  async passiveScan(domain) {
    const response = await fetch(`${API_BASE_URL}/scan/passive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain }),
    });
    return await response.json();
  },

  // Active scan
  async activeScan(domain, tools) {
    const response = await fetch(`${API_BASE_URL}/scan/active`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ domain, tools }),
    });
    return await response.json();
  },

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  }
};