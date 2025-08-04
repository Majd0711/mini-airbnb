const ErrorResponse = require('../utils/errorResponse');
const Reservation = require('../models/reservation');
const Room = require('../models/room');

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin
exports.getReservations = async (req, res, next) => {
    try {
        res.status(200).json(res.advancedResults);
    } catch (err) {
        next(err);
    }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id)
            .populate({
                path: 'room',
                select: 'title price images'
            })
            .populate({
                path: 'user',
                select: 'name email'
            });

        if (!reservation) {
            return next(
                new ErrorResponse(`Reservation not found with id of ${req.params.id}`, 404)
            );
        }

        // Make sure user is reservation owner or admin
        if (reservation.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to view this reservation`, 401)
            );
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get current user's reservations
// @route   GET /api/reservations/me
// @access  Private
exports.getMyReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find({ user: req.user.id })
            .populate({
                path: 'room',
                select: 'title price images'
            });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new reservation
// @route   POST /api/rooms/:roomId/reservations
// @access  Private
exports.createReservation = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.user = req.user.id;
        
        // Add room from URL params
        req.body.room = req.params.roomId;

        // Check if room exists
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return next(
                new ErrorResponse(`Room not found with id of ${req.params.roomId}`, 404)
            );
        }

        // Check if room is available for the selected dates
        const { checkInDate, checkOutDate, guests } = req.body;

        if (!checkInDate || !checkOutDate) {
            return next(
                new ErrorResponse('Please provide both check-in and check-out dates', 400)
            );
        }

        if (new Date(checkInDate) >= new Date(checkOutDate)) {
            return next(
                new ErrorResponse('Check-out date must be after check-in date', 400)
            );
        }

        // Check if room is available for the selected dates
        const conflictingReservations = await Reservation.find({
            room: req.params.roomId,
            $or: [
                {
                    checkInDate: { $lt: new Date(checkOutDate) },
                    checkOutDate: { $gt: new Date(checkInDate) }
                }
            ]
        });

        if (conflictingReservations.length > 0) {
            return next(
                new ErrorResponse('The room is not available for the selected dates', 400)
            );
        }

        // Check if number of guests exceeds room capacity
        if (guests > room.capacity) {
            return next(
                new ErrorResponse(`This room can accommodate maximum ${room.capacity} guests`, 400)
            );
        }

        // Calculate total price
        const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
        const totalPrice = room.price * nights;

        // Create reservation
        const reservation = await Reservation.create({
            ...req.body,
            totalPrice,
            status: 'confirmed' // You might want to add payment processing before confirming
        });

        res.status(201).json({
            success: true,
            data: reservation
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private
exports.updateReservation = async (req, res, next) => {
    try {
        let reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return next(
                new ErrorResponse(`Reservation not found with id of ${req.params.id}`, 404)
            );
        }

        // Make sure user is reservation owner or admin
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to update this reservation`, 401)
            );
        }

        // If updating dates, check availability
        if (req.body.checkInDate || req.body.checkOutDate) {
            const checkInDate = req.body.checkInDate || reservation.checkInDate;
            const checkOutDate = req.body.checkOutDate || reservation.checkOutDate;

            const conflictingReservations = await Reservation.find({
                room: reservation.room,
                _id: { $ne: reservation._id }, // Exclude current reservation
                $or: [
                    {
                        checkInDate: { $lt: new Date(checkOutDate) },
                        checkOutDate: { $gt: new Date(checkInDate) }
                    }
                ]
            });

            if (conflictingReservations.length > 0) {
                return next(
                    new ErrorResponse('The room is not available for the selected dates', 400)
                );
            }

            // Recalculate total price if dates changed
            if (req.body.checkInDate || req.body.checkOutDate) {
                const room = await Room.findById(reservation.room);
                const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
                req.body.totalPrice = room.price * nights;
            }
        }

        // Update reservation
        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Private
exports.cancelReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return next(
                new ErrorResponse(`Reservation not found with id of ${req.params.id}`, 404)
            );
        }

        // Make sure user is reservation owner or admin
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return next(
                new ErrorResponse(`User ${req.user.id} is not authorized to cancel this reservation`, 401)
            );
        }

        // Check if reservation can be cancelled (e.g., not in the past)
        if (new Date() > new Date(reservation.checkInDate)) {
            return next(
                new ErrorResponse('Cannot cancel a reservation that has already started', 400)
            );
        }

        // Instead of deleting, update status to cancelled
        reservation.status = 'cancelled';
        await reservation.save();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get reservations by room
// @route   GET /api/rooms/:roomId/reservations
// @access  Private/Admin
// @note    This is useful for admins to see all reservations for a specific room
exports.getRoomReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find({ room: req.params.roomId })
            .populate({
                path: 'user',
                select: 'name email'
            });

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (err) {
        next(err);
    }
};
