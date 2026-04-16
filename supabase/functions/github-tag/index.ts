// v2 - supports delete action
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type" } });
  }
  const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
  if (!GITHUB_TOKEN) return new Response(JSON.stringify({ error: "no token" }), { status: 500 });

  const body = await req.json();
  const headers = {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
    "User-Agent": "dao-yan-tag/2.0",
  };
  const { owner, repo } = body;
  const base = `https://api.github.com/repos/${owner}/${repo}`;

  // DELETE mode
  if (body.action === "delete") {
    console.log("[v2] delete mode, tags:", body.tags || body.tag);
    const tagsToDelete: string[] = Array.isArray(body.tags) ? body.tags : [body.tag];
    const results = [];
    for (const name of tagsToDelete) {
      const url = `${base}/git/refs/tags/${name}`;
      console.log("[v2] DELETE", url);
      const res = await fetch(url, { method: "DELETE", headers });
      const status = res.status === 204 ? "deleted" : `error:${res.status}`;
      results.push({ tag: name, status });
    }
    return new Response(JSON.stringify({ v: 2, results }), {
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
    });
  }

  // CREATE mode
  const { tags } = body;
  const results = [];
  for (const tag of tags) {
    try {
      const tagObjRes = await fetch(`${base}/git/tags`, {
        method: "POST", headers,
        body: JSON.stringify({ tag: tag.name, message: tag.message, object: tag.sha, type: "commit" }),
      });
      const tagObj = await tagObjRes.json();
      if (!tagObjRes.ok) { results.push({ tag: tag.name, error: tagObj.message }); continue; }

      const refRes = await fetch(`${base}/git/refs`, {
        method: "POST", headers,
        body: JSON.stringify({ ref: `refs/tags/${tag.name}`, sha: tagObj.sha }),
      });
      if (!refRes.ok) {
        const upRes = await fetch(`${base}/git/refs/tags/${tag.name}`, {
          method: "PATCH", headers,
          body: JSON.stringify({ sha: tagObj.sha, force: true }),
        });
        results.push({ tag: tag.name, status: upRes.ok ? "updated" : "error", sha: tagObj.sha });
      } else {
        results.push({ tag: tag.name, status: "created", sha: tagObj.sha });
      }
    } catch (e) {
      results.push({ tag: tag.name, error: String(e) });
    }
  }
  return new Response(JSON.stringify({ v: 2, results }), {
    headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
  });
});
