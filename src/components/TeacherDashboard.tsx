import React, { useState } from 'react';
import { StudentProgress, Assignment, Book } from '../types';
import {
  TrendingUp,
  Filter,
  PlusCircle,
  Users,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Send,
  ChevronDown,
} from 'lucide-react';

interface TeacherDashboardProps {
  students: StudentProgress[];
  assignments: Assignment[];
  books: Book[];
  onAssignHomework: (newAssignment: any) => void;
  onSelectBook: (book: Book) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  assignments,
  books,
  onAssignHomework,
  onSelectBook,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'assignments'>('analysis');
  const [selectedClass, setSelectedClass] = useState<string>('10-A Sınıfı');
  const [statusFilter, setStatusFilter] = useState<string>('Tümü');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // New assignment form state
  const [newBookId, setNewBookId] = useState(books[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('28 Kasım');
  const [newInstructions, setNewInstructions] = useState('Bölüm 1 ve Bölüm 2 okunup özet çıkarılacak.');

  const filteredStudents = students.filter((student) => {
    if (statusFilter === 'Tümü') return true;
    return student.status === statusFilter;
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBookObj = books.find((b) => b.id === newBookId);
    if (!selectedBookObj) return;

    onAssignHomework({
      id: 'asg-' + Date.now(),
      bookId: selectedBookObj.id,
      bookTitle: selectedBookObj.title,
      bookAuthor: selectedBookObj.author,
      targetClass: selectedClass.split(' ')[0],
      dueDate: newDueDate,
      assignedDate: 'Bugün',
      totalStudents: 32,
      completedStudents: 0,
      avgProgress: 0,
    });

    setShowAssignModal(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Top Tabs: Sınıf Analizi / Ödev Takibi */}
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
          <option value="10-A Sınıfı">10-A Sınıfı (32 Öğrenci)</option>
          <option value="10-B Sınıfı">10-B Sınıfı (28 Öğrenci)</option>
          <option value="11-A Sınıfı">11-A Sınıfı (30 Öğrenci)</option>
          <option value="9-C Sınıfı">9-C Sınıfı (34 Öğrenci)</option>
        </select>
        <ChevronDown className="w-5 h-5 text-slate-500 absolute right-3.5 top-3.5 pointer-events-none" />
      </div>

      {activeTab === 'analysis' ? (
        <>
          {/* Main Hero Card: Tamamlanma Oranı %78 */}
          <div className="bg-[#091426] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-300 block mb-1">
                Tamamlanma Oranı
              </span>
              <div className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] tracking-tight">
                %78
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                +12% geçen haftaya göre
              </span>
            </div>

            {/* Circular Trend Icon */}
            <div className="w-14 h-14 rounded-full bg-[#6cf8bb] text-[#002113] flex items-center justify-center shadow-md">
              <TrendingUp className="w-7 h-7 stroke-[2.5]" />
            </div>
          </div>

          {/* 2 Sub-metric Cards: Aktif Ödevler & Okunan Sayfa */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">
                Aktif Ödevler
              </span>
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] mt-1 block">
                12
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                2 teslim yaklaşıyor
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs">
              <span className="text-xs text-slate-500 font-medium block">
                Okunan Sayfa
              </span>
              <span className="text-2xl font-bold font-['Plus_Jakarta_Sans'] text-[#091426] mt-1 block">
                4.2k
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Bu ay toplam
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
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt={`${student.name} ${student.surname}`}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-sm">
                          {student.name[0]}
                          {student.surname[0]}
                        </div>
                      )}

                      <div>
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426]">
                          {student.name} {student.surname}
                        </h4>
                        <div className="mt-1">
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
            {assignments.map((asg) => (
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
                <input
                  type="text"
                  disabled
                  value={selectedClass}
                  className="w-full p-2.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Ödev Kitabı Seç</label>
                <select
                  value={newBookId}
                  onChange={(e) => setNewBookId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
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
                  type="text"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  placeholder="Örn: 28 Kasım"
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
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                ></textarea>
              </div>

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
                  className="px-5 py-2 bg-[#091426] text-white rounded-xl text-xs font-bold hover:bg-[#1e293b]"
                >
                  Ödevi Ata & Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
