            import { exerciseApi, workoutApi } from "./api.js";
            let exerciseContainer = document.getElementById("exercise-container");

            const exercisePanel = document.getElementById("exercise-panel");
            const addExerciseBtn = document.getElementById("add-exercise");
            const editExerciseBtn = document.getElementById("edit-exercise");

            const newWorkoutPanel = document.getElementById("new-workout-panel");
            const addWorkoutBtn = document.getElementById("add-workout");

            const workoutPanel = document.getElementById("workout-panel");
            const addExerciseToWorkoutBtn = document.getElementById("add-exercise-to-workout");
            const notification = document.getElementById("notification");

            const exerciseFilter = document.getElementById("filter");

            const difficultLevel = { "Beginner": "beginner", "Intermediate": "intermediate", "Advanced": "advanced" };

            /************************
                    Server-side     
            ************************/
            async function serverGetExercises(difficulty, target) {
                try {
                    return await exerciseApi.list(difficulty, target);
                }
                catch (error) {
                    console.error(error);
                }
            }

            async function serverCreateExercise(exerciseName, exerciseImage, exerciseTargetMuscle, exerciseDifficulty) {
                try {
                    return await exerciseApi.create({
                        name: exerciseName,
                        image: exerciseImage,
                        target: exerciseTargetMuscle,
                        difficulty: exerciseDifficulty,
                    });
                } catch (error) {
                    console.error(error);
                }
            }

            async function serverUpdateExercise(exerciseId, exerciseName, exerciseImage, exerciseTargetMuscle, exerciseDifficulty) {
                try {
                    return await exerciseApi.update(exerciseId, {
                        name: exerciseName,
                        image: exerciseImage,
                        target: exerciseTargetMuscle,
                        difficulty: exerciseDifficulty,
                    });
                } catch (error) {
                    console.error(error);
                }
            }

            async function serverDeleteExercise(exerciseId) {
                try {
                    return await exerciseApi.delete(exerciseId);
                } catch (error) {
                    console.error(error);
                }
            }

            async function serverGetWorkouts(){
                try {
                    return await workoutApi.list();
                } catch (error) {
                    console.error(error);
                }
            }

            async function serverAddExercise(workoutId, exerciseId, exerciseSets, exerciseWeight, exerciseReps) {
                try {
                    return await exerciseApi.addToWorkout({
                        wid: workoutId,
                        eid: exerciseId,
                        sets: exerciseSets,
                        weight: exerciseWeight,
                        reps: exerciseReps,
                    });
                } catch (error) {
                    console.error(error);
                    return error.message;
                }
            }

            async function serverCreateWorkout(workoutName) {
                return workoutApi.create(workoutName);
            }

            /************************
                    Client-side     
            ************************/
            function createExercise(exercise) {
                // Create the exercise section
                let exerciseSection = document.createElement("section");
                exerciseSection.id = exercise.eid;
                exerciseSection.classList = "exercise-item";

                // Create the individual components of an exercise
                let exerciseName = document.createElement("h2");
                exerciseName.textContent = exercise.name;

                let exerciseImage = document.createElement("img");
                exerciseImage.src = exercise.image;
                exerciseImage.alt = exercise.description;
                
                let exerciseTargetMuscle = document.createElement("span");
                exerciseTargetMuscle.textContent = exercise.target;

                let exerciseDifficulty = document.createElement("span");
                exerciseDifficulty.textContent = exercise.difficulty;
                exerciseDifficulty.classList = difficultLevel[exercise.difficulty];

                let exerciseDifficultyTag = document.createElement("div");
                exerciseDifficultyTag.classList = "tag"
                let difficulty = document.createElement("p");
                difficulty.textContent = "Difficulty: ";
                exerciseDifficultyTag.appendChild(difficulty);
                exerciseDifficultyTag.appendChild(exerciseDifficulty);

                let exerciseTargetTag = document.createElement("div");
                exerciseTargetTag.classList = "tag";
                let target = document.createElement("p");
                target.textContent = "Target Muscle: ";
                exerciseTargetTag.appendChild(target);
                exerciseTargetTag.appendChild(exerciseTargetMuscle);
                
                let exerciseAddBtn = document.createElement("button");
                exerciseAddBtn.type = "button";
                exerciseAddBtn.classList = "add-btn";
                exerciseAddBtn.textContent = "Add Exercise";

                let exerciseEditBtn = document.createElement("button");
                exerciseEditBtn.type = "button";
                exerciseEditBtn.classList = "edit-btn";
                exerciseEditBtn.textContent = "Edit Exercise";

                let deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.classList = "delete-btn";
                deleteButton.textContent = "Delete";

                let buttonPanel = document.createElement("div");
                buttonPanel.classList = "button-panel";
                buttonPanel.appendChild(exerciseAddBtn);
                buttonPanel.appendChild(exerciseEditBtn);
                buttonPanel.appendChild(deleteButton);

                // Add all the elements of an exercise to the exercise section
                exerciseSection.appendChild(exerciseName);
                exerciseSection.appendChild(exerciseImage);
                exerciseSection.appendChild(exerciseDifficultyTag);
                exerciseSection.appendChild(exerciseTargetTag);
                exerciseSection.appendChild(buttonPanel);

                // Add the newly created exercise to the exercise container
                exerciseContainer.appendChild(exerciseSection);
            }

            async function initialRender() {
                const difficulty = exerciseFilter.difficulty.value;
                const target = exerciseFilter.target.value;
                const exercises = await serverGetExercises(difficulty, target);
                exercises.forEach(exercise => {
                    createExercise(exercise);
                });
                const params = new URLSearchParams(window.location.search);
                const workoutId = params.get("wid");
                await loadWorkout();
                if (workoutId) {
                    const workoutName = workoutPanel.querySelector("#workout")
                    workoutName.value = workoutId;
                }
            }
            initialRender();

            async function showExercises() {
                exerciseContainer.querySelectorAll(".exercise-item").forEach(item => {
                    item.classList.add("hide");
                });
                const difficulty = exerciseFilter.difficulty.value;
                const target = exerciseFilter.target.value;
                const exercises = await serverGetExercises(difficulty, target);
                exercises.forEach(exercise => {
                    const exerciseItem = document.getElementById(`${exercise.eid}`);
                    exerciseItem.classList.remove("hide");
                });
            }
            
            async function addExercise() {
                const exerciseName = exercisePanel.name.value;
                const exerciseImage = exercisePanel.image.value;
                const exerciseTargetMuscle = exercisePanel.target.value;
                const exerciseDifficulty = exercisePanel.difficulty.value;
                const newExercise = await serverCreateExercise(exerciseName, exerciseImage, exerciseTargetMuscle, exerciseDifficulty);
                createExercise(newExercise.rows[0]);
            }

            function editExercise() {
                const exerciseId = exercisePanel.id.value;
                const exerciseName = exercisePanel.name.value;
                const exerciseImage = exercisePanel.image.value;
                const exerciseTargetMuscle = exercisePanel.target.value;
                const exerciseDifficulty = exercisePanel.difficulty.value;
                serverUpdateExercise(exerciseId, exerciseName, exerciseImage, exerciseTargetMuscle, exerciseDifficulty);
                
                let currentExercise = document.getElementById(`${exerciseId}`);
                currentExercise.querySelector("h2").textContent = exerciseName;
                currentExercise.querySelector("img").src = exerciseImage;
                currentExercise.querySelectorAll("span")[0].textContent = exerciseTargetMuscle;
                currentExercise.querySelectorAll("span")[1].textContent = exerciseDifficulty;
            }

            function loadExerciseDetails(e) {
                if (e.target && e.target.classList.contains("edit-btn")) {
                    const exercise = e.target.closest("section");
                    exercisePanel.id.value = exercise.id || "";
                    exercisePanel.name.value = exercise.querySelector("h2").textContent || "";
                    exercisePanel.image.value = exercise.querySelector("img").src || "";
                    exercisePanel.difficulty.value = exercise.querySelectorAll("span")[0].textContent || "";
                    exercisePanel.target.value = exercise.querySelectorAll("span")[1].textContent || "";
                }
            }

            function deleteExercise(e) {
                if (e.target && e.target.classList.contains("delete-btn")) {
                    const exercise = e.target.closest("section");
                    const exerciseId = exercise.id;
                    serverDeleteExercise(exerciseId);
                    exercise.remove();
                }
            }
            
            async function loadWorkout() {
                const workouts = await serverGetWorkouts();
                workoutPanel.querySelector("select").innerHTML = "";
                workouts.forEach(workout => {
                    const workoutItem = document.createElement("option");
                    workoutItem.value = workout.wid;
                    workoutItem.textContent = workout.name;
                    workoutPanel.querySelector("select").appendChild(workoutItem);
                });
            }

            async function loadExerciseToWorkoutForm(e) {
                if (e.target && e.target.classList.contains("add-btn")) {
                    workoutPanel.querySelector("#exercise-name").value = e.target.closest("section").querySelector("h2").textContent; 
                    workoutPanel.eid.value = e.target.closest("section").id;
                }
            }

            function notifyExerciseAddition(message) {
                notification.textContent = message;
                notification.classList.add("show");
                setTimeout(() => {notification.classList.remove("show");}, 2000);
            }

            async function addExerciseToWorkout() {
                const wid = workoutPanel.workout.value;
                const eid = workoutPanel.eid.value;
                const sets = workoutPanel.sets.value;
                const weight = workoutPanel.weight.value;
                const reps = workoutPanel.reps.value;
                const response = await serverAddExercise(wid, eid, sets, weight, reps);
                notifyExerciseAddition(response);
                resetAddToWorkoutForm();
            }

            function resetAddToWorkoutForm() {
                workoutPanel.name.value = "";
                workoutPanel.eid.value = "";
                workoutPanel.sets.value = "";
                workoutPanel.weight.value = "";
                workoutPanel.reps.value = "";
            }

            async function addWorkout() {
                const workoutName = newWorkoutPanel.name.value;
                await serverCreateWorkout(workoutName);
            }
            
            addExerciseBtn.addEventListener("click", addExercise);
            editExerciseBtn.addEventListener("click", editExercise);
            exerciseContainer.addEventListener("click", loadExerciseToWorkoutForm);
            exerciseContainer.addEventListener("click", deleteExercise);
            exerciseContainer.addEventListener("click", loadExerciseDetails);
            exerciseFilter.addEventListener("change", showExercises);
            addExerciseToWorkoutBtn.addEventListener("click", addExerciseToWorkout);
            addWorkoutBtn.addEventListener("click", addWorkout);
