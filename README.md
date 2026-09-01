# Mawlyngbna Adventure — Booking Form

A static booking page styled like the Google Form you shared, plus a hidden
admin dashboard for editing prices and details. No backend/server needed —
it's plain HTML/CSS/JS, so it deploys straight to GitHub Pages for free.

## Files

| File | What it's for |
|---|---|
| `index.html` | The booking page visitors fill in |
| `style.css` | All the styling (purple Google-Forms look) |
| `app.js` | Booking page logic: steppers, payment reveal, copy/download buttons, WhatsApp submit |
| `config.js` | **Edit this to change prices, text, packages, payment info** |
| `admin.html` / `admin.js` / `admin.css` | The hidden admin dashboard |
| `assets/qr.png` | Your payment QR code image |

## Editing content the easy way

Almost everything editable lives at the top of **`config.js`** in one place:
title text, the WhatsApp number, the list of packages and prices, the
home stay / camping price and notes, the UPI/bank/QR payment details —
and, under `labels`, **every single word and sentence a visitor can see**
on the booking page (every field label, placeholder, note, error
message, and button). Nothing is hard-coded in the HTML. Change a
value, save the file, and re-deploy (or just refresh if testing
locally) — no need to touch the HTML or CSS.

You can also edit all of this live, from your phone or laptop, through the
**Admin Dashboard** — see below.

## Deploying to GitHub Pages

1. Create a new GitHub repository (e.g. `mawlyngbna-booking`).
2. Upload all the files in this folder to the repository (keep the folder
   structure — `assets/qr.png` must stay inside an `assets` folder).
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**,
   branch **main**, folder **/ (root)** → Save.
5. GitHub gives you a URL like `https://yourusername.github.io/mawlyngbna-booking/`
   within a minute or two. That's your live booking page.

You can also just drag-and-drop all these files into a new repo on
github.com in the browser — no git command line needed.

## The Admin Dashboard (`admin.html`)

- **Direct link:** open `admin.html` on your site
  (e.g. `https://yourusername.github.io/mawlyngbna-booking/admin.html`).
  Bookmark this — only share it with yourself.
- **Hidden tap trigger:** on the booking page, tapping the invisible bottom-right
  corner of the screen 5 times within 3 seconds also jumps to `admin.html`.
- It's protected by a password (default: `mawlyngbna2026`, set in `config.js`
  as `adminPassword` — **change this before you deploy**, and change it again
  any time from inside the dashboard).
- **Forgot your password?** On the login screen, tap **"Forgot password?
  Reset it"**. Since this is a static site there's no email/SMS to send a
  reset to — this just resets the saved password back to the default in
  `config.js`, without touching anything else you've saved (packages,
  prices, payment details). There's also a "Show password" checkbox on
  the login screen so you can double-check what you're typing.
- From the dashboard you can:
  - Edit the form title/subtitle and the WhatsApp number
  - Add, edit, reorder, or remove **packages** and their prices
  - Turn the **Home stay** / **Camping** sections on or off, and edit their
    prices and notes (Home Stay: 1st-adult price, price per extra adult,
    price per child, and the age children stay free up to)
  - Edit the **UPI ID, bank account, IFSC, and QR image URL**
  - Change the admin password
  - Edit **every piece of text on the form** — labels, placeholders,
    error messages, notes, and buttons — under the "Text on the form"
    section

### Important limitation — please read

This site has no database or server, so the Admin Dashboard saves your
changes to that **one browser's local storage**. That means:

- Edits you make on your phone will show up next time you open the form
  **on that same phone/browser**.
- They will **not** automatically appear for visitors on other devices,
  because there's nowhere shared to store them.

For changes everyone should see (a new price, a new package), the reliable
way is to **edit `config.js` directly and re-deploy** (steps above) — that
updates the site for every visitor. The Admin Dashboard is best for quick
previews or for a kiosk/tablet you personally control. If you outgrow this,
the next step up would be a small backend (e.g. a free Google Sheet + Apps
Script, or a tiny database) — happy to help set that up if you need it.

## How the booking flow works

The form is two pages, like a Google Form with a page break:

1. **Page 1** — name, WhatsApp number, date, participants, children,
   package, home stay, camping, special request, and payment method.
   Tapping **Next** checks the required fields, then moves on.
2. **Page 2** — shows only the payment details for whichever method was
   chosen (UPI ID / Bank Transfer / QR Code) plus the live total. Tapping
   **Back** returns to page 1 without losing anything already filled in.
   Tapping **Submit** builds a WhatsApp message with every answer and opens
   WhatsApp (`wa.me`) with your number and that message pre-filled — the
   visitor just hits send.

## Home Stay pricing (tiered by adults + child age)

Home Stay now prices adults and children separately:
- **Adults:** ₹1,500 for the 1st adult, +₹500 for every adult after that.
- **Children age 7–18:** ₹1,000 each.
- **Children age 6 and under:** free.

Because of this, whenever a visitor sets "Number of child" above 0, an age
box appears for each child — the site uses those ages to work out the Home
Stay total. All four numbers (1st-adult price, extra-adult price, child
price, and the free age cutoff) are editable in `config.js` under
`homestay`, or live from the Admin Dashboard.

This is separate from the **package** price children pay, which is still
controlled by the single "Child price — % of adult price" setting — that
one doesn't use ages, since packages didn't ask for age-based pricing.

## Editing prices, packages, and the calculator

Everything is in **`config.js`**, and every value there has a plain-English
comment above it explaining what it does and showing an example — you don't
need to know how to code. Search the file for the label in CAPS (e.g.
`PACKAGES`, `CHILD PRICING RULE`, `HOME STAY`) to jump straight to what you
want to change. A walkthrough of exactly how the total price gets
calculated is also written out at the bottom of that file.

## Before you go live, double check

- [ ] `config.js` → `whatsappNumber` is correct (currently set to `916909659928`
      for +91 6909 659 928 — update the country code if that's wrong)
- [ ] `config.js` → `adminPassword` has been changed from the default
- [ ] `assets/qr.png` is your correct, current payment QR code
- [ ] Package prices in `config.js` match what you actually charge
