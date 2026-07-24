from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.db import transaction

from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from apps.users.models import User
from apps.audit.services import AuditService
from apps.authorization.models import Role, UserRole

class AuthenticationService:
    """
    Enterprise Authentication Service.
    All authentication business logic lives here.
    """

    @staticmethod
    def login_user(*, email: str, password: str) -> dict:
        """
        Authenticate a user and return JWT tokens.
        """

        user = authenticate(
            username=email,
            password=password,
        )

        if user is None:
            raise AuthenticationFailed("Invalid email or password.")

        if not user.is_active:
            raise AuthenticationFailed("Your account has been deactivated.")

        refresh = RefreshToken.for_user(user)

        update_last_login(None, user)

        AuditService.create_log(
            user=user,
            action="LOGIN",
            description="User logged in successfully.",
        )

        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }

    @staticmethod
    def refresh_access_token(*, refresh_token: str) -> dict:
        """
        Generate a new access token using a refresh token.
        """

        try:
            refresh = RefreshToken(refresh_token)

            return {
                "access": str(refresh.access_token),
            }

        except TokenError as exc:
            raise AuthenticationFailed(
                "Invalid or expired refresh token."
            ) from exc

    @staticmethod
    def logout_user(*, refresh_token: str) -> None:
        """
        Blacklist the refresh token.
        """

        try:
            token = RefreshToken(refresh_token)

            user = User.objects.get(id=token["user_id"])

            token.blacklist()

            AuditService.create_log(
                user=user,
                action="LOGOUT",
                description="User logged out successfully.",
            )

        except TokenError as exc:
            raise AuthenticationFailed(
                "Invalid refresh token."
            ) from exc
            
    @staticmethod
    @transaction.atomic
    def register_user(
        *,
        full_name,
        email,
        password,
    ):

        if User.objects.filter(email=email).exists():
            raise ValueError("Email already exists.")

        names = full_name.strip().split(" ", 1)

        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ""

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        viewer_role = Role.objects.get(code="viewer")

        UserRole.objects.create(
            user=user,
            role=viewer_role,
        )

        return user