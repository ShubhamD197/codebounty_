import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { onBoardUser } from "@/modules/auth/actions";

export default async function Home() {
  await onBoardUser();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <UserButton/>
      <Button>Click me</Button>
    </div>
  );
}
