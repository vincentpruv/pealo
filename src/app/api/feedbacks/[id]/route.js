import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Feedback from "@/models/Feedback";
import Project from "@/models/Project";

export async function GET(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const feedback = await Feedback.findById(id).populate("projectId", "name userId");
  if (!feedback) {
    return Response.json({ error: "Feedback not found" }, { status: 404 });
  }

  // Verify ownership
  if (feedback.projectId.userId !== session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  return Response.json(feedback);
}

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const body = await request.json();

  const feedback = await Feedback.findById(id).populate("projectId", "userId");
  if (!feedback) {
    return Response.json({ error: "Feedback not found" }, { status: 404 });
  }

  if (feedback.projectId.userId !== session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (body.status) feedback.status = body.status;
  await feedback.save();

  return Response.json(feedback);
}

export async function DELETE(request, { params }) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const feedback = await Feedback.findById(id).populate("projectId", "userId");
  if (!feedback) {
    return Response.json({ error: "Feedback not found" }, { status: 404 });
  }

  if (feedback.projectId.userId !== session.user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  await Feedback.findByIdAndDelete(id);
  return Response.json({ message: "Feedback deleted" });
}
