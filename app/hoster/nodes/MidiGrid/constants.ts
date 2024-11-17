export const NOTES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];

export const INITIAL_GRID = Array(4) // 四小节
  .fill(null)
  .map(() =>
    Array(16)
      .fill(null)
      .map(() => ({ note: "C4", active: false }))
  );

export type MidiGrid = Array<Array<{ note: string; active: boolean }>>;
