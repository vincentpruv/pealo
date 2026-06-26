"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Folder, 
  ChevronRight, 
  ArrowLeft, 
  Clock, 
  Move, 
  LogOut, 
  Ban, 
  Globe, 
  Check, 
  AlertCircle,
  X,
  Plus,
  Target
} from "lucide-react";
import { PealoButton } from "@/components/ui/PealoButton";

function EventsPageContent() {
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("projectId");

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const isFirstRender = useRef(true);
  const [savedStatus, setSavedStatus] = useState("saved"); // "saving" | "saved" | "error"

  // New triggers array state
  const [triggers, setTriggers] = useState([]);
  
  // Temporary states for text inputs of target pages for each trigger type
  const [triggerInputPaths, setTriggerInputPaths] = useState({
    time: "",
    scroll: "",
    exit_intent: "",
    element: ""
  });

  const handleToggleTrigger = (type) => {
    if (type === "none") {
      setTriggers([]);
      return;
    }
    setTriggers(prev => {
      const exists = prev.some(t => t.type === type);
      if (exists) {
        return prev.filter(t => t.type !== type);
      } else {
        let defaultValue = "";
        if (type === "time") defaultValue = "5";
        if (type === "scroll") defaultValue = "50";
        if (type === "element") defaultValue = "#pricing";
        return [...prev, { type, value: defaultValue, pages: "" }];
      }
    });
  };

  const handleUpdateTriggerField = (type, field, val) => {
    setTriggers(prev => prev.map(t => t.type === type ? { ...t, [field]: val } : t));
  };

  const handleAddTriggerPath = (type) => {
    const rawInput = triggerInputPaths[type] || "";
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const newPaths = trimmed.split(",").map(p => p.trim()).filter(Boolean);
    const trigger = triggers.find(tr => tr.type === type);
    if (!trigger) return;

    const existingPaths = trigger.pages
      ? trigger.pages.split(",").map(p => p.trim()).filter(Boolean)
      : [];

    const updated = [...existingPaths];
    newPaths.forEach(np => {
      let formatted = np;
      if (!formatted.startsWith("/") && !formatted.startsWith("http") && formatted !== "*") {
        formatted = "/" + formatted;
      }
      if (!updated.includes(formatted)) {
        updated.push(formatted);
      }
    });

    handleUpdateTriggerField(type, "pages", updated.join(", "));
    setTriggerInputPaths(prev => ({ ...prev, [type]: "" }));
  };

  const handleRemoveTriggerPath = (type, idxToRemove) => {
    const trigger = triggers.find(tr => tr.type === type);
    if (!trigger) return;

    const existingPaths = trigger.pages
      ? trigger.pages.split(",").map(p => p.trim()).filter(Boolean)
      : [];

    const updated = existingPaths.filter((_, idx) => idx !== idxToRemove);
    handleUpdateTriggerField(type, "pages", updated.join(", "));
  };

  // 1. Fetch user projects on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
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

  // 2. Sync form states when selected project changes
  useEffect(() => {
    if (selectedProject) {
      isFirstRender.current = true;
      const config = selectedProject.widgetConfig || {};
      
      const loadedTriggers = config.triggers && config.triggers.length > 0
        ? config.triggers
        : (() => {
            if (config.autoOpenTrigger && config.autoOpenTrigger !== "none") {
              const types = config.autoOpenTrigger.split(",").map(t => t.trim()).filter(Boolean);
              return types.map(t => {
                let value = "";
                if (t === "time" || t === "scroll") {
                  value = String(config.autoOpenValue !== undefined ? config.autoOpenValue : 5);
                } else if (t === "element") {
                  value = config.autoOpenSelector || "";
                }
                return {
                  type: t,
                  value,
                  pages: config.autoOpenPages || ""
                };
              });
            }
            return [];
          })();

      setTriggers(loadedTriggers);
      setSavedStatus("saved");
    }
  }, [selectedProject]);

  const saveTriggers = async () => {
    if (!selectedProject) return;
    setSavedStatus("saving");

    // Maintain legacy fields for backwards compatibility/graceful degradation
    const autoOpenTrigger = triggers.length === 0 ? "none" : triggers.map(t => t.type).join(",");
    const firstNumericTrigger = triggers.find(t => t.type === "time" || t.type === "scroll");
    const autoOpenValue = firstNumericTrigger ? (Number(firstNumericTrigger.value) || 5) : 5;
    const firstElementTrigger = triggers.find(t => t.type === "element");
    const autoOpenSelector = firstElementTrigger ? firstElementTrigger.value : "";
    const autoOpenPages = triggers.length > 0 ? triggers[0].pages : "";

    const updatedConfig = {
      ...(selectedProject.widgetConfig || {}),
      autoOpenTrigger,
      autoOpenValue,
      autoOpenSelector,
      autoOpenPages,
      triggers,
    };

    try {
      const res = await fetch(`/api/projects/${selectedProject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetConfig: updatedConfig }),
      });

      if (res.ok) {
        const updatedProject = await res.json();
        setProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p));
        setSelectedProject(updatedProject);
        setSavedStatus("saved");
      } else {
        setSavedStatus("error");
      }
    } catch (err) {
      console.error("Failed to save events:", err);
      setSavedStatus("error");
    }
  };

  // 3. Debounced Autosave
  useEffect(() => {
    if (!selectedProject) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveTriggers();
    }, 600);

    return () => clearTimeout(timer);
  }, [triggers]);

  const getFavicon = (domain) => {
    if (!domain) return null;
    const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    return `https://icons.duckduckgo.com/ip3/${clean}.ico`;
  };


  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- Step 1: No project selected yet ---
  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events ⚡</h1>
          <p className="text-muted-foreground">Select a widget to configure its automatic opening events</p>
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
                        className="w-full h-full object-contain p-1.5 relative z-10 bg-gray-50"
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
              You must create a widget before you can configure events.
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- Step 2: Project selected, show event configuration form ---
  return (
    <div className="space-y-6 w-full">
      <div>
        <button
          onClick={() => {
            setSelectedProject(null);
          }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to widgets
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Events for {selectedProject.name}</h1>
          <div className="flex items-center text-xs font-semibold">
            {savedStatus === "error" && (
              <span className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" /> Error saving
              </span>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-1">
          Configure how and when the feedback widget pops up automatically for your users.
        </p>
      </div>      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Trigger Type Selection */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Select Event Trigger</h2>
            <p className="text-sm text-muted-foreground">Choose what event triggers the widget popup</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left Column: Triggers Selection (2/3 width) */}
            <div className="p-6 md:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* None */}
                <label className={`flex gap-4 p-4 rounded-xl border cursor-pointer hover:bg-gray-50/30 transition-all ${
                  triggers.length === 0 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="checkbox"
                    name="autoOpenTrigger"
                    value="none"
                    checked={triggers.length === 0}
                    onChange={() => handleToggleTrigger("none")}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-lg bg-gray-100 border flex items-center justify-center shrink-0">
                    <Ban className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm text-gray-900">None (Manual only)</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      The widget will only open when the floating button is manually clicked.
                    </span>
                  </div>
                </label>

                {/* Time Delay */}
                <label className={`flex gap-4 p-4 rounded-xl border cursor-pointer hover:bg-gray-50/30 transition-all ${
                  triggers.some(t => t.type === "time") 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="checkbox"
                    name="autoOpenTrigger"
                    value="time"
                    checked={triggers.some(t => t.type === "time")}
                    onChange={() => handleToggleTrigger("time")}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm text-gray-900">Time Delay</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Automatically open the widget after the user spends some time on the page.
                    </span>
                  </div>
                </label>

                {/* Scroll Depth */}
                <label className={`flex gap-4 p-4 rounded-xl border cursor-pointer hover:bg-gray-50/30 transition-all ${
                  triggers.some(t => t.type === "scroll") 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="checkbox"
                    name="autoOpenTrigger"
                    value="scroll"
                    checked={triggers.some(t => t.type === "scroll")}
                    onChange={() => handleToggleTrigger("scroll")}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                    <Move className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm text-gray-900">Scroll Depth</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Open the widget when the user scrolls down a specific portion of the page.
                    </span>
                  </div>
                </label>

                {/* Exit Intent */}
                <label className={`flex gap-4 p-4 rounded-xl border cursor-pointer hover:bg-gray-50/30 transition-all ${
                  triggers.some(t => t.type === "exit_intent") 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="checkbox"
                    name="autoOpenTrigger"
                    value="exit_intent"
                    checked={triggers.some(t => t.type === "exit_intent")}
                    onChange={() => handleToggleTrigger("exit_intent")}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5 text-orange-600 rotate-270" />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm text-gray-900">Exit Intent</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Trigger widget when the cursor moves to exit the browser tab (prevent churn).
                    </span>
                  </div>
                </label>

                {/* Element Selector */}
                <label className={`flex gap-4 p-4 rounded-xl border cursor-pointer hover:bg-gray-50/30 transition-all ${
                  triggers.some(t => t.type === "element") 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="checkbox"
                    name="autoOpenTrigger"
                    value="element"
                    checked={triggers.some(t => t.type === "element")}
                    onChange={() => handleToggleTrigger("element")}
                    className="sr-only"
                  />
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="block font-semibold text-sm text-gray-900">Element Selector</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      Trigger widget when a specific HTML element or CSS selector becomes visible.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Right Column: Settings Panel (1/3 width) */}
            <div className="p-6 md:col-span-1 bg-gray-50/30 flex flex-col justify-start gap-6 overflow-y-auto max-h-[580px] min-h-[220px]">
              {triggers.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground my-auto">
                  <Ban className="w-8 h-8 text-gray-300 mb-2.5" />
                  <span className="font-semibold text-sm text-gray-900">No Auto-Open</span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                    The widget will only open when your users manually click the floating bubble button.
                  </p>
                </div>
              )}

              {/* Time Delay Config */}
              {triggers.map((tr) => {
                const paths = tr.pages
                  ? tr.pages.split(",").map((p) => p.trim()).filter(Boolean)
                  : [];

                return (
                  <div key={tr.type} className="space-y-4 rounded-xl border bg-white p-5 shadow-2xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-sm text-gray-900 flex items-center gap-1.5 capitalize">
                        {tr.type === "time" && <><Clock className="w-4 h-4 text-blue-600" /> Time Delay</>}
                        {tr.type === "scroll" && <><Move className="w-4 h-4 text-purple-600" /> Scroll Depth</>}
                        {tr.type === "exit_intent" && <><LogOut className="w-4 h-4 text-orange-500 rotate-270" /> Exit Intent</>}
                        {tr.type === "element" && <><Target className="w-4 h-4 text-emerald-600" /> Element Selector</>}
                      </span>
                    </div>

                    {/* Trigger Value Inputs */}
                    {tr.type === "time" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Delay (seconds)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="300"
                            value={tr.value || "5"}
                            onChange={(e) => handleUpdateTriggerField("time", "value", e.target.value)}
                            className="w-24 px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <span className="text-xs text-muted-foreground">seconds</span>
                        </div>
                      </div>
                    )}

                    {tr.type === "scroll" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Scroll Depth (%)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="5"
                            max="100"
                            value={tr.value || "50"}
                            onChange={(e) => handleUpdateTriggerField("scroll", "value", e.target.value)}
                            className="w-24 px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <span className="text-xs text-muted-foreground">% scrolled</span>
                        </div>
                      </div>
                    )}

                    {tr.type === "element" && (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">CSS Selector</label>
                        <input
                          type="text"
                          placeholder="e.g. #pricing, .cta-btn, footer"
                          value={tr.value || ""}
                          onChange={(e) => handleUpdateTriggerField("element", "value", e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400"
                        />
                      </div>
                    )}

                    {/* Per-Trigger Target Pages */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-gray-400" /> Target Pages (Optional)
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={triggerInputPaths[tr.type] || ""}
                          onChange={(e) => setTriggerInputPaths(prev => ({ ...prev, [tr.type]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTriggerPath(tr.type);
                            }
                          }}
                          placeholder="e.g. /pricing (Press Enter)"
                          className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTriggerPath(tr.type)}
                          disabled={!(triggerInputPaths[tr.type] || "").trim()}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
                        >
                          Add
                        </button>
                      </div>

                      {paths.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {paths.map((path, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border text-[11px] font-medium text-gray-800"
                            >
                              <span>{path}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTriggerPath(tr.type, idx)}
                                className="text-gray-400 hover:text-rose-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="block text-[11px] text-amber-600 bg-amber-50/50 border border-amber-100/50 rounded-lg p-2 mt-1">
                          Runs on <strong>all pages</strong> of your website.
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  );
}
