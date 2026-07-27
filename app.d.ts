interface WorkLog {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    breakMins: number;
    totalHours: number;
    description: string;
}
declare const GOAL_HOURS = 240;
declare const STORAGE_KEY = "airix_internship_logs";
declare let logs: WorkLog[];
declare let editingId: number | null;
declare const form: HTMLFormElement;
declare const logsBody: HTMLTableSectionElement;
declare const totalHoursDisplay: HTMLSpanElement;
declare const percentageDisplay: HTMLSpanElement;
declare const progressFill: HTMLDivElement;
declare const submitBtn: HTMLButtonElement;
declare function init(): void;
declare function calculateHours(start: string, end: string, breakMins: number): number;
declare function formatBreakText(mins: number): string;
declare function saveLogs(): void;
declare function renderUI(): void;
//# sourceMappingURL=app.d.ts.map