import React, { useState } from 'react';
import { Book } from '../types';
import { Users, MessageSquare, Heart, Share2, Sparkles, BookOpen, Send } from 'lucide-react';

interface SocialViewProps {
  onSelectBook: (book: Book) => void;
  books: Book[];
}

export const SocialView: React.FC<SocialViewProps> = ({ onSelectBook, books }) => {
  const [activeTab, setActiveTab] = useState<'discussions' | 'clubs'>('discussions');
  const [newPostText, setNewPostText] = useState('');

  const [posts, setPosts] = useState([
    {
      id: 'p1',
      author: 'Ayşe Yılmaz',
      authorAvatar: 'https://ui-avatars.com/api/?name=Ayşe+Yılmaz&background=random',
      time: '25 dk önce',
      bookTitle: '1984',
      bookId: '1984',
      content: '1984 kitabının 1. kısmını az önce bitirdim. "Geçmişi kontrol eden geleceği kontrol eder" sözü günümüz dijital çağındaki algoritma manipülasyonlarına o kadar benziyor ki...',
      likes: 14,
      liked: false,
      commentsCount: 5,
    },
    {
      id: 'p2',
      author: 'Zeynep Demir',
      authorAvatar: 'https://ui-avatars.com/api/?name=Zeynep+Demir&background=random',
      time: '2 saat önce',
      bookTitle: 'The Architecture of Happiness',
      bookId: 'arch-happiness',
      content: 'Mekanın ruh hali üzerindeki etkisini anlatan 3. bölüm çok aydınlatıcıydı. Kütüphanedeki çalışma masamın düzenini değiştirdim ve odaklanma sürem gerçekten iki katına çıktı! 🏛️',
      likes: 22,
      liked: true,
      commentsCount: 8,
    },
  ]);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            likes: p.liked ? p.likes - 1 : p.likes + 1,
            liked: !p.liked,
          };
        }
        return p;
      })
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: 'p-' + Date.now(),
      author: 'Kullanıcı',
      authorAvatar: 'https://ui-avatars.com/api/?name=Kullanıcı&background=091426&color=fff',
      time: 'Az önce',
      bookTitle: 'İnsan Neyle Yaşar?',
      bookId: 'insan-neyle-yasar',
      content: newPostText,
      likes: 1,
      liked: true,
      commentsCount: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Top Toggle */}
      <div className="bg-[#eceef0] p-1 rounded-xl grid grid-cols-2 gap-1 text-center font-['Plus_Jakarta_Sans'] font-semibold text-sm">
        <button
          onClick={() => setActiveTab('discussions')}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'discussions'
              ? 'bg-white text-[#091426] shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Akademik Akış
        </button>
        <button
          onClick={() => setActiveTab('clubs')}
          className={`py-2 rounded-lg transition-all ${
            activeTab === 'clubs'
              ? 'bg-white text-[#091426] shadow-xs font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Okuma Kulüpleri
        </button>
      </div>

      {activeTab === 'discussions' ? (
        <>
          {/* Create Post Card */}
          <form onSubmit={handleCreatePost} className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-3">
            <div className="flex gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Defne"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Okuduğun kitaptan bir alıntı veya düşünceni sınıfınla paylaş..."
                rows={2}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none resize-none"
              ></textarea>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-slate-400">10-A Sınıfı ile paylaşılır</span>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#091426] hover:bg-[#1e293b] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Paylaş</span>
              </button>
            </div>
          </form>

          {/* Posts Feed */}
          <div className="space-y-3">
            {posts.map((post) => {
              const matchedBook = books.find((b) => b.id === post.bookId);
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.authorAvatar}
                        alt={post.author}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-[#091426]">
                          {post.author}
                        </h4>
                        <span className="text-[10px] text-slate-400">{post.time}</span>
                      </div>
                    </div>

                    {matchedBook && (
                      <button
                        onClick={() => onSelectBook(matchedBook)}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{post.bookTitle}</span>
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.liked ? 'text-red-500 font-bold' : 'hover:text-slate-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? 'fill-red-500' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.commentsCount} yorum</span>
                    </div>

                    <button
                      onClick={() => alert('Paylaşım bağlantısı panoya kopyalandı!')}
                      className="hover:text-slate-800"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Okuma Kulüpleri Tab */
        <div className="space-y-3">
          {[
            {
              name: 'Klasik Felsefe Atölyesi',
              desc: 'Platon ve Sokrates diyaloglarını haftalık tartışıyoruz.',
              members: 24,
              currentBook: 'Devlet',
              cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&auto=format&fit=crop&q=80',
            },
            {
              name: 'Distopya & Gelecek Toplumları',
              desc: 'Orwell, Huxley ve Bradbury eserlerini mercek altına alıyoruz.',
              members: 38,
              currentBook: '1984',
              cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&auto=format&fit=crop&q=80',
            },
          ].map((club, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs flex gap-3.5">
              <div className="w-16 h-20 rounded-xl overflow-hidden shadow-xs border border-slate-200 shrink-0">
                <img src={club.cover} alt={club.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-[#091426]">
                    {club.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{club.desc}</p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-slate-400">{club.members} Üye</span>
                  <button
                    onClick={() => alert(`"${club.name}" kulübüne katıldınız!`)}
                    className="px-3 py-1 bg-[#091426] text-white rounded-lg text-xs font-semibold hover:bg-[#1e293b]"
                  >
                    Katıl
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
