import { api } from './api.js';

export class ScanService {
  static async startPassiveScan(domain) {
    try {
      console.log('Starting passive scan for:', domain);
      const result = await api.passiveScan(domain);
      return result;
    } catch (error) {
      console.error('Passive scan error:', error);
      throw error;
    }
  }

  static async startActiveScan(domain, tools) {
    try {
      console.log('Starting active scan with tools:', tools);
      const result = await api.activeScan(domain, tools);
      return result;
    } catch (error) {
      console.error('Active scan error:', error);
      throw error;
    }
  }

  static validateDomain(domain) {
    const domainRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain) || domain.includes('.');
  }

  static formatResultsForDisplay(results) {
    if (!results) return null;
    
    return {
      scanId: results.scan_id,
      timestamp: results.timestamp,
      domain: results.domain,
      data: results.user || results,
      smartData: results.smart,
      status: results.status,
      message: results.message
    };
  }
}