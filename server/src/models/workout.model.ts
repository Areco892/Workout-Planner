import pool from "../db";

export async function getExercises(workoutId: number) {
    const workout = await pool.query(
        "SELECT 1 FROM workout WHERE wid = $1",
        [workoutId],
    );
    if (workout.rowCount === 0) {
        return null;
    }

    const exercises = await pool.query(
        `SELECT *
        FROM workout w
        JOIN workout_exercise we
        ON w.wid = we.wid
        JOIN exercise e
        ON e.eid = we.eid
        WHERE w.wid = $1
        ORDER BY e.eid;`,
        [workoutId]
    );
    return exercises.rows;
}
