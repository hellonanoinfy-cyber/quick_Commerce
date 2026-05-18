using FirstCry.Domain.Common;
using FirstCry.Domain.Entities;

namespace FirstCry.Domain.Events;

public class ProductCreatedEvent : BaseEvent
{
    public ProductCreatedEvent(Product product)
    {
        Product = product;
    }

    public Product Product { get; }
}

public class ProductStockUpdatedEvent : BaseEvent
{
    public ProductStockUpdatedEvent(Product product)
    {
        Product = product;
    }

    public Product Product { get; }
}
