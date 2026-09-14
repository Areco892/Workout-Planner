import express from "express";
import cors from "cors";
import workoutRoutes from "./routes/workout.routes";
import exerciseRoutes from "./routes/exercise.routes";
import { errorHandler } from "./middleware/error-handler";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/workouts", workoutRoutes);
app.use("/exercises", exerciseRoutes);

// Error handling must be registered after every route.
app.use(errorHandler);

export default app;
