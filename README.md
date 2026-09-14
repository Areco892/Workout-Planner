# Workout Planner Web Application

## Overview
This project is a full-stack workout planner web application that allows users to create workout plans, add exercises to workouts, and navigate through workouts in an interactive interface. The application is designed to help users organize and follow structured workout routines.

The system consists of a frontend interface for managing workouts and a backend server that handles data storage, workout management, and exercise organization.

## Features
- Create workout plans
- Add exercises to existing workout plans
- View all workout plans
- Navigate through exercises during a workout
- Scroll-based workout interface
- Persistent storage of workouts and exercises
- Backend API for workout and exercise management
- CRUD operations for workouts and exercises

## Tech Stack

### Frontend

- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express
- PostgreSQL

### The application follows a typical full-stack architecture:

- Frontend sends requests to backend API
- Backend processes requests and interacts with database
- Database stores workouts and exercises
- Backend returns data to frontend
- Frontend updates UI

## Main Components

- Frontend client
- Backend REST API
- Database
- Workout navigation interface
- API Endpoints (Example Section)

Method	Endpoint	Description
GET	/workouts	Get all workout plans
POST	/workouts	Create a workout plan
PUT	/workouts/:id	Update a workout
DELETE	/workouts/:id	Delete a workout
GET	/exercises	Get all exercises
POST	/exercises	Add exercise to workout

## Database Schema

### Tables / Collections

- Workouts
- Exercises
- WorkoutExercises (if relational)

#### Workout
- id
- name
- dateCreated

Exercise
- id
- name
- sets
- reps
- weight
- workoutId

## Installation and Setup

### Clone repository
`git clone git@github.com:Areco892/Workout-Planner.git`

### Go into the backend
`cd Workout-Planner/server`

### Install backend dependencies
`npm install`

### Configure the environment
Copy `.env.example` to `.env` and update `DATABASE_URL` for your local PostgreSQL instance.

Create the `workout_planner` database, then initialize its tables and shared exercise catalog:

`npm run db:setup`

### Start the backend during development
`npm run dev`

### Run the backend in production mode
`npm run build`

`npm start`

### Start frontend
Serve the files in `client` with a static web server.

Then open:
http://localhost:3000

## Testing

Route tests mock the service layer and do not require PostgreSQL:

`npm run test:unit`

Database integration tests use a separate local database. Create it once:

`npm run db:test:create`

Then run only the integration tests:

`npm run test:integration`

To run both groups:

`npm test`

The test database name must end in `_test`. Integration tests recreate its tables
and data, so never configure `TEST_DATABASE_URL` with a development or production
database.
