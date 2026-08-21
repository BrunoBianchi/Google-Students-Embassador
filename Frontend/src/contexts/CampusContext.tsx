import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, type Campus, type CampusMemberInfo, type AmbassadorDirectoryItem } from "../services/auth";
import { useAuth } from "./AuthContext";

type CampusContextType = {
  campus: Campus | null;
  membership: CampusMemberInfo | null;
  ambassadors: AmbassadorDirectoryItem[];
  isLoading: boolean;
  error: string | null;
  isNotFound: boolean;
  campusSlug: string;
  refreshCampus: () => Promise<void>;
  joinCampus: () => Promise<{ success: boolean; message: string }>;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({
  campusSlug,
  children,
}: {
  campusSlug: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [campus, setCampus] = useState<Campus | null>(null);
  const [membership, setMembership] = useState<CampusMemberInfo | null>(null);
  const [ambassadors, setAmbassadors] = useState<AmbassadorDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  const fetchCampus = useCallback(async () => {
    if (!campusSlug) return;
    setIsLoading(true);
    setError(null);
    setIsNotFound(false);

    try {
      const data = await authApi.getCampus(campusSlug);
      setCampus(data.campus);
      setMembership(data.membership);
      setAmbassadors(data.ambassadors);
    } catch (err: any) {
      if (err?.message?.includes("Campus não encontrado") || err?.message?.includes("not found")) {
        setIsNotFound(true);
      } else {
        setError(err?.message ?? "Não foi possível carregar os dados deste campus.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [campusSlug, user]);

  useEffect(() => {
    fetchCampus();
  }, [fetchCampus]);

  const joinCampus = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await authApi.joinCampus(campusSlug);
      setMembership(result.membership);
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, message: err?.message ?? "Não foi possível ingressar no campus." };
    }
  };

  return (
    <CampusContext.Provider
      value={{
        campus,
        membership,
        ambassadors,
        isLoading,
        error,
        isNotFound,
        campusSlug,
        refreshCampus: fetchCampus,
        joinCampus,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error("useCampus deve ser utilizado dentro de um CampusProvider.");
  }
  return context;
}
