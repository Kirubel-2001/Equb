import mongoose from 'mongoose';

const CycleManagementSchema = new mongoose.Schema({
  equb: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equb',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Active'
  },
  restartRequests: {
    type: Number,
    default: 0
  },
  currentCycleNumber: {
    type: Number,
    default: 1
  },
  nextDrawDate: {
    type: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const CycleManagement = mongoose.model('CycleManagement', CycleManagementSchema);
export default CycleManagement;