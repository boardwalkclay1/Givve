import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    maxlength: 254
  },
  // NOTE: always store a hashed password here, never plain text.
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: '', maxlength: 100, trim: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
