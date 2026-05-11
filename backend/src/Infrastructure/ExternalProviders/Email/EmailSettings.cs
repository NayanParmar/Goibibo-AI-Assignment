namespace TravelPort.Infrastructure.ExternalProviders.Email;

public class EmailSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "noreply@travelport.com";
    public string FromName { get; set; } = "TravelPort";
    public bool Enabled { get; set; } = false;
}
