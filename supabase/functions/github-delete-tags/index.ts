Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }
  const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
  if (!GITHUB_TOKEN) return new Response(JSON.stringify({ error: "no token" }), { status: 500 });

  const { owner, repo, tags } = await req.json();
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "dao-yan-tag/2.0",
  };
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const results = [];
  for (const name of tags) {
    const res = await fetch(`${base}/git/refs/tags/${name}`, { method: "DELETE", headers });
    results.push({ tag: name, status: res.status === 204 ? "deleted" : `error:${res.status}` });
  }
  return new Response(JSON.stringify({ results }), {
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
  });
});
