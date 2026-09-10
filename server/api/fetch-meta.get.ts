export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const targetUrl = String(query.url || "").trim();

  if (!targetUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "URL is required"
    });
  }

  try {
    const urlObj = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
    const response = await fetch(urlObj.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HomeportBot/1.0; +https://homeport.local)"
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return {
        title: "",
        description: "",
        domain: urlObj.hostname
      };
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) ||
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : "",
      description: descMatch ? descMatch[1].trim() : "",
      domain: urlObj.hostname
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Fetch failed",
      title: "",
      description: ""
    };
  }
});
