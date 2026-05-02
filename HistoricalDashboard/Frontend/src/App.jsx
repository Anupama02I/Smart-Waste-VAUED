import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Overview from "./pages/Overview";
import RiskMonitoring from "./pages/RiskMonitoring";
import Alerts from "./pages/Alerts";
import Insights from "./pages/Insights";

import { Webchat } from "@botpress/webchat";

import botIcon from "./assets/bot-icon.avif";

import "./App.css";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "95px",
            right: "25px",
            width: "400px",
            height: "600px",
            zIndex: 10000,
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
            background: "#ffffff",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Webchat
            clientId="15db60df-f28e-4117-a8b9-c8d5c3387efa"
            configuration={{
              botName: "Environment Monitoring Assistant",
              botDescription: "Hello 👋 Ask me about dashboard, data trends, and risk factors.",
              
          
            }}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
            }}
          />
        </div>
      )}

      {/* Custom Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "50px",
          right: "60px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          zIndex: 10001,
          background: "#fff",
          boxShadow: "0 10px 25px rgba(37,99,235,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
          overflow: "hidden",
        }}
        title="Open Chat"
      >
        {isOpen ? (
          <span
            style={{
              color: "#fff",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            ✖️
          </span>
        ) : (
          <img
            src={botIcon}
            alt="Chatbot"
            style={{
              width: "82px",
              height: "82px",
             
            }}
          />
        )}
      </button>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <Sidebar />
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-page">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/risk" element={<RiskMonitoring />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        <Chatbot />
      </div>
    </BrowserRouter>
  );
}

export default App;