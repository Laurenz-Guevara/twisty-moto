"use client";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";

import { create } from "zustand";
import { useEffect } from "react";
import { getPrivateUserProfile } from "@/db/database";
import { User as UserType } from "@/db/types";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
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
}>((set) => ({
  displayProfile: { username: "", firstName: "", lastName: "", avatarUrl: "" },
  updateDisplayProfile: (newDisplayProfile) =>
    set((state) => ({
      displayProfile: {
        ...state.displayProfile,
        ...newDisplayProfile,
      },
    })),
}));

function ZustandStore({ children }: { children: React.ReactNode }) {
  const updateDisplayProfile = useStore((state) => state.updateDisplayProfile);

  // TODO: Test to ensure it always has data
  const { data: displayProfile } = useQuery({
    queryKey: ["user"],
    queryFn: async (): Promise<UserType> => {
      const response = await getPrivateUserProfile();
      return (
        response || {
          username: "",
          firstName: "",
          lastName: "",
          avatarUrl: "",
        }
      );
    },
  });

  useEffect(() => {
    if (displayProfile) {
      updateDisplayProfile(displayProfile);
    }
  }, [displayProfile, updateDisplayProfile]);

  return <>{children}</>;
}
