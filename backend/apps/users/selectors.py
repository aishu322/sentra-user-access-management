from django.db.models import Q
from django.shortcuts import get_object_or_404

from apps.users.models import User


def get_users(
    search=None,
    is_active=None,
    ordering="-date_joined",
):
    queryset = User.objects.all()

    if search:
        queryset = queryset.filter(
            Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
            | Q(email__icontains=search)
        )

    if is_active is not None:
        queryset = queryset.filter(
            is_active=is_active
        )

    return queryset.order_by(ordering)


def get_user_by_id(user_id):
    return get_object_or_404(
        User.objects.select_related(),
        id=user_id,
    )