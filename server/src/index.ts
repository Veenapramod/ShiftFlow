import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { db } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

type EmployeeRow = {
  id: number;
  name: string;
  role: string;
  hourlyRate: number;
  availability: string;
  active: number;
  createdAt: string;
};

type ShiftRow = {
  id: number;
  employeeId: number;
  employeeName: string;
  role: string;
  hourlyRate: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  area: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
};

const employeeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().min(2).max(50),
  hourlyRate: z.coerce.number().min(0).max(100),
  availability: z.string().trim().min(2).max(50)
});

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const shiftSchema = z
  .object({
    employeeId: z.coerce.number().int().positive(),
    shiftDate: z.string().regex(datePattern, "Use a valid date"),
    startTime: z.string().regex(timePattern, "Use a valid start time"),
    endTime: z.string().regex(timePattern, "Use a valid end time"),
    area: z.string().trim().min(2).max(50),
    notes: z.string().trim().max(250).default(""),
    status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled")
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be later than start time",
    path: ["endTime"]
  });

function mapEmployee(row: EmployeeRow) {
  return { ...row, active: Boolean(row.active) };
}

function getShiftById(id: number) {
  return db
    .prepare(
      `SELECT
        shifts.*,
        employees.name AS employeeName,
        employees.role AS role,
        employees.hourlyRate AS hourlyRate
      FROM shifts
      JOIN employees ON employees.id = shifts.employeeId
      WHERE shifts.id = ?`
    )
    .get(id) as ShiftRow | undefined;
}

function hasConflict(
  employeeId: number,
  shiftDate: string,
  startTime: string,
  endTime: string,
  excludedShiftId = -1
) {
  const conflict = db
    .prepare(
      `SELECT id
       FROM shifts
       WHERE employeeId = ?
         AND shiftDate = ?
         AND status != 'cancelled'
         AND id != ?
         AND startTime < ?
         AND endTime > ?
       LIMIT 1`
    )
    .get(employeeId, shiftDate, excludedShiftId, endTime, startTime);

  return Boolean(conflict);
}

function minutesBetween(startTime: string, endTime: string) {
  const [startHour = 0, startMinute = 0] = startTime.split(":").map(Number);
  const [endHour = 0, endMinute = 0] = endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "shiftflow-api" });
});

app.get("/api/employees", (_request, response) => {
  const rows = db
    .prepare("SELECT * FROM employees ORDER BY active DESC, name ASC")
    .all() as EmployeeRow[];
  response.json(rows.map(mapEmployee));
});

app.post("/api/employees", (request, response) => {
  const parsed = employeeSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO employees (name, role, hourlyRate, availability)
       VALUES (?, ?, ?, ?)`
    )
    .run(
      parsed.data.name,
      parsed.data.role,
      parsed.data.hourlyRate,
      parsed.data.availability
    );

  const employee = db
    .prepare("SELECT * FROM employees WHERE id = ?")
    .get(result.lastInsertRowid) as EmployeeRow;

  response.status(201).json(mapEmployee(employee));
});

app.delete("/api/employees/:id", (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(400).json({ error: "Invalid employee ID" });
    return;
  }

  const result = db.prepare("DELETE FROM employees WHERE id = ?").run(id);

  if (result.changes === 0) {
    response.status(404).json({ error: "Employee not found" });
    return;
  }

  response.json({ message: "Employee deleted" });
});

app.get("/api/shifts", (request, response) => {
  const date = typeof request.query.date === "string" ? request.query.date : "";

  const baseQuery = `SELECT
      shifts.*,
      employees.name AS employeeName,
      employees.role AS role,
      employees.hourlyRate AS hourlyRate
    FROM shifts
    JOIN employees ON employees.id = shifts.employeeId`;

  const rows = date
    ? (db
        .prepare(
          `${baseQuery}
           WHERE shifts.shiftDate = ?
           ORDER BY shifts.startTime ASC, employees.name ASC`
        )
        .all(date) as ShiftRow[])
    : (db
        .prepare(
          `${baseQuery}
           ORDER BY shifts.shiftDate ASC, shifts.startTime ASC`
        )
        .all() as ShiftRow[]);

  response.json(rows);
});

app.post("/api/shifts", (request, response) => {
  const parsed = shiftSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  const employee = db
    .prepare("SELECT id, active FROM employees WHERE id = ?")
    .get(parsed.data.employeeId) as { id: number; active: number } | undefined;

  if (!employee || !employee.active) {
    response.status(404).json({ error: "Active employee not found" });
    return;
  }

  if (
    parsed.data.status !== "cancelled" &&
    hasConflict(
      parsed.data.employeeId,
      parsed.data.shiftDate,
      parsed.data.startTime,
      parsed.data.endTime
    )
  ) {
    response.status(409).json({
      error: "This employee already has an overlapping shift on that date"
    });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO shifts
        (employeeId, shiftDate, startTime, endTime, area, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      parsed.data.employeeId,
      parsed.data.shiftDate,
      parsed.data.startTime,
      parsed.data.endTime,
      parsed.data.area,
      parsed.data.notes,
      parsed.data.status
    );

  response.status(201).json(getShiftById(Number(result.lastInsertRowid)));
});

app.put("/api/shifts/:id", (request, response) => {
  const id = Number(request.params.id);
  const parsed = shiftSchema.safeParse(request.body);

  if (!Number.isInteger(id)) {
    response.status(400).json({ error: "Invalid shift ID" });
    return;
  }

  if (!parsed.success) {
    response.status(400).json({ error: parsed.error.issues[0]?.message });
    return;
  }

  if (
    parsed.data.status !== "cancelled" &&
    hasConflict(
      parsed.data.employeeId,
      parsed.data.shiftDate,
      parsed.data.startTime,
      parsed.data.endTime,
      id
    )
  ) {
    response.status(409).json({
      error: "This employee already has an overlapping shift on that date"
    });
    return;
  }

  const result = db
    .prepare(
      `UPDATE shifts
       SET employeeId = ?, shiftDate = ?, startTime = ?, endTime = ?,
           area = ?, notes = ?, status = ?
       WHERE id = ?`
    )
    .run(
      parsed.data.employeeId,
      parsed.data.shiftDate,
      parsed.data.startTime,
      parsed.data.endTime,
      parsed.data.area,
      parsed.data.notes,
      parsed.data.status,
      id
    );

  if (result.changes === 0) {
    response.status(404).json({ error: "Shift not found" });
    return;
  }

  response.json(getShiftById(id));
});

app.delete("/api/shifts/:id", (request, response) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id)) {
    response.status(400).json({ error: "Invalid shift ID" });
    return;
  }

  const result = db.prepare("DELETE FROM shifts WHERE id = ?").run(id);

  if (result.changes === 0) {
    response.status(404).json({ error: "Shift not found" });
    return;
  }

  response.json({ message: "Shift deleted" });
});

app.get("/api/dashboard", (request, response) => {
  const date =
    typeof request.query.date === "string"
      ? request.query.date
      : new Date().toISOString().slice(0, 10);

  const activeEmployees = (
    db.prepare("SELECT COUNT(*) AS count FROM employees WHERE active = 1").get() as {
      count: number;
    }
  ).count;

  const rows = db
    .prepare(
      `SELECT shifts.*, employees.hourlyRate
       FROM shifts
       JOIN employees ON employees.id = shifts.employeeId
       WHERE shifts.shiftDate = ? AND shifts.status != 'cancelled'`
    )
    .all(date) as Array<{
    employeeId: number;
    startTime: string;
    endTime: string;
    area: string;
    hourlyRate: number;
  }>;

  let totalHours = 0;
  let estimatedLabourCost = 0;
  const staffIds = new Set<number>();
  const areaBreakdown: Record<string, number> = {};

  for (const shift of rows) {
    const hours = minutesBetween(shift.startTime, shift.endTime) / 60;
    totalHours += hours;
    estimatedLabourCost += hours * shift.hourlyRate;
    staffIds.add(shift.employeeId);
    areaBreakdown[shift.area] = (areaBreakdown[shift.area] ?? 0) + 1;
  }

  response.json({
    date,
    activeEmployees,
    scheduledShifts: rows.length,
    scheduledStaff: staffIds.size,
    totalHours: Number(totalHours.toFixed(2)),
    estimatedLabourCost: Number(estimatedLabourCost.toFixed(2)),
    areaBreakdown
  });
});

app.use("/api", (_request, response) => {
  response.status(404).json({ error: "API route not found" });
});

const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);
const clientDist = path.resolve(directoryName, "../../client/dist");
const clientIndex = path.join(clientDist, "index.html");

if (fs.existsSync(clientIndex)) {
  app.use(express.static(clientDist));
  app.use((request, response, next) => {
    if (request.method !== "GET") {
      next();
      return;
    }
    response.sendFile(clientIndex);
  });
}

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Unexpected server error" });
};

app.use(errorHandler);

app.listen(port, () => {
  console.log(`ShiftFlow API running at http://localhost:${port}`);
});
