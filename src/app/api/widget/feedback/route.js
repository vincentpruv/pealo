import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Feedback from "@/models/Feedback";

// CORS headers for widget cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    await connectDB();

    // Get API key from header or body
    const apiKey =
      request.headers.get("X-API-Key") ||
      (await request.clone().json().catch(() => ({}))).apiKey;

    if (!apiKey) {
      return Response.json(
        { error: "API key is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find project by API key
    const project = await Project.findOne({ apiKey });
    if (!project) {
      return Response.json(
        { error: "Invalid API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (body.rating === undefined || body.rating === null) {
      return Response.json(
        { error: "Rating is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const ratingVal = parseInt(body.rating, 10);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return Response.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create feedback
    const feedback = await Feedback.create({
      projectId: project._id,
      type: body.type || "other",
      rating: ratingVal,
      message: body.message ? body.message.trim() : "",
      screenshot: body.screenshot || null,
      metadata: {
        url: body.metadata?.url || "",
        userAgent: body.metadata?.userAgent || "",
        os: body.metadata?.os || "",
        browser: body.metadata?.browser || "",
        screenSize: body.metadata?.screenSize || "",
        language: body.metadata?.language || "",
      },
    });

    // Send webhook notification if configured
    if (project.webhookUrl) {
      fetch(project.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "feedback.created",
          project: {
            id: project._id,
            name: project.name,
          },
          feedback: {
            id: feedback._id,
            type: feedback.type,
            rating: feedback.rating,
            message: feedback.message,
            hasScreenshot: !!feedback.screenshot,
            metadata: feedback.metadata,
            createdAt: feedback.createdAt,
          }
        }),
      }).catch((err) => {
        console.error("Webhook dispatch failed:", err);
      });
    }

    return Response.json(
      { success: true, id: feedback._id },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Widget feedback error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
