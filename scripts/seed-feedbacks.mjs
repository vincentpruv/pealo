import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse .env.local manually
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIndex = trimmed.indexOf("=");
  if (eqIndex === -1) continue;
  const key = trimmed.substring(0, eqIndex);
  const value = trimmed.substring(eqIndex + 1);
  process.env[key] = value;
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

// Define schemas inline to avoid ESM import issues
const ProjectSchema = new mongoose.Schema({
  userId: String,
  name: String,
  domain: String,
  apiKey: String,
  widgetConfig: mongoose.Schema.Types.Mixed,
  webhookUrl: String,
}, { timestamps: true });

const FeedbackSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  type: { type: String, enum: ["bug", "suggestion", "question", "other"] },
  rating: { type: Number, min: 1, max: 5 },
  message: { type: String, trim: true },
  screenshot: { type: String, default: null },
  metadata: {
    url: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    os: { type: String, default: "" },
    browser: { type: String, default: "" },
    screenSize: { type: String, default: "" },
    language: { type: String, default: "" },
  },
  status: { type: String, enum: ["new", "in_progress", "resolved"], default: "new" },
}, { timestamps: true });

const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

const fakeFeedbacks = [
  {
    type: "bug",
    rating: 1,
    message: "Le bouton de connexion ne fonctionne pas sur Safari. J'ai essayé plusieurs fois mais rien ne se passe quand je clique dessus.",
    metadata: { url: "https://monsite-test.com/login", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15", os: "macOS", browser: "Safari", screenSize: "1440x900", language: "fr" },
    status: "new",
  },
  {
    type: "suggestion",
    rating: 4,
    message: "Ce serait super d'avoir un mode sombre ! L'interface est vraiment bien faite mais le blanc est un peu agressif le soir.",
    metadata: { url: "https://monsite-test.com/dashboard", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", os: "Windows", browser: "Chrome", screenSize: "1920x1080", language: "fr" },
    status: "new",
  },
  {
    type: "bug",
    rating: 2,
    message: "La page de paiement affiche une erreur 500 quand j'essaie de valider avec une carte Visa. Stripe semble ne pas répondre.",
    metadata: { url: "https://monsite-test.com/checkout", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36", os: "Linux", browser: "Firefox", screenSize: "2560x1440", language: "en" },
    status: "in_progress",
  },
  {
    type: "question",
    rating: 3,
    message: "Est-ce que vous prévoyez une intégration avec Slack pour recevoir les notifications de feedback en temps réel ?",
    metadata: { url: "https://monsite-test.com/integrations", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", os: "macOS", browser: "Chrome", screenSize: "1680x1050", language: "fr" },
    status: "new",
  },
  {
    type: "other",
    rating: 5,
    message: "Bravo pour le design ! C'est la plus belle interface SaaS que j'ai vue cette année. Continuez comme ça, votre produit est incroyable.",
    metadata: { url: "https://monsite-test.com/", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15", os: "iOS", browser: "Safari", screenSize: "390x844", language: "fr" },
    status: "resolved",
  },
  {
    type: "bug",
    rating: 1,
    message: "Impossible de télécharger le fichier PDF depuis la page des rapports. Le téléchargement commence puis s'arrête immédiatement.",
    metadata: { url: "https://monsite-test.com/reports", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", os: "Windows", browser: "Edge", screenSize: "1366x768", language: "es" },
    status: "new",
  },
  {
    type: "suggestion",
    rating: 4,
    message: "Vous devriez ajouter un raccourci clavier pour naviguer entre les feedbacks. Genre Cmd+J / Cmd+K comme dans les éditeurs de code.",
    metadata: { url: "https://monsite-test.com/dashboard/feedbacks", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", os: "macOS", browser: "Chrome", screenSize: "1440x900", language: "fr" },
    status: "new",
  },
  {
    type: "suggestion",
    rating: 5,
    message: "J'adorerais pouvoir personnaliser les couleurs du widget pour matcher avec ma charte graphique. Peut-être un color picker ?",
    metadata: { url: "https://monsite-test.com/dashboard/settings", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", os: "Windows", browser: "Chrome", screenSize: "1920x1080", language: "fr" },
    status: "resolved",
  },
  {
    type: "bug",
    rating: 2,
    message: "Le widget de feedback ne s'affiche pas du tout sur mon site en production. Il marche en localhost mais pas une fois déployé sur Vercel.",
    metadata: { url: "https://monsite-test.com/docs/widget", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", os: "macOS", browser: "Firefox", screenSize: "1440x900", language: "en" },
    status: "in_progress",
  },
  {
    type: "question",
    rating: 3,
    message: "Comment est-ce que je peux exporter mes feedbacks au format CSV ? Je ne trouve pas l'option dans le dashboard.",
    metadata: { url: "https://monsite-test.com/dashboard", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", os: "Windows", browser: "Chrome", screenSize: "1920x1080", language: "fr" },
    status: "resolved",
  },
  {
    type: "other",
    rating: 4,
    message: "Le temps de chargement de la page d'accueil est un peu long. J'ai mesuré environ 3.5 secondes sur une connexion fibre.",
    metadata: { url: "https://monsite-test.com/", userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36", os: "Linux", browser: "Chrome", screenSize: "1920x1080", language: "de" },
    status: "new",
  },
  {
    type: "bug",
    rating: 1,
    message: "Sur mobile, le menu hamburger ne se ferme pas après avoir cliqué sur un lien. Il faut recharger la page à chaque fois.",
    metadata: { url: "https://monsite-test.com/pricing", userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36", os: "Android", browser: "Chrome", screenSize: "412x915", language: "fr" },
    status: "new",
  },
  {
    type: "suggestion",
    rating: 5,
    message: "Pensez à ajouter des webhooks Discord ! Beaucoup de développeurs utilisent Discord pour leurs communautés et ça serait un game changer.",
    metadata: { url: "https://monsite-test.com/integrations", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", os: "macOS", browser: "Chrome", screenSize: "2560x1600", language: "fr" },
    status: "new",
  },
  {
    type: "question",
    rating: 3,
    message: "Y a-t-il une limite au nombre de feedbacks qu'on peut recevoir par mois avec le plan gratuit ?",
    metadata: { url: "https://monsite-test.com/pricing", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", os: "Windows", browser: "Firefox", screenSize: "1920x1080", language: "fr" },
    status: "new",
  },
  {
    type: "other",
    rating: 2,
    message: "Les emails de notification arrivent dans les spams sur Gmail. Vous devriez peut-être vérifier votre configuration SPF et DKIM.",
    metadata: { url: "https://monsite-test.com/dashboard/settings", userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", os: "macOS", browser: "Safari", screenSize: "1440x900", language: "fr" },
    status: "in_progress",
  },
];

async function seed() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!");

  // Find the first project (the test site)
  const projects = await Project.find({}).lean();
  if (projects.length === 0) {
    console.error("❌ No projects found in the database. Create a project first.");
    process.exit(1);
  }

  console.log(`\n📋 Found ${projects.length} project(s):`);
  projects.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} (${p._id})`));

  // Use the first project
  const project = projects[0];
  console.log(`\n🎯 Seeding feedbacks into project: "${project.name}" (${project._id})`);

  // Spread creation dates over the last 30 days
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;

  const docs = fakeFeedbacks.map((fb, i) => ({
    ...fb,
    projectId: project._id,
    createdAt: new Date(now - Math.random() * thirtyDays),
    updatedAt: new Date(now - Math.random() * thirtyDays * 0.5),
  }));

  const result = await Feedback.insertMany(docs);
  console.log(`\n✅ Successfully inserted ${result.length} fake feedbacks!`);
  console.log("\n📊 Breakdown:");
  console.log(`  🐛 Bugs: ${docs.filter(d => d.type === "bug").length}`);
  console.log(`  💡 Suggestions: ${docs.filter(d => d.type === "suggestion").length}`);
  console.log(`  ❓ Questions: ${docs.filter(d => d.type === "question").length}`);
  console.log(`  📝 Other: ${docs.filter(d => d.type === "other").length}`);

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from MongoDB. Done!");
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
