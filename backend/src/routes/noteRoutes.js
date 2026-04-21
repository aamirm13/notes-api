import express from "express";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getTagStats
} from "../controllers/noteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats/tags", authMiddleware, getTagStats);
router.get("/", authMiddleware, getNotes);
router.post("/", authMiddleware, createNote);
router.put("/:id", authMiddleware, updateNote);
router.delete("/:id", authMiddleware, deleteNote);

export default router;