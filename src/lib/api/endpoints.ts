/**
 * API endpoint definitions
 * Centralized endpoint management for consistency
 */

export const API_ENDPOINTS = {
  // Auth endpoints (from Auth service) - always use /auth prefix
  auth: {
    csrfToken: "/auth/csrf-cookie",
    csrfCookie: "/auth/csrf-cookie",
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    refresh: "/auth/refresh",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: (id: string) => `/auth/verify-email/${id}`,
    // The following endpoints are still served by the backend but are auth-related
    resendVerificationEmail: "/api/resend-verification-email",
    changePassword: "/api/change-password",
    me: "/api/user",
  },

  // Employee endpoints
  employees: {
    list: "/api/employees",
    detail: (id: string) => `/api/employees/${id}`,
    create: "/api/employees",
    update: (id: string) => `/api/employees/${id}`,
    delete: (id: string) => `/api/employees/${id}`,
    registerFace: (id: string) => `/api/employees/${id}/register-face`,
    assignedLeaveTypes: (id: string) => `/api/employees/${id}/assigned-leave-types`,
    addLeaveType: (employeeId: string, leaveTypeId: string) => `/api/employees/${employeeId}/leave-types/${leaveTypeId}`,
    removeLeaveType: (employeeId: string, leaveTypeId: string) => `/api/employees/${employeeId}/leave-types/${leaveTypeId}`,
  },

  // Department endpoints
  departments: {
    list: "/api/departments",
    detail: (id: string) => `/api/departments/${id}`,
  },

  // Position endpoints
  positions: {
    list: "/api/positions",
    detail: (id: string) => `/api/positions/${id}`,
  },

  // Employment Type endpoints
  employmentTypes: {
    list: "/api/employment-types",
    detail: (id: string) => `/api/employment-types/${id}`,
  },

  // Attendance endpoints
  attendances: {
    list: "/api/attendances",
    detail: (id: string) => `/api/attendances/${id}`,
    create: "/api/attendances",
    update: (id: string) => `/api/attendances/${id}`,
    delete: (id: string) => `/api/attendances/${id}`,
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/attendances`,
  },

  // Timesheet endpoints
  timesheets: {
    list: "/api/attendances", // Using attendances endpoint for timesheet data
    weekly: (employeeId?: string) =>
      employeeId
        ? `/api/employees/${employeeId}/attendances`
        : "/api/attendances",
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/attendances`,
  },

  // Overtime endpoints
  overtime: {
    list: "/api/attendances", // Using attendances endpoint, filtering for overtime
    detail: (id: string) => `/api/attendances/${id}`,
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/attendances`,
  },

  // Reimbursement endpoints
  reimbursements: {
    list: "/api/reimbursements",
    detail: (id: string) => `/api/reimbursements/${id}`,
    create: "/api/reimbursements",
    update: (id: string) => `/api/reimbursements/${id}`,
    delete: (id: string) => `/api/reimbursements/${id}`,
    submit: (id: string) => `/api/reimbursements/${id}/submit`,
    approve: (id: string) => `/api/reimbursements/${id}/approve`,
    reject: (id: string) => `/api/reimbursements/${id}/reject`,
    markAsPaid: (id: string) => `/api/reimbursements/${id}/mark-paid`,
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/reimbursements`,
  },

  // Leave Management endpoints
  leaveTypes: {
    list: "/api/leave-types",
    detail: (id: string) => `/api/leave-types/${id}`,
    create: "/api/leave-types",
    update: (id: string) => `/api/leave-types/${id}`,
    delete: (id: string) => `/api/leave-types/${id}`,
  },
  leaveRequests: {
    list: "/api/leave-requests",
    detail: (id: string) => `/api/leave-requests/${id}`,
    create: "/api/leave-requests",
    update: (id: string) => `/api/leave-requests/${id}`,
    delete: (id: string) => `/api/leave-requests/${id}`,
    approve: (id: string) => `/api/leave-requests/${id}/approve`,
    reject: (id: string) => `/api/leave-requests/${id}/reject`,
    cancel: (id: string) => `/api/leave-requests/${id}/cancel`,
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/leave-requests`,
    balances: (employeeId: string) =>
      `/api/employees/${employeeId}/leave-balances`,
  },
  overtimeRequests: {
    list: "/api/overtime-requests",
    detail: (id: string) => `/api/overtime-requests/${id}`,
    create: "/api/overtime-requests",
    update: (id: string) => `/api/overtime-requests/${id}`,
    delete: (id: string) => `/api/overtime-requests/${id}`,
    approve: (id: string) => `/api/overtime-requests/${id}/approve`,
    reject: (id: string) => `/api/overtime-requests/${id}/reject`,
    cancel: (id: string) => `/api/overtime-requests/${id}/cancel`,
    adjustHours: (id: string) => `/api/overtime-requests/${id}/adjust-hours`,
    generateFromAttendance: "/api/overtime-requests/generate-from-attendance",
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/overtime-requests`,
  },

  // Payroll Management endpoints
  payrollPeriods: {
    list: "/api/payroll-periods",
    detail: (id: string) => `/api/payroll-periods/${id}`,
    create: "/api/payroll-periods",
    update: (id: string) => `/api/payroll-periods/${id}`,
    delete: (id: string) => `/api/payroll-periods/${id}`,
  },
  payrollRuns: {
    list: "/api/payroll-runs",
    detail: (id: string) => `/api/payroll-runs/${id}`,
    create: "/api/payroll-runs",
    update: (id: string) => `/api/payroll-runs/${id}`,
    delete: (id: string) => `/api/payroll-runs/${id}`,
    process: (id: string) => `/api/payroll-runs/${id}/process`,
    approve: (id: string) => `/api/payroll-runs/${id}/approve`,
    entries: (id: string) => `/api/payroll-runs/${id}/entries`,
    export: (id: string) => `/api/payroll-runs/${id}/export`,
  },
  payrollEntries: {
    list: "/api/payroll-entries",
    detail: (id: string) => `/api/payroll-entries/${id}`,
    update: (id: string) => `/api/payroll-entries/${id}`,
    pdf: (id: string) => `/api/payroll-entries/${id}/payslip`,
  },
  payrollStatistics: {
    monthly: "/api/payroll-statistics/monthly",
    summary: "/api/payroll-statistics/summary",
  },
  salaryComponents: {
    list: "/api/salary-components",
    detail: (id: string) => `/api/salary-components/${id}`,
    create: "/api/salary-components",
    update: (id: string) => `/api/salary-components/${id}`,
    delete: (id: string) => `/api/salary-components/${id}`,
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/salary-components`,
  },
  deductions: {
    list: "/api/deductions",
    detail: (id: string) => `/api/deductions/${id}`,
    create: "/api/deductions",
    update: (id: string) => `/api/deductions/${id}`,
    delete: (id: string) => `/api/deductions/${id}`,
    byEmployee: (employeeId: string) =>
      `/api/employees/${employeeId}/deductions`,
  },
  holidays: {
    list: "/api/holidays",
    detail: (id: string) => `/api/holidays/${id}`,
    create: "/api/holidays",
    update: (id: string) => `/api/holidays/${id}`,
    delete: (id: string) => `/api/holidays/${id}`,
    import: "/api/holidays/import",
  },
  settings: {
    list: "/api/settings",
    update: "/api/settings",
    uploadLogo: "/api/settings/upload-logo",
    birTaxTable: "/api/settings/bir-tax-table",
    holidayRates: "/api/settings/holiday-rates",
    computationLegends: "/api/settings/computation-legends",
  },
  dashboard: {
    stats: "/api/dashboard/stats",
  },
  profile: {
    get: "/api/profile",
    update: "/api/profile",
    changePassword: "/api/profile/change-password",
  },

  // User management endpoints (proxy API routes with permission checks)
  users: {
    list: "/api/users",
    withEmployeeStatus: "/api/users/with-employee-status",
    detail: (id: string) => `/api/users/${id}`,
    create: "/api/users",
    update: (id: string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
    assignRoles: (id: string) => `/api/users/${id}/roles`,
    updateRole: (userId: string) => `/api/users/${userId}/role`, // Legacy, use assignRoles
  },
  // Roles endpoint (from proxy API - requires users.view permission)
  userRoles: {
    list: "/api/roles", // Get roles for user management
  },

  // Companies endpoints
  companies: {
    list: "/api/companies",
    detail: (id: string) => `/api/companies/${id}`,
    create: "/api/companies",
    update: (id: string) => `/api/companies/${id}`,
    delete: (id: string) => `/api/companies/${id}`,
  },

  // Employee Documents endpoints
  employeeDocuments: {
    list: "/api/employee-documents",
    detail: (id: string) => `/api/employee-documents/${id}`,
    create: "/api/employee-documents",
    update: (id: string) => `/api/employee-documents/${id}`,
    delete: (id: string) => `/api/employee-documents/${id}`,
    download: (id: string) => `/api/employee-documents/${id}/download`,
    byEmployee: (employeeId: string) => `/api/employees/${employeeId}/documents`,
  },

  employeeBankAccounts: {
    list: "/api/employee-bank-accounts",
    detail: (id: string) => `/api/employee-bank-accounts/${id}`,
    create: "/api/employee-bank-accounts",
    update: (id: string) => `/api/employee-bank-accounts/${id}`,
    delete: (id: string) => `/api/employee-bank-accounts/${id}`,
  },

  employeeWorkExperiences: {
    list: "/api/employee-work-experiences",
    detail: (id: string) => `/api/employee-work-experiences/${id}`,
    create: "/api/employee-work-experiences",
    update: (id: string) => `/api/employee-work-experiences/${id}`,
    delete: (id: string) => `/api/employee-work-experiences/${id}`,
  },

  employeeQualifications: {
    list: "/api/employee-qualifications",
    detail: (id: string) => `/api/employee-qualifications/${id}`,
    create: "/api/employee-qualifications",
    update: (id: string) => `/api/employee-qualifications/${id}`,
    delete: (id: string) => `/api/employee-qualifications/${id}`,
  },

  employeeEmergencyContacts: {
    list: "/api/employee-emergency-contacts",
    detail: (id: string) => `/api/employee-emergency-contacts/${id}`,
    create: "/api/employee-emergency-contacts",
    update: (id: string) => `/api/employee-emergency-contacts/${id}`,
    delete: (id: string) => `/api/employee-emergency-contacts/${id}`,
  },

  // Time Clock endpoints
  timeClock: {
    timeIn: "/api/time-clock/time-in",
    timeOut: (employeeId: string) => `/api/time-clock/time-out/${employeeId}`,
    today: (employeeId: string) => `/api/time-clock/today/${employeeId}`,
  },

  // Biometric endpoints
  biometric: {
    verifyFace: "/api/biometric/verify-face",
    registerFace: (employeeId: string) => `/api/employees/${employeeId}/register-face`,
  },

  // Reports endpoints
  reports: {
    payroll: "/api/reports/payroll",
    attendance: "/api/reports/attendance",
    leave: "/api/reports/leave",
    employee: "/api/reports/employee",
    training: "/api/reports/training",
    pension: "/api/reports/pension",
    transaction: "/api/reports/transaction",
    headcount: "/api/reports/headcount",
    attrition: "/api/reports/attrition",
    payrollCost: "/api/reports/payroll-cost",
    statutory: "/api/reports/statutory",
    project: "/api/reports/project",
    account: "/api/reports/account",
    dailyAttendances: "/api/reports/daily-attendances",
    dateWiseAttendances: "/api/reports/date-wise-attendances",
    monthlyAttendances: "/api/reports/monthly-attendances",
    task: "/api/reports/task",
    expense: "/api/reports/expense",
    deposit: "/api/reports/deposit",
  },

  // Notifications endpoints
  notifications: {
    list: "/api/notifications",
    markAsRead: (id: string) => `/api/notifications/${id}/read`,
    markAllAsRead: "/api/notifications/read-all",
    delete: (id: string) => `/api/notifications/${id}`,
  },

  // Roles & Permissions endpoints
  roles: {
    list: "/api/roles",
    detail: (id: string) => `/api/roles/${id}`,
    create: "/api/roles",
    update: (id: string) => `/api/roles/${id}`,
    delete: (id: string) => `/api/roles/${id}`,
  },
  // Permissions endpoint removed - permissions are now included in roles response


  // Leave Balances endpoint
  leaveBalances: {
    list: "/api/leave-balances",
  },

  // Core HR endpoints
  promotions: {
    list: "/api/promotions",
    detail: (id: string) => `/api/promotions/${id}`,
    create: "/api/promotions",
    update: (id: string) => `/api/promotions/${id}`,
    delete: (id: string) => `/api/promotions/${id}`,
  },
  awards: {
    list: "/api/awards",
    detail: (id: string) => `/api/awards/${id}`,
    create: "/api/awards",
    update: (id: string) => `/api/awards/${id}`,
    delete: (id: string) => `/api/awards/${id}`,
  },
  travels: {
    list: "/api/travels",
    detail: (id: string) => `/api/travels/${id}`,
    create: "/api/travels",
    update: (id: string) => `/api/travels/${id}`,
    delete: (id: string) => `/api/travels/${id}`,
  },
  transfers: {
    list: "/api/transfers",
    detail: (id: string) => `/api/transfers/${id}`,
    create: "/api/transfers",
    update: (id: string) => `/api/transfers/${id}`,
    delete: (id: string) => `/api/transfers/${id}`,
  },
  resignations: {
    list: "/api/resignations",
    detail: (id: string) => `/api/resignations/${id}`,
    create: "/api/resignations",
    update: (id: string) => `/api/resignations/${id}`,
    delete: (id: string) => `/api/resignations/${id}`,
  },
  complaints: {
    list: "/api/complaints",
    detail: (id: string) => `/api/complaints/${id}`,
    create: "/api/complaints",
    update: (id: string) => `/api/complaints/${id}`,
    delete: (id: string) => `/api/complaints/${id}`,
  },
  warnings: {
    list: "/api/warnings",
    detail: (id: string) => `/api/warnings/${id}`,
    create: "/api/warnings",
    update: (id: string) => `/api/warnings/${id}`,
    delete: (id: string) => `/api/warnings/${id}`,
  },
  terminations: {
    list: "/api/terminations",
    detail: (id: string) => `/api/terminations/${id}`,
    create: "/api/terminations",
    update: (id: string) => `/api/terminations/${id}`,
    delete: (id: string) => `/api/terminations/${id}`,
  },
  commissions: {
    list: "/api/commissions",
    detail: (id: string) => `/api/commissions/${id}`,
    create: "/api/commissions",
    update: (id: string) => `/api/commissions/${id}`,
    delete: (id: string) => `/api/commissions/${id}`,
  },

  // Training endpoints
  trainings: {
    list: "/api/trainings",
    detail: (id: string) => `/api/trainings/${id}`,
    create: "/api/trainings",
    update: (id: string) => `/api/trainings/${id}`,
    delete: (id: string) => `/api/trainings/${id}`,
  },
  trainingTypes: {
    list: "/api/training-types",
    detail: (id: string) => `/api/training-types/${id}`,
    create: "/api/training-types",
    update: (id: string) => `/api/training-types/${id}`,
    delete: (id: string) => `/api/training-types/${id}`,
  },
  trainers: {
    list: "/api/trainers",
    detail: (id: string) => `/api/trainers/${id}`,
    create: "/api/trainers",
    update: (id: string) => `/api/trainers/${id}`,
    delete: (id: string) => `/api/trainers/${id}`,
  },

  // Events & Meetings endpoints
  events: {
    list: "/api/events",
    detail: (id: string) => `/api/events/${id}`,
    create: "/api/events",
    update: (id: string) => `/api/events/${id}`,
    delete: (id: string) => `/api/events/${id}`,
  },
  meetings: {
    list: "/api/meetings",
    detail: (id: string) => `/api/meetings/${id}`,
    create: "/api/meetings",
    update: (id: string) => `/api/meetings/${id}`,
    delete: (id: string) => `/api/meetings/${id}`,
  },

  // Health check endpoint
  health: {
    check: "/api/health",
  },

  // HR Policies
  hrPolicies: {
    list: "/api/hr-policies",
    detail: (id: string) => `/api/hr-policies/${id}`,
    create: "/api/hr-policies",
    update: (id: string) => `/api/hr-policies/${id}`,
    delete: (id: string) => `/api/hr-policies/${id}`,
    approve: (id: string) => `/api/hr-policies/${id}/approve`,
    createVersion: (id: string) => `/api/hr-policies/${id}/create-version`,
    scheduleReview: (id: string) => `/api/hr-policies/${id}/schedule-review`,
  },

  // Status Transition Rules
  statusTransitionRules: {
    list: "/api/status-transition-rules",
    detail: (id: string) => `/api/status-transition-rules/${id}`,
    create: "/api/status-transition-rules",
    update: (id: string) => `/api/status-transition-rules/${id}`,
    delete: (id: string) => `/api/status-transition-rules/${id}`,
    validate: "/api/status-transition-rules/validate",
  },

  // Hiring Freezes
  hiringFreezes: {
    list: "/api/hiring-freezes",
    detail: (id: string) => `/api/hiring-freezes/${id}`,
    create: "/api/hiring-freezes",
    update: (id: string) => `/api/hiring-freezes/${id}`,
    delete: (id: string) => `/api/hiring-freezes/${id}`,
    checkStatus: "/api/hiring-freezes/check/status",
  },

  // Job Offers
  jobOffers: {
    list: "/api/job-offers",
    detail: (id: string) => `/api/job-offers/${id}`,
    create: "/api/job-offers",
    update: (id: string) => `/api/job-offers/${id}`,
    delete: (id: string) => `/api/job-offers/${id}`,
    approve: (id: string) => `/api/job-offers/${id}/approve`,
    send: (id: string) => `/api/job-offers/${id}/send`,
    revoke: (id: string) => `/api/job-offers/${id}/revoke`,
  },

  // Pre-Employment Compliance
  preEmploymentCompliance: {
    list: "/api/pre-employment-compliance",
    detail: (id: string) => `/api/pre-employment-compliance/${id}`,
    create: "/api/pre-employment-compliance",
    update: (id: string) => `/api/pre-employment-compliance/${id}`,
    delete: (id: string) => `/api/pre-employment-compliance/${id}`,
    verify: (id: string) => `/api/pre-employment-compliance/${id}/verify`,
  },

  // Hiring Checklists
  hiringChecklists: {
    list: "/api/hiring-checklists",
    detail: (id: string) => `/api/hiring-checklists/${id}`,
    create: "/api/hiring-checklists",
    update: (id: string) => `/api/hiring-checklists/${id}`,
    delete: (id: string) => `/api/hiring-checklists/${id}`,
    complete: (id: string) => `/api/hiring-checklists/${id}/complete`,
    hrSignoff: (id: string) => `/api/hiring-checklists/${id}/hr-signoff`,
  },

  // Leave Blackout Periods
  leaveBlackoutPeriods: {
    list: "/api/leave-blackout-periods",
    detail: (id: string) => `/api/leave-blackout-periods/${id}`,
    create: "/api/leave-blackout-periods",
    update: (id: string) => `/api/leave-blackout-periods/${id}`,
    delete: (id: string) => `/api/leave-blackout-periods/${id}`,
    check: "/api/leave-blackout-periods/check",
  },

  // Attendance Correction Windows
  attendanceCorrectionWindows: {
    list: "/api/attendance-correction-windows",
    detail: (id: string) => `/api/attendance-correction-windows/${id}`,
    create: "/api/attendance-correction-windows",
    update: (id: string) => `/api/attendance-correction-windows/${id}`,
    delete: (id: string) => `/api/attendance-correction-windows/${id}`,
    check: "/api/attendance-correction-windows/check",
  },

  // Exit Clearances
  exitClearances: {
    list: "/api/exit-clearances",
    detail: (id: string) => `/api/exit-clearances/${id}`,
    create: "/api/exit-clearances",
    update: (id: string) => `/api/exit-clearances/${id}`,
    delete: (id: string) => `/api/exit-clearances/${id}`,
    completeItem: (id: string) => `/api/exit-clearances/${id}/complete-item`,
    approveFinal: (id: string) => `/api/exit-clearances/${id}/approve-final`,
  },

  // Compliance Calendar
  complianceCalendar: {
    list: "/api/compliance-calendar",
    detail: (id: string) => `/api/compliance-calendar/${id}`,
    create: "/api/compliance-calendar",
    update: (id: string) => `/api/compliance-calendar/${id}`,
    delete: (id: string) => `/api/compliance-calendar/${id}`,
    complete: (id: string) => `/api/compliance-calendar/${id}/complete`,
  },

  // Policy Violations
  policyViolations: {
    list: "/api/policy-violations",
    detail: (id: string) => `/api/policy-violations/${id}`,
    create: "/api/policy-violations",
    update: (id: string) => `/api/policy-violations/${id}`,
    delete: (id: string) => `/api/policy-violations/${id}`,
    investigate: (id: string) => `/api/policy-violations/${id}/investigate`,
    resolve: (id: string) => `/api/policy-violations/${id}/resolve`,
  },

  // HR Exceptions
  hrExceptions: {
    list: "/api/hr-exceptions",
    detail: (id: string) => `/api/hr-exceptions/${id}`,
    create: "/api/hr-exceptions",
    update: (id: string) => `/api/hr-exceptions/${id}`,
    delete: (id: string) => `/api/hr-exceptions/${id}`,
    resolve: (id: string) => `/api/hr-exceptions/${id}/resolve`,
    escalate: (id: string) => `/api/hr-exceptions/${id}/escalate`,
  },

  // Audit Readiness Reports
  auditReadinessReports: {
    list: "/api/audit-readiness-reports",
    detail: (id: string) => `/api/audit-readiness-reports/${id}`,
    create: "/api/audit-readiness-reports",
    update: (id: string) => `/api/audit-readiness-reports/${id}`,
    delete: (id: string) => `/api/audit-readiness-reports/${id}`,
    calculateScore: (id: string) => `/api/audit-readiness-reports/${id}/calculate-score`,
  },

  // Shift Schedules
  shiftSchedules: {
    list: "/api/shift-schedules",
    detail: (id: string) => `/api/shift-schedules/${id}`,
    create: "/api/shift-schedules",
    update: (id: string) => `/api/shift-schedules/${id}`,
    delete: (id: string) => `/api/shift-schedules/${id}`,
  },

  // Overtime Policies
  overtimePolicies: {
    list: "/api/overtime-policies",
    detail: (id: string) => `/api/overtime-policies/${id}`,
    create: "/api/overtime-policies",
    update: (id: string) => `/api/overtime-policies/${id}`,
    delete: (id: string) => `/api/overtime-policies/${id}`,
  },

  // Leave Encashments
  leaveEncashments: {
    list: "/api/leave-encashments",
    detail: (id: string) => `/api/leave-encashments/${id}`,
    create: "/api/leave-encashments",
    update: (id: string) => `/api/leave-encashments/${id}`,
    delete: (id: string) => `/api/leave-encashments/${id}`,
    approve: (id: string) => `/api/leave-encashments/${id}/approve`,
    reject: (id: string) => `/api/leave-encashments/${id}/reject`,
    markAsPaid: (id: string) => `/api/leave-encashments/${id}/mark-paid`,
  },

  // Leave Expiry Rules
  leaveExpiryRules: {
    list: "/api/leave-expiry-rules",
    detail: (id: string) => `/api/leave-expiry-rules/${id}`,
    create: "/api/leave-expiry-rules",
    update: (id: string) => `/api/leave-expiry-rules/${id}`,
    delete: (id: string) => `/api/leave-expiry-rules/${id}`,
  },

  // Skills
  skills: {
    list: "/api/skills",
    detail: (id: string) => `/api/skills/${id}`,
    create: "/api/skills",
    update: (id: string) => `/api/skills/${id}`,
    delete: (id: string) => `/api/skills/${id}`,
  },

  // Employee Skills
  employeeSkills: {
    list: "/api/employee-skills",
    detail: (id: string) => `/api/employee-skills/${id}`,
    create: "/api/employee-skills",
    update: (id: string) => `/api/employee-skills/${id}`,
    delete: (id: string) => `/api/employee-skills/${id}`,
  },

  // Certification Expiry Tracking
  certificationExpiryTracking: {
    list: "/api/certification-expiry-tracking",
    detail: (id: string) => `/api/certification-expiry-tracking/${id}`,
    create: "/api/certification-expiry-tracking",
    update: (id: string) => `/api/certification-expiry-tracking/${id}`,
    delete: (id: string) => `/api/certification-expiry-tracking/${id}`,
    refreshStatus: "/api/certification-expiry-tracking/refresh-status",
  },

  // Compensation Bands
  compensationBands: {
    list: "/api/compensation-bands",
    detail: (id: string) => `/api/compensation-bands/${id}`,
    create: "/api/compensation-bands",
    update: (id: string) => `/api/compensation-bands/${id}`,
    delete: (id: string) => `/api/compensation-bands/${id}`,
  },

  // Compensation Adjustments
  compensationAdjustments: {
    list: "/api/compensation-adjustments",
    detail: (id: string) => `/api/compensation-adjustments/${id}`,
    create: "/api/compensation-adjustments",
    update: (id: string) => `/api/compensation-adjustments/${id}`,
    delete: (id: string) => `/api/compensation-adjustments/${id}`,
    approve: (id: string) => `/api/compensation-adjustments/${id}/approve`,
    reject: (id: string) => `/api/compensation-adjustments/${id}/reject`,
  },

  // Goal Types
  goalTypes: {
    list: "/api/goal-types",
    detail: (id: string) => `/api/goal-types/${id}`,
    create: "/api/goal-types",
    update: (id: string) => `/api/goal-types/${id}`,
    delete: (id: string) => `/api/goal-types/${id}`,
  },

  // Performance Goals
  performanceGoals: {
    list: "/api/performance-goals",
    detail: (id: string) => `/api/performance-goals/${id}`,
    create: "/api/performance-goals",
    update: (id: string) => `/api/performance-goals/${id}`,
    delete: (id: string) => `/api/performance-goals/${id}`,
    updateProgress: (id: string) => `/api/performance-goals/${id}/update-progress`,
  },

  // Performance Indicators
  performanceIndicators: {
    list: "/api/performance-indicators",
    detail: (id: string) => `/api/performance-indicators/${id}`,
    create: "/api/performance-indicators",
    update: (id: string) => `/api/performance-indicators/${id}`,
    delete: (id: string) => `/api/performance-indicators/${id}`,
  },

  // Performance Appraisals
  performanceAppraisals: {
    list: "/api/performance-appraisals",
    detail: (id: string) => `/api/performance-appraisals/${id}`,
    create: "/api/performance-appraisals",
    update: (id: string) => `/api/performance-appraisals/${id}`,
    delete: (id: string) => `/api/performance-appraisals/${id}`,
    recalculate: (id: string) => `/api/performance-appraisals/${id}/recalculate`,
    calibrate: (id: string) => `/api/performance-appraisals/${id}/calibrate`,
  },
  // Disciplinary Cases
  disciplinaryCases: {
    list: "/api/disciplinary-cases",
    detail: (id: string) => `/api/disciplinary-cases/${id}`,
    create: "/api/disciplinary-cases",
    update: (id: string) => `/api/disciplinary-cases/${id}`,
    delete: (id: string) => `/api/disciplinary-cases/${id}`,
    updateStatus: (id: string) => `/api/disciplinary-cases/${id}/update-status`,
    issueNte: (id: string) => `/api/disciplinary-cases/${id}/issue-nte`,
    nteResponse: (id: string) => `/api/disciplinary-cases/${id}/nte-response`,
    enforceSanction: (id: string) => `/api/disciplinary-cases/${id}/enforce-sanction`,
  },

  // Employee Lifecycle Events
  employeeLifecycleEvents: {
    list: "/api/employee-lifecycle-events",
    detail: (id: string) => `/api/employee-lifecycle-events/${id}`,
    create: "/api/employee-lifecycle-events",
    update: (id: string) => `/api/employee-lifecycle-events/${id}`,
    delete: (id: string) => `/api/employee-lifecycle-events/${id}`,
  },

  // Employee Status Definitions
  employeeStatusDefinitions: {
    list: "/api/employee-status-definitions",
    detail: (id: string) => `/api/employee-status-definitions/${id}`,
    create: "/api/employee-status-definitions",
    update: (id: string) => `/api/employee-status-definitions/${id}`,
    delete: (id: string) => `/api/employee-status-definitions/${id}`,
  },
} as const;
