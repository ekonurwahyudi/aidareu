# 🚀 Panduan Deploy Aidareu ke Easypanel

## 📋 Informasi Server
- **IP Server**: 139.99.101.27
- **Domain**: aidareu.com
- **Easypanel**: Port 3000
- **Backend API**: Port 8000 → api.aidareu.com
- **Frontend Web**: Port 8080 → aidareu.com

---

## 🔧 Persiapan Sebelum Deploy

### 1. Generate Secret Keys

**Laravel APP_KEY:**
```bash
cd backend
php artisan key:generate --show
```
Copy output: `base64:xxxxxxxxxxxxx`

**NextAuth Secret:**
```bash
openssl rand -base64 32
```
Copy output untuk `NEXTAUTH_SECRET`

### 2. Push Code ke GitHub

```bash
git add .
git commit -m "Add Docker configuration for Easypanel deployment"
git push origin master
```

### 3. Setup DNS (di Domain Registrar)

Tambahkan A Records:
```
Type    Name    Value           TTL
A       @       139.99.101.27   Auto
A       www     139.99.101.27   Auto
A       api     139.99.101.27   Auto
```

---

## 🗄️ Step 1: Deploy Database PostgreSQL

### A. Buat Project & Database Service

1. Buka Easypanel: `http://139.99.101.27:3000`
2. Login ke dashboard
3. Klik **"+ New"** → **"Project"**
4. Nama project: `aidareu`
5. Dalam project, klik **"+ Create Service"** → **"Postgres"**
6. Nama service: `aidareu-db`
7. **PostgreSQL Settings**:
   - Database: `aidareu`
   - Username: `postgres`
   - Password: `[generate secure password]`
   - **SIMPAN CREDENTIALS INI!**

### B. Restore Database Backup

**Opsi 1: Via Easypanel Console**
1. Klik service `aidareu-db`
2. Tab **"Console"**
3. Upload file `backend/postgres-202510081508.sql` ke server:
   ```bash
   # Via SCP dari komputer lokal
   scp D:\aidareu\backend\postgres-202510081508.sql root@139.99.101.27:/tmp/
   ```
4. Di console Easypanel, restore:
   ```bash
   psql -U postgres -d aidareu < /tmp/postgres-202510081508.sql
   ```

**Opsi 2: Via Docker Volume**
1. Akses server via SSH: `ssh root@139.99.101.27`
2. Copy backup ke container:
   ```bash
   docker cp /path/to/postgres-202510081508.sql <container_id>:/tmp/backup.sql
   docker exec -it <container_id> psql -U postgres -d aidareu -f /tmp/backup.sql
   ```

---

## 🔙 Step 2: Deploy Backend Laravel API

### A. Buat App Service

1. Dalam project `aidareu`, klik **"+ Create Service"** → **"App"**
2. Nama service: `backend-api`
3. **Source Settings**:
   - **Source Type**: GitHub Repository
   - Repository: `your-username/aidareu` (sesuaikan)
   - Branch: `master`
   - **Build Path**: `/backend` ⚠️ PENTING!

### B. Environment Variables

Klik tab **"Environment"**, tambahkan:

```env
# Application
APP_NAME=Aidareu
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_FROM_STEP1_HERE
APP_DEBUG=false
APP_URL=https://api.aidareu.com
APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id

# Database - USE EASYPANEL MAGIC VARIABLES
DB_CONNECTION=pgsql
DB_HOST=aidareu-db  # Nama service database
DB_PORT=5432
DB_DATABASE=aidareu
DB_USERNAME=postgres
DB_PASSWORD=YOUR_DB_PASSWORD_FROM_STEP1

# Cache & Session
CACHE_STORE=database
QUEUE_CONNECTION=database
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=.aidareu.com

# CORS & Sanctum
SANCTUM_STATEFUL_DOMAINS=aidareu.com,www.aidareu.com,api.aidareu.com
CORS_ALLOWED_ORIGINS=https://aidareu.com,https://www.aidareu.com

# Biteship API (optional)
BITESHIP_API_KEY=your_biteship_api_key_here
```

### C. Domain & Port Configuration

1. Tab **"Domains"**
2. Klik **"Add Domain"**
3. Domain: `api.aidareu.com`
4. Port: `8000`
5. Enable **"HTTPS"** (Let's Encrypt automatic)

### D. Deploy

1. Easypanel akan otomatis build menggunakan `Dockerfile`
2. Tunggu proses build selesai (~5-10 menit)
3. Cek logs di tab **"Logs"**

---

## 🎨 Step 3: Deploy Frontend Next.js

### A. Buat App Service

1. Dalam project `aidareu`, klik **"+ Create Service"** → **"App"**
2. Nama service: `frontend-web`
3. **Source Settings**:
   - **Source Type**: GitHub Repository
   - Repository: `your-username/aidareu` (sama seperti backend)
   - Branch: `master`
   - **Build Path**: `/frontend` ⚠️ PENTING!

### B. Environment Variables

```env
# Node Environment
NODE_ENV=production

# App URLs
NEXT_PUBLIC_APP_URL=https://aidareu.com
NEXT_PUBLIC_API_URL=https://api.aidareu.com

# NextAuth
NEXTAUTH_URL=https://aidareu.com
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_FROM_STEP1

# Database (for NextAuth sessions if needed)
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@aidareu-db:5432/aidareu

# API
API_URL=https://api.aidareu.com

# Disable Telemetry
NEXT_TELEMETRY_DISABLED=1
```

### C. Domain & Port Configuration

1. Tab **"Domains"**
2. Tambah 2 domains:
   - `aidareu.com` → Port `8080`
   - `www.aidareu.com` → Port `8080`
3. Enable **"HTTPS"** untuk kedua domain

### D. Deploy

1. Klik **"Deploy"**
2. Tunggu build selesai (~10-15 menit karena Next.js build)
3. Monitor di tab **"Logs"**

---

## ✅ Step 4: Verifikasi Deployment

### A. Test Backend API

```bash
# Test health/status endpoint
curl https://api.aidareu.com/api/health

# Test database connection
curl https://api.aidareu.com/api/status
```

### B. Test Frontend

1. Buka browser: `https://aidareu.com`
2. Pastikan website load dengan benar
3. Test login/register
4. Test API calls dari frontend

### C. Check Logs

**Backend:**
```bash
# Di Easypanel
Service: backend-api → Tab "Logs"
```

**Frontend:**
```bash
# Di Easypanel
Service: frontend-web → Tab "Logs"
```

---

## 🔄 Auto-Deploy dari GitHub

### Setup Webhook

1. Di service (backend atau frontend)
2. Tab **"Settings"**
3. Enable **"Auto Deploy"**
4. Copy **Deploy Webhook URL**

### Tambahkan di GitHub

1. Repository Settings → Webhooks
2. **Add webhook**:
   - Payload URL: `[paste deploy webhook URL]`
   - Content type: `application/json`
   - Events: `Just the push event`
   - Active: ✓

Sekarang setiap `git push` akan trigger auto-deploy! 🎉

---

## 🐛 Troubleshooting

### Database Connection Error

**Symptoms**: Backend log menunjukkan `SQLSTATE[08006]`

**Solution**:
1. Pastikan `DB_HOST=aidareu-db` (nama service, bukan IP)
2. Cek database service status di Easypanel
3. Verify credentials di environment variables

### Frontend 500 Error

**Symptoms**: White screen atau 500 error

**Solution**:
1. Check environment variables `NEXT_PUBLIC_API_URL`
2. Test API endpoint: `curl https://api.aidareu.com`
3. Check CORS settings di backend

### Migration Failed

**Symptoms**: Backend logs: `Migration table not found`

**Solution**:
```bash
# Di Console backend-api service
php artisan migrate:fresh --force
# ATAU restore database manual
```

### Build Failed

**Symptoms**: Build stuck atau error

**Solution**:
1. Check Dockerfile syntax
2. Verify build path: `/backend` atau `/frontend`
3. Check RAM usage (mungkin perlu upgrade server)

---

## 📊 Monitoring

### Resource Usage
- Tab **"Metrics"** di setiap service
- Monitor CPU, Memory, Network

### Logs
- **Real-time logs**: Tab "Logs"
- Filter by severity
- Download logs untuk analisis

### Database Management

**Via Console**:
```bash
# Akses PostgreSQL console
psql -U postgres -d aidareu

# Common commands
\dt         # List tables
\d+ users   # Describe table
SELECT COUNT(*) FROM users;
```

---

## 🔐 Security Checklist

- [ ] Change default database password
- [ ] APP_DEBUG=false di production
- [ ] APP_KEY sudah di-generate
- [ ] NEXTAUTH_SECRET sudah di-generate
- [ ] HTTPS enabled untuk semua domains
- [ ] Firewall configured (hanya allow port 80, 443, 3000)
- [ ] Database tidak di-expose ke public
- [ ] Environment variables tidak di-commit ke GitHub

---

## 📝 Maintenance Tasks

### Update Application

```bash
# Local
git add .
git commit -m "Update feature"
git push origin master

# Auto-deploy via webhook atau manual deploy di Easypanel
```

### Database Backup

```bash
# Via Console backend-api service
pg_dump -U postgres aidareu > backup-$(date +%Y%m%d).sql

# Download via Easypanel console atau SCP
```

### Scale Application

1. Service → Tab "Settings"
2. Adjust **Replicas** (multiple containers)
3. Configure **Resources** (CPU/Memory limits)

---

## 🎯 Production Optimization

### Backend Optimization
```bash
# Run in backend console
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Frontend Optimization
- Already using `standalone` output
- Automatic image optimization
- Static file caching

### Database Optimization
```sql
-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_status ON products(status);
```

---

## 🆘 Support

### Easypanel Documentation
- https://easypanel.io/docs

### Laravel Documentation
- https://laravel.com/docs

### Next.js Documentation
- https://nextjs.org/docs

---

## ✨ Selesai!

Website Anda sekarang live di:
- 🌐 Frontend: https://aidareu.com
- 🔧 Backend API: https://api.aidareu.com
- 🗄️ Database: PostgreSQL (internal)

**Happy Coding! 🚀**
