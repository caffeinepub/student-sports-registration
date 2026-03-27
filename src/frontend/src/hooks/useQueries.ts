import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Registration, RegistrationInput } from "../backend.d";
import { useActor } from "./useActor";

export function useSubmitRegistration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegistrationInput) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitRegistration(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      queryClient.invalidateQueries({ queryKey: ["registrationCount"] });
    },
  });
}

export function useGetRegistrations() {
  const { actor, isFetching } = useActor();
  return useQuery<Registration[]>({
    queryKey: ["registrations"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegistrations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRegistrationCount() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["registrationCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getRegistrationCount();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateInviteCode() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.generateInviteCode();
    },
  });
}

export function useGetRegistrationByAdmissionNumber() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (
      admissionNumber: string,
    ): Promise<Registration | null> => {
      if (!actor) throw new Error("Actor not ready");
      const result =
        await actor.getRegistrationByAdmissionNumber(admissionNumber);
      // result is [] | [Registration] from Candid opt type
      return result.length > 0 ? (result[0] ?? null) : null;
    },
  });
}
