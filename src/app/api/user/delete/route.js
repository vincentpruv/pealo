import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import Feedback from "@/models/Feedback";
import mongoose from "mongoose";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = session.user.id;

  try {
    // 1. Get all projects of the user
    const projects = await Project.find({ userId });
    const projectIds = projects.map((p) => p._id);

    // 2. Delete all feedbacks for these projects
    if (projectIds.length > 0) {
      await Feedback.deleteMany({ projectId: { $in: projectIds } });
    }

    // 3. Delete all projects
    await Project.deleteMany({ userId });

    // 4. Delete user records from next-auth collections (users, accounts, sessions)
    let userObjId;
    try {
      userObjId = new mongoose.Types.ObjectId(userId);
    } catch (e) {
      userObjId = userId; // Fallback if it's already a string ID
    }

    // Delete sessions, accounts, and the user
    const db = mongoose.connection.db;
    await db.collection("sessions").deleteMany({ userId: userObjId });
    await db.collection("accounts").deleteMany({ userId: userObjId });
    await db.collection("users").deleteOne({ _id: userObjId });

    return Response.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Failed to delete account:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
