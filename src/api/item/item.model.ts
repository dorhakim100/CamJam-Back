import mongoose from 'mongoose'

export interface IItem extends mongoose.Document {
  title: string
  description: string
  price: number
  createdBy: mongoose.Types.ObjectId
  imgUrl?: string
  createdAt: Date
  updatedAt: Date
}

const itemSchema = new mongoose.Schema(
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

export const Item = mongoose.model<IItem>('Item', itemSchema)
