import React, { useState } from 'react';
import { StudentProgress, Assignment, Book } from '../types';
import {
  TrendingUp,
  Filter,
  PlusCircle,
  Users,
  BookOpen,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface TeacherDashboardProps {
  students: StudentProgress[];
  assignments: Assignment[];
  books: Book[];
  classes: string[];
  onCreateAssignment: (input: {
    bookId: string;
    targetClass: string;
    dueDate: string;
    instructions: string;
  }) => Promise<boolean>;
  onSelectBook: (book: Book) => void;
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} sn`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
};

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  assignments,
  books,
  classes,
  onCreateAssignment,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'assignments'>('analysis');
  const [selectedClass, setSelectedClass] = useState<string>(classes[0] || 'Tümü');
  const [statusFilter, setStatusFilter] = useState<string>('Tümü');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New assignment form state
  const [newBookId, setNewBookId] = useState(books[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [formError, setFormError] = useState('');

  // Sınıf değişince seçili sınıfı güncelle
  React.useEffect(() => {
    if (classes.length > 0 && !classes.includes(selectedClass)) {
      setSelectedClass(classes[0]);
    }
  }, [classes]);

  const classStudents = students.filter((s) =>
    selectedClass === 'Tümü' ? true : s.classGrade === selectedClass
  );

  const filteredStudents = classStudents.filter((student) => {
    if (statusFilter === 'Tümü') return true;
    return student.status === statusFilter;
  });

  // Gerçek istatistikler
  const completionRate =
    classStudents.length > 0
      ? Math.round(
          (classStudents.filter((s) => s.status === 'Tamamladı').length / classStudents.length) * 100
        )
      : 0;

  const activeAssignments = assignments.filter(
    (a) => selectedClass === 'Tümü' || a.targetClass === selectedClass
  );

  const totalPagesRead = classStudents.reduce((sum, s) => sum + s.pagesRead, 0);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newBookId || !newDueDate || !selectedClass) {
      setFormError('Lütfen tüm alanları doldurun.');
      return;
    }

    setSubmitting(true);
    const success = await onCreateAssignment({
      bookId: newBookId,
      targetClass: selectedClass,
      dueDate: newDueDate,
      instructions: newInstructions,
    });
    setSubmitting(false);

    if (success) {
      setShowAssignModal(false);
      setNewDueDate('');
      setNewInstructions('');
    } else {
      setFormError('Ödev kaydedilemedi. Tekrar deneyin.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Top Tabs */}
      <div className="bg-[#eceef0] p-1 rounded-xl grid grid-cols-2 gap-1 text-center font-['Plus_Jakarta_Sans'] font-semibold text-sm">
        <button
          onClick={() => setActiveTab('analysis')}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'analysis'
              ? 'bg-white text-[#091426] shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sınıf Analizi
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'assignments'
              ? 'bg-white text-[#091426] shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Ödev Takibi
        </button>
      </div>

      {/* Class Selector Dropdown */}
      <div className="relative">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full bg-white border border-[#e0e3e5] rounded-xl py-3 px-4 text-sm font-bold text-[#091426] focus:outline-none focus:ring-2 focus:ring-[#091426] appearance-none shadow-2xs cursor-pointer"
        >
          <option value="Tümü">Tüm Sınıflar</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls} Sınıfı ({students.filter((s) => s.classGrade === cls).length} Öğrenci)
            </option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
      </div>

      {activeTab === 'analysis' ? (
        <>
          {/* Main Hero Card */}
          <div className="bg-[#091426] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-300 block mb-1">
                Tamamlanma Oranı
              </span>
              <div className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
                %{completionRate}
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                {classStudents.length} öğrenci takip ediliyor
              </span>
            </div>

            <div className="w-14 h-14 rounded-full bg-[#6cf8bb] text-[#002113] flex items-center justify-center shadow-md">
              <TrendingUp className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          {/* 2 Sub-metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">
                Aktif Ödevler
              </span>
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] mt-1 block">
                {activeAssignments.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Toplam atanan ödev
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">
                Okunan Sayfa
              </span>
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] mt-1 block">
                {totalPagesRead}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tüm zamanlar toplamı
              </span>
            </div>
          </div>

          {/* Öğrenci Listesi Header & Filter */}
          <section className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">
                Öğrenci Listesi
              </h2>

              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#091426] bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>{statusFilter === 'Tümü' ? 'Filtrele' : statusFilter}</span>
                </button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 p-1 z-20 text-xs">
                    {['Tümü', 'Tamamladı', 'Devam Ediyor', 'Başlamadı'].map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          setStatusFilter(f);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          statusFilter === f ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Student Cards List */}
            <div className="space-y-3">
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 p-6">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    Bu sınıfta henüz kayıtlı öğrenci yok.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Öğrenciler hesap oluşturunca burada listelenirler.
                  </p>
                </div>
              )}

              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-sm">
                        {student.name[0]}
                        {student.surname !== '-' ? student.surname[0] : ''}
                      </div>

                      <div>
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426]">
                          {student.name} {student.surname}
                        </h4>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              student.status === 'Tamamladı'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : student.status === 'Devam Ediyor'
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {student.status}
                          </span>
                          {student.classGrade && (
                            <span className="text-[10px] text-slate-400">{student.classGrade}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress percentage text */}
                    <div className="text-right">
                      <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426]">
                        %{student.progressPercent}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {student.pagesRead} sayfa
                      </span>
                      <span className="block text-[10px] text-slate-400 flex items-center justify-end gap-0.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDuration(student.readingSeconds)}
                      </span>
                      {student.suspicious && (
                        <span
                          className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-600 border border-red-200"
                          title="Okuma süresi, okunan sayfa sayısıyla uyumsuz. Hile ihtimalini kontrol edin."
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Şüpheli
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        student.status === 'Tamamladı'
                          ? 'bg-[#006c49]'
                          : student.status === 'Devam Ediyor'
                          ? 'bg-[#1e293b]'
                          : 'bg-transparent'
                      }`}
                      style={{ width: `${student.progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Kitap bazında detay (hangi sayfada kalmış?) */}
                  {student.bookProgress && student.bookProgress.length > 0 && (
                    <div className="mt-2.5">
                      <button
                        onClick={() =>
                          setExpandedStudentId(expandedStudentId === student.id ? null : student.id)
                        }
                        className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-700 py-1 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                        {expandedStudentId === student.id ? 'Detayı Gizle' : 'Kitap Bazında Detay'}
                        {expandedStudentId === student.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedStudentId === student.id && (
                        <div className="mt-2 space-y-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                          {student.bookProgress.map((bp) => (
                            <div key={bp.bookId}>
                              <div className="flex justify-between items-center text-[11px] mb-1">
                                <span className="font-bold text-[#091426] truncate">{bp.bookTitle}</span>
                                <span className="text-slate-600 font-semibold shrink-0 ml-2">
                                  Sayfa {bp.lastPage} / {bp.totalPages} (%{bp.progressPercent})
                                </span>
                              </div>
                              <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    bp.progressPercent >= 100 ? 'bg-[#006c49]' : 'bg-[#1e293b]'
                                  }`}
                                  style={{ width: `${bp.progressPercent}%` }}
                                ></div>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Okuma süresi: {formatDuration(bp.secondsRead)} • Son aktivite: {bp.updatedAt}
                                {bp.progressPercent >= 100
                                  ? ' • Tamamladı 🎉'
                                  : ` • ${bp.totalPages - bp.lastPage} sayfa kaldı`}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Ödev Takibi Tab */
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">
              Atanan Kitap Ödevleri
            </h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#091426] text-white rounded-xl text-xs font-bold hover:bg-[#1e293b] shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Yeni Ödev Ata</span>
            </button>
          </div>

          <div className="space-y-3">
            {activeAssignments.length === 0 && (
              <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 p-6">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Henüz ödev atanmadı.</p>
                <p className="text-xs text-slate-400 mt-1">"Yeni Ödev Ata" butonuna tıklayın.</p>
              </div>
            )}

            {activeAssignments.map((asg) => (
              <div
                key={asg.id}
                className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-[#091426]">
                      {asg.bookTitle}
                    </h3>
                    <p className="text-xs text-slate-500">{asg.bookAuthor}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                    {asg.targetClass}
                  </span>
                </div>

                {asg.instructions && (
                  <p className="text-xs text-slate-600 bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                    📋 {asg.instructions}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Teslim: <strong>{asg.dueDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Tamamlayan: <strong>{asg.completedStudents}/{asg.totalStudents}</strong></span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                    <span>Sınıf İlerleme Ortalaması</span>
                    <span>%{asg.avgProgress}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${asg.avgProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Assign Homework Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#091426]">
                Sınıfa Yeni Kitap Ödevi Ata
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hedef Sınıf</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer"
                  required
                >
                  <option value="">Sınıf seçin</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
                {classes.length === 0 && (
                  <p className="text-[11px] text-red-500 mt-1">
                    Henüz kayıtlı öğrenci yok. Öğrenciler kayıt olunca sınıf seçenekleri oluşur.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ödev Kitabı Seç</label>
                <select
                  value={newBookId}
                  onChange={(e) => setNewBookId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  required
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} - {b.author} ({b.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Son Teslim Tarihi</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ödev Talimatı / Notu</label>
                <textarea
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  rows={2}
                  placeholder="Örn: Bölüm 1 ve Bölüm 2 okunup özet çıkarılacak."
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                ></textarea>
              </div>

              {formError && (
                <p className="text-xs text-red-600 font-semibold">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#091426] text-white rounded-xl text-xs font-bold hover:bg-[#1e293b] disabled:opacity-50"
                >
                  {submitting ? 'Kaydediliyor...' : 'Ödevi Ata & Yayınla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
