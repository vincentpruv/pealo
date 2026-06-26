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
  Plus
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

  // Form states
  const [autoOpenTrigger, setAutoOpenTrigger] = useState("none");
  const [autoOpenValue, setAutoOpenValue] = useState(5);
  const [autoOpenPages, setAutoOpenPages] = useState("");
  const [inputPath, setInputPath] = useState("");

  const paths = autoOpenPages
    ? autoOpenPages.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const handleAddPath = () => {
    const trimmed = inputPath.trim();
    if (!trimmed) return;
    
    // Support comma-separated paste
    const newPaths = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    const updated = [...paths];
    
    newPaths.forEach((np) => {
      let formatted = np;
      // Auto prepending "/" for standard paths
      if (!formatted.startsWith("/") && !formatted.startsWith("http") && formatted !== "*") {
        formatted = "/" + formatted;
      }
      if (!updated.includes(formatted)) {
        updated.push(formatted);
      }
    });
    
    setAutoOpenPages(updated.join(", "));
    setInputPath("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPath();
    }
  };

  const handleRemovePath = (indexToRemove) => {
    const updated = paths.filter((_, idx) => idx !== indexToRemove);
    setAutoOpenPages(updated.join(", "));
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
      setAutoOpenTrigger(config.autoOpenTrigger || "none");
      setAutoOpenValue(config.autoOpenValue !== undefined ? config.autoOpenValue : 5);
      setAutoOpenPages(config.autoOpenPages || "");
      setSavedStatus("saved");
    }
  }, [selectedProject]);

  const saveTriggers = async () => {
    if (!selectedProject) return;
    setSavedStatus("saving");

    const updatedConfig = {
      ...(selectedProject.widgetConfig || {}),
      autoOpenTrigger,
      autoOpenValue: Number(autoOpenValue) || 0,
      autoOpenPages,
    };

    try {
      const res = await fetch(`/api/projects/${selectedProject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetConfig: updatedConfig }),
      });

      if (res.ok) {
        const updatedProject = await res.json();
        // Update list
        setProjects(prev => prev.map(p => p._id === updatedProject._id ? updatedProject : p));
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
  }, [autoOpenTrigger, autoOpenValue, autoOpenPages]);

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
                  autoOpenTrigger === "none" 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="radio"
                    name="autoOpenTrigger"
                    value="none"
                    checked={autoOpenTrigger === "none"}
                    onChange={(e) => setAutoOpenTrigger(e.target.value)}
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
                  autoOpenTrigger === "time" 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="radio"
                    name="autoOpenTrigger"
                    value="time"
                    checked={autoOpenTrigger === "time"}
                    onChange={(e) => setAutoOpenTrigger(e.target.value)}
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
                  autoOpenTrigger === "scroll" 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="radio"
                    name="autoOpenTrigger"
                    value="scroll"
                    checked={autoOpenTrigger === "scroll"}
                    onChange={(e) => setAutoOpenTrigger(e.target.value)}
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
                  autoOpenTrigger === "exit_intent" 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border bg-white"
                }`}>
                  <input
                    type="radio"
                    name="autoOpenTrigger"
                    value="exit_intent"
                    checked={autoOpenTrigger === "exit_intent"}
                    onChange={(e) => setAutoOpenTrigger(e.target.value)}
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
              </div>
            </div>

            {/* Right Column: Settings Panel (1/3 width) */}
            <div className="p-6 md:col-span-1 bg-gray-50/30 flex flex-col justify-center min-h-[220px]">
              {autoOpenTrigger === "none" && (
                <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                  <Ban className="w-8 h-8 text-gray-300 mb-2.5" />
                  <span className="font-semibold text-sm text-gray-900">No Auto-Open</span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                    The widget will only open when your users manually click the floating bubble button.
                  </p>
                </div>
              )}

              {autoOpenTrigger === "exit_intent" && (
                <div className="flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                  <LogOut className="w-8 h-8 text-orange-400 mb-2.5 rotate-270" />
                  <span className="font-semibold text-sm text-gray-900">Exit Intent Trigger</span>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px] leading-relaxed">
                    Widget appears automatically when the user moves their mouse to leave the tab.
                  </p>
                </div>
              )}

              {autoOpenTrigger === "time" && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-gray-900 block">Time Delay</span>
                    <span className="text-xs text-muted-foreground block">Adjust the delay before opening the popup</span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Delay (seconds)</label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={autoOpenValue}
                        onChange={(e) => setAutoOpenValue(e.target.value)}
                        className="w-24 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <span className="text-sm text-muted-foreground">seconds</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The widget will appear automatically <strong>{autoOpenValue || 5} seconds</strong> after the page loads.
                  </p>
                </div>
              )}

              {autoOpenTrigger === "scroll" && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-gray-900 block">Scroll Depth</span>
                    <span className="text-xs text-muted-foreground block">Adjust how far down the user must scroll</span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Scroll Depth (%)</label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={autoOpenValue}
                        onChange={(e) => setAutoOpenValue(e.target.value)}
                        className="w-24 px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <span className="text-sm text-muted-foreground">% scrolled</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The widget will pop up once the visitor scrolls past <strong>{autoOpenValue || 50}%</strong> of the page height.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Targeting Options */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Target Specific Pages (Optional)</h2>
            <p className="text-sm text-muted-foreground">Control on which pages the auto-open behavior is active</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-gray-400" /> Page Paths
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputPath}
                    onChange={(e) => setInputPath(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. /pricing (press Enter to add)"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPath}
                  disabled={!inputPath.trim()}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              
              {/* Active paths tags/chips */}
              {paths.length > 0 ? (
                <div className="space-y-2 pt-2">
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Pages List ({paths.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {paths.map((path, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border text-sm font-medium text-gray-800 transition-colors group shadow-2xs"
                      >
                        <span>{path}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePath(idx)}
                          className="text-gray-400 hover:text-rose-600 transition-colors p-0.5 rounded-md hover:bg-rose-50"
                          title="Remove path"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-xs text-amber-600 bg-amber-50/50 border border-amber-200/50 rounded-lg p-3 pt-2">
                  <Globe className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>No paths configured. The auto-open trigger will run on <strong>all pages</strong> of your website.</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                Press Enter to add path. You can use wildcards at the end of paths (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">/docs/*</code>).
              </p>
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
