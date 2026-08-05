import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);
const defaultDatabasePath = path.resolve(directoryName, "../data/shiftflow.db");
const databasePath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : defaultDatabasePath;

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new Database(databasePath);

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    hourlyRate REAL NOT NULL CHECK (hourlyRate >= 0),
    availability TEXT NOT NULL DEFAULT 'Flexible',
    active INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shifts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employeeId INTEGER NOT NULL,
    shiftDate TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    area TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'scheduled'
      CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(shiftDate);
  CREATE INDEX IF NOT EXISTS idx_shifts_employee_date
    ON shifts(employeeId, shiftDate);
`);
