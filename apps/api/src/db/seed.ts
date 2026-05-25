import { eq, inArray } from "drizzle-orm";
import { db, postgresClient } from ".";
import {
  adminActivityLogTable,
  committeeApplicationTable,
  divisionTable,
  eventTable,
  notificationTable,
  proposalApprovalTable,
  proposalTable,
  registrationTable,
  systemConfigTable,
  ticketTable,
  userTable,
} from "./schema";

const dayMs = 24 * 60 * 60 * 1000;
const now = new Date();
const daysFromNow = (days: number) => new Date(now.getTime() + days * dayMs);

const demoUserIds = [
  "usr_demo_admin",
  "usr_demo_lead_raka",
  "usr_demo_lead_nala",
  "usr_demo_ormawa_satria",
  "usr_demo_fakultas_maya",
  "usr_demo_universitas_bima",
  "usr_demo_student_aisha",
  "usr_demo_student_kevin",
  "usr_demo_student_mira",
  "usr_demo_student_bagus",
] as const;

const demoEventIds = [
  "evt_demo_techno_culture",
  "evt_demo_campus_health",
  "evt_demo_career_bootcamp",
  "evt_demo_green_cleanup",
  "evt_demo_art_market",
] as const;

const demoRegistrationIds = [
  "reg_demo_tech_aisha",
  "reg_demo_tech_kevin",
  "reg_demo_health_mira",
  "reg_demo_art_bagus",
] as const;

const demoTicketIds = [
  "tkt_demo_tech_aisha",
  "tkt_demo_tech_kevin",
  "tkt_demo_health_mira",
  "tkt_demo_art_bagus",
] as const;

const demoProposalIds = [
  "prp_demo_techno_culture",
  "prp_demo_campus_health",
  "prp_demo_career_bootcamp",
  "prp_demo_green_cleanup",
] as const;

const demoProposalApprovalIds = [
  "apr_demo_tech_ormawa",
  "apr_demo_tech_fakultas",
  "apr_demo_tech_universitas",
  "apr_demo_health_ormawa",
  "apr_demo_career_revision",
  "apr_demo_green_rejected",
] as const;

const demoDivisionIds = [
  "div_demo_tech_program",
  "div_demo_tech_logistics",
  "div_demo_tech_design",
  "div_demo_health_medical",
  "div_demo_health_publication",
] as const;

const demoApplicationIds = [
  "app_demo_program_aisha",
  "app_demo_program_kevin",
  "app_demo_logistics_mira",
  "app_demo_design_bagus",
  "app_demo_medical_aisha",
  "app_demo_publication_kevin",
] as const;

const demoNotificationIds = [
  "ntf_demo_raka_proposal_approved",
  "ntf_demo_raka_revision_requested",
  "ntf_demo_aisha_registration",
  "ntf_demo_aisha_application",
  "ntf_demo_kevin_application_rejected",
  "ntf_demo_current_user",
] as const;

const demoActivityIds = [
  "act_demo_role_ormawa",
  "act_demo_config_sla",
  "act_demo_role_fakultas",
  "act_demo_config_ticket",
] as const;

const demoConfigKeys = [
  "committee.application_window_open",
  "demo.theme_accent",
  "event.default_quota",
  "feature.ticket_verification_enabled",
  "proposal.review_sla_days",
] as const;

const demoUsers: (typeof userTable.$inferInsert)[] = [
  {
    email: "dinda.admin@committee.local",
    emailVerified: true,
    id: "usr_demo_admin",
    image: null,
    name: "Dinda Ayu",
    role: "admin",
  },
  {
    email: "raka.pratama@committee.local",
    emailVerified: true,
    id: "usr_demo_lead_raka",
    image: null,
    name: "Raka Pratama",
    role: "ketua_panitia",
  },
  {
    email: "nala.putri@committee.local",
    emailVerified: true,
    id: "usr_demo_lead_nala",
    image: null,
    name: "Nala Putri",
    role: "ketua_panitia",
  },
  {
    email: "satria.ormawa@committee.local",
    emailVerified: true,
    id: "usr_demo_ormawa_satria",
    image: null,
    name: "Satria Wibowo",
    role: "ormawa",
  },
  {
    email: "maya.fakultas@committee.local",
    emailVerified: true,
    id: "usr_demo_fakultas_maya",
    image: null,
    name: "Dr. Maya Anggraini",
    role: "fakultas",
  },
  {
    email: "bima.universitas@committee.local",
    emailVerified: true,
    id: "usr_demo_universitas_bima",
    image: null,
    name: "Prof. Bima Santoso",
    role: "universitas",
  },
  {
    email: "aisha.rahman@committee.local",
    emailVerified: true,
    id: "usr_demo_student_aisha",
    image: null,
    name: "Aisha Rahman",
    role: "mahasiswa",
  },
  {
    email: "kevin.nugroho@committee.local",
    emailVerified: true,
    id: "usr_demo_student_kevin",
    image: null,
    name: "Kevin Nugroho",
    role: "mahasiswa",
  },
  {
    email: "mira.lestari@committee.local",
    emailVerified: true,
    id: "usr_demo_student_mira",
    image: null,
    name: "Mira Lestari",
    role: "mahasiswa",
  },
  {
    email: "bagus.wijaya@committee.local",
    emailVerified: true,
    id: "usr_demo_student_bagus",
    image: null,
    name: "Bagus Wijaya",
    role: "mahasiswa",
  },
];

const demoEvents: (typeof eventTable.$inferInsert)[] = [
  {
    createdById: "usr_demo_lead_raka",
    date: daysFromNow(14),
    description:
      "Festival teknologi, budaya pop, dan instalasi kreatif mahasiswa selama satu hari penuh.",
    id: "evt_demo_techno_culture",
    location: "Auditorium Soekarno",
    name: "Techno Culture Festival 2026",
    quota: 250,
    status: "open",
    type: "internal",
  },
  {
    createdById: "usr_demo_lead_nala",
    date: daysFromNow(8),
    description:
      "Kolaborasi BEM dan PMI untuk donor darah, cek kesehatan ringan, dan edukasi gizi.",
    id: "evt_demo_campus_health",
    location: "Student Center Lt. 1",
    name: "Campus Health Day",
    quota: 120,
    status: "open",
    type: "external",
  },
  {
    createdById: "usr_demo_lead_raka",
    date: daysFromNow(24),
    description:
      "Bootcamp CV, simulasi interview, dan portfolio clinic bersama alumni recruiter.",
    id: "evt_demo_career_bootcamp",
    location: "Ruang Multimedia FEB",
    name: "Career Bootcamp: CV & Interview",
    quota: 80,
    status: "draft",
    type: "internal",
  },
  {
    createdById: "usr_demo_lead_nala",
    date: daysFromNow(-5),
    description:
      "Aksi bersih kampus, pilah sampah, dan audit titik refill air minum.",
    id: "evt_demo_green_cleanup",
    location: "Lapangan Rektorat",
    name: "Green Campus Cleanup",
    quota: 160,
    status: "closed",
    type: "internal",
  },
  {
    createdById: "usr_demo_lead_raka",
    date: daysFromNow(31),
    description:
      "Market seni, zine fair, panggung akustik, dan showcase komunitas visual kampus.",
    id: "evt_demo_art_market",
    location: "Plaza Perpustakaan",
    name: "Student Art Market",
    quota: 180,
    status: "open",
    type: "external",
  },
];

const demoRegistrations: (typeof registrationTable.$inferInsert)[] = [
  {
    eventId: "evt_demo_techno_culture",
    id: "reg_demo_tech_aisha",
    userId: "usr_demo_student_aisha",
  },
  {
    eventId: "evt_demo_techno_culture",
    id: "reg_demo_tech_kevin",
    userId: "usr_demo_student_kevin",
  },
  {
    eventId: "evt_demo_campus_health",
    id: "reg_demo_health_mira",
    userId: "usr_demo_student_mira",
  },
  {
    eventId: "evt_demo_art_market",
    id: "reg_demo_art_bagus",
    userId: "usr_demo_student_bagus",
  },
];

const demoTickets: (typeof ticketTable.$inferInsert)[] = [
  {
    code: "DEMO-TECH-AISHA",
    id: "tkt_demo_tech_aisha",
    registrationId: "reg_demo_tech_aisha",
    status: "active",
  },
  {
    code: "DEMO-TECH-KEVIN",
    id: "tkt_demo_tech_kevin",
    registrationId: "reg_demo_tech_kevin",
    status: "used",
    usedAt: daysFromNow(-1),
  },
  {
    code: "DEMO-HEALTH-MIRA",
    id: "tkt_demo_health_mira",
    registrationId: "reg_demo_health_mira",
    status: "active",
  },
  {
    code: "DEMO-ART-BAGUS",
    id: "tkt_demo_art_bagus",
    registrationId: "reg_demo_art_bagus",
    status: "active",
  },
];

const demoProposals: (typeof proposalTable.$inferInsert)[] = [
  {
    description:
      "Proposal festival lintas komunitas dengan target 250 peserta dan dukungan sponsor lokal.",
    documentUrl: "https://committee-hub.local/docs/techno-culture.pdf",
    eventId: "evt_demo_techno_culture",
    id: "prp_demo_techno_culture",
    scope: "universitas",
    status: "approved",
    submittedAt: daysFromNow(-18),
    submittedById: "usr_demo_lead_raka",
    submissionRound: 1,
    title: "Proposal Techno Culture Festival 2026",
  },
  {
    description:
      "Pengajuan kegiatan kesehatan kampus bersama mitra eksternal dan relawan medis.",
    documentUrl: "https://committee-hub.local/docs/campus-health.pdf",
    eventId: "evt_demo_campus_health",
    id: "prp_demo_campus_health",
    scope: "fakultas",
    status: "pending",
    submittedAt: daysFromNow(-7),
    submittedById: "usr_demo_lead_nala",
    submissionRound: 1,
    title: "Proposal Campus Health Day",
  },
  {
    description:
      "Workshop karier untuk mahasiswa tingkat akhir. Perlu revisi rundown dan narasumber.",
    documentUrl: "https://committee-hub.local/docs/career-bootcamp.pdf",
    eventId: "evt_demo_career_bootcamp",
    id: "prp_demo_career_bootcamp",
    scope: "ormawa",
    status: "revision_requested",
    submittedAt: daysFromNow(-4),
    submittedById: "usr_demo_lead_raka",
    submissionRound: 1,
    title: "Proposal Career Bootcamp",
  },
  {
    description:
      "Aksi kampus hijau yang ditolak karena jadwal bentrok dengan agenda rektorat.",
    documentUrl: "https://committee-hub.local/docs/green-cleanup.pdf",
    eventId: "evt_demo_green_cleanup",
    id: "prp_demo_green_cleanup",
    scope: "ormawa",
    status: "rejected",
    submittedAt: daysFromNow(-28),
    submittedById: "usr_demo_lead_nala",
    submissionRound: 1,
    title: "Proposal Green Campus Cleanup",
  },
];

const demoProposalApprovals: (typeof proposalApprovalTable.$inferInsert)[] = [
  {
    createdAt: daysFromNow(-17),
    decision: "approved",
    id: "apr_demo_tech_ormawa",
    level: "ormawa",
    notes: "Konsep kuat dan sesuai kalender ormawa.",
    proposalId: "prp_demo_techno_culture",
    reviewerId: "usr_demo_ormawa_satria",
    submissionRound: 1,
  },
  {
    createdAt: daysFromNow(-15),
    decision: "approved",
    id: "apr_demo_tech_fakultas",
    level: "fakultas",
    notes: "Anggaran realistis dan mitigasi risiko cukup.",
    proposalId: "prp_demo_techno_culture",
    reviewerId: "usr_demo_fakultas_maya",
    submissionRound: 1,
  },
  {
    createdAt: daysFromNow(-13),
    decision: "approved",
    id: "apr_demo_tech_universitas",
    level: "universitas",
    notes: "Disetujui dengan laporan pasca-acara maksimal H+7.",
    proposalId: "prp_demo_techno_culture",
    reviewerId: "usr_demo_universitas_bima",
    submissionRound: 1,
  },
  {
    createdAt: daysFromNow(-6),
    decision: "approved",
    id: "apr_demo_health_ormawa",
    level: "ormawa",
    notes: "Disetujui ormawa, menunggu validasi fakultas.",
    proposalId: "prp_demo_campus_health",
    reviewerId: "usr_demo_ormawa_satria",
    submissionRound: 1,
  },
  {
    createdAt: daysFromNow(-3),
    decision: "revision_requested",
    id: "apr_demo_career_revision",
    level: "ormawa",
    notes: "Tambahkan konfirmasi pembicara dan detail publikasi.",
    proposalId: "prp_demo_career_bootcamp",
    reviewerId: "usr_demo_ormawa_satria",
    submissionRound: 1,
  },
  {
    createdAt: daysFromNow(-26),
    decision: "rejected",
    id: "apr_demo_green_rejected",
    level: "ormawa",
    notes: "Jadwal bentrok dengan agenda kampus.",
    proposalId: "prp_demo_green_cleanup",
    reviewerId: "usr_demo_ormawa_satria",
    submissionRound: 1,
  },
];

const demoDivisions: (typeof divisionTable.$inferInsert)[] = [
  {
    description: "Stage flow, rundown, liaison officer, dan backstage call.",
    eventId: "evt_demo_techno_culture",
    id: "div_demo_tech_program",
    name: "Program & Stage",
    quota: 8,
  },
  {
    description: "Venue setup, crowd flow, vendor loading, dan inventory.",
    eventId: "evt_demo_techno_culture",
    id: "div_demo_tech_logistics",
    name: "Logistics",
    quota: 10,
  },
  {
    description: "Key visual, social media kit, signage, dan documentation.",
    eventId: "evt_demo_techno_culture",
    id: "div_demo_tech_design",
    name: "Creative Design",
    quota: 6,
  },
  {
    description: "Koordinasi donor, screening peserta, dan alur observasi.",
    eventId: "evt_demo_campus_health",
    id: "div_demo_health_medical",
    name: "Medical Desk",
    quota: 7,
  },
  {
    description: "Publikasi, partnership, dan crowd education.",
    eventId: "evt_demo_campus_health",
    id: "div_demo_health_publication",
    name: "Publication",
    quota: 5,
  },
];

const demoApplications: (typeof committeeApplicationTable.$inferInsert)[] = [
  {
    divisionId: "div_demo_tech_program",
    id: "app_demo_program_aisha",
    motivation:
      "Pernah menjadi stage manager acara jurusan dan ingin belajar flow event besar.",
    reviewedAt: daysFromNow(-2),
    reviewedById: "usr_demo_lead_raka",
    status: "accepted",
    userId: "usr_demo_student_aisha",
  },
  {
    divisionId: "div_demo_tech_program",
    id: "app_demo_program_kevin",
    motivation:
      "Tertarik mengatur rundown dan komunikasi performer selama acara.",
    status: "pending",
    userId: "usr_demo_student_kevin",
  },
  {
    divisionId: "div_demo_tech_logistics",
    id: "app_demo_logistics_mira",
    motivation:
      "Berpengalaman mengelola logistik seminar dan ingin bantu venue flow.",
    reviewedAt: daysFromNow(-1),
    reviewedById: "usr_demo_lead_raka",
    status: "accepted",
    userId: "usr_demo_student_mira",
  },
  {
    divisionId: "div_demo_tech_design",
    id: "app_demo_design_bagus",
    motivation:
      "Aktif di komunitas desain kampus dan bisa bantu signage acara.",
    status: "pending",
    userId: "usr_demo_student_bagus",
  },
  {
    divisionId: "div_demo_health_medical",
    id: "app_demo_medical_aisha",
    motivation: "Ingin membantu registrasi donor dan observasi peserta.",
    status: "pending",
    userId: "usr_demo_student_aisha",
  },
  {
    divisionId: "div_demo_health_publication",
    id: "app_demo_publication_kevin",
    motivation: "Bisa bantu copywriting dan publikasi konten edukasi donor.",
    reviewedAt: daysFromNow(-2),
    reviewedById: "usr_demo_lead_nala",
    status: "rejected",
    userId: "usr_demo_student_kevin",
  },
];

const demoNotifications: (typeof notificationTable.$inferInsert)[] = [
  {
    createdAt: daysFromNow(-13),
    id: "ntf_demo_raka_proposal_approved",
    message: "Proposal Techno Culture Festival 2026 approved",
    read: false,
    referenceId: "prp_demo_techno_culture",
    referenceType: "proposal",
    type: "proposal_approved",
    userId: "usr_demo_lead_raka",
  },
  {
    createdAt: daysFromNow(-3),
    id: "ntf_demo_raka_revision_requested",
    message: "Proposal Career Bootcamp needs revision",
    read: false,
    referenceId: "prp_demo_career_bootcamp",
    referenceType: "proposal",
    type: "proposal_revision_requested",
    userId: "usr_demo_lead_raka",
  },
  {
    createdAt: daysFromNow(-2),
    id: "ntf_demo_aisha_registration",
    message: "Registration confirmed for Techno Culture Festival 2026",
    read: true,
    readAt: daysFromNow(-1),
    referenceId: "reg_demo_tech_aisha",
    referenceType: "registration",
    type: "registration_success",
    userId: "usr_demo_student_aisha",
  },
  {
    createdAt: daysFromNow(-2),
    id: "ntf_demo_aisha_application",
    message: "Your Program & Stage committee application was accepted",
    read: false,
    referenceId: "app_demo_program_aisha",
    referenceType: "committee_application",
    type: "application_accepted",
    userId: "usr_demo_student_aisha",
  },
  {
    createdAt: daysFromNow(-2),
    id: "ntf_demo_kevin_application_rejected",
    message: "Your Publication committee application was not selected",
    read: false,
    referenceId: "app_demo_publication_kevin",
    referenceType: "committee_application",
    type: "application_rejected",
    userId: "usr_demo_student_kevin",
  },
];

const demoSystemConfigs: (typeof systemConfigTable.$inferInsert)[] = [
  {
    description: "Committee application forms are open for non-closed events.",
    key: "committee.application_window_open",
    updatedById: "usr_demo_admin",
    value: "true",
    valueType: "boolean",
  },
  {
    description: "Accent token used by demo dashboards.",
    key: "demo.theme_accent",
    updatedById: "usr_demo_admin",
    value: "campus-yellow",
    valueType: "string",
  },
  {
    description: "Fallback quota used by newly created internal events.",
    key: "event.default_quota",
    updatedById: "usr_demo_admin",
    value: "120",
    valueType: "number",
  },
  {
    description: "Enables QR/ticket verification workflow.",
    key: "feature.ticket_verification_enabled",
    updatedById: "usr_demo_admin",
    value: "true",
    valueType: "boolean",
  },
  {
    description: "Target days for proposal review before escalation.",
    key: "proposal.review_sla_days",
    updatedById: "usr_demo_admin",
    value: "5",
    valueType: "number",
  },
];

const demoActivityLogs: (typeof adminActivityLogTable.$inferInsert)[] = [
  {
    action: "admin.user_role_updated",
    actorUserId: "usr_demo_admin",
    createdAt: daysFromNow(-11),
    id: "act_demo_role_ormawa",
    metadata: JSON.stringify({ role: "ormawa" }),
    targetId: "usr_demo_ormawa_satria",
    targetType: "user",
  },
  {
    action: "admin.system_config_upserted",
    actorUserId: "usr_demo_admin",
    createdAt: daysFromNow(-10),
    id: "act_demo_config_sla",
    metadata: JSON.stringify({ valueType: "number" }),
    targetId: "proposal.review_sla_days",
    targetType: "system_config",
  },
  {
    action: "admin.user_role_updated",
    actorUserId: "usr_demo_admin",
    createdAt: daysFromNow(-8),
    id: "act_demo_role_fakultas",
    metadata: JSON.stringify({ role: "fakultas" }),
    targetId: "usr_demo_fakultas_maya",
    targetType: "user",
  },
  {
    action: "admin.system_config_upserted",
    actorUserId: "usr_demo_admin",
    createdAt: daysFromNow(-6),
    id: "act_demo_config_ticket",
    metadata: JSON.stringify({ valueType: "boolean" }),
    targetId: "feature.ticket_verification_enabled",
    targetType: "system_config",
  },
];

const resetDemoData = async () => {
  await db
    .delete(notificationTable)
    .where(inArray(notificationTable.id, [...demoNotificationIds]));
  await db
    .delete(adminActivityLogTable)
    .where(inArray(adminActivityLogTable.id, [...demoActivityIds]));
  await db
    .delete(systemConfigTable)
    .where(inArray(systemConfigTable.key, [...demoConfigKeys]));
  await db
    .delete(ticketTable)
    .where(inArray(ticketTable.id, [...demoTicketIds]));
  await db
    .delete(registrationTable)
    .where(inArray(registrationTable.id, [...demoRegistrationIds]));
  await db
    .delete(proposalApprovalTable)
    .where(inArray(proposalApprovalTable.id, [...demoProposalApprovalIds]));
  await db
    .delete(proposalTable)
    .where(inArray(proposalTable.id, [...demoProposalIds]));
  await db
    .delete(committeeApplicationTable)
    .where(inArray(committeeApplicationTable.id, [...demoApplicationIds]));
  await db
    .delete(divisionTable)
    .where(inArray(divisionTable.id, [...demoDivisionIds]));
  await db.delete(eventTable).where(inArray(eventTable.id, [...demoEventIds]));
  await db.delete(userTable).where(inArray(userTable.id, [...demoUserIds]));
};

const seedDemoData = async () => {
  await db.insert(userTable).values(demoUsers);
  await db.insert(eventTable).values(demoEvents);
  await db.insert(registrationTable).values(demoRegistrations);
  await db.insert(ticketTable).values(demoTickets);
  await db.insert(proposalTable).values(demoProposals);
  await db.insert(proposalApprovalTable).values(demoProposalApprovals);
  await db.insert(divisionTable).values(demoDivisions);
  await db.insert(committeeApplicationTable).values(demoApplications);
  await db.insert(notificationTable).values(demoNotifications);
  await db.insert(systemConfigTable).values(demoSystemConfigs);
  await db.insert(adminActivityLogTable).values(demoActivityLogs);
};

const promoteDemoAdminEmail = async () => {
  const email = process.env.DEMO_ADMIN_EMAIL?.trim();

  if (!email) {
    return null;
  }

  const [user] = await db
    .update(userTable)
    .set({ role: "admin" })
    .where(eq(userTable.email, email))
    .returning({
      email: userTable.email,
      id: userTable.id,
      name: userTable.name,
    });

  if (!user) {
    return null;
  }

  await db.insert(notificationTable).values({
    id: "ntf_demo_current_user",
    message: "Demo seed promoted your account to Admin Sistem",
    read: false,
    referenceId: user.id,
    referenceType: "user",
    type: "registration_success",
    userId: user.id,
  });

  return user;
};

const main = async () => {
  await resetDemoData();
  await seedDemoData();
  const promotedUser = await promoteDemoAdminEmail();

  const lines = [
    "Seeded Committee Hub demo data.",
    `Users: ${demoUsers.length}`,
    `Events: ${demoEvents.length}`,
    `Proposals: ${demoProposals.length}`,
    `Divisions: ${demoDivisions.length}`,
    `Applications: ${demoApplications.length}`,
    `Notifications: ${demoNotifications.length + (promotedUser ? 1 : 0)}`,
    promotedUser
      ? `Promoted ${promotedUser.email} to admin.`
      : "Set DEMO_ADMIN_EMAIL to promote your signed-in Google user.",
  ];

  process.stdout.write(`${lines.join("\n")}\n`);
};

try {
  await main();
} finally {
  await postgresClient.end();
}
