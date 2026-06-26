"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Folder, Loader2, Check, X } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", domain: "" });
  const [creating, setCreating] = useState(false);

  const isNone = !session?.user?.plan || session?.user?.plan === "none";
  const isBasic = session?.user?.plan === "basic";
  const hasReachedLimit = isNone || (isBasic && projects.length >= 1);

  const basicCheckoutUrl = process.env.NEXT_PUBLIC_POLAR_BASIC_CHECKOUT_URL || "#";
  const proCheckoutUrl = process.env.NEXT_PUBLIC_POLAR_PRO_CHECKOUT_URL || "#";

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        const project = await res.json();
        setProjects((prev) => [project, ...prev]);
        setShowModal(false);
        setNewProject({ name: "", domain: "" });
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreating(false);
    }
  };

  const getFavicon = (domain) => {
    if (!domain) return null;
    const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    return `https://${clean}/favicon.ico`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Widgets</h1>
          <p className="text-muted-foreground">Configure and manage your feedback widgets</p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" /> New Widget
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading widgets...</div>
      ) : projects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="group flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 border flex items-center justify-center shrink-0 overflow-hidden relative">
                  <Folder className="w-6 h-6 text-gray-400 absolute" />
                  {project.domain && (
                    <img
                      src={getFavicon(project.domain)}
                      alt={`${project.name} favicon`}
                      className="w-8 h-8 object-contain relative z-10 bg-gray-50"
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
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-lg text-gray-950 truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {project.domain || "No domain configured"}
                  </div>
                </div>
              </div>


              <div className="space-y-2 mt-auto">
                <div className="text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-lg w-fit flex items-center gap-1.5">
                  <span className="text-sm">🔑</span>
                  <span>{project.apiKey?.slice(0, 16)}...</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-gray-50/50">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Folder className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No widgets configured</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mt-1">
            Create your first widget to start collecting feedback from your users.
          </p>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Create my first widget
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className={`bg-background rounded-xl shadow-lg w-full ${hasReachedLimit ? 'max-w-3xl' : 'max-w-md'} border overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {hasReachedLimit 
                  ? (isNone ? "Subscribe to a Plan" : "Upgrade to Pro") 
                  : "Create a new widget"}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {hasReachedLimit ? (
              <div className="p-6 space-y-6">
                <div className="text-center max-w-lg mx-auto">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {isNone 
                      ? "You do not have an active subscription. Please subscribe to a plan to start creating feedback widgets."
                      : "You have reached the limit of 1 widget on the Basic plan. Upgrade to the Pro plan to create unlimited widgets."}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 items-stretch pt-2">
                  {/* Basic Plan */}
                  <div className={`relative rounded-2xl border bg-white p-6 flex flex-col justify-between transition-all duration-200 ${
                    session?.user?.plan === "basic" ? "border-gray-900 shadow-md ring-1 ring-gray-900" : "border-gray-200 shadow-sm"
                  }`}>
                    {session?.user?.plan === "basic" && (
                      <div className="absolute -top-3 left-6">
                        <span className="inline-flex items-center justify-center rounded-full bg-gray-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Active
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-950">Basic</h3>
                      <p className="text-xs text-muted-foreground mt-1">Perfect for personal or single-project use.</p>
                      
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-gray-900">$4.99</span>
                        <span className="text-xs font-semibold text-muted-foreground">/mo</span>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs text-gray-600 font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>1 website</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>Real-time insights</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>Widget customization</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>"Powered by" branding</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-5">
                      {session?.user?.plan === "basic" ? (
                        <button disabled className="w-full inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 h-10 px-4 font-bold text-sm cursor-not-allowed">
                          Current Plan
                        </button>
                      ) : (
                        <a href={basicCheckoutUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                          <button className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 h-10 px-4 font-bold text-sm transition-colors cursor-pointer">
                            Subscribe
                          </button>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Pro Plan */}
                  <div className={`relative rounded-2xl border bg-white p-6 flex flex-col justify-between transition-all duration-200 ${
                    session?.user?.plan === "pro" ? "border-primary shadow-md ring-1 ring-primary" : "border-gray-200 shadow-sm"
                  }`}>
                    {session?.user?.plan === "pro" ? (
                      <div className="absolute -top-3 left-6">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Active
                        </span>
                      </div>
                    ) : (
                      <div className="absolute -top-3 left-6">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Popular
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-950">Pro</h3>
                      <p className="text-xs text-muted-foreground mt-1">For makers and builders with multiple websites.</p>
                      
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-gray-900">$9.99</span>
                        <span className="text-xs font-semibold text-muted-foreground">/mo</span>
                      </div>

                      <ul className="mt-4 space-y-2 text-xs text-gray-600 font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>Unlimited websites</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>Real-time insights</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>Widget customization</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span>Remove branding option</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-5">
                      {session?.user?.plan === "pro" ? (
                        <button disabled className="w-full inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 h-10 px-4 font-bold text-sm cursor-not-allowed">
                          Current Plan
                        </button>
                      ) : (
                        <a href={proCheckoutUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                          <button className="w-full inline-flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover h-10 px-4 font-bold text-sm transition-colors cursor-pointer shadow-sm shadow-primary/10">
                            {session?.user?.plan === "basic" ? "Upgrade" : "Subscribe"}
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={createProject}>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="project-name">
                      Widget name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="project-name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="My web application"
                      value={newProject.name}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="project-domain">
                      Domain name (optional)
                    </label>
                    <input
                      id="project-domain"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="text"
                      placeholder="mywebsite.com"
                      value={newProject.domain}
                      onChange={(e) => setNewProject((prev) => ({ ...prev, domain: e.target.value }))}
                    />
                    <p className="text-[13px] text-muted-foreground">
                      The domain name where the widget will be embedded.
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 bg-white border-t flex justify-end gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
                    disabled={creating}
                  >
                    {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {creating ? "Creating..." : "Create widget"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
