BEGIN;

INSERT INTO exercise (name, image, description, target, difficulty)
VALUES
    ('Abdominal Twists', 'img/abdominal-twists.webp', 'A seated rotational movement for the core.', 'Core', 'Beginner'),
    ('Biceps Curls', 'img/biceps-curls.webp', 'A standing curl that trains the biceps.', 'Biceps', 'Beginner'),
    ('Calf Raises', 'img/calf-raises.webp', 'A heel-raising movement that trains the calves.', 'Calves', 'Beginner'),
    ('Chest Fly', 'img/chest-fly.webp', 'A chest isolation movement performed with an arc motion.', 'Chest', 'Intermediate'),
    ('Chest Press', 'img/chest-press.webp', 'A pressing movement that trains the chest.', 'Chest', 'Beginner'),
    ('Deadlift', 'img/deadlift.webp', 'A compound hip-hinge movement for the posterior chain.', 'Back', 'Advanced'),
    ('Dumbbell Row', 'img/dumbbell-row.webp', 'A pulling movement that trains the upper back.', 'Back', 'Intermediate'),
    ('Front Raises', 'img/front-raises.webp', 'A shoulder raise performed in front of the body.', 'Shoulders', 'Beginner'),
    ('Hammer Bicep Curl', 'img/hammer-bicep-curl.webp', 'A neutral-grip curl for the biceps and forearms.', 'Biceps', 'Intermediate'),
    ('Hammer Grip Wrist Curl', 'img/hammer-grip-wrist-curl.webp', 'A neutral-grip wrist movement for the forearms.', 'Forearms', 'Beginner'),
    ('Incline Bicep Curls', 'img/incline-bicep-curls.webp', 'A biceps curl performed against an incline bench.', 'Biceps', 'Intermediate'),
    ('Lateral Raises', 'img/lateral-raises.webp', 'A side raise that trains the shoulders.', 'Shoulders', 'Beginner'),
    ('Lunges', 'img/lunges.webp', 'A single-leg movement that trains the lower body.', 'Quadriceps', 'Beginner'),
    ('Overhead Tricep Extension', 'img/overhead-tricep-extension.webp', 'An overhead extension that trains the triceps.', 'Triceps', 'Intermediate'),
    ('Preacher Curls', 'img/preacher-curls.webp', 'A supported curl that isolates the biceps.', 'Biceps', 'Intermediate'),
    ('Pull Over', 'img/pull-over.webp', 'A shoulder-extension movement that trains the back.', 'Back', 'Intermediate'),
    ('Shoulder Press', 'img/shoulder-press.webp', 'An overhead pressing movement for the shoulders.', 'Shoulders', 'Intermediate'),
    ('Situps', 'img/situps.webp', 'A trunk-flexion exercise for the core.', 'Core', 'Beginner'),
    ('Squats', 'img/squats.webp', 'A compound lower-body movement.', 'Quadriceps', 'Intermediate'),
    ('Tricep Kickbacks', 'img/tricep-kickbacks.webp', 'An elbow-extension movement that isolates the triceps.', 'Triceps', 'Beginner'),
    ('Wrist Curls', 'img/wrist-curls.webp', 'A wrist-flexion movement that trains the forearms.', 'Forearms', 'Beginner')
ON CONFLICT (name) DO UPDATE SET
    image = EXCLUDED.image,
    description = EXCLUDED.description,
    target = EXCLUDED.target,
    difficulty = EXCLUDED.difficulty;

COMMIT;
