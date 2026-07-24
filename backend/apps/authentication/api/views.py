from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.common.permissions import AuthenticatedRBACPermission
from apps.authorization.constants import Permissions
from rest_framework.views import APIView


from apps.authentication.api.serializers import (
    LoginSerializer,
    LogoutSerializer,
    RefreshSerializer,
    UserSerializer,
    RegisterSerializer,
)
from apps.authentication.services import AuthenticationService
from apps.common.responses import APIResponse
from apps.dashboard.api.serializers import DashboardSerializer

class LoginAPIView(APIView):
    """
    POST /api/v1/auth/login/
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = AuthenticationService.login_user(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )

        return APIResponse.success(
            message="Login successful.",
            status_code=status.HTTP_200_OK,
            data={
                "access": result["access"],
                "refresh": result["refresh"],
                "user": UserSerializer(result["user"]).data,
            },
        )


class RefreshTokenAPIView(APIView):
    """
    POST /api/v1/auth/refresh/
    """

    permission_classes = [AllowAny]
    serializer_class = RefreshSerializer

    def post(self, request):
        refresh = request.data.get("refresh")

        result = AuthenticationService.refresh_access_token(
            refresh_token=refresh,
        )

        return APIResponse.success(
            message="Access token refreshed.",
            data=result,
        )


class LogoutAPIView(APIView):
    """
    POST /api/v1/auth/logout/
    """

    permission_classes = [AuthenticatedRBACPermission]
    required_permission = Permissions.AUTH_LOGOUT
    
    serializer_class = LoginSerializer
    serializer_class = LogoutSerializer

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthenticationService.logout_user(
            refresh_token=serializer.validated_data["refresh"],
        )

        return APIResponse.success(
            message="Logged out successfully.",
        )


class MeAPIView(APIView):
    """
    GET /api/v1/auth/me/
    """

    permission_classes = [AuthenticatedRBACPermission]
    required_permission = Permissions.AUTH_ME
    serializer_class = UserSerializer

    def get(self, request):
        return APIResponse.success(
            data=UserSerializer(request.user).data,
        )
import traceback
class RegisterAPIView(APIView):

    permission_classes = [AllowAny]

    serializer_class = RegisterSerializer

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = AuthenticationService.register_user(
                full_name=serializer.validated_data["full_name"],
                email=serializer.validated_data["email"],
                password=serializer.validated_data["password"],
            )

            return APIResponse.success(
                message="Account created successfully.",
                status_code=status.HTTP_201_CREATED,
                data=UserSerializer(user).data,
            )

        except Exception:
            traceback.print_exc()
            raise