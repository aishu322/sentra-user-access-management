from django.contrib import admin

from .models import Permission, Role, RolePermission, UserRole  


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = (
        "code",
        "module",
        "action",
        "is_active",
    )

    list_filter = (
        "module",
        "is_active",
    )

    search_fields = (
        "code",
        "name",
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "is_system",
        "is_active",
    )

    list_filter = (
        "is_system",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
    )
    
@admin.register(RolePermission)
class RolePermissionAdmin(admin.ModelAdmin):
    list_display = (
        "role",
        "permission",
        "created_at",
    )

    search_fields = (
        "role__name",
        "permission__code",
    )

    autocomplete_fields = (
        "role",
        "permission",
    )
    
@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "role",
        "assigned_by",
        "assigned_at",
    )

    search_fields = (
        "user__email",
        "role__name",
    )

    autocomplete_fields = (
        "user",
        "role",
        "assigned_by",
    )

    list_filter = (
        "role",
    )