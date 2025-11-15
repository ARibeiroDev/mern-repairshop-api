import type { Request, Response } from "express";
import { Note, type INote } from "../models/Note.js";
import { User, type IUser } from "../models/User.js";

// @desc Get all notes
// @route GET /notes
// @access Private
export const getAllNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  //Get all notes from MongoDB
  const notes = await Note.find().lean<INote[]>();

  //If no notes
  if (!notes?.length) {
    res.status(400).json({ message: "No notes found" });
    return;
  }

  //Add username to each note before sending the response
  //Also prossible with a for...of loop
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user)
        .select("-password")
        .lean<IUser>()
        .exec();
      return { ...note, username: user ? user.username : "User not found" };
    })
  );

  res.json(notesWithUser);
};

// @desc Create new note
// @route POST /notes
// @access Private

export const createNewNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { user, title, text } = req.body;

  //Confirm data
  if (!user || !title || !text) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  //Check duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean<INote>()
    .exec();

  if (duplicate) {
    res.status(409).json({ message: "Duplicate note title" });
    return;
  }

  //Create and store the new note
  const note = await Note.create({ user, title, text });

  if (note) {
    res.status(201).json({ message: "New note created" });
    return;
  } else {
    res.status(400).json({ message: "Invalid note data received" });
    return;
  }
};

// @desc Update a note
// @route PATCH /notes
// @access Private
export const updateNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id, user, title, text, completed } = req.body;

  //Confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  //Confirm note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    res.status(400).json({ message: "Note not found" });
    return;
  }

  //Check for duplicate title
  const duplicate = await Note.findOne({ title })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();

  //Allow renaming of the original note
  if (duplicate && duplicate?._id.toString() !== id) {
    res.status(409).json({ message: "Duplicate note title" });
    return;
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`'${updatedNote.title}' updated`);
};

// @desc Delete a note
// @route DELETE /notes
// @access Private
export const deleteNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.body;

  //Confirm data
  if (!id) {
    res.status(400).json({ message: "Note ID required" });
    return;
  }

  //Confirm note exists to delete
  const deletedNote = await Note.findByIdAndDelete(id).exec();

  if (!deletedNote) {
    res.status(400).json({ message: "Note not found" });
    return;
  }

  const reply = `Note ${deletedNote.title} with ID ${deletedNote._id} deleted`;

  res.json(reply);
};
