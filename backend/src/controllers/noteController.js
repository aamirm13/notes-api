import mongoose from "mongoose";
import Note from "../models/Note.js";

export const getNotes = async (req, res) => {
  try {
    const { tag, search } = req.query;

    const filter = {
      user: req.user.id,
    };

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message,
    });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, tags, metadata } = req.body;

    const note = await Note.create({
      title,
      content,
      tags,
      metadata,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create note",
      error: error.message,
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    
    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this note",
      });
    }

    const updatedNote = await Note.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedNote,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update note",
      error: error.message,
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this note",
      });
    }

    await note.deleteOne();

    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};

export const getTagStats = async (req, res) => {
  try {
    const stats = await Note.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tag statistics",
      error: error.message,
    });
  }
};