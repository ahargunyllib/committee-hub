export type UserRole =
  | "mahasiswa"
  | "ketua_panitia"
  | "ormawa"
  | "fakultas"
  | "universitas"
  | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type EventStatus = "draft" | "open" | "closed";
export type EventType = "internal" | "external";

export type Event = {
  id: string;
  createdById: string;
  name: string;
  description: string | null;
  date: string;
  location: string;
  quota: number;
  type: EventType;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
};

export type Registration = {
  id: string;
  eventId: string;
  userId: string;
  createdAt: string;
};

export type TicketStatus = "active" | "used" | "cancelled";

export type Ticket = {
  id: string;
  registrationId: string;
  code: string;
  status: TicketStatus;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProposalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested";

export type ProposalScope = "ormawa" | "fakultas" | "universitas";

export type Proposal = {
  id: string;
  eventId: string;
  submittedById: string;
  title: string;
  description: string | null;
  documentUrl: string | null;
  status: ProposalStatus;
  scope: ProposalScope;
  submissionRound: number;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ProposalDecision = "approved" | "rejected" | "revision_requested";

export type ProposalApproval = {
  id: string;
  proposalId: string;
  reviewerId: string;
  level: ProposalScope;
  decision: ProposalDecision;
  notes: string | null;
  submissionRound: number;
  createdAt: string;
};

export type Division = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  quota: number;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type CommitteeApplication = {
  id: string;
  divisionId: string;
  userId: string;
  status: ApplicationStatus;
  motivation: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationType =
  | "proposal_approved"
  | "proposal_rejected"
  | "proposal_revision_requested"
  | "application_accepted"
  | "application_rejected"
  | "registration_success";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  read: boolean;
  referenceType: string | null;
  referenceId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ConfigValueType = "string" | "number" | "boolean" | "json";

export type SystemConfig = {
  id: string;
  key: string;
  value: string;
  valueType: ConfigValueType;
  description: string | null;
  updatedById: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActivityEntry = {
  id: string;
  userId: string | null;
  userName: string | null;
  verb: string;
  target: string;
  createdAt: string;
};
