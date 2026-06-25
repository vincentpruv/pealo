import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Changelog - Pealo",
  description: "New updates and improvements to Pealo.",
};

export default function ChangelogPage() {
  const updates = [
    {
      date: "June 2026",
      title: "The Birth of Pealo",
      description: "We officially launched Pealo! You can now easily collect user feedback, prioritize feature requests, and get full contextual metadata to debug effectively.",
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Changelog
            </h1>
            <p className="text-xl text-gray-600">
              New updates and improvements to Pealo.
            </p>
          </div>

          <div className="space-y-16">
            {updates.map((update, index) => (
              <div key={index} className="relative pl-8 md:pl-0">
                <div className="md:grid md:grid-cols-4 md:gap-8 items-baseline">
                  <div className="md:col-span-1 mb-2 md:mb-0">
                    <time className="text-sm font-semibold text-primary uppercase tracking-wider">
                      {update.date}
                    </time>
                  </div>
                  <div className="md:col-span-3">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {update.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {update.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-primary rounded flex items-center justify-center text-white font-bold text-sm">F</div>
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
              <li><Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Legal notice</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
