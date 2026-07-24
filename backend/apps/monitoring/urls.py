from django.urls import include, path

urlpatterns = [
    path(
        "",
        include("apps.monitoring.api.urls"),
    ),
]