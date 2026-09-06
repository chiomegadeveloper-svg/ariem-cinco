-- Ariem Cinco website database, owner dashboard, RFQ inbox, and article images
create extension if not exists pgcrypto;

create table if not exists public.owner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('portfolio','foundation','topics','highlights','projects')),
  title text not null check (char_length(title) between 2 and 160),
  excerpt text not null default '' check (char_length(excerpt) <= 360),
  body text not null default '',
  image_url text,
  image_path text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists content_entries_section_title_key
  on public.content_entries(section,title);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  organization text,
  event_type text,
  preferred_date date,
  audience_size integer,
  message text not null,
  status text not null default 'new' check(status in('new','contacted','confirmed','closed')),
  created_at timestamptz not null default now()
);

create or replace function public.is_ariem_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt()->>'email','')) = 'mr.fivetheteacher@gmail.com'
    and exists(select 1 from public.owner_profiles where user_id=auth.uid());
$$;

alter table public.owner_profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.content_entries enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Owner can read own profile" on public.owner_profiles;
create policy "Owner can read own profile" on public.owner_profiles for select using (user_id=auth.uid());
drop policy if exists "Public can read settings" on public.site_settings;
create policy "Public can read settings" on public.site_settings for select using (true);
drop policy if exists "Owner can manage settings" on public.site_settings;
create policy "Owner can manage settings" on public.site_settings for all using (public.is_ariem_owner()) with check (public.is_ariem_owner());
drop policy if exists "Public can read published entries" on public.content_entries;
create policy "Public can read published entries" on public.content_entries for select using (published or public.is_ariem_owner());
drop policy if exists "Owner can manage entries" on public.content_entries;
create policy "Owner can manage entries" on public.content_entries for all using (public.is_ariem_owner()) with check (public.is_ariem_owner());
drop policy if exists "Public can send inquiries" on public.inquiries;
create policy "Public can send inquiries" on public.inquiries for insert with check (char_length(name) between 2 and 120 and char_length(email) between 5 and 240 and char_length(message) between 5 and 4000);
drop policy if exists "Owner can manage inquiries" on public.inquiries;
create policy "Owner can manage inquiries" on public.inquiries for all using (public.is_ariem_owner()) with check (public.is_ariem_owner());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('article-images','article-images',true,2097152,array['image/webp'])
on conflict(id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/webp'];

drop policy if exists "Public can view article images" on storage.objects;
create policy "Public can view article images" on storage.objects for select using (bucket_id='article-images');
drop policy if exists "Owner can upload article images" on storage.objects;
create policy "Owner can upload article images" on storage.objects for insert with check (bucket_id='article-images' and public.is_ariem_owner());
drop policy if exists "Owner can update article images" on storage.objects;
create policy "Owner can update article images" on storage.objects for update using (bucket_id='article-images' and public.is_ariem_owner());
drop policy if exists "Owner can delete article images" on storage.objects;
create policy "Owner can delete article images" on storage.objects for delete using (bucket_id='article-images' and public.is_ariem_owner());

insert into public.site_settings(key,value) values
('headline','Communication That Moves People.'),
('intro','Helping leaders, educators, and organizations communicate with clarity, confidence, and purpose.'),
('booking_url',''),
('portfolio_heading','Messages designed to create movement.'),
('portfolio_intro','Ariem works with institutions, leaders, and learning communities to shape communication that is human, strategic, and memorable.'),
('foundation_heading','Clarity first. Purpose always.'),
('foundation_intro','Every engagement begins with the audience, the outcome, and the message that connects them.'),
('topics_heading','Practical ideas, delivered with impact.'),
('topics_intro','Practical frameworks and memorable insights tailored to each audience.'),
('highlights_heading','Built for the room, remembered beyond it.'),
('highlights_intro','Communication that creates clarity, confidence, and forward movement.'),
('projects_heading','Talks, workshops, and communication programs.'),
('projects_intro','Custom-built sessions for conferences, leadership teams, schools, and institutional events.'),
('contact_heading','Start a meaningful conversation.'),
('contact_intro','For speaking engagements, partnerships, and institutional programs, send an inquiry and the team will respond.'),
('contact_card_title','Speaking engagements'),
('schedule_heading','Let’s plan an engagement that fits your audience.'),
('schedule_intro','Tell us about your event and preferred schedule through the RFQ form.'),
('schedule_card_title','Request a schedule'),
('schedule_card_text','The team will review your preferred date and confirm availability.')
on conflict(key) do nothing;

insert into public.site_settings(key,value) values ('contact_email','mr.fivetheteacher@gmail.com')
on conflict(key) do update set value=excluded.value,updated_at=now();

insert into public.content_entries(section,title,excerpt,body,sort_order) values
('foundation','Listen','Understand the people, context, and real communication challenge.','Strong communication begins with listening. Ariem helps audiences recognize context, understand people, and identify the real challenge before shaping a message.',1),
('foundation','Shape','Build a clear message, useful structure, and credible point of view.','Ideas become more powerful when they are organized with purpose. This foundation focuses on clarity, useful structure, and a credible point of view.',2),
('foundation','Move','Deliver with confidence and create a meaningful next action.','Communication should lead somewhere. Ariem equips people to deliver with confidence and inspire a meaningful next action.',3),
('topics','Strategic Communication','Practical frameworks for clear and purposeful communication.','A practical session on aligning audience, message, channel, and desired outcome for stronger communication decisions.',1),
('topics','Leadership Communication','Build trust, alignment, and confidence through leadership communication.','Designed for current and emerging leaders who need to communicate direction, navigate change, and create shared understanding.',2),
('topics','Public Speaking','Speak with clarity, confidence, and authentic presence.','A useful and engaging session covering message structure, delivery, audience connection, and confident presentation.',3),
('highlights','Leaders','Communication that creates clarity and forward movement.','Sessions for leaders who want to communicate decisions, direction, and purpose with greater confidence.',1),
('highlights','Educators','Practical communication for learning communities.','Programs that help educators make ideas understandable, memorable, and relevant to their learners.',2),
('highlights','Teams','Create shared understanding across organizations.','Team-focused experiences that improve message clarity, collaboration, and meaningful action.',3),
('portfolio','Communication That Inspires Action','Leadership and institutional audiences.','A keynote experience designed to help leaders turn important messages into clear and meaningful action.',1),
('portfolio','From Message to Meaning','Interactive learning experiences.','A workshop that helps participants move beyond information and create messages people can understand, remember, and use.',2),
('portfolio','Purposeful Communication','Custom sessions for organizations.','A tailored program built around the communication needs, audience, and desired outcomes of an organization.',3),
('projects','Keynote Engagements','Purpose-built keynote sessions for conferences and institutions.','Keynote presentations shaped around the audience, event theme, and outcome the organization wants to create.',1),
('projects','Communication Workshops','Interactive workshops with practical application.','Hands-on learning experiences that combine useful frameworks, discussion, activities, and immediate application.',2),
('projects','Institutional Programs','Custom communication programs for schools and organizations.','Longer-form communication initiatives designed in partnership with institutions, leadership teams, and learning communities.',3)
on conflict(section,title) do nothing;

-- IMPORTANT: Create this user first in Supabase Dashboard > Authentication > Users:
-- mr.fivetheteacher@gmail.com
-- Then run this file again, or run the statement below once.
insert into public.owner_profiles(user_id)
select id from auth.users where lower(email)='mr.fivetheteacher@gmail.com'
on conflict(user_id) do nothing;
