from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authorization.permissions import HasPermission
from apps.common.permissions import AuthenticatedRBACPermission
from apps.common.views import EnterpriseListAPIView

from apps.users.models import User
from apps.users.selectors import get_user_by_id, get_users
from apps.users.services import UserService

from apps.users.api.serializers import (
    EmptySerializer,
    ResetPasswordSerializer,
    UserCreateSerializer,
    UserDetailSerializer,
    UserListSerializer,
    UserUpdateSerializer,
)


class UserListCreateAPIView(EnterpriseListAPIView, GenericAPIView):
    permission_classes = [AuthenticatedRBACPermission]
    required_permission = HasPermission.USER_VIEW

    serializer_class = UserListSerializer
    queryset = User.objects.none()

    search_fields = (
        "email",
        "first_name",
        "last_name",
    )

    ordering_fields = (
        "email",
        "date_joined",
        "first_name",
    )

    filterset_fields = (
        "is_active",
        "is_staff",
    )

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return User.objects.none()

        return get_users(
            search=self.request.query_params.get("search"),
            is_active=self.request.query_params.get("is_active"),
            ordering=self.request.query_params.get(
                "ordering",
                "-date_joined",
            ),
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserListSerializer

    def get(self, request):
        queryset = self.get_queryset()

        serializer = UserListSerializer(queryset, many=True)

        return Response(serializer.data)

    def post(self, request):
        self.required_permission = HasPermission.USER_CREATE

        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = UserService.create_user(serializer.validated_data)

        return Response(
            UserDetailSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class UserDetailAPIView(GenericAPIView):
    permission_classes = [AuthenticatedRBACPermission]
    required_permission = HasPermission.USER_VIEW

    serializer_class = UserDetailSerializer
    queryset = User.objects.none()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return UserUpdateSerializer
        return UserDetailSerializer

    def get(self, request, pk):
        user = get_user_by_id(pk)

        serializer = UserDetailSerializer(user)

        return Response(serializer.data)

    def patch(self, request, pk):
        self.required_permission = HasPermission.USER_UPDATE

        user = get_user_by_id(pk)

        serializer = UserUpdateSerializer(
            user,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)

        user = UserService.update_user(
            pk,
            serializer.validated_data,
        )

        return Response(UserDetailSerializer(user).data)

    def delete(self, request, pk):
        self.required_permission = HasPermission.USER_DELETE

        UserService.delete_user(pk)

        return Response(status=status.HTTP_204_NO_CONTENT)


class UserActivateAPIView(APIView):
    permission_classes = [HasPermission]
    required_permission = HasPermission.USER_UPDATE

    serializer_class = EmptySerializer

    def post(self, request, pk):
        UserService.activate_user(pk)

        return Response(
            {"detail": "User activated successfully."},
            status=status.HTTP_200_OK,
        )


class UserDeactivateAPIView(APIView):
    permission_classes = [HasPermission]
    required_permission = HasPermission.USER_UPDATE

    serializer_class = EmptySerializer

    def post(self, request, pk):
        UserService.deactivate_user(pk)

        return Response(
            {"detail": "User deactivated successfully."},
            status=status.HTTP_200_OK,
        )


class UserResetPasswordAPIView(APIView):
    permission_classes = [HasPermission]
    required_permission = HasPermission.USER_UPDATE

    serializer_class = EmptySerializer

    def post(self, request, pk):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        UserService.reset_password(
            pk,
            serializer.validated_data["password"],
        )

        return Response(
            {"detail": "Password reset successfully."},
            status=status.HTTP_200_OK,
        )