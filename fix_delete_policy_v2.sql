-- PASTIKAN TABEL PROFILES PUNYA RLS AKTIF
alter table profiles enable row level security;

-- HAPUS POLICY LAMA (Supaya tidak bentrok)
drop policy if exists "Admins can delete profiles data" on profiles;
drop policy if exists "Enable delete for users" on profiles;
drop policy if exists "Users can delete their own profile" on profiles;
drop policy if exists "delete_policy" on profiles;

-- BUAT POLICY BARU (IZINKAN SEMUA USER LOGIN UNTUK HAPUS)
create policy "Allow Delete for Authenticated" on profiles
for delete using (auth.role() = 'authenticated');

-- PASTIKAN JUGA BISA SELECT (Supaya list muncul)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles
for select using (true);
