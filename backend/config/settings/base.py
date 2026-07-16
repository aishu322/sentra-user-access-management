from pathlib import Path
import environ

# -----------------------------------------------------------------------------
# Paths
# -----------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# -----------------------------------------------------------------------------
# Environment
# -----------------------------------------------------------------------------

env = environ.Env()

environ.Env.read_env(BASE_DIR / ".env")

# -----------------------------------------------------------------------------
# Core
# -----------------------------------------------------------------------------

SECRET_KEY = env(
    "SECRET_KEY",
    default="django-insecure-change-this-in-production"
)

DEBUG = env.bool("DEBUG", default=False)

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1"],
)

# -----------------------------------------------------------------------------
# Applications
# -----------------------------------------------------------------------------

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "django_filters",
    "corsheaders",
]

LOCAL_APPS = [
    # Authentication
    # "apps.authentication",

    # Users
    # "apps.users",

    # Roles
    # "apps.roles",

    # Permissions
    # "apps.permissions",

    # Audit
    # "apps.audit",

    # Dashboard
    # "apps.dashboard",

    # Common
    # "apps.common",
]

INSTALLED_APPS = (
    DJANGO_APPS
    + THIRD_PARTY_APPS
    + LOCAL_APPS
)

# -----------------------------------------------------------------------------
# Middleware
# -----------------------------------------------------------------------------

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -----------------------------------------------------------------------------
# URL Configuration
# -----------------------------------------------------------------------------

ROOT_URLCONF = "config.urls"

# -----------------------------------------------------------------------------
# Templates
# -----------------------------------------------------------------------------

TEMPLATES = [
    {
        "BACKEND":
        "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------

DATABASES = {
    "default": env.db(
        "DATABASE_URL",
        default="sqlite:///" + str(BASE_DIR / "db.sqlite3"),
    )
}

# -----------------------------------------------------------------------------
# Password Validators
# -----------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME":
        "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME":
        "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME":
        "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME":
        "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# -----------------------------------------------------------------------------
# Internationalization
# -----------------------------------------------------------------------------

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# -----------------------------------------------------------------------------
# Static
# -----------------------------------------------------------------------------

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_DIRS = [
    BASE_DIR / "static",
]

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"

# -----------------------------------------------------------------------------
# Default PK
# -----------------------------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -----------------------------------------------------------------------------
# REST Framework
# -----------------------------------------------------------------------------

REST_FRAMEWORK = {

    "DEFAULT_SCHEMA_CLASS":
    "drf_spectacular.openapi.AutoSchema",

    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],

    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],

    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],

    "DEFAULT_PAGINATION_CLASS":
    "rest_framework.pagination.PageNumberPagination",

    "PAGE_SIZE": 10,
}

# -----------------------------------------------------------------------------
# Swagger
# -----------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {

    "TITLE": "User & Access Management API",

    "DESCRIPTION":
    "Enterprise RBAC Platform",

    "VERSION": "1.0.0",

    "SERVE_INCLUDE_SCHEMA": False,
}

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:5173",
    ],
)

# -----------------------------------------------------------------------------
# Security
# -----------------------------------------------------------------------------

AUTH_PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",

    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
]

# -----------------------------------------------------------------------------
# Logging
# -----------------------------------------------------------------------------

LOGGING = {

    "version": 1,

    "disable_existing_loggers": False,

    "handlers": {

        "console": {

            "class": "logging.StreamHandler",

        }

    },

    "root": {

        "handlers": ["console"],

        "level": "INFO",

    },
}