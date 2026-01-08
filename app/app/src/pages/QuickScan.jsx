import React, { useState, useRef, useEffect } from "react";

export default function FullScanner() {
  const [target, setTarget] = useState("");
  const [logs, setLogs] = useState([]);
  const [finalResult, setFinalResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const logsEndRef = useRef(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const startScan = () => {
    if (!target) {
      alert("Please enter a valid URL (e.g., example.com)");
      return;
    }

    setScanning(true);
    setLogs([]);
    setFinalResult(null);

    // Clean the target URL
    const cleanTarget = target.replace(/^https?:\/\//, "").split('/')[0];

    // SSE EVENT STREAM
    const eventSource = new EventSource(`http://localhost:5000/start-scan?target=${cleanTarget}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Logs from backend
        if (data.type === "log") {
          const timestamp = new Date().toLocaleTimeString();
          setLogs((prev) => [...prev, { message: data.message, timestamp, type: "log" }]);
        }

        // Final Report
        if (data.type === "done") {
          setFinalResult(data.result);
          setScanning(false);
          setLogs((prev) => [...prev, { 
            message: "✅ Scan completed successfully!", 
            timestamp: new Date().toLocaleTimeString(),
            type: "success" 
          }]);
          eventSource.close();
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setLogs((prev) => [...prev, { 
        message: "❌ Connection lost or server error", 
        timestamp: new Date().toLocaleTimeString(),
        type: "error" 
      }]);
      setScanning(false);
      eventSource.close();
    };
  };

  const formatResult = (result) => {
    if (!result) return null;
    
    return (
      <div style={{ 
        backgroundColor: "white", 
        padding: "20px", 
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "#2c3e50" }}>📊 Scan Report</h3>
          <span style={{ 
            backgroundColor: "#27ae60", 
            color: "white", 
            padding: "4px 12px", 
            borderRadius: "12px",
            fontSize: "14px"
          }}>
            Completed
          </span>
        </div>

        {/* Overview */}
        <div style={{ marginBottom: "25px" }}>
          <h4 style={{ color: "#3498db", marginBottom: "10px" }}>📈 Overview</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            {result.target && (
              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "6px" }}>
                <div style={{ fontSize: "12px", color: "#7f8c8d", marginBottom: "5px" }}>Target</div>
                <div style={{ fontWeight: "bold" }}>{result.target}</div>
              </div>
            )}
            {result.scanDate && (
              <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "6px" }}>
                <div style={{ fontSize: "12px", color: "#7f8c8d", marginBottom: "5px" }}>Scan Date</div>
                <div style={{ fontWeight: "bold" }}>{result.scanDate}</div>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        {Object.entries(result).map(([category, data]) => {
          if (category === "target" || category === "scanDate" || !data || typeof data !== "object") {
            return null;
          }

          const getStatusColor = (status) => {
            if (typeof status === "string") {
              if (status.toLowerCase().includes("safe") || status === "secure") return "#27ae60";
              if (status.toLowerCase().includes("warning") || status === "moderate") return "#f39c12";
              if (status.toLowerCase().includes("danger") || status === "insecure") return "#e74c3c";
            }
            return "#3498db";
          };

          return (
            <div key={category} style={{ marginBottom: "25px" }}>
              <h4 style={{ 
                color: "#2c3e50", 
                marginBottom: "15px",
                paddingBottom: "8px",
                borderBottom: "2px solid #ecf0f1"
              }}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
              </h4>
              
              {Array.isArray(data) ? (
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {data.map((item, index) => (
                    <li key={index} style={{ 
                      padding: "12px 15px", 
                      marginBottom: "8px", 
                      backgroundColor: "#f8f9fa",
                      borderRadius: "6px",
                      borderLeft: `4px solid ${getStatusColor(item.status || item)}`
                    }}>
                      {typeof item === "string" ? item : JSON.stringify(item, null, 2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ 
                  backgroundColor: "#f8f9fa", 
                  padding: "20px", 
                  borderRadius: "6px",
                  overflowX: "auto"
                }}>
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: "pre-wrap",
                    fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                    fontSize: "14px"
                  }}>
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ 
      padding: "30px", 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        marginBottom: "30px",
        paddingBottom: "20px",
        borderBottom: "1px solid #e0e0e0"
      }}>
        <div style={{ 
          backgroundColor: "#3498db", 
          width: "40px", 
          height: "40px", 
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "15px",
          color: "white",
          fontSize: "20px"
        }}>
          🔍
        </div>
        <div>
          <h1 style={{ margin: 0, color: "#2c3e50" }}>Security Scanner</h1>
          <p style={{ margin: "5px 0 0 0", color: "#7f8c8d" }}>
            Comprehensive security assessment tool
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div style={{ 
        backgroundColor: "white", 
        padding: "25px", 
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "30px"
      }}>
        <label style={{ 
          display: "block", 
          marginBottom: "10px", 
          fontWeight: "600",
          color: "#2c3e50"
        }}>
          Target URL
        </label>
        <div style={{ display: "flex", gap: "15px" }}>
          <input
            type="text"
            placeholder="example.com or https://example.com"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 15px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "16px",
              outline: "none",
              transition: "border 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#3498db"}
            onBlur={(e) => e.target.style.borderColor = "#ddd"}
          />
          <button
            onClick={startScan}
            disabled={scanning}
            style={{
              padding: "12px 30px",
              background: scanning ? "#95a5a6" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: scanning ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "16px",
              transition: "background 0.3s",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {scanning ? (
              <>
                <span style={{ 
                  width: "12px", 
                  height: "12px", 
                  border: "2px solid transparent",
                  borderTop: "2px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block"
                }}></span>
                Scanning...
              </>
            ) : "Start Scan"}
          </button>
        </div>
        <p style={{ marginTop: "10px", color: "#7f8c8d", fontSize: "14px" }}>
          Enter a domain or URL to begin security analysis
        </p>
      </div>

      {/* Logs Section */}
      <div style={{ 
        backgroundColor: "white", 
        padding: "25px", 
        borderRadius: "10px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: "30px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "15px"
        }}>
          <h3 style={{ margin: 0, color: "#2c3e50", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📜</span>
            Live Scan Logs
            {scanning && (
              <span style={{ 
                fontSize: "12px", 
                backgroundColor: "#fff3cd", 
                color: "#856404",
                padding: "4px 8px",
                borderRadius: "12px",
                marginLeft: "10px"
              }}>
                Active
              </span>
            )}
          </h3>
          {logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              Clear Logs
            </button>
          )}
        </div>
        
        <div
          style={{
            backgroundColor: "#1a1a1a",
            color: "#f8f9fa",
            height: "400px",
            overflowY: "auto",
            borderRadius: "6px",
            padding: "20px",
            fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
            fontSize: "14px",
            lineHeight: "1.5"
          }}
        >
          {logs.length === 0 ? (
            <div style={{ 
              color: "#7f8c8d", 
              textAlign: "center", 
              padding: "50px 20px",
              fontStyle: "italic"
            }}>
              Waiting for scan to start... Logs will appear here
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} style={{ 
                marginBottom: "10px",
                padding: "8px 0",
                borderBottom: "1px solid #2d2d2d"
              }}>
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between",
                  marginBottom: "4px"
                }}>
                  <span style={{ 
                    color: log.type === "error" ? "#e74c3c" : 
                           log.type === "success" ? "#27ae60" : "#3498db",
                    fontWeight: "500"
                  }}>
                    {log.message}
                  </span>
                  <span style={{ color: "#95a5a6", fontSize: "12px" }}>
                    {log.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Results Section */}
      {finalResult && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ 
            color: "#2c3e50", 
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ fontSize: "24px" }}>🎉</span>
            Scan Results
          </h3>
          {formatResult(finalResult)}
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}