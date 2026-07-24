from django.db import connection

from django.utils.timezone import now

from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckAPIView(APIView):

    authentication_classes = []
    permission_classes = []

    def get(self, request):

        database = "healthy"

        try:
            connection.ensure_connection()
        except Exception:
            database = "unhealthy"

        return Response(
            {
                "status": "healthy"
                if database == "healthy"
                else "degraded",
                "database": database,
                "timestamp": now(),
            }
        )