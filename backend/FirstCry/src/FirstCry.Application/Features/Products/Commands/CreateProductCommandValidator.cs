namespace FirstCry.Application.Features.Products.Commands;

using FluentValidation;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.");

        RuleFor(v => v.Slug)
            .NotEmpty().WithMessage("Slug is required.")
            .MaximumLength(200).WithMessage("Slug must not exceed 200 characters.");

        RuleFor(v => v.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0.");

        RuleFor(v => v.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative.");

        RuleFor(v => v.CategoryId)
            .NotEmpty().WithMessage("Category ID is required.");

        RuleFor(v => v.BrandId)
            .NotEmpty().WithMessage("Brand ID is required.");

        RuleFor(v => v.ImageUrls)
            .NotEmpty().WithMessage("At least one product image is required.");
    }
}
