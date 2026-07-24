from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.common.permissions import AuthenticatedRBACPermission
from apps.authorization.constants import Permissions
from apps.dashboard.services import DashboardService
from apps.dashboard.api.serializers import DashboardSerializer


class DashboardAPIView(APIView):
    """
    Dashboard Overview API

    GET /api/v1/dashboard/
    """

    permission_classes = [AuthenticatedRBACPermission]

    required_permission = Permissions.DASHBOARD_VIEW
    
    serializer_class = DashboardSerializer

    def get(self, request):
        data = DashboardService.get_dashboard()

        return Response(
            data,
            status=status.HTTP_200_OK,
        )