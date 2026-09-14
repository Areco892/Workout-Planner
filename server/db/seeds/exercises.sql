BEGIN;

INSERT INTO exercise (name, image, target, difficulty)
VALUES
    ('Abdominal Twists', 'img/abdominal-twists.webp', 'Core', 'Beginner'),
    ('Biceps Curls', 'img/biceps-curls.webp', 'Biceps', 'Beginner'),
    ('Calf Raises', 'img/calf-raises.webp', 'Calves', 'Beginner'),
    ('Chest Fly', 'img/chest-fly.webp', 'Chest', 'Intermediate'),
    ('Chest Press', 'img/chest-press.webp', 'Chest', 'Beginner'),
    ('Deadlift', 'img/deadlift.webp', 'Back', 'Advanced'),
    ('Dumbbell Row', 'img/dumbbell-row.webp', 'Back', 'Intermediate'),
    ('Front Raises', 'img/front-raises.webp', 'Shoulders', 'Beginner'),
    ('Hammer Bicep Curl', 'img/hammer-bicep-curl.webp', 'Biceps', 'Intermediate'),
    ('Hammer Grip Wrist Curl', 'img/hammer-grip-wrist-curl.webp', 'Forearms', 'Beginner'),
    ('Incline Bicep Curls', 'img/incline-bicep-curls.webp', 'Biceps', 'Intermediate'),
    ('Lateral Raises', 'img/lateral-raises.webp', 'Shoulders', 'Beginner'),
    ('Lunges', 'img/lunges.webp', 'Quadriceps', 'Beginner'),
    ('Overhead Tricep Extension', 'img/overhead-tricep-extension.webp', 'Triceps', 'Intermediate'),
    ('Preacher Curls', 'img/preacher-curls.webp', 'Biceps', 'Intermediate'),
    ('Pull Over', 'img/pull-over.webp', 'Back', 'Intermediate'),
    ('Shoulder Press', 'img/shoulder-press.webp', 'Shoulders', 'Intermediate'),
    ('Situps', 'img/situps.webp', 'Core', 'Beginner'),
    ('Squats', 'img/squats.webp', 'Quadriceps', 'Intermediate'),
    ('Tricep Kickbacks', 'img/tricep-kickbacks.webp', 'Triceps', 'Beginner'),
    ('Wrist Curls', 'img/wrist-curls.webp', 'Forearms', 'Beginner')
ON CONFLICT (name) DO UPDATE SET
    image = EXCLUDED.image,
    target = EXCLUDED.target,
    difficulty = EXCLUDED.difficulty;

COMMIT;
