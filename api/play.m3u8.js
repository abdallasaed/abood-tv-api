export default function handler(req, res) {
  // 1. استخراج الـ id
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing ID");
  }

  // 2. رابط الأسطورة الأصلي
  const targetUrl = `https://ostora.pages.dev/api/${id}.png`;

  // 3. الضربة القاضية: تحويل مسار (Redirect) مباشر للأسطورة!
  res.redirect(302, targetUrl);
}
