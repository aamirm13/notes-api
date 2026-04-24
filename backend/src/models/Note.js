import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.every((tag) => typeof tag === "string");
        },
        message: "All tags must be strings",
      },
    },

    metadata: {
      pinned: {
        type: Boolean,
        default: false,
      },
    },
      priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

    date: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
noteSchema.index({ tags: 1 });
noteSchema.index({ title: "text", content: "text" });

const Note = mongoose.model("Note", noteSchema);

export default Note;