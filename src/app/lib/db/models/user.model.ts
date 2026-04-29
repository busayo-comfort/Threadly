import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  conversations: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username:      { type: String, required: true, unique: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:      { type: String, required: true, select: false },
    avatar:        { type: String, default: "" },
    isOnline:      { type: Boolean, default: false },
    lastSeen:      { type: Date, default: Date.now },
    conversations: [{ type: Schema.Types.ObjectId, ref: "Conversation" }],
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);