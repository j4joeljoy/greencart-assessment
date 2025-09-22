```
{
  "project_overview": {
    "title": "GreenCart Logistics - Delivery Simulation & KPI Dashboard",
    "description": "This is an internal full-stack tool for GreenCart Logistics, a fictional eco-friendly delivery company. It's designed to help managers simulate delivery operations and analyze key performance indicators (KPIs) based on custom company rules. The application includes a backend API built with Django and a frontend client built with React."
  },
  "tech_stack": {
    "backend": "Django, Django REST Framework, PostgreSQL, Simple JWT",
    "frontend": "React, Recharts, React Router DOM, Vite",
    "deployment": "Render/Railway (Backend), Vercel/Netlify (Frontend), Neon/Render (Database)"
  },
  "features": [
    "User authentication via a simple login system.",
    "A dynamic dashboard displaying key metrics like Total Profit and Efficiency Score.",
    "Interactive charts for On-time vs Late Deliveries and Fuel Cost Breakdown.",
    "A simulation page for running custom delivery scenarios.",
    "Management pages with full CRUD (Create, Read, Update, Delete) functionality for Drivers, Routes, and Orders."
  ],
  "setup_instructions": {
    "general": "To run this project, you need to set up both the backend and frontend. Make sure you have Node.js and Python installed."
  },
  "backend_setup": {
    "steps": [
      "1. Navigate to the `backend` directory: `cd backend`",
      "2. Create and activate a virtual environment: `python -m venv venv` and then `source venv/bin/activate` (or `venv\\Scripts\\activate` on Windows)",
      "3. Install dependencies: `pip install -r requirements.txt`",
      "4. Set up a PostgreSQL database (locally or on a cloud service like Neon).",
      "5. Create a `.env` file based on the environment variables section below.",
      "6. Run database migrations: `python manage.py makemigrations` and `python manage.py migrate`",
      "7. Load initial data from CSV files: `python manage.py loaddata` (Ensure `drivers.csv`, `routes.csv`, and `orders.csv` are in the backend folder)",
      "8. Create a superuser for login: `python manage.py createsuperuser`",
      "9. Start the development server: `python manage.py runserver`"
    ]
  },
  "frontend_setup": {
    "steps": [
      "1. Navigate to the `frontend` directory: `cd frontend`",
      "2. Install dependencies: `npm install`",
      "3. Create a `.env` file based on the environment variables section below.",
      "4. Start the development server: `npm run dev`"
    ]
  },
  "env_variables": {
    "backend": [
      "SECRET_KEY=your_django_secret_key",
      "DATABASE_URL=your_postgresql_connection_string"
    ],
    "frontend": [
      "VITE_BACKEND_API_URL=http://127.0.0.1:8000/api/"
    ]
  },
  "deployment_instructions": {
    "backend": "The backend can be deployed on platforms like **Render** or **Railway**. You'll need to set the required environment variables and run migrations on the server.",
    "frontend": "The frontend can be deployed on a static hosting service like **Vercel** or **Netlify**. Link your repository and set the `VITE_BACKEND_API_URL` to your deployed backend's URL."
  },
  "api_documentation": {
    "base_url": "http://127.0.0.1:8000/api/",
    "endpoints": [
      {
        "path": "/login/",
        "method": "POST",
        "description": "Authenticates a user and returns JWT tokens.",
        "request": "{ \"username\": \"admin\", \"password\": \"password123\" }",
        "response": "{ \"access\": \"...\", \"refresh\": \"...\" }"
      },
      {
        "path": "/simulate/",
        "method": "POST",
        "description": "Runs a delivery simulation and returns calculated KPIs.",
        "request": "{ \"num_drivers\": 5, \"start_time\": \"09:00\", \"max_hours_per_day\": 8 }",
        "response": "{ \"total_profit\": 12345.67, \"efficiency_score\": 95.5, ... }"
      },
      {
        "path": "/drivers/",
        "method": "GET, POST, PUT, DELETE",
        "description": "CRUD operations for driver records.",
        "get_response": "[ { \"id\": 1, \"name\": \"John Doe\", ... }, ... ]"
      },
      {
        "path": "/routes/",
        "method": "GET, POST, PUT, DELETE",
        "description": "CRUD operations for route records.",
        "get_response": "[ { \"id\": 1, \"route_id\": \"7\", ... }, ... ]"
      },
      {
        "path": "/orders/",
        "method": "GET, POST, PUT, DELETE",
        "description": "CRUD operations for order records.",
        "get_response": "[ { \"id\": 1, \"order_id\": \"1\", ... }, ... ]"
      }
    ]
  }
}
```
