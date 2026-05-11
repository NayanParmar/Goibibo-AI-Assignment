using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TravelPort.Application.Common.Interfaces;

namespace TravelPort.Infrastructure.ExternalProviders.Email;

public class SendGridEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly EmailSettings _settings;
    private readonly ILogger<SendGridEmailService> _logger;

    public bool IsConfigured => _settings.Enabled && !string.IsNullOrWhiteSpace(_settings.ApiKey);

    public SendGridEmailService(HttpClient http, IOptions<EmailSettings> settings,
        ILogger<SendGridEmailService> logger)
    {
        _http     = http;
        _settings = settings.Value;
        _logger   = logger;

        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", _settings.ApiKey);
    }

    public async Task SendBookingConfirmationAsync(string toEmail, string toName, string bookingRef,
        string details, CancellationToken ct = default)
    {
        if (!IsConfigured)
        {
            _logger.LogInformation("Email skipped (SendGrid not configured) — would send confirmation to {Email}", toEmail);
            return;
        }

        var html = BuildBookingEmailHtml(toName, bookingRef, details);
        await SendAsync(toEmail, toName, $"Booking Confirmed — {bookingRef}", html, ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string toName, string resetLink, CancellationToken ct = default)
    {
        if (!IsConfigured)
        {
            _logger.LogInformation("Email skipped (SendGrid not configured) — reset link: {Link}", resetLink);
            return;
        }

        var html = BuildResetEmailHtml(toName, resetLink);
        await SendAsync(toEmail, toName, "Reset Your TravelPort Password", html, ct);
    }

    private async Task SendAsync(string toEmail, string toName, string subject, string htmlContent, CancellationToken ct)
    {
        var body = JsonSerializer.Serialize(new
        {
            personalizations = new[]
            {
                new { to = new[] { new { email = toEmail, name = toName } } }
            },
            from    = new { email = _settings.FromEmail, name = _settings.FromName },
            subject = subject,
            content = new[] { new { type = "text/html", value = htmlContent } }
        });

        var req = new HttpRequestMessage(HttpMethod.Post, "https://api.sendgrid.com/v3/mail/send")
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };

        try
        {
            var response = await _http.SendAsync(req, ct);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("SendGrid returned {Status}: {Body}", response.StatusCode, err);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SendGrid email send failed");
        }
    }

    private static string BuildBookingEmailHtml(string name, string bookingRef, string details) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
            <div style="background:#1a56db;color:#fff;padding:24px;text-align:center">
              <h1 style="margin:0;font-size:24px">✈ TravelPort</h1>
              <p style="margin:8px 0 0;opacity:.9">Your booking is confirmed!</p>
            </div>
            <div style="padding:32px">
              <p>Hi <strong>{name}</strong>,</p>
              <p>Your booking <strong style="color:#1a56db">{bookingRef}</strong> has been confirmed.</p>
              <div style="background:#f0f4ff;border-left:4px solid #1a56db;padding:16px;border-radius:4px;margin:16px 0">
                <pre style="margin:0;font-size:14px;white-space:pre-wrap">{details}</pre>
              </div>
              <p>You can view your booking in the <a href="http://localhost:5173/bookings" style="color:#1a56db">My Bookings</a> section.</p>
              <p style="margin-top:24px;color:#666;font-size:13px">
                Need help? Contact us at support@travelport.com
              </p>
            </div>
            <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:12px">
              © 2026 TravelPort. All rights reserved.
            </div>
          </div>
        </body>
        </html>
        """;

    private static string BuildResetEmailHtml(string name, string resetLink) => $"""
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
          <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden">
            <div style="background:#1a56db;color:#fff;padding:24px;text-align:center">
              <h1 style="margin:0">TravelPort</h1>
            </div>
            <div style="padding:32px">
              <p>Hi <strong>{name}</strong>,</p>
              <p>Click the button below to reset your password. This link expires in 1 hour.</p>
              <div style="text-align:center;margin:24px 0">
                <a href="{resetLink}"
                   style="background:#1a56db;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
                  Reset Password
                </a>
              </div>
              <p style="color:#666;font-size:13px">If you didn't request this, ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
        """;
}
