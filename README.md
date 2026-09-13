# Efootball Arena 🚀

منصة تنافسية مغربية لـ eFootball للمباريات المدفوعة 1vs1، البطولات، الترتيب، والمحفظة.

---

## 🚀 البدء السريع

### المتطلبات:
- Node.js 20+
- pnpm 9+
- حساب Supabase (مجاني)

---

## 📦 التثبيت

```bash
# تثبيت التبعيات
pnpm install
```

---

## 🔧 إعداد قاعدة البيانات (Supabase)

### الخطوة 1: إنشاء مشروع Supabase
1. اذهب إلى [https://supabase.com](https://supabase.com)
2. أنشئ مشروعاً جديداً
3. اذهب إلى **Settings** → **API** وانسخ:
   - Project URL
   - anon public key
   - service_role key

### الخطوة 2: إعداد ملف .env
أنشئ ملف `.env` في جذر المشروع:

```env
# Frontend (Vite)
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY

# Backend (سري!)
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY

# Database (اختياري)
DATABASE_URL=postgresql://...

# Environment
NODE_ENV=development
PORT=5173
BASE_PATH=/
```

### الخطوة 3: تطبيق قاعدة البيانات
```bash
# شغّل سكربت الـ migration
node scripts/run-migration.cjs
```

### الخطوة 4: إنشاء SuperAdmin
```bash
# شغّل سكربت إنشاء الحساب
node scripts/create-superadmin.cjs
```

---

## ▶️ تشغيل التطبيق

### التطبيق (Frontend):
```bash
pnpm --filter @workspace/efootball-arena run dev
```
- سيفتح على: `http://localhost:5173`

### الخادم (Backend API):
```bash
pnpm --filter @workspace/api-server run dev
```
- سيفتح على: `http://localhost:5000`

---

## 🔑 بيانات SuperAdmin

بعد تشغيل سكربت إنشاء الحساب، ستظهر لك البيانات:

```
Email:    admin@efootball-arena.ma
Password: SuperAdmin2024!@#
Username: superadmin
Role:     ADMIN
```

⚠️ **مهم:** غيّر كلمة المرور بعد أول تسجيل دخول!

---

## 📋 الأوامر المتاحة

```bash
# تثبيت التبعيات
pnpm install

# تشغيل التطبيق
pnpm --filter @workspace/efootball-arena run dev

# تشغيل الـ API
pnpm --filter @workspace/api-server run dev

# بناء التطبيق للإنتاج
pnpm --filter @workspace/efootball-arena run build

# فحص TypeScript
pnpm run typecheck

# تطبيق قاعدة البيانات
node scripts/run-migration.cjs

# إنشاء SuperAdmin
node scripts/create-superadmin.cjs
```

---

## 📂 هيكل المشروع

```
efootball-arena/
├── artifacts/
│   ├── efootball-arena/          # التطبيق (React + Vite)
│   │   ├── src/
│   │   │   ├── App.tsx           # التطبيق الرئيسي
│   │   │   ├── main.tsx          # نقطة الدخول
│   │   │   └── ...
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api-server/               # الخادم (Express)
│       ├── src/
│       └── package.json
├── lib/
│   ├── db/                       # قاعدة البيانات (Drizzle)
│   ├── api-client-react/         # عميل API (React Query)
│   └── api-zod/                  # مخططات Zod
├── supabase/
│   └── migrations/
│       └── 20260911_arena.sql    # قاعدة البيانات
├── scripts/
│   ├── run-migration.cjs         # سكربت الـ migration
│   ├── create-superadmin.cjs     # سكربت SuperAdmin
│   └── fix-rls.cjs               # إصلاح RLS
├── .env                           # المتغيرات البيئية
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
└── vercel.json                   # إعدادات Vercel
```

---

## 🌐 النشر على Vercel

المشروع جاهز للنشر على Vercel! فقط ارفعه على GitHub واربطه بـ Vercel.

### المتغيرات البيئية في Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🔐 SuperAdmin Dashboard

بعد تسجيل الدخول كـ SuperAdmin، يمكنك:
- إدارة المباريات والتحديات
- الموافقة على طلبات الشحن
- إدارة المستخدمين
- إعدادات المنصة
- عرض الإحصائيات

---

## 📊 الجداول في قاعدة البيانات

| الجدول | الوظيفة |
|--------|---------|
| `users` | حسابات اللاعبين والمديرين |
| `matches` | مباريات التحديات 1v1 |
| `match_messages` | رسائل الدردشة |
| `tournaments` | البطولات |
| `tournament_participants` | مشاركة اللاعبين |
| `transactions` | المعاملات المالية |
| `recharges` | طلبات الشحن |
| `settings` | إعدادات المنصة |

---

## 🆘 المساعدة

إذا واجهت مشكلة:
1. تأكد أن ملف `.env` صحيح
2. تأكد أن Supabase يعمل
3. جرب `pnpm install` ثم أعد التشغيل
4. تحقق من السجلات في الترمينال

---

## 📝 ملاحظات

- ملف `.env` مضاف إلى `.gitignore` (لن يُرفع على GitHub)
- غيّر كلمة مرور SuperAdmin فوراً
- قاعدة البيانات تُطبق مرة واحدة فقط
- RLS مفعّل على جميع الجداول
