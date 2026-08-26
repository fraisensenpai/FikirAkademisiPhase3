export type Screen = 'dashboard' | 'library' | 'reader' | 'teacher' | 'manage' | 'social' | 'profile' | 'login' | 'student-register' | 'teacher-register' | 'developer-register';

export type UserRole = 'student' | 'teacher' | 'developer';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  totalPages: number;
  description: string;
  chapterTitle?: string;
  chapterSubtitle?: string;
  illustrationUrl?: string;
  quote?: string;
  // Her eleman bir sayfanın tam metnidir (TXT yüklemesinde otomatik bölünür)
  content?: string[];
  tags?: string[];
  // Kullanıcıya özel (reading_progress tablosundan birleştirilir)
  currentPage?: number;
  progressPercent?: number;
}

/** Öğrencinin belirli bir kitaptaki okuma durumu (öğretmen görünümü) */
export interface StudentBookProgress {
  bookId: string;
  bookTitle: string;
  lastPage: number;
  totalPages: number;
  progressPercent: number;
  updatedAt: string;
}

export interface Note {
  id: string;
  bookId: string;
  page: number;
  highlightedText: string;
  userNote: string;
  createdAt: string;
}

export interface StudentProgress {
  id: string;
  name: string;
  surname: string;
  classGrade: string;
  schoolNumber: string;
  progressPercent: number;
  status: 'Tamamladı' | 'Devam Ediyor' | 'Başlamadı';
  pagesRead: number;
  lastActive: string;
  /** Kitap bazında okuma detayı (öğretmen "hangi sayfada kaldı" görür) */
  bookProgress?: StudentBookProgress[];
}

export interface Assignment {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  targetClass: string;
  dueDate: string;
  instructions?: string;
  totalStudents: number;
  completedStudents: number;
  avgProgress: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  bookId: string | null;
  bookTitle: string | null;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  commentsCount: number;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  membersCount: number;
}
