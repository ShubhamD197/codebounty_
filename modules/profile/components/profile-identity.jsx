import { Mail, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default function ProfileIdentity({ user }) {
  // firstName and lastName are both optional, so neither can be indexed
  // directly. Falling back to the email keeps the avatar from rendering empty.
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email.split("@")[0];
  const initials =
    [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("") ||
    user.email[0].toUpperCase();

  return (
    <div className="rounded-xl border border-border bg-bg-surface p-5">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.imageUrl} alt={fullName} />
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-text-primary truncate">{fullName}</h1>
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {user.role}
          </Badge>
        </div>
      </div>

      <dl className="mt-5 space-y-2 text-sm border-t border-border pt-4">
        <div className="flex items-center gap-2 text-text-muted">
          <Mail className="size-4 flex-shrink-0" />
          <dd className="truncate">{user.email}</dd>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Calendar className="size-4 flex-shrink-0" />
          <dd>Joined {formatDate(user.createdAt)}</dd>
        </div>
      </dl>
    </div>
  );
}
