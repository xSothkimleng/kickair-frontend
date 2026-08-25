import EmailVerifiedContent, { type VerifiedStatus } from "./EmailVerifiedContent";

const STATUSES: VerifiedStatus[] = ["verified", "expired", "invalid", "already"];

/**
 * Landing page for the verification link. The API redirects here with
 * ?status=expired|invalid|already for the failure cases (no status = verified).
 */
export default async function EmailVerifiedPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const resolved: VerifiedStatus = STATUSES.includes(status as VerifiedStatus) ? (status as VerifiedStatus) : "verified";
  return <EmailVerifiedContent status={resolved} />;
}
