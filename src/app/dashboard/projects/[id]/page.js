"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Check, Save, Trash2, Settings, Code, Palette, X, Sliders, Plus, Globe } from "lucide-react";

function isDarkColor(hex) {
  if (!hex) return true;
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 < 128;
  }
  return true;
}

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("integration");
  const [copied, setCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({
    color: "#06AB78",
    position: "right",
    buttonText: "Send feedback",
    bgColor: "#ffffff",
    btnColorOpen: "#ffffff",
    title: "Send us your feedback",
    showSubtitle: true,
    subtitle: "We appreciate your thoughts and ideas.",
  });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRating, setPreviewRating] = useState(0);
  const [previewHoverRating, setPreviewHoverRating] = useState(0);
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewSubmitting, setPreviewSubmitting] = useState(false);
  const [previewSuccess, setPreviewSuccess] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const isFirstRender = useRef(true);
  const isFirstRenderWebhook = useRef(true);

  const [inputIncludePath, setInputIncludePath] = useState("");
  const [inputExcludePath, setInputExcludePath] = useState("");

  const includePathsList = widgetConfig.includePaths
    ? widgetConfig.includePaths.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const excludePathsList = widgetConfig.excludePaths
    ? widgetConfig.excludePaths.split(",").map((p) => p.trim()).filter(Boolean)
    : [];

  const handleAddIncludePath = () => {
    const trimmed = inputIncludePath.trim();
    if (!trimmed) return;
    const newPaths = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    const updated = [...includePathsList];
    newPaths.forEach((np) => {
      let formatted = np;
      if (!formatted.startsWith("/") && !formatted.startsWith("http") && formatted !== "*") {
        formatted = "/" + formatted;
      }
      if (!updated.includes(formatted)) {
        updated.push(formatted);
      }
    });
    setWidgetConfig((prev) => ({ ...prev, includePaths: updated.join(", ") }));
    setInputIncludePath("");
  };

  const handleAddExcludePath = () => {
    const trimmed = inputExcludePath.trim();
    if (!trimmed) return;
    const newPaths = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
    const updated = [...excludePathsList];
    newPaths.forEach((np) => {
      let formatted = np;
      if (!formatted.startsWith("/") && !formatted.startsWith("http") && formatted !== "*") {
        formatted = "/" + formatted;
      }
      if (!updated.includes(formatted)) {
        updated.push(formatted);
      }
    });
    setWidgetConfig((prev) => ({ ...prev, excludePaths: updated.join(", ") }));
    setInputExcludePath("");
  };

  const handleRemoveIncludePath = (indexToRemove) => {
    const updated = includePathsList.filter((_, idx) => idx !== indexToRemove);
    setWidgetConfig((prev) => ({ ...prev, includePaths: updated.join(", ") }));
  };

  const handleRemoveExcludePath = (indexToRemove) => {
    const updated = excludePathsList.filter((_, idx) => idx !== indexToRemove);
    setWidgetConfig((prev) => ({ ...prev, excludePaths: updated.join(", ") }));
  };


  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const verifyInstallation = async () => {
    setVerifying(true);
    setVerificationStatus(null);
    try {
      const res = await fetch(`/api/projects/${id}/verify`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationStatus(data);
      } else {
        setVerificationStatus({ installed: false, reason: "Could not verify" });
      }
    } catch (e) {
      console.error(e);
      setVerificationStatus({ installed: false, reason: "Connection failed" });
    } finally {
      setVerifying(false);
    }
  };

  const isDark = isDarkColor(widgetConfig.bgColor || "#ffffff");
  const isColorDark = isDarkColor(widgetConfig.color || "#06AB78");
  const isBtnOpenDark = isDarkColor(widgetConfig.btnColorOpen || "#ffffff");

  const textColorClass = isDark ? "text-white" : "text-gray-800";
  const titleColorClass = isDark ? "text-white" : "text-gray-900";
  const subtitleColorClass = isDark ? "text-[#6b7c85]" : "text-gray-500";
  const borderColorClass = isDark ? "border-white/5" : "border-gray-200";
  const textareaBorderClass = isDark ? "border-white/10" : "border-gray-200";
  const textareaBgClass = isDark ? "bg-white/5" : "bg-gray-50";
  const textareaPlaceholderClass = isDark ? "placeholder:text-[#4a5a63]" : "placeholder:text-gray-400";
  const starInactiveColor = isDark ? "#3e4e56" : "#D1D5DB";
  const footerBorderClass = isDark ? "border-white/5" : "border-gray-200";
  const footerLinkClass = isDark ? "text-emerald-400" : "text-primary";

  const submitBtnTextColor = isColorDark ? "#FFFFFF" : "#001E2B";
  const btnOpenTextColor = isBtnOpenDark ? "#FFFFFF" : "#1F2937";
  const btnNormalTextColor = isColorDark ? "#FFFFFF" : "#001E2B";

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data);
          if (data.widgetConfig) {
            setWidgetConfig(data.widgetConfig);
          }
          if (data.webhookUrl) {
            setWebhookUrl(data.webhookUrl);
          }
        }
      } catch (error) {
        console.error("Failed to load project:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const getSnippet = () => {
    const baseUrl = window.location.origin;
    return `<script src="${baseUrl}/widget/feedback-widget.js" data-api-key="${project?.apiKey}" defer></script>`;
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(project?.apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const saveWidgetConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ widgetConfig }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save widget config:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveWidgetConfig();
    }, 500);
    return () => clearTimeout(timer);
  }, [widgetConfig]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    if (isFirstRenderWebhook.current) {
      isFirstRenderWebhook.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveSettings();
    }, 500);
    return () => clearTimeout(timer);
  }, [webhookUrl]);

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
    if (previewRating === 0) return;
    setPreviewSubmitting(true);
    setTimeout(() => {
      setPreviewSubmitting(false);
      setPreviewSuccess(true);
      setTimeout(() => {
        setPreviewOpen(false);
        setPreviewRating(0);
        setPreviewMessage("");
        setPreviewSuccess(false);
      }, 2500);
    }, 1200);
  };

  const deleteProject = async () => {
    if (
      !confirm(
        "Are you sure? This will permanently delete this project and all its feedbacks."
      )
    )
      return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/projects");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading project details...</div>
    );
  }

  if (!project) {
    return (
      <div className="py-12 text-center text-muted-foreground">Project not found</div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to projects
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{project.name}</h1>
        <p className="text-muted-foreground">{project.domain || "No domain configured"}</p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-6">
          <button
            className={`pb-3 font-medium text-sm transition-colors relative ${
              activeTab === "integration" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("integration")}
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" /> Integration
            </div>
            {activeTab === "integration" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            className={`pb-3 font-medium text-sm transition-colors relative ${
              activeTab === "customize" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("customize")}
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" /> Customize
            </div>
            {activeTab === "customize" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            className={`pb-3 font-medium text-sm transition-colors relative ${
              activeTab === "rules" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("rules")}
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Rules
            </div>
            {activeTab === "rules" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
          <button
            className={`pb-3 font-medium text-sm transition-colors relative ${
              activeTab === "settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" /> Settings
            </div>
            {activeTab === "settings" && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>
      </div>

      <div className={activeTab === "customize" ? "max-w-5xl" : "max-w-3xl"}>
        {/* Integration Tab */}
        {activeTab === "integration" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">Install the widget</h3>
              <p className="text-sm text-muted-foreground">
                Add this single line of code before the closing <code>&lt;/body&gt;</code> tag of your website.
              </p>
              <div className="relative group rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-100 overflow-hidden">
                <pre className="overflow-x-auto pb-2 pr-12"><code className="text-emerald-400">{getSnippet()}</code></pre>
                <button
                  className="absolute top-3 right-3 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded border border-zinc-700 transition-colors"
                  onClick={copySnippet}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Verification Card */}
            <div className="rounded-xl border bg-card p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-semibold text-gray-950">Installation Status</h4>
                  <p className="text-xs text-muted-foreground">Verify if the widget script is active on your site.</p>
                </div>
                <button
                  onClick={verifyInstallation}
                  disabled={verifying}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 h-9 px-4 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {verifying ? "Checking..." : "Verify Installation"}
                </button>
              </div>

              {verificationStatus && (
                <div className={`p-4 rounded-lg flex ${verificationStatus.installed ? "items-center" : "items-start"} gap-3 border text-sm ${
                  verificationStatus.installed 
                    ? "bg-emerald-50/50 border-emerald-200 text-emerald-800" 
                    : "bg-amber-50/50 border-amber-200 text-amber-800"
                }`}>
                  <span className="text-lg leading-none flex items-center">{verificationStatus.installed ? "✅" : "⚠️"}</span>
                  <div className={verificationStatus.installed ? "flex items-center" : ""}>
                    <div className="font-semibold leading-none">
                      {verificationStatus.installed ? "Widget detected successfully!" : "Widget not detected"}
                    </div>
                    {!verificationStatus.installed && (
                      <p className="text-xs text-amber-700/95 mt-1">
                        Reason: {verificationStatus.reason}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold tracking-tight">API Key</h3>
              <p className="text-sm text-muted-foreground">
                Your unique project API key. Keep it safe.
              </p>
              <div
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-primary/40 hover:bg-gray-50/80 transition-all group select-none"
                onClick={copyApiKey}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-gray-700">API Key:</span>
                  <code className="font-mono text-sm text-gray-950 bg-white border border-gray-200/80 px-2 py-0.5 rounded-md select-all">
                    {project?.apiKey ? `${project.apiKey.substring(0, 10)} ... ${project.apiKey.substring(project.apiKey.length - 4)}` : ""}
                  </code>
                </div>
                <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  {keyCopied ? "✅ Copied!" : "📋 Click to copy"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Customize Tab */}
        {activeTab === "customize" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">Widget appearance</h3>
              <p className="text-sm text-muted-foreground">
                Customize how the feedback button looks on your site and preview it live.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Left Column: Controls */}
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-6 space-y-6">
                  {/* Colors */}
                  <div className="space-y-2 max-w-sm">
                    <label className="text-sm font-medium leading-none text-gray-900">Button color</label>
                    <div className="flex gap-3 items-center">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border shadow-sm shrink-0">
                        <input
                          type="color"
                          value={widgetConfig.color}
                          onChange={(e) => setWidgetConfig((prev) => ({ ...prev, color: e.target.value }))}
                          className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={widgetConfig.color}
                        onChange={(e) => setWidgetConfig((prev) => ({ ...prev, color: e.target.value }))}
                        className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background uppercase font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <label className="text-sm font-medium leading-none text-gray-900">Button color (when open)</label>
                    <div className="flex gap-3 items-center">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border shadow-sm shrink-0">
                        <input
                          type="color"
                          value={widgetConfig.btnColorOpen || "#ffffff"}
                          onChange={(e) => setWidgetConfig((prev) => ({ ...prev, btnColorOpen: e.target.value }))}
                          className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={widgetConfig.btnColorOpen || "#ffffff"}
                        onChange={(e) => setWidgetConfig((prev) => ({ ...prev, btnColorOpen: e.target.value }))}
                        className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background uppercase font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-sm">
                    <label className="text-sm font-medium leading-none text-gray-900">Modal background color</label>
                    <div className="flex gap-3 items-center">
                      <div className="relative w-10 h-10 rounded-md overflow-hidden border shadow-sm shrink-0">
                        <input
                          type="color"
                          value={widgetConfig.bgColor || "#ffffff"}
                          onChange={(e) => setWidgetConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                          className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={widgetConfig.bgColor || "#ffffff"}
                        onChange={(e) => setWidgetConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                        className="flex h-10 w-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background uppercase font-mono"
                      />
                    </div>
                  </div>

                  {/* Texts */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-gray-900">Widget title</label>
                    <input
                      type="text"
                      value={widgetConfig.title || "Send us your feedback"}
                      onChange={(e) => setWidgetConfig((prev) => ({ ...prev, title: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="show-subtitle"
                        checked={widgetConfig.showSubtitle !== false}
                        onChange={(e) => setWidgetConfig((prev) => ({ ...prev, showSubtitle: e.target.checked }))}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <label htmlFor="show-subtitle" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Show subtitle
                      </label>
                    </div>

                    {widgetConfig.showSubtitle !== false && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <label className="text-xs font-semibold text-gray-600">Widget subtitle</label>
                        <input
                          type="text"
                          value={widgetConfig.subtitle || "We appreciate your thoughts and ideas."}
                          onChange={(e) => setWidgetConfig((prev) => ({ ...prev, subtitle: e.target.value }))}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-gray-900">Submit button text</label>
                    <input
                      type="text"
                      value={widgetConfig.buttonText || "Send feedback"}
                      onChange={(e) => setWidgetConfig((prev) => ({ ...prev, buttonText: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-gray-900">Position</label>
                    <div className="flex p-1 bg-secondary rounded-lg w-fit">
                      <button
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          widgetConfig.position === "left" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setWidgetConfig((prev) => ({ ...prev, position: "left" }))}
                      >
                        Bottom Left
                      </button>
                      <button
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                          widgetConfig.position === "right" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setWidgetConfig((prev) => ({ ...prev, position: "right" }))}
                      >
                        Bottom Right
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Preview */}
              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-900">Live Preview</div>
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-8 relative min-h-[480px] flex flex-col justify-end overflow-hidden shadow-xs">
                  
                  {/* Mock Webpage background content */}
                  <div className="absolute inset-0 bg-[#FAFCFB] p-6 select-none opacity-40 pointer-events-none">
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 w-3/4 bg-gray-100 rounded mb-2"></div>
                    <div className="h-3 w-5/6 bg-gray-100 rounded mb-2"></div>
                    <div className="h-3 w-2/3 bg-gray-100 rounded mb-2"></div>
                  </div>

                  {/* Mock Widget Dialog (Real Size & Design) */}
                  {previewOpen && (
                    <div 
                      style={{
                        bottom: "92px",
                        left: widgetConfig.position === "left" ? "24px" : "auto",
                        right: widgetConfig.position === "right" ? "24px" : "auto",
                        backgroundColor: widgetConfig.bgColor || "#ffffff",
                      }}
                      className={`absolute z-20 ${textColorClass} rounded-[14px] w-[340px] shadow-xl border ${borderColorClass} overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300`}
                    >
                      {previewSuccess ? (
                        <div className="text-center py-10 px-6 animate-in fade-in duration-200">
                          <div className="text-4xl mb-3">🎉</div>
                          <div className={`text-base font-bold ${titleColorClass} mb-1`}>Thank you!</div>
                          <div className={`text-xs ${subtitleColorClass}`}>Your feedback has been sent successfully.</div>
                        </div>
                      ) : (
                        <form onSubmit={handlePreviewSubmit}>
                          <div className="p-5 pb-3 text-center">
                            <div className={`text-base font-bold ${titleColorClass} tracking-tight mb-1`}>
                              {widgetConfig.title || "Send us your feedback"}
                            </div>
                            {widgetConfig.showSubtitle !== false && (
                              <div className={`text-[11px] ${subtitleColorClass}`}>
                                {widgetConfig.subtitle || "We appreciate your thoughts and ideas."}
                              </div>
                            )}
                          </div>
                          <div className="px-5 pb-5 space-y-4">
                            <div 
                              className="flex justify-center gap-3 py-1"
                              onMouseLeave={() => setPreviewHoverRating(0)}
                            >
                              {[1, 2, 3, 4, 5].map((ratingVal) => {
                                const isHighlighted = ratingVal <= (previewHoverRating || previewRating);
                                return (
                                  <span
                                    key={ratingVal}
                                    onMouseEnter={() => setPreviewHoverRating(ratingVal)}
                                    onClick={() => setPreviewRating(ratingVal)}
                                    style={{ color: isHighlighted ? "#FFC107" : starInactiveColor }}
                                    className="text-3xl cursor-pointer select-none transition-all hover:scale-120 duration-100"
                                  >
                                    ★
                                  </span>
                                );
                              })}
                            </div>

                            <textarea
                              value={previewMessage}
                              onChange={(e) => setPreviewMessage(e.target.value)}
                              placeholder="Tell us more (optional)..."
                              className={`w-full h-24 p-3 rounded-lg border ${textareaBorderClass} ${textareaBgClass} ${textColorClass} text-xs outline-none focus:border-emerald-500/40 ${textareaPlaceholderClass} transition-colors resize-none leading-relaxed`}
                            />

                            <button
                              type="submit"
                              disabled={previewRating === 0 || previewSubmitting}
                              style={{ 
                                backgroundColor: widgetConfig.color,
                                color: submitBtnTextColor
                              }}
                              className="w-full h-9 rounded-lg font-bold text-xs flex items-center justify-center transition-opacity hover:opacity-90 active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                              {previewSubmitting ? "Sending..." : (widgetConfig.buttonText || "Send feedback")}
                            </button>
                          </div>
                        </form>
                      )}
                      
                      {/* Powered By Branding */}
                      <div className={`text-[10px] text-center ${textareaPlaceholderClass} py-3 border-t ${footerBorderClass}`}>
                        Powered by <a href="#" className={`${footerLinkClass} font-semibold hover:underline`} onClick={(e) => e.preventDefault()}>Pealo</a>
                      </div>
                    </div>
                  )}

                  {/* Widget Trigger Button (Real Size & Design) */}
                  <button
                    type="button"
                    onClick={() => {
                      if (previewOpen) {
                        setPreviewOpen(false);
                        setPreviewRating(0);
                        setPreviewMessage("");
                        setPreviewSuccess(false);
                      } else {
                        setPreviewOpen(true);
                      }
                    }}
                    style={{
                      backgroundColor: previewOpen ? (widgetConfig.btnColorOpen || "#ffffff") : widgetConfig.color,
                      color: previewOpen ? btnOpenTextColor : btnNormalTextColor,
                      bottom: "24px",
                      left: widgetConfig.position === "left" ? "24px" : "auto",
                      right: widgetConfig.position === "right" ? "24px" : "auto",
                    }}
                    className="absolute z-10 w-[52px] h-[52px] rounded-full shadow-lg hover:scale-106 duration-200 transition-all flex items-center justify-center text-xl cursor-pointer"
                  >
                    {previewOpen ? "✕" : "💬"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold tracking-tight">Project settings</h3>
                <p className="text-sm text-muted-foreground">General settings for your project.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Project name</label>
                  <input
                    type="text"
                    value={project.name}
                    className="flex h-10 w-full rounded-lg border border-gray-200/80 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Domain</label>
                  <input
                    type="text"
                    value={project.domain || ""}
                    className="flex h-10 w-full rounded-lg border border-gray-200/80 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Webhook URL</label>
                  <input
                    type="url"
                    placeholder="https://yourdomain.com/webhooks/feedback"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-[12px] text-muted-foreground">
                    We'll send a POST request with the feedback details to this URL when a new feedback is created.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-4">
              <h3 className="text-lg font-semibold tracking-tight text-red-700">Danger zone</h3>
              <p className="text-sm text-red-800 max-w-md">
                Permanently delete this project and all associated feedbacks. This action cannot be undone.
              </p>
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2"
                onClick={deleteProject}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete project
              </button>
            </div>
          </div>
        )}

        {/* Rules Tab */}
        {activeTab === "rules" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight">Display Rules</h3>
              <p className="text-sm text-muted-foreground">
                Control exactly on which pages the widget appears. Leave blank to show everywhere the script is installed.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 space-y-6 max-w-2xl shadow-xs">
              {/* Include Paths */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gray-400" /> Include paths
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputIncludePath}
                    onChange={(e) => setInputIncludePath(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddIncludePath();
                      }
                    }}
                    placeholder="e.g. /pricing (press Enter to add)"
                    className="flex-1 h-10 px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddIncludePath}
                    disabled={!inputIncludePath.trim()}
                    className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {includePathsList.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Include List ({includePathsList.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {includePathsList.map((path, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border text-sm font-medium text-gray-800 transition-colors group shadow-2xs"
                        >
                          <span>{path}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveIncludePath(idx)}
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
                    <span>No include paths. The widget will appear on <strong>all pages</strong> by default.</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  If specified, the widget will ONLY appear on these pages. Use * for wildcards (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">/docs/*</code>).
                </p>
              </div>

              {/* Exclude Paths */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gray-400" /> Exclude paths
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputExcludePath}
                    onChange={(e) => setInputExcludePath(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddExcludePath();
                      }
                    }}
                    placeholder="e.g. /admin/* (press Enter to add)"
                    className="flex-1 h-10 px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddExcludePath}
                    disabled={!inputExcludePath.trim()}
                    className="px-4 py-2 bg-gray-950 hover:bg-gray-800 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {excludePathsList.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Exclude List ({excludePathsList.length})</span>
                    <div className="flex flex-wrap gap-2">
                      {excludePathsList.map((path, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border text-sm font-medium text-gray-800 transition-colors group shadow-2xs"
                        >
                          <span>{path}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExcludePath(idx)}
                            className="text-gray-400 hover:text-rose-600 transition-colors p-0.5 rounded-md hover:bg-rose-50"
                            title="Remove path"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  The widget will NEVER appear on these pages, even if they match an include path.
                </p>
              </div>

              {/* Device Visibility */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-900">Device visibility</label>
                <p className="text-xs text-muted-foreground">
                  Choose on which devices the widget floating button should be displayed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={widgetConfig.showOnDesktop !== false}
                      onChange={(e) => setWidgetConfig((prev) => ({ ...prev, showOnDesktop: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Computer view (Desktop)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={widgetConfig.showOnMobile !== false}
                      onChange={(e) => setWidgetConfig((prev) => ({ ...prev, showOnMobile: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700">Mobile view</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
