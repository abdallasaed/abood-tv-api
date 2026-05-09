export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing ID. Please add ?id=116900 to the URL");
  }

  const targetUrl = `https://ostora.pages.dev/api/${id}.png`;

  try {
    const fetchResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Referer": "https://ostora.pages.dev/",
        "Origin": "https://ostora.pages.dev"
      }
    });

    // التعديل هنا: طباعة الخطأ الحقيقي من سيرفر الأسطورة لكشفهم!
    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      return res.status(fetchResponse.status).send(`Error from Ostora: Status ${fetchResponse.status}. Details: ${errorText}`);
    }

    const playlist = await fetchResponse.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(playlist);

  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
}
