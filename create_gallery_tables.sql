-- Create Albums Table
create table albums (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  cover_url text,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Photos Table
create table photos (
  id uuid default uuid_generate_v4() primary key,
  album_id uuid references albums(id) on delete cascade not null,
  url text not null,
  type text check (type in ('image', 'video')) not null,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table albums enable row level security;
alter table photos enable row level security;

-- Policies (Public Read, Admin Write)
create policy "Public albums are viewable by everyone." on albums for select using (true);
create policy "Admins can insert albums." on albums for insert with check (auth.role() = 'authenticated');
create policy "Admins can update albums." on albums for update using (auth.role() = 'authenticated');
create policy "Admins can delete albums." on albums for delete using (auth.role() = 'authenticated');

create policy "Public photos are viewable by everyone." on photos for select using (true);
create policy "Admins can insert photos." on photos for insert with check (auth.role() = 'authenticated');
create policy "Admins can delete photos." on photos for delete using (auth.role() = 'authenticated');
