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

    if (!fetchResponse.ok) {
      return res.status(fetchResponse.status).send(`Error: Status ${fetchResponse.status}`);
    }

    // هنا بنجيب الرابط النهائي (في حال الأسطورة عملوا تحويل مسار)
    const finalUrl = fetchResponse.url;
    // هنا بنستخرج المسار الأساسي عشان نكمل فيه الروابط الناقصة
    const basePath = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);

    const playlistText = await fetchResponse.text();

    // التعديل السحري: قراءة الملف وتكميل الروابط الناقصة
    let newPlaylist = playlistText.split('\n').map(line => {
      let trimmedLine = line.trim();
      // إذا السطر مش فاضي، وما بيبدأ بـ #، وما بيبدأ بـ http (يعني رابط ناقص)
      if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('http')) {
        return basePath + trimmedLine; // كمل الرابط وخليه يروح للأسطورة!
      }
      return line;
    }).join('\n');

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.status(200).send(newPlaylist);

  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
}
