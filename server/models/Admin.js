const mongoose = require('mongoose');

// Check if model already exists before defining
const Admin = mongoose.models.Admin || mongoose.model('Admin', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: true
    }
}, { timestamps: true }));

module.exports = Admin; 