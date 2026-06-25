import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Mentions Légales - Pealo",
  description: "Mentions légales du site Pealo.",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary/20 selection:text-primary">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Mentions Légales
            </h1>
          </div>

          <div className="space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Édition du site</h2>
              <p>En vertu de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs du site internet usepealo.com l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><strong>Propriétaire du site :</strong> Vincent Pruvost (Entrepreneur Individuel)</li>
                <li><strong>Email :</strong> contact@usepealo.com</li>
                <li><strong>SIRET :</strong> 941 612 962 00022</li>
                <li><strong>RCS :</strong> Dispensé d'immatriculation au Registre du Commerce et des Sociétés (RCS) et au Répertoire des Métiers (RM)</li>
                <li><strong>TVA :</strong> TVA non applicable, art. 293 B du CGI</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Hébergement</h2>
              <p>Le Site est hébergé par la société Vercel Inc., situé au 340 S Lemon Ave #4133 Walnut, CA 91789, USA. (https://vercel.com).</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Propriété intellectuelle</h2>
              <p>Vincent Pruvost est propriétaire des droits de propriété intellectuelle et détient les droits d'usage sur tous les éléments accessibles sur le site internet, notamment les textes, images, graphismes, logos, vidéos, architecture, icônes et sons.</p>
              <p className="mt-4">Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable de Vincent Pruvost.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Conditions Générales de Vente (CGV)</h2>
              <p>Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les services dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement exprès à son droit de rétractation.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Protection des données (RGPD)</h2>
              <p>Conformément au Règlement Général sur la Protection des Données (RGPD), les utilisateurs disposent d'un droit d'accès, de rectification et de suppression des données les concernant.</p>
              <p className="mt-4">Pour toute demande de suppression de vos données personnelles, veuillez nous contacter par email à : contact@usepealo.com.</p>
              <p className="mt-4">Nous nous engageons à traiter votre demande dans un délai de 30 jours conformément à la législation en vigueur.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation de responsabilité</h2>
              <p>Pealo ne pourra être tenu pour responsable des dommages directs et indirects causés au matériel de l’utilisateur, lors de l’accès au site usepealo.com. Pealo décline toute responsabilité quant à l’utilisation qui pourrait être faite des informations et contenus présents sur usepealo.com.</p>
            </section>
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
              <li><Link href="/legal" className="text-sm text-gray-600 hover:text-primary transition-colors">Legal notice</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
