#!/usr/bin/env bash
set -o errexit

echo "=================================="
echo "Installing dependencies..."
echo "=================================="
pip install -r requirements.txt

echo "=================================="
echo "Collecting static files..."
echo "=================================="
python manage.py collectstatic --noinput

echo "=================================="
echo "Running migrations..."
echo "=================================="
python manage.py migrate --noinput

echo "=================================="
echo "Seeding RBAC..."
echo "=================================="
python manage.py seed_rbac

echo "=================================="
echo "Creating default admin..."
echo "=================================="
python manage.py seed_data

echo "=================================="
echo "Build completed successfully."
echo "=================================="