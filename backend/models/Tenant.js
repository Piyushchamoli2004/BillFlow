const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Tenant name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        sparse: true // Allow multiple null values
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    roomNumber: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true
    },
    rentAmount: {
        type: Number,
        required: [true, 'Rent amount is required'],
        min: [0, 'Rent amount cannot be negative']
    },
    depositAmount: {
        type: Number,
        default: 0,
        min: [0, 'Deposit amount cannot be negative']
    },
    joinDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    leaseEndDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'moved_out'],
        default: 'active'
    },
    address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    emergencyContact: {
        name: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        relation: {
            type: String,
            trim: true
        }
    },
    idProof: {
        type: {
            type: String,
            enum: ['aadhar', 'pan', 'passport', 'driving_license', 'voter_id']
        },
        number: {
            type: String,
            trim: true
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
tenantSchema.index({ userId: 1, status: 1 });
tenantSchema.index({ userId: 1, roomNumber: 1 });
tenantSchema.index({ phone: 1 });

// Virtual for tenant identifier
tenantSchema.virtual('tenantId').get(function() {
    return `TNT-${this._id.toString().slice(-6).toUpperCase()}`;
});

// Method to check if lease is expiring soon (within 30 days)
tenantSchema.methods.isLeaseExpiringSoon = function() {
    if (!this.leaseEndDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.leaseEndDate <= thirtyDaysFromNow && this.leaseEndDate >= new Date();
};

// Method to calculate total stay duration
tenantSchema.methods.getStayDuration = function() {
    const start = this.joinDate;
    const end = this.status === 'moved_out' ? this.updatedAt : new Date();
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
        days: diffDays,
        months: Math.floor(diffDays / 30),
        years: Math.floor(diffDays / 365)
    };
};

module.exports = mongoose.model('Tenant', tenantSchema);
