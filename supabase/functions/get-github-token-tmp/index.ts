import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
serve(async () => {
  return new Response(JSON.stringify({ error: "retired" }), {
    status: 410,
    headers: { "Content-Type": "application/json" },
  });
});
