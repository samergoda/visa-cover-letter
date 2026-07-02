# 🗄️ How to Update Supabase Database

## Quick Steps (5 minutes)

### 📍 Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Login with your account
3. You'll see your projects list

### 📍 Step 2: Select Your Project
- Look for the project with URL: `https://eyphpixcyulwoeldxfza.supabase.co`
- Click on it

### 📍 Step 3: Open SQL Editor
- Look at the **left sidebar**
- Click on **"SQL Editor"** (looks like `</>` icon)

```
Left Sidebar:
├── 🏠 Home
├── 📊 Table Editor
├── 🔍 Database
├── 💾 Storage
├── 📝 SQL Editor  ← Click here!
├── 🔐 Authentication
└── ...
```

### 📍 Step 4: Create New Query
- Click **"New query"** button (top right corner)
- You'll see an empty SQL editor

### 📍 Step 5: Copy and Paste SQL

**Copy ALL of this SQL:**

```sql
-- ============================================================
-- Migration: Add Family Visa Fields and Storage Bucket
-- ============================================================

-- Add family visa fields to applicants table
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS is_family_visa BOOLEAN DEFAULT FALSE;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_full_name TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_date_of_birth DATE;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_nationality TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS spouse_passport_number TEXT;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS number_of_children INTEGER;
ALTER TABLE applicants ADD COLUMN IF NOT EXISTS children_info TEXT;

-- Create storage bucket for applicant documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('applicant-documents', 'applicant-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for applicant-documents bucket
CREATE POLICY IF NOT EXISTS "Public read access for applicant documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'applicant-documents');

CREATE POLICY IF NOT EXISTS "Allow uploads for applicant documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'applicant-documents');

CREATE POLICY IF NOT EXISTS "Allow deletes for applicant documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'applicant-documents');

-- Comment on new columns
COMMENT ON COLUMN applicants.is_family_visa IS 'Flag indicating if this is a family visa application';
COMMENT ON COLUMN applicants.spouse_full_name IS 'Full name of spouse if family visa';
COMMENT ON COLUMN applicants.spouse_date_of_birth IS 'Date of birth of spouse if family visa';
COMMENT ON COLUMN applicants.spouse_nationality IS 'Nationality of spouse if family visa';
COMMENT ON COLUMN applicants.spouse_passport_number IS 'Passport number of spouse if family visa';
COMMENT ON COLUMN applicants.number_of_children IS 'Number of children included in family visa';
COMMENT ON COLUMN applicants.children_info IS 'Details of children (name, DOB, passport) if family visa';
```

**Paste it into the SQL editor**

### 📍 Step 6: Run the SQL
- Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
- Wait for it to complete (should take 1-2 seconds)

### ✅ Step 7: Verify Success

You should see:
```
Success. No rows returned
```

Or you might see messages like:
```
✓ 7 columns added
✓ 1 bucket created
✓ 3 policies created
```

---

## 🎯 What This Does

### 1. Adds Family Visa Columns
Adds these 7 columns to your `applicants` table:
- `is_family_visa` (checkbox)
- `spouse_full_name` (text)
- `spouse_date_of_birth` (date)
- `spouse_nationality` (text)
- `spouse_passport_number` (text)
- `number_of_children` (number)
- `children_info` (text)

### 2. Creates Storage Bucket
Creates the `applicant-documents` bucket for file uploads

### 3. Sets Up Permissions
Allows your app to:
- ✅ Upload documents
- ✅ Read documents
- ✅ Delete documents

---

## 🔍 Verify It Worked

### Check 1: Verify Columns
1. In Supabase Dashboard, click **"Table Editor"** (left sidebar)
2. Click on **"applicants"** table
3. Scroll right in the columns
4. You should see the new columns:
   - `is_family_visa`
   - `spouse_full_name`
   - `spouse_date_of_birth`
   - etc.

### Check 2: Verify Storage Bucket
1. In Supabase Dashboard, click **"Storage"** (left sidebar)
2. You should see a bucket named: **`applicant-documents`**
3. Click on it - it should be **Public**

### Check 3: Test Upload
1. Start your app: `npm run dev`
2. Go to an applicant detail page
3. Try uploading a document
4. Should work without "Bucket not found" error! ✅

---

## 🐛 Troubleshooting

### Problem: "relation applicants does not exist"
**Cause**: The `applicants` table hasn't been created yet

**Solution**: 
1. Run the main schema first: `supabase-schema.sql`
2. Then run this migration

### Problem: "duplicate key value violates unique constraint"
**Cause**: The bucket already exists (that's OK!)

**Solution**: The `ON CONFLICT DO NOTHING` handles this - it's safe

### Problem: "permission denied for table storage.buckets"
**Cause**: You're using the wrong Supabase credentials

**Solution**:
1. Make sure you're logged in as the owner
2. Or use the Service Role Key (in SQL Editor, it uses admin by default)

### Problem: SQL runs but nothing happens
**Check**:
1. Look for green "Success" message at bottom
2. If it says "Success. No rows returned" - that's correct!
3. Verify in Table Editor that columns exist

---

## 📋 Alternative Method: Manual Creation

If the SQL doesn't work, create manually:

### Manual: Create Storage Bucket
1. Dashboard → **Storage** (left sidebar)
2. Click **"New bucket"**
3. Settings:
   - Name: `applicant-documents`
   - Public: ✅ **Checked**
4. Click **"Create bucket"**
5. Go to bucket → **Policies** tab
6. Add policies:
   - "Public read access" - SELECT
   - "Allow uploads" - INSERT
   - "Allow deletes" - DELETE

### Manual: Add Columns
1. Dashboard → **Table Editor** → `applicants`
2. Click **"+"** (add column) for each:

| Column Name | Type | Default | Nullable |
|-------------|------|---------|----------|
| `is_family_visa` | boolean | false | ✅ |
| `spouse_full_name` | text | - | ✅ |
| `spouse_date_of_birth` | date | - | ✅ |
| `spouse_nationality` | text | - | ✅ |
| `spouse_passport_number` | text | - | ✅ |
| `number_of_children` | int4 | - | ✅ |
| `children_info` | text | - | ✅ |

---

## ✅ You're Done!

After running the migration:
- ✅ Family visa fields are in the database
- ✅ Storage bucket is created
- ✅ Upload errors are fixed
- ✅ App can save spouse/children data

Now test your app:
```bash
npm run dev
# Go to: http://localhost:3000/applicants/new
```

Fill out the form with a married person → check "Family visa" → it should save! 🎉

---

## 📞 Need Help?

### Check Logs
If something fails, check the error message in the SQL Editor. Common issues:
- Typo in table name
- Wrong schema/database selected
- Permission issues

### Rollback (If Needed)
To undo the changes:
```sql
-- Remove columns
ALTER TABLE applicants DROP COLUMN IF EXISTS is_family_visa;
ALTER TABLE applicants DROP COLUMN IF EXISTS spouse_full_name;
ALTER TABLE applicants DROP COLUMN IF EXISTS spouse_date_of_birth;
ALTER TABLE applicants DROP COLUMN IF EXISTS spouse_nationality;
ALTER TABLE applicants DROP COLUMN IF EXISTS spouse_passport_number;
ALTER TABLE applicants DROP COLUMN IF EXISTS number_of_children;
ALTER TABLE applicants DROP COLUMN IF EXISTS children_info;

-- Remove bucket (careful - deletes all documents!)
DELETE FROM storage.buckets WHERE id = 'applicant-documents';
```

---

**That's it!** Your Supabase database is now updated. 🚀
