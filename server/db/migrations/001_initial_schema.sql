BEGIN;

CREATE TABLE exercise (
    eid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    image VARCHAR(255),
    description TEXT,
    target VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL
);

CREATE TABLE workout (
    wid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_exercise (
    id SERIAL PRIMARY KEY,
    wid INTEGER NOT NULL REFERENCES workout(wid) ON DELETE CASCADE,
    eid INTEGER NOT NULL REFERENCES exercise(eid) ON DELETE CASCADE,
    sets INTEGER,
    weight INTEGER,
    reps INTEGER,
    UNIQUE (wid, eid)
);

COMMIT;
