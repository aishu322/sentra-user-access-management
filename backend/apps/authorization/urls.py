from django.urls import include, path

urlpatterns = [
    path(
        "",
        include("apps.authorization.api.urls"),
    ),
]