export type Screen = 'dashboard' | 'library' | 'reader' | 'teacher' | 'social' | 'profile' | 'login' | 'student-register' | 'teacher-register';

export type UserRole = 'student' | 'teacher';

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
  content?: string[];
  illustrationUrl?: string;
  quote?: string;
  tags?: string[];
  // Kullanıcıya özel (reading_progress tablosundan birleştirilir)
  currentPage?: number;
  progressPercent?: number;
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
