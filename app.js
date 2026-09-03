const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utilities/AppError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

// Start Express App
const app = express();

app.set('trust proxy', 1);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// This is for the api features
app.set('query parser', 'extended');

// 1) Global Middlewares
// Implement CORS
app.use(cors()); // Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({ origin: 'https://www.natours.com' }));

app.options('/{*splat}', cors());
// app.options('/api/v1/tours/:id', cors())

// Serving Static Files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// Set Security HTTP Headers
// app.use(helmet());
// Added this because of Mapbox
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://cdn.jsdelivr.net',
          'https://js.stripe.com',
        ],
        styleSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com',
          "'unsafe-inline'",
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://api.mapbox.com'],
        connectSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://cdn.jsdelivr.net',
        ],
        frameSrc: [
          "'self'",
          'https://js.stripe.com',
          'https://hooks.stripe.com',
        ],
        workerSrc: ["'self'", 'blob:'],
      },
    },
  }),
);

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2) Rate Limiting From Same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// Body Parser, Reading Data From Body Into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization Against NoSQL Query Injection
// app.use(mongoSanitize());

app.use((req, res, next) => {
  req.body = mongoSanitize.sanitize(req.body);

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = mongoSanitize.sanitize(req.query);
    Object.keys(req.query).forEach((key) => delete req.query[key]);
    Object.assign(req.query, sanitizedQuery);
  }

  req.params = mongoSanitize.sanitize(req.params);
  next();
});

// Data Sanitization Against XSS
// app.use(xss());

const sanitizeStrings = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitizeStrings(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  sanitizeStrings(req.body);
  sanitizeStrings(req.query);
  sanitizeStrings(req.params);
  next();
});

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 3) Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all(/* '*' */ '/{*splat}', (req, res, next) => {
  //  res.status(404).json({
  //    status: 'fail',
  //    message: `Can't find ${req.originalUrl} on this server!`,
  //  });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  //  err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
