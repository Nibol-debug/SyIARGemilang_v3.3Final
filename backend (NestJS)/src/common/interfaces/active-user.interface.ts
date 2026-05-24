export interface ActiveUser {
  sub: string;
  userId: string;
  username: string;
  role: string;
  studentId?: string;
  employeeId?: string;
}
