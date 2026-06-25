import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Project from "@/models/Project";

export async function GET(request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  await connectDB();

  const { searchParams } = request.nextUrl;
  const projectId = searchParams.get("projectId");
  const format = searchParams.get("format") || "csv";

  if (!projectId) {
    return new Response("Project ID is required", { status: 400 });
  }

  // Verify ownership
  const project = await Project.findOne({ _id: projectId, userId: session.user.id });
  if (!project) {
    return new Response("Project not found", { status: 404 });
  }

  const feedbacks = await Feedback.find({ projectId }).sort({ createdAt: -1 }).lean();

  if (format === "json") {
    return new Response(JSON.stringify(feedbacks, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="feedbacks-${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json"`,
      },
    });
  } else {
    const headers = ["ID", "Rating", "Message", "Status", "Date", "URL", "Browser", "OS"];
    const rows = feedbacks.map(f => {
      return [
        f._id.toString(),
        f.rating || "",
        `"${(f.message || "").replace(/"/g, '""')}"`,
        f.status || "",
        new Date(f.createdAt).toISOString(),
        `"${f.metadata?.url || ""}"`,
        `"${f.metadata?.browser || ""}"`,
        `"${f.metadata?.os || ""}"`
      ].join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="feedbacks-${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv"`,
      },
    });
  }
}
