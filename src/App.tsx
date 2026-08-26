import React, { useState, useEffect, useCallback } from 'react';
import { Screen, UserRole, Book, Note, StudentProgress, Assignment } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { StudentDashboard } from './components/StudentDashboard';
import { LibraryView } from './components/LibraryView';
import { BookReader } from './components/BookReader';
import { TeacherDashboard } from './components/TeacherDashboard';
import { SocialView } from './components/SocialView';
import { ProfileView } from './components/ProfileView';
import { AuthScreens } from './components/AuthScreens';
import { BookManagementView } from './components/BookManagementView';
import { useAuth } from './contexts/AuthContext';
import {
  fetchBooks,
  fetchNotes,
  fetchStudentsWithProgress,
  fetchAssignments,
  fetchClasses,
  fetchBookById,
  createNote,
  deleteNote,
  createAssignment,
  saveReadingProgress,
  addReadingSeconds,
  fetchMyProfile,
} from './lib/dataService';

export default function App() {
  const { user, loading, userRole, userName } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [myClassGrade, setMyClassGrade] = useState<string>('');

  const loadData = useCallback(async () => {
    if (!user) return;

    const fetchedBooks = await fetchBooks(user.id);
    setBooks(fetchedBooks);

    const fetchedNotes = await fetchNotes(user.id);
    setNotes(fetchedNotes);

    // Ödevleri her rol için çek (öğrenciler kendi sınıfının ödevini görmeli)
    const fetchedAssignments = await fetchAssignments();
    setAssignments(fetchedAssignments);

    // Öğrencinin kendi sınıfı (ödev filtresi için)
    if (userRole === 'student') {
      const profile = await fetchMyProfile(user.id);
      setMyClassGrade(profile?.classGrade || '');
    }

    if (userRole === 'teacher') {
      const [fetchedStudents, fetchedClasses] = await Promise.all([
        fetchStudentsWithProgress(),
        fetchClasses(),
      ]);
      setStudents(fetchedStudents);
      setClasses(fetchedClasses);
    }
  }, [user, userRole]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, userRole, loadData]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  const handleSelectBook = async (book: Book | string) => {
    if (!user) return;
    let fullBook: Book | null;
    if (typeof book === 'string') {
      fullBook = await fetchBookById(book, user.id);
    } else {
      // Okuyucu açılırken güncel ilerlemeyi de getir
      fullBook = await fetchBookById(book.id, user.id);
    }
    if (fullBook) {
      setSelectedBook(fullBook);
      setCurrentScreen('reader');
      window.scrollTo({ top: 0 });
    }
  };

  const handleSaveProgress = async (bookId: string, page: number, additionalSeconds: number = 0) => {
    if (!user) return;
    const success = await saveReadingProgress(user.id, bookId, page, additionalSeconds);
    if (success) {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? {
                ...b,
                currentPage: page,
                progressPercent: Math.min(100, Math.round((page / (b.totalPages || 1)) * 100)),
              }
            : b
        )
      );
    }
  };

  const handleFlushReadingTime = async (bookId: string, seconds: number) => {
    if (!user || seconds <= 0) return;
    await addReadingSeconds(user.id, bookId, seconds);
  };

  const handleAddNote = async (newNoteData: Omit<Note, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newNote = await createNote({ ...newNoteData, user_id: user.id });
    if (newNote) {
      setNotes((prev) => [newNote, ...prev]);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const success = await deleteNote(id);
    if (success) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleCreateHomework = async (
    input: { bookId: string; targetClass: string; dueDate: string; instructions: string }
  ): Promise<boolean> => {
    if (!user) return false;
    const success = await createAssignment({ ...input, createdBy: user.id });
    if (success) {
      const refreshed = await fetchAssignments();
      setAssignments(refreshed);
    }
    return success;
  };

  const handleLoginSuccess = (role: UserRole) => {
    setCurrentScreen(role === 'student' ? 'dashboard' : role === 'developer' ? 'manage' : 'teacher');
  };

  // Auth Guard
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AuthScreens
          currentScreen={
            currentScreen === 'student-register' ||
            currentScreen === 'teacher-register' ||
            currentScreen === 'developer-register'
              ? currentScreen
              : 'login'
          }
          onNavigate={(screen) => setCurrentScreen(screen)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  const activeRole: UserRole = userRole || 'student';

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col antialiased selection:bg-[#6cf8bb] selection:text-[#002113]">
      <Navbar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userRole={activeRole}
        userName={userName || ''}
      />

      <div className="flex-1">
        {currentScreen === 'dashboard' && activeRole === 'student' && (
          <StudentDashboard
            books={books}
            onSelectBook={handleSelectBook}
            onNavigateToLibrary={() => setCurrentScreen('library')}
          />
        )}

        {(currentScreen === 'manage' || (currentScreen === 'dashboard' && activeRole === 'developer')) && (
          <BookManagementView
            books={books}
            onBookAdded={loadData}
            onSelectBook={handleSelectBook}
          />
        )}

        {currentScreen === 'library' && (
          <LibraryView
            books={books}
            assignments={activeRole === 'student' ? assignments.filter((a) => a.targetClass === myClassGrade) : []}
            studentClass={myClassGrade}
            onSelectBook={handleSelectBook}
          />
        )}

        {currentScreen === 'reader' && selectedBook && (
          <BookReader
            book={selectedBook}
            userId={user.id}
            onBack={() => setCurrentScreen('library')}
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onSaveProgress={handleSaveProgress}
            onFlushReadingTime={handleFlushReadingTime}
          />
        )}

        {currentScreen === 'teacher' && activeRole === 'teacher' ? (
          <TeacherDashboard
            students={students}
            assignments={assignments}
            books={books}
            classes={classes}
            onCreateAssignment={handleCreateHomework}
            onSelectBook={handleSelectBook}
          />
        ) : currentScreen === 'teacher' ? (
          <div className="p-10 text-center">
            <p>Bu sayfaya erişim yetkiniz yok.</p>
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="mt-4 text-emerald-600 font-bold underline"
            >
              Dashboard'a dön
            </button>
          </div>
        ) : null}

        {currentScreen === 'social' && (
          <SocialView
            onSelectBook={handleSelectBook}
            books={books}
            userId={user.id}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileView
            userRole={activeRole}
            setCurrentScreen={setCurrentScreen}
            books={books}
            onSelectBook={handleSelectBook}
            onNavigateToLibrary={() => setCurrentScreen('library')}
          />
        )}
      </div>

      <BottomNav
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userRole={activeRole}
      />
    </div>
  );
}
