import { create } from 'zustand';
import type { Note } from '../types/note';

interface NoteState {
  notes: Note[];
  loading: boolean;
  searchQuery: string;
  setNotes: (notes: Note[]) => void;
  setLoading: (loading: boolean) => void;
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  removeNote: (id: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [],
  loading: true,
  searchQuery: '',
  setNotes: (notes) => set({ notes }),
  setLoading: (loading) => set({ loading }),
  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    })),
  removeNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
