// biome-ignore-all lint/performance/noBarrelFile: Drizzle Kit requires exported table bindings from this schema entrypoint.
import {
  systemConfigRelations,
  systemConfigTable,
  systemConfigValueTypeEnum,
} from "../modules/admin/admin.schema";
import {
  accountRelations,
  accountTable,
  sessionRelations,
  sessionTable,
  userRelations,
  userRoleEnum,
  userTable,
  verificationTable,
} from "./auth.schema";
import {
  committeeApplicationRelations,
  committeeApplicationStatusEnum,
  committeeApplicationTable,
  divisionRelations,
  divisionTable,
} from "../modules/committee/committee.schema";
import {
  eventRelations,
  eventStatusEnum,
  eventTable,
  eventTypeEnum,
  registrationRelations,
  registrationTable,
  ticketRelations,
  ticketStatusEnum,
  ticketTable,
} from "../modules/event/event.schema";
import {
  notificationRelations,
  notificationTable,
  notificationTypeEnum,
} from "../modules/notification/notification.schema";
import {
  proposalApprovalLevelEnum,
  proposalApprovalRelations,
  proposalApprovalTable,
  proposalDecisionEnum,
  proposalRelations,
  proposalScopeEnum,
  proposalStatusEnum,
  proposalTable,
} from "../modules/proposal/proposal.schema";

export {
  systemConfigRelations,
  systemConfigTable,
  systemConfigValueTypeEnum,
} from "../modules/admin/admin.schema";
export {
  accountRelations,
  accountTable,
  sessionRelations,
  sessionTable,
  userRelations,
  userRoleEnum,
  userTable,
  verificationTable,
} from "./auth.schema";
export {
  committeeApplicationRelations,
  committeeApplicationStatusEnum,
  committeeApplicationTable,
  divisionRelations,
  divisionTable,
} from "../modules/committee/committee.schema";
export {
  eventRelations,
  eventStatusEnum,
  eventTable,
  eventTypeEnum,
  registrationRelations,
  registrationTable,
  ticketRelations,
  ticketStatusEnum,
  ticketTable,
} from "../modules/event/event.schema";
export {
  notificationRelations,
  notificationTable,
  notificationTypeEnum,
} from "../modules/notification/notification.schema";
export {
  proposalApprovalLevelEnum,
  proposalApprovalRelations,
  proposalApprovalTable,
  proposalDecisionEnum,
  proposalRelations,
  proposalScopeEnum,
  proposalStatusEnum,
  proposalTable,
} from "../modules/proposal/proposal.schema";

export const schema = {
  accountRelations,
  accountTable,
  committeeApplicationRelations,
  committeeApplicationStatusEnum,
  committeeApplicationTable,
  divisionRelations,
  divisionTable,
  eventRelations,
  eventStatusEnum,
  eventTable,
  eventTypeEnum,
  notificationRelations,
  notificationTable,
  notificationTypeEnum,
  proposalApprovalLevelEnum,
  proposalApprovalRelations,
  proposalApprovalTable,
  proposalDecisionEnum,
  proposalRelations,
  proposalScopeEnum,
  proposalStatusEnum,
  proposalTable,
  registrationRelations,
  registrationTable,
  sessionRelations,
  sessionTable,
  systemConfigRelations,
  systemConfigTable,
  systemConfigValueTypeEnum,
  ticketRelations,
  ticketStatusEnum,
  ticketTable,
  userRelations,
  userRoleEnum,
  userTable,
  verificationTable,
};
