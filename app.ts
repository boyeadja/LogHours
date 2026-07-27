// Define the shape of our data
interface WorkLog {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    breakMins: number;
    totalHours: number;
    description: string;
}

const GOAL_HOURS = 240;
const STORAGE_KEY = 'airix_internship_logs';

let logs: WorkLog[] = [];
let editingId: number | null = null; 

const form = document.getElementById('log-form') as HTMLFormElement;
const logsBody = document.getElementById('logs-body') as HTMLTableSectionElement;
const totalHoursDisplay = document.getElementById('total-hours-display') as HTMLSpanElement;
const percentageDisplay = document.getElementById('percentage-display') as HTMLSpanElement;
const progressFill = document.getElementById('progress-fill') as HTMLDivElement;
const submitBtn = document.querySelector('.submit-btn') as HTMLButtonElement;

function init() {
    const storedLogs = localStorage.getItem(STORAGE_KEY);
    if (storedLogs) {
        logs = JSON.parse(storedLogs);
    }
    renderUI();
}

function calculateHours(start: string, end: string, breakMins: number): number {
    const startParts = start.split(':');
    const endParts = end.split(':');

    const startH = Number(startParts[0]) || 0;
    const startM = Number(startParts[1]) || 0;
    const endH = Number(endParts[0]) || 0;
    const endM = Number(endParts[1]) || 0;

    let startTotalMins = (startH * 60) + startM;
    let endTotalMins = (endH * 60) + endM;

    if (endTotalMins < startTotalMins) {
        endTotalMins += 24 * 60; 
    }

    const netWorkedMins = (endTotalMins - startTotalMins) - breakMins;
    
    return Math.max(0, Number((netWorkedMins / 60).toFixed(2)));
}

function formatBreakText(mins: number): string {
    if (mins === 0) return "-";
    if (mins === 30) return "30 mins";
    if (mins === 60) return "1 hour";
    return `${mins} mins`;
}

function saveLogs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function renderUI() {
    // Clear current table
    logsBody.innerHTML = '';
    
    let totalWorked = 0;

    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

    const percentage = Math.min(100, (totalWorked / GOAL_HOURS) * 100);
    
    totalHoursDisplay.textContent = `${totalWorked.toFixed(2)} / ${GOAL_HOURS} Hours Completed`;
    percentageDisplay.textContent = `${percentage.toFixed(1)}%`;
    progressFill.style.width = `${percentage}%`;
}

form.addEventListener('submit', (e: Event) => {
    e.preventDefault();

    const dateInput = document.getElementById('date') as HTMLInputElement;
    const startTimeInput = document.getElementById('start-time') as HTMLInputElement;
    const endTimeInput = document.getElementById('end-time') as HTMLInputElement;
    const breakInput = document.getElementById('break-time') as HTMLSelectElement;
    const descInput = document.getElementById('description') as HTMLInputElement;

    const breakMins = parseInt(breakInput.value, 10);
    const calculatedHours = calculateHours(startTimeInput.value, endTimeInput.value, breakMins);

    if (editingId !== null) {
        const logIndex = logs.findIndex(log => log.id === editingId);
        if (logIndex > -1) {
            logs[logIndex] = {
                id: editingId, 
                date: dateInput.value,
                startTime: startTimeInput.value,
                endTime: endTimeInput.value,
                breakMins: breakMins,
                totalHours: calculatedHours,
                description: descInput.value
            };
        }
        
        editingId = null;
        submitBtn.textContent = "Add Entry";
    } else {
        const newLog: WorkLog = {
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

(window as any).editLog = function(id: number) {
    const logToEdit = logs.find(log => log.id === id);
    if (!logToEdit) return;

    (document.getElementById('date') as HTMLInputElement).value = logToEdit.date;
    (document.getElementById('start-time') as HTMLInputElement).value = logToEdit.startTime;
    (document.getElementById('end-time') as HTMLInputElement).value = logToEdit.endTime;
    (document.getElementById('break-time') as HTMLSelectElement).value = logToEdit.breakMins.toString();
    (document.getElementById('description') as HTMLInputElement).value = logToEdit.description;

    editingId = id;
    submitBtn.textContent = "Update Entry";
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

(window as any).deleteLog = function(id: number) {
    if(confirm("Are you sure you want to delete this entry?")) {
        logs = logs.filter(log => log.id !== id);
        saveLogs();
        renderUI();
    }
};

init();