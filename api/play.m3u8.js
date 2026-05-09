export default async function handler(req, res) {
  // 1. استخراج رقم المباراة (id) من الرابط
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing ID");
  }

  // 2. الرابط الأصلي لسيرفر الأسطورة
  const targetUrl = `https://ostora.pages.dev/api/${id}.png`;

  try {
    // 3. جلب البث والتنكر كمتصفح
    const fetchResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
      }
    });

    if (!fetchResponse.ok) {
      return res.status(500).send("Error fetching from source");
    }

    const playlist = await fetchResponse.text();

    // 4. إرسال البث للمشغل بشكل مباشر وبدون قيود
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(playlist);

  } catch (error) {
    res.status(500).send("Server Error");
  }
}
