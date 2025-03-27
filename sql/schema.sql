-- Create Users Table
create table if not exists "public"."users" (
    "id" uuid references auth.users not null primary key,
    "user_index" text unique not null,
    "credits" integer not null default 0,
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

-- Remove old packages and insert new ones
truncate table "public"."packages";

-- Insert default packages with updated prices and credits
insert into "public"."packages" (name, price, credits, description, bought_by)
values
    ('STARTER PACK', 999.99, 699, 'Perfect for beginners', 0),
    ('ELITE PACK', 9999.99, 5999, 'For elite hackers', 0),
    ('MASTERCLASS PACK', 39999.99, 29999, 'Master-level capabilities', 0),
    ('HALL OF FAME', 99999.99, 69999, 'Legendary hacking power', 0),
    ('APERIORISTOS', 1999999.99, 9999999, 'Ultimate unlimited power', 0);
