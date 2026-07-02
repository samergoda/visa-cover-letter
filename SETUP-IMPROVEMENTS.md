# Setup Improvements Guide

## Changes Made

### 1. Enhanced Date Picker
- Added month and year dropdown selectors
- Year dropdown shows 120 years (current year backwards)
- Makes it easier to select birth dates and older dates
- No more clicking through months/years one by one

### 2. Family Visa Support
- Added checkbox for "Family Visa" when marital status is "married"
- When enabled, shows fields for:
  - Spouse full name
  - Spouse date of birth
  - Spouse nationality
  - Spouse passport number
  - Number of children
  - Children details (textarea for multiple children info)

### 3. Multi-Step Form for New Applications
- New applications now use a 4-step wizard:
  - Step 1: Personal Information (including family visa if married)
  - Step 2: Passport Details
  - Step 3: Travel Information
  - Step 4: Additional Information (sponsor, insurance)
- Progress indicator shows current step
- Previous/Next buttons for navigation
- Improves UX by breaking down the long form

### 4. Fixed Storage Upload Issue
To fix the "Bucket not found" error, you need to:

**Option A: Run the SQL migration in Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase-migration-family-visa.sql`
5. Click "Run" to execute

**Option B: Manual Setup in Supabase Dashboard**
1. Go to Storage in Supabase Dashboard
2. Click "Create a new bucket"
3. Name it: `applicant-documents`
4. Make it **public**
5. Click Create

Then set policies:
- Go to the bucket settings
- Add these policies:
  - Public read access
  - Allow uploads
  - Allow deletes

### 5. Prettier & ESLint Setup
Added Prettier for code formatting:

```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check
```

Configuration files created:
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore

## Database Migration

The migration file `supabase-migration-family-visa.sql` adds:
- 7 new columns to `applicants` table for family visa data
- Creates the `applicant-documents` storage bucket
- Sets up proper storage policies

## Running the Project

```bash
# Install dependencies (if needed)
npm install

# Format code
npm run format

# Start development server
npm run dev
```

## UX Improvements Summary

1. **Easier Date Selection**: Dropdown year/month selectors
2. **Conditional Fields**: Family visa fields only show when needed
3. **Progressive Disclosure**: Multi-step form breaks complexity
4. **Clear Progress**: Visual step indicator
5. **Better Navigation**: Previous/Next buttons with auto-scroll
6. **Consistent Formatting**: Prettier ensures code quality

## Testing

1. Start the dev server: `npm run dev`
2. Go to `/applicants/new`
3. Test the multi-step form:
   - Fill personal info
   - Select "married" as marital status
   - Check "Family visa" checkbox
   - Fill family details
   - Click "Next Step" through each section
4. Test date picker:
   - Click any date field
   - Use month/year dropdowns
   - Select a date from the past
5. Test document upload after fixing bucket

## Next Steps

1. **Run the SQL migration** in Supabase to fix storage and add family fields
2. Test the new form flow
3. Consider adding validation for family visa fields (spouse required if checkbox checked)
4. Add form field persistence (save draft as user types)
5. Consider adding a summary/review step before submission
