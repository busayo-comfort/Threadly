import mongoose, { Schema, Document, model, models } from "mongoose";

export type MessageStatus = "sent" | "delivered" | "read";
export type MessageType = "text" | "image" | "file";

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: MessageType;
  status: MessageStatus;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender:         { type: Schema.Types.ObjectId, ref: "User", required: true },
    content:        { type: String, required: true },
    type:           { type: String, enum: ["text", "image", "file"], default: "text" },
    status:         { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    readBy:         [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// Critical — speeds up fetching chat history per conversation
MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = models.Message || model<IMessage>("Message", MessageSchema);