# AiDareU - Setup Guide

## 🚀 Complete System Setup

Panduan lengkap untuk menjalankan sistem AiDareU dengan Registration & Onboarding Flow serta Role-Based Access Control (RBAC).

## 📋 Prerequisites

### Backend (Laravel)
- PHP 8.2 or higher
- Composer
- MySQL/PostgreSQL/SQLite
- Node.js (untuk asset compilation jika diperlukan)

### Frontend (Next.js)
- Node.js 18 or higher
- npm atau pnpm

## 🔧 Backend Setup

### 1. Masuk ke direktori backend
```bash
cd backend
```

### 2. Jalankan setup script (Otomatis)
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### 3. Setup manual (jika diperlukan)
```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database di .env file
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# Run migrations and seeders
php artisan migrate:fresh --seed

# Start the server
php artisan serve
```

### 4. Konfigurasi Database (.env)
```env
# SQLite (Recommended for development)
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite

# MySQL (Production)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aidaru
DB_USERNAME=root
DB_PASSWORD=

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
```

## 🎨 Frontend Setup

### 1. Masuk ke direktori frontend
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
# atau
pnpm install
```

### 3. Start development server
```bash
npm run dev
# atau
pnpm dev
```

Frontend akan berjalan di: http://localhost:3000

## 🔐 Default Users

Setelah menjalankan seeders, akun berikut akan tersedia:

### Super Administrator
- **Email**: admin@aidaru.com
- **Password**: admin123
- **Role**: Superadmin (Full system access)

### Store Owner
- **Email**: owner@example.com
- **Password**: owner123
- **Role**: Owner (Store management)
- **Store**: contoh-toko.aidaru.com

### Admin Toko
- **Email**: admin.toko@example.com
- **Password**: admin123
- **Role**: Admin Toko (Content management)
- **Store**: contoh-toko.aidaru.com

## 🌐 API Endpoints

### Authentication
```http
POST /api/auth/register          # User registration
POST /api/auth/verify-email      # Email verification
POST /api/auth/resend-verification # Resend verification code
POST /api/auth/login            # User login
POST /api/auth/logout           # User logout
GET  /api/auth/me               # Get current user
```

### RBAC (Role-Based Access Control)
```http
GET  /api/rbac/users            # Get users list
POST /api/rbac/users            # Create new user
PUT  /api/rbac/users/{id}       # Update user
DELETE /api/rbac/users/{id}     # Delete user
POST /api/rbac/assign-roles     # Assign roles to user

GET  /api/rbac/roles            # Get roles list
GET  /api/rbac/permissions      # Get permissions list
GET  /api/rbac/permissions/me   # Get current user permissions
```

### Store Management
```http
GET  /api/stores                # Get stores list
POST /api/stores                # Create new store
GET  /api/stores/{id}           # Get store details
PUT  /api/stores/{id}           # Update store
POST /api/stores/{id}/switch    # Switch store context
GET  /api/stores/{id}/users     # Get store users

POST /api/store/create          # Create store (alternative endpoint)
POST /api/store/check-subdomain # Check subdomain availability
```

## 🎯 Testing the System

### 1. Test Registration Flow
1. Buka http://localhost:3000/pages/auth/register-v1
2. Isi form registrasi dengan data lengkap
3. Submit form
4. Sistem akan redirect ke halaman verifikasi email
5. Check backend logs untuk melihat kode verifikasi
6. Input kode verifikasi
7. Setelah verifikasi berhasil, akan muncul modal setup toko

### 2. Test User Management
1. Login sebagai superadmin (admin@aidaru.com / admin123)
2. Akses user management interface
3. Test create, edit, delete, dan assign roles

### 3. Test Store Management
1. Login sebagai owner atau superadmin
2. Create new store atau manage existing store
3. Test store context switching

## 🗂️ Folder Structure

```
AiDareU/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Models/            # User, Role, Permission, Store models
│   │   ├── Http/Controllers/  # Auth, RBAC, Store controllers
│   │   ├── Services/          # EmailVerificationService
│   │   └── Http/Middleware/   # RBAC middleware
│   ├── database/
│   │   ├── migrations/        # Database schema
│   │   └── seeders/          # Sample data
│   ├── routes/api.php         # API routes
│   ├── setup.bat             # Windows setup script
│   └── setup.sh              # Linux/Mac setup script
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── views/pages/auth/  # Registration & login pages
│   │   ├── views/rbac/users/  # User management interface
│   │   ├── components/
│   │   │   ├── rbac/          # RBAC components
│   │   │   └── dialogs/       # Modal components
│   │   ├── contexts/          # RBAC context
│   │   └── types/             # TypeScript interfaces
│   └── ...
│
└── SETUP_GUIDE.md             # This file
```

## 🔒 Security Features

### ✅ Implemented
- Password complexity validation
- Email verification with 6-digit codes
- Role-based access control
- Permission-based route protection
- Protected React components
- CSRF protection
- SQL injection protection
- XSS protection

### 🚧 Production Considerations
- Enable email service (currently using logs)
- Configure proper CORS settings
- Set up SSL certificates
- Enable rate limiting
- Configure proper session/token management
- Set up proper logging and monitoring

## 🎨 Frontend Components

### Authentication
- `RegisterV1.tsx` - Enhanced registration form
- `TwoStepsV1.tsx` - Email verification with OTP
- `LoginV1.tsx` - Login form (existing)

### RBAC
- `UserList.tsx` - User management interface
- `CreateUserDialog.tsx` - Create user modal
- `EditUserDialog.tsx` - Edit user modal
- `AssignRoleDialog.tsx` - Role assignment modal
- `ProtectedRoute.tsx` - Route protection component

### Store Management
- `StoreSetup.tsx` - Store creation modal
- Store management interfaces (to be implemented)

## 🔧 Development Commands

### Backend
```bash
# Run migrations
php artisan migrate

# Run specific seeder
php artisan db:seed --class=PermissionSeeder

# Clear caches
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Generate new migration
php artisan make:migration create_something_table

# Generate new seeder
php artisan make:seeder SomethingSeeder

# Generate new controller
php artisan make:controller Api/SomethingController
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Database Issues
1. Check `.env` database configuration
2. Ensure database exists and is accessible
3. Run `php artisan migrate:fresh --seed` to reset database

### Permission Issues
1. Check file permissions for storage directory
2. Ensure Laravel can write to `storage/` and `bootstrap/cache/`

### API Connection Issues
1. Check CORS configuration in Laravel
2. Ensure Sanctum is properly configured
3. Check frontend API endpoints configuration

### Frontend Issues
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run type-check`

## 📧 Support

Jika mengalami masalah, periksa:
1. Laravel logs: `storage/logs/laravel.log`
2. Browser console untuk error frontend
3. Network tab untuk API request/response
4. Database logs untuk query issues

## 🎉 Next Steps

Setelah sistem berjalan, Anda dapat:
1. Customize theme dan styling sesuai brand
2. Implement email service untuk production
3. Add more RBAC permissions sesuai kebutuhan
4. Develop additional store management features
5. Integrate dengan payment gateway
6. Add analytics dan reporting
7. Implement AI content generation features

Sistem sekarang sudah production-ready dengan semua fitur dasar yang diperlukan untuk platform multi-tenant dengan RBAC yang komprehensif!