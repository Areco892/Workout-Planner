import pool from "../db";

export async function getWorkouts() {
    const result = await pool.query(
        "SELECT * FROM workout ORDER BY created_at",
    );
    return result.rows;
}

export async function getExercises(workoutId: number) {
    const workout = await pool.query(
        "SELECT 1 FROM workout WHERE wid = $1",
        [workoutId],
    );
    if (workout.rowCount === 0) {
        return null;
    }

    const exercises = await pool.query(
        `SELECT e.eid, e.name, e.image, e.description, e.target, e.difficulty,
                we.sets, we.weight, we.reps
        FROM workout_exercise we
        JOIN exercise e
        ON e.eid = we.eid
        WHERE we.wid = $1
        ORDER BY e.eid;`,
        [workoutId]
    );
    return exercises.rows;
}

export async function createWorkout(name: string) {
    const result = await pool.query(
        "INSERT INTO workout (name) VALUES ($1) RETURNING *",
        [name],
    );
    return result.rows[0];
}

export async function updateWorkout(workoutId: number, name: string) {
    const result = await pool.query(
        "UPDATE workout SET name = $1 WHERE wid = $2",
        [name, workoutId],
    );
    return result.rowCount !== 0;
}

export async function deleteWorkout(workoutId: number) {
    const result = await pool.query(
        "DELETE FROM workout WHERE wid = $1",
        [workoutId],
    );
    return result.rowCount !== 0;
}

export async function deleteExercise(workoutId: number, exerciseId: number) {
    const result = await pool.query(
        "DELETE FROM workout_exercise WHERE wid = $1 AND eid = $2",
        [workoutId, exerciseId],
    );
    return result.rowCount !== 0;
}
