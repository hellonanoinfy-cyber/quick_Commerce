namespace FirstCry.Domain.Common;

/// <summary>
/// Extends BaseEntity with audit tracking fields.
/// Use for entities that need to track who created/modified them.
/// </summary>
public abstract class AuditableEntity : BaseEntity
{
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
}
