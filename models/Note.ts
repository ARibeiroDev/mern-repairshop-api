import mongoose, { Schema, model, Document } from "mongoose";
import mongooseSequence from "mongoose-sequence";
// @ts-ignore
const AutoIncrement: any = mongooseSequence(mongoose);

export interface INote extends Document {
  user: Schema.Types.ObjectId;
  title: string;
  text: string;
  completed: boolean;
  ticket?: number; // auto-increment field
}

const noteSchema = new Schema<INote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.plugin(AutoIncrement, {
  inc_field: "ticket", // creates a ticket field inside the noteSchema
  id: "ticketNums", // a second collection named counters will be created and there the id will be visible
  start_seq: 500, // tickets start counting from 500
});

export const Note = model<INote>("Note", noteSchema);
