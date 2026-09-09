/* ==================== App Initialization ==================== */

const App = {
    // State
    currentView: 'week',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    currentWeek: getWeekNumber(new Date()),
    editingWorkoutId: null,

    /**
     * Initialisiert die App
     */
    init() {
        this.setupEventListeners();
        this.render();
    },

    /**
     * Richtet alle Event Listener ein
     */
    setupEventListeners() {
        // Navigation Tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Date Navigation
        document.getElementById('prevBtn').addEventListener('click', () => this.previousPeriod());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextPeriod());
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());

        // Modal Controls
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        document.getElementById('cancelBtn').addEventListener('click', () => this.closeAllModals());
        document.getElementById('closeDetailsBtn').addEventListener('click', () => this.closeAllModals());

        // Training Form
        document.getElementById('trainingForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Details Actions
        document.getElementById('editBtn').addEventListener('click', () => this.editCurrentWorkout());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteCurrentWorkout());

        // Exercise Input Auto-Completion
        const exerciseInput = document.getElementById('exerciseName');
        exerciseInput.addEventListener('input', (e) => this.handleExerciseInput(e));
        exerciseInput.addEventListener('focusin', () => this.showExerciseSuggestions());

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Tastenkombinationen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });
    },

    /**
     * Rendert die aktuelle View
     */
    render() {
        this.updateDateDisplay();
        
        switch (this.currentView) {
            case 'week':
                this.renderWeekView();
                break;
            case 'month':
                this.renderMonthView();
                break;
            case 'year':
                this.renderYearView();
                break;
            case 'history':
                this.renderHistoryView();
                break;
        }
        
        this.updateStats();
        this.updateExerciseList();
    },

    /* ==================== View Management ==================== */

    /**
     * Wechselt die aktuelle View
     */
    switchView(view) {
        this.currentView = view;
        
        // Update Active Tab
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Reset zu aktuellem Datum
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
        this.currentWeek = getWeekNumber(new Date());

        // Hide all views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });

        // Show active view
        document.getElementById(view + 'View').classList.add('active');

        this.render();
    },

    /**
     * Aktualisiert die Datumsenanzeige
     */
    updateDateDisplay() {
        const display = document.getElementById('currentDateDisplay');
        const range = document.getElementById('dateRange');

        if (this.currentView === 'week') {
            display.textContent = `Woche ${this.currentWeek}`;
            const days = getWeekDays(this.currentYear, this.currentWeek);
            const startDate = formatDateDE(days[0]);
            const endDate = formatDateDE(days[6]);
            range.textContent = `${startDate} - ${endDate}`;
        } else if (this.currentView === 'month') {
            const monthName = getMonthName(this.currentMonth);
            display.textContent = `${monthName} ${this.currentYear}`;
            range.textContent = '';
        } else if (this.currentView === 'year') {
            display.textContent = `Jahr ${this.currentYear}`;
            range.textContent = '';
        } else if (this.currentView === 'history') {
            display.textContent = 'Trainingshistorie';
            range.textContent = '';
        }
    },

    /**
     * Navigiert zur vorherigen Periode
     */
    previousPeriod() {
        if (this.currentView === 'week') {
            this.currentWeek--;
            if (this.currentWeek < 1) {
                this.currentYear--;
                this.currentWeek = 52;
            }
        } else if (this.currentView === 'month') {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentYear--;
                this.currentMonth = 11;
            }
        } else if (this.currentView === 'year') {
            this.currentYear--;
        }
        this.render();
    },

    /**
     * Navigiert zur nächsten Periode
     */
    nextPeriod() {
        if (this.currentView === 'week') {
            this.currentWeek++;
            if (this.currentWeek > 52) {
                this.currentYear++;
                this.currentWeek = 1;
            }
        } else if (this.currentView === 'month') {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentYear++;
                this.currentMonth = 0;
            }
        } else if (this.currentView === 'year') {
            this.currentYear++;
        }
        this.render();
    },

    /**
     * Geht zu heute
     */
    goToToday() {
        const today = new Date();
        this.currentYear = today.getFullYear();
        this.currentMonth = today.getMonth();
        this.currentWeek = getWeekNumber(today);
        this.render();
    },

    /* ==================== Week View ==================== */

    /**
     * Rendert die Wochenansicht
     */
    renderWeekView() {
        const container = document.querySelector('#weekView .week-grid');
        clearElement(container);

        const days = getWeekDays(this.currentYear, this.currentWeek);

        days.forEach(date => {
            const dayCard = this.createDayCard(date);
            container.appendChild(dayCard);
        });
    },

    /**
     * Erstellt eine Tageskarte
     */
    createDayCard(date) {
        const dateStr = formatDateISO(date);
        const workouts = StorageManager.getWorkoutsByDate(dateStr);
        const dayName = getDayName(date);
        const today = isToday(date);
        const weekend = isWeekend(date);

        const card = createElement('div', {
            class: `day-card ${today ? 'today' : ''} ${weekend ? 'weekend' : ''}`
        });

        // Header
        const header = createElement('div', { class: 'day-header' });
        const title = createElement('h3', { text: dayName });
        const dateElem = createElement('span', { class: 'day-date', text: formatDateDE(date) });
        header.appendChild(title);
        header.appendChild(dateElem);

        // Add Button
        const addBtn = createElement('button', {
            class: 'add-workout-btn',
            text: '+ Hinzufügen',
            onclick: () => this.openTrainingModal(dateStr)
        });
        header.appendChild(addBtn);

        card.appendChild(header);

        // Workouts List
        const list = createElement('div', { class: 'workouts-list' });

        if (workouts.length === 0) {
            const empty = createElement('p', {
                class: 'empty-state',
                text: 'Keine Trainingseinheiten'
            });
            list.appendChild(empty);
        } else {
            workouts.forEach(workout => {
                const item = this.createWorkoutItem(workout);
                list.appendChild(item);
            });
        }

        card.appendChild(list);
        return card;
    },

    /**
     * Erstellt ein Trainingseinheiten-Element
     */
    createWorkoutItem(workout) {
        const item = createElement('div', {
            class: 'workout-item',
            onclick: () => this.showWorkoutDetails(workout.id)
        });

        const name = createElement('div', {
            class: 'workout-name',
            text: workout.exerciseName
        });

        const details = createElement('div', {
            class: 'workout-details',
            html: `${workout.weight}kg × ${workout.reps} (${workout.sets} Sätze)`
        });

        item.appendChild(name);
        item.appendChild(details);
        return item;
    },

    /* ==================== Month View ==================== */

    /**
     * Rendert die Monatsansicht
     */
    renderMonthView() {
        const monthName = getMonthName(this.currentMonth);
        document.getElementById('monthTitle').textContent = `${monthName} ${this.currentYear}`;

        const container = document.querySelector('#monthView .calendar-grid');
        clearElement(container);

        const days = getDaysInMonth(this.currentYear, this.currentMonth);

        days.forEach(dayObj => {
            const dayElem = this.createCalendarDay(dayObj.date, dayObj.isCurrentMonth);
            container.appendChild(dayElem);
        });
    },

    /**
     * Erstellt ein Kalendertag-Element
     */
    createCalendarDay(date, isCurrentMonth) {
        const dateStr = formatDateISO(date);
        const workouts = StorageManager.getWorkoutsByDate(dateStr);
        const today = isToday(date);

        const day = createElement('div', {
            class: `calendar-day ${today ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`,
            onclick: () => isCurrentMonth && this.openTrainingModal(dateStr)
        });

        const dayNumber = createElement('div', {
            class: 'calendar-day-number',
            text: date.getDate()
        });
        day.appendChild(dayNumber);

        if (isCurrentMonth && workouts.length > 0) {
            const workoutsList = createElement('div', { class: 'calendar-day-workouts' });

            workouts.slice(0, 2).forEach(workout => {
                const workoutElem = createElement('div', {
                    class: 'calendar-day-workout',
                    text: workout.exerciseName,
                    onclick: (e) => {
                        e.stopPropagation();
                        this.showWorkoutDetails(workout.id);
                    }
                });
                workoutsList.appendChild(workoutElem);
            });

            day.appendChild(workoutsList);

            if (workouts.length > 2) {
                const count = createElement('div', {
                    class: 'calendar-day-count',
                    text: `+${workouts.length - 2} mehr`
                });
                day.appendChild(count);
            }
        }

        return day;
    },

    /* ==================== Year View ==================== */

    /**
     * Rendert die Jahresansicht
     */
    renderYearView() {
        const container = document.querySelector('#yearView .year-grid');
        clearElement(container);

        for (let month = 0; month < 12; month++) {
            const monthCard = this.createMonthCard(month);
            container.appendChild(monthCard);
        }
    },

    /**
     * Erstellt eine Monatskarte
     */
    createMonthCard(month) {
        const monthName = getMonthName(month);
        const card = createElement('div', { class: 'month-card' });

        const title = createElement('h4', {
            text: monthName
        });
        card.appendChild(title);

        const miniCalendar = createElement('div', { class: 'mini-calendar' });

        // Wochentage Header
        const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
        dayNames.forEach(name => {
            const header = createElement('div', {
                class: 'mini-calendar-header',
                text: name
            });
            miniCalendar.appendChild(header);
        });

        // Tage
        const days = getDaysInMonth(this.currentYear, month);
        days.forEach(dayObj => {
            const dateStr = formatDateISO(dayObj.date);
            const hasWorkout = StorageManager.getWorkoutsByDate(dateStr).length > 0;

            const dayElem = createElement('div', {
                class: `mini-calendar-day ${hasWorkout ? 'has-workout' : ''}`,
                text: dayObj.date.getDate()
            });

            miniCalendar.appendChild(dayElem);
        });

        card.appendChild(miniCalendar);
        return card;
    },

    /* ==================== History View ==================== */

    /**
     * Rendert die Historienansicht
     */
    renderHistoryView() {
        const container = document.querySelector('#historyView .history-list');
        clearElement(container);

        const workouts = StorageManager.getAllWorkouts().reverse();

        if (workouts.length === 0) {
            const empty = createElement('p', {
                class: 'empty-state',
                html: 'Keine Trainingseinheiten vorhanden.<br>Starte dein erstes Training!'
            });
            container.appendChild(empty);
            return;
        }

        workouts.forEach(workout => {
            const card = this.createHistoryCard(workout);
            container.appendChild(card);
        });
    },

    /**
     * Erstellt eine Historien-Karte
     */
    createHistoryCard(workout) {
        const card = createElement('div', {
            class: 'history-card',
            onclick: () => this.showWorkoutDetails(workout.id)
        });

        const date = createElement('div', {
            class: 'history-date',
            text: formatDateDE(workout.date)
        });

        const exercise = createElement('div', {
            class: 'history-exercise',
            text: workout.exerciseName
        });

        const stats = createElement('div', { class: 'history-stats' });

        const weight = createElement('div', {
            class: 'history-stat',
            html: `<strong>${workout.weight}kg</strong>Gewicht`
        });

        const reps = createElement('div', {
            class: 'history-stat',
            html: `<strong>${workout.reps}</strong>Wiederholungen`
        });

        const sets = createElement('div', {
            class: 'history-stat',
            html: `<strong>${workout.sets}</strong>Sätze`
        });

        const duration = createElement('div', {
            class: 'history-stat',
            html: `<strong>${workout.duration}min</strong>Dauer`
        });

        stats.appendChild(weight);
        stats.appendChild(reps);
        stats.appendChild(sets);
        stats.appendChild(duration);

        card.appendChild(date);
        card.appendChild(exercise);
        card.appendChild(stats);

        return card;
    },

    /* ==================== Modal Management ==================== */

    /**
     * Öffnet das Trainingsformular
     */
    openTrainingModal(date = null) {
        this.editingWorkoutId = null;
        document.getElementById('modalTitle').textContent = 'Neue Trainingseinheit';

        const form = document.getElementById('trainingForm');
        form.reset();

        if (date) {
            document.getElementById('trainingDate').value = date;
        } else {
            document.getElementById('trainingDate').value = formatDateISO(new Date());
        }

        document.getElementById('trainingModal').classList.add('active');
        document.getElementById('exerciseName').focus();
    },

    /**
     * Schließt alle Modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    /**
     * Zeigt Trainingsdetails
     */
    showWorkoutDetails(workoutId) {
        const workout = StorageManager.getWorkoutById(workoutId);
        if (!workout) return;

        this.editingWorkoutId = workoutId;

        const content = document.getElementById('detailsContent');
        clearElement(content);

        const details = [
            { label: 'Übung', value: workout.exerciseName },
            { label: 'Datum', value: formatDateDE(workout.date) },
            { label: 'Gewicht', value: `${workout.weight} kg` },
            { label: 'Wiederholungen', value: workout.reps },
            { label: 'Sätze', value: workout.sets },
            { label: 'Dauer', value: `${workout.duration} Minuten` },
            { label: 'Notizen', value: workout.notes || '—' }
        ];

        details.forEach(detail => {
            const row = createElement('div', { class: 'detail-row' });
            const label = createElement('div', {
                class: 'detail-label',
                text: detail.label
            });
            const value = createElement('div', {
                class: 'detail-value',
                text: detail.value
            });
            row.appendChild(label);
            row.appendChild(value);
            content.appendChild(row);
        });

        document.getElementById('detailsModal').classList.add('active');
    },

    /**
     * Bearbeitet die aktuelle Trainingseinheit
     */
    editCurrentWorkout() {
        if (!this.editingWorkoutId) return;

        const workout = StorageManager.getWorkoutById(this.editingWorkoutId);
        if (!workout) return;

        this.closeAllModals();

        document.getElementById('modalTitle').textContent = 'Trainingseinheit bearbeiten';
        document.getElementById('exerciseName').value = workout.exerciseName;
        document.getElementById('weight').value = workout.weight;
        document.getElementById('reps').value = workout.reps;
        document.getElementById('sets').value = workout.sets;
        document.getElementById('notes').value = workout.notes;
        document.getElementById('trainingDate').value = workout.date;
        document.getElementById('duration').value = workout.duration;

        document.getElementById('trainingModal').classList.add('active');
        document.getElementById('exerciseName').focus();
    },

    /**
     * Löscht die aktuelle Trainingseinheit
     */
    deleteCurrentWorkout() {
        if (!this.editingWorkoutId) return;

        if (confirm('Möchtest du diese Trainingseinheit wirklich löschen?')) {
            StorageManager.deleteWorkout(this.editingWorkoutId);
            this.closeAllModals();
            this.render();
        }
    },

    /* ==================== Form Handling ==================== */

    /**
     * Verarbeitet die Formularabsendung
     */
    handleFormSubmit(e) {
        e.preventDefault();

        const exerciseName = document.getElementById('exerciseName').value.trim();
        const weight = document.getElementById('weight').value;
        const reps = document.getElementById('reps').value;
        const sets = document.getElementById('sets').value;
        const notes = document.getElementById('notes').value.trim();
        const date = document.getElementById('trainingDate').value;
        const duration = document.getElementById('duration').value;

        // Validierung
        if (!exerciseName || !weight || !reps || !sets || !date) {
            alert('Bitte füllen Sie alle erforderlichen Felder aus.');
            return;
        }

        if (this.editingWorkoutId) {
            // Update
            StorageManager.updateWorkout(this.editingWorkoutId, {
                exerciseName,
                weight: parseFloat(weight),
                reps: parseInt(reps),
                sets: parseInt(sets),
                notes,
                date,
                duration: parseInt(duration) || 0
            });
        } else {
            // Create
            StorageManager.addWorkout({
                exerciseName,
                weight: parseFloat(weight),
                reps: parseInt(reps),
                sets: parseInt(sets),
                notes,
                date,
                duration: parseInt(duration) || 0
            });
        }

        this.closeAllModals();
        this.render();
    },

    /**
     * Verarbeitet die Eingabe des Übungsnamens (Auto-Completion)
     */
    handleExerciseInput(e) {
        const input = e.target.value;
        this.updateExerciseSuggestions(input);
    },

    /**
     * Zeigt Übungsvorschläge
     */
    showExerciseSuggestions() {
        const input = document.getElementById('exerciseName').value;
        this.updateExerciseSuggestions(input);
    },

    /**
     * Aktualisiert die Übungsvorschläge
     */
    updateExerciseSuggestions(input) {
        const datalist = document.getElementById('exerciseList');
        clearElement(datalist);

        if (input.length < 1) {
            const suggestions = StorageManager.getTopExercises(10);
            suggestions.forEach(exercise => {
                const option = document.createElement('option');
                option.value = exercise.name;
                datalist.appendChild(option);
            });
        } else {
            const suggestions = StorageManager.getExerciseSuggestions(input, 10);
            suggestions.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                datalist.appendChild(option);
            });
        }
    },

    /**
     * Aktualisiert die Übungsliste für Filter
     */
    updateExerciseList() {
        const select = document.getElementById('exerciseFilter');
        const currentValue = select.value;
        clearElement(select);

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Alle Übungen';
        select.appendChild(defaultOption);

        const exercises = StorageManager.getAllExercises();
        exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.name;
            option.textContent = exercise.name;
            select.appendChild(option);
        });

        select.value = currentValue;
    },

    /* ==================== Statistics ==================== */

    /**
     * Aktualisiert die Statistiken anzeige
     */
    updateStats() {
        const today = formatDateISO(new Date());
        const stats = StorageManager.getStatisticsForDate(today);

        document.getElementById('todayCount').textContent = stats.totalWorkouts;
        document.getElementById('totalWeight').textContent = `${formatNumber(stats.totalWeight, 1)} kg`;
        document.getElementById('totalDuration').textContent = `${stats.totalDuration} min`;
    }
};

// Initialisiere die App wenn das DOM fertig ist
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
