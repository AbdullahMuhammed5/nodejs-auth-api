const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandlers/errorHandler');

const authRouter = require('./routes/api/authRoutes');
const { protect, restrictTo } = require('./middlewares/auth');
const { ROLES } = require('./models/userModel');
const AppError = require('./utils/appError');

// Start express app
const app = express();

app.enable('trust proxy');

// Implement CORS
app.use(cors({
    origin: [
        'http://localhost:3000',
    ],
}));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Routes
app.use('/api/v1/users', authRouter);

app.get('/api/v1/products/list', protect, restrictTo(ROLES.ADMIN, ROLES.SUPERVISOR), function(req, res){
    return res.end().status(200).json({status: "success"});
});

app.delete('/api/v1/products/delete', protect, restrictTo(ROLES.ADMIN), function(req, res){
    return res.end().status(200).json({status: "success"});
});

app.get('/api/v1/protected', protect, function(req, res){
    return res.end().status(200);
});

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app; 
