import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { MajorsModule } from './majors/majors.module';
import { BatchesModule } from './batches/batches.module';
import { ClassesModule } from './classes/classes.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { EmployeesModule } from './employees/employees.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AttendancesModule } from './attendances/attendances.module';
import { TeachingLogsModule } from './teaching-logs/teaching-logs.module';
import { AcademicCalendarModule } from './academic-calendar/academic-calendar.module';
import { ExamsModule } from './exams/exams.module';
import { ExamSessionsModule } from './exam-sessions/exam-sessions.module';
import { GradesModule } from './grades/grades.module';
import { StatsModule } from './stats/stats.module';
import { ApplicantsModule } from './applicants/applicants.module';
import { FinanceModule } from './finance/finance.module';
import { AssetsModule } from './assets/assets.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { BranchesModule } from './branches/branches.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GradeAnalysisModule } from './grade-analysis/grade-analysis.module';
import { RemedialModule } from './remedial/remedial.module';
import { ReportCardsModule } from './report-cards/report-cards.module';
import { StudentBehaviorModule } from './student-behavior/student-behavior.module';
import { SettingsModule } from './settings/settings.module';
import { LeavesModule } from './leaves/leaves.module';
import { PayrollsModule } from './payrolls/payrolls.module';
import { AppraisalsModule } from './appraisals/appraisals.module';
import { AssetLoansModule } from './asset-loans/asset-loans.module';
import { EmployeeHistoryModule } from './employee-history/employee-history.module';
import { ReportsModule } from './reports/reports.module';
import { LocationiqModule } from './locationiq/locationiq.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    LocationiqModule,
    AuthModule,
    UsersModule,
    StudentsModule,
    MajorsModule,
    BatchesModule,
    ClassesModule,
    RolesModule,
    PermissionsModule,
    EmployeesModule,
    SubjectsModule,
    SchedulesModule,
    AttendancesModule,
    TeachingLogsModule,
    AcademicCalendarModule,
    ExamsModule,
    ExamSessionsModule,
    GradesModule,
    StatsModule,
    ApplicantsModule,
    FinanceModule,
    AssetsModule,
    AuditLogsModule,
    BranchesModule,
    NotificationsModule,
    GradeAnalysisModule,
    RemedialModule,
    ReportCardsModule,
    StudentBehaviorModule,
    SettingsModule,
    LeavesModule,
    PayrollsModule,
    AppraisalsModule,
    AssetLoansModule,
    EmployeeHistoryModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
