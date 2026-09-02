import { onBoardUser } from "@/modules/auth/actions";
import LandingContent from "./landing-content";

export default async function Home() {
  await onBoardUser();

  return <LandingContent />;
}