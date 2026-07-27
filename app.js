"use strict";
// Constants
const GOAL_HOURS = 240;
const STORAGE_KEY = 'airix_internship_logs';
// State array & Edit state
let logs = [];
let editingId = null; // Tracks if we are editing an entry
// DOM Elements
const form = document.getElementById('log-form');
const logsBody = document.getElementById('logs-body');
const totalHoursDisplay = document.getElementById('total-hours-display');
const percentageDisplay = document.getElementById('percentage-display');
const progressFill = document.getElementById('progress-fill');
const submitBtn = document.querySelector('.submit-btn');
// Initialization
function init() {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    if (storedLogs) {
        logs = JSON.parse(storedLogs);
    }
    renderUI();
}
// Calculate the hours between two HH:mm strings, subtracting breaks
function calculateHours(start, end, breakMins) {
    const startParts = start.split(':');
    const endParts = end.split(':');
    // Add fallbacks to 0 to satisfy TypeScript's strict null checks
    const startH = Number(startParts[0]) || 0;
    const startM = Number(startParts[1]) || 0;
    const endH = Number(endParts[0]) || 0;
    const endM = Number(endParts[1]) || 0;
    let startTotalMins = (startH * 60) + startM;
    let endTotalMins = (endH * 60) + endM;
    // Handle overnight shifts (e.g., 23:00 to 02:00)
    if (endTotalMins < startTotalMins) {
        endTotalMins += 24 * 60;
    }
    const netWorkedMins = (endTotalMins - startTotalMins) - breakMins;
    // Ensure we don't return negative hours if break is longer than shift
    return Math.max(0, Number((netWorkedMins / 60).toFixed(2)));
}
// Format the break display text
function formatBreakText(mins) {
    if (mins === 0)
        return "-";
    if (mins === 30)
        return "30 mins";
    if (mins === 60)
        return "1 hour";
    return `${mins} mins`;
}
// Update Local Storage
function saveLogs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}
// Render the entire UI (Table + Progress Bar)
function renderUI() {
    // Clear current table
    logsBody.innerHTML = '';
    let totalWorked = 0;
    // Sort logs by date (ascending)
    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Populate table
    logs.forEach(log => {
        totalWorked += log.totalHours;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.date}</td>
            <td>${log.startTime}</td>
            <td>${log.endTime}</td>
            <td>${formatBreakText(log.breakMins)}</td>
            <td><strong>${log.totalHours}</strong></td>
            <td>${log.description}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editLog(${log.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteLog(${log.id})">Delete</button>
                </div>
            </td>
        `;
        logsBody.appendChild(tr);
    });
    // Update Progress Dashboard
    const percentage = Math.min(100, (totalWorked / GOAL_HOURS) * 100);
    totalHoursDisplay.textContent = `${totalWorked.toFixed(2)} / ${GOAL_HOURS} Hours Completed`;
    percentageDisplay.textContent = `${percentage.toFixed(1)}%`;
    progressFill.style.width = `${percentage}%`;
}
// Handle Form Submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dateInput = document.getElementById('date');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const breakInput = document.getElementById('break-time');
    const descInput = document.getElementById('description');
    const breakMins = parseInt(breakInput.value, 10);
    const calculatedHours = calculateHours(startTimeInput.value, endTimeInput.value, breakMins);
    if (editingId !== null) {
        // We are updating an existing log
        const logIndex = logs.findIndex(log => log.id === editingId);
        if (logIndex > -1) {
            logs[logIndex] = {
                id: editingId, // Use the stored ID directly to bypass strict mode checks!
                date: dateInput.value,
                startTime: startTimeInput.value,
                endTime: endTimeInput.value,
                breakMins: breakMins,
                totalHours: calculatedHours,
                description: descInput.value
            };
        }
        // Reset out of edit mode
        editingId = null;
        submitBtn.textContent = "Add Entry";
    }
    else {
        // We are creating a new log
        const newLog = {
            id: Date.now(),
            date: dateInput.value,
            startTime: startTimeInput.value,
            endTime: endTimeInput.value,
            breakMins: breakMins,
            totalHours: calculatedHours,
            description: descInput.value
        };
        logs.push(newLog);
    }
    saveLogs();
    renderUI();
    form.reset();
});
// Expose edit function to global scope
window.editLog = function (id) {
    const logToEdit = logs.find(log => log.id === id);
    if (!logToEdit)
        return;
    // Populate the form with the existing data
    document.getElementById('date').value = logToEdit.date;
    document.getElementById('start-time').value = logToEdit.startTime;
    document.getElementById('end-time').value = logToEdit.endTime;
    document.getElementById('break-time').value = logToEdit.breakMins.toString();
    document.getElementById('description').value = logToEdit.description;
    // Set the app to edit mode and change the button text
    editingId = id;
    submitBtn.textContent = "Update Entry";
    // Scroll up to the form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
// Expose delete function to global scope
window.deleteLog = function (id) {
    if (confirm("Are you sure you want to delete this entry?")) {
        logs = logs.filter(log => log.id !== id);
        saveLogs();
        renderUI();
    }
};
// Start the app
init();
//# sourceMappingURL=app.js.map