import type {
  DashboardData,
  Employee,
  EmployeeInput,
  Shift,
  ShiftInput
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json"
    }
  });

  const body = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? "Something went wrong");
  }

  return body;
}

export const api = {
  getEmployees: () => request<Employee[]>("/api/employees"),

  createEmployee: (employee: EmployeeInput) =>
    request<Employee>("/api/employees", {
      method: "POST",
      body: JSON.stringify(employee)
    }),

  deleteEmployee: (id: number) =>
    request<{ message: string }>(`/api/employees/${id}`, {
      method: "DELETE"
    }),

  getShifts: (date: string) =>
    request<Shift[]>(`/api/shifts?date=${encodeURIComponent(date)}`),

  createShift: (shift: ShiftInput) =>
    request<Shift>("/api/shifts", {
      method: "POST",
      body: JSON.stringify(shift)
    }),

  updateShift: (id: number, shift: ShiftInput) =>
    request<Shift>(`/api/shifts/${id}`, {
      method: "PUT",
      body: JSON.stringify(shift)
    }),

  deleteShift: (id: number) =>
    request<{ message: string }>(`/api/shifts/${id}`, {
      method: "DELETE"
    }),

  getDashboard: (date: string) =>
    request<DashboardData>(`/api/dashboard?date=${encodeURIComponent(date)}`)
};
