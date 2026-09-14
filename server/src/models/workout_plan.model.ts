import pool from "../db";

export async function getWorkouts(){
    const workouts = await pool.query(`SELECT * FROM workout ORDER BY created_at;`);
    return workouts.rows;
}

export async function getExercises(workoutId: number) {
    const workout = await pool.query(
        `SELECT 1 FROM workout WHERE wid = $1`,
        [workoutId]
    );
    if (workout.rowCount === 0) {
        return null;
    }
    
    const exercises = await pool.query(
        `SELECT e.eid, e.name, we.sets, we.weight, we.reps
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

export async function createWorkout(name: string) {
    const newWorkout = await pool.query(
        `INSERT INTO workout (name, created_at) VALUES ($1, NOW()) RETURNING *`,
        [name]
    );
    
    return newWorkout.rows[0];
}

export async function updateWorkout(workoutId: number, workoutName: string) {
    const result = await pool.query(
        `UPDATE workout
        SET name = $1
        WHERE wid = $2;`,
        [workoutName, workoutId]
    );
    return result.rowCount !== 0;
}

export async function deleteWorkout(workoutId: number) {
    const result = await pool.query(
        "DELETE FROM workout WHERE wid = $1",
        [workoutId]
    );
    return result.rowCount !== 0;
}

export async function deleteExercise(wid: number, eid: number) {
    const result = await pool.query(
        `DELETE FROM workout_exercise WHERE wid = $1 AND eid = $2`, 
        [wid, eid]
    );
    return result.rowCount !== 0;
}
