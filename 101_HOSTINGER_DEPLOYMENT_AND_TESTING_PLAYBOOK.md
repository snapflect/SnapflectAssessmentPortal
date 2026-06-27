# 101 Hostinger Deployment & Testing Playbook

## Executive Summary
This playbook provides the exact steps to deploy your Laravel backend architecture to your `https://api.snapflect.com` subdomain on Hostinger, ensure your local Angular frontend connects to it securely, and execute manual end-to-end testing.

The local Angular frontend has been configured to target `https://api.snapflect.com/api/v1` and compiled successfully. A `cors.php` configuration file has been generated for your backend to allow local testing.

---

## Phase 1: Hostinger Backend Deployment

Because the local `snapflect` directory is a raw architectural scaffold (due to the missing local PHP environment), you must initialize a fresh Laravel instance on Hostinger and migrate the scaffolded files into it.

### Step 1: Create Fresh Laravel Project via SSH
Log into your Hostinger server via SSH (or use the Hostinger hPanel Terminal) and navigate to your subdomain folder (typically `domains/api.snapflect.com/public_html`):
```bash
cd domains/api.snapflect.com/public_html
composer create-project laravel/laravel .
```

### Step 2: Upload Scaffolded Files
Using Hostinger File Manager or FTP, upload the contents of your local `D:\Mubarak\SnapFlectMobileWebApp\Snapflect Assessment Portal\snapflect_scaffold\` folder into the Hostinger folder, specifically overwriting/merging:
- `/app`
- `/routes`
- `/database`
- `/Modules`
- `/config/cors.php` *(Important: This file contains the CORS rules generated for `http://localhost:4200`)*

### Step 3: Configure Environment
Edit the `.env` file on Hostinger:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.snapflect.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u668772406_assessments_db
DB_USERNAME=u668772406_db_user
DB_PASSWORD=NewMubarak@123
```

### Step 4: Run Production Commands
Via Hostinger SSH, run the following to optimize the app and build the database:
```bash
composer install --no-dev
php artisan optimize:clear
php artisan migrate
php artisan db:seed
```

> [!IMPORTANT]
> Verify the backend is live by navigating to `https://api.snapflect.com/api/v1` in your browser. It should return a valid JSON response or a 404/401 API error (not a server crash).

---

## Phase 2: Start Local Frontend

The local Angular environment has already been updated to point to your new API.

1. Open a terminal in `D:\Mubarak\SnapFlectMobileWebApp\Snapflect Assessment Portal\snapflect-frontend`
2. Run: `npm install` (Already completed during automation, but safe to repeat)
3. Run: `ng serve`
4. Open `http://localhost:4200` in your browser.

---

## Phase 3: Verify API Connectivity (CORS)

Before testing the app, ensure CORS is functioning correctly.

1. In your browser at `http://localhost:4200`, press **F12** to open Developer Tools.
2. Go to the **Network** tab.
3. Attempt to log in with random credentials.
4. Verify that the `POST /api/v1/auth/login` request reaches `https://api.snapflect.com/api/v1/auth/login`.
5. Ensure there are **no red CORS errors** in the Console tab.

> [!WARNING]
> If you see a CORS error, ensure `config/cors.php` on Hostinger has `'allowed_origins' => ['http://localhost:4200'],` and you have run `php artisan config:clear` via SSH.

---

## Phase 4: Module Testing Sequence

Test the application module-by-module in this exact order. Keep the F12 Developer Tools open to monitor for `401`, `403`, `500`, and JSON Parse errors.

### 1. Authentication
- [ ] **Login:** Verify successful token return and storage in Local Storage/Session Storage.
- [ ] **Session Restore:** Refresh the page (`F5`) and ensure you remain logged in.
- [ ] **Logout:** Verify token is wiped and you are redirected to `/auth/login`.

### 2. Governance
- [ ] **Organizations:** Verify grid loads.
- [ ] **Departments:** Verify filtering by organization works.
- [ ] **Roles:** View available system roles.
- [ ] **Permissions:** View permission matrix.
- [ ] **Users:** View user list.

### 3. Assessment
- [ ] **Assessments:** View assessment list.
- [ ] **Question Banks:** View available banks.
- [ ] **Questions:** View question library.
- [ ] **Competencies:** View framework.
- [ ] **Blueprints:** View blueprint mappings.

### 4. Delivery
- [ ] **Sessions:** View assigned sessions.
- [ ] **Attempts:** Launch an attempt.
- [ ] **Questions:** Navigate through test UI.
- [ ] **Answers:** Select answers and verify network calls for auto-save.
- [ ] **Submission:** Submit attempt.

### 5. Results
- [ ] **Results:** View graded attempt scores.
- [ ] **Versions:** View score history.
- [ ] **Publication:** Check if results are visible to candidate.
- [ ] **Manual Review:** View the manual grading interface.

### 6. Reporting
- [ ] **Reports:** Load aggregate assessment report.
- [ ] **Analytics:** View trends dashboard.
- [ ] **Exports:** Test CSV/PDF export.

### 7. Certificates
- [ ] **View:** Load certificate preview.
- [ ] **Download:** Test PDF generation.
- [ ] **Verify:** Test public verification endpoint.

---

## Final Checklist
- [ ] Laravel deployed to Hostinger
- [ ] Database migrated and seeded
- [ ] CORS allows `http://localhost:4200`
- [ ] Local Angular `ng serve` running
- [ ] Browser Console free of 500/CORS errors during manual testing
