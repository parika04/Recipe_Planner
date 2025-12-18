# Recipe Planner

A full-stack recipe planning application where users can search for recipes, save favorites, and plan meals.

## Features

- User authentication (Register, Login, Password Reset)
- Recipe search using TheMealDB API
- Save favorite recipes
- Weekly meal planning
- Password reset via email

## Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- Lucide React (icons)

**Backend:**
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Nodemailer (email service)

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for password reset emails)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**

   **Backend** (`Recipe_Planner/server/.env`):
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   EMAIL_FROM="Recipe Planner <your-email@gmail.com>"
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend** (optional, create `Recipe_Planner/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start the backend server:**
   ```bash
   cd server
   node server.js
   ```

4. **Start the frontend (in a new terminal):**
   ```bash
   npm start
   ```

## Email Setup

To enable password reset emails:

1. Enable 2-Step Verification on your Google Account
2. Generate a Gmail App Password at: https://myaccount.google.com/apppasswords
3. Add email credentials to `server/.env` file
4. See `server/SETUP_EMAIL.md` for detailed instructions

## MongoDB Setup

See `MONGODB_SETUP.md` for MongoDB Atlas connection guide.

## Available Scripts

- `npm start` - Start React development server
- `npm build` - Build for production
- `npm test` - Run tests

## Project Structure

```
Recipe_Planner/
├── server/              # Backend
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── utils/          # Email service
├── src/                # Frontend
│   ├── components/    # React components
│   └── api/           # API client functions
└── public/            # Static files
```

## License

MIT
