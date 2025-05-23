import mongoose from 'mongoose'

export interface RRoom extends mongoose.Document {
  title: string
  description: string
  price: number
  createdBy: mongoose.Types.ObjectId
  imgUrl?: string
  createdAt: Date
  updatedAt: Date
}

const roomSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

export const Room = mongoose.model<RRoom>('Room', roomSchema)
