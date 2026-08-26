import React, { useState } from 'react';
import { Screen, UserRole } from '../types';
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  ArrowRight,
  School,
  Eye,
  EyeOff,
  GraduationCap,
  BadgeCheck,
  Code2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthScreensProps {
  currentScreen: 'login' | 'student-register' | 'teacher-register' | 'developer-register';
  onNavigate: (screen: Screen) => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthScreens: React.FC<AuthScreensProps> = ({
  currentScreen,
  onNavigate,
  onLoginSuccess,
}) => {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Student register states
  const [studentName, setStudentName] = useState('');
  const [studentSurname, setStudentSurname] = useState('');
  const [studentGrade, setStudentGrade] = useState<'Hazırlık' | '9'>('Hazırlık');
  const [studentSection, setStudentSection] = useState('A');
  const [studentNumber, setStudentNumber] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Sınıf değerini birleştir (örn: "Hazırlık A" veya "9-B")
  const studentClass = studentGrade === 'Hazırlık' ? `Hazırlık ${studentSection}` : `9-${studentSection}`;

  // Teacher register states
  const [teacherName, setTeacherName] = useState('');
  const [teacherSurname, setTeacherSurname] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  // Developer register states
  const [devName, setDevName] = useState('');
  const [devSurname, setDevSurname] = useState('');
  const [devEmail, setDevEmail] = useState('');
  const [devPassword, setDevPassword] = useState('');
  const [devAccessCode, setDevAccessCode] = useState('');
  const [showDevPassword, setShowDevPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, role } = await signIn(loginEmail, loginPassword);
    if (error) {
      alert(
        error.message === 'Invalid login credentials'
          ? 'E-posta veya şifre hatalı.'
          : error.message
      );
    } else {
      onLoginSuccess(role || 'student');
    }
    setLoading(false);
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(studentEmail, studentPassword, 'student', {
      full_name: `${studentName} ${studentSurname}`.trim(),
      class_grade: studentClass,
      school_number: studentNumber,
    });
    if (error) {
      alert(error.message.includes('already registered')
        ? 'Bu e-posta ile bir hesap zaten mevcut.'
        : error.message);
    } else {
      alert('Kayıt başarılı! Lütfen giriş yapın.');
      onNavigate('login');
    }
    setLoading(false);
  };

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(teacherEmail, teacherPassword, 'teacher', {
      full_name: `${teacherName} ${teacherSurname}`.trim(),
    });
    if (error) {
      alert(error.message.includes('already registered')
        ? 'Bu e-posta ile bir hesap zaten mevcut.'
        : error.message);
    } else {
      alert('Kayıt başarılı! Lütfen giriş yapın.');
      onNavigate('login');
    }
    setLoading(false);
  };

  const handleDeveloperRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const expectedCode = import.meta.env.VITE_DEVELOPER_ACCESS_CODE as string | undefined;
    if (!expectedCode || devAccessCode !== expectedCode) {
      alert('Geliştirici kodu hatalı. Kayıt yapılamaz.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(devEmail, devPassword, 'developer', {
      full_name: `${devName} ${devSurname}`.trim(),
    });
    if (error) {
      alert(error.message.includes('already registered')
        ? 'Bu e-posta ile bir hesap zaten mevcut.'
        : error.message);
    } else {
      alert('Geliştirici kaydı başarılı! Lütfen giriş yapın.');
      onNavigate('login');
    }
    setLoading(false);
  };

  // 1. TEACHER REGISTRATION SCREEN
  if (currentScreen === 'teacher-register') {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col md:flex-row antialiased">
        {/* Left Section: Visual & Branding */}
        <div className="md:w-5/12 lg:w-1/2 p-6 md:p-10 flex flex-col justify-between">
          <div>
            <button
              onClick={() => onNavigate('login')}
              className="flex items-center gap-2 text-slate-600 hover:text-[#091426] transition-colors w-fit mb-6 group text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Login</span>
            </button>

            <div className="space-y-2 max-w-md">
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl md:text-4xl font-extrabold text-[#091426] tracking-tight">
                Fikir Akademisi
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Empowering educators with a structured, minimalist approach to academic excellence.
              </p>
            </div>
          </div>

          {/* Bento Box Graphic with Educator Portal banner */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-64 md:h-80 relative bg-white my-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr5fRzyAwYFlSZnMavNCKQ6cSeItyioWnjBIcjJgPAlpY0ZAhvYG0Vw9mQbp5h2PyOzkYNWempq5jqgp3Q3hn7KK1jhingOixiHqu8hMV9bz920kZ8yDETjA-BKQgJV5j8Vp37nJLBZD_V05DckiPFqAe-JoAHYBjGT4nl4hAtHU1P_MEAov-MX2NXBg9akxO7dctbioPmylL9oE4Yw0V4AYjmvDKa5CHvjoUPSpZ8K5PbsqZK8z8BtQ"
              alt="University library setting"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#091426]/85 via-[#091426]/30 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center backdrop-blur-xs">
                <GraduationCap className="w-5 h-5 text-[#6ffbbe]" />
              </div>
              <p className="font-['Plus_Jakarta_Sans'] text-lg font-bold">Educator Portal</p>
            </div>
          </div>

          <p className="text-xs text-slate-400">© 2026 Fikir Akademisi. All rights reserved.</p>
        </div>

        {/* Right Section: Registration Form */}
        <div className="md:w-7/12 lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white shadow-xl">
          <div className="w-full max-w-md space-y-6">
            <div className="text-left space-y-1">
              <h2 className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#091426]">
                Teacher Registration
              </h2>
              <p className="text-xs text-slate-500">
                Enter your details to create your academic account.
              </p>
            </div>

            <form onSubmit={handleTeacherRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="John"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Surname</label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={teacherSurname}
                    onChange={(e) => setTeacherSurname(e.target.value)}
                    placeholder="Doe"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="john.doe@university.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl font-['Plus_Jakarta_Sans'] font-bold text-xs text-white bg-[#091426] hover:bg-[#1e293b] transition-all shadow-xs"
              >
                Register Account
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="font-bold text-[#006c49] hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. STUDENT REGISTRATION SCREEN
  if (currentScreen === 'student-register') {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4 sm:p-6 antialiased">
        <main className="w-full max-w-md my-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center">
            <button
              onClick={() => onNavigate('login')}
              className="self-start mb-4 text-slate-500 hover:text-[#091426] transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Login</span>
            </button>

            <div className="w-16 h-16 rounded-2xl bg-[#e6e8ea] flex items-center justify-center mb-4 shadow-xs">
              <School className="w-8 h-8 text-[#091426]" />
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-[#091426] mb-1">
              Student Registration
            </h1>
            <p className="text-xs text-slate-500 max-w-xs">
              Create your Fikir Akademisi account to access your digital library and courses.
            </p>
          </div>

          {/* Registration Form Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
            <form onSubmit={handleStudentRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="John"
                    className="w-full px-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Surname
                  </label>
                  <input
                    type="text"
                    required
                    value={studentSurname}
                    onChange={(e) => setStudentSurname(e.target.value)}
                    placeholder="Doe"
                    className="w-full px-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Kademe
                  </label>
                  <select
                    value={studentGrade}
                    onChange={(e) => setStudentGrade(e.target.value as 'Hazırlık' | '9')}
                    className="w-full px-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none cursor-pointer"
                  >
                    <option value="Hazırlık">Hazırlık</option>
                    <option value="9">9. Sınıf</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Şube
                  </label>
                  <select
                    value={studentSection}
                    onChange={(e) => setStudentSection(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none cursor-pointer"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                  Okul Numarası
                </label>
                <input
                  type="text"
                  required
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="12345"
                  className="w-full px-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="student@school.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#091426] hover:bg-[#1e293b] text-white rounded-full py-3 px-6 font-['Plus_Jakarta_Sans'] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Register</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#091426] font-bold hover:underline"
                >
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 3. DEVELOPER REGISTRATION SCREEN
  if (currentScreen === 'developer-register') {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4 sm:p-6 antialiased">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden animate-in fade-in zoom-in-95">
          <div className="px-6 pt-10 pb-6 text-center border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-[#091426] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Code2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#091426] mb-1">
              Geliştirici Kaydı
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Kitap yükleme yetkisine sahip geliştirici hesabı oluşturun.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleDeveloperRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ad</label>
                  <input
                    type="text"
                    required
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    placeholder="Ad"
                    className="w-full px-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Soyad</label>
                  <input
                    type="text"
                    required
                    value={devSurname}
                    onChange={(e) => setDevSurname(e.target.value)}
                    placeholder="Soyad"
                    className="w-full px-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">E-posta</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                    placeholder="dev@fikirakademisi.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showDevPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDevPassword(!showDevPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showDevPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Geliştirici Kodu
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showDevPassword ? 'text' : 'password'}
                    required
                    value={devAccessCode}
                    onChange={(e) => setDevAccessCode(e.target.value)}
                    placeholder="Gizli kod"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#f7f9fb] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-['Plus_Jakarta_Sans'] font-bold text-xs text-white bg-[#091426] hover:bg-[#1e293b] transition-all shadow-xs disabled:opacity-50"
              >
                Geliştirici Hesabı Oluştur
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-xs text-slate-500 hover:text-[#091426] font-semibold"
                >
                  Zaten hesabın var mı? Giriş yap
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 4. LOGIN SCREEN (Default)
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header / Branding */}
        <div className="px-6 pt-10 pb-6 text-center border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-[#091426] text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <School className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-[#091426] mb-1">
            Fikir Akademisi
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Welcome back to your academic journey.
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="student@fikir.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#091426] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#091426] focus:outline-none transition-colors"
                />
              </div>
              <div className="flex justify-end mt-1.5">
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
                  }}
                  className="text-[11px] font-semibold text-[#006c49] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 rounded-xl font-['Plus_Jakarta_Sans'] font-bold text-xs text-white bg-[#091426] hover:bg-[#1e293b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#091426] transition-all shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Registration Options */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Yeni mısın?{' '}
              <button
                onClick={() => onNavigate('student-register')}
                className="font-['Plus_Jakarta_Sans'] font-bold text-[#006c49] hover:underline"
              >
                Öğrenci Kaydı
              </button>
              {' • '}
              <button
                onClick={() => onNavigate('teacher-register')}
                className="font-['Plus_Jakarta_Sans'] font-bold text-[#091426] hover:underline"
              >
                Öğretmen Kaydı
              </button>
            </p>
            <button
              onClick={() => onNavigate('developer-register')}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold"
            >
              Geliştirici Kaydı (Kitap Yükleme)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
