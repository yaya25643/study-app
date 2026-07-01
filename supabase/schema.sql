-- 学習管理アプリ DBスキーマ(単一ユーザー想定・ログイン無し)

create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table study_records (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete set null,
  duration_min integer not null check (duration_min > 0),
  studied_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  deadline date,
  reminder_time time,
  created_at timestamptz not null default now()
);

create index study_records_studied_at_idx on study_records(studied_at);

-- 単一ユーザー想定・ログイン無しのため、anon keyからの読み書きを許可する
alter table courses disable row level security;
alter table study_records disable row level security;
alter table goals disable row level security;
