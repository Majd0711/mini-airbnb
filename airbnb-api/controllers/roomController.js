const ErrorResponse = require('../utils/errorResponse');
const Room = require('../models/room');
const Reservation = require('../models/reservation');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
    try {
        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit'];

        // Loop over removeFields and delete them from reqQuery
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string
        let queryStr = JSON.stringify(reqQuery);

        // Create operators ($gt, $gte, etc)
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        // Finding resource
        let query = Room.find(JSON.parse(queryStr));

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Room.countDocuments(JSON.parse(queryStr));

        query = query.skip(startIndex).limit(limit);

        // Executing query
        const rooms = await query;

        // Pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        res.status(200).json({
            success: true,
            count: rooms.length,
            pagination,
            data: rooms
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return next(
                new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
            );
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private/Admin
exports.createRoom = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.owner = req.user.id;

        const room = await Room.create(req.body);

        res.status(201).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res, next) => {
    try {
        let room = await Room.findById(req.params.id);

        if (!room) {
            return next(
                new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
            );
        }

        // Make sure user is room owner or admin
        if (room.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to update this room`, 401)
            );
        }

        room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return next(
                new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
            );
        }

        // Make sure user is room owner or admin
        if (room.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to delete this room`, 401)
            );
        }

        // Check for future reservations
        const futureReservations = await Reservation.find({
            room: req.params.id,
            checkInDate: { $gte: new Date() }
        });

        if (futureReservations.length > 0) {
            return next(
                new ErrorResponse('Cannot delete room with future reservations', 400)
            );
        }

        await room.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Check room availability
// @route   GET /api/rooms/:id/check-availability
// @access  Public
exports.checkAvailability = async (req, res, next) => {
    try {
        const { checkInDate, checkOutDate } = req.query;

        if (!checkInDate || !checkOutDate) {
            return next(
                new ErrorResponse('Please provide both check-in and check-out dates', 400)
            );
        }

        // Check if room exists
        const room = await Room.findById(req.params.id);
        if (!room) {
            return next(
                new ErrorResponse(`Room not found with id of ${req.params.id}`, 404)
            );
        }

        // Check for conflicting reservations
        const conflictingReservations = await Reservation.find({
            room: req.params.id,
            $or: [
                {
                    checkInDate: { $lt: new Date(checkOutDate) },
                    checkOutDate: { $gt: new Date(checkInDate) }
                }
            ]
        });

        const isAvailable = conflictingReservations.length === 0;

        res.status(200).json({
            success: true,
            data: {
                isAvailable,
                availableMessage: isAvailable 
                    ? 'Room is available for the selected dates' 
                    : 'Room is not available for the selected dates',
                conflictingReservations: isAvailable ? [] : conflictingReservations
            }
        });
    } catch (err) {
        next(err);
    }
};
