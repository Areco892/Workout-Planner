            import { workoutApi } from "./api.js";
            const workoutContainer = document.getElementById("workout-container");
            const workoutPanel = document.getElementById("workout-panel");
            const createBtn = document.getElementById("create-btn");
            const addWorkoutBtn = document.getElementById("add-workout");
            const editBtn = document.getElementById("edit-mode-btn");
            const notification = document.getElementById("notification");

            /*******************
                Server-side
            *******************/
            async function serverGetWorkouts() {
                return workoutApi.list();
            }

            async function serverGetExercises(workoutID) {
                return workoutApi.get(workoutID);
            }

            async function serverCreateWorkout(workoutName) {
                return workoutApi.create(workoutName);
            }

            async function serverUpdateWorkout(workoutId, workoutName) {
                const response = await workoutApi.update(workoutId, workoutName);
                return response.message;
            }

            async function serverDeleteWorkout(workoutId) {
                const response = await workoutApi.delete(workoutId);
                return response.message;
            }

            async function serverDeleteExercise(workoutId, exerciseId) {
                const response = await workoutApi.removeExercise(
                    workoutId,
                    exerciseId,
                );
                return response.message;
            }

            /*******************
                Client-side
            *******************/
            async function createWorkout(workout) {
                // Create workout section
                const workoutSection = document.createElement("section");
                workoutSection.id = workout.wid;
                
                // Workout Name
                const workoutName = document.createElement("input");
                workoutName.value = workout.name;
                workoutName.disabled = true;
                workoutName.name = "workout-name";
                workoutName.classList.add("show");

                const editWorkoutNameBtn = document.createElement("button");
                editWorkoutNameBtn.type = "button";
                editWorkoutNameBtn.textContent = "Done";
                editWorkoutNameBtn.classList.add("hide");
                editWorkoutNameBtn.classList.add('edit-name');

                // Workout Exercises
                const workoutExercises = document.createElement("table");
                workoutExercises.classList = "exercise-list";

                const exerciseList = await serverGetExercises(workout.wid);
                
                if (exerciseList.length > 0) {
                    exerciseList.forEach(exercise => {
                        const exerciseComponent = document.createElement("tr");
                        exerciseComponent.value = exercise.eid;
                        
                        const exerciseName = document.createElement("td");
                        exerciseName.textContent = exercise.name;
                        const exerciseSets = document.createElement("td");
                        exerciseSets.textContent = exercise.sets + "sets";
                        const exerciseWeight = document.createElement("td");
                        exerciseWeight.textContent = exercise.weight + "lbs";
                        const exerciseReps = document.createElement("td");
                        exerciseReps.textContent = exercise.reps + "reps";
                        
                        const exerciseDeleteBtn = document.createElement("button");
                        exerciseDeleteBtn.type = "button";
                        exerciseDeleteBtn.textContent = "X";
                        exerciseDeleteBtn.classList.add("hide");
                        exerciseDeleteBtn.classList.add('delete-exercise-btn');
                        
                        exerciseComponent.appendChild(exerciseName);
                        exerciseComponent.appendChild(exerciseSets);
                        exerciseComponent.appendChild(exerciseWeight);
                        exerciseComponent.appendChild(exerciseReps);
                        exerciseComponent.appendChild(exerciseDeleteBtn);

                        workoutExercises.appendChild(exerciseComponent);
                    });
                }

                // Add exercise btn
                const goToExerciseSelectorBtn = document.createElement("button");
                goToExerciseSelectorBtn.textContent = "+ Add Exercise";
                goToExerciseSelectorBtn.classList.add('hide');
                goToExerciseSelectorBtn.setAttribute("data-id", workout.wid);
                goToExerciseSelectorBtn.classList.add("add-exercise-btn")
                

                // Button Panel
                const buttonPanel = document.createElement("div");
                buttonPanel.classList = "button-panel";

                const startWorkoutBtn = document.createElement("button");
                startWorkoutBtn.type = "button";
                startWorkoutBtn.textContent = "Start Workout";
                startWorkoutBtn.classList.add("start-btn")
                startWorkoutBtn.setAttribute("data-id", workout.wid);
                startWorkoutBtn.setAttribute("data-name", workout.name);

                const deleteWorkoutBtn = document.createElement("button");
                deleteWorkoutBtn.type = "button";
                deleteWorkoutBtn.textContent = "Delete Workout";
                deleteWorkoutBtn.classList.add('hide');
                deleteWorkoutBtn.classList.add('delete-btn');

                buttonPanel.appendChild(startWorkoutBtn);
                buttonPanel.appendChild(deleteWorkoutBtn);
                
                // Add all the elements to the workout section
                workoutSection.appendChild(workoutName);
                workoutSection.appendChild(editWorkoutNameBtn);
                workoutSection.appendChild(workoutExercises);
                workoutSection.appendChild(goToExerciseSelectorBtn);
                workoutSection.appendChild(buttonPanel);

                // Add the workout section to the workout container
                workoutContainer.appendChild(workoutSection);
            }
        
            async function initialRender() {
                const workouts = await serverGetWorkouts();
                for (const workout of workouts) {
                    await createWorkout(workout);
                }
            }
            initialRender();

            /***************************
                Create and Edit Mode
            ***************************/
            function toggleCreateMode() {
                editBtn.disabled = !editBtn.disabled;
                workoutPanel.classList.toggle("hide");
                workoutPanel.classList.toggle("show");
            }

            function toggleEditMode() {
                createBtn.disabled = !createBtn.disabled;
                const workouts = workoutContainer.querySelectorAll("section");
                workouts.forEach(workout => {
                    const workoutName = workout.querySelector("input");
                    const editWorkoutNameBtn = workout.querySelector(".edit-name");
                    const goToExerciseSelectorBtn = workout.querySelector(".add-exercise-btn");
                    const deleteWorkoutBtn = workout.querySelector(".delete-btn");
                    const deleteExerciseBtns = workout.querySelectorAll(".delete-exercise-btn");
                    
                    workoutName.disabled = !workoutName.disabled;
                    workoutName.classList.toggle("show");
                    editWorkoutNameBtn.classList.toggle("hide");
                    goToExerciseSelectorBtn.classList.toggle("hide");
                    deleteWorkoutBtn.classList.toggle("hide");
                    deleteExerciseBtns.forEach(button => {
                        button.classList.toggle("hide");
                    }); 
                });
            }
            
            /******************************
                    Notification
            ******************************/
            function notify(message) {
                notification.textContent = message;
                notification.classList.add("show");
                setTimeout(() => {notification.classList.remove("show");}, 2000);
            }

            /******************************
                    Workout Actions
            ******************************/
            async function addWorkout() {
                const workoutName = workoutPanel.name.value;
                const newWorkout = await serverCreateWorkout(workoutName);
                createWorkout(newWorkout);
                notify("Workout Successfully Added!");
            }

            async function deleteWorkout(e) {
                if (e.target && e.target.classList.contains("delete-btn")) {
                    const workout = e.target.closest("section");
                    const workoutId = workout.id;
                    const response = await serverDeleteWorkout(workoutId);
                    workout.remove();
                    notify(response);
                }
            }

            async function editWorkoutName(e) {
                if (e.target && e.target.classList.contains("edit-name")) {
                    const section = e.target.closest("section");
                    const workoutId = section.id;
                    const newName = section.querySelector("input").value;
                    const response = await serverUpdateWorkout(workoutId, newName);
                    notify(response);
                }
            }
            
            /******************************
                    Exercise Actions
            ******************************/
            async function deleteExercise(e) {
                if (e.target && e.target.classList.contains("delete-exercise-btn")) {
                    const workout = e.target.closest("section");
                    const li = e.target.closest("tr")
                    const wid = workout.id;
                    const eid = li.value;
                    const response = await serverDeleteExercise(wid, eid);
                    li.remove();
                    notify(response);
                }
            }

            function goToExerciseSelector(e) {
                e.preventDefault();
                if (e.target && e.target.classList.contains("add-exercise-btn")) {
                    window.location.href = `exercise_selection.html?wid=${e.target.getAttribute("data-id")}`;
                }
            }

            /******************************
                    Start Workout
            ******************************/
            function startWorkout(e) {
                if (e.target && e.target.classList.contains("start-btn")) {
                    window.location.href = `workout.html?wid=${e.target.getAttribute("data-id")}&wname=${e.target.getAttribute("data-name")}`;
                }
            }

            createBtn.addEventListener("click", toggleCreateMode);
            addWorkoutBtn.addEventListener("click", addWorkout);
            editBtn.addEventListener("click", toggleEditMode);
            workoutContainer.addEventListener("click", deleteWorkout);
            workoutContainer.addEventListener("click", deleteExercise);
            workoutContainer.addEventListener("click", editWorkoutName);
            workoutContainer.addEventListener("click", startWorkout);
            workoutContainer.addEventListener("click", goToExerciseSelector);
