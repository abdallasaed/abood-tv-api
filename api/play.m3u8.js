export default async function handler(req, res) {
  // 1. ندعم سحب الـ ID أو سحب رابط قائمة فرعية (URL)
  const { id, url: proxyUrl } = req.query;
  if (!id && !proxyUrl) return res.status(400).send("Missing ID or URL");

  // 2. تحديد الهدف (إما رابط جديد أو رابط الأسطورة الأصلي)
  const targetUrl = proxyUrl ? decodeURIComponent(proxyUrl) : `https://ostora.pages.dev/api/${id}.png`;

  try {
    // 3. سحب البيانات والتخفي كمتصفح
    const fetchResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Referer": "https://ostora.pages.dev/",
        "Origin": "https://ostora.pages.dev"
      }
    });

    if (!fetchResponse.ok) return res.status(fetchResponse.status).send(`Error: ${fetchResponse.status}`);

    // استخراج المسار الأساسي لترميم الروابط
    const finalUrl = fetchResponse.url;
    const basePath = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);
    const playlistText = await fetchResponse.text();

    // تجهيز رابط Vercel الخاص بك لإعادة توجيه القوائم الفرعية إليه
    const myHost = req.headers.host;
    const myProtocol = req.headers['x-forwarded-proto'] || 'https';
    const vercelProxyBase = `${myProtocol}://${myHost}/api/play.m3u8?url=`;

    // 4. السحر هنا: قراءة الملف وتوزيع المهام
    let newPlaylist = playlistText.split('\n').map(line => {
      let trimmed = line.trim();
      // إذا كان السطر عبارة عن رابط...
      if (trimmed && !trimmed.startsWith('#')) {
        let absoluteLink = trimmed;
        if (!trimmed.startsWith('http')) {
          absoluteLink = basePath + trimmed;
        }

        // إذا كان الرابط قائمة فرعية، نرجعه لـ Vercel ليقوم هو بفتحه وتخطي الحظر
        if (absoluteLink.includes('.m3u8') || absoluteLink.includes('.json')) {
          return vercelProxyBase + encodeURIComponent(absoluteLink);
        } else {
          // إذا كان الرابط جزء فيديو مباشر (.ts)، نعطيه للتطبيق ليسحبه بسرعة
          return absoluteLink;
        }
      }
      return line;
    }).join('\n');

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(newPlaylist);

  } catch (error) {
    res.status(500).send("Server Error");
  }
}
