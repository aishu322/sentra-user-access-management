from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import filters
from rest_framework.generics import ListAPIView

from apps.common.permissions import AuthenticatedRBACPermission


class EnterpriseListAPIView(ListAPIView):
    """
    Base enterprise list API.

    Supports:
    - Pagination
    - Search
    - Ordering
    - Filtering
    """

    permission_classes = [AuthenticatedRBACPermission]

    filter_backends = (
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    )

    search_fields = ()
    ordering_fields = ()
    filterset_fields = ()

    ordering = ("-id",)