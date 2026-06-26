import mongoose from "mongoose";
import crypto from "crypto";

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    domain: {
      type: String,
      trim: true,
      default: "",
    },
    apiKey: {
      type: String,
      unique: true,
      default: () => `fl_${crypto.randomBytes(24).toString("hex")}`,
    },
    widgetConfig: {
      color: { type: String, default: "#06AB78" },
      position: { type: String, enum: ["right", "left"], default: "right" },
      buttonText: { type: String, default: "Send feedback" },
      bgColor: { type: String, default: "#ffffff" },
      btnColorOpen: { type: String, default: "#ffffff" },
      title: { type: String, default: "Send us your feedback" },
      showSubtitle: { type: Boolean, default: true },
      subtitle: { type: String, default: "We appreciate your thoughts and ideas." },
      includePaths: { type: String, default: "" },
      excludePaths: { type: String, default: "" },
      showOnDesktop: { type: Boolean, default: true },
      showOnMobile: { type: Boolean, default: true },
      autoOpenTrigger: { type: String, enum: ["none", "time", "scroll", "exit_intent", "element"], default: "none" },
      autoOpenValue: { type: Number, default: 0 },
      autoOpenPages: { type: String, default: "" },
      autoOpenSelector: { type: String, default: "" },
    },

    webhookUrl: {
      type: String,
      trim: true,
      default: "",
    },
    aiInsights: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
