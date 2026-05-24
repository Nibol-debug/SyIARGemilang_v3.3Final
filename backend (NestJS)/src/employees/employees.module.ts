import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeeAttendanceController } from './employee-attendance.controller';

@Module({
  providers: [EmployeesService],
  controllers: [EmployeesController, EmployeeAttendanceController]
})
export class EmployeesModule {}
