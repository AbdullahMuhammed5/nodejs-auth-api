const express = require('express');
const authController = require('../../controllers/api/authController');
const { protect } = require('../../middlewares/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', protect, authController.logout);

module.exports = router;