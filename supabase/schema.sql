-- Run in Supabase: SQL Editor -> New query -> paste -> Run

-- ========== PROFILES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'USER' check (role in ('USER','ADMIN')),
  profile_image text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce(public.my_role() = 'ADMIN', false) $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
create policy "read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
-- users cannot change their own role
create policy "update own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = public.my_role());

-- ========== CATEGORIES ==========
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  icon_name text not null,
  description text,
  color text,
  is_active boolean default true,
  sort_order int default 0
);
insert into public.categories (name, icon_name, description, color, sort_order) values
 ('Study','BookOpen','Quiet reading rooms, public libraries, & workspace cafes','bg-emerald-100 text-emerald-800 border-emerald-200',1),
 ('Food','Utensils','Affordable eateries, local dining, & quick bites','bg-amber-100 text-amber-800 border-amber-200',2),
 ('Wi-Fi','Wifi','High-speed public networks & work-friendly spots','bg-blue-100 text-blue-800 border-blue-200',3),
 ('Repair','Wrench','Affordable laptop, phone, & hardware repair services','bg-orange-100 text-orange-800 border-orange-200',4),
 ('Shopping','ShoppingBag','Thrift stores, stationery, & local grocery markets','bg-purple-100 text-purple-800 border-purple-200',5),
 ('Healthcare','HeartPulse','Community health clinics, pharmacies, & urgent care','bg-rose-100 text-rose-800 border-rose-200',6),
 ('Transport','Bus','Transit stops, shuttle hubs, & bike sharing stations','bg-indigo-100 text-indigo-800 border-indigo-200',7),
 ('Other','MapPin','Community spaces, public parks, & civic resources','bg-slate-100 text-slate-800 border-slate-200',8);
alter table public.categories enable row level security;
create policy "anyone reads categories" on public.categories for select using (true);
create policy "admin manages categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());

-- ========== LOCATIONS ==========
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  address text,
  latitude double precision not null,
  longitude double precision not null,
  google_maps_url text,
  image_urls text[] not null default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  created_by_name text,
  created_at timestamptz default now(),
  updated_at timestamptz,
  verification_status text not null default 'PENDING'
    check (verification_status in ('PENDING','APPROVED','REJECTED','NEEDS_CHANGES')),
  rejection_reason text,
  average_rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  is_active boolean not null default true,
  source text not null default 'user',      -- 'user' or 'osm'
  osm_id text unique
);
create index locations_geo_idx on public.locations (latitude, longitude);
create index locations_cat_idx on public.locations (category);

alter table public.locations enable row level security;
create policy "read approved, own, or admin" on public.locations for select
  using (verification_status = 'APPROVED' or created_by = auth.uid() or public.is_admin());
create policy "users submit pending" on public.locations for insert to authenticated
  with check (created_by = auth.uid() and verification_status = 'PENDING' and source = 'user');
create policy "owner edits and resubmits" on public.locations for update
  using (created_by = auth.uid() and verification_status in ('PENDING','NEEDS_CHANGES','REJECTED'))
  with check (created_by = auth.uid() and verification_status = 'PENDING');
create policy "admin all" on public.locations for all using (public.is_admin()) with check (public.is_admin());

-- ========== REVIEWS ==========
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null,
  user_photo text,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  updated_at timestamptz,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  rejection_reason text,
  is_reported boolean default false
);
create unique index one_active_review_per_user on public.reviews (location_id, user_id) where status <> 'REJECTED';

alter table public.reviews enable row level security;
create policy "read approved, own, or admin" on public.reviews for select
  using (status = 'APPROVED' or user_id = auth.uid() or public.is_admin());
create policy "users submit pending" on public.reviews for insert to authenticated
  with check (user_id = auth.uid() and status = 'PENDING');
create policy "admin updates" on public.reviews for update using (public.is_admin());
create policy "owner or admin deletes" on public.reviews for delete using (user_id = auth.uid() or public.is_admin());

-- Ratings are recalculated in the database from APPROVED reviews only
create or replace function public.recalc_location_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare lid uuid := coalesce(new.location_id, old.location_id);
begin
  update public.locations set
    average_rating = coalesce((select round(avg(rating)::numeric,1) from public.reviews where location_id = lid and status = 'APPROVED'), 0),
    review_count   = (select count(*) from public.reviews where location_id = lid and status = 'APPROVED')
  where id = lid;
  return null;
end $$;
create trigger reviews_recalc after insert or update or delete on public.reviews
  for each row execute function public.recalc_location_rating();

-- ========== SAVED PLACES ==========
create table public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, location_id)
);
alter table public.saved_places enable row level security;
create policy "own saved places" on public.saved_places for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ========== REPORTS ==========
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reported_by uuid references public.profiles(id) on delete set null,
  reported_by_name text,
  target_type text not null check (target_type in ('location','review')),
  target_id text not null,
  target_title text,
  reason text not null,
  description text,
  status text not null default 'OPEN' check (status in ('OPEN','REVIEWED','RESOLVED','DISMISSED')),
  created_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null
);
alter table public.reports enable row level security;
create policy "users file reports" on public.reports for insert to authenticated with check (reported_by = auth.uid());
create policy "read own or admin" on public.reports for select using (reported_by = auth.uid() or public.is_admin());
create policy "admin updates" on public.reports for update using (public.is_admin());

-- ========== IMAGE STORAGE ==========
insert into storage.buckets (id, name, public) values ('location-images','location-images', true) on conflict do nothing;
create policy "public reads images" on storage.objects for select using (bucket_id = 'location-images');
create policy "logged-in users upload images" on storage.objects for insert to authenticated with check (bucket_id = 'location-images');

-- ========== REALTIME (replaces PostgreSQL onSnapshot) ==========
alter publication supabase_realtime add table public.locations, public.reviews, public.reports, public.saved_places, public.categories;

-- ========== MAKE YOURSELF ADMIN (after you register in the app) ==========
-- update public.profiles set role = 'ADMIN' where email = 'your-email@example.com';
