include .env

gentypes:
	npx supabase gen types typescript --project-id $(SUPABASE_PROJECT_ID) > src/utils/supabase/types_db.ts
