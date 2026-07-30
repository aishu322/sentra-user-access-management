from django.core.management.base import BaseCommand

from apps.users.models import User
from apps.authorization.models import Role, UserRole


class Command(BaseCommand):
    help = "Seed initial administrator account"

    def handle(self, *args, **kwargs):

        email = "admin@sentra.dev"
        password = "Admin123"

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": "System",
                "last_name": "Administrator",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )

        if created:
            user.set_password(password)
            user.save()

        else:
            user.first_name = "System"
            user.last_name = "Administrator"
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.set_password(password)
            user.save()

        admin_role = Role.objects.filter(code="administrator").first()

        if admin_role:
            UserRole.objects.get_or_create(
                user=user,
                role=admin_role,
                defaults={
                    "assigned_by": user,
                },
            )

        self.stdout.write(
            self.style.SUCCESS(
                "Default admin user seeded successfully."
            )
        )