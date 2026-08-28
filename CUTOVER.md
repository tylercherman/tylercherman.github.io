# Moving tylercherman.com from Squarespace to GitHub Pages

Follow these in order. **Tell me after each step and I'll verify it actually landed
before you move on** — DNS is slow enough that "it didn't work" and "it hasn't
propagated yet" look identical from your side, and I can tell them apart.

---

## What we're starting from (verified 2026-08-28)

| | |
|---|---|
| Registrar (where you pay) | **GoDaddy**, renews 2027-10-24 |
| Nameservers (who answers DNS) | **Squarespace** — `connect1/connect2.squarespacedns.com` |
| Apex `tylercherman.com` | Squarespace IPs, 301-redirects to www |
| `www.tylercherman.com` | `ext-sq.squarespace.com` — the live Squarespace site |
| **MX records (email)** | **None.** No email on this domain — nothing to break. |
| GitHub Pages | Live at tylercherman.github.io, no custom domain set |

**The thing that trips people up:** the domain is registered at GoDaddy, but GoDaddy is
*not* answering DNS for it — Squarespace is. Records typed into GoDaddy's DNS panel do
nothing until the nameservers move. That's step 1.

---

## Step 1 — Point the nameservers at GoDaddy

**Where:** GoDaddy → *My Products* → find `tylercherman.com` → **DNS** → scroll to
**Nameservers** → **Change**

Choose **"I'll use GoDaddy nameservers"** (wording varies: may be *Default* or
*GoDaddy defaults*). Save.

> **Why this and not editing records at Squarespace?** Because you're cancelling
> Squarespace. If the nameservers still point at them when the subscription lapses,
> they can stop answering DNS for your domain — which takes the site down and is a
> genuinely stressful thing to debug. Moving DNS to your registrar takes Squarespace
> out of the loop entirely.

**Then go straight to Step 2 — don't stop here.** In the window between switching
nameservers and adding records, some visitors resolve via Squarespace (old site, fine)
and others via GoDaddy (nothing there yet). Adding the records immediately means both
answers are valid and nobody sees an error.

✅ **Tell me when saved** — I'll watch for the nameserver change to appear publicly.

---

## Step 2 — Add the records at GoDaddy

**Where:** GoDaddy → `tylercherman.com` → **DNS** → **DNS Records**

**First, delete** any existing `A` record on `@` and any `CNAME` on `www` that GoDaddy
pre-populated (they'll point at a GoDaddy parking page).

**Then add these.** Type, Name, Value — leave TTL at default (1 hour):

**Four A records**, all with Name `@`:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Four AAAA records** (IPv6), all with Name `@`:

```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

**One CNAME**, Name `www`, Value:

```
tylercherman.github.io
```

> Some GoDaddy screens want a trailing dot on the CNAME value
> (`tylercherman.github.io.`). Either is fine; GoDaddy normalises it.

Set up **both** apex and `www`. GitHub then redirects one to the other automatically,
so no visitor lands on a dead hostname whichever they type.

✅ **Tell me when saved** — I'll query the records from outside and confirm all nine
are live and correct.

---

## Step 3 — Verify the domain in GitHub

This stops anyone else claiming `tylercherman.com` on *their* GitHub Pages site later.
Takes two minutes and is worth doing.

**Where:** <https://github.com/settings/pages> → **Add a domain**

1. Enter `tylercherman.com`, click **Add domain**
2. GitHub shows you a TXT record — a name like
   `_github-pages-challenge-tylercherman` and a long random value
3. **Paste both to me.** I'll give you back exactly what to type into GoDaddy, since
   GoDaddy's Name field wants the host only, not the full domain — a common stumble
4. Add it at GoDaddy: **DNS Records** → **Add** → Type `TXT`
5. Back on the GitHub page, click **Verify**

✅ **Tell me when it says verified.**

---

## Step 4 — Point GitHub Pages at the domain

Once Step 2 is confirmed working, I'll add a `CNAME` file to the repo and push. That
sets the custom domain automatically — you don't need to touch GitHub's settings.

**One decision for you first:** which is the real address?

- **`tylercherman.com`** — cleaner, and how most portfolios read now. **My recommendation.**
- **`www.tylercherman.com`** — what your Squarespace site uses today

Either works and GitHub redirects the other, so nothing breaks and no shared link dies.
It's aesthetics, not engineering.

✅ **Tell me which**, and I'll handle this step.

---

## Step 5 — Wait for HTTPS

GitHub issues a TLS certificate for your domain automatically. **This can take
anywhere from a few minutes to 24 hours.** During that window the site may show a
certificate warning. That's expected, not broken.

**Do not toggle settings while waiting** — changing the custom domain restarts the
process from zero.

✅ I'll check periodically and tell you when the padlock is clean on both
`tylercherman.com` and `www.tylercherman.com`.

---

## Step 6 — Only now, cancel Squarespace

Every box must be ticked first:

- [ ] Nameservers show GoDaddy publicly
- [ ] All nine DNS records resolve correctly
- [ ] `https://tylercherman.com` serves the new site
- [ ] `https://www.tylercherman.com` serves it too
- [ ] HTTPS is clean on both — no certificate warning
- [ ] Contact form submitted on the live domain and the email arrived
- [ ] Site checked on your phone

**Keep Squarespace for a week after that.** It costs one more billing cycle and it is
your rollback: if something is badly wrong, pointing the nameservers back restores the
old site while we sort it out.

---

## If something looks wrong

**"The site is down!"** — Check <https://tylercherman.github.io> first. If that works,
the site is fine and it's purely DNS. Nothing has been lost.

**Different results on phone vs laptop** — Normal mid-propagation. Different networks
cache DNS for different lengths of time. Not a fault.

**Certificate warning** — Expected until GitHub finishes issuing. Wait it out.

**Worst case** — Set the nameservers back to `connect1.squarespacedns.com` and
`connect2.squarespacedns.com` at GoDaddy. The Squarespace site returns. That's why we
don't cancel it until the end.

---

## What I can and can't do

**I can't** log into GoDaddy, Squarespace, or GitHub's settings UI, and I won't handle
your account credentials. Steps 1, 2, 3 and 6 are yours.

**I can** verify every one of them from outside — query the nameservers and records
that the rest of the world sees, check what's actually being served, and confirm the
certificate. I'll do that after each step, so you never move forward on a step that
only looks finished.

**I'll handle** step 4 in the repo.
