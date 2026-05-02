import { useEffect, useState, useMemo } from "react";
import { fetchAlerts, fetchAlertsSummary } from "../services/api";

import AlertSummary from "../components/Alerts/AlertSummary";
import AlertList from "../components/Alerts/AlertList";
import AlertDetails from "../components/Alerts/AlertDetails";

function AlertsPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);

  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedBin, setSelectedBin] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");


useEffect(() => {

  const payload = {
    page: "alerts",
    zone: selectedZone,
    bin: selectedBin,
    severity: selectedSeverity,
    status: selectedStatus,
  };

  console.log(" Sending BP event:", payload);

  if (window.botpress) {
    window.botpress.sendEvent({
      type: "custom",
      name: "dashboard_context",
      payload: {
        page: "alerts",

        date: null,
        days: 7,

        zone: selectedZone || "all",
        bin: selectedBin || "all",

        severity: selectedSeverity || "all",
        status: selectedStatus || "all",

        metric: null,
      },
    });
  }
}, [selectedZone, selectedBin, selectedSeverity, selectedStatus]);


  useEffect(() => {
    fetchAlerts({ days: 7 })
      .then((res) => {
        setData(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setData([]));

    fetchAlertsSummary({ days: 7 })
      .then((res) => {
        const d = res.data || {};
        setSummary({
          total_alerts: Number(d.total_alerts) || 0,
          high_alerts: Number(d.high_alerts) || 0,
          medium_alerts: Number(d.medium_alerts) || 0,
          low_alerts: Number(d.low_alerts) || 0,
          unresolved_alerts: Number(d.unresolved_alerts) || 0,
        });
      })
      .catch(() =>
        setSummary({
          total_alerts: 0,
          high_alerts: 0,
          medium_alerts: 0,
          low_alerts: 0,
          unresolved_alerts: 0,
        })
      );
  }, []);

  const zones = useMemo(() => {
    return [...new Set(data.map((d) => d.location).filter(Boolean))];
  }, [data]);

  const generateBins = (zone) => {
    if (!zone || zone === "all") return [];
    const zoneLetter = zone.replace("Zone ", "");
    return Array.from({ length: 8 }, (_, i) => {
      const num = String(i + 1).padStart(2, "0");
      return `Zone${zoneLetter}_BIN_${num}`;
    });
  };

  const bins = useMemo(() => {
    return generateBins(selectedZone);
  }, [selectedZone]);

  useEffect(() => {
    setSelectedBin("all");
  }, [selectedZone]);

  const filteredData = useMemo(() => {
    return data.filter((d) => {
      if (selectedZone !== "all" && d.location !== selectedZone) return false;
      if (selectedBin !== "all" && d.bin_id !== selectedBin) return false;
      if (selectedSeverity !== "all" && d.risk_level !== selectedSeverity)
        return false;
      if (selectedStatus !== "all" && d.status !== selectedStatus)
        return false;
      return true;
    });
  }, [data, selectedZone, selectedBin, selectedSeverity, selectedStatus]);

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: 0 }}>Alerts</h2>
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>
          Monitor and manage environmental risk alerts
        </p>
      </div>

      <AlertSummary summary={summary} />

      {/* FILTER PANEL */}
      <div style={filterContainer}>
        {/* Zone */}
        <div style={filterBlock}>
          <label style={labelStyle}>Zone</label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Zones</option>
            {zones.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </div>

        {/* Bin */}
        <div style={filterBlock}>
          <label style={labelStyle}>Bin</label>
          <select
            value={selectedBin}
            onChange={(e) => setSelectedBin(e.target.value)}
            style={selectStyle}
          >
            <option value="all">All Bins</option>
            {bins.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div style={filterBlock}>
          <label style={labelStyle}>Severity</label>
          <div style={{ display: "flex", gap: "6px" }}>
            {["all", "High", "Medium", "Low"].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSeverity(s)}
                style={{
                  ...pillStyle,
                  background:
                    selectedSeverity === s
                      ? getSeverityColor(s)
                      : "transparent",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: "flex", gap: "20px" }}>
        <div style={{ width: "60%" }}>
          <AlertList
            alerts={filteredData}
            selectedAlert={selectedAlert}
            onSelect={setSelectedAlert}
          />
        </div>

        <div style={{ width: "40%" }}>
          <AlertDetails alert={selectedAlert} />
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;

const filterContainer = {
  display: "flex",
  gap: "20px",
  marginBottom: "20px",
  padding: "16px",
  background: "#ffffff", // ✅ fixed
  borderRadius: "14px",
  border: "1px solid #e2e8f0", // ✅ fixed
  boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)", // ✅ fixed
  flexWrap: "wrap",
};

const filterBlock = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyle = {
  fontSize: "12px",
  color: "#64748b", // ✅ fixed
};

const selectStyle = {
  padding: "8px 12px",
  background: "#ffffff", // ✅ fixed
  color: "#0f172a", // ✅ fixed
  border: "1px solid #e2e8f0", // ✅ fixed
  borderRadius: "8px",
  minWidth: "140px",
};

const pillStyle = {
  padding: "6px 12px",
  border: "1px solid #e2e8f0", // ✅ fixed
  borderRadius: "999px",
  color: "#64748b", // ✅ fixed
  cursor: "pointer",
  fontSize: "12px",
  transition: "0.2s",
};

const getSeverityColor = (s) => {
  if (s === "High") return "#ef4444";
  if (s === "Medium") return "#f97316";
  if (s === "Low") return "#22c55e";
  return "#3b82f6";
};