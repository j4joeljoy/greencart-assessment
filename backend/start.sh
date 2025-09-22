#!/bin/bash

# Apply database migrations
python manage.py migrate

# Start Gunicorn server
# The 0.0.0.0 host is important for Render to bind correctly.
gunicorn backend.wsgi --host 0.0.0.0 --port $PORT