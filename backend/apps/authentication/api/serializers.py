from rest_framework import serializers

from apps.users.models import User


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Only validates request data.
    Authentication is handled in the service layer.
    """

    email = serializers.EmailField(
        required=True,
        max_length=255,
    )

    password = serializers.CharField(
        required=True,
        write_only=True,
        trim_whitespace=False,
        style={"input_type": "password"},
    )


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for authenticated user details.
    """

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "is_active",
        )
        read_only_fields = fields


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout.
    Requires refresh token to blacklist it.
    """

    refresh = serializers.CharField(required=True)
    
class RefreshSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    
class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255)

    email = serializers.EmailField()

    password = serializers.CharField(
        min_length=8,
        write_only=True
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": [
                        "Passwords do not match."
                    ]
                }
            )

        return attrs