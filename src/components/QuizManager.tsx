import React, { useState, useEffect } from 'react';
import { QuizSet, QuizAssignment, Book } from '../types';
import {
  fetchQuizSets,
  createQuizSet,
  deleteQuizSet,
  fetchQuizAssignments,
  createQuizAssignment,
  fetchQuizQuestions,
  fetchQuizSubmissions,
} from '../lib/dataService';
import { useToast } from './Toast';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
  FileQuestion,
  Users,
  X,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import type { QuizOption } from '../types';

interface QuizManagerProps {
  userId: string;
  userRole: 'teacher' | 'developer';
  classes: string[];
}

interface QuizSubmissionRow {
  id: string;
  quizAssignmentId: string;
  quizSetTitle: string;
  userId: string;
  userName: string;
  score: number;
  total: number;
  answers: { questionId: string; selectedOption: QuizOption; isCorrect: boolean }[];
  completedAt: string;
}

export const QuizManager: React.FC<QuizManagerProps> = ({ userId, userRole, classes }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'sets' | 'assignments'>('sets');

  // Quiz sets
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);

  // Create quiz form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [questions, setQuestions] = useState<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: QuizOption;
  }[]>([{ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);

  // Assign quiz form
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignQuizSetId, setAssignQuizSetId] = useState('');
  const [assignClass, setAssignClass] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');

  // Quiz results
  const [quizAssignments, setQuizAssignments] = useState<QuizAssignment[]>([]);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Record<string, QuizSubmissionRow[]>>({});

  const loadData = async () => {
    setLoading(true);
    const [sets, assignments] = await Promise.all([
      fetchQuizSets(),
      fetchQuizAssignments(),
    ]);
    setQuizSets(sets);
    setQuizAssignments(assignments);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateQuiz = async () => {
    if (!newTitle.trim()) {
      showToast('Quiz başlığı gerekli.', 'error');
      return;
    }
    const validQuestions = questions.filter((q) => q.question.trim() && q.optionA.trim() && q.optionB.trim() && q.optionC.trim() && q.optionD.trim());
    if (validQuestions.length === 0) {
      showToast('En az bir soru ekleyin.', 'error');
      return;
    }

    const id = await createQuizSet(newTitle, newDescription, userId, validQuestions);
    if (id) {
      showToast('Quiz başarıyla oluşturuldu! 🎉', 'success');
      setShowCreateForm(false);
      setNewTitle('');
      setNewDescription('');
      setQuestions([{ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }]);
      loadData();
    } else {
      showToast('Quiz oluşturulamadı.', 'error');
    }
  };

  const handleAssignQuiz = async () => {
    if (!assignQuizSetId || !assignClass || !assignDueDate) {
      showToast('Tüm alanları doldurun.', 'error');
      return;
    }
    const ok = await createQuizAssignment(assignQuizSetId, assignClass, assignDueDate, userId);
    if (ok) {
      showToast('Quiz ödevi atandı! 📚', 'success');
      setShowAssignForm(false);
      setAssignQuizSetId('');
      setAssignClass('');
      setAssignDueDate('');
      loadData();
    } else {
      showToast('Ödev atanamadı.', 'error');
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    const ok = await deleteQuizSet(id);
    if (ok) {
      showToast('Quiz silindi.', 'success');
      loadData();
    }
  };

  const loadSubmissions = async (assignmentId: string) => {
    if (assignmentSubmissions[assignmentId]) {
      setExpandedAssignmentId(expandedAssignmentId === assignmentId ? null : assignmentId);
      return;
    }
    const subs = await fetchQuizSubmissions(assignmentId);
    setAssignmentSubmissions((prev) => ({ ...prev, [assignmentId]: subs as unknown as QuizSubmissionRow[] }));
    setExpandedAssignmentId(assignmentId);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Tabs */}
      <div className="bg-[#eceef0] p-1 rounded-xl grid grid-cols-2 gap-1 text-center font-['Plus_Jakarta_Sans'] font-semibold text-sm">
        <button
          onClick={() => setActiveTab('sets')}
          className={`py-2 rounded-lg transition-all ${activeTab === 'sets' ? 'bg-white text-[#091426] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Quiz Havuzu
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-2 rounded-lg transition-all ${activeTab === 'assignments' ? 'bg-white text-[#091426] shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Atanan Quizler
        </button>
      </div>

      {activeTab === 'sets' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">Quiz Havuzu</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#091426] text-white rounded-xl text-xs font-bold hover:bg-[#1e293b] shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Quiz Oluştur
            </button>
          </div>

          {loading ? (
            <p className="text-center text-sm text-slate-400 py-8">Yükleniyor...</p>
          ) : quizSets.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 p-6">
              <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Henüz quiz oluşturulmamış.</p>
              <p className="text-xs text-slate-400 mt-1">"Yeni Quiz Oluştur" butonuna tıklayın.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizSets.map((qs) => (
                <div key={qs.id} className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#091426]">{qs.title}</h4>
                      <p className="text-[11px] text-slate-500">{qs.questionCount} soru • {qs.createdAt}</p>
                    </div>
                    <button onClick={() => handleDeleteQuiz(qs.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {qs.description && <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5">{qs.description}</p>}
                  {userRole === 'teacher' && (
                    <button
                      onClick={() => {
                        setAssignQuizSetId(qs.id);
                        setShowAssignForm(true);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#006c49] hover:text-[#005236] transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Ödev Olarak Ata
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'assignments' && (
        <section className="space-y-4">
          <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">Atanan Quizler</h2>
          {quizAssignments.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 p-6">
              <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Henüz quiz ödevi atanmamış.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizAssignments.map((qa) => (
                <div key={qa.id} className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[#091426]">{qa.quizSetTitle}</h4>
                      <p className="text-[11px] text-slate-500">{qa.targetClass} Sınıfı • Teslim: {qa.dueDate}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg">
                      {qa.completedStudents}/{qa.totalStudents}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <div>Ortalama: <span className="font-bold">%{qa.averageScore}</span></div>
                    <div>Çözen: <span className="font-bold">{qa.completedStudents}</span> öğrenci</div>
                  </div>
                  <button
                    onClick={() => loadSubmissions(qa.id)}
                    className="w-full flex items-center justify-center gap-1 text-[11px] font-bold text-[#091426] hover:text-[#006c49] py-1 transition-colors"
                  >
                    {expandedAssignmentId === qa.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    Sonuçları Gör
                  </button>

                  {expandedAssignmentId === qa.id && assignmentSubmissions[qa.id] && (
                    <div className="space-y-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      {assignmentSubmissions[qa.id].length === 0 ? (
                        <p className="text-xs text-slate-400 text-center">Henüz çözüm yok.</p>
                      ) : (
                        assignmentSubmissions[qa.id].map((sub) => (
                          <div key={sub.id} className="flex items-center justify-between text-xs bg-white rounded-lg p-2.5 border border-slate-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#1e293b] text-white flex items-center justify-center font-bold text-[10px]">
                                {sub.userName[0]}
                              </div>
                              <span className="font-bold text-[#091426]">{sub.userName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${sub.total > 0 && sub.score / sub.total >= 0.5 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {sub.score}/{sub.total}
                              </span>
                              <span className="text-[10px] text-slate-400">{sub.completedAt}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Create Quiz Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#091426]">Yeni Quiz Oluştur</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quiz Başlığı</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Tarih Bilgi Yarışması"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Açıklama (opsiyonel)</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Quiz hakkında kısa bilgi"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#091426]">Sorular ({questions.length})</h4>
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Soru {idx + 1}</span>
                    {questions.length > 1 && (
                      <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 text-[11px]">Kaldır</button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[idx].question = e.target.value;
                      setQuestions(updated);
                    }}
                    placeholder="Soru metni"
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((opt) => (
                    <input
                      key={opt}
                      type="text"
                      value={q[opt]}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx][opt] = e.target.value;
                        setQuestions(updated);
                      }}
                      placeholder={`${opt.replace('option', '')} şıkkı`}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  ))}
                  <div>
                    <label className="text-[10px] font-bold text-slate-500">Doğru Cevap:</label>
                    <div className="flex gap-1 mt-1">
                      {(['A', 'B', 'C', 'D'] as QuizOption[]).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = [...questions];
                            updated[idx].correctOption = opt;
                            setQuestions(updated);
                          }}
                          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${q.correctOption === opt ? 'bg-[#006c49] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setQuestions([...questions, { question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' }])}
                className="w-full py-2 border border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                + Soru Ekle
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">İptal</button>
              <button onClick={handleCreateQuiz} className="px-5 py-2 bg-[#091426] text-white rounded-xl text-xs font-bold hover:bg-[#1e293b]">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Quiz Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-[#091426]">Quiz Ödevi Ata</h3>
              <button onClick={() => setShowAssignForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Quiz Seçin</label>
                <select
                  value={assignQuizSetId}
                  onChange={(e) => setAssignQuizSetId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">Quiz seçin</option>
                  {quizSets.map((qs) => (
                    <option key={qs.id} value={qs.id}>{qs.title} ({qs.questionCount} soru)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hedef Sınıf</label>
                <select
                  value={assignClass}
                  onChange={(e) => setAssignClass(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option value="">Sınıf seçin</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Son Teslim Tarihi</label>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAssignForm(false)} className="px-4 py-2 text-xs font-semibold text-slate-600">İptal</button>
              <button onClick={handleAssignQuiz} className="px-5 py-2 bg-[#006c49] text-white rounded-xl text-xs font-bold hover:bg-[#005236]">
                Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
