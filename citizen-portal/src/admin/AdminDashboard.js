import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import symbol from "../assets/symbol.jpg";
import IssuesTable from "./IssuesTable";
import ResolvedIssuesTable from "./ResolvedIssuesTable";
import MapView from "./MapView";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  { value: "", label: "All Months" },
  { value: 1,  label: "January"   }, { value: 2,  label: "February" },
  { value: 3,  label: "March"     }, { value: 4,  label: "April"    },
  { value: 5,  label: "May"       }, { value: 6,  label: "June"     },
  { value: 7,  label: "July"      }, { value: 8,  label: "August"   },
  { value: 9,  label: "September" }, { value: 10, label: "October"  },
  { value: 11, label: "November"  }, { value: 12, label: "December" },
];

const SPARK_LABELS = ["", "", "", "", "", "", ""];

// ─── Tiny Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const chartData = {
    labels: SPARK_LABELS,
    datasets: [{
      data, borderColor: color, borderWidth: 2,
      pointRadius: 0, fill: false, tension: 0.4,
    }],
  };
  return (
    <Line
      data={chartData}
      options={{
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: false,
      }}
    />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, title, value, trend, trendLabel, sparkData, sparkColor }) {
  const isPos = trend >= 0;
  return (
    <div style={s.statCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ ...s.statIconBox, background: iconBg }}>{icon}</div>
          <div style={s.statTitle}>{title}</div>
          <div style={s.statValue}>{value ?? "—"}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ ...s.trendBadge, color: isPos ? "#16a34a" : "#dc2626", background: isPos ? "#dcfce7" : "#fee2e2" }}>
            {isPos ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span style={s.trendLabel}>{trendLabel}</span>
        </div>
      </div>
      <div style={{ height: 44, marginTop: 12 }}>
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AdminDashboard() {
  const [issues,        setIssues]        = useState([]);
  const [analytics,     setAnalytics]     = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [now,           setNow]           = useState(new Date());

  // Filters — default to current month so both tables show current month by default
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return String(d.getMonth() + 1);
  });
  const [filterYear, setFilterYear] = useState(() => {
    const d = new Date();
    return String(d.getFullYear());
  });
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const fetchIssues = useCallback(async () => {
    try {
      setLoadingIssues(true);
      const res = await axios.get("http://localhost:5000/api/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(res.data);
    } catch (err) { console.error("Issues fetch error", err); }
    finally { setLoadingIssues(false); }
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/analytics/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch (err) { console.error("Analytics fetch error", err); }
  }, [token]);

  const updateIssueStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/issues/issue-status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchIssues(); fetchAnalytics();
    } catch (err) { console.error("Failed to update status", err); }
  };

  useEffect(() => { fetchIssues(); fetchAnalytics(); }, [fetchIssues, fetchAnalytics]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const y = new Set(
      issues.filter(i => i.createdAt && !isNaN(new Date(i.createdAt)))
            .map(i => new Date(i.createdAt).getFullYear())
    );
    y.add(new Date().getFullYear()); // ensure current year is always in list for default filter
    return Array.from(y).sort((a, b) => a - b);
  }, [issues]);

  const filteredIssues = useMemo(() => issues.filter(issue => {
    if (!issue.createdAt) return false;
    const d = new Date(issue.createdAt);
    if (isNaN(d)) return false;
    const mM = filterMonth    === "" || d.getMonth() + 1 === Number(filterMonth);
    const yM = filterYear     === "" || d.getFullYear()  === Number(filterYear);
    const sM = filterStatus   === "" || issue.status     === filterStatus;
    const pM = filterPriority === "" || issue.prediction?.priority === filterPriority;
    return mM && yM && sM && pM;
  }), [issues, filterMonth, filterYear, filterStatus, filterPriority]);

  const monthlySummary = useMemo(() => {
    const map = new Map();
    issues.forEach(issue => {
      if (!issue.createdAt) return;
      const d = new Date(issue.createdAt);
      if (isNaN(d)) return;
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const lbl = d.toLocaleString("default", { month: "short" }) + " " + d.getFullYear();
      if (!map.has(key)) map.set(key, { lbl, total: 0, active: 0, resolved: 0, critical: 0 });
      const b = map.get(key);
      b.total++;
      if (issue.status === "In Progress") b.active++;
      if (issue.status === "Resolved")    b.resolved++;
      if (["Emergency","High"].includes(issue.prediction?.priority)) b.critical++;
    });
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([,v])=>v);
  }, [issues]);

  const issueTypeDist = useMemo(() => {
    const map = {};
    issues.forEach(i => {
      const t = i.prediction?.issueType || "Other";
      map[t] = (map[t] || 0) + 1;
    });
    return map;
  }, [issues]);

  const wardPerf = useMemo(() => {
    const map = {};
    issues.filter(i => i.status === "Resolved" && i.resolvedAt && i.createdAt).forEach(i => {
      const w = i.ward || "Unknown";
      const h = (new Date(i.resolvedAt) - new Date(i.createdAt)) / 3600000;
      if (!map[w]) map[w] = { total: 0, count: 0 };
      map[w].total += h; map[w].count++;
    });
    return Object.entries(map)
      .map(([ward, v]) => ({ ward, avg: (v.total / v.count).toFixed(1) }))
      .sort((a, b) => parseFloat(a.avg) - parseFloat(b.avg))
      .slice(0, 5);
  }, [issues]);

  const totalIssues    = analytics?.totalIssues    ?? issues.length;
  const activeIssues   = analytics?.activeIssues   ?? issues.filter(i => i.status !== "Resolved").length;
  const resolvedIssues = analytics?.resolvedIssues ?? issues.filter(i => i.status === "Resolved").length;
  const criticalCount  = issues.filter(i => ["Emergency","High"].includes(i.prediction?.priority)).length;
  const avgResTime     = analytics?.avgResolutionTimeHours ?? "—";

  // ── Chart data ────────────────────────────────────────────────────────────
  const lineData = {
    labels: monthlySummary.map(m => m.lbl),
    datasets: [
      { label: "Total",    data: monthlySummary.map(m => m.total),    borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.07)",  fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: "#6366f1", pointBorderColor: "#fff", pointBorderWidth: 2 },
      { label: "Active",   data: monthlySummary.map(m => m.active),   borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.07)",   fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: "#f59e0b", pointBorderColor: "#fff", pointBorderWidth: 2 },
      { label: "Resolved", data: monthlySummary.map(m => m.resolved), borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.07)",   fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: "#10b981", pointBorderColor: "#fff", pointBorderWidth: 2 },
      { label: "Critical", data: monthlySummary.map(m => m.critical), borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.07)",    fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: "#ef4444", pointBorderColor: "#fff", pointBorderWidth: 2 },
    ],
  };
  const lineOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 7, font: { size: 12, family: "'DM Sans'" }, padding: 16 } },
      tooltip: { mode: "index", intersect: false, backgroundColor: "#1e293b", titleFont: { size: 12 }, bodyFont: { size: 12 }, padding: 10, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11, family: "'DM Sans'" }, color: "#94a3b8" } },
      y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11, family: "'DM Sans'" }, color: "#94a3b8" }, beginAtZero: true },
    },
  };

  const doughnutLabels = Object.keys(issueTypeDist);
  const dColors = ["#10b981","#6366f1","#f59e0b","#ef4444","#8b5cf6","#14b8a6","#f97316"];
  const doughnutData = {
    labels: doughnutLabels,
    datasets: [{ data: doughnutLabels.map(k => issueTypeDist[k]), backgroundColor: dColors, borderWidth: 3, borderColor: "#fff", hoverOffset: 4 }],
  };
  const doughnutOpts = {
    responsive: true, maintainAspectRatio: false, cutout: "68%",
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` } } },
  };

  const hasFilters = filterMonth !== "" || filterYear !== "" || filterStatus !== "" || filterPriority !== "";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        .adash-select { transition: border-color 0.2s, box-shadow 0.2s; }
        .adash-select:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
        .adash-select:hover { border-color: #94a3b8 !important; }
        .adash-nav-icon:hover { background: rgba(255,255,255,0.18) !important; }
        .adash-clear:hover { background: #fee2e2 !important; color: #dc2626 !important; border-color: #fca5a5 !important; }
        .adash-row:hover > td { background: #f8faff !important; }
        .ward-fill { transition: width 0.7s cubic-bezier(.4,0,.2,1); }
        .adash-chip:hover { background: #e2e8f0 !important; }
        .adash-logout:hover { background: rgba(239,68,68,0.35) !important; }
      `}</style>

      {/* ════════════════════════════════════════════════ NAVBAR */}
      <header style={s.navbar}>
        <div style={s.navLeft}>
          <div style={s.navLogoBox}>
            <img src={symbol} alt="Logo" style={{ width: 26, height: 26, objectFit: "contain", borderRadius: 4 }} />
          </div>
          <span style={s.navBrand}>Smart Civic System</span>
        </div>

        <div style={s.navDateChip}>
          {dateStr} | {timeStr} ▾
        </div>

        <div style={s.navRight}>
          <div className="adash-nav-icon" style={s.navIconBtn} title="Notifications">
            🔔
            <span style={s.navBadge}>3</span>
          </div>
          <div className="adash-nav-icon" style={s.navIconBtn} title="Call">📞</div>
          <div style={s.navProfile}>
            <div style={s.navAvatar}>👤</div>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Admin</span>
            <span style={{ fontSize: 11, opacity: 0.55 }}>▾</span>
          </div>
          <button className="adash-logout" onClick={handleLogout} style={s.navLogout}>Logout</button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════ BODY */}
      <div style={s.body}>

        {/* ── Stat Cards ── */}
        <div style={s.statsGrid}>
          <StatCard icon="📋" iconBg="#dbeafe" title="Total Issues"    value={totalIssues}    trend={12} trendLabel="vs last month" sparkData={[4,5,6,5,7,8,totalIssues||9]}   sparkColor="#6366f1" />
          <StatCard icon="⚠️" iconBg="#fef3c7" title="Active Issues"   value={activeIssues}   trend={25} trendLabel="vs last month" sparkData={[2,3,3,4,4,5,activeIssues||5]}  sparkColor="#f59e0b" />
          <StatCard icon="✅" iconBg="#dcfce7" title="Resolved"        value={resolvedIssues} trend={20} trendLabel="vs last month" sparkData={[1,2,2,3,3,4,resolvedIssues||4]} sparkColor="#10b981" />
          <StatCard icon="🚨" iconBg="#fee2e2" title="Critical Alerts" value={criticalCount}  trend={-8} trendLabel="vs last month" sparkData={[3,3,2,4,2,3,criticalCount||2]}  sparkColor="#ef4444" />
        </div>

        {/* ── Row 2: Line Chart + Map ── */}
        <div style={s.row2}>
          {/* Line Chart */}
          <div style={{ ...s.card, flex: "1 1 0", minWidth: 0 }}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Monthly Issue Trend</span>
              <div style={{ display: "flex", gap: 6 }}>
                {["Monthly","Issue Type","Ward"].map(l => (
                  <div key={l} className="adash-chip" style={s.chip}>{l} ▾</div>
                ))}
              </div>
            </div>
            <div style={{ height: 290, marginTop: 8 }}>
              {monthlySummary.length > 0
                ? <Line data={lineData} options={lineOpts} />
                : <div style={s.emptyChart}>No data yet</div>
              }
            </div>
          </div>

          {/* Map */}
          <div style={{ ...s.card, width: 400, flexShrink: 0 }}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Issue Map View</span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["All","Critical","High","Medium","Low"].map((l, i) => (
                  <span key={l} style={{ ...s.mapChip, ...(i === 0 ? s.mapChipActive : {}) }}>{l}</span>
                ))}
              </div>
            </div>
            <div style={{ height: 290, borderRadius: 10, overflow: "hidden", marginTop: 8, position: "relative", zIndex: 0 }}>
              <MapView issues={issues} />
            </div>
          </div>
        </div>

        {/* ── Row 3: Doughnut + Ward Perf + Resolution Trend ── */}
        <div style={s.row3}>

          {/* Issue Type Distribution */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Issue Type Distribution</span>
              <span style={s.moreBtn}>···</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                {doughnutLabels.length > 0
                  ? <Doughnut data={doughnutData} options={doughnutOpts} />
                  : <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 12 }}>No data</div>
                }
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                {doughnutLabels.slice(0, 5).map((lbl, i) => {
                  const pct = totalIssues > 0 ? Math.round((issueTypeDist[lbl] / totalIssues) * 100) : 0;
                  return (
                    <div key={lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <span style={{ width: 9, height: 9, borderRadius: "50%", background: dColors[i % dColors.length], flexShrink: 0, display: "inline-block" }} />
                        <span style={{ fontSize: 13, color: "#475569" }}>{lbl}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{pct}%</span>
                        <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>↑</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ward-wise Performance */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Ward-wise Performance</span>
              <div style={{ display: "flex", gap: 5 }}>
                <span className="adash-chip" style={s.chip}>↓</span>
                <span className="adash-chip" style={s.chip}>≡</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
              {wardPerf.length > 0 ? wardPerf.map((w, i) => {
                const bColors = ["#6366f1","#6366f1","#10b981","#f59e0b","#f59e0b"];
                const maxAvg  = Math.max(...wardPerf.map(x => parseFloat(x.avg)));
                const pct     = maxAvg > 0 ? (parseFloat(w.avg) / maxAvg) * 100 : 0;
                return (
                  <div key={w.ward}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{w.ward}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{w.avg} hrs</span>
                    </div>
                    <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                      <div className="ward-fill" style={{ height: "100%", width: `${pct}%`, background: bColors[i % bColors.length], borderRadius: 99 }} />
                    </div>
                  </div>
                );
              }) : (
                <div style={s.emptyChart}>No resolved ward data yet</div>
              )}
            </div>
          </div>

          {/* Resolution Time Trend */}
          <div style={s.card}>
            <div style={s.cardHead}>
              <span style={s.cardTitle}>Resolution Time Trend</span>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <span style={{ ...s.chip, fontSize: 11 }}>SLA: {avgResTime} hrs</span>
                <span className="adash-chip" style={s.chip}>🔒</span>
              </div>
            </div>
            <div style={{ height: 180, marginTop: 12 }}>
              {monthlySummary.length > 0 ? (
                <Line
                  data={{
                    labels: monthlySummary.map(m => m.lbl),
                    datasets: [
                      { label: "Avg Res. Time", data: monthlySummary.map(() => parseFloat(avgResTime)||0), borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,0.07)", fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: "#6366f1", pointBorderColor: "#fff", pointBorderWidth: 2 },
                      { label: "SLA Target",    data: monthlySummary.map(() => parseFloat(avgResTime)||0), borderColor: "#ef4444", borderDash: [5,4], borderWidth: 1.5, pointRadius: 0, fill: false },
                    ],
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 7, font: { size: 11, family: "'DM Sans'" }, padding: 12 } }, tooltip: { mode: "index", intersect: false, backgroundColor: "#1e293b" } },
                    scales: {
                      x: { grid: { color: "#f8fafc" }, ticks: { font: { size: 10, family: "'DM Sans'" }, color: "#94a3b8" } },
                      y: { grid: { color: "#f8fafc" }, ticks: { font: { size: 10, family: "'DM Sans'" }, color: "#94a3b8" }, beginAtZero: true },
                    },
                  }}
                />
              ) : <div style={s.emptyChart}>No data yet</div>}
            </div>
          </div>
        </div>

        {/* ── Heatmap ── */}
        {/* <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Issue Density Heatmap</span>
          </div>
          <div style={{ height: 260, borderRadius: 10, overflow: "hidden", marginTop: 10 }}>
            <HeatmapView issues={issues} />
          </div>
        </div> */}

        {/* ── Issues Table ── */}
        <div style={s.card}>
          {/* Header bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
            {/* Left: title + active-filter pills */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={s.cardTitle}>Issues Table</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 10px" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>🔍</span>
                {filterStatus   && <span style={s.pill}>{filterStatus}</span>}
                {filterPriority && <span style={s.pill}>{filterPriority}</span>}
                {filterMonth    && <span style={s.pill}>{MONTHS.find(m=>String(m.value)===String(filterMonth))?.label}</span>}
                {filterYear     && <span style={s.pill}>{filterYear}</span>}
                <span style={{ fontSize: 12, color: "#94a3b8" }}>
                  {filteredIssues.length} / {issues.length}
                </span>
              </div>
            </div>

            {/* Right: selects */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <select value={filterMonth}    onChange={e=>setFilterMonth(e.target.value)}    className="adash-select" style={s.sel}>
                {MONTHS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={filterYear}     onChange={e=>setFilterYear(e.target.value)}     className="adash-select" style={s.sel}>
                <option value="">All Years</option>
                {availableYears.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
              <select value={filterStatus}   onChange={e=>setFilterStatus(e.target.value)}   className="adash-select" style={s.sel}>
                <option value="">All Statuses</option>
                <option>Reported</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} className="adash-select" style={s.sel}>
                <option value="">All Priorities</option>
                <option>Emergency</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              {hasFilters && (
                <button className="adash-clear" onClick={()=>{setFilterMonth("");setFilterYear("");setFilterStatus("");setFilterPriority("");}} style={s.clearBtn}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <IssuesTable issues={filteredIssues} loading={loadingIssues} onStatusChange={updateIssueStatus} />
        </div>

        {/* ── Resolved Issues Table ── */}
        <div style={{ ...s.card, marginTop: 0 }}>
          <div style={{ ...s.cardHead, marginBottom: 16 }}>
            <span style={s.cardTitle}>Resolved Issues Table</span>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>(uses same filters above)</span>
          </div>
          <ResolvedIssuesTable issues={filteredIssues} loading={loadingIssues} onStatusChange={updateIssueStatus} />
        </div>

      </div>{/* /body */}
    </div>
  );
}

// ─── Style Object ─────────────────────────────────────────────────────────────
const s = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#f1f5f9",
    minHeight: "100vh",
    color: "#0f172a",
  },
  // Navbar
  navbar: {
    background: "#1e293b",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 clamp(12px, 4vw, 28px)",
    height: 58,
    boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    gap: 16,
    flexWrap: "wrap",
  },
  navLeft: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  navLogoBox: {
    width: 36, height: 36, borderRadius: 8,
    background: "rgba(255,255,255,0.12)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18,
  },
  navBrand: { fontSize: "clamp(13px, 4vw, 16px)", fontWeight: 700, letterSpacing: "-0.3px", whiteSpace: "nowrap" },
  navDateChip: {
    fontSize: "clamp(11px, 3vw, 13px)", color: "rgba(255,255,255,0.7)",
    background: "rgba(255,255,255,0.08)",
    padding: "clamp(4px, 2vw, 5px) clamp(12px, 3vw, 16px)", borderRadius: 20,
    cursor: "pointer", whiteSpace: "nowrap",
  },
  navRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  navIconBtn: {
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, cursor: "pointer", position: "relative",
    transition: "background 0.2s", flexShrink: 0,
  },
  navBadge: {
    position: "absolute", top: -3, right: -3,
    background: "#ef4444", color: "#fff",
    fontSize: 9, fontWeight: 800,
    width: 16, height: 16, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "2px solid #1e293b",
  },
  navProfile: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,255,255,0.1)",
    padding: "4px 12px 4px 4px",
    borderRadius: 99, cursor: "pointer",
  },
  navAvatar: {
    width: 28, height: 28, borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
  },
  navLogout: {
    background: "rgba(239,68,68,0.18)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", fontSize: "clamp(11px, 3vw, 13px)", fontWeight: 600,
    padding: "clamp(4px, 2vw, 5px) clamp(10px, 3vw, 14px)", borderRadius: 8, cursor: "pointer",
    transition: "background 0.2s", whiteSpace: "nowrap",
  },
  // Body
  body: {
    padding: "clamp(16px, 5vw, 24px) clamp(16px, 4vw, 28px)",
    maxWidth: 1440,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "clamp(12px, 3vw, 20px)",
  },
  // Stat cards
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(150px, 60vw, 280px), 1fr))", gap: "clamp(12px, 3vw, 16px)" },
  statCard: {
    background: "#fff", borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: "clamp(14px, 3vw, 18px) clamp(14px, 4vw, 20px)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  statIconBox: {
    width: 38, height: 38, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, marginBottom: 12,
  },
  statTitle: { fontSize: "clamp(11px, 3vw, 13px)", color: "#64748b", fontWeight: 500, marginBottom: 3 },
  statValue: { fontSize: "clamp(24px, 8vw, 34px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 },
  trendBadge: { fontSize: "clamp(10px, 2vw, 12px)", fontWeight: 700, padding: "3px 9px", borderRadius: 99 },
  trendLabel: { fontSize: "clamp(10px, 2vw, 11px)", color: "#94a3b8" },
  // Generic card
  card: {
    background: "#fff", borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: "clamp(16px, 4vw, 20px) clamp(16px, 4vw, 24px)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  cardHead: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap", gap: 8,
  },
  cardTitle: { fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 700, color: "#0f172a" },
  // Rows
  row2: { display: "flex", flexDirection: "row", gap: 20, alignItems: "stretch" },
  row3: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(12px, 4vw, 20px)" },
  // Chips
  chip: {
    fontSize: "clamp(10px, 2vw, 12px)", fontWeight: 500, color: "#475569",
    background: "#f8fafc", border: "1px solid #e2e8f0",
    padding: "4px 10px", borderRadius: 6,
    cursor: "pointer", userSelect: "none",
    transition: "background 0.15s",
  },
  mapChip: {
    fontSize: "clamp(10px, 2vw, 11px)", fontWeight: 500, color: "#64748b",
    background: "#f8fafc", border: "1px solid #e2e8f0",
    padding: "3px 9px", borderRadius: 99, cursor: "pointer",
  },
  mapChipActive: {
    background: "#1e293b", color: "#fff", border: "1px solid #1e293b",
  },
  moreBtn: { fontSize: 20, color: "#94a3b8", cursor: "pointer", letterSpacing: 3, lineHeight: 1 },
  emptyChart: {
    height: "100%", display: "flex", alignItems: "center",
    justifyContent: "center", color: "#94a3b8", fontSize: 13,
    background: "#f8fafc", borderRadius: 8,
  },
  // Filter selects
  sel: {
    padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0",
    fontSize: 13, color: "#334155", background: "#fff",
    cursor: "pointer", outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    fontFamily: "'DM Sans', sans-serif",
  },
  clearBtn: {
    padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
    fontSize: 13, fontWeight: 600, color: "#64748b",
    background: "#f8fafc", cursor: "pointer",
    transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
  },
  pill: {
    fontSize: 11, fontWeight: 600,
    background: "#ede9fe", color: "#7c3aed",
    padding: "2px 8px", borderRadius: 99,
  },
};

export default AdminDashboard;