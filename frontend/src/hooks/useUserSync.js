import { useAuth, useUser } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { syncUser } from "../lib/api";

// the best way to implement this is by using webhooks
function useUserSync() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [syncedUserId, setSyncedUserId] = useState(null);
  const attemptedUserIdRef = useRef(null);

  const { mutate: syncUserMutation, isPending } = useMutation({ mutationFn: syncUser });

  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      attemptedUserIdRef.current = null;
      return;
    }

    if (syncedUserId === user.id || attemptedUserIdRef.current === user.id || isPending) {
      return;
    }

    attemptedUserIdRef.current = user.id;
    syncUserMutation(
      {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName,
        imageUrl: user.imageUrl,
      },
      {
        onSuccess: () => setSyncedUserId(user.id),
        onError: () => {
          // Allow retry on a future render after a failed sync
          attemptedUserIdRef.current = null;
        },
      }
    );
  }, [isSignedIn, user, syncUserMutation, isPending, syncedUserId]);

  return { isSynced: Boolean(user?.id && syncedUserId === user.id) };
}

export default useUserSync;
