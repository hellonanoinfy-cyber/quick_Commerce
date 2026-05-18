namespace FirstCry.Domain.Entities.Orders;

public record ShippingAddress(
    string FullName,
    string Phone,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string State,
    string ZipCode,
    string Country = "India"
);
