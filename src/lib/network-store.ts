import { Network } from "@prisma/client";
import { create } from "zustand";

type State = {
  network: Network | "solana";
  setNetwork: (r: Network | "solana") => void;
};

export const useNetworkStore = create<State>((set) => ({
  network: "solana",
  setNetwork: (network) => set({ network }),
}));
