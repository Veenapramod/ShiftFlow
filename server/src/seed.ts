import { db } from "./db.js";

function localDateWithOffset(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

const today = localDateWithOffset(0);
const tomorrow = localDateWithOffset(1);

const seed = db.transaction(() => {
  db.prepare("DELETE FROM shifts").run();
  db.prepare("DELETE FROM employees").run();
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('employees', 'shifts')").run();

  const insertEmployee = db.prepare(
    `INSERT INTO employees (name, role, hourlyRate, availability)
     VALUES (?, ?, ?, ?)`
  );

  const employees = [
    ["Aisha Khan", "Shift Manager", 15.8, "Flexible"],
    ["Daniel Reed", "Crew Trainer", 13.4, "Weekdays"],
    ["Maya Patel", "Crew Member", 12.6, "Evenings"],
    ["Noah Williams", "Crew Member", 12.6, "Weekends"],
    ["Sofia Martins", "Customer Care", 12.9, "Flexible"]
  ] as const;

  const employeeIds = employees.map((employee) =>
    Number(insertEmployee.run(...employee).lastInsertRowid)
  );

  const insertShift = db.prepare(
    `INSERT INTO shifts
      (employeeId, shiftDate, startTime, endTime, area, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`
  );

  insertShift.run(employeeIds[0], today, "08:00", "16:00", "Management", "Opening shift");
  insertShift.run(employeeIds[1], today, "10:00", "18:00", "Kitchen", "Lunch rush lead");
  insertShift.run(employeeIds[2], today, "12:00", "20:00", "Front Counter", "Peak support");
  insertShift.run(employeeIds[4], today, "11:00", "17:00", "Floor", "Customer experience");
  insertShift.run(employeeIds[3], tomorrow, "09:00", "17:00", "Drive Thru", "Window one");
});

seed();
console.log(`Seeded ShiftFlow with demo data for ${today} and ${tomorrow}.`);
db.close();
