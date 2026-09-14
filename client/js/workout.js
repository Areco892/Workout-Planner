            import { workoutApi } from "./api.js";
            const params = new URLSearchParams(window.location.search);
            const workoutId = params.get("wid");
            const workoutName = params.get("wname");
            let exerciseContainer = document.getElementById("exercise-container");
            const congratulationBanner = document.getElementById("congratulations");
            let workoutHeader = document.getElementById("workout-name");
            workoutHeader.textContent = workoutName;

            let completeExercises = 0;
            let totalExercises = 0

            /**************************
                Server-side Changes
            **************************/
            async function serverGetExercises(workoutID) {
                return workoutApi.get(workoutID);
            }
    
            /**************************
                Client-side Changes
            **************************/
           function createExercise(exercise) {
                // Create the exercise section
                const exerciseItem = document.createElement("div");
                exerciseItem.classList = "exercise-item";
                const exerciseName = document.createElement("h2");
                exerciseName.textContent = exercise.name;
                
                const exerciseDescription = document.createElement("section");
                exerciseDescription.setAttribute("data-id", exercise.eid);
                exerciseDescription.classList = "exercise-description";

                // Create the individual components of an exercise
                
                const exerciseImage = document.createElement("img");
                exerciseImage.src = exercise.image;
                exerciseImage.alt = exercise.name;
                
                const exerciseTargetMuscle = document.createElement("span");
                exerciseTargetMuscle.textContent = exercise.target;

                const exerciseDifficulty = document.createElement("span");
                exerciseDifficulty.textContent = exercise.difficulty;
                exerciseDifficulty.classList = exercise.difficulty.toLowerCase();

                const exerciseDifficultyTag = document.createElement("div");
                exerciseDifficultyTag.classList = "tag"
                const difficulty = document.createElement("p");
                difficulty.textContent = "Difficulty: ";
                exerciseDifficultyTag.appendChild(difficulty);
                exerciseDifficultyTag.appendChild(exerciseDifficulty);

                const exerciseTargetTag = document.createElement("div");
                exerciseTargetTag.classList = "tag";
                const target = document.createElement("p");
                target.textContent = "Target Muscle: ";
                exerciseTargetTag.appendChild(target);
                exerciseTargetTag.appendChild(exerciseTargetMuscle);

                // Add all the elements of an exercise to the exercise section
                exerciseDescription.appendChild(exerciseName);
                exerciseDescription.appendChild(exerciseImage);
                exerciseDescription.appendChild(exerciseDifficultyTag);
                exerciseDescription.appendChild(exerciseTargetTag);

                const exerciseProgress = document.createElement("section");
                exerciseProgress.setAttribute("data-id", exercise.eid);
                exerciseProgress.classList = "exercise-progress";

                const progressTitle = document.createElement("h2");
                progressTitle.textContent = "Progress";

                const exerciseSpecifications = document.createElement("span");
                const exerciseWeight = document.createElement("p"); 
                exerciseWeight.textContent = `Weight: ${exercise.weight} lbs`;
                const exerciseReps = document.createElement("p"); 
                exerciseReps.textContent = `Reps: ${exercise.reps} reps`;
                exerciseSpecifications.appendChild(exerciseWeight);
                exerciseSpecifications.appendChild(exerciseReps);

                const progressBar = document.createElement("progress");
                progressBar.value = 0;
                progressBar.max = 1;
                progressBar.setAttribute("data-total", exercise.sets);
                progressBar.setAttribute("data-completed", 0);

                const exerciseSets = document.createElement("ul");
                for (let i = 0; i < exercise.sets; i++) {
                    const set = document.createElement("li");
                    const p = document.createElement("p");
                    p.textContent = `Set ${i+1}`;
                    set.appendChild(p);
                    const doneBtn = document.createElement("button");
                    doneBtn.type = "button";
                    doneBtn.classList = "done-btn";
                    doneBtn.textContent = "Done";
                    set.appendChild(doneBtn);
                    exerciseSets.appendChild(set);
                    totalExercises += 1;
                }

                exerciseProgress.appendChild(progressTitle);
                exerciseProgress.appendChild(exerciseSpecifications);
                exerciseProgress.appendChild(progressBar);
                exerciseProgress.appendChild(exerciseSets);

                // Add the newly created exercise to the exercise container
                exerciseItem.appendChild(exerciseName);
                exerciseItem.appendChild(exerciseDescription);
                exerciseItem.appendChild(exerciseProgress);

                exerciseContainer.appendChild(exerciseItem);
            }

            async function showExercises() {
                let exercises = await serverGetExercises(workoutId);
                
                exercises.forEach(exercise => {
                    createExercise(exercise);
                });
            }
            showExercises();

            /**********************
                    Timer
            **********************/
            const oneSecond = 1;
            const oneMinute = 60 * oneSecond;
            const oneHour = 60 * oneMinute;
            const maxTime = 99 * oneHour;
            let timeInHrMinSec = "000000";
            let timeInSec = 1;
            let stopwatch;

            const startTimerBtn = document.getElementById("start-timer");
            const stopTimerBtn = document.getElementById("stop-timer");
            const resumeTimerBtn = document.getElementById("resume-timer");
            const resetTimerBtn = document.getElementById("reset-timer");
            const timer = document.getElementById("timer");

            function formatTime(timeString) {
                return (
                    timeString.substring(0,2) + ":" +
                    timeString.substring(2,4) + ":" +
                    timeString.substring(4,6)
                );
            } 

            function convertSecToHrMinSec(time) {
                let hours = "00", minutes = "00", seconds = "00";
                hours += Math.floor(time / oneHour);
                minutes += Math.floor((time % oneHour) / oneMinute);
                seconds += time % oneMinute; 
                return hours.slice(-2) + minutes.slice(-2) + seconds.slice(-2);
            }

            function convertHrMinSecToSec(timeHrMinSec) {
                let hours = parseInt(timeHrMinSec.substring(0,2));
                let minutes = parseInt(timeHrMinSec.substring(3,5));
                let seconds = parseInt(timeHrMinSec.substring(6,8));
                let timeSec = hours * oneHour + minutes * oneMinute + seconds
                return timeSec;
            }
            
            function startTimer() {
                if (stopwatch) return;

                let currentTime = convertSecToHrMinSec(timeInSec);

                if (timeInSec >= 0) {
                    stopwatch = setInterval(() => {
                        currentTime = convertSecToHrMinSec(timeInSec);
                        timer.textContent = formatTime(currentTime);
                        timeInSec++;
                    }, 1000);
                } else {
                    clearInterval(stopwatch);
                    return;
                }
            }

            function stopTimer() {
                clearInterval(stopwatch);
                stopwatch = null;
            }

            function resumeTimer() {
                stopwatch = setInterval(() => {
                    if (timeInSec < 0) {
                        clearInterval(stopwatch);
                        return;
                    }
                    let currentTime = convertSecToHrMinSec(timeInSec);
                    timer.textContent = formatTime(currentTime);
                    timeInSec++;
                }, 1000);
            }

            function resetTimer() {
                stopTimer();
                timer.textContent = "00:00:00";
                timeInSec = 0;
            }

            startTimerBtn.addEventListener("click", startTimer);
            stopTimerBtn.addEventListener("click", stopTimer);
            resumeTimerBtn.addEventListener("click", resumeTimer);
            resetTimerBtn.addEventListener("click", resetTimer);

            /**************************
                Progress Tracker
            **************************/
            function indicateCurrentExercise(e) {
                if (e.target && e.target.classList.contains("done-btn")) return;
                const exerciseItem = e.target.closest(".exercise-item");
                if (exerciseItem) {
                    exerciseItem.classList.toggle("in-progress");
                }
            }

            function recordTime() {
                const time = convertSecToHrMinSec(timeInSec - 1);
                const formattedTime = formatTime(time);
                
                congratulationBanner.textContent = `Congratulations, you completed the workout in ${formattedTime}!`;
                congratulationBanner.classList.toggle("hide");
                exerciseContainer.removeEventListener("click", markSetComplete);
            }

            function markSetComplete(e) {
                if (timeInSec <= 1) {
                    return;
                }
                if (e.target && e.target.classList.contains("done-btn")) {
                    const progressBar = e.target.closest("section").querySelector("progress");
                    const total = progressBar.getAttribute("data-total");
                    let completed = parseInt(progressBar.getAttribute("data-completed"));
                    if (completed < total) {
                        completed += 1;
                        progressBar.setAttribute("data-completed", completed);
                        progressBar.value = completed / total;
                        completeExercises += 1;
                        e.target.disabled = true;
                        e.target.classList.add("completed");
                        e.target.textContent = "Completed!";
                    }
                    if (completed >= total) {
                        markExerciseComplete(e.target);
                    }
                }
                if (completeExercises >= totalExercises) {
                    stopTimer();
                    recordTime();
                }
            }

            function markExerciseComplete(e) {
                const exerciseItem = e.closest(".exercise-item");
                if (exerciseItem) {
                    exerciseItem.classList.toggle("in-progress");
                }
            }

            exerciseContainer.addEventListener("click", markSetComplete);
            // exerciseContainer.addEventListener("click", indicateCurrentExercise);
