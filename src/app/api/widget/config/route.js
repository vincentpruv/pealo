import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams = new URL(request.url).searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey") || request.headers.get("X-API-Key");

    if (!apiKey) {
      return Response.json(
        { error: "API key is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const project = await Project.findOne({ apiKey });
    if (!project) {
      return Response.json(
        { error: "Invalid API key" },
        { status: 401, headers: corsHeaders }
      );
    }

    return Response.json(
      { 
        name: project.name, 
        widgetConfig: project.widgetConfig || {} 
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Widget config error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
