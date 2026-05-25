import { UserGroupIcon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CommitteeApplication, Division } from "@/shared/lib/types";

import { applicationStatusVariant } from "../utils/variant-mapper";
import { ApplicationRow } from "./application-row";
import { ApplyCtaBanner } from "./apply-cta-banner";
import { FillMeter } from "./fill-meter";

type CurrentUser = {
  id: string;
  role: string;
};

type DivisionPanelProps = {
  division: Division;
  applications: CommitteeApplication[];
  isLead: boolean;
  currentUser: CurrentUser;
};

export function DivisionPanel({
  division,
  applications,
  isLead,
  currentUser,
}: DivisionPanelProps) {
  const pendingCount = applications.filter(
    (application) => application.status === "pending"
  ).length;
  const acceptedCount = applications.filter(
    (application) => application.status === "accepted"
  ).length;
  const myApplication = applications.find(
    (application) => application.userId === currentUser.id
  );
  const divisionFull = acceptedCount >= division.quota;
  let applicationStatusBlock: ReactNode = null;

  if (currentUser.role === "mahasiswa" && !myApplication) {
    applicationStatusBlock = (
      <ApplyCtaBanner
        disabled={divisionFull}
        divisionId={division.id}
        divisionName={division.name}
        userId={currentUser.id}
      />
    );
  } else if (myApplication) {
    applicationStatusBlock = (
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 p-4">
        <span className="font-medium text-sm">Your application</span>
        <StatusBadge
          label={myApplication.status}
          variant={applicationStatusVariant(myApplication.status)}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{division.name}</CardTitle>
        <CardDescription>
          {division.description ?? "No description provided."}
        </CardDescription>
        <CardAction className="flex flex-col items-end gap-1">
          <FillMeter filled={acceptedCount} quota={division.quota} />
          {pendingCount > 0 ? (
            <Badge variant="secondary">{pendingCount} pending</Badge>
          ) : null}
        </CardAction>
      </CardHeader>
      <CardContent>
        {applicationStatusBlock}

        {applications.length === 0 ? (
          <EmptyState icon={UserGroupIcon} title="No applications yet" />
        ) : (
          <ul className="divide-y rounded-md border">
            {applications.map((application) => (
              <ApplicationRow
                application={application}
                currentUserId={currentUser.id}
                isLead={isLead}
                key={application.id}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
