import { onBoardUser } from "@/modules/auth/actions";
import LandingContent from "./landing-content";

// Reads the Clerk session, so it can never be prerendered. Saying so keeps
// the build log free of DYNAMIC_SERVER_USAGE errors.
export const dynamic = "force-dynamic";

export default async function Home() {
  await onBoardUser();

  return <LandingContent />;
}