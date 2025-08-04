import { create } from "zustand";

export type Network = "solana" | "ethereum" | "lido" | "aptos" | "celestia" | "sui"

type State = {
  network: Network | "solana";
  setNetwork: (r: Network | "solana") => void;
};

export const useNetworkStore = create<State>((set) => ({
  network: "solana",
  setNetwork: (network) => set({ network }),
}));
