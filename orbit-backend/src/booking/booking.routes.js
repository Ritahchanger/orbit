// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const asyncWrapper = require('../middlewares/asyncMiddleware');
const availabilityController = require('./availability.contoller');
const bookingController = require('./booking.controller');
const consultationController = require('./consultation.controller');
const tokenValidator = require("../middlewares/tokenValidator");




// Public routes
router.get('/availability', asyncWrapper(availabilityController.getAvailability));
router.get('/check-date/:date', asyncWrapper(availabilityController.checkDateValidity));
router.get('/time-slots/:date', asyncWrapper(availabilityController.getTimeSlots));
router.get('/consultation-types', asyncWrapper(consultationController.getConsultationTypes));
router.get('/consultation-types/:id', asyncWrapper(consultationController.getConsultationTypeById));
router.post('/', asyncWrapper(bookingController.createBooking));
router.get('/:referenceNumber', asyncWrapper(bookingController.getBooking));
router.post('/:referenceNumber/cancel', asyncWrapper(bookingController.cancelBooking));



// ==================== ADMIN ROUTES (Requires Authentication) ====================
router.use(tokenValidator);
router.post('/consultation-types',  asyncWrapper(consultationController.createConsultationType));
router.put('/consultation-types/:id', asyncWrapper(consultationController.updateConsultationType));
router.delete('/consultation-types/:id',  asyncWrapper(consultationController.deleteConsultationType));
router.patch('/consultation-types/:id/toggle', asyncWrapper(consultationController.toggleConsultationTypeStatus));
router.post('/consultation-types/reorder',  asyncWrapper(consultationController.reorderConsultationTypes));


router.use('/admin', tokenValidator);
router.put('/availability',  asyncWrapper(availabilityController.updateAvailability));
router.get('/admin/bookings',  asyncWrapper(bookingController.getAllBookings));
module.exports = router;