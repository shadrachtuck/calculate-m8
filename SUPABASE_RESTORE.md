# Supabase Database Restore Guide

This guide will help you restore your Supabase database from a backup after the project was shut down.

## Step 1: Check Project Status

1. Log into [Supabase Dashboard](https://app.supabase.com)
2. Check if your project appears as **paused** (not deleted)
   - If paused: You can usually **restart/unpause** it directly from the dashboard
   - If it's been paused for more than 90 days: You may need to download the backup and restore to a new project

## Step 2: Download Backup (if needed)

If you need to restore to a new project:

1. Go to **Settings** → **Database** → **Backups**
2. Download the backup file (usually a `.sql` or `.backup` file)
3. Note: Backups may be split into multiple files:
   - `roles.sql` - Database roles and permissions
   - `schema.sql` - Database schema (tables, functions, etc.)
   - `data.sql` - Actual data

## Step 3: Create/Restore Project

### Option A: Unpause Existing Project (if available)

If your project is paused and can be unpaused:
1. Click **Restart** or **Unpause** in the dashboard
2. Wait for the project to restart
3. Verify your database is accessible
4. Update your `.env` file with the project credentials

### Option B: Restore to New Project

If you need to create a new project:

1. **Create a new Supabase project** from the dashboard
2. **Reset the database password** in Settings → Database → Database Settings
3. **Get the connection string**:
   - Go to Settings → Database
   - Copy the connection string (use "Session pooler" or "Direct connection")
   - Replace `[YOUR-PASSWORD]` with the password you just set

## Step 4: Restore Database

### Using Supabase CLI (Recommended)

1. Install Supabase CLI (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Restore from backup file:
   ```bash
   supabase db restore --file path/to/backup.sql
   ```

### Using psql (Alternative)

If you have a `.sql` backup file:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < backup.sql
```

If you have split backup files (roles.sql, schema.sql, data.sql):

```bash
psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file roles.sql \
  --file schema.sql \
  --command 'SET session_replication_role = replica' \
  --file data.sql \
  "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Using pg_restore (for .backup files)

```bash
pg_restore \
  --verbose \
  --clean \
  --no-acl \
  --no-owner \
  -d "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  backup.backup
```

## Step 5: Verify Restore

1. Check that your `computations` table exists:
   ```sql
   SELECT * FROM computations LIMIT 10;
   ```

2. Verify the table structure matches:
   ```sql
   \d computations
   ```

3. Check row count:
   ```sql
   SELECT COUNT(*) FROM computations;
   ```

## Step 6: Update Environment Variables

Update your `.env` file with the new project credentials:

```env
VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

You can find these in:
- **Settings** → **API** → **Project URL** (for VITE_SUPABASE_URL)
- **Settings** → **API** → **anon/public key** (for VITE_SUPABASE_ANON_KEY)

## Step 7: Recreate Table (if backup doesn't include schema)

If your backup doesn't include the schema, you can recreate the table:

```sql
CREATE TABLE IF NOT EXISTS computations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  computation text NOT NULL,
  result numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

## Troubleshooting

### "Project not found" or "Access denied"
- Verify you're using the correct project reference
- Check that your database password is correct
- Ensure you have the right permissions on the project

### "Table already exists" errors
- This is normal if restoring to an existing project
- You can drop and recreate, or use `--clean` flag with pg_restore

### Missing data
- Verify the backup file is complete
- Check if the backup includes data (not just schema)
- Some backups may only include schema, not data

### Connection issues
- Use the "Direct connection" string instead of "Session pooler"
- Check your IP is not blocked (may need to add to allowed IPs in Supabase settings)
