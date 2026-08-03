import environ
from pathlib import Path
from datetime import timedelta

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

SECRET_KEY = env("SECRET_KEY")

DEBUG = env.bool("DEBUG", default=False)

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS")

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
    "apps.authentication",

    # Users
    "apps.users",

    # Roles
    "apps.authorization",

    # Permissions
    # "apps.permissions",

    # Audit
    "apps.audit",

    # Dashboard
    "apps.dashboard",

    # Common
    # "apps.common",
    
    "apps.monitoring",
    "apps.health",
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
    "whitenoise.middleware.WhiteNoiseMiddleware",

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

if env("DATABASE_URL", default=None):
    DATABASES = {
        "default": env.db(),
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("DB_NAME"),
            "USER": env("DB_USER"),
            "PASSWORD": env("DB_PASSWORD"),
            "HOST": env("DB_HOST"),
            "PORT": env("DB_PORT"),
        }
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

# ======================================
# Cache
# ======================================

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "enterprise-uam-cache",
        "TIMEOUT": 300,   # 5 minutes
    }
}

STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    }
}


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
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
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
    
    "EXCEPTION_HANDLER": "apps.common.exceptions.custom_exception_handler",
}

# -----------------------------------------------------------------------------
# Swagger
# -----------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {

    "TITLE": "User & Access Management API",

    "DESCRIPTION":
    """Enterprise RBAC Platform
    
    Authentication
    Authorization
    RBAC
    Audit Logging
    Dashboard
    User Management
    Role Management
    Permission Management
    """,

    "VERSION": "1.0.0",

    "SERVE_INCLUDE_SCHEMA": False,
    
    "COMPONENT_SPLIT_REQUEST": True,
    
    "SCHEMA_PATH_PREFIX": r"/api/v1",
    
}

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:5173"],
)
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=["http://localhost:5173"],
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
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,

    "formatters": {
        "standard": {
            "format": "[{asctime}] [{levelname}] {name} - {message}",
            "style": "{",
        },
    },

    "handlers": {

        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },

        "application_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "application.log",
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "standard",
        },

        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "errors.log",
            "level": "ERROR",
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "standard",
        },

        "audit_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "audit.log",
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "standard",
        },

        "security_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "security.log",
            "maxBytes": 5 * 1024 * 1024,
            "backupCount": 5,
            "formatter": "standard",
        },
    },

    "loggers": {

        "django": {
            "handlers": [
                "console",
                "application_file",
                "error_file",
            ],
            "level": "INFO",
            "propagate": False,
        },

        "audit": {
            "handlers": [
                "audit_file",
            ],
            "level": "INFO",
            "propagate": False,
        },

        "security": {
            "handlers": [
                "security_file",
            ],
            "level": "INFO",
            "propagate": False,
        },
    },
}

AUTH_USER_MODEL = "users.User"


SIMPLE_JWT = {
    # Development token lifetime
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=12),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,

    "UPDATE_LAST_LOGIN": True,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}