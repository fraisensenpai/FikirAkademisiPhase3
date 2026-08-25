import { supabase } from './supabaseClient';
import type { Book, Note, StudentProgress, Assignment } from '../types';

// --- KİTAPLAR ---
export const fetchBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Kitaplar çekilemedi:', error);
    return [];
  }
  return (data as unknown as Book[]) || [];
};

export const fetchBookById = async (id: string): Promise<Book | null> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Kitap çekilemedi:', error);
    return null;
  }
  return data as unknown as Book;
};

// --- NOTLAR ---
export const fetchNotes = async (userId: string, bookId?: string): Promise<Note[]> => {
  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (bookId) {
    query = query.eq('book_id', bookId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Notlar çekilemedi:', error);
    return [];
  }
  return (data as unknown as Note[]) || [];
};

export const createNote = async (note: Omit<Note, 'id' | 'createdAt'> & { user_id: string }): Promise<Note | null> => {
  const payload = {
    ...note,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('notes')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Not oluşturulamadı:', error);
    return null;
  }
  return data as unknown as Note;
};

export const deleteNote = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Not silinemedi:', error);
    return false;
  }
  return true;
};

// --- ÖĞRENCİLER (Sadece Öğretmen) ---
export const fetchStudents = async (): Promise<StudentProgress[]> => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Öğrenciler çekilemedi:', error);
    return [];
  }
  return (data as unknown as StudentProgress[]) || [];
};

export const fetchStudentProgress = async (studentId: string, bookId: string): Promise<number> => {
  // Bu fonksiyon ileride gelişebilir (örn: reading_progress tablosu)
  const { data, error } = await supabase
    .from('notes')
    .select('page')
    .eq('user_id', studentId)
    .eq('book_id', bookId)
    .order('page', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return 0;
  return data[0].page || 0;
};

// --- ÖDEVLER (Assignments) ---
export const fetchAssignments = async (): Promise<Assignment[]> => {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .order('assigned_date', { ascending: false });

  if (error) {
    console.error('Ödevler çekilemedi:', error);
    return [];
  }
  return (data as unknown as Assignment[]) || [];
};

export const createAssignment = async (assignment: Omit<Assignment, 'id'>): Promise<Assignment | null> => {
  const { data, error } = await supabase
    .from('assignments')
    .insert(assignment)
    .select()
    .single();

  if (error) {
    console.error('Ödev oluşturulamadı:', error);
    return null;
  }
  return data as unknown as Assignment;
};

export const updateBookAssignmentStatus = async (bookId: string, isAssigned: boolean, dueDate?: string): Promise<void> => {
  await supabase
    .from('books')
    .update({ is_assigned: isAssigned, due_date: dueDate || null })
    .eq('id', bookId);
};