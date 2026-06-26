"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Folder, AlertCircle, TrendingUp, MessageSquare, Star, Filter } from "lucide-react";
import { GradientStar } from "@/components/GradientStar";

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [loading, setLoading] = useState(true);

  // States computed from filtered feedbacks
  const [stats, setStats] = useState({
    total: 0,
    newCount: 0,
    thisWeek: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
    totalRated: 0,
  });

  // Load projects and feedbacks once on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [projectsRes, feedbacksRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/feedbacks?limit=100"),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }

        if (feedbacksRes.ok) {
          const feedbacksData = await feedbacksRes.json();
          setFeedbacks(feedbacksData.feedbacks || []);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Compute metrics and charts whenever selectedProjectId or feedbacks list changes
  useEffect(() => {
    if (loading) return;

    // Filter feedbacks based on selected project
    const filtered = feedbacks.filter((f) => {
      if (selectedProjectId === "all") return true;
      const pid = f.projectId?._id || f.projectId;
      return pid === selectedProjectId;
    });

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Stats
    setStats({
      total: filtered.length,
      newCount: filtered.filter((f) => f.status === "new").length,
      thisWeek: filtered.filter((f) => new Date(f.createdAt) > weekAgo).length,
    });

    // 2. SVG Line Chart (7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
        dateString: d.toISOString().split("T")[0],
        count: 0,
      });
    }

    filtered.forEach((f) => {
      const fDate = new Date(f.createdAt).toISOString().split("T")[0];
      const dayObj = days.find((d) => d.dateString === fDate);
      if (dayObj) {
        dayObj.count += 1;
      }
    });
    setChartData(days);

    // 3. Star rating distribution
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, totalRated: 0 };
    filtered.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) {
        dist[f.rating] += 1;
        dist.totalRated += 1;
      }
    });
    setRatingDistribution(dist);
  }, [selectedProjectId, feedbacks, loading]);

  const getFavicon = (domain) => {
    if (!domain) return null;
    const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    return `https://${clean}/favicon.ico`;
  };


  // SVG Chart Helper Variables
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  const maxCount = chartData.length > 0 ? Math.max(...chartData.map((d) => d.count)) : 0;
  const yMax = maxCount > 0 ? Math.ceil(maxCount * 1.2) : 5; // buffer at top, fallback to 5

  const points = chartData.map((d, index) => {
    const x = paddingLeft + (index * graphWidth) / (chartData.length - 1);
    const y = chartHeight - paddingBottom - (d.count * graphHeight) / yMax;
    return { x, y, ...d };
  });

  const pathD =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ")
      : "";

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${
          chartHeight - paddingBottom
        } Z`
      : "";

  if (loading) {
    return null;
  }

  const isChartEmpty = maxCount === 0;

  return (
    <div className="space-y-8">
      {/* Header with Project Selector Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
          <p className="text-muted-foreground">Statistics and performance of your widgets</p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="block w-[220px] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
          >
            <option value="all">🔌 All widgets</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.domain ? `🌐 ${p.name}` : `🔌 ${p.name}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Total Feedbacks</h3>
            <span className="text-lg">💬</span>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-950">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedProjectId === "all" ? "All widgets combined" : "For the selected widget"}
            </p>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Unread</h3>
            {stats.newCount > 0 ? (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            ) : (
              <span className="text-xs">✅</span>
            )}
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-950">{stats.newCount}</div>
            {stats.newCount > 0 ? (
              <p className="text-xs text-orange-600 font-medium mt-1">Needs attention</p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">All caught up</p>
            )}
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">This week</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-950">{stats.thisWeek}</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Charts section: Grid of 2 Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-950">Feedback Activity</h2>
            <p className="text-sm text-muted-foreground">Feedback volume per day</p>
          </div>

          <div className="relative w-full h-[200px] border rounded-lg bg-gray-50/50 p-2 overflow-hidden flex items-center justify-center">
            {/* SVG Chart */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = paddingTop + ratio * graphHeight;
                const value = Math.round(yMax - ratio * yMax);
                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[9px] fill-muted-foreground font-medium"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              {!isChartEmpty && (
                <>
                  <path d={areaD} fill="url(#chartGradient)" />
                  <path d={pathD} fill="none" stroke="var(--primary)" strokeWidth="2" />

                  {/* Data Points */}
                  {points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="white"
                      stroke="var(--primary)"
                      strokeWidth="2"
                      className="cursor-pointer hover:r-5 transition-all"
                    />
                  ))}
                </>
              )}

              {/* X Axis labels */}
              {points.map((p, i) => (
                <text
                  key={i}
                  x={p.x}
                  y={chartHeight - paddingBottom + 16}
                  textAnchor="middle"
                  className="text-[10px] fill-muted-foreground font-medium"
                >
                  {p.label}
                </text>
              ))}
            </svg>

            {/* Empty state overlay inside chart */}
            {isChartEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/30 backdrop-blur-[0.5px]">
                <MessageSquare className="w-8 h-8 text-gray-300 mb-1" />
                <p className="text-xs text-muted-foreground font-medium">No activity data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-950">Rating Distribution</h2>
            <p className="text-sm text-muted-foreground">Breakdown of star ratings</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-3 relative min-h-[200px] p-2 bg-gray-50/50 border rounded-lg">
            {ratingDistribution.totalRated > 0 ? (
              [5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars];
                const pct = ratingDistribution.totalRated > 0 ? (count / ratingDistribution.totalRated) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-sm">
                    {/* Stars Label */}
                    <div className="flex items-center gap-1 w-12 justify-end shrink-0">
                      <span className="font-semibold text-gray-800 text-xs">{stars}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 shrink-0" />
                    </div>
                    {/* Progress Bar Container */}
                    <div className="flex-1 h-3.5 bg-gray-200 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Percent/Count label */}
                    <div className="w-16 text-right text-xs font-semibold text-gray-600 shrink-0">
                      {count} ({Math.round(pct)}%)
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Star className="w-8 h-8 text-gray-300 mb-1 grayscale" />
                <p className="text-xs text-muted-foreground font-medium">No reviews received yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
