/* ==================== Storage Manager ==================== */

/**
 * Storage Manager für Trainingseinheiten
 * Speichert alle Trainingsdaten und verwaltet Auto-Completion
 */
const StorageManager = {
    // Konstanten
    STORAGE_KEY_WORKOUTS: 'fitnesspro_workouts',
    STORAGE_KEY_EXERCISES: 'fitnesspro_exercises',
    STORAGE_KEY_HISTORY: 'fitnesspro_history',

    /**
     * Initialisiert den Storage mit Standard-Trainingsübungen
     */
    init() {
        // Prüfe ob bereits Daten vorhanden sind
        if (!getLocalStorage(this.STORAGE_KEY_WORKOUTS)) {
            setLocalStorage(this.STORAGE_KEY_WORKOUTS, []);
        }
        
        // Initialisiere Exercise History wenn leer
        if (!getLocalStorage(this.STORAGE_KEY_EXERCISES)) {
            const defaultExercises = [
                { name: 'Bankdrücken', category: 'Brust' },
                { name: 'Kniebeugen', category: 'Beine' },
                { name: 'Kreuzheben', category: 'Rücken' },
                { name: 'Schulterdrücken', category: 'Schultern' },
                { name: 'Latziehen', category: 'Rücken' },
                { name: 'Bizeps Curls', category: 'Arme' },
                { name: 'Trizeps Dips', category: 'Arme' },
                { name: 'Schrägbankdrücken', category: 'Brust' },
                { name: 'Beinpresse', category: 'Beine' },
                { name: 'Legpress', category: 'Beine' }
            ];
            setLocalStorage(this.STORAGE_KEY_EXERCISES, defaultExercises);
        }
        
        if (!getLocalStorage(this.STORAGE_KEY_HISTORY)) {
            setLocalStorage(this.STORAGE_KEY_HISTORY, []);
        }
    },

    /* ==================== Workout CRUD ==================== */

    /**
     * Erstellt eine neue Trainingseinheit
     * @param {Object} workout - Trainingsdaten
     * @returns {Object} Erstellte Trainingseinheit mit ID
     */
    addWorkout(workout) {
        const workouts = getLocalStorage(this.STORAGE_KEY_WORKOUTS, []);
        
        const newWorkout = {
            id: this._generateId(),
            exerciseName: workout.exerciseName,
            weight: parseFloat(workout.weight),
            reps: parseInt(workout.reps),
            sets: parseInt(workout.sets),
            notes: workout.notes || '',
            date: workout.date,
            duration: parseInt(workout.duration) || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        workouts.push(newWorkout);
        setLocalStorage(this.STORAGE_KEY_WORKOUTS, workouts);
        
        // Speichere Übung in History für Auto-Completion
        this._addToExerciseHistory(newWorkout.exerciseName);
        
        return newWorkout;
    },

    /**
     * Ruft alle Trainingseinheiten ab
     * @returns {Array} Array aller Trainingseinheiten
     */
    getAllWorkouts() {
        return getLocalStorage(this.STORAGE_KEY_WORKOUTS, []);
    },

    /**
     * Ruft eine Trainingseinheit nach ID ab
     * @param {String} id - Workout ID
     * @returns {Object|null} Trainingseinheit oder null
     */
    getWorkoutById(id) {
        const workouts = this.getAllWorkouts();
        return workouts.find(w => w.id === id) || null;
    },

    /**
     * Ruft Trainingseinheiten für ein bestimmtes Datum ab
     * @param {String} date - Datum (ISO Format: YYYY-MM-DD)
     * @returns {Array} Trainingseinheiten für das Datum
     */
    getWorkoutsByDate(date) {
        const workouts = this.getAllWorkouts();
        return workouts.filter(w => w.date === date).sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    },

    /**
     * Ruft Trainingseinheiten für einen Datumsbereich ab
     * @param {String} startDate - Start Datum (ISO Format)
     * @param {String} endDate - End Datum (ISO Format)
     * @returns {Array} Trainingseinheiten im Bereich
     */
    getWorkoutsByDateRange(startDate, endDate) {
        const workouts = this.getAllWorkouts();
        return workouts.filter(w => {
            return w.date >= startDate && w.date <= endDate;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /**
     * Ruft Trainingseinheiten für eine Woche ab
     * @param {Number} year - Jahr
     * @param {Number} week - Wochennummer
     * @returns {Array} Trainingseinheiten der Woche
     */
    getWorkoutsByWeek(year, week) {
        const days = getWeekDays(year, week);
        const startDate = formatDateISO(days[0]);
        const endDate = formatDateISO(days[6]);
        return this.getWorkoutsByDateRange(startDate, endDate);
    },

    /**
     * Ruft Trainingseinheiten für einen Monat ab
     * @param {Number} year - Jahr
     * @param {Number} month - Monat (0-11)
     * @returns {Array} Trainingseinheiten des Monats
     */
    getWorkoutsByMonth(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = formatDateISO(firstDay);
        const endDate = formatDateISO(lastDay);
        return this.getWorkoutsByDateRange(startDate, endDate);
    },

    /**
     * Ruft Trainingseinheiten für ein Jahr ab
     * @param {Number} year - Jahr
     * @returns {Array} Trainingseinheiten des Jahres
     */
    getWorkoutsByYear(year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        return this.getWorkoutsByDateRange(startDate, endDate);
    },

    /**
     * Ruft Trainingseinheiten für heute ab
     * @returns {Array} Trainingseinheiten von heute
     */
    getTodayWorkouts() {
        const today = formatDateISO(new Date());
        return this.getWorkoutsByDate(today);
    },

    /**
     * Aktualisiert eine Trainingseinheit
     * @param {String} id - Workout ID
     * @param {Object} updates - Zu aktualisierende Felder
     * @returns {Object|null} Aktualisierte Trainingseinheit oder null
     */
    updateWorkout(id, updates) {
        const workouts = this.getAllWorkouts();
        const index = workouts.findIndex(w => w.id === id);
        
        if (index === -1) return null;
        
        workouts[index] = {
            ...workouts[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        
        setLocalStorage(this.STORAGE_KEY_WORKOUTS, workouts);
        
        // Update Exercise History wenn Name geändert
        if (updates.exerciseName) {
            this._addToExerciseHistory(updates.exerciseName);
        }
        
        return workouts[index];
    },

    /**
     * Löscht eine Trainingseinheit
     * @param {String} id - Workout ID
     * @returns {Boolean} Erfolgreich gelöscht
     */
    deleteWorkout(id) {
        const workouts = this.getAllWorkouts();
        const filtered = workouts.filter(w => w.id !== id);
        
        if (filtered.length === workouts.length) return false;
        
        setLocalStorage(this.STORAGE_KEY_WORKOUTS, filtered);
        return true;
    },

    /**
     * Löscht alle Trainingseinheiten eines Datums
     * @param {String} date - Datum (ISO Format)
     * @returns {Number} Anzahl gelöschter Einheiten
     */
    deleteWorkoutsByDate(date) {
        const workouts = this.getAllWorkouts();
        const beforeCount = workouts.length;
        const filtered = workouts.filter(w => w.date !== date);
        
        setLocalStorage(this.STORAGE_KEY_WORKOUTS, filtered);
        return beforeCount - filtered.length;
    },

    /* ==================== Exercise History & Auto-Completion ==================== */

    /**
     * Fügt eine Übung zur History hinzu oder erhöht den Count
     * @param {String} exerciseName - Name der Übung
     */
    _addToExerciseHistory(exerciseName) {
        if (!exerciseName) return;
        
        const exercises = getLocalStorage(this.STORAGE_KEY_EXERCISES, []);
        const existingIndex = exercises.findIndex(
            e => e.name.toLowerCase() === exerciseName.toLowerCase()
        );
        
        if (existingIndex !== -1) {
            exercises[existingIndex].count = (exercises[existingIndex].count || 1) + 1;
            exercises[existingIndex].lastUsed = new Date().toISOString();
        } else {
            exercises.push({
                name: exerciseName,
                count: 1,
                lastUsed: new Date().toISOString()
            });
        }
        
        setLocalStorage(this.STORAGE_KEY_EXERCISES, exercises);
    },

    /**
     * Ruft alle gespeicherten Übungen ab
     * @returns {Array} Array aller Übungen
     */
    getAllExercises() {
        const exercises = getLocalStorage(this.STORAGE_KEY_EXERCISES, []);
        // Sortiere nach Häufigkeit und letzter Verwendung
        return exercises.sort((a, b) => {
            const aCount = a.count || 0;
            const bCount = b.count || 0;
            if (aCount !== bCount) return bCount - aCount;
            
            const aDate = new Date(a.lastUsed || 0);
            const bDate = new Date(b.lastUsed || 0);
            return bDate - aDate;
        });
    },

    /**
     * Sucht Übungen basierend auf Suchtext
     * @param {String} searchTerm - Suchtext
     * @returns {Array} Gefilterte Übungen
     */
    searchExercises(searchTerm) {
        if (!searchTerm) return this.getAllExercises();
        
        const exercises = this.getAllExercises();
        return fuzzySearch(searchTerm, exercises, 'name');
    },

    /**
     * Ruft Vorschläge für eine Übung ab (Auto-Completion)
     * @param {String} input - Benutzereingabe
     * @param {Number} limit - Maximale Anzahl Vorschläge
     * @returns {Array} Array von Vorschlägen
     */
    getExerciseSuggestions(input, limit = 5) {
        if (!input || input.length < 1) return [];
        
        const exercises = this.getAllExercises();
        const suggestions = exercises.filter(e => 
            e.name.toLowerCase().startsWith(input.toLowerCase())
        );
        
        return suggestions.slice(0, limit).map(e => e.name);
    },

    /**
     * Ruft die Top Übungen ab (nach Verwendungshäufigkeit)
     * @param {Number} limit - Anzahl der Top Übungen
     * @returns {Array} Top Übungen
     */
    getTopExercises(limit = 10) {
        const exercises = this.getAllExercises();
        return exercises.slice(0, limit);
    },

    /**
     * Löscht eine Übung aus der History
     * @param {String} exerciseName - Name der Übung
     * @returns {Boolean} Erfolgreich gelöscht
     */
    deleteExercise(exerciseName) {
        const exercises = getLocalStorage(this.STORAGE_KEY_EXERCISES, []);
        const filtered = exercises.filter(
            e => e.name.toLowerCase() !== exerciseName.toLowerCase()
        );
        
        if (filtered.length === exercises.length) return false;
        
        setLocalStorage(this.STORAGE_KEY_EXERCISES, filtered);
        return true;
    },

    /**
     * Löscht alle Übungen aus der History
     */
    clearExerciseHistory() {
        setLocalStorage(this.STORAGE_KEY_EXERCISES, []);
    },

    /* ==================== Statistics ==================== */

    /**
     * Berechnet Statistiken für ein Datum
     * @param {String} date - Datum (ISO Format)
     * @returns {Object} Statistiken für das Datum
     */
    getStatisticsForDate(date) {
        const workouts = this.getWorkoutsByDate(date);
        
        return {
            totalWorkouts: workouts.length,
            totalWeight: calculateSum(workouts, 'weight'),
            totalReps: calculateSum(workouts, 'reps'),
            totalSets: calculateSum(workouts, 'sets'),
            totalDuration: calculateSum(workouts, 'duration'),
            avgWeight: workouts.length > 0 ? calculateAverage(workouts.map(w => w.weight)) : 0,
            maxWeight: workouts.length > 0 ? findMax(workouts, 'weight') : 0
        };
    },

    /**
     * Berechnet Statistiken für einen Datumsbereich
     * @param {String} startDate - Start Datum
     * @param {String} endDate - End Datum
     * @returns {Object} Statistiken für den Bereich
     */
    getStatisticsForRange(startDate, endDate) {
        const workouts = this.getWorkoutsByDateRange(startDate, endDate);
        
        return {
            totalWorkouts: workouts.length,
            totalWeight: calculateSum(workouts, 'weight'),
            totalReps: calculateSum(workouts, 'reps'),
            totalSets: calculateSum(workouts, 'sets'),
            totalDuration: calculateSum(workouts, 'duration'),
            avgWeight: workouts.length > 0 ? calculateAverage(workouts.map(w => w.weight)) : 0,
            maxWeight: workouts.length > 0 ? findMax(workouts, 'weight') : 0,
            avgDuration: workouts.length > 0 ? calculateAverage(workouts.map(w => w.duration)) : 0,
            workoutDays: new Set(workouts.map(w => w.date)).size
        };
    },

    /**
     * Ruft Statistiken für eine bestimmte Übung ab
     * @param {String} exerciseName - Name der Übung
     * @returns {Object} Statistiken für die Übung
     */
    getExerciseStatistics(exerciseName) {
        const workouts = this.getAllWorkouts().filter(
            w => w.exerciseName.toLowerCase() === exerciseName.toLowerCase()
        );
        
        if (workouts.length === 0) return null;
        
        return {
            exerciseName: exerciseName,
            totalWorkouts: workouts.length,
            avgWeight: calculateAverage(workouts.map(w => w.weight)),
            maxWeight: findMax(workouts, 'weight'),
            minWeight: findMin(workouts, 'weight'),
            avgReps: calculateAverage(workouts.map(w => w.reps)),
            avgSets: calculateAverage(workouts.map(w => w.sets)),
            avgDuration: calculateAverage(workouts.map(w => w.duration)),
            lastWorkout: workouts[workouts.length - 1],
            firstWorkout: workouts[0]
        };
    },

    /**
     * Exportiert alle Daten als JSON
     * @returns {Object} Alle Trainingsdaten
     */
    exportData() {
        return {
            workouts: this.getAllWorkouts(),
            exercises: this.getAllExercises(),
            exportDate: new Date().toISOString()
        };
    },

    /**
     * Importiert Daten aus JSON
     * @param {Object} data - Zu importierende Daten
     * @returns {Boolean} Erfolgreich importiert
     */
    importData(data) {
        try {
            if (data.workouts && Array.isArray(data.workouts)) {
                setLocalStorage(this.STORAGE_KEY_WORKOUTS, data.workouts);
            }
            if (data.exercises && Array.isArray(data.exercises)) {
                setLocalStorage(this.STORAGE_KEY_EXERCISES, data.exercises);
            }
            return true;
        } catch (e) {
            console.error('Fehler beim Import:', e);
            return false;
        }
    },

    /**
     * Löscht alle Daten
     * @returns {Boolean} Erfolgreich gelöscht
     */
    clearAllData() {
        try {
            removeLocalStorage(this.STORAGE_KEY_WORKOUTS);
            removeLocalStorage(this.STORAGE_KEY_EXERCISES);
            removeLocalStorage(this.STORAGE_KEY_HISTORY);
            return true;
        } catch (e) {
            console.error('Fehler beim Löschen:', e);
            return false;
        }
    },

    /* ==================== Private Methods ==================== */

    /**
     * Generiert eine eindeutige ID
     * @returns {String} Eindeutige ID
     */
    _generateId() {
        return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

// Initialisiere Storage beim Laden
StorageManager.init();
