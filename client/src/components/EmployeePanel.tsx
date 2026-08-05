import { useState, type FormEvent } from "react";
import type { Employee, EmployeeInput } from "../types";

type EmployeePanelProps = {
  employees: Employee[];
  onCreate: (employee: EmployeeInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

const emptyEmployee: EmployeeInput = {
  name: "",
  role: "Crew Member",
  hourlyRate: 12.5,
  availability: "Flexible"
};

export function EmployeePanel({
  employees,
  onCreate,
  onDelete
}: EmployeePanelProps) {
  const [form, setForm] = useState<EmployeeInput>(emptyEmployee);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onCreate(form);
      setForm(emptyEmployee);
    } catch {
      // The parent component displays the API error.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="team-layout">
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Team</p>
            <h2>Add employee</h2>
          </div>
        </div>

        <label>
          Full name
          <input
            value={form.name}
            placeholder="Example: Alex Morgan"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>

        <label>
          Role
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            <option>Crew Member</option>
            <option>Crew Trainer</option>
            <option>Shift Manager</option>
            <option>Area Leader</option>
            <option>Customer Care</option>
          </select>
        </label>

        <div className="form-row">
          <label>
            Hourly rate (£)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.hourlyRate}
              onChange={(event) =>
                setForm({ ...form, hourlyRate: Number(event.target.value) })
              }
              required
            />
          </label>
          <label>
            Availability
            <select
              value={form.availability}
              onChange={(event) =>
                setForm({ ...form, availability: event.target.value })
              }
            >
              <option>Flexible</option>
              <option>Weekdays</option>
              <option>Weekends</option>
              <option>Evenings</option>
              <option>Mornings</option>
            </select>
          </label>
        </div>

        <button className="primary-button" type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add employee"}
        </button>
      </form>

      <section className="panel team-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Directory</p>
            <h2>Team members</h2>
          </div>
          <span className="panel-badge">{employees.length} people</span>
        </div>

        <div className="employee-grid">
          {employees.map((employee) => (
            <article className="employee-card" key={employee.id}>
              <div className="employee-avatar" aria-hidden="true">
                {employee.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="employee-details">
                <h3>{employee.name}</h3>
                <p>{employee.role}</p>
                <div className="employee-meta">
                  <span>£{employee.hourlyRate.toFixed(2)}/hr</span>
                  <span>{employee.availability}</span>
                </div>
              </div>
              <button
                className="text-button danger-text"
                type="button"
                onClick={() => void onDelete(employee.id)}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
