import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Project from "@/models/Project";
import { generateInsights } from "@/lib/ai";

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

  try {
    const insights = await generateInsights(feedbacks);
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
