import Link from "next/link";
import { PealoButton } from "@/components/ui/PealoButton";
import { Star, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import CodeSnippet from "@/components/CodeSnippet";
import TryItHereArrow from "@/components/TryItHereArrow";
import FadeIn from "@/components/FadeIn";

import { GradientStar } from "@/components/GradientStar";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main>
        {/* "Try it here" hand-drawn arrow pointing to the widget (fades out on scroll) */}
        <TryItHereArrow />

        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-white">
          {/* Subtle glowing background effect */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>

          <FadeIn className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
              Collect user feedbacks <span className="relative whitespace-nowrap z-10 after:absolute after:bottom-1 md:after:bottom-2 after:left-0 after:w-full after:h-[25%] after:bg-primary/30 after:-z-10">effortlessly</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 font-medium max-w-2xl leading-relaxed mb-10">
              The easiest way to understand your users. Install our widget in seconds and start receiving actionable feedbacks with full technical context.
            </p>

            <div className="flex flex-col items-center gap-8 mb-8">
              <Link href="/dashboard">
                <PealoButton variant="primary" className="w-full sm:w-auto shadow-xl shadow-primary/20 hover:scale-105 transition-transform duration-300" padding="py-2.5 px-8 font-bold text-base">
                  Get started
                </PealoButton>
              </Link>
              
              {/* Social Proof Badge */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" />
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="User" />
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" alt="User" />
                  <img className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" alt="User" />
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => <GradientStar key={i} className="size-4" />)}
                  </div>
                  <span className="text-sm text-gray-600 mt-0.5">
                    <strong className="text-gray-900 font-bold">5,482+</strong> makers are already using it
                  </span>
                </div>
              </div>
            </div>

            {/* Code snippet example */}
            <div className="w-full max-w-3xl mx-auto">
              <CodeSnippet />
            </div>

          </FadeIn>
        </section>

        <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
          <FadeIn className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How does it work?
              </h2>
              <p className="text-lg text-gray-600">
                Collect and manage feedbacks in 3 simple steps.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-4 relative">
              
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center max-w-[260px] relative z-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mb-6 shadow-md border border-neutral-100">
                  ⚡️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">1. Install the widget</h3>
                <p className="text-sm text-gray-600 font-medium">Copy and paste a single line of code into your site or web app.</p>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex items-center justify-center w-32 h-16 relative -mt-24">
                <svg className="shrink-0 w-24 fill-primary opacity-100 md:-rotate-90" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path fillRule="evenodd" clipRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path>
                  </g>
                </svg>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center max-w-[260px] relative z-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mb-6 shadow-md border border-neutral-100">
                  📥
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">2. Gather feedbacks</h3>
                <p className="text-sm text-gray-600 font-medium">Let users report bugs or share suggestions along with technical context.</p>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex items-center justify-center w-32 h-16 relative -mt-24">
                <svg className="shrink-0 w-24 fill-primary opacity-100 md:-scale-x-100 md:-rotate-90" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <path fillRule="evenodd" clipRule="evenodd" d="M72.9644 5.31431C98.8774 43.8211 83.3812 88.048 54.9567 120.735C54.4696 121.298 54.5274 122.151 55.0896 122.639C55.6518 123.126 56.5051 123.068 56.9922 122.506C86.2147 88.9044 101.84 43.3918 75.2003 3.80657C74.7866 3.18904 73.9486 3.02602 73.3287 3.44222C72.7113 3.85613 72.5484 4.69426 72.9644 5.31431Z"></path>
                    <path fillRule="evenodd" clipRule="evenodd" d="M56.5084 121.007C56.9835 118.685 57.6119 115.777 57.6736 115.445C59.3456 106.446 59.5323 97.67 58.4433 88.5628C58.3558 87.8236 57.6824 87.2948 56.9433 87.3824C56.2042 87.4699 55.6756 88.1435 55.7631 88.8828C56.8219 97.7138 56.6432 106.225 55.0203 114.954C54.926 115.463 53.5093 121.999 53.3221 123.342C53.2427 123.893 53.3688 124.229 53.4061 124.305C53.5887 124.719 53.8782 124.911 54.1287 125.015C54.4123 125.13 54.9267 125.205 55.5376 124.926C56.1758 124.631 57.3434 123.699 57.6571 123.487C62.3995 120.309 67.4155 116.348 72.791 113.634C77.9171 111.045 83.3769 109.588 89.255 111.269C89.9704 111.475 90.7181 111.057 90.9235 110.342C91.1288 109.626 90.7117 108.878 89.9963 108.673C83.424 106.794 77.3049 108.33 71.5763 111.223C66.2328 113.922 61.2322 117.814 56.5084 121.007Z"></path>
                  </g>
                </svg>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center max-w-[260px] relative z-10">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl mb-6 shadow-md border border-neutral-100">
                  📊
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">3. Analyze</h3>
                <p className="text-sm text-gray-600 font-medium">Manage, prioritize, and act on feedbacks from your dashboard.</p>
              </div>

            </div>

            {/* CTA Button */}
            <div className="mt-20 flex justify-center">
              <Link href="/dashboard">
                <PealoButton variant="primary" className="w-auto" padding="py-5 px-10 font-bold text-xl">
                  Create my first widget
                </PealoButton>
              </Link>
            </div>
          </FadeIn>
        </section>

        {/* Testimonial 1 */}
        <div className="py-12 bg-white flex justify-center px-4">
          <FadeIn className="max-w-4xl text-center">
            <div className="flex justify-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map(i => <GradientStar key={i} className="size-6" />)}
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-8 max-w-[700px] mx-auto">
              "It's magic! We finally have all our user feedback centralized in one place."
            </h3>
            <div className="flex items-center justify-center gap-3">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Marie" />
              <p className="text-gray-900 font-bold tracking-wide text-base">Marie</p>
            </div>
          </FadeIn>
        </div>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-white">
          <FadeIn className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                Powerful, yet radically simple.
              </h2>
              <p className="text-lg text-gray-600 font-medium">
                Everything you need to collect and manage feedback, without the clutter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 - Large (2 cols) */}
              <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-12 flex flex-col justify-end min-h-[320px] transition-all hover:bg-gray-100/50">
                <h3 className="text-2xl font-bold text-gray-950 mb-3 tracking-tight">Full Customization</h3>
                <p className="text-gray-600 font-medium max-w-lg leading-relaxed text-lg">Match your brand identity perfectly. Customize colors, button texts, and placement to make the widget feel entirely native to your site.</p>
              </div>

              {/* Feature 2 - Small (1 col) */}
              <div className="col-span-1 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-10 flex flex-col justify-end min-h-[320px] transition-all hover:bg-gray-100/50">
                <h3 className="text-xl font-bold text-gray-950 mb-3 tracking-tight">Instant Webhooks</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Push feedbacks instantly to Slack, Discord, or any custom endpoint you configure in seconds.</p>
              </div>

              {/* Feature 3 - Small (1 col) */}
              <div className="col-span-1 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-10 flex flex-col justify-end min-h-[320px] transition-all hover:bg-gray-100/50">
                <h3 className="text-xl font-bold text-gray-950 mb-3 tracking-tight">Data Exports</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Download your entire feedback history in CSV or JSON formats for advanced analysis in Excel.</p>
              </div>

              {/* Feature 4 - Large (2 cols) */}
              <div className="md:col-span-2 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-12 flex flex-col justify-end min-h-[320px] transition-all hover:bg-gray-100/50">
                <h3 className="text-2xl font-bold text-gray-950 mb-3 tracking-tight">Smart Context & Rules</h3>
                <p className="text-gray-600 font-medium max-w-lg leading-relaxed text-lg">Control exactly where the widget appears using path matching. Every feedback automatically captures the user's browser, OS, and URL context.</p>
              </div>

              {/* Feature 5 - Small (1 col) */}
              <div className="col-span-1 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-10 flex flex-col justify-end min-h-[320px] transition-all hover:bg-gray-100/50">
                <h3 className="text-xl font-bold text-gray-950 mb-3 tracking-tight">Ultra Lightweight</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Our script is tiny and loads asynchronously. It will never slow down your website's performance.</p>
              </div>

              {/* Feature 6 - Small (1 col) */}
              <div className="col-span-1 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-10 flex flex-col justify-end min-h-[320px] transition-all hover:bg-gray-100/50">
                <h3 className="text-xl font-bold text-gray-950 mb-3 tracking-tight">Multi-Project</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Manage feedback for all your domains, SaaS, and landing pages from a single unified dashboard.</p>
              </div>

              {/* Feature 7 - Small (1 col) */}
              <div className="col-span-1 bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-10 flex flex-col justify-end min-h-[320px] transition-all hover:bg-gray-100/50">
                <h3 className="text-xl font-bold text-gray-950 mb-3 tracking-tight">Filter & Sort</h3>
                <p className="text-gray-600 font-medium leading-relaxed">Quickly find what you need by filtering feedbacks by star rating, date, or specific projects.</p>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Testimonial 2 */}
        <div className="py-12 bg-white flex justify-center px-4">
          <FadeIn className="max-w-4xl text-center">
            <div className="flex justify-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map(i => <GradientStar key={i} className="size-6" />)}
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-8 max-w-[700px] mx-auto">
              "A brilliant idea for prioritizing our roadmap. Users love the widget."
            </h3>
            <div className="flex items-center justify-center gap-3">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Julien" />
              <p className="text-gray-900 font-bold tracking-wide text-base">Julien</p>
            </div>
          </FadeIn>
        </div>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white">
          <FadeIn className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-gray-600">
                Choose the plan that fits your needs. Start collecting feedback today.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* Basic Plan */}
              <div className="relative rounded-3xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-950">Basic</h3>
                  <p className="text-sm text-muted-foreground mt-2">Start collecting feedbacks on your project.</p>
                  
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold tracking-tight text-gray-900">$4.99</span>
                    <span className="text-sm font-semibold text-muted-foreground">/mo</span>
                  </div>

                  <ul className="mt-8 space-y-4 text-sm text-gray-600 font-medium">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>1 website</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>Real-time insights & statistics</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>Widget customization (color, text & position)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>"Powered by" branding active</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8">
                  <Link href="/dashboard" className="w-full block">
                    <button className="w-full inline-flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 h-12 px-6 font-bold text-base transition-colors cursor-pointer">
                      Get Started
                    </button>
                  </Link>
                  <p className="text-[11px] text-center text-muted-foreground mt-3 font-semibold uppercase tracking-wider">
                    No commitment - Secured by Polar.sh
                  </p>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="relative rounded-3xl border-2 border-primary bg-white p-8 shadow-md flex flex-col justify-between hover:shadow-lg transition-all duration-200">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                    Popular
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-950">Pro</h3>
                  <p className="text-sm text-muted-foreground mt-2">Add feedback widgets to all your projects.</p>
                  
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold tracking-tight text-gray-900">$9.99</span>
                    <span className="text-sm font-semibold text-muted-foreground">/mo</span>
                  </div>

                  <ul className="mt-8 space-y-4 text-sm text-gray-600 font-medium">
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">Unlimited</span> websites
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>Real-time insights & statistics</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>Widget customization (color, text & position)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>
                        <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">Remove branding</span> option
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-8">
                  <Link href="/dashboard" className="w-full block">
                    <button className="w-full inline-flex items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover h-12 px-6 font-bold text-base transition-colors shadow-sm shadow-primary/20 cursor-pointer">
                      Get Started
                    </button>
                  </Link>
                  <p className="text-[11px] text-center text-muted-foreground mt-3 font-semibold uppercase tracking-wider">
                    No commitment - Secured by Polar.sh
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* Testimonial 3 */}
        <div className="py-12 bg-white flex justify-center px-4">
          <FadeIn className="max-w-4xl text-center">
            <div className="flex justify-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map(i => <GradientStar key={i} className="size-6" />)}
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-8 max-w-[700px] mx-auto">
              "The quality of technical logs included in the tickets is impressive; it saves us a ton of time."
            </h3>
            <div className="flex items-center justify-center gap-3">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" className="w-10 h-10 rounded-full object-cover shadow-sm" alt="Sophie" />
              <p className="text-gray-900 font-bold tracking-wide text-base">Sophie</p>
            </div>
          </FadeIn>
        </div>

        {/* FAQ Section */}
        <section id="faq" className="py-24 bg-white">
          <FadeIn className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              <details className="group border-b border-gray-200 pb-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg outline-none">
                  <span>How long does installation take?</span>
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">Installation takes literally less than 2 minutes. Simply copy a script tag and paste it into your website. The widget will appear instantly!</p>
              </details>
              
              <details className="group border-b border-gray-200 pb-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg outline-none">
                  <span>Can I customize the widget appearance?</span>
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">Absolutely! You can choose your brand colors, customize button text, and set its position (left, right, bottom) from your dashboard, without writing code.</p>
              </details>

              <details className="group border-b border-gray-200 pb-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg outline-none">
                  <span>What data do you collect with feedbacks?</span>
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">To help you debug easily, each feedback automatically captures essential data such as URL, device type, screen size, OS, and browser, in addition to the message or bug reported.</p>
              </details>

              <details className="group border-b border-gray-200 pb-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg outline-none">
                  <span>Can I remove the "Powered by" branding?</span>
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">Yes! Upgrading to our Pro plan gives you the option to completely remove the "Powered by Pealo" branding from all your feedback widgets.</p>
              </details>

              <details className="group border-b border-gray-200 pb-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg outline-none">
                  <span>Does the Pro plan support multiple websites?</span>
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">Absolutely. With the Pro plan, you can create and manage unlimited widgets for as many different domains or websites as you need under a single account.</p>
              </details>

              <details className="group border-b border-gray-200 pb-4 [&_summary::-webkit-details-marker]:hidden cursor-pointer">
                <summary className="flex items-center justify-between font-semibold text-gray-900 text-lg outline-none">
                  <span>Do you offer a free plan?</span>
                  <span className="transition duration-300 group-open:-rotate-180 text-gray-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">No, we do not offer a free plan. Our focus is exclusively on providing a premium experience and dedicated support for all our customers.</p>
              </details>
            </div>

            {/* CTA Button */}
            <div className="mt-16 flex justify-center">
              <Link href="/dashboard">
                <PealoButton variant="primary" className="w-auto" padding="py-5 px-10 font-bold text-xl">
                  Try now
                </PealoButton>
              </Link>
            </div>
          </FadeIn>
        </section>

        {/* Footer */}
        <footer className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.png" alt="Pealo" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold text-gray-900 tracking-tight">Pealo</span>
              </div>
              <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
                Pealo is the easiest way to collect user feedback, bug reports, and suggestions directly from your website.
              </p>
              <p className="text-gray-500 text-sm">
                Copyright &copy; {new Date().getFullYear()} - All rights reserved
              </p>
              <p className="text-gray-600 text-sm">
                Made with 🍕 by <a href="https://x.com/vincentpruv" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900 transition-colors">Vincent</a>
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 tracking-wider text-sm mb-4 uppercase">Links</h3>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-sm text-gray-600 hover:text-primary transition-colors">Log in</Link></li>
                <li><Link href="/#pricing" className="text-sm text-gray-600 hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="text-sm text-gray-600 hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 tracking-wider text-sm mb-4 uppercase">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms of services</Link></li>
                <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy policy</Link></li>
                <li><Link href="/legal" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Legal notice</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
