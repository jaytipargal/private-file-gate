export default async function handler(req, res) {
  const TARGET_IP = '210.16.81.66';
  const TARGET_UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Mobile Safari/537.36';
  const GDRIVE_FILE_ID = '1LrywQ1WcuA86rzCrVSyUrhQ8_w78vKPw';
  const ACCESS_KEY = 'V3x0rK1ll$2024';

  const clientIP = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
                   || req.socket.remoteAddress;
  const clientUA = req.headers['user-agent'] || '';

  const isAuthorized =
    (clientIP === TARGET_IP && clientUA === TARGET_UA) ||
    (req.method === 'POST' && req.body?.key === ACCESS_KEY);

  if (isAuthorized) {
    const driveUrl = `https://drive.google.com/uc?export=download&id=${GDRIVE_FILE_ID}`;
    const driveRes = await fetch(driveUrl);
    if (!driveRes.ok) return res.status(502).send('Could not fetch file from Drive.');

    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="app.apk"');
    return res.send(Buffer.from(await driveRes.arrayBuffer()));
  }

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Access Restricted</title></head>
<body style="background:#f5f5f5;color:#333;text-align:center;padding-top:20%;font-family:sans-serif;">
  <h1>Restricted Download</h1>
  <p>Enter your access key to continue.</p>
  <form method="POST">
    <input name="key" type="password" placeholder="Access key"
           style="padding:10px;font-size:16px;border:1px solid #ccc;width:250px;" />
    <br><br>
    <button type="submit" style="padding:10px 30px;font-size:16px;background:#0070f3;color:#fff;border:none;cursor:pointer;">Submit</button>
  </form>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
}