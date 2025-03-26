-- Create Users Table
create table if not exists "public"."users" (
    "id" uuid references auth.users not null primary key,
    "user_index" text unique not null,
    "credits" integer not null default 100,
    "funds" decimal(10,2) not null default 0,
    "created_at" timestamp with time zone default now() not null
);

-- Create Hacked Accounts Table
create table if not exists "public"."hacked_accounts" (
    "id" uuid default gen_random_uuid() primary key,
    "user_id" uuid references public.users not null,
    "account_name" text not null,
    "account_email" text not null,
    "account_password" text not null,
    "account_type" text not null,
    "execute_method" text not null,
    "date_executed" timestamp with time zone default now() not null,
    "credits_used" integer not null,
    "created_at" timestamp with time zone default now() not null
);

-- Create Account Storage Table
create table if not exists "public"."account_storage" (
    "id" uuid default gen_random_uuid() primary key,
    "user_id" uuid references public.users not null,
    "name" text not null,
    "username" text not null,
    "password" text not null,
    "notes" text,
    "created_at" timestamp with time zone default now() not null,
    "updated_at" timestamp with time zone default now() not null
);

-- Create Packages Table
create table if not exists "public"."packages" (
    "id" uuid default gen_random_uuid() primary key,
    "name" text not null,
    "price" decimal(10,2) not null,
    "credits" integer not null,
    "description" text,
    "bought_by" integer not null default 0,
    "is_unlimited" boolean not null default false,
    "duration_months" integer,
    "created_at" timestamp with time zone default now() not null
);

-- Enable RLS (Row Level Security)
alter table if exists "public"."users" enable row level security;
alter table if exists "public"."hacked_accounts" enable row level security;
alter table if exists "public"."account_storage" enable row level security;
alter table if exists "public"."packages" enable row level security;

-- RLS Policies for Users
create policy "Users can view their own data"
    on "public"."users"
    for select
    using (auth.uid() = id);

create policy "Users can update their own data"
    on "public"."users"
    for update
    using (auth.uid() = id);

-- RLS Policies for Hacked Accounts
create policy "Users can view their own hacked accounts"
    on "public"."hacked_accounts"
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own hacked accounts"
    on "public"."hacked_accounts"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can delete their own hacked accounts"
    on "public"."hacked_accounts"
    for delete
    using (auth.uid() = user_id);

-- RLS Policies for Account Storage
create policy "Users can view their own stored accounts"
    on "public"."account_storage"
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own stored accounts"
    on "public"."account_storage"
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own stored accounts"
    on "public"."account_storage"
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own stored accounts"
    on "public"."account_storage"
    for delete
    using (auth.uid() = user_id);

-- RLS Policies for Packages
create policy "Anyone can view packages"
    on "public"."packages"
    for select
    to authenticated
    using (true);

-- Auto-user creation function and trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, user_index, credits, funds)
  values (new.id, split_part(new.email, '@', 1), 100, 0);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert default packages
insert into "public"."packages" (name, price, credits, description, bought_by, is_unlimited, duration_months)
values
    ('STARTER PACK', 899, 200, 'Perfect for beginners', 272329, false, null),
    ('PRO PACK', 1799, 450, 'For serious hackers', 429723, false, null),
    ('EVIL PACK', 2599, 650, 'Advanced hacking capabilities', 34658, false, null),
    ('HALL OF FAME PACK', 5999, 0, 'Unlimited credits for 12 months', 5302, true, 12);
