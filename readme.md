# Natours

Natours is a tour-booking web application built with Node.js, Express, MongoDB, and Pug. It includes server-rendered pages and a REST API for tours, users, reviews, and bookings.

## Features

- Browse tours and view tour details, locations, ratings, and reviews
- Sign up, log in, update account details, and reset passwords
- Create, update, and manage tours, users, reviews, and bookings with role-based access
- Search tours by location and distance, and view tour statistics and monthly plans
- Create Stripe Checkout sessions for tour bookings
- Upload tour and user images

## Requirements

- Node.js 18 or newer
- MongoDB connection string and database credentials
- Stripe test credentials for the booking integration
- Email provider credentials for welcome and password-reset emails

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a `config.env` file in the project root. The server loads this file on startup. Set the following values:

   ```dotenv
   NODE_ENV=development
   PORT=3000
   DATABASE=mongodb+srv://<username>:<PASSWORD>@<cluster>/<database>
   DATABASE_PASSWORD=your-mongodb-password

   JWT_SECRET=use-a-long-random-secret
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90

   STRIPE_SECRET_KEY=sk_test_your-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

   EMAIL_FROM=you@example.com
   EMAIL_HOST=your-smtp-host
   EMAIL_PORT=2525
   EMAIL_USERNAME=your-smtp-username
   EMAIL_PASSWORD=your-smtp-password

   BREVO_API_KEY=your-brevo-api-key
   ```

   The server replaces `<PASSWORD>` in `DATABASE` with `DATABASE_PASSWORD` at runtime. `STRIPE_SECRET_KEY` must be set for the app to start because the Stripe client is initialized during startup; configure the webhook secret to verify Stripe webhook events. In development, email is sent through SMTP; in production, the app sends email through Brevo's API. Keep real credentials private: `config.env` is ignored by Git and should not be committed. Configure the JWT values before using authentication.

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

For a regular Node.js start, use `npm start`. The app connects to the MongoDB database specified by `DATABASE`.

## Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the server with Nodemon |
| `npm start` | Start the server with Node.js |
| `npm run build:js` | Build the browser JavaScript bundle |
| `npm run watch:js` | Rebuild browser JavaScript when source files change |
| `npm run lint` | Run ESLint |

## Loading sample data

The repository includes sample tours, users, and reviews in `dev-data/data`. With `config.env` configured, run:

```sh
node dev-data/data/import-dev-data.js --import
```

To delete all tours, users, and reviews from the configured database, run:

```sh
node dev-data/data/import-dev-data.js --delete
```

Use the delete command carefully; it removes those collections' data from the selected database.

## Routes

### Web pages

- `/` — tour overview
- `/tour/:slug` — tour details
- `/login` and `/signup` — account access
- `/me` — account settings
- `/my-tours` — the signed-in user's booked tours

### API

The REST API is rooted at `/api/v1`:

- `/tours` — tours, tour statistics, geospatial search, and monthly plans
- `/users` — authentication, account management, and user administration
- `/reviews` — reviews, also available under `/tours/:tourId/reviews`
- `/bookings` — booking management and Stripe checkout sessions

Most API endpoints require authentication. Creating or managing resources is restricted by user role.
