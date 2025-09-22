# GreenCart Delivery Management System - Setup Instructions

## Fixed Issues

✅ **Connection Issues Fixed:**
- Moved SimulationContext to proper file (`src/context/SimulationContext.jsx`)
- Added AuthProvider wrapper to App.jsx
- Fixed simulation API date format (now uses YYYY-MM-DD HH:MM:SS)
- Improved delivery time calculation with traffic multipliers
- Fixed logout functionality in Navbar
- Proper context integration throughout the app

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd greencart-assessment/backend
   ```

2. **Activate virtual environment:**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Load initial data:**
   ```bash
   python manage.py loaddata --data-dir .
   ```

6. **Create superuser (for testing):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the server:**
   ```bash
   python manage.py runserver
   ```

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd greencart-assessment/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## Testing the Application

1. **Access the application:** http://localhost:3000
2. **Login:** Use the superuser credentials created in step 6
3. **Test features:**
   - Dashboard: View KPIs and charts
   - Simulation: Run delivery simulations
   - Management: View driver data

## API Endpoints

- **Login:** POST http://127.0.0.1:8000/api/login/
- **Simulation:** POST http://127.0.0.1:8000/api/simulate/
- **Drivers:** GET http://127.0.0.1:8000/api/drivers/
- **Routes:** GET http://127.0.0.1:8000/api/routes/
- **Orders:** GET http://127.0.0.1:8000/api/orders/

## Key Improvements Made

1. **Context Management:** Proper React Context usage for state management
2. **Authentication:** Complete auth flow with JWT tokens
3. **API Integration:** Fixed date format and improved simulation logic
4. **Error Handling:** Better error messages and validation
5. **Navigation:** Proper routing and protected routes
6. **Business Logic:** Improved delivery time calculations with traffic factors

## Notes

- The simulation now uses realistic traffic multipliers (High: 1.5x, Medium: 1.2x, Low: 1.0x)
- All API calls use proper authentication headers
- Context state is properly shared between components
- Logout functionality clears tokens and redirects to login
