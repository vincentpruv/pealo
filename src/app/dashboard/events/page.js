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

  const DEFAULT_TRIGGERS = [
    { type: "time", value: "5", pages: "", active: false },
    { type: "scroll", value: "50", pages: "", active: false },
    { type: "exit_intent", value: "", pages: "", active: false },
    { type: "element", value: "#pricing", pages: "", active: false }
  ];

  const handleToggleTrigger = (type) => {
    setTriggers(prev => prev.map(t => t.type === type ? { ...t, active: !t.active } : t));
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

  const [triggerInputSelector, setTriggerInputSelector] = useState("");

  const handleAddSelector = () => {
    const trimmed = triggerInputSelector.trim();
    if (!trimmed) return;

    const newSelectors = trimmed.split(",").map(s => s.trim()).filter(Boolean);
    const trigger = triggers.find(tr => tr.type === "element");
    if (!trigger) return;

    const existingSelectors = trigger.value
      ? trigger.value.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const updated = [...existingSelectors];
    newSelectors.forEach(ns => {
      if (!updated.includes(ns)) {
        updated.push(ns);
      }
    });

    handleUpdateTriggerField("element", "value", updated.join(", "));
    setTriggerInputSelector("");
  };

  const handleRemoveSelector = (idxToRemove) => {
    const trigger = triggers.find(tr => tr.type === "element");
    if (!trigger) return;

    const existingSelectors = trigger.value
      ? trigger.value.split(",").map(s => s.trim()).filter(Boolean)
      : [];

    const updated = existingSelectors.filter((_, idx) => idx !== idxToRemove);
    handleUpdateTriggerField("element", "value", updated.join(", "));
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
      
      const configTriggers = config.triggers || [];
      const loadedTriggers = DEFAULT_TRIGGERS.map(def => {
        const found = configTriggers.find(t => t.type === def.type);
        if (found) {
          return {
            ...def,
            ...found,
            active: found.active !== undefined ? found.active : true
          };
        }
        
        // Migrate legacy single trigger config if present
        if (config.autoOpenTrigger && config.autoOpenTrigger !== "none") {
          const legacyTypes = config.autoOpenTrigger.split(",").map(t => t.trim()).filter(Boolean);
          if (legacyTypes.includes(def.type)) {
            let value = def.value;
            if (def.type === "time" || def.type === "scroll") {
              value = String(config.autoOpenValue !== undefined ? config.autoOpenValue : def.value);
            } else if (def.type === "element") {
              value = config.autoOpenSelector || def.value;
            }
            return {
              ...def,
              value,
              pages: config.autoOpenPages || "",
              active: true
            };
          }
        }
        
        return def;
      });

      setTriggers(loadedTriggers);
      setSavedStatus("saved");
    }
  }, [selectedProject]);

  const saveTriggers = async () => {
    if (!selectedProject) return;
    setSavedStatus("saving");

    const activeList = triggers.filter(t => t.active);
    const autoOpenTrigger = activeList.length === 0 ? "none" : activeList.map(t => t.type).join(",");
    const firstNumericTrigger = activeList.find(t => t.type === "time" || t.type === "scroll");
    const autoOpenValue = firstNumericTrigger ? (Number(firstNumericTrigger.value) || 5) : 5;
    const firstElementTrigger = activeList.find(t => t.type === "element");
    const autoOpenSelector = firstElementTrigger ? firstElementTrigger.value : "";
    const autoOpenPages = activeList.length > 0 ? activeList[0].pages : "";

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
        <div className="space-y-4">
          {triggers.map((tr) => {
            return (
              <div
                key={tr.type}
                className={`rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden transition-all duration-200 ${
                  tr.active
                    ? "border-primary bg-white ring-1 ring-primary/5"
                    : "border-border bg-gray-50/30"
                }`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-border bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`checkbox-${tr.type}`}
                      checked={tr.active}
                      onChange={() => handleToggleTrigger(tr.type)}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer transition-colors"
                    />
                    <label
                      htmlFor={`checkbox-${tr.type}`}
                      className="flex items-center gap-3 font-semibold text-sm sm:text-base text-gray-900 cursor-pointer select-none"
                    >
                      <span className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 bg-white shadow-2xs">
                        {tr.type === "time" && <Clock className="w-5 h-5 text-blue-600" />}
                        {tr.type === "scroll" && <Move className="w-5 h-5 text-purple-600" />}
                        {tr.type === "exit_intent" && <LogOut className="w-5 h-5 text-orange-500 rotate-270" />}
                        {tr.type === "element" && <Target className="w-5 h-5 text-emerald-600" />}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-gray-900">
                          {tr.type === "time" && "Time Delay"}
                          {tr.type === "scroll" && "Scroll Depth"}
                          {tr.type === "exit_intent" && "Exit Intent"}
                          {tr.type === "element" && "Element Selector"}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          {tr.type === "time" && "Automatically open the widget after the user spends some time on the page."}
                          {tr.type === "scroll" && "Open the widget when the user scrolls down a specific portion of the page."}
                          {tr.type === "exit_intent" && "Trigger widget when the cursor moves to exit the browser tab (prevent churn)."}
                          {tr.type === "element" && "Trigger widget when a specific HTML element or CSS selector becomes visible."}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div>
                    {tr.active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className={`p-5 transition-all duration-200 ${!tr.active ? "opacity-50" : ""}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trigger Value Inputs */}
                    <div className="space-y-4">
                      {tr.type === "time" && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Delay (seconds)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="300"
                              value={tr.value || "5"}
                              onChange={(e) => handleUpdateTriggerField("time", "value", e.target.value)}
                              disabled={!tr.active}
                              className="w-24 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600">seconds</span>
                          </div>
                        </div>
                      )}

                      {tr.type === "scroll" && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Scroll Depth (%)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="5"
                              max="100"
                              value={tr.value || "50"}
                              onChange={(e) => handleUpdateTriggerField("scroll", "value", e.target.value)}
                              disabled={!tr.active}
                              className="w-24 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
                            />
                            <span className="text-sm text-gray-600">% scrolled</span>
                          </div>
                        </div>
                      )}

                      {tr.type === "element" && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">CSS Selectors</label>
                          <div className="flex gap-2 max-w-md">
                            <input
                              type="text"
                              value={triggerInputSelector}
                              onChange={(e) => setTriggerInputSelector(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddSelector();
                                }
                              }}
                              disabled={!tr.active}
                              placeholder="e.g. #pricing, .cta-btn (Press Enter)"
                              className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={handleAddSelector}
                              disabled={!tr.active || !triggerInputSelector.trim()}
                              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 shrink-0"
                            >
                              Add
                            </button>
                          </div>

                          {(() => {
                            const selectors = tr.value
                              ? tr.value.split(",").map((s) => s.trim()).filter(Boolean)
                              : [];
                            return selectors.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {selectors.map((sel, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border text-xs font-medium text-gray-800"
                                  >
                                    <code className="text-xs">{sel}</code>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSelector(idx)}
                                      disabled={!tr.active}
                                      className="text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="block text-xs text-amber-600 bg-amber-50/50 border border-amber-100/50 rounded-lg p-2.5 mt-2 max-w-md">
                                Please add at least one CSS Selector to target.
                              </span>
                            );
                          })()}
                        </div>
                      )}

                      {tr.type === "exit_intent" && (
                        <div className="h-full flex items-center">
                          <p className="text-sm text-muted-foreground italic">
                            No additional configuration required for Exit Intent.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Per-Trigger Target Pages */}
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-gray-400" /> Target Pages (Optional)
                      </label>
                      <div className="flex gap-2 max-w-md">
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
                          disabled={!tr.active}
                          placeholder="e.g. /pricing (Press Enter)"
                          className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTriggerPath(tr.type)}
                          disabled={!tr.active || !(triggerInputPaths[tr.type] || "").trim()}
                          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 shrink-0"
                        >
                          Add
                        </button>
                      </div>

                      {(() => {
                        const paths = tr.pages
                          ? tr.pages.split(",").map((p) => p.trim()).filter(Boolean)
                          : [];
                        return paths.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {paths.map((path, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-50 border text-xs font-medium text-gray-800"
                              >
                                <span>{path}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTriggerPath(tr.type, idx)}
                                  disabled={!tr.active}
                                  className="text-gray-400 hover:text-rose-600 transition-colors disabled:opacity-40"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="block text-xs text-amber-600 bg-amber-50/50 border border-amber-100/50 rounded-lg p-2.5 mt-2 max-w-md">
                            Runs on <strong>all pages</strong> of your website.
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
