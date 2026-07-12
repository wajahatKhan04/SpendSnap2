"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/date";

export default function ProfilePage() {
  const { profile, firebaseUser } = useAuth();
  const name = profile?.displayName ?? firebaseUser?.displayName ?? "SpendSnap User";
  const email = profile?.email ?? firebaseUser?.email ?? "";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h1">Profile</h1>
        <p className="text-sm text-muted-foreground">Your SpendSnap account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.photoURL ?? firebaseUser?.photoURL ?? undefined} alt={name} />
            <AvatarFallback className="text-lg">{initials || "SS"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            {profile?.createdAt && (
              <p className="mt-1 text-xs text-muted-foreground">Member since {formatDate(profile.createdAt)}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
