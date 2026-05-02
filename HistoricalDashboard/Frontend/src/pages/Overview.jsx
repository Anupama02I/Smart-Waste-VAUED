import { useEffect, useState } from "react";
import {
  fetchDailyKPI,
  fetchData,
  fetchTrend,
  fetchBinRanking,
  fetchBinSummary,
} from "../services/api";
import KPIcard from "../components/KPIcard";
import RiskLineChart from "../components/Charts/LineChart";

import ZoneMap from "../components/ZoneMap";
import BinRanking from "../components/BinRanking";
import BinDetails from "../components/BinDetails";
import AlertsPanel from "../components/AlertsPanel";

function Overview() {
  const [kpi, setKpi] = useState(null);
  const [date, setDate] = useState("2024-01-01");

  const [allData, setAllData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedBin, setSelectedBin] = useState(null);

  const [rankingData, setRankingData] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const [selectedBinSummary, setSelectedBinSummary] = useState(null);


  useEffect(() => {
  if (window.botpress) {
    window.botpress.sendEvent({
      type: "custom",
      name: "dashboard_context",
      payload: {
        page: "overview",
        date: date,
        days: null,

        zone: selectedZone || "all",
        bin: selectedBin || "all",

        severity: "all",
        status: "all",
        metric: null,
      },
    });
  }
}, [date, selectedZone, selectedBin]);

  useEffect(() => {
    fetchDailyKPI(date).then((res) => setKpi(res.data));
  }, [date]);

  useEffect(() => {
    fetchTrend(date).then((res) => setTrendData(res.data));
  }, [date]);

  useEffect(() => {
    fetchData().then((res) => {
      setAllData(res.data || []);
    });
  }, []);

  useEffect(() => {
    if (!selectedZone) {
      setRankingData([]);
      return;
    }

    let alive = true;
    setRankingLoading(true);

    fetchBinRanking(date, selectedZone)
      .then((res) => {
        if (!alive) return;
        setRankingData(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!alive) return;
        setRankingData([]);
      })
      .finally(() => {
        if (alive) setRankingLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [date, selectedZone]);

  useEffect(() => {
    if (!selectedZone || !selectedBin) {
      setSelectedBinSummary(null);
      return;
    }

    let alive = true;

    fetchBinSummary(date, selectedZone, selectedBin)
      .then((res) => {
        if (!alive) return;

        const summary = res.data || null;

        //  FIX: override risk level using ranking distribution
        if (summary && rankingData.length > 0) {
          const values = rankingData.map((r) => Number(r.avg_risk) || 0);

          const min = Math.min(...values);
          const max = Math.max(...values);

          let riskLevel = "Medium";

          if (max !== min) {
            const normalized =
              (Number(summary.avgRisk) - min) / (max - min);

            if (normalized >= 0.66) riskLevel = "High";
            else if (normalized >= 0.33) riskLevel = "Medium";
            else riskLevel = "Low";
          }

          summary.riskLevel = riskLevel;
        }

        setSelectedBinSummary(summary);
      })
      .catch(() => {
        if (!alive) return;
        setSelectedBinSummary(null);
      });

    return () => {
      alive = false;
    };
  }, [date, selectedZone, selectedBin, rankingData]); 

  
  if (!kpi) {
    return <h2>Loading dashboard...</h2>;
  }

  return (
  <div style={{ width: "100%",
   }}>
    <h2 className="page-title">Overview</h2>

    {/* DATE */}
    <div style={{ marginBottom: "20px" }}>
      <label>Select Date: </label>
      <input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setSelectedZone(null);
          setSelectedBin(null);
          setSelectedBinSummary(null);
        }}
      />
    </div>

    {/* ================= KPI CENTER ================= */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginBottom: "30px",
      }}
    >
      <KPIcard title="Avg Risk" value={kpi.avg_risk.toFixed(2)} />
      <KPIcard title="High Risk Count" value={kpi.high_risk} />
      <KPIcard title="Avg Temperature" value={kpi.avg_temp.toFixed(1) + "°C"} />
      <KPIcard title="Avg Humidity" value={kpi.avg_humidity.toFixed(1) + "%"} />
    </div>

    {/* ================= ROW 1 ================= */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "30px",
      }}
    >
      {/* LINE CHART */}
      <div>
        <h3>Odour Risk Trend</h3>
        <RiskLineChart data={trendData} />
      </div>

      {/* ZONE MAP */}
      <div>
        <h3>Zone Map</h3>
        <ZoneMap
          data={allData}
          selectedZone={selectedZone}
          onZoneClick={(zone) => {
            setSelectedZone(zone);
            setSelectedBin(null);
            setSelectedBinSummary(null);
          }}
        />
      </div>
    </div>

    {/* ================= ROW 2 ================= */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        marginBottom: "30px",
      }}
    >
      {/* BIN RANKING */}
      <div>
        <h3>Priority Bin Ranking</h3>
        <BinRanking
          zone={selectedZone}
          date={date}
          data={rankingData}
          loading={rankingLoading}
          onSelectBin={setSelectedBin}
          selectedBin={selectedBin}
        />
      </div>

      {/* BIN DETAILS */}
      <div>
        <h3>Bin Details</h3>
        <BinDetails summary={selectedBinSummary} />
      </div>
    </div>

    {/* ================= ALERT FULL WIDTH ================= */}
    <div style={{ marginTop: "20px" }}>
      <h3>Alerts</h3>
      <AlertsPanel summary={selectedBinSummary} />
    </div>
  </div>
);
}

export default Overview;