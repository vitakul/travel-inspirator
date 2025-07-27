
### Database
- `supabase start` - Start local Supabase instance (requires Docker)
- `supabase db push` - Apply pending migrations without losing data (PREFERRED)
- `supabase db push --dry-run` - Preview what migrations would be applied
- `supabase db reset` - ⚠️ DESTRUCTIVE: Reset local database with migrations (ONLY use when absolutely necessary)
- `supabase db diff` - Generate migration files from schema changes
- `supabase gen types typescript --local > src/integrations/supabase/types.ts` - Regenerate TypeScript types
- `./setup_data.sh` - Setup test users and seed data (idempotent - preserves existing data)
- `./fix_data.sh` - Fix data issues (profiles without names, checklists without owners)
- `./recreate_data.sh` - ⚠️ DESTRUCTIVE: Recreate test users and seed data (only after db reset)

### ⚠️ IMPORTANT: Database Migration Best Practices
1. **NEVER use `supabase db reset` unless absolutely necessary** - it wipes all data
2. **Always use `supabase db push` to apply new migrations** - preserves existing data
3. **Run `supabase db push --dry-run` first** to preview changes
4. **Only reset database if there are breaking schema changes** that require it
5. **Always run `./recreate_data.sh` after a reset** to restore test data

### 🔧 Common Data Issues & Solutions

**Problem: "No data in app after database operations"**
- **Symptoms**: App shows no checklists, profiles missing names, user can't create trips
- **Root Cause**: Database operations can leave profiles without proper names and checklists without ownership
- **Quick Fix**: Run `./fix_data.sh` to repair data relationships
- **Prevention**: Use `./setup_data.sh` instead of `./recreate_data.sh` when possible


**Migration Workflow Summary:**
1. For schema changes: `supabase db push` (preserves data)
2. For data issues: `./fix_data.sh` (repairs relationships)
3. For clean slate: `supabase db reset` + `./recreate_data.sh` (nuclear option)

## Database Operations

**Common Patterns**
- Always use typed Supabase client with Database type
- Implement RLS policies for data security
- Use upsert operations for create/update scenarios
- Handle auth state in queries (user-specific data)

**Supabase Integration**
- - Local development requires Supabase CLI and Docker
- Database migrations in `supabase/migrations/`
- Types auto-generated from database schema
- Environment variables for local/remote switching

