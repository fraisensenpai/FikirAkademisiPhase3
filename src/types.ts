export type Screen = 'dashboard' | 'library' | 'reader' | 'teacher' | 'social' | 'profile' | 'login' | 'student-register' | 'teacher-register';

export type UserRole = 'student' | 'teacher';

export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'Klasikler' | 'Bilim' | 'Tarih' | 'Felsefe' | 'Psikoloji' | 'Edebiyat';
  coverUrl: string;
  totalPages: number;
  currentPage: number;
  progressPercent: number;
  description: string;
  chapterTitle?: string;
  chapterSubtitle?: string;
  content?: string[];
  illustrationUrl?: string;
  quote?: string;
  isAssigned?: boolean;
  dueDate?: string;
  statusBadge?: 'Devam Ediyor' | 'Yeni' | 'Tamamlandı';
  tags?: string[];
}

export interface Note {
  id: string;
  bookId: string;
  page: number;
  highlightedText: string;
  userNote: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  bgColor: string;
  textColor: string;
  earnedDate: string;
  description: string;
}

export interface StudentProgress {
  id: string;
  name: string;
  surname: string;
  avatarUrl: string;
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
  assignedDate: string;
  totalStudents: number;
  completedStudents: number;
  avgProgress: number;
}
