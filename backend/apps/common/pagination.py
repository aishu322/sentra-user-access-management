from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Enterprise pagination.
    """

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    page_query_param = "page"