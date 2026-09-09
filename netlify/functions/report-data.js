export default async (req, context) => {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();

  const formHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Strategic Insights Report | Intuifi</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f7f8fa; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 32px; max-width: 360px; width: 100%; text-align: center; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    p { color: #6b7280; font-size: 14px; margin: 0 0 20px; }
    input { width: 100%; padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 12px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #0f766e; color: #fff; border: 0; border-radius: 8px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Strategic Insights Report</h1>
    <p>Enter your email address to view this report.</p>
    <form action="/reports/test/report-data.html" method="GET">
      <input type="email" name="email" placeholder="you@company.com" required />
      <button type="submit">View report</button>
    </form>
  </div>
</body>
</html>`;

  const refusalHtml = `<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; text-align: center; padding: 60px;">
  <h1>Sorry, you're not registered</h1>
  <p>This email isn't on the access list for this report. Contact Chris if you think this is a mistake.</p>
</body></html>`;

  if (!email) {
    return new Response(formHtml, { headers: { "Content-Type": "text/html" } });
  }

  const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRaz5GL7J781oeTcY2YGJAfgHAis1wVjiR_lkNZqr_Fx2RHGKGBoFK6xL-r9bARdz6zFWclXc6PyjDc/pub?output=csv";
  const sheetRes = await fetch(sheetCsvUrl);
  if (!sheetRes.ok) {
    return new Response("Could not check access list. Try again shortly.", { status: 502 });
  }
  const csvText = await sheetRes.text();
  const allowedEmails = csvText
    .split("\n")
    .map(line => line.trim().replace(/^"|"$/g, "").toLowerCase())
    .filter(Boolean);

  if (!allowedEmails.includes(email)) {
    return new Response(refusalHtml, { status: 403, headers: { "Content-Type": "text/html" } });
  }

  const reportRes = await fetch("https://raw.githubusercontent.com/crwburgess/intuifi-site/main/reports/test/_report-source.html");
  if (!reportRes.ok) {
    return new Response("Report not available yet.", { status: 404 });
  }
  const reportHtml = await reportRes.text();
  return new Response(reportHtml, { headers: { "Content-Type": "text/html" } });
};
