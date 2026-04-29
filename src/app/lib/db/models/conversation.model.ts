import mongoose, { model, models, Schema } from "mongoose";

// ─── Conversation ─────────────────────────────────────────────────────────────
export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId | null;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants:  [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessage:   { type: Schema.Types.ObjectId, ref: "Message", default: null },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate conversations between same pair
ConversationSchema.index({ participants: 1 });

export const Conversation =
  models.Conversation || model<IConversation>("Conversation", ConversationSchema);



