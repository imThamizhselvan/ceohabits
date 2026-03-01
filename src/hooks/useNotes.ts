import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNoteStore } from '../store/useNoteStore';
import type { Note } from '../types/note';

export function useNotes(userId: string | undefined) {
  const store = useNoteStore();

  useEffect(() => {
    if (!userId) return;
    fetchNotes();
  }, [userId]);

  async function fetchNotes() {
    store.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      store.setNotes(data || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      store.setLoading(false);
    }
  }

  async function addNote(input: Omit<Note, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ ...input, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      if (data) store.addNote(data as Note);
      return data;
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  }

  async function updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'user_id' | 'created_at'>>) {
    const timestamped = { ...updates, updated_at: new Date().toISOString() };
    store.updateNote(id, timestamped);
    try {
      const { error } = await supabase.from('notes').update(timestamped).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  }

  async function deleteNote(id: string) {
    store.removeNote(id);
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  }

  const q = store.searchQuery.toLowerCase();
  const filteredNotes = q
    ? store.notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      )
    : store.notes;

  return {
    notes: store.notes,
    filteredNotes,
    loading: store.loading,
    searchQuery: store.searchQuery,
    setSearchQuery: store.setSearchQuery,
    addNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
}
