#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment and run server
if [ -f "venv/Scripts/activate" ]; then
  source venv/Scripts/activate
else
  source venv/bin/activate
fi

python manage.py runserver