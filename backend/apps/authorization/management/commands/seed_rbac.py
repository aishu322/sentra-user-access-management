from django.core.management.base import BaseCommand

from apps.authorization.models import (
    Permission,
    Role,
    RolePermission,
    UserRole,
)
from apps.users.models import User


class Command(BaseCommand):
    help = "Seed default RBAC data"

    def handle(self, *args, **options):

        permissions = [
            ("users", "view"),
            ("users", "create"),
            ("users", "update"),
            ("users", "delete"),
            ("roles", "view"),
            ("roles", "create"),
            ("roles", "update"),
            ("roles", "delete"),
            ("dashboard", "view"),
            ("audit", "view"),
        ]

        permission_objects = {}

        for module, action in permissions:
            permission, _ = Permission.objects.get_or_create(
                code=f"{module}.{action}",
                defaults={
                    "module": module,
                    "action": action,
                    "name": f"{module.title()} {action.title()}",
                },
            )
            permission_objects[permission.code] = permission

        roles = [
            ("Super Administrator", "super_admin", True),
            ("Administrator", "administrator", True),
            ("Manager", "manager", False),
            ("Employee", "employee", False),
            ("Viewer", "viewer", False),
        ]

        role_objects = {}

        for name, code, system in roles:
            role, _ = Role.objects.get_or_create(
                code=code,
                defaults={
                    "name": name,
                    "is_system": system,
                },
            )
            role_objects[code] = role

        super_admin = role_objects["super_admin"]

        for permission in permission_objects.values():
            RolePermission.objects.get_or_create(
                role=super_admin,
                permission=permission,
            )

        try:
            user = User.objects.filter(is_superuser=True).first()

            if user:
                UserRole.objects.get_or_create(
                    user=user,
                    role=super_admin,
                    defaults={
                        "assigned_by": user,
                    },
                )

        except Exception:
            pass

        self.stdout.write(
            self.style.SUCCESS(
                "RBAC seeded successfully."
            )
        )