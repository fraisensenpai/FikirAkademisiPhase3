import React, { useState } from 'react';
import { Screen, UserRole, Book, Note } from './types';
import { initialBooks, mockBadges, mockInitialNotes, mockStudents, mockAssignments } from './data/mockData';
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

export default function App() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [selectedBook, setSelectedBook] = useState<Book>(initialBooks[0]);
  const [notes, setNotes] = useState<Note[]>(mockInitialNotes);
  const [students, setStudents] = useState(mockStudents);
  const [assignments, setAssignments] = useState(mockAssignments);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Handle Auth redirection if not logged in
  if (!user && (currentScreen !== 'student-register' && currentScreen !== 'teacher-register')) {
    // Force to login if not already on register
    // This simple logic might need refinement based on how `currentScreen` is managed
  }

  // Helper to open reader with chosen book
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setCurrentScreen('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNote = (newNoteData: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      ...newNoteData,
      id: 'n-' + Date.now(),
      createdAt: 'Az önce',
    };
    setNotes([newNote, ...notes]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleAssignHomework = (newAssignment: any) => {
    setAssignments([newAssignment, ...assignments]);
    // Also mark the book as assigned
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

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col antialiased selection:bg-[#6cf8bb] selection:text-[#002113]">
      {/* Top Navbar (hidden in Reader mode) */}
      <Navbar
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Screen Views */}
      <div className="flex-1">
        {currentScreen === 'dashboard' && (
          <StudentDashboard
            books={books}
            badges={mockBadges}
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

        {currentScreen === 'reader' && (
          <BookReader
            book={selectedBook}
            onBack={() => setCurrentScreen('library')}
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {currentScreen === 'teacher' && (
          <TeacherDashboard
            students={students}
            assignments={assignments}
            books={books}
            onAssignHomework={handleAssignHomework}
            onSelectBook={handleSelectBook}
          />
        )}

        {currentScreen === 'social' && (
          <SocialView
            onSelectBook={handleSelectBook}
            books={books}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileView
            userRole={userRole}
            setUserRole={setUserRole}
            setCurrentScreen={setCurrentScreen}
            badges={mockBadges}
          />
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        userRole={userRole}
      />
    </div>
  );
}
