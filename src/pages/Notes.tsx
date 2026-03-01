import { useState } from 'react';
import { Plus, Trash2, Pencil, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotes } from '../hooks/useNotes';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import type { Note } from '../types/note';
import { cn } from '../lib/utils';

interface NoteFormData {
  title: string;
  content: string;
  tagsRaw: string;
}

const defaultForm: NoteFormData = { title: '', content: '', tagsRaw: '' };

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: NoteFormData) => Promise<void>;
  initialData?: Note;
}

function NoteForm({ open, onClose, onSave, initialData }: NoteFormProps) {
  const [form, setForm] = useState<NoteFormData>(
    initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          tagsRaw: initialData.tags.join(', '),
        }
      : defaultForm
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Note' : 'New Note'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Note title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Content</Label>
            <textarea
              className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              rows={12}
              placeholder="Write your note here..."
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <Input
              value={form.tagsRaw}
              onChange={(e) => setForm((f) => ({ ...f, tagsRaw: e.target.value }))}
              placeholder="e.g. work, ideas, personal (comma-separated)"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : initialData ? 'Save Changes' : 'Add Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const updatedAt = new Date(note.updated_at);
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo: string;
  if (diffMin < 1) timeAgo = 'just now';
  else if (diffMin < 60) timeAgo = `${diffMin}m ago`;
  else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
  else timeAgo = `${diffDays}d ago`;

  return (
    <div className="group flex flex-col gap-2 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.3)] transition-all">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold line-clamp-1 flex-1">{note.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {note.content && (
        <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">{note.content}</p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex flex-wrap gap-1">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{timeAgo}</span>
      </div>
    </div>
  );
}

export function Notes() {
  const { user } = useAuth();
  const { notes, filteredNotes, loading, searchQuery, setSearchQuery, addNote, updateNote, deleteNote } =
    useNotes(user?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort();

  const displayNotes = activeTag
    ? filteredNotes.filter((n) => n.tags.includes(activeTag))
    : filteredNotes;

  function openAdd() {
    setEditingNote(undefined);
    setFormOpen(true);
  }

  function openEdit(note: Note) {
    setEditingNote(note);
    setFormOpen(true);
  }

  async function handleSave(data: NoteFormData) {
    const tags = data.tagsRaw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNote) {
      await updateNote(editingNote.id, { title: data.title, content: data.content, tags });
    } else {
      await addNote({ title: data.title, content: data.content, tags });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">Notes</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            {notes.length} note{notes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> New Note
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        <Input
          className="pl-9"
          placeholder="Search notes by title or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-all',
              activeTag === null
                ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-white'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.4)]'
            )}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                activeTag === tag
                  ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))] text-white'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/0.4)]'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-[hsl(var(--secondary))] animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
          <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-sm mx-auto">
            Capture your thoughts, ideas, and plans here.
          </p>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="w-4 h-4" /> Write Your First Note
          </Button>
        </div>
      ) : displayNotes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-[hsl(var(--muted-foreground))]">No notes match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayNotes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={openEdit} onDelete={deleteNote} />
          ))}
        </div>
      )}

      <NoteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editingNote}
      />
    </div>
  );
}
