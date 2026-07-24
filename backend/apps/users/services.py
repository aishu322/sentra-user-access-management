from django.shortcuts import get_object_or_404

from apps.audit.services import AuditService
from apps.users.models import User


class UserService:

    @staticmethod
    def create_user(validated_data):
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        AuditService.create_log(
            user=user,
            action="CREATE_USER",
            description=f"User '{user.email}' created.",
        )

        return user

    @staticmethod
    def update_user(user_id, validated_data):
        user = get_object_or_404(User, id=user_id)

        for field, value in validated_data.items():
            setattr(user, field, value)

        user.save()

        AuditService.create_log(
            user=user,
            action="UPDATE_USER",
            description=f"User '{user.email}' updated.",
        )

        return user

    @staticmethod
    def delete_user(user_id):
        user = get_object_or_404(User, id=user_id)

        email = user.email

        user.delete()

        AuditService.create_log(
            user=None,
            action="DELETE_USER",
            description=f"User '{email}' deleted.",
        )

    @staticmethod
    def activate_user(user_id):
        user = get_object_or_404(User, id=user_id)

        user.is_active = True
        user.save(update_fields=["is_active"])

        AuditService.create_log(
            user=user,
            action="ACTIVATE_USER",
            description=f"User '{user.email}' activated.",
        )

        return user

    @staticmethod
    def deactivate_user(user_id):
        user = get_object_or_404(User, id=user_id)

        user.is_active = False
        user.save(update_fields=["is_active"])

        AuditService.create_log(
            user=user,
            action="DEACTIVATE_USER",
            description=f"User '{user.email}' deactivated.",
        )

        return user

    @staticmethod
    def reset_password(user_id, new_password):
        user = get_object_or_404(User, id=user_id)

        user.set_password(new_password)
        user.save(update_fields=["password"])

        AuditService.create_log(
            user=user,
            action="RESET_PASSWORD",
            description=f"Password reset for '{user.email}'.",
        )

        return user