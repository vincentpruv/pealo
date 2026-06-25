"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Clock, AlertCircle } from "lucide-react";
import { GradientStar } from "@/components/GradientStar";
import Link from "next/link";

const TYPE_BADGES = {
  bug: { className: "bg-red-100 text-red-700 border-red-200", label: "Bug" },
  suggestion: { className: "bg-blue-100 text-blue-700 border-blue-200", label: "Suggestion" },
  question: { className: "bg-purple-100 text-purple-700 border-purple-200", label: "Question" },
  other: { className: "bg-gray-100 text-gray-700 border-gray-200", label: "Other" },
};

const getBrowserIconUrl = (browser) => {
  const b = browser?.toLowerCase() || "";
  if (b.includes("chrome")) return "https://cdn.simpleicons.org/googlechrome/4285F4";
  if (b.includes("firefox")) return "https://cdn.simpleicons.org/firefox/FF7139";
  if (b.includes("safari")) return "https://cdn.simpleicons.org/safari/000000";
  if (b.includes("edge")) return "https://cdn.simpleicons.org/microsoftedge/0078D7";
  return null;
};

const getOsIconUrl = (os) => {
  const o = os?.toLowerCase() || "";
  if (o.includes("win")) return "https://cdn.simpleicons.org/windows/0078D7";
  if (o.includes("mac") || o.includes("ios")) return "https://cdn.simpleicons.org/apple/000000";
  if (o.includes("android")) return "https://cdn.simpleicons.org/android/3DDC84";
  if (o.includes("linux")) return "https://cdn.simpleicons.org/linux/FCC624";
  return null;
};

const getLanguageDisplay = (langCode) => {
  if (!langCode) return "";
  const cleanLang = langCode.split("-")[0].toLowerCase();
  const flags = {
    fr: "🇫🇷",
    en: "🇬🇧",
    us: "🇺🇸",
    es: "🇪🇸",
    de: "🇩🇪",
    it: "🇮🇹",
    pt: "🇵🇹",
    nl: "🇳🇱",
    ja: "🇯🇵",
    zh: "🇨🇳",
    ru: "🇷🇺",
  };
  const flag = flags[cleanLang] || "🏳️";
  return `${flag} ${cleanLang.toUpperCase()}`;
};

export default function FeedbackDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeedback() {
      try {
        const res = await fetch(`/api/feedbacks/${id}`);
        if (res.ok) {
          setFeedback(await res.json());
        }
      } catch (error) {
        console.error("Failed to load feedback:", error);
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const res = await fetch(`/api/feedbacks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setFeedback((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const deleteFeedback = async () => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`/api/feedbacks/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/feedbacks");
      }
    } catch (error) {
      console.error("Failed to delete feedback:", error);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">Loading feedback details...</div>
    );
  }

  if (!feedback) {
    return (
      <div className="py-12 text-center text-muted-foreground">Feedback not found</div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/feedbacks?projectId=${feedback.projectId._id}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to feedbacks
        </Link>
        <button
          onClick={deleteFeedback}
          className="inline-flex items-center text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Message Card */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="border-b px-6 py-4 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                {feedback.rating !== undefined && feedback.rating !== null ? (
                  <div className="flex">
                    {Array(feedback.rating).fill(0).map((_, i) => <GradientStar key={i} className="size-4.5" />)}
                    {Array(5 - feedback.rating).fill(0).map((_, i) => <GradientStar key={`e-${i}`} className="size-4.5 opacity-30 grayscale" />)}
                  </div>
                ) : (
                  <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${TYPE_BADGES[feedback.type]?.className || TYPE_BADGES.other.className}`}>
                    {TYPE_BADGES[feedback.type]?.label || "Other"}
                  </span>
                )}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {new Date(feedback.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Message</h3>
              <p className={`text-base leading-relaxed ${!feedback.message ? "italic text-muted-foreground" : "text-gray-900"}`}>
                {feedback.message || "No comment left"}
              </p>
            </div>
          </div>

          {/* Screenshot */}
          {feedback.screenshot && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="border-b px-6 py-4 bg-muted/30">
                <h3 className="font-medium">Attached Screenshot</h3>
              </div>
              <div className="p-6">
                <img
                  src={feedback.screenshot}
                  alt="Screenshot"
                  className="rounded-lg border shadow-sm max-w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Status Control */}
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Status</h3>
            <div className="flex flex-col gap-2">
              {[
                { id: "new", label: "New", color: "bg-blue-500" },
                { id: "in_progress", label: "In Progress", color: "bg-amber-500" },
                { id: "resolved", label: "Resolved", color: "bg-green-500" }
              ].map((status) => (
                <button
                  key={status.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md border text-sm font-medium transition-colors ${
                    feedback.status === status.id
                      ? "bg-secondary border-border shadow-sm"
                      : "border-transparent hover:bg-secondary/50 text-muted-foreground"
                  }`}
                  onClick={() => updateStatus(status.id)}
                >
                  <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata */}
          {feedback.metadata && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Metadata</h3>
              <div className="space-y-4">
                {feedback.metadata.url && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">🔗 Page URL</div>
                    <div className="text-sm font-medium break-all">{feedback.metadata.url}</div>
                  </div>
                )}
                {feedback.metadata.browser && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Browser</div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {getBrowserIconUrl(feedback.metadata.browser) ? (
                        <img 
                          src={getBrowserIconUrl(feedback.metadata.browser)} 
                          alt={feedback.metadata.browser}
                          className="w-4 h-4 object-contain shrink-0"
                        />
                      ) : (
                        <span className="shrink-0">💻</span>
                      )}
                      <span>{feedback.metadata.browser}</span>
                    </div>
                  </div>
                )}
                {feedback.metadata.os && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Operating System</div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {getOsIconUrl(feedback.metadata.os) ? (
                        <img 
                          src={getOsIconUrl(feedback.metadata.os)} 
                          alt={feedback.metadata.os}
                          className="w-4 h-4 object-contain shrink-0"
                        />
                      ) : (
                        <span className="shrink-0">💻</span>
                      )}
                      <span>{feedback.metadata.os}</span>
                    </div>
                  </div>
                )}
                {feedback.metadata.screenSize && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Screen Size</div>
                    <div className="text-sm font-medium">📱 {feedback.metadata.screenSize}</div>
                  </div>
                )}
                {feedback.metadata.language && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Language</div>
                    <div className="text-sm font-medium">{getLanguageDisplay(feedback.metadata.language)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
