import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { EmployeePanel } from "./components/EmployeePanel";
import { ShiftForm } from "./components/ShiftForm";
import { ShiftTable } from "./components/ShiftTable";
import { SummaryCards } from "./components/SummaryCards";
import type {
  DashboardData,
  Employee,
  EmployeeInput,
  Shift,
  ShiftInput
} from "./types";

type View = "dashboard" | "schedule" | "team";

function localDateString() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatSelectedDate(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [selectedDate, setSelectedDate] = useState(localDateString);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [employeeData, shiftData, dashboardData] = await Promise.all([
        api.getEmployees(),
        api.getShifts(selectedDate),
        api.getDashboard(selectedDate)
      ]);
      setEmployees(employeeData);
      setShifts(shiftData);
      setDashboard(dashboardData);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to load data"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const areas = useMemo(
    () => Object.entries(dashboard?.areaBreakdown ?? {}),
    [dashboard]
  );

  async function createEmployee(employee: EmployeeInput) {
    setError("");
    try {
      await api.createEmployee(employee);
      setMessage("Employee added successfully.");
      await loadData();
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to create employee";
      setError(message);
      throw requestError;
    }
  }

  async function deleteEmployee(id: number) {
    const confirmed = window.confirm(
      "Remove this employee and all of their scheduled shifts?"
    );
    if (!confirmed) return;

    setError("");
    try {
      await api.deleteEmployee(id);
      setMessage("Employee removed.");
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Delete failed");
    }
  }

  async function createShift(shift: ShiftInput) {
    setError("");
    try {
      await api.createShift(shift);
      setMessage("Shift created successfully.");
      if (shift.shiftDate !== selectedDate) {
        setSelectedDate(shift.shiftDate);
      } else {
        await loadData();
      }
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Unable to create shift";
      setError(message);
      throw requestError;
    }
  }

  async function deleteShift(id: number) {
    const confirmed = window.confirm("Delete this shift?");
    if (!confirmed) return;

    setError("");
    try {
      await api.deleteShift(id);
      setMessage("Shift deleted.");
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Delete failed");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="ShiftFlow home">
          <span className="brand-mark">SF</span>
          <span>
            <strong>ShiftFlow</strong>
            <small>Workforce planner</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Primary navigation">
          <button
            className={view === "dashboard" ? "nav-button active" : "nav-button"}
            onClick={() => setView("dashboard")}
            type="button"
          >
            <span>01</span> Dashboard
          </button>
          <button
            className={view === "schedule" ? "nav-button active" : "nav-button"}
            onClick={() => setView("schedule")}
            type="button"
          >
            <span>02</span> Schedule
          </button>
          <button
            className={view === "team" ? "nav-button active" : "nav-button"}
            onClick={() => setView("team")}
            type="button"
          >
            <span>03</span> Team
          </button>
        </nav>

        <div className="sidebar-note">
          <p className="eyebrow">Portfolio build</p>
          <strong>Version 1.0</strong>
          <span>React · TypeScript · Express · SQLite</span>
        </div>
      </aside>

      <main className="main-content" id="top">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations overview</p>
            <h1>
              {view === "team"
                ? "Manage your team"
                : view === "schedule"
                  ? "Build the daily rota"
                  : "Run a better shift"}
            </h1>
            <p className="header-subtitle">{formatSelectedDate(selectedDate)}</p>
          </div>

          <label className="date-control">
            <span>Working date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            />
          </label>
        </header>

        {message && <div className="notice success-notice">{message}</div>}
        {error && <div className="notice error-notice">{error}</div>}

        {loading ? (
          <div className="loading-state">Loading ShiftFlow…</div>
        ) : (
          <>
            {view === "dashboard" && (
              <>
                <SummaryCards dashboard={dashboard} />
                <div className="dashboard-layout">
                  <ShiftTable shifts={shifts} onDelete={deleteShift} />
                  <aside className="panel coverage-panel">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">Coverage</p>
                        <h2>Area allocation</h2>
                      </div>
                    </div>

                    {areas.length === 0 ? (
                      <p className="muted-copy">No work areas scheduled yet.</p>
                    ) : (
                      <div className="coverage-list">
                        {areas.map(([area, count]) => (
                          <div className="coverage-row" key={area}>
                            <div>
                              <strong>{area}</strong>
                              <span>{count} scheduled</span>
                            </div>
                            <div className="coverage-bar" aria-hidden="true">
                              <span
                                style={{
                                  width: `${Math.min(100, count * 25)}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </aside>
                </div>
              </>
            )}

            {view === "schedule" && (
              <div className="schedule-layout">
                <ShiftForm
                  employees={employees}
                  selectedDate={selectedDate}
                  onSubmit={createShift}
                />
                <ShiftTable shifts={shifts} onDelete={deleteShift} />
              </div>
            )}

            {view === "team" && (
              <EmployeePanel
                employees={employees}
                onCreate={createEmployee}
                onDelete={deleteEmployee}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
