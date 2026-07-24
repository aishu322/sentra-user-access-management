from django.urls import path

from .views import (
    AuditLogListAPIView,
    AuditLogDetailAPIView,
)

urlpatterns = [
    path(
        "",
        AuditLogListAPIView.as_view(),
        name="audit-list",
    ),
    path(
        "<int:pk>/",
        AuditLogDetailAPIView.as_view(),
        name="audit-detail",
    ),
]