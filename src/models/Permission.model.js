const mongoose = require('mongoose')
const permissionSchema = new mongoose.Schema({
  action:      { type: String, required: true },
  resource:    { type: String, required: true },
  description: { type: String },
  conditions:  { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true })
permissionSchema.index({ action: 1, resource: 1 }, { unique: true })
module.exports = mongoose.model('Permission', permissionSchema)
