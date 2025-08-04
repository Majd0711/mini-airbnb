const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the room'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
        maxlength: [2000, 'Description cannot be more than 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price per night'],
        min: [0, 'Price cannot be negative']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Please provide an address']
        },
        city: {
            type: String,
            required: [true, 'Please provide a city']
        },
        country: {
            type: String,
            required: [true, 'Please provide a country']
        }
    },
    capacity: {
        type: Number,
        required: [true, 'Please provide the room capacity'],
        min: [1, 'Capacity must be at least 1']
    },
    amenities: [{
        type: String,
        trim: true
    }],
    images: [{
        url: String,
        altText: String
    }],
    isAvailable: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create text index for search functionality
roomSchema.index({ 
    'title': 'text', 
    'description': 'text',
    'location.address': 'text',
    'location.city': 'text',
    'location.country': 'text'
});

module.exports = mongoose.model('Room', roomSchema);
