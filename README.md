# University Athlete Profile System

This is a system for managing university sports athletes' profiles, including personal data, training records, and fitness metrics.

## Features

- View athlete profiles with name, age, physical data, training history, and fitness scores
- Search athletes by name or age
- Select and view detailed information for individual athletes

## Setup

### Prerequisites

- Node.js
- MongoDB (running locally on port 27017)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start MongoDB
2. Start the backend server:
   ```
   cd backend
   npm run dev
   ```
3. Start the frontend:
   ```
   cd ../frontend
   npm run dev
   ```
4. Open http://localhost:5173 in your browser

## API Endpoints

- GET /api/athletes - Get all athletes
- GET /api/athletes/:id - Get athlete by ID
- POST /api/athletes - Create new athlete
- PUT /api/athletes/:id - Update athlete
- DELETE /api/athletes/:id - Delete athlete
- GET /api/athletes/search/:query - Search athletes

## Technologies Used

- Frontend: React with Vite
- Backend: Node.js with Express
- Database: MongoDB with Mongoose