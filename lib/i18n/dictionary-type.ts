export interface FeatureItem {
  title: string;
  description: string;
}

export interface ProgramSummary {
  slug: string;
  name: string;
  ageRange: string;
  description: string;
}

export interface ProgramDetail extends ProgramSummary {
  highlights: string[];
}

export interface StepItem {
  title: string;
  description: string;
}

export interface PlanItem {
  name: string;
  sessionsPerWeek: string;
  description: string;
  features: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Dictionary {
  meta: {
    siteName: string;
    tagline: string;
    defaultDescription: string;
  };
  nav: {
    home: string;
    about: string;
    programs: string;
    teachers: string;
    pricing: string;
    faq: string;
    contact: string;
    schedule: string;
    registerNow: string;
    bookAssessment: string;
    login: string;
    dashboard: string;
    logout: string;
  };
  footer: {
    tagline: string;
    quickLinksTitle: string;
    contactTitle: string;
    rights: string;
    followUs: string;
  };
  home: {
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
    };
    why: {
      title: string;
      subtitle: string;
      items: FeatureItem[];
    };
    programs: {
      title: string;
      subtitle: string;
      viewAll: string;
      items: ProgramSummary[];
    };
    how: {
      title: string;
      subtitle: string;
      steps: StepItem[];
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
  };
  about: {
    title: string;
    intro: string;
    missionTitle: string;
    mission: string;
    visionTitle: string;
    vision: string;
    valuesTitle: string;
    values: FeatureItem[];
    objectivesTitle: string;
    objectives: string[];
  };
  programsPage: {
    title: string;
    intro: string;
    items: ProgramDetail[];
    levelsTitle: string;
    levelsNote: string;
  };
  teachersPage: {
    title: string;
    intro: string;
    criteriaTitle: string;
    criteria: string[];
    comingSoonNote: string;
  };
  pricingPage: {
    title: string;
    intro: string;
    plans: PlanItem[];
    note: string;
  };
  faqPage: {
    title: string;
    intro: string;
    items: FaqItem[];
  };
  contactPage: {
    title: string;
    intro: string;
    form: {
      name: string;
      email: string;
      message: string;
      submit: string;
      success: string;
    };
    infoTitle: string;
    email: string;
  };
  whatsapp: {
    ariaLabel: string;
    tooltip: string;
    defaultMessage: string;
  };
  schedulePage: {
    title: string;
    intro: string;
    colProgram: string;
    colLevel: string;
    colDay: string;
    colTime: string;
    emptyTitle: string;
    emptyBody: string;
    cta: string;
    weekdays: string[];
  };
  registerNowPage: {
    title: string;
    intro: string;
    step1Title: string;
    step1Body: string;
    step2Title: string;
    step2Body: string;
    ctaLoggedOut: string;
    ctaLoggedIn: string;
    alreadyHaveAccount: string;
    loginLink: string;
    orBookAssessment: string;
    bookAssessmentLink: string;
  };
  auth: {
    errors: {
      missingFields: string;
      passwordMismatch: string;
      weakPassword: string;
      emailInUse: string;
      invalidCredentials: string;
      generic: string;
    };
    register: {
      title: string;
      intro: string;
      fullName: string;
      email: string;
      phone: string;
      password: string;
      confirmPassword: string;
      submit: string;
      submitting: string;
      haveAccount: string;
      loginLink: string;
      successTitle: string;
      successBody: string;
    };
    login: {
      title: string;
      intro: string;
      email: string;
      password: string;
      submit: string;
      submitting: string;
      forgotPassword: string;
      noAccount: string;
      registerLink: string;
    };
    forgotPassword: {
      title: string;
      intro: string;
      email: string;
      submit: string;
      submitting: string;
      successBody: string;
      backToLogin: string;
    };
    resetPassword: {
      title: string;
      intro: string;
      password: string;
      confirmPassword: string;
      submit: string;
      submitting: string;
    };
    dashboard: {
      roles: {
        super_admin: string;
        admin: string;
        teacher: string;
        parent: string;
        student: string;
      };
    };
  };
  dashboardPage: {
    nav: {
      overview: string;
      children: string;
      account: string;
      backToSite: string;
    };
    overview: {
      welcomeBack: string;
      childrenCountLabel: string;
      noChildrenTitle: string;
      noChildrenBody: string;
      addChildCta: string;
      upcomingSessionTitle: string;
      noUpcomingSession: string;
      latestReportTitle: string;
      noReportsYet: string;
      viewChildren: string;
    };
    children: {
      title: string;
      intro: string;
      addButton: string;
      emptyTitle: string;
      emptyBody: string;
      viewDetails: string;
      ageSuffix: string;
      statusLabels: {
        lead: string;
        pending_assessment: string;
        active: string;
        paused: string;
        inactive: string;
      };
      form: {
        title: string;
        fullName: string;
        dateOfBirth: string;
        gender: string;
        genderMale: string;
        genderFemale: string;
        genderUnspecified: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
    };
    childDetail: {
      backToChildren: string;
      infoTitle: string;
      statusLabel: string;
      scheduleTitle: string;
      noSchedule: string;
      progressTitle: string;
      noProgress: string;
      progressNote: string;
      reportsTitle: string;
      noReports: string;
    };
    account: {
      title: string;
      intro: string;
      fullName: string;
      phone: string;
      email: string;
      emailNote: string;
      role: string;
      submit: string;
      submitting: string;
      successBody: string;
    };
    errors: {
      generic: string;
    };
  };
  adminPage: {
    nav: {
      overview: string;
      teachers: string;
      groups: string;
      students: string;
      maqraas: string;
      backToSite: string;
    };
    maqraas: {
      title: string;
      intro: string;
      addButton: string;
      emptyTitle: string;
      emptyBody: string;
      colName: string;
      colGroups: string;
      deleteButton: string;
      form: {
        title: string;
        name: string;
        description: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
    };
    overview: {
      title: string;
      totalParents: string;
      totalStudents: string;
      activeStudents: string;
      leadStudents: string;
      totalTeachers: string;
      totalGroups: string;
    };
    teachers: {
      title: string;
      intro: string;
      addButton: string;
      emptyTitle: string;
      emptyBody: string;
      colName: string;
      colEmail: string;
      form: {
        title: string;
        fullName: string;
        email: string;
        tempPassword: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
    };
    groups: {
      title: string;
      intro: string;
      addButton: string;
      emptyTitle: string;
      emptyBody: string;
      viewDetails: string;
      noTeacher: string;
      studentsCount: string;
      form: {
        title: string;
        name: string;
        program: string;
        level: string;
        teacher: string;
        maqraa: string;
        capacity: string;
        submit: string;
        submitting: string;
        cancel: string;
        noneOption: string;
      };
    };
    groupDetail: {
      backToGroups: string;
      infoTitle: string;
      studentsTitle: string;
      noStudents: string;
      sessionsTitle: string;
      noSessions: string;
      addSessionButton: string;
      deleteButton: string;
      sessionForm: {
        title: string;
        scheduledAt: string;
        meetingUrl: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
      weeklyScheduleTitle: string;
      noWeeklySlots: string;
      addSlotButton: string;
      slotForm: {
        title: string;
        weekday: string;
        startTime: string;
        endTime: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
    };
    students: {
      title: string;
      intro: string;
      addButton: string;
      emptyTitle: string;
      emptyBody: string;
      colName: string;
      colAge: string;
      colStatus: string;
      colGroup: string;
      unassigned: string;
      assignButton: string;
      assignForm: {
        title: string;
        group: string;
        noneOption: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
      addForm: {
        title: string;
        existingParentTab: string;
        newParentTab: string;
        parentEmail: string;
        parentFullName: string;
        parentTempPassword: string;
        childName: string;
        dateOfBirth: string;
        gender: string;
        genderMale: string;
        genderFemale: string;
        genderUnspecified: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
    };
    errors: {
      generic: string;
      parentNotFound: string;
      emailInUse: string;
    };
  };
  teacherPage: {
    nav: {
      overview: string;
      backToSite: string;
    };
    overview: {
      title: string;
      welcome: string;
      noGroups: string;
      viewGroup: string;
      studentsCount: string;
    };
    groupDetail: {
      backToGroups: string;
      infoTitle: string;
      studentsTitle: string;
      noStudents: string;
      viewStudent: string;
      sessionsTitle: string;
      noSessions: string;
      addSessionButton: string;
      deleteButton: string;
      editButton: string;
      sessionForm: {
        title: string;
        scheduledAt: string;
        meetingUrl: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
      attendanceTitle: string;
      attendanceStatuses: {
        present: string;
        absent: string;
        late: string;
        excused: string;
      };
      saveAttendance: string;
      savingAttendance: string;
      weeklyScheduleTitle: string;
      noWeeklySlots: string;
      addSlotButton: string;
      slotForm: {
        title: string;
        weekday: string;
        startTime: string;
        endTime: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
    };
    studentDetail: {
      backToGroup: string;
      infoTitle: string;
      editButton: string;
      deleteButton: string;
      memorizationTitle: string;
      noMemorization: string;
      addMemorizationButton: string;
      memorizationForm: {
        title: string;
        editTitle: string;
        surah: string;
        ayahFrom: string;
        ayahTo: string;
        status: string;
        statusNew: string;
        statusInProgress: string;
        statusMemorized: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
      revisionTitle: string;
      noRevision: string;
      addRevisionButton: string;
      revisionForm: {
        title: string;
        editTitle: string;
        surah: string;
        ayahFrom: string;
        ayahTo: string;
        type: string;
        typeRecent: string;
        typeOld: string;
        quality: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
      dailyReportsTitle: string;
      noDailyReports: string;
      addDailyReportButton: string;
      dailyReportForm: {
        title: string;
        editTitle: string;
        session: string;
        memorizationScore: string;
        tajweedScore: string;
        revisionScore: string;
        participationScore: string;
        notes: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
      reportsTitle: string;
      noReports: string;
      ayahsUnit: string;
      addReportButton: string;
      reportForm: {
        title: string;
        editTitle: string;
        weekStart: string;
        weekEnd: string;
        sessionsAttended: string;
        sessionsTotal: string;
        newAyahs: string;
        revisionScore: string;
        tajweedScore: string;
        teacherNotes: string;
        nextWeekGoals: string;
        submit: string;
        submitting: string;
        cancel: string;
      };
    };
    errors: {
      generic: string;
    };
  };
  bookAssessment: {
    title: string;
    intro: string;
    steps: string[];
    form: {
      parentName: string;
      parentEmail: string;
      parentPhone: string;
      childName: string;
      childAge: string;
      preferredProgram: string;
      readingAbility: string;
      memorizedSurahs: string;
      preferredContactTime: string;
      message: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successBody: string;
      errorBody: string;
    };
  };
}
