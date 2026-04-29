# AL BAHAJA Students Association — Backend

A **100% free** Node.js + Express backend for the AL BAHAJA official website.

## 🆓 Free Services Used

| Feature | Service | Cost |
|---|---|---|
| Server hosting | [Render.com](https://render.com) or [Railway.app](https://railway.app) | Free tier |
| Database | LowDB (JSON file on disk) | Free (built-in) |
| Email sending | Gmail via Nodemailer | Free (Gmail App Password) |
| File uploads | Local disk storage | Free |

---

## 📁 Project Structure

```
albahja-backend/
├── server.js              ← Main entry point
├── .env                   ← Your secrets (never commit this!)
├── db/
│   ├── database.js        ← LowDB setup
│   └── db.json            ← All data stored here (auto-created)
├── middleware/
│   └── mailer.js          ← Nodemailer email helper
├── routes/
│   ├── contact.js         ← POST /api/contact
│   ├── articles.js        ← POST /api/articles
│   ├── gallery.js         ← GET/POST/DELETE /api/gallery
│   └── admin.js           ← Admin API (protected)
├── uploads/
│   ├── submissions/       ← Article files stored here
│   └── gallery/           ← Gallery images/videos stored here
└── public/admin/
    └── index.html         ← Admin dashboard UI
```

---

## 🚀 Quick Start (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env`:
```
PORT=3000
ADMIN_KEY=choose_a_secret_password
EMAIL_USER=albahajastudents@gmail.com
EMAIL_PASS=your_16char_gmail_app_password
ADMIN_EMAIL=albahajastudents@gmail.com
ALLOWED_ORIGIN=https://your-site-domain.com
```

### 3. Enable Gmail App Password
1. Go to **myaccount.google.com** → Security → 2-Step Verification (enable it)
2. Then go to **App Passwords**
3. Create a new app password → select "Mail"
4. Copy the 16-character password into `EMAIL_PASS`

### 4. Run the server
```bash
npm start
# or for auto-reload during development:
npm run dev
```

### 5. Open admin panel
Visit: `http://localhost:3000/admin`  
Login with your `ADMIN_KEY` from `.env`

---

## 🌐 API Endpoints

### Contact Form
```
POST /api/contact
Body: { name, email, subject, message }
```

### Article Submission
```
POST /api/articles
Content-Type: multipart/form-data
Body: { name, email, title, type, driveLink, message, file? }
```

### Gallery Upload
```
POST /api/gallery/upload
Content-Type: multipart/form-data
Body: { files[] }  (up to 20 files, 20MB each)

GET /api/gallery   → list all items
DELETE /api/gallery/:id  (requires X-Admin-Key header)
```

### Admin (all require X-Admin-Key header)
```
GET  /api/admin/stats
GET  /api/admin/contacts
POST /api/admin/contacts/:id/read
DEL  /api/admin/contacts/:id
GET  /api/admin/articles
POST /api/admin/articles/:id/status  { status: 'approved'|'rejected' }
DEL  /api/admin/articles/:id
```

---

## 🔗 Updating Your Website HTML

Replace the frontend EmailJS/Firebase calls with these fetch calls:

### Contact Form
```javascript
async function sendMessage() {
  const res = await fetch('https://YOUR_BACKEND_URL/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, subject, message })
  });
  const data = await res.json();
  showToast(data.message);
}
```

### Article Submission (with file)
```javascript
async function submitArticle() {
  const formData = new FormData();
  formData.append('name',    name);
  formData.append('email',   email);
  formData.append('title',   title);
  formData.append('type',    type);
  formData.append('message', message);
  if (fileInput.files[0]) formData.append('file', fileInput.files[0]);

  const res = await fetch('https://YOUR_BACKEND_URL/api/articles', {
    method: 'POST',
    body: formData  // do NOT set Content-Type header for multipart
  });
  const data = await res.json();
  showToast(data.message);
}
```

---

## ☁️ Free Deployment on Render.com

1. Push code to **GitHub** (make sure `.env` and `db/db.json` are in `.gitignore`)
2. Go to [render.com](https://render.com) → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Add all variables from `.env`
5. Deploy! You get a free `https://your-app.onrender.com` URL

> ⚠️ On Render's free tier, the server sleeps after 15 min of inactivity. Files in `uploads/` are lost on redeploy — for production, use Cloudinary (free tier) for media storage.

---

## 📊 Upgrading the Database (when you outgrow JSON)

When you have lots of data, migrate to **Supabase** (free PostgreSQL):
1. Sign up at [supabase.com](https://supabase.com)
2. Get your connection string
3. Install: `npm install @supabase/supabase-js`
4. Replace `db/database.js` with Supabase client

---

Made with ❤️ for AL BAHAJA Students Association
