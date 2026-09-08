import { onBoardUser } from "@/modules/auth/actions";
import LandingContent from "./landing-content";

// The root layout resolves the Clerk session, so this can never be static.
export const dynamic = "force-dynamic";

export default async function Home() {
  await onBoardUser();

  return <LandingContent />;
}