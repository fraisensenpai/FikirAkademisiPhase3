import React, { useState, useEffect, useCallback } from 'react';
import { Book, Post } from '../types';
import { MessageSquare, Heart, Share2, BookOpen, Send } from 'lucide-react';
import { fetchPosts, createPost, togglePostLike } from '../lib/dataService';
import { useToast } from './Toast';

interface SocialViewProps {
  onSelectBook: (book: string) => void;
  books: Book[];
  userId: string;
}

export const SocialView: React.FC<SocialViewProps> = ({ onSelectBook, books, userId }) => {
  const { showToast } = useToast();
  const [newPostText, setNewPostText] = useState('');
  const [selectedPostBook, setSelectedPostBook] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadPosts = useCallback(async () => {
    const fetched = await fetchPosts(userId);
    setPosts(fetched);
    setLoadingPosts(false);
  }, [userId]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLike = async (post: Post) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likedByMe: !p.likedByMe, likesCount: p.likesCount + (p.likedByMe ? -1 : 1) }
          : p
      )
    );
    await togglePostLike(post.id, userId, post.likedByMe);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() || posting) return;

    setPosting(true);
    const bookId = selectedPostBook || null;
    const success = await createPost(userId, newPostText.trim(), bookId);
    if (success) {
      setNewPostText('');
      setSelectedPostBook('');
      await loadPosts();
    }
    setPosting(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-4 pb-28 space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#091426]">
          Akademik Akış
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Okuduğun kitaptan alıntılar ve düşüncelerini sınıf arkadaşlarınla paylaş.
        </p>
      </div>

      {/* Create Post Card */}
      <form onSubmit={handleCreatePost} className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-3">
        <textarea
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="Okuduğun kitaptan bir alıntı veya düşünceni sınıfınla paylaş..."
          rows={2}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#091426] focus:outline-none resize-none"
        ></textarea>

        <select
          value={selectedPostBook}
          onChange={(e) => setSelectedPostBook(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-semibold text-slate-700 cursor-pointer"
        >
          <option value="">Kitap bağlantısı yok (isteğe bağlı)</option>
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>

        <div className="flex justify-end items-center pt-1">
          <button
            type="submit"
            disabled={posting}
            className="px-4 py-1.5 bg-[#091426] hover:bg-[#1e293b] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{posting ? 'Paylaşılıyor...' : 'Paylaş'}</span>
          </button>
        </div>
      </form>

      {/* Posts Feed */}
      <div className="space-y-3">
        {loadingPosts && (
          <p className="text-center text-xs text-slate-400 py-6">Gönderiler yükleniyor...</p>
        )}

        {!loadingPosts && posts.length === 0 && (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 p-6">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Henüz paylaşım yok.</p>
            <p className="text-xs text-slate-400 mt-1">İlk gönderiyi sen paylaş!</p>
          </div>
        )}

        {posts.map((post) => {
          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl p-4 border border-[#e6e8ea] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#091426] text-white flex items-center justify-center font-bold text-sm">
                    {post.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-[#091426]">
                      {post.authorName}
                    </h4>
                    <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                  </div>
                </div>

                {post.bookId && (
                  <button
                    onClick={() => onSelectBook(post.bookId!)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{post.bookTitle}</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={() => handleLike(post)}
                  className={`flex items-center gap-1.5 transition-colors ${
                    post.likedByMe ? 'text-red-500 font-bold' : 'hover:text-slate-800'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-red-500' : ''}`} />
                  <span>{post.likesCount}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount} yorum</span>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`${window.location.origin}/?post=${post.id}`);
                    showToast('Paylaşım bağlantısı panoya kopyalandı!', 'success');
                  }}
                  className="hover:text-slate-800"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
