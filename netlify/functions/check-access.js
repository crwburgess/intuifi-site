export default async (req, context) => {
  const url = new URL(req.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();

  if (!email) {
    return new Response("Missing email", { status: 400 });
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

  if (allowedEmails.includes(email)) {
    return Response.redirect(new URL("/reports/test/report-data.html", req.url), 302);
  }

  return new Response(
    `<!DOCTYPE html><html><body style="font-family: system-ui, sans-serif; text-align: center; padding: 60px;">
      <h1>Sorry, you're not registered</h1>
      <p>This email isn't on the access list for this report. Contact Chris if you think this is a mistake.</p>
    </body></html>`,
    { status: 403, headers: { "Content-Type": "text/html" } }
  );
};
