import { useEffect, useMemo, useState } from "react";
import {
  fetchRiskTrend,
  fetchRiskDistribution,
  fetchZoneRisk,
  fetchMetricsTrend,
  fetchScatter,
} from "../services/api";

import BrushableRiskTrend from "../components/Charts/BrushableRiskTrend";
import RiskSeverityDistribution from "../components/Charts/RiskSeverityDistribution";
import ZoneRiskComparison from "../components/Charts/ZoneRiskComparison";
import MetricsTrendComparison from "../components/Charts/MetricsTrendComparison";
import FactorContributionScatter from "../components/Charts/FactorContributionScatter";

const RANGE_OPTIONS = [
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "90D", value: "90" },
];

const RISK_OPTIONS = [
  { label: "All risk levels", value: "all" },
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
];

const METRIC_OPTIONS = [
  { label: "Choose Factor", value: "all" },
  { label: "Temperature", value: "temperature" },
  { label: "Humidity", value: "humidity" },
  { label: "Methane", value: "methane" },
  { label: "Ammonia", value: "ammonia" },
];

const ZONE_CODES = ["A", "B", "C", "D", "E"];
const BIN_OPTIONS = [
  "all",
  ...ZONE_CODES.flatMap((z) =>
    Array.from({ length: 8 }, (_, i) => `Zone${z}_BIN_${String(i + 1).padStart(2, "0")}`)
  ),
];

const RISK_COLORS = {
  Low: "#16a34a",
  Medium: "#f97316",
  High: "#ef4444",
};

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getPaddedDomain(values, padRatio = 0.2, minPad = 1) {
  const nums = values.map(num).filter((v) => v !== null);
  if (!nums.length) return [0, 1];

  const min = Math.min(...nums);
  const max = Math.max(...nums);

  if (min === max) {
    return [min - minPad, max + minPad];
  }

  const pad = Math.max((max - min) * padRatio, minPad);
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

function normalizeSeries(data, keys) {
  const stats = {};

  keys.forEach((key) => {
    const values = data.map((d) => num(d[key])).filter((v) => v !== null);

    if (!values.length) {
      stats[key] = { min: 0, max: 0 };
      return;
    }

    stats[key] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  return data.map((row) => {
    const out = { date: row.date };

    keys.forEach((key) => {
      const value = num(row[key]);
      const { min, max } = stats[key];

      if (value === null) {
        out[key] = null;
      } else if (max === min) {
        out[key] = 50;
      } else {
        out[key] = ((value - min) / (max - min)) * 100;
      }
    });

    return out;
  });
}

function RiskMonitoring() {
  const [timeRange, setTimeRange] = useState("30");
  const [selectedBin, setSelectedBin] = useState("all");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [focusMetric, setFocusMetric] = useState("temperature");

  const [trendData, setTrendData] = useState([]);
  const [severityData, setSeverityData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [metricTrendData, setMetricTrendData] = useState([]);
  const [scatterData, setScatterData] = useState([]);

  const [loadingTrend, setLoadingTrend] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [brushRange, setBrushRange] = useState(null);
  const [error, setError] = useState("");

useEffect(() => {
  if (window.botpress) {
    window.botpress.sendEvent({
      type: "custom",
      name: "dashboard_context",
      payload: {
        page: "risk",

        date: null,
        days: timeRange ? Number(timeRange) : 30, // SAFE default

        zone: "all",
        bin: selectedBin || "all",

        severity: selectedRisk || "all",
        status: "all",

        metric: focusMetric || null,
      },
    });
  }
}, [selectedBin, timeRange, selectedRisk, focusMetric]);


  useEffect(() => {
    setBrushRange(null);
  }, [timeRange, selectedBin, selectedRisk]);

  useEffect(() => {
    let alive = true;

    setLoadingTrend(true);
    setError("");

    fetchRiskTrend({
      days: timeRange,
      bin: selectedBin,
      risk: selectedRisk,
    })
      .then((res) => {
        if (!alive) return;
        setTrendData(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (!alive) return;
        setTrendData([]);
        setError(err?.message || "Failed to load risk trend");
      })
      .finally(() => {
        if (alive) {
          setTimeout(() => {
            setLoadingTrend(false);
          }, 500);
        }
      });

    return () => {
      alive = false;
    };
  }, [timeRange, selectedBin, selectedRisk]);

  const windowQuery = useMemo(() => {
    if (!trendData.length) return null;

    const startIndex = Number.isInteger(brushRange?.startIndex)
      ? brushRange.startIndex
      : 0;

    const endIndex = Number.isInteger(brushRange?.endIndex)
      ? brushRange.endIndex
      : trendData.length - 1;

    const start =
      trendData[Math.max(0, Math.min(startIndex, trendData.length - 1))]?.date;

    const end =
      trendData[Math.max(0, Math.min(endIndex, trendData.length - 1))]?.date;

    if (!start || !end) return null;

    return { start, end };
  }, [trendData, brushRange]);

  useEffect(() => {
    if (!trendData.length) return;

    let alive = true;
    setLoadingCharts(true);

    const baseParams = {
      bin: selectedBin,
      risk: selectedRisk,
    };

    const rangeParams =
      windowQuery && trendData.length
        ? {
            ...baseParams,
            start: windowQuery.start,
            end: windowQuery.end,
          }
        : {
            ...baseParams,
            days: timeRange,
          };

    Promise.all([
      fetchRiskDistribution(rangeParams),
      fetchZoneRisk(rangeParams),
      fetchMetricsTrend(rangeParams),
    ])
      .then(([distributionRes, zoneRes, metricRes]) => {
        if (!alive) return;

        setSeverityData(
          Array.isArray(distributionRes.data) ? distributionRes.data : []
        );

        setZoneData(Array.isArray(zoneRes.data) ? zoneRes.data : []);

        setMetricTrendData(
          Array.isArray(metricRes.data) ? metricRes.data : []
        );
      })
      .catch((err) => {
        if (!alive) return;

        setSeverityData([]);
        setZoneData([]);
        setMetricTrendData([]);

        setError(err?.message || "Failed to load chart data");
      })
      .finally(() => {
        if (alive) {
          setTimeout(() => {
            setLoadingTrend(false);
          }, 500);
        }
      });

    return () => {
      alive = false;
    };
  }, [trendData, windowQuery, timeRange, selectedBin, selectedRisk]);

  useEffect(() => {
    if (!trendData.length) return;

    let alive = true;

    const baseParams = {
      bin: selectedBin,
      risk: selectedRisk,
      metric: focusMetric,
      limit: 50,
    };

    const rangeParams =
      windowQuery && trendData.length
        ? {
            ...baseParams,
            start: windowQuery.start,
            end: windowQuery.end,
          }
        : {
            ...baseParams,
            days: timeRange,
          };

    fetchScatter(rangeParams)
      .then((res) => {
        if (!alive) return;

        setScatterData(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!alive) return;

        setScatterData([]);
      });

    return () => {
      alive = false;
    };
  }, [
    trendData,
    windowQuery,
    timeRange,
    selectedBin,
    selectedRisk,
    focusMetric,
  ]);

  const riskTrendDomain = useMemo(
    () => getPaddedDomain(trendData.map((d) => d.avg_risk), 0.35, 0.5),
    [trendData]
  );

  const zoneRiskDomain = useMemo(
    () => getPaddedDomain(zoneData.map((d) => d.avg_risk), 0.35, 0.5),
    [zoneData]
  );

  const scatterXDomain = useMemo(
    () => getPaddedDomain(scatterData.map((d) => d.x), 0.35, 1),
    [scatterData]
  );

  const scatterYDomain = useMemo(
    () => getPaddedDomain(scatterData.map((d) => d.y), 0.35, 1),
    [scatterData]
  );

  const normalizedMetricTrendData = useMemo(
    () =>
      normalizeSeries(metricTrendData, [
        "temperature",
        "humidity",
        "methane",
        "ammonia",
      ]),
    [metricTrendData]
  );

  const selectedMetricLabel =
    METRIC_OPTIONS.find((m) => m.value === focusMetric)?.label || focusMetric;

  const panelStyle = {
  background: "#ffffff", // 
  border: "1px solid #dbe4ea", // 
  borderRadius: "14px",
  padding: "16px",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)", // 
  marginBottom: "18px",
};

  const chartWrap = { width: "100%", height: 320, minWidth: 0 };
  const smallChartWrap = { width: "100%", height: 280, minWidth: 0 };

  

  return (
    <div style={{ width: "100%" }}>
      <h2 style={{ marginBottom: "14px" }}>Risk Monitoring</h2>

      {error ? (
        <div
          style={{
            marginBottom: "14px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "rgba(127, 29, 29, 0.22)",
            border: "1px solid rgba(248, 113, 113, 0.35)",
            color: "#fecaca",
          }}
        >
          {error}
        </div>
      ) : null}

      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    padding: "16px 20px",
    borderRadius: "18px",
    background: "#ffffff",
    backdropFilter: "blur(10px)",
    border: "1px solid #e2e8f0",
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
    flexWrap: "wrap",
  }}
>
  {/* LEFT SIDE FILTERS */}
  <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
    
    {/* BIN */}
    <div>
      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
        BIN
      </div>
      <select
        value={selectedBin}
        onChange={(e) => setSelectedBin(e.target.value)}
        style={{
         background: "#ffffff", // ✅ FIX
          color: "#0f172a", // ✅ FIX
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "8px 12px",
          minWidth: "160px",
          outline: "none",
        }}
      >
        {BIN_OPTIONS.map((b) => (
          <option key={b} value={b}>
            {b === "all" ? "All bins" : b}
          </option>
        ))}
      </select>
    </div>

    {/* RISK */}
    <div>
      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
        RISK LEVEL
      </div>
      <select
        value={selectedRisk}
        onChange={(e) => setSelectedRisk(e.target.value)}
        style={{
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "8px 12px",
          minWidth: "160px",
        }}
      >
        {RISK_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>

    {/* FACTOR */}
    <div>
      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>
        FACTOR
      </div>
      <select
        value={focusMetric}
        onChange={(e) => setFocusMetric(e.target.value)}
        style={{
          background: "#ffffff",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "8px 12px",
          minWidth: "160px",
        }}
      >
        {METRIC_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* RIGHT SIDE RANGE */}
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

    <div
      style={{
        display: "flex",
        background: "#f1f5f9", // ✅ FIX
        borderRadius: "999px",
        padding: "4px",
        border: "1px solid #e2e8f0", // ✅ FIX
      }}
    >
      {RANGE_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => setTimeRange(o.value)}
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            border: "none",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            background:
              timeRange === o.value
                ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                : "transparent",
            color: timeRange === o.value ? "#fff" : "#94a3b8",
            transition: "all 0.25s ease",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
</div>

      <div style={panelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>Brushable Risk Trend</h3>
            <div
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginTop: "4px",
              }}
            >
              Brush the timeline to update the charts below.
            </div>
          </div>
        </div>

        <div style={{ width: "100%", height: 400, minWidth: 0 }}>
          <BrushableRiskTrend
            key={`${timeRange}-${selectedBin}`}
            data={trendData}
            domain={riskTrendDomain}
            onBrushChange={setBrushRange}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          marginBottom: "18px",
        }}
      >
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Metrics Trend Comparison</h3>

          <div style={{ width: "100%", height: 400, minWidth: 0 }}>
            <MetricsTrendComparison
              metricTrendData={Array.isArray(metricTrendData) ? metricTrendData : []}
              selectedMetric={focusMetric}
            />
          </div>
        </div>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Risk Severity Distribution</h3>

          <div style={{ width: "100%", height: 400, minWidth: 0 }}>
            <RiskSeverityDistribution
              key={`${timeRange}-${selectedBin}-${selectedRisk}`}
              severityData={severityData}
              riskColors={RISK_COLORS}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px",
          marginBottom: "18px",
        }}
      >
        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Zone-wise Risk Comparison</h3>

          <div style={{ width: "100%", height: 500, minWidth: 0 }}>
            <ZoneRiskComparison
              zoneData={zoneData}
              zoneRiskDomain={zoneRiskDomain}
            />
          </div>
        </div>

        <div style={panelStyle}>
          <h3 style={{ marginTop: 0 }}>Factor Contribution Scatter</h3>

          <div
            style={{
              color: "#94a3b8",
              fontSize: "13px",
              marginBottom: "10px",
            }}
          >
            {selectedMetricLabel} vs Odour Risk
          </div>

          <div style={{ width: "100%", height: 500, minWidth: 0 }}>
            <FactorContributionScatter
              scatterData={scatterData}
              scatterXDomain={scatterXDomain}
              scatterYDomain={scatterYDomain}
              selectedMetricLabel={selectedMetricLabel}
              riskColors={RISK_COLORS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RiskMonitoring;