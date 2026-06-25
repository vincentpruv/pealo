import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get project ID
  const { id } = await params;

  await connectDB();
  const project = await Project.findOne({ _id: id, userId: session.user.id });
  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  if (!project.domain) {
    return Response.json({ installed: false, reason: "No domain configured" });
  }

  try {
    let targetUrl = project.domain;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "PealoIntegrationVerifier/1.0",
      },
      next: { revalidate: 0 }, // avoid caching issues
    });

    if (!res.ok) {
      return Response.json({ 
        installed: false, 
        reason: `Could not load page (HTTP ${res.status})` 
      });
    }

    const html = await res.text();
    
    // Search for widget source and correct API Key
    const hasWidgetScript = html.includes("feedback-widget.js");
    const hasCorrectApiKey = html.includes(project.apiKey);

    if (hasWidgetScript && hasCorrectApiKey) {
      return Response.json({ installed: true });
    } else if (hasWidgetScript) {
      return Response.json({ 
        installed: false, 
        reason: "Widget script found but with a different API key" 
      });
    } else {
      return Response.json({ 
        installed: false, 
        reason: "Widget script tag not found in HTML" 
      });
    }
  } catch (err) {
    console.error("Verification fetch error:", err);
    return Response.json({ 
      installed: false, 
      reason: "Could not connect to the domain. Make sure it's accessible." 
    });
  }
}
