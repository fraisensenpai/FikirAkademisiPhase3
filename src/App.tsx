import React, { useState, useEffect } from 'react';
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
import { useAuth } from './contexts/AuthContext';
import { fetchBooks, fetchNotes, fetchStudents, fetchAssignments, createNote, deleteNote, updateBookAssignmentStatus } from './lib/dataService';

export default function App() {
  const { user, loading, userRole, setUserRole } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    console.log('App mounting, user:', user, 'loading:', loading);
    if (user) {
      loadData();
    }
  }, [user, userRole]);

  const loadData = async () => {
    const fetchedBooks = await fetchBooks();
    setBooks(fetchedBooks);
    if (fetchedBooks.length > 0 && !selectedBook) setSelectedBook(fetchedBooks[0]);
    
    if (user) {
      const fetchedNotes = await fetchNotes(user.id);
      setNotes(fetchedNotes);
    }

    if (userRole === 'teacher') {
      const fetchedStudents = await fetchStudents();
      setStudents(fetchedStudents);
      const fetchedAssignments = await fetchAssignments();
      setAssignments(fetchedAssignments);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Helper to open reader with chosen book
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentScreen('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNote = async (newNoteData: Omit<Note, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newNote = await createNote({ ...newNoteData, user_id: user.id });
    if (newNote) {
      setNotes([newNote, ...notes]);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const success = await deleteNote(id);
    if (success) {
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  const handleAssignHomework = async (newAssignment: any) => {
    setAssignments([newAssignment, ...assignments]);
    await updateBookAssignmentStatus(newAssignment.bookId, true, newAssignment.dueDate);
    
    setBooks(
      books.map((b) =>
        b.id === newAssignment.bookId
          ? { ...b, isAssigned: true, dueDate: newAssignment.dueDate, statusBadge: 'Yeni' }
          : b
      )
    );
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setCurrentScreen(role === 'student' ? 'dashboard' : 'teacher');
  };

  // Auth Guard
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AuthScreens
          currentScreen={currentScreen === 'student-register' || currentScreen === 'teacher-register' ? currentScreen : 'login'}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  const activeRole = userRole || 'student';
  const activeBook = selectedBook || (books.length > 0 ? books[0] : null);
  const badges: any[] = []; // Replacing mockBadges

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col antialiased selection:bg-[#6cf8bb] selection:text-[#002113]">
      {/* Top Navbar (hidden in Reader mode) */}
      <Navbar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userRole={activeRole}
        setUserRole={setUserRole}
      />

      {/* Screen Views */}
      <div className="flex-1">
        {currentScreen === 'dashboard' && (
          <StudentDashboard
            books={books}
            badges={badges}
            onSelectBook={handleSelectBook}
            onNavigateToLibrary={() => setCurrentScreen('library')}
          />
        )}

        {currentScreen === 'library' && (
          <LibraryView
            books={books}
            onSelectBook={handleSelectBook}
          />
        )}

        {currentScreen === 'reader' && activeBook && (
          <BookReader
            book={activeBook}
            onBack={() => setCurrentScreen('library')}
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {currentScreen === 'teacher' && userRole === 'teacher' ? (
          <TeacherDashboard
            students={students}
            assignments={assignments}
            books={books}
            onAssignHomework={handleAssignHomework}
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
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileView
            userRole={activeRole}
            setUserRole={setUserRole}
            setCurrentScreen={setCurrentScreen}
            badges={badges}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userRole={activeRole}
      />
    </div>
  );
}
