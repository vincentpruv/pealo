const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Read local .env
const envPath = path.join(__dirname, ".env");
if (!fs.existsSync(envPath)) {
  console.error("Could not find .env file at:", envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const MONGODB_URI = env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in env file");
  process.exit(1);
}

// Define schemas
const UserSchema = new mongoose.Schema({
  email: String,
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const ProjectSchema = new mongoose.Schema({
  name: String,
  domain: String,
  userId: String,
  apiKey: String,
});
const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

const FeedbackSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    type: { type: String, enum: ["bug", "suggestion", "question", "other"], default: "other" },
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
  },
  { timestamps: true }
);
const Feedback = mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);

const rawMockMessages = [
  { type: "bug", rating: 1, message: "Impossible de valider le formulaire de checkout, l'application tourne dans le vide." },
  { type: "suggestion", rating: 5, message: "Ce produit a changé notre organisation interne. Pouvez-vous ajouter un bouton d'export CSV ?" },
  { type: "question", rating: 4, message: "Bonjour, est-il possible de connecter mon propre serveur SMTP pour l'envoi des invitations ?" },
  { type: "bug", rating: 2, message: "Le bouton principal de validation sort de l'écran sur mon smartphone en mode paysage." },
  { type: "suggestion", rating: 4, message: "Un indicateur visuel lors de la sauvegarde automatique des tags serait appréciable." },
  { type: "other", rating: 5, message: "Super fluide, rien à redire. L'installation a pris moins de trois minutes." },
  { type: "bug", rating: 2, message: "La page d'accueil crash parfois avec une erreur 502 sous Safari mobile." },
  { type: "question", rating: 3, message: "Quels sont les pays supportés pour la passerelle de paiement intégrée ?" },
  { type: "suggestion", rating: 4, message: "Il serait utile d'avoir une vue calendrier pour planifier les relances automatiques." },
  { type: "other", rating: 5, message: "La réactivité du support est impressionnante. Problème réglé en 15 minutes !" }
];

const osList = ["macOS", "Windows", "iOS", "Android", "Linux"];
const browserList = ["Chrome", "Safari", "Firefox", "Edge"];
const langList = ["fr", "en", "es"];

// Generate 30 feedbacks
const mockFeedbacks = [];
for (let i = 0; i < 30; i++) {
  const base = rawMockMessages[i % rawMockMessages.length];
  const ratingShift = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
  const finalRating = Math.max(1, Math.min(5, base.rating + ratingShift));
  
  mockFeedbacks.push({
    type: base.type,
    rating: finalRating,
    message: `${base.message} (Feedback test #${i + 1})`,
    status: i % 3 === 0 ? "resolved" : i % 3 === 1 ? "in_progress" : "new",
    metadata: {
      url: `https://usepealo.com/page-${i % 4}`,
      os: osList[i % osList.length],
      browser: browserList[i % browserList.length],
      language: langList[i % langList.length]
    }
  });
}

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");

    // Find the user
    const user = await User.findOne({ email: "vincent.al.pruvost@gmail.com" });
    if (!user) {
      console.error("User vincent.al.pruvost@gmail.com not found in database. Log in once on the site first.");
      process.exit(1);
    }
    console.log(`Found user: ${user._id}`);

    // Find or create a project for this user
    let project = await Project.findOne({ userId: user._id.toString() });
    if (!project) {
      console.log("No project found. Creating a default project 'Mon premier Widget'...");
      project = await Project.create({
        name: "Mon premier Widget",
        domain: "usepealo.com",
        userId: user._id.toString(),
        apiKey: "fl_8dc5496857d1ba0c11967e5968ae1ee97fdce1ccadee9c5a"
      });
    } else {
      console.log("Updating existing project's API key to match the site's widget key...");
      project.apiKey = "fl_8dc5496857d1ba0c11967e5968ae1ee97fdce1ccadee9c5a";
      await project.save();
    }
    console.log(`Using project: ${project.name} (${project._id})`);

    const feedbacksWithProj = mockFeedbacks.map((f) => ({
      ...f,
      projectId: project._id,
    }));

    console.log(`Inserting ${feedbacksWithProj.length} mock feedbacks...`);
    const result = await Feedback.insertMany(feedbacksWithProj);
    console.log(`Successfully inserted ${result.length} feedbacks!`);
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

seed();
