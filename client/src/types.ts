export type Employee = {
  id: number;
  name: string;
  role: string;
  hourlyRate: number;
  availability: string;
  active: boolean;
  createdAt: string;
};

export type Shift = {
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

export type DashboardData = {
  date: string;
  activeEmployees: number;
  scheduledShifts: number;
  scheduledStaff: number;
  totalHours: number;
  estimatedLabourCost: number;
  areaBreakdown: Record<string, number>;
};

export type EmployeeInput = {
  name: string;
  role: string;
  hourlyRate: number;
  availability: string;
};

export type ShiftInput = {
  employeeId: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  area: string;
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
};
