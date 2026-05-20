// store/useCompareStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareState {
  compareIds: number[];
  addToCompare: (id: number) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      compareIds: [],
      addToCompare: (id) => 
        set((state) => {
          if (state.compareIds.length >= 4 || state.compareIds.includes(id)) {
            return state; // Limit to 4 products like Vijay Sales
          }
          return { compareIds: [...state.compareIds, id] };
        }),
      removeFromCompare: (id) => 
        set((state) => ({
          compareIds: state.compareIds.filter((i) => i !== id),
        })),
      clearCompare: () => set({ compareIds: [] }),
    }),
    {
      name: 'compare-storage', // Key for localStorage
    }
  )
);
