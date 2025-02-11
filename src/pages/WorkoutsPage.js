import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit"; // Fixed the import path
import { saveWorkout, loadWorkouts } from "../utils/workoutData";

const WorkoutsPage = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]); // Initialize as empty array
  const [currentWorkout, setCurrentWorkout] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [view, setView] = useState("dashboard"); // 'dashboard', 'session', 'edit', 'history'
  const [newExerciseName, setNewExerciseName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [exerciseSets, setExerciseSets] = useState({});
  const [editingExercise, setEditingExercise] = useState(null);
  const [editExerciseName, setEditExerciseName] = useState("");

  useEffect(() => {
    // Load saved workout data from JSON file
    const savedWorkouts = loadWorkouts();
    if (savedWorkouts && savedWorkouts.length > 0) {
      setExercises(savedWorkouts);
    }

    // Add mouse movement handler
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Back button handler
    const handleBackButton = (e) => {
      e.preventDefault();
      if (view === "dashboard") {
        navigate("/");
      } else {
        setView("dashboard");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate, view]);

  const saveSet = (exerciseId, setNumber, reps, weight) => {
    const date = new Date().toISOString();
    const updatedExercises = exercises.map((exercise) => {
      if (exercise.id === exerciseId) {
        return {
          ...exercise,
          history: [...exercise.history, { date, setNumber, reps, weight }],
        };
      }
      return exercise;
    });

    setExercises(updatedExercises);
    saveWorkout(updatedExercises); // Replace localStorage with saveWorkout
  };

  const getLastSetInfo = (exerciseId) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise?.history.length) return null;

    return exercise.history[exercise.history.length - 1];
  };

  const getLastSetInfoBySetNumber = (exerciseId, setNumber) => {
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    if (!exercise?.history.length) return null;

    // Filter history to get only entries for this specific set number
    const setHistory = exercise.history
      .filter((set) => set.setNumber === setNumber)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return setHistory[0] || null;
  };

  const addNewExercise = () => {
    if (!newExerciseName.trim()) return;

    const newExercise = {
      id: newExerciseName.toLowerCase().replace(/\s+/g, "-"),
      name: newExerciseName,
      history: [],
    };

    const updatedExercises = [...exercises, newExercise];
    setExercises(updatedExercises);
    saveWorkout(updatedExercises); // Replace localStorage with saveWorkout
    setNewExerciseName("");
  };

  const initializeExerciseSets = (exerciseId) => {
    if (!exerciseSets[exerciseId]) {
      setExerciseSets((prev) => ({
        ...prev,
        [exerciseId]: [
          { setNumber: 1, reps: "", weight: "" },
          { setNumber: 2, reps: "", weight: "" },
          { setNumber: 3, reps: "", weight: "" },
        ],
      }));
    }
  };

  const addNewSet = (exerciseId) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: [
        ...prev[exerciseId],
        { setNumber: prev[exerciseId].length + 1, reps: "", weight: "" },
      ],
    }));
  };

  const updateSetValue = (exerciseId, setIndex, field, value) => {
    setExerciseSets((prev) => {
      const updatedSets = {
        ...prev,
        [exerciseId]: prev[exerciseId].map((set, idx) =>
          idx === setIndex ? { ...set, [field]: value } : set
        ),
      };

      // Get the updated set
      const currentSet = updatedSets[exerciseId][setIndex];

      // If both reps and weight are filled, save automatically
      if (currentSet.reps && currentSet.weight) {
        saveSet(
          exerciseId,
          currentSet.setNumber,
          currentSet.reps,
          currentSet.weight
        );
      }

      return updatedSets;
    });
  };

  const toggleExerciseSelection = (exerciseId) => {
    if (exerciseId) {
      setSelectedExercises((prev) => {
        const newSelection = prev.includes(exerciseId)
          ? prev.filter((id) => id !== exerciseId)
          : [...prev, exerciseId];

        if (!prev.includes(exerciseId)) {
          initializeExerciseSets(exerciseId);
        }
        return newSelection;
      });
    }
  };

  const groupHistoryByDate = () => {
    const historyMap = new Map();

    exercises.forEach((exercise) => {
      exercise.history.forEach((set) => {
        const date = new Date(set.date).toLocaleDateString();
        if (!historyMap.has(date)) {
          historyMap.set(date, []);
        }
        historyMap.get(date).push({
          ...set,
          exerciseName: exercise.name,
        });
      });
    });

    return Array.from(historyMap.entries()).sort(
      (a, b) => new Date(b[0]) - new Date(a[0])
    );
  };

  const deleteExercise = (exerciseId) => {
    if (window.confirm("Are you sure you want to delete this exercise?")) {
      const updatedExercises = exercises.filter((ex) => ex.id !== exerciseId);
      setExercises(updatedExercises);
      saveWorkout(updatedExercises); // Replace localStorage with saveWorkout

      // Clean up any selected exercises
      setSelectedExercises((prev) => prev.filter((id) => id !== exerciseId));
    }
  };

  const startEditExercise = (exercise) => {
    setEditingExercise(exercise.id);
    setEditExerciseName(exercise.name);
  };

  const saveEditExercise = () => {
    if (!editExerciseName.trim()) return;

    const updatedExercises = exercises.map((exercise) =>
      exercise.id === editingExercise
        ? { ...exercise, name: editExerciseName }
        : exercise
    );

    setExercises(updatedExercises);
    saveWorkout(updatedExercises); // Replace localStorage with saveWorkout
    setEditingExercise(null);
    setEditExerciseName("");
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <h2>Workout Dashboard</h2>
      <div className="dashboard-buttons">
        <button onClick={() => setView("session")}>New Session</button>
        <button onClick={() => setView("history")}>View History</button>
        <button onClick={() => setView("edit")}>Edit Workouts</button>
      </div>
    </div>
  );

  const renderSession = () => (
    <div className="session">
      <h2>New Workout Session</h2>
      <div className="exercise-selector">
        <select onChange={(e) => toggleExerciseSelection(e.target.value)}>
          <option value="">Select Exercise</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>
        <div className="new-exercise-input">
          <input
            type="text"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="New exercise name"
          />
          <button onClick={addNewExercise}>
            <AddIcon />
          </button>
        </div>
      </div>
      <div className="selected-exercises">
        {exercises
          .filter((ex) => selectedExercises.includes(ex.id))
          .map((exercise) => {
            const exerciseSetsArray = exerciseSets[exercise.id] || [];

            return (
              <div key={exercise.id} className="exercise-container">
                <h2 className="exercise-title">{exercise.name}</h2>
                <div className="sets-container">
                  {exerciseSetsArray.map((set, index) => {
                    const lastSetInfo = getLastSetInfoBySetNumber(
                      exercise.id,
                      set.setNumber
                    );
                    return (
                      <div key={index} className="set-row">
                        <span className="set-number">Set {set.setNumber}</span>
                        <div className="set-inputs">
                          <input
                            type="number"
                            placeholder={`${
                              set.setNumber > 1 ? lastSetInfo?.reps : "Reps"
                            }`}
                            value={set.reps}
                            onChange={(e) =>
                              updateSetValue(
                                exercise.id,
                                index,
                                "reps",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="number"
                            placeholder={`${
                              set.setNumber > 1
                                ? lastSetInfo?.weight + "kg"
                                : "Weight (kg)"
                            }`}
                            value={set.weight}
                            onChange={(e) =>
                              updateSetValue(
                                exercise.id,
                                index,
                                "weight",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                  {exerciseSetsArray.length > 0 &&
                    exerciseSetsArray[exerciseSetsArray.length - 1].reps &&
                    exerciseSetsArray[exerciseSetsArray.length - 1].weight && (
                      <button
                        className="add-set-button"
                        onClick={() => addNewSet(exercise.id)}
                      >
                        Add Set
                      </button>
                    )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="history-view">
      <h2>Workout History</h2>
      <div className="history-list">
        {groupHistoryByDate().map(([date, sets]) => (
          <div key={date} className="history-day">
            <h3 className="history-date">{date}</h3>
            <div className="history-sets">
              {sets.map((set, index) => (
                <div key={index} className="history-set">
                  <span className="exercise-name">{set.exerciseName}</span>
                  <span className="set-details">
                    Set {set.setNumber}: {set.reps} reps @ {set.weight}kg
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditWorkouts = () => (
    <div className="edit-workouts">
      <h2>Edit Workouts</h2>
      <div className="exercisdies-list">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="exercise-item">
            {editingExercise === exercise.id ? (
              <div className="edit-exercise-form">
                <input
                  type="text"
                  value={editExerciseName}
                  onChange={(e) => setEditExerciseName(e.target.value)}
                  placeholder="Exercise name"
                />
                <div className="edit-buttons">
                  <button onClick={saveEditExercise}>Save</button>
                  <button onClick={() => setEditingExercise(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span>{exercise.name}</span>
                <div className="exercise-actions">
                  <button
                    onClick={() => startEditExercise(exercise)}
                    className="edit-button"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => deleteExercise(exercise.id)}
                    className="delete-button"
                  >
                    ×
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="new-exercise-input">
          <input
            type="text"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
            placeholder="New exercise name"
          />
          <button onClick={addNewExercise}>
            <AddIcon />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="workouts-page">
      <style jsx>{`
        .workouts-page {
          min-height: 100vh;
          background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
          color: white;
          padding: 20px;
          font-family: "Montserrat", sans-serif;
        }
        .back-button {
          position: fixed;
          top: 20px;
          left: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: white;
          transition: transform 0.2s ease;
        }
        .back-button:hover {
          transform: scale(1.1);
          background: none;
        }
        .content {
          padding-top: 60px;
          text-align: center;
        }
        h1 {
          font-size: 2vw;
          font-weight: 300;
          font-family: "Montserrat", sans-serif;
          letter-spacing: 3px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 20px;
        }
        .moving-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at var(--x) var(--y),
            rgba(100, 149, 237, 0.1) 0%,
            rgba(0, 0, 0, 0) 50%
          );
          pointer-events: none;
          z-index: 1;
        }
        .exercise-container {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 15px;
          padding: 25px;
          margin: 0 auto; // Center containers
          width: 100%;
          max-width: 500px; // Limit maximum width
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          z-index: 2;
        }

        .exercise-container:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
        }

        .exercise-title {
          font-size: 1.8rem;
          margin-bottom: 20px;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: center;
        }

        .set-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          flex: 1;
        }

        input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          padding: 8px;
          color: white;
          width: 100%;
          position: relative;
          z-index: 3;
        }

        button {
          background: rgba(100, 149, 237, 0.3);
          border: none;
          border-radius: 5px;
          padding: 8px 15px;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
          z-index: 3;
        }

        button:hover {
          background: rgba(100, 149, 237, 0.5);
        }

        .dashboard {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .dashboard-buttons {
          display: flex;
          gap: 20px;
        }

        .exercise-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin: 20px 0;
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 600px;
          margin: 20px auto;
        }

        .new-exercise-input {
          display: flex;
          gap: 10px;
        }

        .exercise-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          margin: 5px 0;
        }

        select {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 5px;
          padding: 8px;
          color: white;
          width: 100%;
          position: relative;
          z-index: 3;
        }

        select option {
          background-color: #2a2a2a;
          color: white;
        }

        .selected-exercises {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          max-width: 1200px;
          margin: 20px auto;
          padding: 0 20px;
          position: relative;
          z-index: 2;
          justify-content: center;
        }

        .exercise-container {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 15px;
          padding: 25px;
          width: calc(50% - 10px); // 50% width minus half the gap
          min-width: 300px;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          z-index: 2;
          flex-grow: 0; // Prevent container from growing
        }

        @media (max-width: 768px) {
          .exercise-container {
            width: 100%;
            min-width: unset;
          }
        }

        @media (min-width: 1200px) {
          .selected-exercises {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .session {
          position: relative;
          z-index: 2;
          width: 100%;
        }

        .sets-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .set-row {
          display: flex;
          align-items: center;
          gap: 15px;
          width: 100%;
          flex-wrap: wrap;
        }

        .set-number {
          width: 60px;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .set-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          flex: 1;
        }

        .add-set-button {
          margin-top: 10px;
          width: 100%;
          padding: 8px;
          background: rgba(100, 149, 237, 0.2);
          border: 1px solid rgba(100, 149, 237, 0.3);
          border-radius: 5px;
          color: white;
          cursor: pointer;
          transition: background 0.2s;
        }

        .add-set-button:hover {
          background: rgba(100, 149, 237, 0.3);
        }

        .previous-set-info {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          margin-left: 15px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .set-date {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .history-view {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .history-day {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .history-date {
          font-size: 1.2rem;
          margin-bottom: 15px;
          color: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding-bottom: 5px;
        }

        .history-set {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 5px;
          margin: 5px 0;
        }

        .exercise-name {
          font-weight: bold;
          color: rgba(255, 255, 255, 0.8);
        }

        .set-details {
          color: rgba(255, 255, 255, 0.6);
        }

        .exercise-actions {
          display: flex;
          gap: 10px;
        }

        .edit-exercise-form {
          display: flex;
          gap: 10px;
          width: 100%;
        }

        .edit-exercise-form input {
          flex: 1;
        }
        .edit-button{
            background: none;
        }

        .edit-button:hover {
            background: rgba(100, 149, 237, 0.2);
        }
        .edit-buttons {
          display: flex;
          gap: 5px;
        }

        .delete-button {
          color: #ff4444;
          font-size: 20px;
          font-weight: bold;
          padding: 0 10px;
          background: none;
        }

        .delete-button:hover {
          background: rgba(255, 68, 68, 0.2);
        }
      `}</style>

      <div
        className="moving-bg"
        style={{ "--x": `${mousePosition.x}px`, "--y": `${mousePosition.y}px` }}
      ></div>

      <button
        onClick={(e) => {
          e.preventDefault();
          if (view === "dashboard") {
            navigate("/");
          } else {
            setView("dashboard");
          }
        }}
        className="back-button"
      >
        <ArrowBackIcon style={{ fontSize: 40 }} />
      </button>

      <div className="content">
        <h1>WORKOUTS</h1>
        {view === "dashboard" && renderDashboard()}
        {view === "session" && renderSession()}
        {view === "edit" && renderEditWorkouts()}
        {view === "history" && renderHistory()}
      </div>
    </div>
  );
};

export default WorkoutsPage;
