const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    checkInDate: {
        type: Date,
        required: [true, 'Please provide a check-in date']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Please provide a check-out date']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Please provide the total price']
    },
    guests: {
        type: Number,
        required: [true, 'Please provide the number of guests'],
        min: [1, 'Number of guests must be at least 1']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'cancelled'],
        default: 'pending'
    },
    specialRequests: {
        type: String,
        maxlength: [500, 'Special requests cannot be more than 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Validate that check-out date is after check-in date
reservationSchema.pre('save', function(next) {
    if (this.checkOutDate <= this.checkInDate) {
        throw new Error('Check-out date must be after check-in date');
    }
    next();
});

// Add index for better query performance
reservationSchema.index({ user: 1, room: 1, checkInDate: 1, checkOutDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
