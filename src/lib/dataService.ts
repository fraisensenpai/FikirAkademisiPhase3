import { supabase } from './supabaseClient';
import type { Book, Note, StudentProgress, StudentBookProgress, Assignment, Post } from '../types';
import { splitTextIntoPages } from './textSplitter';

// --- SATIR EŞLEME (snake_case -> camelCase) ---

interface BookRow {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_url: string;
  total_pages: number;
  description: string | null;
  chapter_title: string | null;
  chapter_subtitle: string | null;
  illustration_url: string | null;
  quote: string | null;
  content: string[] | null;
  tags: string[] | null;
}

interface ProgressRow {
  user_id: string;
  book_id: string;
  last_page: number;
  seconds_read: number | null;
  updated_at: string;
}

const mapBook = (row: BookRow): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  category: row.category,
  coverUrl: row.cover_url,
  totalPages: row.total_pages,
  description: row.description || '',
  chapterTitle: row.chapter_title || undefined,
  chapterSubtitle: row.chapter_subtitle || undefined,
  illustrationUrl: row.illustration_url || undefined,
  quote: row.quote || undefined,
  content: row.content || [],
  tags: row.tags || [],
  currentPage: 0,
  progressPercent: 0,
});

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  } catch {
    return iso;
  }
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return formatDate(iso);
};

// --- KİTAPLAR + KULLANICI İLERLEMESİ ---

export const fetchBooks = async (userId?: string): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Kitaplar çekilemedi:', error);
    return [];
  }

  const books = (data as unknown as BookRow[]).map(mapBook);

  if (userId) {
    const { data: progress } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId);

    if (progress) {
      const progressMap = new Map<string, ProgressRow>(
        (progress as unknown as ProgressRow[]).map((p) => [p.book_id, p])
      );
      for (const book of books) {
        const p = progressMap.get(book.id);
        if (p) {
          book.currentPage = p.last_page;
          book.progressPercent = Math.min(
            100,
            Math.round((p.last_page / (book.totalPages || 1)) * 100)
          );
        }
      }
    }
  }

  return books;
};

export const fetchBookById = async (id: string, userId?: string): Promise<Book | null> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Kitap çekilemedi:', error);
    return null;
  }

  const book = mapBook(data as unknown as BookRow);

  if (userId) {
    const { data: progress } = await supabase
      .from('reading_progress')
      .select('last_page')
      .eq('user_id', userId)
      .eq('book_id', id)
      .maybeSingle();
    if (progress) {
      book.currentPage = progress.last_page;
      book.progressPercent = Math.min(
        100,
        Math.round((progress.last_page / (book.totalPages || 1)) * 100)
      );
    }
  }

  return book;
};

// --- OKUMA İLERLEMESİ ---

/**
 * Sayfa ilerlemesini kaydeder. additionalSeconds varsa aktif okuma süresine
 * eklenir (hile denetimi için biriken sürenin flush'ı).
 */
export const saveReadingProgress = async (
  userId: string,
  bookId: string,
  page: number,
  additionalSeconds: number = 0
): Promise<boolean> => {
  let currentSeconds = 0;
  if (additionalSeconds > 0) {
    const { data } = await supabase
      .from('reading_progress')
      .select('seconds_read')
      .match({ user_id: userId, book_id: bookId })
      .maybeSingle();
    currentSeconds = data?.seconds_read || 0;
  }

  const { error } = await supabase.from('reading_progress').upsert(
    {
      user_id: userId,
      book_id: bookId,
      last_page: page,
      seconds_read: currentSeconds + additionalSeconds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,book_id' }
  );

  if (error) {
    console.error('İlerleme kaydedilemedi:', error);
    return false;
  }
  return true;
};

/** Sadece aktif okuma süresini ekler (sayfa değiştirmeden) */
export const addReadingSeconds = async (
  userId: string,
  bookId: string,
  seconds: number
): Promise<boolean> => {
  if (seconds <= 0) return true;

  const { data } = await supabase
    .from('reading_progress')
    .select('last_page, seconds_read')
    .match({ user_id: userId, book_id: bookId })
    .maybeSingle();

  const { error } = await supabase.from('reading_progress').upsert(
    {
      user_id: userId,
      book_id: bookId,
      last_page: data?.last_page || 0,
      seconds_read: (data?.seconds_read || 0) + seconds,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,book_id' }
  );

  if (error) {
    console.error('Okuma süresi kaydedilemedi:', error);
    return false;
  }
  return true;
};

// --- NOTLAR ---

interface NoteRow {
  id: string;
  user_id: string;
  book_id: string;
  page: number;
  highlighted_text: string | null;
  user_note: string;
  created_at: string;
}

const mapNote = (row: NoteRow): Note => ({
  id: row.id,
  bookId: row.book_id,
  page: row.page,
  highlightedText: row.highlighted_text || '',
  userNote: row.user_note,
  createdAt: formatDate(row.created_at),
});

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
  return ((data as unknown as NoteRow[]) || []).map(mapNote);
};

export const createNote = async (
  note: Omit<Note, 'id' | 'createdAt'> & { user_id: string }
): Promise<Note | null> => {
  const payload = {
    user_id: note.user_id,
    book_id: note.bookId,
    page: note.page,
    highlighted_text: note.highlightedText,
    user_note: note.userNote,
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
  return mapNote(data as unknown as NoteRow);
};

export const deleteNote = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) {
    console.error('Not silinemedi:', error);
    return false;
  }
  return true;
};

// --- ÖĞRETMEN: ÖĞRENCİLER + İLERLEME ---

interface ProfileRow {
  id: string;
  role: string;
  full_name: string | null;
  class_grade: string | null;
  school_number: string | null;
}

export const fetchStudentsWithProgress = async (): Promise<StudentProgress[]> => {
  const [{ data: profiles }, { data: progress }, { data: assignments }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student'),
    supabase.from('reading_progress').select('*'),
    supabase.from('assignments').select('book_id'),
  ]);

  if (!profiles) return [];

  const progressRows = (progress as unknown as ProgressRow[]) || [];
  const assignedBookIds = new Set(((assignments as unknown as { book_id: string }[]) || []).map((a) => a.book_id));

  // Kitap bilgileri (yüzde hesabı ve başlıklar için)
  const { data: bookRows } = await supabase.from('books').select('id, total_pages, title');
  const totalPagesMap = new Map<string, number>(
    ((bookRows as unknown as { id: string; total_pages: number }[]) || []).map((b) => [b.id, b.total_pages])
  );
  const bookTitleMap = new Map<string, string>(
    ((bookRows as unknown as { id: string; title: string }[]) || []).map((b) => [b.id, b.title])
  );

  return ((profiles as unknown as ProfileRow[]) || []).map((profile) => {
    const nameParts = (profile.full_name || '').trim().split(/\s+/);
    const name = nameParts[0] || 'Öğrenci';
    const surname = nameParts.slice(1).join(' ') || '-';

    const userRows = progressRows.filter((p) => p.user_id === profile.id);
    const pagesRead = userRows.reduce((sum, r) => sum + r.last_page, 0);
    const readingSeconds = userRows.reduce((sum, r) => sum + (r.seconds_read || 0), 0);

    let overallPercent = 0;
    let hasCompleted = false;
    const bookProgress: StudentBookProgress[] = [];

    for (const r of userRows) {
      const total = totalPagesMap.get(r.book_id) || 0;
      if (total > 0) {
        const pct = Math.min(100, Math.round((r.last_page / total) * 100));
        if (pct > overallPercent) overallPercent = pct;
        if (pct >= 100 && assignedBookIds.has(r.book_id)) hasCompleted = true;
        bookProgress.push({
          bookId: r.book_id,
          bookTitle: bookTitleMap.get(r.book_id) || r.book_id,
          lastPage: r.last_page,
          totalPages: total,
          progressPercent: pct,
          secondsRead: r.seconds_read || 0,
          updatedAt: timeAgo(r.updated_at),
        });
      }
    }

    // Hile denetimi: gerçekçi üst sınır ~2 sayfa/dakika aktif okuma.
    // Süre çok azken sayfa sayısı fazlaysa şüpheli işaretle.
    const readingMinutes = readingSeconds / 60;
    const suspicious =
      readingMinutes < 1 ? pagesRead > 10 : pagesRead / readingMinutes > 2;

    // En son okunan kitap en üstte
    bookProgress.sort((a, b) => b.progressPercent - a.progressPercent);

    const status: StudentProgress['status'] =
      hasCompleted ? 'Tamamladı' : userRows.length > 0 ? 'Devam Ediyor' : 'Başlamadı';

    const lastActive =
      userRows.length > 0
        ? timeAgo(userRows.reduce((a, b) => (a.updated_at > b.updated_at ? a : b)).updated_at)
        : 'Henüz aktif değil';

    return {
      id: profile.id,
      name,
      surname,
      classGrade: profile.class_grade || '',
      schoolNumber: profile.school_number || '',
      progressPercent: overallPercent,
      status,
      pagesRead,
      readingSeconds,
      suspicious,
      lastActive,
      bookProgress,
    };
  });
};

// --- ÖDEVLER ---

interface AssignmentRow {
  id: string;
  book_id: string;
  target_class: string;
  due_date: string;
  instructions: string | null;
  created_at: string;
}

const buildAssignment = (
  row: AssignmentRow,
  book: Book | undefined,
  students: StudentProgress[],
  perBookProgress: Map<string, Map<string, number>>
): Assignment => {
  const classGrade = row.target_class;
  const classStudents = students.filter((s) => s.classGrade === classGrade);
  const bookProgressMap = perBookProgress.get(row.book_id) || new Map<string, number>();
  const bookTotalPages = book?.totalPages || 0;

  const relevantEntries = classStudents.map((s) => bookProgressMap.get(s.id) ?? 0);
  const completed = relevantEntries.filter((page) =>
    bookTotalPages > 0 ? page >= bookTotalPages : false
  ).length;

  const avgProgress =
    relevantEntries.length > 0
      ? Math.round(
          relevantEntries.reduce((sum, page) => {
            const pct = bookTotalPages > 0 ? Math.min(100, Math.round((page / bookTotalPages) * 100)) : 0;
            return sum + pct;
          }, 0) / relevantEntries.length
        )
      : 0;

  return {
    id: row.id,
    bookId: row.book_id,
    bookTitle: book?.title || row.book_id,
    bookAuthor: book?.author || '',
    targetClass: classGrade,
    dueDate: formatDate(row.due_date),
    instructions: row.instructions || undefined,
    totalStudents: classStudents.length,
    completedStudents: completed,
    avgProgress,
  };
};

export const fetchAssignments = async (): Promise<Assignment[]> => {
  const [{ data: rows }, { data: books }] = await Promise.all([
    supabase.from('assignments').select('*').order('created_at', { ascending: false }),
    supabase.from('books').select('*'),
  ]);

  if (!rows || rows.length === 0) return [];

  const [{ data: profiles }, { data: progress }] = await Promise.all([
    supabase.from('profiles').select('id, class_grade').eq('role', 'student'),
    supabase.from('reading_progress').select('*'),
  ]);

  const studentClassMap = new Map<string, string>(
    ((profiles as unknown as { id: string; class_grade: string | null }[]) || [])
      .filter((p) => p.class_grade)
      .map((p) => [p.id, p.class_grade!])
  );

  // kitap -> (öğrenci -> son sayfa)
  const perBookProgress = new Map<string, Map<string, number>>();
  for (const p of ((progress as unknown as ProgressRow[]) || [])) {
    const studentClass = studentClassMap.get(p.user_id);
    if (!studentClass) continue;
    if (!perBookProgress.has(p.book_id)) perBookProgress.set(p.book_id, new Map());
    perBookProgress.get(p.book_id)!.set(p.user_id, p.last_page);
  }

  const booksArr = ((books as unknown as BookRow[]) || []).map(mapBook);
  const bookMap = new Map(booksArr.map((b) => [b.id, b]));

  // Sınıf bazlı öğrenci listesi için StudentProgress benzeri basit liste
  const students: StudentProgress[] = [...studentClassMap.entries()].map(([id, classGrade]) => ({
    id,
    name: '',
    surname: '',
    classGrade,
    schoolNumber: '',
    progressPercent: 0,
    status: 'Başlamadı',
    pagesRead: 0,
    readingSeconds: 0,
    lastActive: '',
  }));

  return ((rows as unknown as AssignmentRow[]) || []).map((row) =>
    buildAssignment(row, bookMap.get(row.book_id), students, perBookProgress)
  );
};

export interface CreateAssignmentInput {
  bookId: string;
  targetClass: string;
  dueDate: string; // yyyy-mm-dd
  instructions: string;
  createdBy: string;
}

export const createAssignment = async (input: CreateAssignmentInput): Promise<boolean> => {
  const { error } = await supabase.from('assignments').insert({
    book_id: input.bookId,
    target_class: input.targetClass,
    due_date: input.dueDate,
    instructions: input.instructions,
    created_by: input.createdBy,
  });

  if (error) {
    console.error('Ödev oluşturulamadı:', error);
    return false;
  }
  return true;
};

export const fetchClasses = async (): Promise<string[]> => {
  const { data } = await supabase
    .from('profiles')
    .select('class_grade')
    .eq('role', 'student')
    .not('class_grade', 'is', null);

  const classes = [...new Set(((data as unknown as { class_grade: string | null }[]) || []).map((r) => r.class_grade).filter(Boolean))] as string[];
  return classes.sort();
};

// --- GELİŞTİRİCİ: KİTAP YÜKLEME ---

export interface CreateBookInput {
  title: string;
  author: string;
  category: string;
  description: string;
  coverUrl?: string;
  quote?: string;
  tags?: string[];
  textContent: string; // ham TXT içeriği
}

const slugify = (title: string): string => {
  const map: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return (
    title
      .split('')
      .map((ch) => map[ch] ?? ch)
      .join('')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'kitap'
  );
};

/**
 * TXT içeriğini otomatik sayfalara böler ve kitabı veritabanına kaydeder.
 * Her content[i] elemanı bir sayfanın tam metnidir.
 */
export const createBookFromText = async (input: CreateBookInput): Promise<{ success: boolean; pageCount?: number }> => {
  const pages = splitTextIntoPages(input.textContent);

  if (pages.length === 0) {
    return { success: false };
  }

  const id = `${slugify(input.title)}-${Date.now().toString(36)}`;

  const { error } = await supabase.from('books').insert({
    id,
    title: input.title,
    author: input.author,
    category: input.category,
    cover_url: input.coverUrl || '',
    total_pages: pages.length,
    description: input.description || '',
    quote: input.quote || null,
    content: pages,
    tags: input.tags || [],
  });

  if (error) {
    console.error('Kitap kaydedilemedi:', error);
    return { success: false };
  }
  return { success: true, pageCount: pages.length };
};

export const deleteBook = async (bookId: string): Promise<boolean> => {
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) {
    console.error('Kitap silinemedi:', error);
    return false;
  }
  return true;
};

// --- SOSYAL: GÖNDERİLER ---

interface PostRow {
  id: string;
  author_id: string;
  book_id: string | null;
  content: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  post_likes: { user_id: string }[];
}

export const fetchPosts = async (currentUserId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(full_name), post_likes(user_id)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Gönderiler çekilemedi:', error);
    return [];
  }

  const rows = (data as unknown as PostRow[]) || [];
  const bookIds = [...new Set(rows.map((r) => r.book_id).filter(Boolean))] as string[];
  const bookMap = new Map<string, string>();

  if (bookIds.length > 0) {
    const { data: books } = await supabase.from('books').select('id, title').in('id', bookIds);
    for (const b of ((books as unknown as { id: string; title: string }[]) || [])) {
      bookMap.set(b.id, b.title);
    }
  }

  return rows.map((row) => ({
    id: row.id,
    authorId: row.author_id,
    authorName: row.profiles?.full_name || 'Kullanıcı',
    bookId: row.book_id,
    bookTitle: row.book_id ? bookMap.get(row.book_id) || null : null,
    content: row.content,
    likesCount: row.post_likes?.length || 0,
    likedByMe: row.post_likes?.some((l) => l.user_id === currentUserId) || false,
    commentsCount: 0,
    createdAt: timeAgo(row.created_at),
  }));
};

export const createPost = async (
  authorId: string,
  content: string,
  bookId: string | null
): Promise<boolean> => {
  const { error } = await supabase.from('posts').insert({
    author_id: authorId,
    content,
    book_id: bookId,
  });
  if (error) console.error('Gönderi oluşturulamadı:', error);
  return !error;
};

export const togglePostLike = async (postId: string, userId: string, liked: boolean): Promise<boolean> => {
  if (liked) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    return !error;
  }
  const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  return !error;
};
