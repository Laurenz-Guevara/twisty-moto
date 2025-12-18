import { create } from "zustand";

type JumpToLocation = {
  latitude: number;
  longitude: number;
};

type MapStore = {
  jumpToLocation: JumpToLocation | null;
  setJumpToLocation: (coords: JumpToLocation) => void;
  clearJumpToLocation: () => void;
};

export const useMapStore = create<MapStore>((set) => ({
  jumpToLocation: null,
  setJumpToLocation: (coords) => set({ jumpToLocation: coords }),
  clearJumpToLocation: () => set({ jumpToLocation: null }),
}));
