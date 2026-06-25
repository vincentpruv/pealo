import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const project = await Project.findOne({
    _id: id,
    userId: session.user.id,
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(project);
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const body = await request.json();

  const project = await Project.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    {
      ...(body.name && { name: body.name }),
      ...(body.domain !== undefined && { domain: body.domain }),
      ...(body.widgetConfig && { widgetConfig: body.widgetConfig }),
      ...(body.webhookUrl !== undefined && { webhookUrl: body.webhookUrl }),
    },
    { new: true }
  );

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json(project);
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const project = await Project.findOneAndDelete({
    _id: id,
    userId: session.user.id,
  });

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json({ message: "Project deleted" });
}
