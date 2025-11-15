import express from "express";
const router = express.Router();
import {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
} from "../controllers/notesController.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

router.use(verifyJWT); // applies to all routes inside this file

router
  .route("/")
  .get(getAllNotes)
  .post(createNewNote)
  .patch(updateNote)
  .delete(deleteNote);

export default router;
