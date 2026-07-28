"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import {
  getProfile,
  type Profile,
} from "@/lib/api/profile";
import { createClient } from "@/lib/supabase";

interface ProfileContextValue {
  profile: Profile | null;
  authAvatarUrl: string | null;
  isLoading: boolean;
  error: string | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(
  null,
);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({
  children,
}: ProfileProviderProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authAvatarUrl, setAuthAvatarUrl] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const [
        profileData,
        {
          data: { user },
          error: userError,
        },
      ] = await Promise.all([
        getProfile(),
        supabase.auth.getUser(),
      ]);

      if (userError) {
        throw new Error(userError.message);
      }

      const googleAvatarUrl =
        user?.user_metadata?.avatar_url ||
        user?.user_metadata?.picture ||
        null;

      setProfile(profileData);
      setAuthAvatarUrl(googleAvatarUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load profile";

      setProfile(null);
      setAuthAvatarUrl(null);
      setError(message);

      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        authAvatarUrl,
        isLoading,
        error,
        setProfile,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider",
    );
  }

  return context;
}