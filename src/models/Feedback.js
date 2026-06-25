import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["bug", "suggestion", "question", "other"],
      default: "other",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
      trim: true,
    },
    screenshot: {
      type: String,
      default: null,
    },
    metadata: {
      url: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      os: { type: String, default: "" },
      browser: { type: String, default: "" },
      screenSize: { type: String, default: "" },
      language: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["new", "in_progress", "resolved"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Feedback ||
  mongoose.model("Feedback", FeedbackSchema);
