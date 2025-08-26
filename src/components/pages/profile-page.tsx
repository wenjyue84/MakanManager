import React from "react";
import { useCurrentUser } from "../../lib/hooks/use-current-user";
import { EditProfileForm } from "../profile/edit-profile-form";

export function ProfilePage() {
  const user = useCurrentUser();
  if (!user) return null;
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Edit Profile</h1>
      <EditProfileForm user={user} />
    </div>
  );
}
