import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Project from "@/models/Project";

export async function GET(request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = request.nextUrl;
  const projectId = searchParams.get("projectId");
  const type = searchParams.get("type");
  const ratings = searchParams.get("ratings") || searchParams.get("rating");
  const statuses = searchParams.get("statuses") || searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  // Parse filters
  const ratingFilter = ratings 
    ? ratings.split(",").map((r) => parseInt(r.trim(), 10)).filter((r) => !isNaN(r)) 
    : [];
  const statusFilter = statuses 
    ? statuses.split(",").map((s) => s.trim()).filter(Boolean) 
    : [];

  // Verify user owns the project
  if (projectId) {
    const project = await Project.findOne({
      _id: projectId,
      userId: session.user.id,
    });
    if (!project) {
      return Response.json({ error: "Project not found" }, { status: 404 });
    }
  } else {
    // Get all projects for user
    const userProjects = await Project.find({ userId: session.user.id });
    const projectIds = userProjects.map((p) => p._id);

    const query = { projectId: { $in: projectIds } };
    if (type) query.type = type;
    if (ratingFilter.length > 0) query.rating = { $in: ratingFilter };
    if (statusFilter.length > 0) query.status = { $in: statusFilter };

    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("projectId", "name");

    return Response.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  const query = { projectId };
  if (type) query.type = type;
  if (ratingFilter.length > 0) query.rating = { $in: ratingFilter };
  if (statusFilter.length > 0) query.status = { $in: statusFilter };

  const total = await Feedback.countDocuments(query);
  const feedbacks = await Feedback.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return Response.json({
    feedbacks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
