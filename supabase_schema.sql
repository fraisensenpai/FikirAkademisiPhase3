-- ============================================================
-- FİKİR AKADEMİSİ - TAM VERİTABANI ŞEMASI
-- Supabase Dashboard > SQL Editor > Run yapın
-- ============================================================

-- Eski tabloları temizle
drop table if exists public.post_likes cascade;
drop table if exists public.posts cascade;
drop table if exists public.clubs cascade;
drop table if exists public.club_members cascade;
drop table if exists public.reading_progress cascade;
drop table if exists public.assignments cascade;
drop table if exists public.notes cascade;
drop table if exists public.students cascade;
drop table if exists public.books cascade;
drop table if exists public.profiles cascade;
drop table if exists public.question_answers cascade;
drop table if exists public.book_questions cascade;

-- Eski trigger ve fonksiyonu temizle (auth.users üzerinde kalıcıdır)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ============================================================
-- 1. PROFILES (kullanıcı rolleri ve bilgileri)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher', 'developer')),
  full_name text,
  class_grade text,
  school_number text,
  created_at timestamptz not null default now()
);

-- Kayıt olunca otomatik profil oluştur (user_metadata'dan)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, class_grade, school_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'class_grade',
    new.raw_user_meta_data->>'school_number'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. BOOKS
-- ============================================================
create table public.books (
  id text primary key,
  title text not null,
  author text not null,
  category text not null check (category in ('Klasikler', 'Bilim', 'Tarih', 'Felsefe', 'Psikoloji', 'Edebiyat')),
  cover_url text not null default '',
  total_pages integer not null default 0,
  description text default '',
  chapter_title text,
  chapter_subtitle text,
  illustration_url text,
  quote text,
  content text[] default '{}',
  tags text[] default '{}',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. NOTES (öğrenci okuma notları)
-- ============================================================
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  page integer not null default 1,
  highlighted_text text default '',
  user_note text not null,
  created_at timestamptz not null default now()
);

create index notes_user_idx on public.notes(user_id);
create index notes_book_idx on public.notes(book_id);

-- ============================================================
-- 4. READING_PROGRESS (okuma ilerlemesi - öğretmen denetimi buradan)
-- ============================================================
create table public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  last_page integer not null default 0,
  -- Aktif okuma süresi (saniye). Sekme görünürken sayılır -> "kitabı açık bırak" hilesine karşı
  seconds_read integer not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id, book_id)
);

create index progress_user_idx on public.reading_progress(user_id);
create index progress_book_idx on public.reading_progress(book_id);

-- ============================================================
-- 5. ASSIGNMENTS (öğretmen ödevleri)
-- ============================================================
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  book_id text not null references public.books(id) on delete cascade,
  target_class text not null,
  due_date date not null,
  instructions text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index assignments_class_idx on public.assignments(target_class);

-- ============================================================
-- 6. POSTS + LIKES (sosyal akış)
-- ============================================================
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  -- profiles'e bağlı olmalı ki Supabase join'i (profiles(full_name)) çalışsın
  author_id uuid not null references public.profiles(id) on delete cascade,
  book_id text references public.books(id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (post_id, user_id)
);

-- ============================================================
-- 6. BOOK_QUESTIONS + ANSWERS (geliştiricinin eklediği soru noktaları)
-- ============================================================
create table public.book_questions (
  id uuid primary key default gen_random_uuid(),
  book_id text not null references public.books(id) on delete cascade,
  -- Öğrenci bu sayfayı bitirince soru çıkar
  page integer not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option char(1) not null check (correct_option in ('A', 'B', 'C', 'D')),
  created_at timestamptz not null default now()
);

create index book_questions_book_idx on public.book_questions(book_id);

create table public.question_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.book_questions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  selected_option char(1) not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique(question_id, user_id)
);

create index question_answers_user_idx on public.question_answers(user_id);

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.notes enable row level security;
alter table public.reading_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.book_questions enable row level security;
alter table public.question_answers enable row level security;

-- PROFILES: herkes görebilir (öğretmen listesi için), sadece kendini düzenleyebilir
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

-- BOOKS: giriş yapan herkes okuyabilir; kitap ekleme/silme sadece geliştiricide
create policy "books_select" on public.books for select to authenticated using (true);
create policy "books_insert_developer" on public.books for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);
create policy "books_update_developer" on public.books for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);
create policy "books_delete_developer" on public.books for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);

-- NOTES: kullanıcı sadece kendi notları
create policy "notes_select_own" on public.notes for select to authenticated using (auth.uid() = user_id);
create policy "notes_insert_own" on public.notes for insert to authenticated with check (auth.uid() = user_id);
create policy "notes_delete_own" on public.notes for delete to authenticated using (auth.uid() = user_id);
create policy "notes_update_own" on public.notes for update to authenticated using (auth.uid() = user_id);

-- READING_PROGRESS: kullanıcı kendi ilerlemesi; öğretmenler tümünü okuyabilir
create policy "progress_select_own" on public.reading_progress for select to authenticated using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);
create policy "progress_insert_own" on public.reading_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "progress_update_own" on public.reading_progress for update to authenticated using (auth.uid() = user_id);

-- ASSIGNMENTS: herkes görebilir, sadece öğretmen ekleyebilir/silebilir
create policy "assignments_select" on public.assignments for select to authenticated using (true);
create policy "assignments_insert_teacher" on public.assignments for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);
create policy "assignments_delete_teacher" on public.assignments for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);

-- POSTS: herkes görebilir, giriş yapan paylaşabilir, kendi gönderisini silebilir
create policy "posts_select" on public.posts for select to authenticated using (true);
create policy "posts_insert" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "posts_delete_own" on public.posts for delete to authenticated using (auth.uid() = author_id);

-- POST_LIKES: herkes görebilir, kendi beğenisini yönetir
create policy "likes_select" on public.post_likes for select to authenticated using (true);
create policy "likes_insert_own" on public.post_likes for insert to authenticated with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.post_likes for delete to authenticated using (auth.uid() = user_id);

-- BOOK_QUESTIONS: herkes görebilir, sadece geliştirici yönetir
create policy "questions_select" on public.book_questions for select to authenticated using (true);
create policy "questions_insert_developer" on public.book_questions for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);
create policy "questions_delete_developer" on public.book_questions for delete to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'developer')
);

-- QUESTION_ANSWERS: öğrenci kendi cevabını görür/yazar, öğretmen hepsini görür
create policy "answers_select" on public.question_answers for select to authenticated using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('teacher', 'developer'))
);
create policy "answers_insert_own" on public.question_answers for insert to authenticated with check (auth.uid() = user_id);

-- ============================================================
-- 8. BOOK_REVIEWS (kitap bitirme yorumları - sadece öğretmen görür)
-- ============================================================
create table public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text not null default '',
  created_at timestamptz not null default now(),
  unique(user_id, book_id)
);

create index reviews_book_idx on public.book_reviews(book_id);
create index reviews_user_idx on public.book_reviews(user_id);

alter table public.book_reviews enable row level security;

-- Öğrenci kendi yorumunu yazabilir/güncelleyebilir; öğretmen hepsini okuyabilir
create policy "reviews_select" on public.book_reviews for select to authenticated using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);
create policy "reviews_insert_own" on public.book_reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "reviews_update_own" on public.book_reviews for update to authenticated using (auth.uid() = user_id);

-- ============================================================
-- 9. BOOK_TRANSFER_REQUESTS (kitap aktarım talepleri)
-- ============================================================
create table public.book_transfer_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null references public.books(id) on delete cascade,
  read_pages integer[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index transfer_requests_user_idx on public.book_transfer_requests(user_id);
create index transfer_requests_status_idx on public.book_transfer_requests(status);

alter table public.book_transfer_requests enable row level security;

-- Öğrenci kendi taleplerini görebilir/oluşturabilir; öğretmen hepsini görebilir/onaylayabilir
create policy "transfer_select" on public.book_transfer_requests for select to authenticated using (
  auth.uid() = user_id
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);
create policy "transfer_insert_student" on public.book_transfer_requests for insert to authenticated with check (
  auth.uid() = user_id
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
);
create policy "transfer_update_teacher" on public.book_transfer_requests for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
);
