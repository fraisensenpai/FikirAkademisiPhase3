-- ============================================================
-- FİKİR AKADEMİSİ - TAM VERİTABANI ŞEMASI
-- Supabase Dashboard > SQL Editor > Run yapın
-- ============================================================

-- Eski tabloları temizle
drop table if exists public.post_likes cascade;
drop table if exists public.club_members cascade;
drop table if exists public.posts cascade;
drop table if exists public.clubs cascade;
drop table if exists public.reading_progress cascade;
drop table if exists public.assignments cascade;
drop table if exists public.notes cascade;
drop table if exists public.students cascade;
drop table if exists public.books cascade;
drop table if exists public.profiles cascade;

-- ============================================================
-- 1. PROFILES (kullanıcı rolleri ve bilgileri)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher')),
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
  cover_url text not null,
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
  author_id uuid not null references auth.users(id) on delete cascade,
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
-- 7. CLUBS + MEMBERS (okuma kulüpleri)
-- ============================================================
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  cover_url text default '',
  created_at timestamptz not null default now()
);

create table public.club_members (
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.notes enable row level security;
alter table public.reading_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;

-- PROFILES: herkes görebilir (öğretmen listesi için), sadece kendini düzenleyebilir
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

-- BOOKS: giriş yapan herkes okuyabilir
create policy "books_select" on public.books for select to authenticated using (true);

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

-- CLUBS: okunabilir, üyelik kendi
create policy "clubs_select" on public.clubs for select to authenticated using (true);
create policy "members_select" on public.club_members for select to authenticated using (true);
create policy "members_insert_own" on public.club_members for insert to authenticated with check (auth.uid() = user_id);
create policy "members_delete_own" on public.club_members for delete to authenticated using (auth.uid() = user_id);

-- ============================================================
-- 9. BAŞLANGIÇ KİTAP VERİLERİ
-- ============================================================
insert into public.books (id, title, author, category, cover_url, total_pages, description, chapter_title, chapter_subtitle, illustration_url, quote, content, tags) values
('insan-neyle-yasar', 'İnsan Neyle Yaşar?', 'Lev Tolstoy', 'Klasikler', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80', 180, 'Yaşamın anlamını arayan bir adamın, basit bir çiftçi aracılığıyla bulduğu derin hikaye.', 'Bölüm 1', 'Yoldaşlar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80', '"İnsan sevgiyle yaşar, sevgi olmadan hayatı sürer, yaşamaz."', array['İnsanlar birbirlerinden nefret ederler, çünkü birbirlerinden korkarlar; birbirlerinden korkarlar, çünkü birbirlerini tanımazlar; birbirlerini tanımazlar, çünkü birbirleriyle temas etmezler.', 'Gerçek hayattan kaçmak için kitap okumak, hayatı anlamak için kitap okumaktan çok farklı bir şeydir.'], array['Felsefe', 'Yaşam', 'Klasik']),

('1984', '1984', 'George Orwell', 'Klasikler', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80', 352, 'Totaliter rejimlerin gözetleme toplumunu ve düşünce özgürlüğünün bastırılmasını anlatan kült distopya.', 'Kısım 1: Bölüm 1', 'Büyük Birader Seni İzliyor', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80', '"Geçmişi kontrol eden geleceği kontrol eder; bugünü kontrol eden geçmişi kontrol eder."', array['Hava açık ve soğuk bir nisan günüydü; saatler on üçü vuruyordu. Winston Smith, dondurucu rüzgardan kaçmak için çenesini göğsüne gömmüş, camlı kapıdan Hürriyet Apartmanları''na girdi.', 'Koridorun ucunda, her seferinde karşı tarafın duvarında asılı bir poster, Großen Auge''nun (Büyük Göz) gözleriyle takip ediyordu.', 'Winston, midesindeki o acı çeken boşluğu hissetti. Onun için geçmiş, kayıp bir cennetti.'], array['Distopya', 'Politika', 'Gözetleme']),

('sapiens', 'Sapiens: İnsan Türünün Kısa Tarihi', 'Yuval Noah Harari', 'Tarih', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80', 498, 'İnsan türünün avcı-toplayıcıdan günümüz teknoloji çağına uzanan macerasını anlatan devasa bir tarih öyküsü.', 'Bölüm 1', 'Bilişsel Devrim', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=800&auto=format&fit=crop&q=80', '"Biz hayal edebildiğimiz her şeyi yaratabiliriz."', array['Yaklaşık 70.000 yıl önce, Homo sapiens türü Bilişsel Devrim geçirdi. Bu devrim, hayal edebilme yeteneğini getirdi.', 'Hayal gücü, sapiens''in büyük gruplarda işbirliği yapmasını sağlayan tek şeydir. Dinler, uluslar, para, kanunlar hepsi "ortak hayaller"dir.'], array['Tarih', 'Antropoloji', 'Bilim']),

('donusum', 'Dönüşüm', 'Franz Kafka', 'Edebiyat', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', 128, 'Bir gecenin sabahı uyandığında dev bir böceğe dönüşmüş olan Gregor Samsa''nın trajik hikayesi.', 'Bölüm 1', 'Dönüşüm', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&auto=format&fit=crop&q=80', '"Ben bir böceğim, öyle bir böceğim ki..."', array['Bir sabah, Gregor Samsa huzursuz rüyalarından uyanınca, yatağında dev bir böceğe dönüşmüş olduğunu fark etti.', 'Sert, zırhlı sırtı ve karıncasına bacaklarıyla yatağının üzerinde yatıyordu.'], array['Varoluşçuluk', 'Aile', 'Absürd']),

('arch-happiness', 'The Architecture of Happiness', 'Alain de Botton', 'Felsefe', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 320, 'Binaların, mekanların ve mimarinin insan psikolojisi ve mutluluğu üzerindeki derin etkilerini inceleyen felsefi bir başyapıt.', 'Chapter 3', 'The Importance of Shelter', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80', '"We need our rooms to align us to desirable versions of ourselves."', array['It is an enduring human trait to seek spaces that reflect our aspirations. The buildings we inhabit are not merely physical shelters; they are psychological armatures.', 'Consider the difference between a cramped, poorly lit corridor and a sweeping, sunlit atrium. The former may induce anxiety, while the latter can inspire a sense of possibility.'], array['Mimarlık', 'Felsefe', 'Psikoloji']);

-- Örnek kulüpler
insert into public.clubs (name, description, cover_url) values
('Klasik Felsefe Atölyesi', 'Platon ve Sokrates diyaloglarını haftalık tartışıyoruz.', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&auto=format&fit=crop&q=80'),
('Distopya & Gelecek Toplumları', 'Orwell, Huxley ve Bradbury eserlerini mercek altına alıyoruz.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&auto=format&fit=crop&q=80');
