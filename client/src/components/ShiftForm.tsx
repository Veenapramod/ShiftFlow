import { useEffect, useState, type FormEvent } from "react";
import type { Employee, ShiftInput } from "../types";

type ShiftFormProps = {
  employees: Employee[];
  selectedDate: string;
  onSubmit: (shift: ShiftInput) => Promise<void>;
};

const initialForm = (selectedDate: string): ShiftInput => ({
  employeeId: 0,
  shiftDate: selectedDate,
  startTime: "09:00",
  endTime: "17:00",
  area: "Front Counter",
  notes: "",
  status: "scheduled"
});

export function ShiftForm({
  employees,
  selectedDate,
  onSubmit
}: ShiftFormProps) {
  const [form, setForm] = useState<ShiftInput>(() => initialForm(selectedDate));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm((current) => ({ ...current, shiftDate: selectedDate }));
  }, [selectedDate]);

  useEffect(() => {
    if (form.employeeId === 0 && employees.length > 0) {
      setForm((current) => ({ ...current, employeeId: employees[0].id }));
    }
  }, [employees, form.employeeId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      await onSubmit(form);
      setForm((current) => ({
        ...initialForm(selectedDate),
        employeeId: current.employeeId
      }));
    } catch {
      // The parent component displays the API error.
    } finally {
      setSubmitting(false);
    }
  }

  const activeEmployees = employees.filter((employee) => employee.active);

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>Add a shift</h2>
        </div>
        <span className="panel-badge">MVP</span>
      </div>

      <label>
        Employee
        <select
          value={form.employeeId}
          onChange={(event) =>
            setForm({ ...form, employeeId: Number(event.target.value) })
          }
          required
        >
          {activeEmployees.length === 0 && (
            <option value={0}>Add an employee first</option>
          )}
          {activeEmployees.map((employee) => (
            <option value={employee.id} key={employee.id}>
              {employee.name} · {employee.role}
            </option>
          ))}
        </select>
      </label>

      <div className="form-row">
        <label>
          Date
          <input
            type="date"
            value={form.shiftDate}
            onChange={(event) =>
              setForm({ ...form, shiftDate: event.target.value })
            }
            required
          />
        </label>
        <label>
          Work area
          <select
            value={form.area}
            onChange={(event) => setForm({ ...form, area: event.target.value })}
          >
            <option>Front Counter</option>
            <option>Kitchen</option>
            <option>Drive Thru</option>
            <option>Delivery</option>
            <option>Floor</option>
            <option>Management</option>
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Start
          <input
            type="time"
            value={form.startTime}
            onChange={(event) =>
              setForm({ ...form, startTime: event.target.value })
            }
            required
          />
        </label>
        <label>
          End
          <input
            type="time"
            value={form.endTime}
            onChange={(event) =>
              setForm({ ...form, endTime: event.target.value })
            }
            required
          />
        </label>
      </div>

      <label>
        Notes
        <textarea
          rows={3}
          value={form.notes}
          placeholder="Example: Lunch rush support"
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
        />
      </label>

      <button
        className="primary-button"
        type="submit"
        disabled={submitting || activeEmployees.length === 0}
      >
        {submitting ? "Saving…" : "Create shift"}
      </button>
    </form>
  );
}
