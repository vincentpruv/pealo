"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { PealoButton } from "@/components/ui/PealoButton";
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") {
      alert("Please enter 'DELETE' to confirm.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
      });

      if (res.ok) {
        // Sign out and redirect to home page
        await signOut({ callbackUrl: "/" });
      } else {
        const data = await res.json();
        alert(data.error || "An error occurred while deleting your account.");
        setIsDeleting(false);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app settings</p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-950">Account Information</h2>
          <p className="text-sm text-muted-foreground mt-1">Your authentication details</p>
        </div>
        <div className="p-6 space-y-3 divide-y divide-border/50">
          <div className="flex justify-between items-center py-2 text-sm">
            <span className="text-muted-foreground font-medium">Email address</span>
            <span className="text-gray-900 font-semibold">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between items-center pt-3 py-2 text-sm">
            <span className="text-muted-foreground font-medium">Creation date</span>
            <span className="text-gray-900 font-semibold">
              {session?.user?.createdAt
                ? new Date(session.user.createdAt).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Not available"}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="rounded-xl border border-red-200 bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="p-6 border-b border-red-200 bg-red-50">
          <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900">Delete my account</h3>
            <p className="text-sm text-muted-foreground">
              This action is irreversible. All of your applications, widgets, and collected feedbacks will be permanently deleted from our servers.
            </p>
          </div>

          {!showConfirm ? (
            <PealoButton
              variant="outline"
              className="border-destructive hover:bg-destructive hover:text-white transition-colors flex items-center gap-2 justify-center py-5"
              onClick={() => setShowConfirm(true)}
            >
              <Trash2 className="w-4 h-4" /> Delete my account
            </PealoButton>
          ) : (
            <div className="space-y-4 border border-destructive/30 rounded-lg p-4 bg-destructive/5">
              <div className="flex gap-2 text-sm text-destructive font-medium items-start">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>
                  To confirm permanent deletion, type <strong>DELETE</strong> in the field below:
                </span>
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border rounded-md text-sm border-destructive/50 focus:outline-none focus:ring-1 focus:ring-destructive"
              />
              <div className="flex gap-3">
                <PealoButton
                  variant="outline"
                  onClick={() => {
                    setShowConfirm(false);
                    setConfirmText("");
                  }}
                  className="w-1/2 py-5"
                  disabled={isDeleting}
                >
                  Cancel
                </PealoButton>
                <button
                  onClick={handleDeleteAccount}
                  className="w-1/2 inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors bg-destructive text-white hover:bg-destructive/90 py-5 px-4 disabled:opacity-50"
                  disabled={isDeleting || confirmText !== "DELETE"}
                >
                  {isDeleting ? "Deleting..." : "Confirm deletion"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
