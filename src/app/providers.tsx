"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

import { create } from "zustand";
import { Notification as NotificationType, User as UserType } from "@/types/types";
import { useEffect } from "react";
import { getPrivateUserProfile } from "@/db/user/profile.service";
import { getUserNotifications } from "@/db/notifications/notification.service";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <KindeProvider>
          <QueryClientProvider client={queryClient}>
            <ZustandStore>
              {children}
            </ZustandStore>
          </QueryClientProvider>
        </KindeProvider>
      </ThemeProvider>
    </>
  );
}

type PartialUser = Partial<UserType>;

export const useStore = create<{
  displayProfile: UserType;
  updateDisplayProfile: (newDisplayProfile: PartialUser) => void;
  userNotifications: NotificationType[];
  updateUserNotifications: (newUserNotifications: NotificationType[]) => void;
}>((set) => ({
  displayProfile: { username: "", firstName: "", lastName: "", avatarUrl: "" },
  userNotifications: [],
  updateDisplayProfile: (newDisplayProfile) =>
    set((state) => ({
      displayProfile: {
        ...state.displayProfile,
        ...newDisplayProfile,
      },
    })),

  updateUserNotifications: (newUserNotifications) =>
    set(() => ({
      userNotifications: newUserNotifications,
    })),
}));

function ZustandStore({ children }: { children: React.ReactNode }) {
  const updateDisplayProfile = useStore((state) => state.updateDisplayProfile);
  const updateUserNotifications = useStore((state) =>
    state.updateUserNotifications
  );

  const { data: userProfile } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await getPrivateUserProfile();
      return response || {
        username: "",
        firstName: "",
        lastName: "",
        avatarUrl: "",
      };
    },
  });

  const { data: userNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await getUserNotifications();

      return response;
    },
  });

  useEffect(() => {
    if (userNotifications) {
      updateUserNotifications(userNotifications || []);
    }

    if (userProfile) {
      updateDisplayProfile(
        userProfile || {
          username: "",
          firstName: "",
          lastName: "",
          avatarUrl: "",
        },
      );
    }
  }, [
    userNotifications,
    userProfile,
    updateUserNotifications,
    updateDisplayProfile,
  ]);

  return <>{children}</>;
}
