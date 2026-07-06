# CutTrack

Job ticket + sheet inventory tool. Same tool you've been using as a Claude artifact, now as a
real hosted site so the "Mark as cut" step can be a tappable link from WhatsApp instead of a
manual checkbox.

## What you need to do (about 15 minutes, all in your own accounts)

### 1. Create a Supabase project
- Go to supabase.com → New project (free tier is fine to start)
- Once it's created, open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it.
- Go to **Project Settings → API**. You'll need two values from this page:
  - **Project URL**
  - **service_role secret** (not the "anon public" key — the service role one)

### 2. Push this folder to GitHub
- Create a new empty repo on github.com (e.g. `cuttrack`)
- From this folder:
  ```
  git init
  git add .
  git commit -m "Initial CutTrack app"
  git branch -M main
  git remote add origin https://github.com/<your-username>/cuttrack.git
  git push -u origin main
  ```

### 3. Deploy on Vercel
- Go to vercel.com → New Project → import the GitHub repo you just pushed
- Before deploying, add two Environment Variables (Settings → Environment Variables):
  - `SUPABASE_URL` = the Project URL from step 1
  - `SUPABASE_SERVICE_ROLE_KEY` = the service_role secret from step 1
- Click Deploy. Vercel gives you a live URL like `cuttrack-yourname.vercel.app`.

That's it — that URL is now your admin tool. Bookmark it for you and office staff.

## How the WhatsApp confirmation works

Every ticket's "Copy for WhatsApp" text includes a link like:
`https://cuttrack-yourname.vercel.app/confirm/T-0001`

WhatsApp automatically makes that tappable. Labor taps it, sees the job spec, and taps
**"Mark as cut."** That instantly flips the ticket's status and shows up in your Ticket Log —
no login needed on their end, no app to install.

## Local development (optional)

If you want to run it on your own machine before deploying:
```
npm install
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev
```
Visit http://localhost:3000

## Known gaps to be aware of

- **No login/auth yet.** Anyone with your Vercel URL can open the admin tool and create/edit
  tickets. Fine for a small trusted team on a private link; if this ever needs to be locked
  down (e.g. bigger team, public exposure), add Supabase Auth (email link or password) in front
  of `app/page.tsx` — that's a contained addition, ask me when you're ready for it.
- **Confirm links are guessable** (`T-0001`, `T-0002`, ...) since they're just sequential
  ticket numbers. Not a real risk for internal use, but if you ever want it tighter, we can add
  a random token to each link.
- **Ticket creation deducts stock immediately** (reserves it), not at confirmation time. If a
  ticket is created but never actually cut, the stock number will look lower than physical
  reality until someone notices and corrects it manually in Inventory.
