"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PealoButton } from "@/components/ui/PealoButton";

const GoogleIcon = ({ className = "w-5 h-5 mr-2" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

function LoginContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError) {
      setError("An error occurred during login.");
    }
  }, [urlError]);

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("An error occurred. Please try again.");
      } else {
        setIsEmailSent(true);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <Card className="w-full max-w-md border-neutral-200/60 shadow-xl bg-white/90 backdrop-blur-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 text-primary flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Email sent!</CardTitle>
          <CardDescription className="text-gray-500 mt-2">
            A magic login link has been sent to:<br />
            <strong className="text-gray-900 font-semibold">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Check your inbox and click the magic link to log in automatically to your space.
          </p>
          <div className="p-3 bg-neutral-50 rounded-xl text-xs text-gray-700 border border-neutral-100">
            Make sure to check your spam folder if you do not receive it within 2 minutes.
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <button
            onClick={() => setIsEmailSent(false)}
            className="text-sm text-primary hover:underline font-medium"
          >
            Try with another email address
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-neutral-200/60 shadow-xl bg-white/95 backdrop-blur-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3">
          <img 
            src="/logo.png" 
            alt="Pealo Logo" 
            className="w-12 h-12 object-contain mx-auto"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Magic Login</CardTitle>
        <CardDescription>
          Log in to access your Pealo dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
                className="pl-10 focus-visible:ring-primary bg-white border-neutral-200"
              />
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm text-left">
              {error}
            </div>
          )}

          <PealoButton
            type="submit"
            variant="primary"
            padding="py-4 px-6 font-semibold"
            disabled={isLoading || isGoogleLoading}
            className="w-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Sending link...</span>
              </div>
            ) : (
              <span>Receive a single-use link</span>
            )}
          </PealoButton>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <PealoButton
          type="button"
          variant="outline"
          padding="py-4 px-6 font-semibold flex items-center justify-center"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full bg-white border-neutral-200 hover:bg-neutral-50"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <GoogleIcon className="w-5 h-5 mr-2" />
          )}
          <span className="text-gray-700">Sign in with Google</span>
        </PealoButton>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-gray-100 mt-6 pt-4">
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          Back to home
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover opacity-[0.25]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 800">
          <defs>
            <radialGradient id="a" cx="400" cy="400" r="50%" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--background)"></stop>
              <stop offset="1" stopColor="var(--primary)"></stop>
            </radialGradient>
            <radialGradient id="b" cx="400" cy="400" r="70%" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--background)"></stop>
              <stop offset="1" stopColor="var(--primary)"></stop>
            </radialGradient>
          </defs>
          <rect fill="url(#a)" width="800" height="800"></rect>
          <g fillOpacity=".8">
            <path fill="url(#b)" d="M998.7 439.2c1.7-26.5 1.7-52.7 0.1-78.5L401 399.9c0 0 0-0.1 0-0.1l587.6-116.9c-5.1-25.9-11.9-51.2-20.3-75.8L400.9 399.7c0 0 0-0.1 0-0.1l537.3-265c-11.6-23.5-24.8-46.2-39.3-67.9L400.8 399.5c0 0 0-0.1-0.1-0.1l450.4-395c-17.3-19.7-35.8-38.2-55.5-55.5l-395 450.4c0 0-0.1 0-0.1-0.1L733.4-99c-21.7-14.5-44.4-27.6-68-39.3l-265 537.4c0 0-0.1 0-0.1 0l192.6-567.4c-24.6-8.3-49.9-15.1-75.8-20.2L400.2 399c0 0-0.1 0-0.1 0l39.2-597.7c-26.5-1.7-52.7-1.7-78.5-0.1L399.9 399c0 0-0.1 0-0.1 0L282.9-188.6c-25.9 5.1-51.2 11.9-75.8 20.3l192.6 567.4c0 0-0.1 0-0.1 0l-265-537.3c-23.5 11.6-46.2 24.8-67.9 39.3l332.8 498.1c0 0-0.1 0-0.1 0.1L4.4-51.1C-15.3-33.9-33.8-15.3-51.1 4.4l450.4 395c0 0 0 0.1-0.1 0.1L-99 66.6c-14.5 21.7-27.6 44.4-39.3 68l537.4 265c0 0 0 0.1 0 0.1l-567.4-192.6c-8.3 24.6-15.1 49.9-20.2 75.8L399 399.8c0 0 0 0.1 0 0.1l-597.7-39.2c-1.7 26.5-1.7 52.7-0.1 78.5L399 400.1c0 0 0 0.1 0 0.1l-587.6 116.9c5.1 25.9 11.9 51.2 20.3 75.8l567.4-192.6c0 0 0 0.1 0 0.1l-537.3 265c11.6 23.5 24.8 46.2 39.3 67.9l498.1-332.8c0 0 0 0.1 0.1 0.1l-450.4 395c17.3 19.7 35.8 38.2 55.5 55.5l395-450.4c0 0 0.1 0 0.1 0.1L66.6 899c21.7 14.5 44.4 27.6 68 39.3l265-537.4c0 0 0.1 0 0.1 0L207.1 968.3c24.6 8.3 49.9 15.1 75.8 20.2L399.8 401c0 0 0.1 0 0.1 0l-39.2 597.7c26.5 1.7 52.7 1.7 78.5 0.1L400.1 401c0 0 0.1 0 0.1 0l116.9 587.6c25.9-5.1 51.2-11.9 75.8-20.3L400.3 400.9c0 0 0.1 0 0.1 0l265 537.3c23.5-11.6 46.2-24.8 67.9-39.3L400.5 400.8c0 0 0.1 0 0.1-0.1l395 450.4c19.7-17.3 38.2-35.8 55.5-55.5l-450.4-395c0 0 0-0.1 0.1-0.1L899 733.4c14.5-21.7 27.6-44.4 39.3-68l-537.4-265c0 0 0-0.1 0-0.1l567.4 192.6c8.3-24.6 15.1-49.9 20.2-75.8L401 400.2c0 0 0-0.1 0-0.1L998.7 439.2z"></path>
          </g>
        </svg>
      </div>
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={
          <Card className="w-full max-w-md border-neutral-200/60 shadow-xl bg-white/95 text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </Card>
        }>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
