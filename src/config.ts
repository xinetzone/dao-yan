/**
 * Application configuration — single source of truth for backend endpoints.
 *
 * NOTE: SUPABASE_URL and SUPABASE_ANON_KEY are "publishable" values that are
 * intentionally embedded in frontend code (Supabase anon keys are designed to
 * be public). They are protected by Row Level Security on the database side.
 * The actual secret (AI_API_TOKEN) lives only in Edge Function environment vars.
 */
import { supabase } from "@/integrations/supabase/client";

// Extract URL and anon key from the already-created Supabase client so they
// are defined in exactly one place: src/integrations/supabase/client.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientConfig = (supabase as any).supabaseUrl as string | undefined;

// Fallback to known values (these match client.ts and are publishable by design)
export const SUPABASE_URL =
  clientConfig ?? "https://spb-t4nnhrh7ch7j2940.supabase.opentrust.net";

export const SUPABASE_ANON_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNwYi10NG5uaHJoN2NoN2oyOTQwIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzYwNzQ1MjMsImV4cCI6MjA5MTY1MDUyM30.5GFdUIA3rHOUoCI99ocBzBxDZjjQxOHRV-T6CKiHzCQ";

/** Edge function endpoint for AI chat */
export const AI_CHAT_ENDPOINT = `${SUPABASE_URL}/functions/v1/ai-chat-167c2bc1450e`;

/** Maximum characters allowed in a single user message */
export const MAX_MESSAGE_LENGTH = 8000;

/** Allowed URL schemes for document URL input */
export const ALLOWED_URL_SCHEMES = ["https:", "http:"];
