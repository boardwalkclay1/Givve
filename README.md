# Giveaway Carnival 🎉

A donation-based giveaway app where every donor receives a sequential number. Hit a prize's magic donor number and you win!

## Tech Stack

- **Frontend**: Vanilla HTML / CSS / JS (PWA-ready with service worker)
- **Backend**: Node.js + Express (ES Modules)
- **Database**: MongoDB (Mongoose)
- **Payments**: PayPal SDK

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in your values
cp .env.example .env

# 3. Start the server
npm start
```

The server listens on `http://localhost:4000` by default.

## Environment Variables

| Variable   | Required | Description |
|------------|----------|-------------|
| `MONGO_URI` | ✅ Yes   | MongoDB connection string (Atlas or self-hosted) |
| `PORT`      | No       | HTTP port (Railway sets this automatically) |

## Deploying to Railway

1. Push this repository to GitHub.
2. In the [Railway dashboard](https://railway.app), click **New Project → Deploy from GitHub repo** and select this repo.
3. Add the `MONGO_URI` environment variable in **Settings → Variables**.
4. Railway will automatically detect the `npm start` script and deploy.

> **Note:** Railway injects `PORT` automatically. The server already reads `process.env.PORT` so no extra configuration is needed.

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/donations` | Record a donation and check for a winner |
| `GET`  | `/api/prizes` | List all prizes |
| `POST` | `/api/prizes/seed` | Seed initial prize data |
| `POST` | `/api/users/signup` | Create a new user account |
| `POST` | `/api/users/login` | Log in with email & password |
