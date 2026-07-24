from django.db import models
from django.conf import settings


class Permission(models.Model):
    """
    Represents a single application permission.
    """

    module = models.CharField(max_length=100)
    action = models.CharField(max_length=100)

    code = models.CharField(
        max_length=150,
        unique=True,
    )

    name = models.CharField(max_length=150)

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "permissions"
        ordering = ["module", "action"]
        indexes = [
            models.Index(fields=["module"]),
            models.Index(fields=["action"]),
            models.Index(fields=["code"]),
        ]

    def __str__(self):
        return self.code


class Role(models.Model):
    """
    Business role used by the RBAC engine.
    """

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    code = models.CharField(
        max_length=100,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    is_system = models.BooleanField(
        default=False,
        help_text="System roles cannot be deleted.",
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        db_table = "roles"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["code"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name
    
class RolePermission(models.Model):
    """
    Maps permissions to roles.
    """

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role_permissions",
    )

    permission = models.ForeignKey(
        Permission,
        on_delete=models.CASCADE,
        related_name="permission_roles",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        db_table = "role_permissions"

        constraints = [
            models.UniqueConstraint(
                fields=["role", "permission"],
                name="unique_role_permission",
            )
        ]

        ordering = [
            "role",
            "permission",
        ]
        
        indexes = [
            models.Index(fields=["role"]),
            models.Index(fields=["permission"]),
        ]

    def __str__(self):
        return f"{self.role.name} -> {self.permission.code}"
    



class UserRole(models.Model):
    """
    Maps users to roles.
    A user may have multiple roles.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_roles",
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        related_name="role_users",
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True,
    )

    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_roles",
    )

    class Meta:
        db_table = "user_roles"

        constraints = [
            models.UniqueConstraint(
                fields=["user", "role"],
                name="unique_user_role",
            )
        ]

        ordering = [
            "user",
            "role",
        ]

        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["role"]),
        ]
        
    def __str__(self):
        return f"{self.user.email} -> {self.role.name}"