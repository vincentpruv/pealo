"use client";

import { useState, useEffect, Suspense } from "react";
import { MessageSquare, ArrowLeft, Folder, ChevronRight, X } from "lucide-react";
import { GradientStar } from "@/components/GradientStar";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const STATUS_BADGES = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABELS = {
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function FeedbacksPageContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("projectId");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // stores project object
  const [feedbacks, setFeedbacks] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({ ratings: [], statuses: [] });
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // AI Insights state
  const [insightsOpenMap, setInsightsOpenMap] = useState({});
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [cachedInsights, setCachedInsights] = useState({});
  const [insightsError, setInsightsError] = useState(null);

  const insights = selectedProject ? cachedInsights[selectedProject._id] : null;
  const insightsOpen = selectedProject
    ? (insightsOpenMap[selectedProject._id] !== undefined
        ? insightsOpenMap[selectedProject._id]
        : !!insights)
    : false;

  const setInsightsOpen = (val) => {
    if (!selectedProject) return;
    setInsightsOpenMap((prev) => ({
      ...prev,
      [selectedProject._id]: val,
    }));
  };

  console.log("DEBUG [FeedbacksPage]:", {
    selectedProjectId: selectedProject?._id,
    cachedInsights,
    insights,
    insightsOpen,
  });

  // 1. Fetch user projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);

          // Populate cachedInsights from projects that have them in the DB
          const initialInsights = {};
          data.forEach((p) => {
            if (p.aiInsights) {
              initialInsights[p._id] = p.aiInsights;
            }
          });
          setCachedInsights(initialInsights);

          if (preselectedId) {
            const found = data.find((p) => p._id === preselectedId);
            if (found) setSelectedProject(found);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, [preselectedId]);

  // 2. Fetch feedbacks when project is selected or filters change
  useEffect(() => {
    if (selectedProject) {
      loadFeedbacks();
    }
  }, [selectedProject, filters, pagination.page]);

  async function loadFeedbacks() {
    setLoadingFeedbacks(true);
    try {
      const params = new URLSearchParams();
      params.set("projectId", selectedProject._id);
      params.set("page", pagination.page.toString());
      params.set("limit", "20");
      if (filters.ratings && filters.ratings.length > 0) {
        params.set("ratings", filters.ratings.join(","));
      }
      if (filters.statuses && filters.statuses.length > 0) {
        params.set("statuses", filters.statuses.join(","));
      }

      const res = await fetch(`/api/feedbacks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data.feedbacks || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        }));
      }
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
    } finally {
      setLoadingFeedbacks(false);
    }
  }

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [key]: updated,
      };
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getFavicon = (domain) => {
    if (!domain) return null;
    const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    return `https://${clean}/favicon.ico`;
  };

  const fetchInsights = async () => {
    if (!selectedProject) return;
    setInsightsLoading(true);
    setInsightsError(null);
    setInsightsOpen(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInsightsError(data.error || "Something went wrong");
        return;
      }
      setCachedInsights((prev) => ({
        ...prev,
        [selectedProject._id]: data,
      }));
    } catch (err) {
      console.error("Failed to fetch insights:", err);
      setInsightsError("Failed to connect. Please try again.");
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loadingProjects) {
    return null;
  }

  // --- Step 1: No project selected yet ---
  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inbox</h1>
          <p className="text-muted-foreground">Select a widget first to view the feedbacks received</p>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => setSelectedProject(project)}
                className="group flex items-center justify-between rounded-xl border bg-card text-left p-6 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 border flex items-center justify-center shrink-0 overflow-hidden relative">
                    <Folder className="w-5 h-5 text-gray-400 absolute" />
                    {project.domain && (
                      <img
                        src={getFavicon(project.domain)}
                        alt="Project favicon"
                        className="w-6 h-6 object-contain relative z-10 bg-gray-50"
                        onError={(e) => {
                          if (!e.target.src.includes("google.com")) {
                            const clean = project.domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
                            e.target.src = `https://www.google.com/s2/favicons?sz=64&domain=${clean}`;
                          } else {
                            e.target.style.display = "none";
                          }
                        }}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-semibold text-gray-950 truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{project.domain || "No domain set"}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-sm">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No widgets configured</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
              You must create a widget before you can collect and view feedbacks.
            </p>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Create a widget
            </Link>
          </div>
        )}
      </div>
    );
  }

  // --- Step 2: Project selected, show feedbacks ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => {
              setSelectedProject(null);
              setFeedbacks([]);
              setFilters({ ratings: [], statuses: [] });
              setInsightsError(null);
            }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to widgets
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{selectedProject.name}</h1>
            <span className="text-sm text-muted-foreground bg-gray-100 border px-2 py-0.5 rounded-md">
              Inbox
            </span>
          </div>
          <p className="text-muted-foreground mt-1">
            Feedbacks from {selectedProject.domain || "no domain configured"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`/api/feedbacks/export?projectId=${selectedProject._id}&format=csv`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Export CSV
          </a>
          <a
            href={`/api/feedbacks/export?projectId=${selectedProject._id}&format=json`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Export JSON
          </a>
          <div className="w-px h-5 bg-border mx-1 self-center" />
          <button
            onClick={() => {
              if (insights) {
                setInsightsOpen(!insightsOpen);
              } else {
                fetchInsights();
              }
            }}
            disabled={insightsLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all h-9 px-4 py-2 border-2 border-primary cursor-pointer ${
              insightsOpen
                ? "bg-primary text-white hover:bg-primary/95"
                : "bg-primary/5 text-primary hover:bg-primary/10 disabled:opacity-60"
            }`}
          >
            {insightsLoading 
              ? "Analyzing..." 
              : insights 
                ? (insightsOpen ? "Hide AI Insights" : "View AI Insights") 
                : "AI Insights"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
            filters.ratings.length === 0 && filters.statuses.length === 0
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground hover:bg-secondary border-border"
          }`}
          onClick={() => setFilters({ ratings: [], statuses: [] })}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map((stars) => {
          const isSelected = filters.ratings.includes(stars.toString());
          return (
            <button
              key={stars}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border flex items-center gap-1 transition-all ${
                isSelected
                  ? "bg-primary/10 text-primary border-primary/40 ring-1 ring-primary/20 shadow-xs"
                  : "bg-background text-muted-foreground hover:bg-secondary hover:text-foreground border-border"
              }`}
              onClick={() => toggleFilter("ratings", stars.toString())}
            >
              <div className="flex">
                {Array(stars)
                  .fill(0)
                  .map((_, i) => (
                    <GradientStar key={i} className="size-3.5" />
                  ))}
                {Array(5 - stars)
                  .fill(0)
                  .map((_, i) => (
                    <GradientStar key={`empty-${i}`} className="size-3.5 opacity-30 grayscale" />
                  ))}
              </div>
            </button>
          );
        })}
        <div className="flex-1 min-w-[20px]" />
        {["new", "in_progress", "resolved"].map((status) => {
          const isSelected = filters.statuses.includes(status);
          return (
            <button
              key={status}
              className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-all ${
                isSelected
                  ? "bg-primary/10 text-primary border-primary/40 ring-1 ring-primary/20 shadow-xs font-semibold"
                  : "bg-background text-muted-foreground hover:bg-secondary hover:text-foreground border-border"
              }`}
              onClick={() => toggleFilter("statuses", status)}
            >
              {STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      {/* AI Insights Panel */}
      {insightsOpen && (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">AI Insights</h3>
                {insights && (
                  <p className="text-xs text-muted-foreground">{insights.analyzedCount} feedbacks analyzed</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {insights && !insightsLoading && (
                <button
                  onClick={fetchInsights}
                  className="text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/5 px-2.5 py-1.5 rounded-md border border-primary/20 transition-all cursor-pointer mr-1"
                >
                  Re-analyze
                </button>
              )}
              <button
                onClick={() => setInsightsOpen(false)}
                className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-6">
            {/* Loading State */}
            {insightsLoading && (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded-full w-3/4"></div>
                <div className="h-4 bg-gray-100 rounded-full w-1/2"></div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                  <div className="h-20 bg-gray-100 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="h-28 bg-gray-50 rounded-xl border"></div>
                  <div className="h-28 bg-gray-50 rounded-xl border"></div>
                </div>
                <p className="text-center text-sm text-primary font-medium pt-2">AI is analyzing your feedbacks...</p>
              </div>
            )}

            {/* Error State */}
            {insightsError && !insightsLoading && (
              <div className="text-center py-6">
                <div className="text-3xl mb-3">⚠️</div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Could not generate insights</p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">{insightsError}</p>
                <button
                  onClick={fetchInsights}
                  className="mt-4 text-xs font-semibold text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results */}
            {insights && !insightsLoading && !insightsError && (
              <div className="space-y-6">
                {/* Summary */}
                <p className="text-sm text-gray-700 leading-relaxed">{insights.insights.summary}</p>

                {/* Sentiment Analysis Card */}
                <div className="rounded-xl bg-white border p-5 shadow-xs space-y-4">
                  <h4 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">
                    📊 Sentiment Analysis
                  </h4>
                  
                  {/* Segmented Progress Bar */}
                  <div className="h-3.5 w-full rounded-full flex overflow-hidden bg-gray-100">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${insights.insights.sentiment.positive}%` }} 
                      title={`Positive: ${insights.insights.sentiment.positive}%`} 
                    />
                    <div 
                      className="h-full bg-gray-300 transition-all duration-500" 
                      style={{ width: `${insights.insights.sentiment.neutral}%` }} 
                      title={`Neutral: ${insights.insights.sentiment.neutral}%`} 
                    />
                    <div 
                      className="h-full bg-red-400 transition-all duration-500" 
                      style={{ width: `${insights.insights.sentiment.negative}%` }} 
                      title={`Negative: ${insights.insights.sentiment.negative}%`} 
                    />
                  </div>

                  {/* Columns */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="space-y-0.5">
                      <div className="text-xl font-extrabold text-emerald-600">{insights.insights.sentiment.positive}%</div>
                      <div className="text-xs font-semibold text-gray-500 flex items-center justify-center gap-1">😊 Positive</div>
                    </div>
                    <div className="space-y-0.5 border-x border-gray-100">
                      <div className="text-xl font-extrabold text-gray-500">{insights.insights.sentiment.neutral}%</div>
                      <div className="text-xs font-semibold text-gray-400 flex items-center justify-center gap-1">😐 Neutral</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xl font-extrabold text-red-500">{insights.insights.sentiment.negative}%</div>
                      <div className="text-xs font-semibold text-gray-500 flex items-center justify-center gap-1">😞 Negative</div>
                    </div>
                  </div>
                </div>

                {/* Top Issues & Top Requests */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Top Issues */}
                  <div className="rounded-xl bg-white border p-5 shadow-xs">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-base">🐛</span> Top Issues
                    </h4>
                    {insights.insights.topIssues?.length > 0 ? (
                      <ul className="space-y-2.5">
                        {insights.insights.topIssues.map((issue, i) => (
                          <li key={i} className="flex items-start justify-between gap-2">
                            <span className="text-sm text-gray-700">{issue.title}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                issue.severity === "high" ? "bg-red-100 text-red-700" :
                                issue.severity === "medium" ? "bg-amber-100 text-amber-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>{issue.severity}</span>
                              <span className="text-xs text-muted-foreground font-medium">×{issue.count}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No issues detected 🎉</p>
                    )}
                  </div>

                  {/* Top Requests */}
                  <div className="rounded-xl bg-white border p-5 shadow-xs">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-base">💡</span> Top Requests
                    </h4>
                    {insights.insights.topRequests?.length > 0 ? (
                      <ul className="space-y-2.5">
                        {insights.insights.topRequests.map((req, i) => (
                          <li key={i} className="flex items-start justify-between gap-2">
                            <span className="text-sm text-gray-700">{req.title}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                req.priority === "high" ? "bg-primary/15 text-primary" :
                                req.priority === "medium" ? "bg-blue-100 text-blue-700" :
                                "bg-gray-100 text-gray-600"
                              }`}>{req.priority}</span>
                              <span className="text-xs text-muted-foreground font-medium">×{req.count}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No feature requests detected</p>
                    )}
                  </div>
                </div>

                {/* Action Items */}
                {insights.insights.actionItems?.length > 0 && (
                  <div className="rounded-xl bg-white border p-5 shadow-xs">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-base">🎯</span> Recommended Actions
                    </h4>
                    <ol className="space-y-2.5">
                      {insights.insights.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          <div className="flex-1">
                            <span className="text-sm text-gray-700">{item.action}</span>
                            <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.impact === "high" ? "bg-emerald-100 text-emerald-700" :
                              item.impact === "medium" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>{item.impact} impact</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback List */}
      {loadingFeedbacks ? (
        <div className="py-12 text-center text-muted-foreground">Loading feedbacks...</div>
      ) : feedbacks.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            {feedbacks.map((feedback) => (
              <Link
                key={feedback._id}
                href={`/dashboard/feedbacks/${feedback._id}`}
                className="group block rounded-xl border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {feedback.rating !== undefined && feedback.rating !== null ? (
                      <div className="flex">
                        {Array(feedback.rating)
                          .fill(0)
                          .map((_, i) => (
                            <GradientStar key={i} className="size-4" />
                          ))}
                        {Array(5 - feedback.rating)
                          .fill(0)
                          .map((_, i) => (
                            <GradientStar key={`e-${i}`} className="size-4 opacity-30 grayscale" />
                          ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 border">
                        {feedback.type || "Other"}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        STATUS_BADGES[feedback.status] || STATUS_BADGES.new
                      }`}
                    >
                      {STATUS_LABELS[feedback.status] || "New"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {timeAgo(feedback.createdAt)}
                  </span>
                </div>

                <p className={`text-sm mb-4 line-clamp-2 ${!feedback.message ? "italic text-muted-foreground" : "text-gray-700"}`}>
                  {feedback.message || "No comment left"}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {feedback.metadata?.url && (
                    <span className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded">
                      <span className="truncate max-w-[200px]">{feedback.metadata.url}</span>
                    </span>
                  )}
                  {feedback.screenshot && (
                    <span className="flex items-center gap-1 font-medium">📷 Screenshot</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <button
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:pointer-events-none"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-secondary disabled:opacity-50 disabled:pointer-events-none"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No feedbacks yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Feedbacks will appear here once users submit them through your widget.
          </p>
        </div>
      )}
    </div>
  );
}

export default function FeedbacksPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">Loading inbox...</div>}>
      <FeedbacksPageContent />
    </Suspense>
  );
}
