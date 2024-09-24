import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    email: { type: String, required: true, uniqued: true },
  },
  {
    timestamps: true,
  },
)

export const PostModel = mongoose.models.Post || mongoose.model('Post', userSchema)
