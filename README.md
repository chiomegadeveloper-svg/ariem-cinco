# Ariem Cinco PWA

Professional multi-page Vite PWA for Ariem Cinco with Supabase-managed content, RFQ inbox, image storage, and an owner control center.

## Local setup

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and add the Supabase project values.
4. Run `npm run dev`.

The app accepts either the `VITE_*` names or the existing `NEXT_PUBLIC_*` names in Vercel.

## Supabase setup

1. Open Supabase Dashboard → SQL Editor.
2. Run the complete [`supabase/schema.sql`](supabase/schema.sql) file.
3. Open Authentication → Users → Add user.
4. Create `mr.fivetheteacher@gmail.com` with the owner’s chosen password and enable email confirmation.
5. Run the final `insert into public.owner_profiles...` statement in the SQL file again.

The SQL creates:

- owner-only Row Level Security policies
- editable website settings
- portfolio, foundation, topics, highlights, and projects entries
- the RFQ inbox
- the public `article-images` bucket restricted to WebP files no larger than 2 MB
- the current placeholder content as initial database entries

## Owner control center

Open `/control-center` and sign in using `mr.fivetheteacher@gmail.com`.

The owner can:

- publish articles to each website page
- upload an image that is automatically converted to WebP under 2 MB
- publish or save entries as drafts
- delete entries and their stored images
- edit page headings, descriptions, contact email, and booking link
- review, update, reply to, and delete RFQ submissions

## Vercel

Add these environment variables to Production, Preview, and Development:

```text
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Build command: `npm run build`  
Output directory: `dist`
