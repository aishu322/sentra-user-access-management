from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Enterprise-wide exception handler.
    """

    response = exception_handler(exc, context)

    if response is not None:
        return Response(
            {
                "success": False,
                "message": "Request failed.",
                "errors": response.data,
            },
            status=response.status_code,
        )

    if isinstance(exc, DjangoValidationError):
        return Response(
            {
                "success": False,
                "message": "Validation error.",
                "errors": exc.message_dict
                if hasattr(exc, "message_dict")
                else exc.messages,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {
            "success": False,
            "message": "Internal server error.",
            "errors": [],
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )