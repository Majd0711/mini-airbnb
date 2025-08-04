const express = require('express');
const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    checkAvailability
} = require('../controllers/roomController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.route('/')
    .get(getRooms);

router.route('/:id')
    .get(getRoom);

router.route('/:id/check-availability')
    .get(checkAvailability);

// Protected routes (admin only)
router.route('/')
    .post(protect, authorize('admin'), createRoom);

router.route('/:id')
    .put(protect, authorize('admin'), updateRoom)
    .delete(protect, authorize('admin'), deleteRoom);

module.exports = router;
