from .base import *

DEBUG = False

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

ALLOWED_HOSTS = ['sentra-api-8nnd.onrender.com', '.onrender.com']

# Database - use env.db() from django-environ you already have
DATABASES = {
    "default": env.db("DATABASE_URL")
}

# CORS + CSRF - YOUR FRONTEND URL
CORS_ALLOWED_ORIGINS = [
    'https://sentra-frontend-isdo.onrender.com'
]
CSRF_TRUSTED_ORIGINS = [
    'https://sentra-frontend-isdo.onrender.com'
]
CORS_ALLOW_CREDENTIALS = True

# JWT Cookie Settings for cross-site
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True

# Static
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    }
}