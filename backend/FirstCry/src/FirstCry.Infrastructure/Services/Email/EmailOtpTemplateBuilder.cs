namespace FirstCry.Infrastructure.Services.Email;

internal static class EmailOtpTemplateBuilder
{
    public static (string Subject, string PlainText, string Html) Build(string otp, int expiryMinutes)
    {
        const string brand = "MummaXpress";
        var subject = $"{brand} login code: {otp}";

        var plain = $"""
            Your {brand} login code is {otp}.

            This code expires in {expiryMinutes} minutes.
            Do not share this code with anyone.

            If you did not request this, you can ignore this email.
            """;

        var html = $"""
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
            <body style="margin:0;padding:0;background:#FAF8FF;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:24px auto;background:#fff;border-radius:16px;border:1px solid #E9DFFC;">
                <tr><td style="padding:28px 24px 8px;text-align:center;">
                  <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:.2em;color:#6A0DAD;text-transform:uppercase;">{brand}</p>
                  <h1 style="margin:12px 0 0;font-size:22px;color:#1A1A1A;">Your login code</h1>
                </td></tr>
                <tr><td style="padding:16px 24px;text-align:center;">
                  <p style="margin:0 0 12px;font-size:14px;color:#6B6B6B;">Enter this code to sign in:</p>
                  <p style="margin:0;font-size:32px;font-weight:800;letter-spacing:.35em;color:#6A0DAD;">{otp}</p>
                </td></tr>
                <tr><td style="padding:8px 24px 24px;">
                  <p style="margin:0;font-size:13px;line-height:1.5;color:#6B6B6B;text-align:center;">
                    Expires in <strong>{expiryMinutes} minutes</strong>. Never share this code.
                  </p>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        return (subject, plain, html);
    }
}
