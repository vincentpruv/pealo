import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Project from "@/models/Project";
import { generateInsights } from "@/lib/ai";
import mongoose from "mongoose";

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }

  // Verify user owns the project
  const project = await Project.findOne({
    _id: projectId,
    userId: session.user.id,
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch recent feedbacks for this project
  const feedbacks = await Feedback.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  if (feedbacks.length === 0) {
    return Response.json(
      { error: "No feedbacks to analyze" },
      { status: 400 }
    );
  }

  // Get MongoDB database object from Mongoose connection to query user usage
  const db = mongoose.connection.db;
  const userId = session.user.id;
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  let userDoc = null;
  try {
    userDoc = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(userId) });
  } catch (err) {
    console.error("[Pealo] Error fetching user for AI usage check:", err);
  }

  if (userDoc) {
    const usage = userDoc.aiUsage;
    if (usage && usage.month === currentMonth && usage.count >= 20) {
      return Response.json(
        { error: "AI analysis limit reached (20 requests per month)." },
        { status: 403 }
      );
    }
  }

  try {
    const insights = await generateInsights(feedbacks);

    // Save insights to Project database doc
    await Project.updateOne(
      { _id: projectId },
      {
        $set: {
          aiInsights: {
            insights,
            analyzedCount: feedbacks.length,
            projectName: project.name,
          },
        },
      }
    );

    // Increment AI usage count
    try {
      if (userDoc && userDoc.aiUsage && userDoc.aiUsage.month === currentMonth) {
        await db.collection("users").updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $inc: { "aiUsage.count": 1 } }
        );
      } else {
        await db.collection("users").updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          { $set: { aiUsage: { month: currentMonth, count: 1 } } }
        );
      }
    } catch (dbErr) {
      console.error("[Pealo] Failed to increment AI usage count:", dbErr);
    }

    return Response.json({
      insights,
      analyzedCount: feedbacks.length,
      projectName: project.name,
    });
  } catch (error) {
    if (error.message === "AI_NOT_CONFIGURED") {
      return Response.json(
        { error: "AI is not configured. Add your AI_API_KEY in .env.local." },
        { status: 503 }
      );
    }
    console.error("[Pealo] AI Insights error:", error);
    return Response.json(
      { error: "Failed to generate insights. Please try again." },
      { status: 500 }
    );
  }
}
