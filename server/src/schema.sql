CREATE TABLE exercise(
    eid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    target VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL
);

CREATE TABLE workout(
    wid SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE workout_exercise(
    id SERIAL PRIMARY KEY,
    wid INTEGER NOT NULL,
    eid INTEGER NOT NULL,
    sets INTEGER,
    weight INTEGER,
    reps INTEGER,

    FOREIGN KEY (wid) REFERENCES workout(wid) ON DELETE CASCADE,
    FOREIGN KEY (eid) REFERENCES exercise(eid) ON DELETE CASCADE,
    UNIQUE (wid, eid)
);
