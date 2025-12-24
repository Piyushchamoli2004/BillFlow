const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: false
    },
    tenantName: {
        type: String,
        required: true,
        trim: true
    },
    roomNumber: {
        type: String,
        required: true,
        trim: true
    },
    billMonth: {
        type: String,
        required: true
    },
    billYear: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    rentAmount: {
        type: Number,
        required: true,
        min: 0
    },
    electricityBill: {
        type: Number,
        default: 0,
        min: 0
    },
    waterBill: {
        type: Number,
        default: 0,
        min: 0
    },
    maintenanceFee: {
        type: Number,
        default: 0,
        min: 0
    },
    otherCharges: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'pending', 'overdue'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'online'],
        default: 'cash'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
billSchema.index({ userId: 1, date: -1 });
billSchema.index({ userId: 1, paymentStatus: 1 });
billSchema.index({ userId: 1, billMonth: 1, billYear: 1 });

// Virtual for bill identifier
billSchema.virtual('billNumber').get(function() {
    return `BILL-${this.billYear}-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Method to check if bill is overdue
billSchema.methods.isOverdue = function() {
    if (this.paymentStatus === 'paid') return false;
    return new Date() > this.dueDate;
};

// Update payment status based on due date
billSchema.pre('save', function(next) {
    if (this.paymentStatus !== 'paid' && new Date() > this.dueDate) {
        this.paymentStatus = 'overdue';
    }
    next();
});

module.exports = mongoose.model('Bill', billSchema);
