const STORAGE_KEY = 'workout_data';

export const saveWorkout = (exercises) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(exercises));
        return true;
    } catch (error) {
        console.error('Error saving workouts:', error);
        return false;
    }
};

export const loadWorkouts = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error loading workouts:', error);
        return [];
    }
};
