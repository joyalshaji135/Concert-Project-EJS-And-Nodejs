const express = require('express');
const router = express.Router();
const concertController = require('../controllers/concertController');
const upload = require('../config/multer');
const { isLoggedIn, isAdmin } = require('../middleware/auth');

// Public Routes

router.get('/new', isLoggedIn, isAdmin, (req, res) => {
    res.render('concerts/new'); // views/concerts/new.ejs
});

// Get All Bookings
router.get('/get-all-booking', isLoggedIn, isAdmin, concertController.getAllBookingsAdmin);

// Get all concerts
router.get('/', isLoggedIn, isAdmin,concertController.getAllConcerts);

// Get single concert
router.get('/:id', isLoggedIn, isAdmin,concertController.getConcert);

//     Admin-Protected Routes

// Show new concert form
router.get('/new', isLoggedIn, isAdmin, concertController.getCreateForm);


router.get('/settings', isLoggedIn, isAdmin, concertController.getAllConcertsAdmin);
// Create new concert
router.post('/', isLoggedIn, isAdmin, upload.single('image'), concertController.createConcert);

// Show edit form
router.get('/:id/edit', isLoggedIn, isAdmin, concertController.getEditForm);

// Update concert
router.put('/:id', isLoggedIn, isAdmin, upload.single('image'), concertController.updateConcert);

// Delete concert
router.delete('/:id', isLoggedIn, isAdmin, concertController.deleteConcert);



module.exports = router;