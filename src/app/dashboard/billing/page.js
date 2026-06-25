"use client";

import { useSession } from "next-auth/react";
import { Check, CreditCard, ExternalLink } from "lucide-react";

export default function BillingPage() {
  const { data: session } = useSession();
  const currentPlan = session?.user?.plan || "none"; // none, basic, pro

  const basicCheckoutUrl = process.env.NEXT_PUBLIC_POLAR_BASIC_CHECKOUT_URL || "#";
  const proCheckoutUrl = process.env.NEXT_PUBLIC_POLAR_PRO_CHECKOUT_URL || "#";
  const customerPortalUrl = process.env.NEXT_PUBLIC_POLAR_CUSTOMER_PORTAL_URL || "https://polar.sh";

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan, payment methods, and invoices powered by Polar.sh.</p>
      </div>

      {/* Current plan banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl shrink-0">
            💳
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">Current Plan:</span>
              {currentPlan === "none" ? (
                <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-bold uppercase">
                  No Active Plan
                </span>
              ) : (
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary uppercase">
                  {currentPlan === "pro" ? "Pro Plan" : "Basic Plan"}
                </span>
              )}
            </div>
            {currentPlan === "none" && (
              <p className="text-sm text-muted-foreground mt-1">
                Subscribe to a plan below to start creating feedback widgets.
              </p>
            )}
            {currentPlan === "pro" && (
              <p className="text-sm text-muted-foreground mt-1">
                You have unlimited websites and branding is disabled.
              </p>
            )}
          </div>
        </div>
        <a 
          href={customerPortalUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 h-10 px-4 py-2 text-sm font-semibold transition-colors gap-2 cursor-pointer shrink-0"
        >
          <CreditCard className="w-4 h-4" />
          Customer Portal
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {/* Basic Card */}
        <div className={`relative rounded-3xl border bg-white p-8 flex flex-col justify-between transition-all duration-200 ${
          currentPlan === "basic" ? "border-gray-900 shadow-md ring-1 ring-gray-900" : "border-gray-200 shadow-sm hover:shadow-md"
        }`}>
          {currentPlan === "basic" && (
            <div className="absolute -top-3 left-6">
              <span className="inline-flex items-center justify-center rounded-full bg-gray-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Active
              </span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-950">Basic</h3>
            <p className="text-xs text-muted-foreground mt-1.5">Perfect for personal or single-project use.</p>
            
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">$4.99</span>
              <span className="text-xs font-semibold text-muted-foreground">/mo</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-gray-600 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>1 website</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Real-time insights & statistics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Widget customization (color, text & position)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>"Powered by" branding active</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            {currentPlan === "basic" ? (
              <button disabled className="w-full inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 h-11 px-4 font-bold text-sm cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <a href={basicCheckoutUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                <button className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 h-11 px-4 font-bold text-sm transition-colors cursor-pointer">
                  {currentPlan === "none" ? "Subscribe" : "Downgrade Plan"}
                </button>
              </a>
            )}
          </div>
        </div>

        {/* Pro Card */}
        <div className={`relative rounded-3xl border bg-white p-8 flex flex-col justify-between transition-all duration-200 ${
          currentPlan === "pro" ? "border-primary shadow-md ring-1 ring-primary" : "border-gray-200 shadow-sm hover:shadow-md"
        }`}>
          {currentPlan === "pro" ? (
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
            <h3 className="text-xl font-bold text-gray-950">Pro</h3>
            <p className="text-xs text-muted-foreground mt-1.5">For makers and builders with multiple websites.</p>
            
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-gray-900">$9.99</span>
              <span className="text-xs font-semibold text-muted-foreground">/mo</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-gray-600 font-medium">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <span className="bg-primary/10 text-primary px-1 rounded font-bold">Unlimited</span> websites
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Real-time insights & statistics</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>Widget customization (color, text & position)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <span className="bg-primary/10 text-primary px-1 rounded font-bold">Remove branding</span> option
                </span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            {currentPlan === "pro" ? (
              <button disabled className="w-full inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 h-11 px-4 font-bold text-sm cursor-not-allowed">
                Current Plan
              </button>
            ) : (
              <a href={proCheckoutUrl} target="_blank" rel="noopener noreferrer" className="w-full block">
                <button className="w-full inline-flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover h-11 px-4 font-bold text-sm transition-colors cursor-pointer shadow-sm shadow-primary/10">
                  {currentPlan === "none" ? "Subscribe" : "Upgrade Plan"}
                </button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
