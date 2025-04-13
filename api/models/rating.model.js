import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  equb: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equb',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate ratings from the same user for the same Equb
ratingSchema.index({ equb: 1, user: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;