from django.urls import include, path

urlpatterns = [
    path(
        "audit/",
        include("apps.audit.api.urls"),
    ),
]