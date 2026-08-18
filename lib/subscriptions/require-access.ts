import "server-only";
import {
  canAccessApplication,
  type ApplicationAccessResult,
} from "@/lib/subscriptions/access";

export type ApplicationAccessCheck = {
  granted: boolean;
  result: ApplicationAccessResult;
};

export async function requireApplicationAccess(
  userId: string,
  applicationId: string,
): Promise<ApplicationAccessCheck> {
  const result = await canAccessApplication(userId, applicationId);

  return {
    granted: result.allowed && result.status === "ACTIVE",
    result,
  };
}