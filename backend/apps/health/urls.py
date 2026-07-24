from django.urls import include
from django.urls import path

urlpatterns = [
    path(
        "health/",
        include("apps.health.api.urls"),
    ),
]