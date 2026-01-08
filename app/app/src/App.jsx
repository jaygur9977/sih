import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// IMPORT YOUR PAGES
import LandingPage from "./pages/LandingPage";
import QuickScan from "./pages/QuickScan";
import ScanPage from "./pages/ScanPage";
import Layout from "./components/Layout";
import Attack from "./pages/attack"

// DUMMY Pages (अगर तुमने नहीं बनाए हैं तो ये चलेंगे)
const Dashboard = () => <div className="text-white">Dashboard Coming Soon...</div>;
const Analysis = () => <div className="text-white">Analysis Coming Soon...</div>;
const Chat = () => <div className="text-white">AI Assistant Coming Soon...</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing Page / Home */}
        <Route path="/" element={<LandingPage />} />

        {/* Quick Scan */}
        <Route path="/quick-scan" element={<QuickScan />} />

        {/* Multi-step Scan Page */}
        <Route path="/scan" element={<ScanPage />} />
         <Route path="/atack" element={<Attack />} />

        {/* Dashboard Layout (Header + Navigation + Outlet) */}
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/chat" element={<Chat />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
