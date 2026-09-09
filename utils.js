/* ==================== Date Utilities ==================== */

/**
 * Gibt die Wochennummer eines Datums zurück
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Gibt den Montag einer bestimmten Woche zurück
 */
function getMondayOfWeek(year, week) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

/**
 * Gibt die Tage einer Woche zurück (Montag - Sonntag)
 */
function getWeekDays(year, week) {
    const monday = getMondayOfWeek(year, week);
    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(date.getDate() + i);
        days.push(new Date(date));
    }
    return days;
}

/**
 * Formatiert ein Datum zu deutschem Format (TT.MM.JJJJ)
 */
function formatDateDE(date) {
    if (!(date instanceof Date)) date = new Date(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

/**
 * Formatiert ein Datum zu ISO Format (JJJJ-MM-TT)
 */
function formatDateISO(date) {
    if (!(date instanceof Date)) date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Gibt den Namen des Wochentags zurück
 */
function getDayName(date) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    if (!(date instanceof Date)) date = new Date(date);
    return days[date.getDay()];
}

/**
 * Gibt den Namen des Monats zurück
 */
function getMonthName(monthIndex) {
    const months = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[monthIndex];
}

/**
 * Gibt alle Tage eines Monats zurück
 */
function getDaysInMonth(year, month) {
    const days = [];
    const date = new Date(year, month, 1);
    
    // Tage des Vormonats
    const firstDay = date.getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthDays - i);
        days.push({ date: d, isCurrentMonth: false });
    }
    
    // Tage des aktuellen Monats
    while (date.getMonth() === month) {
        days.push({ date: new Date(date), isCurrentMonth: true });
        date.setDate(date.getDate() + 1);
    }
    
    // Tage des Folgemonats
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
}

/**
 * Prüft ob ein Datum heute ist
 */
function isToday(date) {
    const today = new Date();
    if (!(date instanceof Date)) date = new Date(date);
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

/**
 * Prüft ob ein Datum am Wochenende ist
 */
function isWeekend(date) {
    if (!(date instanceof Date)) date = new Date(date);
    const day = date.getDay();
    return day === 0 || day === 6;
}

/**
 * Gibt das aktuelle Jahr und die aktuelle Woche zurück
 */
function getCurrentWeek() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        week: getWeekNumber(now)
    };
}

/**
 * Gibt das aktuelle Jahr und den aktuellen Monat zurück
 */
function getCurrentMonth() {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth()
    };
}

/**
 * Berechnet die Differenz zwischen zwei Daten in Tagen
 */
function daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/* ==================== String Utilities ==================== */

/**
 * Kapitalisiert den ersten Buchstaben eines Strings
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Entfernt Duplikate aus einem Array
 */
function removeDuplicates(arr) {
    return [...new Set(arr)];
}

/**
 * Sortiert Strings alphabetisch
 */
function sortAlphabetical(arr) {
    return arr.sort((a, b) => a.localeCompare(b, 'de'));
}

/**
 * Sucht in einem Array mit Partial Match (case-insensitive)
 */
function fuzzySearch(searchTerm, array, searchKey = null) {
    if (!searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    return array.filter(item => {
        const text = searchKey ? item[searchKey].toLowerCase() : item.toLowerCase();
        return text.includes(term);
    });
}

/* ==================== Number Utilities ==================== */

/**
 * Formatiert eine Zahl mit Dezimalstellen
 */
function formatNumber(num, decimals = 1) {
    return Number(num).toFixed(decimals);
}

/**
 * Rundet eine Zahl auf die nächste 0.5 ab
 */
function roundTo05(num) {
    return Math.round(num * 2) / 2;
}

/**
 * Berechnet den Durchschnitt aus einem Array
 */
function calculateAverage(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

/**
 * Berechnet die Summe aus einem Array
 */
function calculateSum(arr, key = null) {
    return arr.reduce((sum, item) => {
        const value = key ? item[key] : item;
        return sum + (Number(value) || 0);
    }, 0);
}

/**
 * Findet das Maximum aus einem Array
 */
function findMax(arr, key = null) {
    if (arr.length === 0) return 0;
    return Math.max(...arr.map(item => key ? item[key] : item));
}

/**
 * Findet das Minimum aus einem Array
 */
function findMin(arr, key = null) {
    if (arr.length === 0) return 0;
    return Math.min(...arr.map(item => key ? item[key] : item));
}

/* ==================== DOM Utilities ==================== */

/**
 * Erstellt ein DOM Element mit Attributen und Inhalten
 */
function createElement(tag, options = {}) {
    const element = document.createElement(tag);
    
    if (options.class) {
        element.className = options.class;
    }
    
    if (options.id) {
        element.id = options.id;
    }
    
    if (options.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }
    
    if (options.text) {
        element.textContent = options.text;
    }
    
    if (options.html) {
        element.innerHTML = options.html;
    }
    
    if (options.children) {
        options.children.forEach(child => {
            element.appendChild(child);
        });
    }
    
    if (options.onclick) {
        element.addEventListener('click', options.onclick);
    }
    
    return element;
}

/**
 * Zeigt ein Element
 */
function show(element) {
    element.style.display = '';
}

/**
 * Versteckt ein Element
 */
function hide(element) {
    element.style.display = 'none';
}

/**
 * Toggelt die Sichtbarkeit eines Elements
 */
function toggle(element) {
    element.style.display = element.style.display === 'none' ? '' : 'none';
}

/**
 * Fügt eine Klasse zu einem Element hinzu, wenn eine Bedingung erfüllt ist
 */
function toggleClass(element, className, condition) {
    if (condition) {
        element.classList.add(className);
    } else {
        element.classList.remove(className);
    }
}

/**
 * Entfernt alle Kinder eines Elements
 */
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/* ==================== Validation Utilities ==================== */

/**
 * Validiert eine E-Mail Adresse
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validiert dass ein Feld nicht leer ist
 */
function isNotEmpty(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Validiert dass ein Wert eine Zahl ist
 */
function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validiert dass ein Wert positiv ist
 */
function isPositive(value) {
    return isNumber(value) && parseFloat(value) > 0;
}

/* ==================== Browser Storage Utilities ==================== */

/**
 * Speichert Daten im localStorage
 */
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Fehler beim Speichern:', e);
        return false;
    }
}

/**
 * Ruft Daten aus dem localStorage ab
 */
function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error('Fehler beim Laden:', e);
        return defaultValue;
    }
}

/**
 * Entfernt Daten aus dem localStorage
 */
function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Fehler beim Löschen:', e);
        return false;
    }
}

/**
 * Löscht den gesamten localStorage
 */
function clearLocalStorage() {
    try {
        localStorage.clear();
        return true;
    } catch (e) {
        console.error('Fehler beim Löschen:', e);
        return false;
    }
}

/* ==================== Notification Utilities ==================== */

/**
 * Zeigt eine Benachrichtigung an (Browser Notification API)
 */
function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    }
}

/**
 * Fordert die Erlaubnis für Benachrichtigungen an
 */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/* ==================== Array Utilities ==================== */

/**
 * Gruppiert Array Elemente nach einem Key
 */
function groupBy(arr, key) {
    return arr.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

/**
 * Filtert Array Duplikate basierend auf einem Key
 */
function uniqueBy(arr, key) {
    return arr.filter((item, index, self) =>
        index === self.findIndex(t => t[key] === item[key])
    );
}

/**
 * Sortiert ein Array von Objekten
 */
function sortBy(arr, key, order = 'asc') {
    return [...arr].sort((a, b) => {
        if (order === 'asc') {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
}

/* ==================== Export ==================== */
// Diese Funktionen sind global verfügbar da sie in einem Script Tag geladen werden
