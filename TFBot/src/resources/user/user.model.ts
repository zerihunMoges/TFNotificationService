import mongoose from "mongoose";

interface IUser {
  name: string;
  chatId: string;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  chatId: {
    type: String || Number,
    required: true,
  },
});

export const User = mongoose.model<IUser>("User", UserSchema);
