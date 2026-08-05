import type { Shift } from "../types";

type ShiftTableProps = {
  shifts: Shift[];
  onDelete: (id: number) => Promise<void>;
};

function calculateHours(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return (endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60;
}

export function ShiftTable({ shifts, onDelete }: ShiftTableProps) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Daily rota</p>
          <h2>Scheduled shifts</h2>
        </div>
        <span className="panel-badge">{shifts.length} shifts</span>
      </div>

      {shifts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-mark">+</div>
          <h3>No shifts scheduled</h3>
          <p>Add the first shift for this date using the form.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Time</th>
                <th>Area</th>
                <th>Hours</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id}>
                  <td>
                    <strong>{shift.employeeName}</strong>
                    <span className="cell-subtitle">{shift.role}</span>
                  </td>
                  <td>
                    {shift.startTime}–{shift.endTime}
                    {shift.notes && (
                      <span className="cell-subtitle">{shift.notes}</span>
                    )}
                  </td>
                  <td>{shift.area}</td>
                  <td>{calculateHours(shift.startTime, shift.endTime).toFixed(1)}</td>
                  <td>
                    <span className={`status-pill status-${shift.status}`}>
                      {shift.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="text-button danger-text"
                      type="button"
                      onClick={() => void onDelete(shift.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
