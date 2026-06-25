import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const projects = await Project.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return Response.json(projects);
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  
  // Check plan and existing project count
  const projectCount = await Project.countDocuments({ userId: session.user.id });
  const userPlan = session.user.plan || "none";
  
  if (userPlan === "none") {
    return Response.json(
      { error: "No active plan: Subscribe to Basic or Pro to create a widget." },
      { status: 403 }
    );
  }
  
  if (userPlan === "basic" && projectCount >= 1) {
    return Response.json(
      { error: "Limit reached: Upgrade to Pro to create more than 1 website." },
      { status: 403 }
    );
  }

  const body = await request.json();

  const project = await Project.create({
    userId: session.user.id,
    name: body.name,
    domain: body.domain || "",
  });

  return Response.json(project, { status: 201 });
}
