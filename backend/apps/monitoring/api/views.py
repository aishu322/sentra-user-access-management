from django.db import connection

from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckAPIView(APIView):

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        try:
            connection.ensure_connection()
            database = "connected"
        except Exception:
            database = "disconnected"

        return Response(
            {
                "status": "healthy",
                "database": database,
                "version": "1.0.0",
            }
        )