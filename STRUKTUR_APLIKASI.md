# Struktur Aplikasi Syiar Gemilang ERP

> **Backend:** NestJS + Prisma + MySQL (`/home/syiargemilang.web.id/api/`)
> **Frontend:** Next.js 16 + React 19 + Tailwind (`/home/syiargemilang.web.id/public_html/`)
> **Deploy:** PM2 (backend port 3001, frontend port 3002 via PM2)

---

## 1. Arsitektur Backend (`api/`)

### 1.1 Entry Point
`src/main.ts` — bootstrap NestJS, global prefix `/api/v1`, CORS, static files `/uploads/`, global ValidationPipe.

### 1.2 Root Module
`src/app.module.ts` — imports 35+ feature modules + global providers:
- `ThrottlerModule` (10 req/60s global)
- `PrismaExceptionFilter` (APP_FILTER)
- `AuditInterceptor` (APP_INTERCEPTOR)

### 1.3 Common Layer (`src/common/`)

| File | Fungsi |
|------|--------|
| `decorators/permissions.decorator.ts` | `@Permissions('manage_students')` |
| `decorators/public.decorator.ts` | `@Public()` — bypass JWT guard |
| `decorators/roles.decorator.ts` | `@Roles('Admin')` |
| `dto/pagination.dto.ts` | `page`, `limit` |
| `dto/searchable-pagination.dto.ts` | extends pagination + `search` |
| `filters/prisma-exception.filter.ts` | Catch Prisma errors → friendly JSON |
| `interceptors/audit.interceptor.ts` | Log semua request ke `audit_logs` |
| `interfaces/active-user.interface.ts` | Type untuk `req.user` |

### 1.4 Auth System (`src/auth/`)

| File | Fungsi |
|------|--------|
| `jwt-auth.guard.ts` | Passport JWT guard, hormati `@Public()` |
| `jwt.strategy.ts` | Ekstrak token → `{ userId, username, role, permissions }` |
| `permissions.guard.ts` | Cek `@Permissions()` metadata |
| `roles.guard.ts` | Cek `@Roles()` metadata |
| `get-user.decorator.ts` | `@GetUser()` param decorator |

### 1.5 Daftar Modul & CRUD

Setiap modul mengikuti pola **Controller → Service → Prisma** + **DTO validation**.

| Modul | Prefix Route | Endpoints (Method + Path) | Service Method Utama |
|-------|-------------|---------------------------|---------------------|
| **Auth** | `auth` | `POST login`, `POST logout`, `GET me`, `POST devices` | `validateUser()`, `login()` |
| **Users** | `users` | `GET/PATCH /me`, `POST /me/change-password`, `GET/DELETE /me/devices`, `GET/POST /`, `GET/PATCH/DELETE /:id`, `GET /:id/devices`, `PATCH /:id/devices/:deviceId` | `getProfile()`, `updateProfile()`, `changePassword()`, `findAll()`, `create()`, `update()`, `remove()` |
| **Students** | `students` | `POST /`, `GET /`, `GET /export`, `POST /import`, `POST /bulk-promote`, `POST /upload-photo`, `GET/PATCH/DELETE /:id` | `create()`, `finalizeRegistration()`, `findAll()`, `findOne()`, `update()`, `remove()`, `exportToExcel()`, `importFromExcel()`, `bulkPromote()` |
| **Employees** | `employees`, `employee-attendance` | `POST/GET /`, `GET/PATCH/DELETE /:id`, `POST /:id/documents`, `GET /employee-attendance/daily`, `GET /employee-attendance/monthly`, `POST /employee-attendance/self`, `POST /employee-attendance/bulk` | `create()`, `findAll()`, `findOne()`, `update()`, `remove()` (cascade), `getAttendanceByDate()`, `recordSelfAttendance()`, `recordBulkAttendance()` |
| **Majors** | `majors` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard CRUD |
| **Branches** | `branches` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard CRUD |
| **Batches** | `batches` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard + auto-alumni on deactivate |
| **Classes** | `classes` | `POST/GET /`, `GET /:id/students`, `GET/PATCH/DELETE /:id` | Standard + `findStudents()` |
| **Subjects** | `subjects` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard CRUD |
| **Schedules** | `schedules` | `POST/GET /`, `GET/PATCH/DELETE /:id` | `checkClash()`, Standard |
| **Attendances** | `attendance` | `POST /`, `GET /class/:id`, `GET /summary`, `GET /schedule/:id`, `PATCH/DELETE /:id` | `bulkCreate()`, `findByClass()`, `getSummary()`, `findBySchedule()` |
| **Teaching Logs** | `teaching-log` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard CRUD |
| **Academic Calendar** | `academic-calendar` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard CRUD |
| **Exams** | `exams` | `GET /stats`, `GET /violations`, `POST/GET /`, `GET /:id`, `GET /:id/monitoring`, `GET /:id/questions`, `PATCH/DELETE /:id`, `POST /:id/questions`, `PATCH /questions/:questionId`, `DELETE /questions/:questionId`, `GET /sessions/:sessionId/questions`, `GET /sessions/:sessionId/answers-detail`, `PATCH /answers/:id/score` | `create()`, `findAll()`, `findOne()`, `update()`, `remove()`, `getStats()`, `getMonitoring()`, `addQuestion()`, `updateQuestion()`, `gradeEssay()` |
| **Question Banks** | `question-banks` | `POST/GET /`, `GET/PATCH/DELETE /:id`, `POST /import-to-exam/:examId` | Standard + `importToExam()` |
| **Exam Sessions** | `exam-sessions` | `POST /:id/start`, `POST /:id/start-applicant`, `GET /sessions/:sessionId`, `POST /sessions/:sessionId/answers`, `POST /sessions/:sessionId/log`, `POST /sessions/:sessionId/submit`, `POST /sessions/:sessionId/force-submit` | `startExam()`, `submitAnswer()`, `logViolation()`, `finalizeExam()`, `forceSubmit()` |
| **Grades** | `grades` | `GET /stats/grading`, `GET /components`, `PUT /components`, `POST /`, `GET /student/:id`, `POST /finalize`, `POST /finalize-class`, `GET /final/:student_id`, `GET /class/:class_id`, `GET /parent/:student_id` | `create()`, `finalizeGrade()`, `finalizeClassGrades()`, `getFinalReport()`, `getParentPortalData()`, `getGradingStats()` |
| **Grade Analysis** | `grade-analysis` | `GET /exam/:examId/statistics`, `GET /exam/:examId/review`, `GET /class/:classId/subject/:subjectId` | `getExamStatistics()`, `getQuestionsForReview()`, `getClassSubjectAnalysis()` |
| **Remedial** | `remedial` | `GET /needs`, `GET /stats`, `POST/GET /?semester=`, `GET /:id`, `PUT /:id/schedule`, `PUT /:id/score`, `DELETE /:id` | `getStudentsNeedingRemedial()`, `create()` (dengan batch_id & semester), `schedule()`, `updateScore()`, `getStats()` |
| **Report Cards** | `report-cards` | `GET /student/:studentId/semester/:semester`, `GET /student/:studentId/semester/:semester/pdf`, `GET /class/:classId/semester/:semester` | `generateReportCard()`, `getReportCardData()` |
| **Student Behavior** | `student-behavior` | `POST/GET /`, `GET /summary`, `GET /student/:studentId`, `GET /:id`, `PATCH/DELETE /:id` | `create()`, `findAll()`, `getSummary()`, `findByStudent()` |
| **Applicants** | `applicants` | `POST /` (Public), `POST /upload-document` (Public), `GET /`, `GET /:id`, `PATCH /:id`, `PATCH /:id/verify`, `POST /:id/accept`, `DELETE /:id` | `create()`, `verify()`, `acceptApplicant()` (create Student + Payment) |
| **Finance** | `finance` | **Fees:** `POST/GET /fees`, `GET/PATCH/DELETE /fees/:id`<br>**Payments:** `POST/GET /payments`, `GET/PATCH/DELETE /payments/:id`<br>`POST /remind` | Fee CRUD, Payment CRUD, `sendPaymentReminders()` |
| **Assets** | `assets` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard CRUD + QR code |
| **Asset Loans** | `asset-loans` | `POST/GET /`, `GET /my-loans`, `GET /:id`, `PATCH /:id/return`, `GET /check/:employeeId`, `PATCH/DELETE /:id` | `create()`, `returnAsset()`, `checkActiveLoans()` |
| **Leave Requests** | `leaves` | `POST/GET /`, `POST /:id/proof`, `GET /:id`, `PATCH /:id/approve`, `PATCH /:id/reject` | Standard + upload proof + approve/reject |
| **Payrolls** | `payrolls` | `POST/GET /`, `POST /generate`, `GET /:id`, `PATCH /:id/pay`, `PATCH/DELETE /:id` | Standard + `generate()` + `pay()` |
| **Appraisals** | `appraisals` | `POST/GET /`, `GET /me`, `GET /:id`, `PATCH/DELETE /:id`, `GET /discipline-score/:employeeId` | Standard + discipline score |
| **Employee History** | `employee-history` | `POST/GET /`, `GET/PATCH/DELETE /:id` | Standard CRUD |
| **Notifications** | `notifications` | `POST/GET /`, `POST /broadcast`, `POST /read-all`, `PATCH /:id/read`, `GET /unread-count` | `create()`, `broadcast()`, `markRead()`, `getUnreadCount()` |
| **Settings** | `settings` | `GET /preferences`, `PATCH /preferences/notifications`, `PATCH /preferences/system`, `POST /preferences/maintenance-mode` | `getPreferences()`, `updateNotificationPreferences()`, `updateSystemSettings()`, `toggleMaintenanceMode()` |
| **Audit Logs** | `audit-logs` | `GET /` | Paginated, role-scoped |
| **Roles** | `roles` | `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`, `GET /:id/permissions` | Standard CRUD + list permissions |
| **Permissions** | `permissions` | `GET /` | List all permissions (read-only) |
| **Stats** | `stats` | `GET /dashboard` | Dashboard summary counts |
| **Reports** | `reports` | `GET /summary`, `GET /attendance`, `GET /finance`, `GET /academic` | Aggregated reports |
| **LocationIQ** | `locationiq` | `GET /reverse`, `GET /search` | Proxy ke LocationIQ API |

---

## 2. Prisma Database (`prisma/schema.prisma`)

### 2.1 Model Relasi (45 tabel)

```
Role ──┬── User ──┬── UserDevice
       │          ├── Notification
       │          ├── UserPreferences
       │          ├── AuditLog
       │          └── LeaveRequest (approver)
       │
       ├── RolePermission ── Permission
       │
       ├── Branch ───┬── Major ───┬── Subject
       │             │            ├── Class
       │             │            ├── Student
       │             │            ├── Employee
       │             │            ├── Schedule
       │             │            ├── TeachingLog
       │             │            ├── Exam
       │             │            ├── QuestionBank
       │             │            └── Applicant
       │             │
        │             └── Batch ───┬── Class
        │                          ├── Student
        │                          ├── Grade
        │                          ├── FinalGrade
        │                          ├── Remedial
        │                          ├── Schedule
        │                          └── TeachingLog
        │
        ├── Student ──┬── Parent
        │             ├── StudentHistory
        │             ├── Attendance
        │             ├── ExamSession
        │             ├── Grade
        │             ├── FinalGrade
        │             ├── Payment
        │             ├── Remedial ──┬── Batch
        │             └── StudentBehaviorAssessment
       │
       ├── Employee ──┬── EmployeeDocument
       │              ├── EmployeeAttendance
       │              ├── LeaveRequest
       │              ├── Payroll
       │              ├── EmployeeAppraisal (appraisee)
       │              ├── EmployeeAppraisal (evaluator)
       │              ├── AssetLoan
       │              ├── EmployeeHistory
       │              ├── Schedule (teacher)
       │              ├── TeachingLog (teacher)
       │              └── StudentBehaviorAssessment (assessor)
       │
       ├── Exam ──┬── Question ──┬── QuestionOption
       │          │              └── StudentAnswer
       │          └── ExamSession ──┬── StudentAnswer
       │                            └── ExamLog
       │
       ├── Grade ──┬── GradeComponent
       │           └── FinalGrade
       │
       ├── QuestionBank ──┬── QuestionBankOption
       │
       ├── Asset ──┬── AssetLoan
       │
       ├── Fee ──┬── Payment
       │
       ├── Applicant ──┬── ExamSession
       │               └── Grade
       │
       └── Schedule ──┬── Attendance
```

### 2.2 Enum/String Constraint Fields

| Field | Values |
|-------|--------|
| `Student.status` | `active`, `alumni`, `moved` |
| `Attendance.status` | `hadir`, `sakit`, `izin`, `alfa` |
| `ExamSession.status` | `ongoing`, `submitted`, `blocked` |
| `EmployeeAttendance.status` | `hadir`, `sakit`, `izin`, `alfa`, `cuti` |
| `LeaveRequest.type` | `sick`, `annual_leave`, `emergency`, `maternity` |
| `LeaveRequest.status` | `pending`, `approved`, `rejected` |
| `Payroll.status` | `pending`, `paid` |
| `Asset.condition` | `good`, `fair`, `broken` |
| `Asset.status` | `available`, `loaned`, `maintenance` |
| `AssetLoan.status` | `borrowed`, `returned`, `overdue` |
| `Payment.method` | `cash`, `transfer`, `gateway` |
| `Payment.status` | `pending`, `success`, `failed` |
| `Grade.type` | `assignment`, `uts`, `uas`, `cbt` |
| `Question.type` | `mcq`, `essay` |
| `Applicant.status` | `pending`, `verified`, `accepted`, `rejected` |
| `EmployeeHistory.type` | `promotion`, `education`, `mutation`, `achievement` |
| `ExamLog.type` | `tab_switch`, `window_blur`, `exit_fullscreen`, `warning`, `violation` |
| `Fee.type` | `monthly`, `once`, `other` |
| `Remedial.status` | `pending`, `scheduled`, `completed` |
| `Remedial.semester` | `1` (Ganjil), `2` (Genap) |
| `Notification.type` | `payment`, `exam`, `announcement`, `attendance`, `ppdb` |

---

## 3. Arsitektur Frontend (`public_html/`)

### 3.1 Pages (`app/`)

**Public Pages:**
- `/` — Landing page
- `/login` — Login form
- `/ppdb` — PPDB registration form (public)
- `/about` — Tentang aplikasi
- `/support` — Halaman dukungan / bantuan
- `/[slug]` — Dynamic page (catch-all)

**Dashboard Pages (`app/(dashboard)/`):**
- `/dashboard` — Dashboard utama (statistik ringkasan)
- `/students` — Manajemen siswa (CRUD, import/export Excel, upload foto, bulk promote)
- `/hrm` — Manajemen pegawai, presensi, cuti, payroll, PKG
- `/hrm/attendance` — Presensi pegawai
- `/hrm/attendance/monthly` — Rekap presensi bulanan
- `/hrm/my-leaves` — Cuti & izin saya
- `/hrm/leaves-approval` — Approval cuti
- `/hrm/my-payroll` — Slip gaji saya
- `/hrm/payrolls` — Manajemen payroll
- `/hrm/my-appraisal` — PKG saya
- `/hrm/appraisals` — Evaluasi kinerja
- `/hrm/history` — Riwayat pegawai
- `/academic` — Dashboard akademik (subjects, schedule, attendance, rombel, jurnal, kalender)
- `/academic/behavior` — Penilaian perilaku siswa
- `/cbt` — Kelola ujian (CRUD exam, monitoring, violations)
- `/cbt/question-banks` — Bank soal
- `/cbt/take/[id]` — Halaman ujian (siswa mengambil ujian)
- `/grading` — Input nilai
- `/grading/analysis` — Analisis nilai (statistik, butir soal)
- `/grading/remedial` — Manajemen remedial
- `/grading/report-cards` — E-Rapor (preview + download PDF)
- `/grading/settings` — Pengaturan komponen nilai
- `/ppdb-admin` — PPDB admin (daftar pendaftar, verifikasi, acceptance)
- `/finance` — Keuangan (tagihan, pembayaran)
- `/assets` — Inventaris (daftar aset)
- `/assets/loans` — Peminjaman aset
- `/batches` — Manajemen angkatan
- `/majors` — Manajemen jurusan
- `/classes` — Manajemen kelas
- `/users` — Manajemen user
- `/users/roles` — Manajemen role & permissions
- `/users/logs` — Audit logs
- `/notifications` — Notifikasi
- `/reports` — Laporan (ringkasan, presensi, keuangan, akademik)
- `/profil` — Profil saya (informasi, ganti password, perangkat)
- `/settings` — Pengaturan (notifikasi, sistem akademik, CBT, maintenance)

### 3.2 Components (`components/`)

| Component | Fungsi |
|-----------|--------|
| `Sidebar.tsx` | Navigasi sidebar kiri (dengan submenu accordion) |
| `Navbar.tsx` | Top navbar dengan breadcrumb + ProfileDropdown |
| `ProfileDropdown.tsx` | Dropdown profil (pengaturan, profil, logout) |
| `MapPicker.tsx` | Picker peta untuk alamat (Leaflet + LocationIQ proxy) |
| `MapComponent.tsx` | Leaflet map wrapper (dynamic import, SSR: false) |
| `PPDBModals.tsx` | Modal untuk PPDB form |
| `AnimatedCounter.tsx` | Animasi angka counter (reset on prop change via ref) |
| `EmployeeModals.tsx` | Modal CRUD + delete with inline error handling |
| (komponen grading) | `GradingHeader`, `GradingFilters`, `GradingTable`, `FinalGradePanel`, `GradeChart`, `ReportCardPDF` |
| (komponen akademik) | `AcademicTabs`, `ScheduleView`, `ScheduleFormModal`, `RombelView`, `TeachingLogModal` |

### 3.3 Lib (`lib/`)

| File | Fungsi |
|------|--------|
| `api.ts` | `BASE_URL`, `getToken()`, `apiRequest()` — base API client dengan auto-redirect 401 |
| `utils.ts` | `cn()` (tailwind merge), `getUserFromToken()` (decode JWT), `formatDate()` |
| `useUserRole.ts` | Hook: `user`, `role`, `permissions`, `isAdmin`, `isTeacher`, `isStudent`, `canManageStudents`, dll |
| `settings.ts` | `getProfile()`, `updateProfile()`, `changePassword()`, `getDevices()`, `removeDevice()`, `getPreferences()`, `updateNotificationPreferences()`, `updateSystemSettings()`, `toggleMaintenanceMode()` |
| `notifications.ts` | `getNotifications()`, `getUnreadCount()`, `markAsRead()`, `markAllAsRead()` |

---

## 4. Pattern Umum

### 4.1 Alur Auth
```
Login → POST /auth/login → JWT token → localStorage('token') → 
  apiRequest() attaches Authorization header → 
  JwtAuthGuard verifies → req.user = { userId, username, role, permissions }
```

### 4.2 Alur Permission
```
@Permissions('manage_students') → decorator set metadata →
  PermissionsGuard membaca req.user.permissions →
  jika tidak memiliki permission → 403 Forbidden
```

### 4.3 File Upload
```
Multer diskStorage → destination: join(__dirname, '../../uploads/<module>') →
  filename: uuid + extension →
  URL: /uploads/<module>/<filename> →
  ServeStaticModule menyajikan dari ../uploads/
```

### 4.4 Exception Flow
```
Error → Controller catch → throw NotFoundException/BadRequestException →
  (jika Prisma error) → PrismaExceptionFilter →
  (jika lainnya) → NestJS default exception handler
```

### 4.5 Audit Trail
```
AuditInterceptor mencatat setiap request ke audit_logs →
  Data: user_id, action, module, timestamp →
  Fields sensitif (password, token, secret) di-redact
```

### 4.6 Frontend API Call
```
component → lib/settings.ts → lib/api.ts → fetch(BASE_URL + endpoint) →
  backend controller → service → prisma →
  response JSON → component render
```

---

## 5. Direktori Kunci

### Backend (`/home/syiargemilang.web.id/api/`)
```
src/                          → Source code (35+ modules)
src/main.ts                   → Entry point
src/app.module.ts             → Root module
src/common/                   → Shared (decorators, filters, interceptors, interfaces)
src/auth/                     → Auth, guards, strategies
uploads/                      → File uploads (profiles, applicants, employees, leaves)
prisma/schema.prisma          → Database schema (45 models)
prisma/seed.ts                → Database seeder (roles, admin, permissions, master data)
.env                          → Environment variables
dist/                         → Compiled JS output
```

### Frontend (`/home/syiargemilang.web.id/public_html/`)
```
app/                          → Next.js pages (App Router)
app/(dashboard)/              → Dashboard pages (protected)
components/                   → Shared React components
lib/                          → Utilities, API client, hooks
public/                       → Static assets
.next/                        → Next.js build output
.env.local                    → Frontend env vars
package.json                  → Dependencies
```

---

## 6. Catatan Penting

- **Upload files** disimpan di `backend/uploads/` dan disajikan via `/uploads/` URL path
- **Database migration** menggunakan `prisma db push` (migration file tidak sinkron dengan schema)
- **Backend rebuild + restart:** `cd /home/syiargemilang.web.id/api && npm run build && pm2 restart api`
- **Frontend rebuild + restart:** `cd /home/syiargemilang.web.id/public_html && npm run build && pm2 restart frontend-syiar`
- **Prisma DB sync** setelah perubahan schema: `cd /home/syiargemilang.web.id/api && npx prisma db push`
- **Seed data**: `cd /home/syiargemilang.web.id/api && npm run seed` (roles, admin, permissions, branches, majors, batches, classes)
- **Database**: MySQL `syiar_gemilang` — user `syiar_user`
- **Rate limit**: 10 request per 60 detik global; 5 percobaan login per 60 detik
- **LocationIQ API key** disimpan di backend `.env` (tidak bocor ke frontend)
