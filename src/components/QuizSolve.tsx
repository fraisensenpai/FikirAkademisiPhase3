import React, { useState, useEffect } from 'react';
import { QuizAssignmentView, QuizQuestion, QuizOption } from '../types';
import {
  fetchMyQuizAssignments,
  fetchQuizQuestions,
  submitQuizAnswers,
  fetchMyQuizSubmission,
} from '../lib/dataService';
import { useToast } from './Toast';
import { BookOpen, CheckCircle2, XCircle, ArrowLeft, Trophy } from 'lucide-react';

interface QuizSolveProps {
  userId: string;
  classGrade: string;
  onBack: () => void;
}

export const QuizSolve: React.FC<QuizSolveProps> = ({ userId, classGrade, onBack }) => {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState<QuizAssignmentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<QuizAssignmentView | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchMyQuizAssignments(userId, classGrade);
      setAssignments(data);
      setLoading(false);
    };
    if (classGrade) load();
  }, [userId, classGrade]);

  const startQuiz = async (assignment: QuizAssignmentView) => {
    if (assignment.submitted) {
      // Show result
      const sub = await fetchMyQuizSubmission(assignment.id, userId);
      if (sub) setResult({ score: sub.score, total: sub.total });
      setSelectedAssignment(assignment);
      setSubmitted(true);
      return;
    }
    setLoading(true);
    const qs = await fetchQuizQuestions(assignment.quizSetId);
    setQuestions(qs);
    setSelectedAssignment(assignment);
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    const answerArray = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] || 'A',
      isCorrect: (answers[q.id] || 'A') === q.correctOption,
    }));

    const ok = await submitQuizAnswers(selectedAssignment.id, userId, answerArray);
    if (ok) {
      const correctCount = answerArray.filter((a) => a.isCorrect).length;
      setResult({ score: correctCount, total: questions.length });
      setSubmitted(true);
      showToast(`Quiz tamamlandı! ${correctCount}/${questions.length} doğru 🎉`, 'success');
      // Refresh assignments
      const refreshed = await fetchMyQuizAssignments(userId, classGrade);
      setAssignments(refreshed);
    } else {
      showToast('Quiz gönderilemedi.', 'error');
    }
  };

  // Quiz solving view
  if (selectedAssignment && !submitted) {
    const q = questions[currentIdx];
    if (!q) return null;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
        <button onClick={() => setSelectedAssignment(null)} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#091426]">
          <ArrowLeft className="w-4 h-4" /> Quizlere Dön
        </button>

        <div className="bg-[#091426] text-white rounded-3xl p-4 shadow-md">
          <h3 className="font-bold text-sm">{selectedAssignment.quizSetTitle}</h3>
          <p className="text-[11px] text-slate-300 mt-1">Soru {currentIdx + 1} / {questions.length}</p>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2">
            <div className="bg-[#6cf8bb] h-full rounded-full transition-all" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e6e8ea] shadow-xs space-y-4">
          <p className="text-sm font-bold text-[#091426] leading-relaxed">{q.question}</p>
          <div className="space-y-2">
            {([['A', q.optionA], ['B', q.optionB], ['C', q.optionC], ['D', q.optionD]] as [QuizOption, string][]).map(([key, text]) => (
              <button
                key={key}
                onClick={() => setAnswers({ ...answers, [q.id]: key })}
                className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all ${
                  answers[q.id] === key
                    ? 'bg-[#091426] text-white border-[#091426]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <span className="font-bold mr-2">{key}.</span> {text}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {currentIdx > 0 && (
            <button onClick={() => setCurrentIdx(currentIdx - 1)} className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50">
              Önceki
            </button>
          )}
          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(currentIdx + 1)} className="flex-1 py-2.5 bg-[#091426] text-white rounded-xl text-xs font-bold hover:bg-[#1e293b]">
              Sonraki
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < questions.length}
              className="flex-1 py-2.5 bg-[#006c49] text-white rounded-xl text-xs font-bold hover:bg-[#005236] disabled:opacity-50"
            >
              Quizi Bitir ({answeredCount}/{questions.length})
            </button>
          )}
        </div>
      </div>
    );
  }

  // Result view
  if (selectedAssignment && submitted && result) {
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
        <button onClick={() => { setSelectedAssignment(null); setResult(null); setSubmitted(false); }} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#091426]">
          <ArrowLeft className="w-4 h-4" /> Quizlere Dön
        </button>

        <div className="bg-white rounded-3xl p-6 border border-[#e6e8ea] shadow-xs text-center space-y-4">
          <Trophy className={`w-16 h-16 mx-auto ${percent >= 50 ? 'text-amber-400' : 'text-slate-300'}`} />
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-[#091426]">{selectedAssignment.quizSetTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">Sonuçlar</p>
          </div>
          <div className="text-4xl font-extrabold font-['Plus_Jakarta_Sans'] text-[#091426]">
            %{percent}
          </div>
          <p className="text-sm text-slate-600">
            {result.score} / {result.total} doğru cevap
          </p>
          <div className="flex items-center justify-center gap-1">
            {percent >= 50 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-xs font-bold ${percent >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>
              {percent >= 50 ? 'Başarılı!' : 'Daha çok çalışmalısın!'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Assignment list view
  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#091426]">Quizlerim</h2>
      </div>

      {loading ? (
        <p className="text-center text-sm text-slate-400 py-8">Yükleniyor...</p>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 p-6">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Henüz quiz ödevi yok.</p>
          <p className="text-xs text-slate-400 mt-1">Öğretmenin quiz atadığında burada görünecek.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((qa) => (
            <button
              key={qa.id}
              onClick={() => startQuiz(qa)}
              className="w-full text-left bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs hover:border-slate-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#091426]">{qa.quizSetTitle}</h4>
                  <p className="text-[11px] text-slate-500">{qa.questionCount} soru • Son: {qa.dueDate}</p>
                </div>
                {qa.submitted ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                    {qa.score}/{qa.questionCount} ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                    Çözülmedi
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
