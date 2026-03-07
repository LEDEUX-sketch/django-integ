import sys
try:
    import django  # type: ignore
    print(f"Django version: {django.get_version()}")
except ImportError:
    print("Django not found")

try:
    import MySQLdb  # type: ignore
    print("MySQLdb (mysqlclient) imported successfully")
except ImportError:
    print("mysqlclient not found")

import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'toybox_backend.settings')
try:
    django.setup()
    from django.db import connection  # type: ignore
    connection.ensure_connection()
    print("Database connection successful")
except Exception as e:
    print(f"Error during Django setup or DB connection: {e}")
