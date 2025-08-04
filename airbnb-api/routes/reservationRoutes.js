const express = require('express');
const {
    getReservations,
    getReservation,
    getMyReservations,
    createReservation,
    updateReservation,
    cancelReservation,
    getRoomReservations
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router({ mergeParams: true });

// Protected routes (user must be logged in)
router.use(protect);

// User's reservations
router.get('/me', getMyReservations);

// Room-specific reservations
router.route('/')
    .get(authorize('admin'), getReservations);

router.route('/:id')
    .get(getReservation)
    .put(updateReservation)
    .delete(cancelReservation);

// Nested routes for room reservations
router.route('/rooms/:roomId')
    .post(createReservation);

// Admin routes for room-specific reservations
router.route('/rooms/:roomId/reservations')
    .get(authorize('admin'), getRoomReservations);

module.exports = router;
