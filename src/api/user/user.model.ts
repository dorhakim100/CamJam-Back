import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  email: string
  password?: string
  name: string
  imgUrl?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.model<IUser>('User', userSchema)
