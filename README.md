# SOP Checker

A full-stack Standard Operating Procedure (SOP) checker application built with React frontend, Django backend, and Supabase database.

## Features

- **User Management**: Multiple users with individual assignments
- **SOP List Creation**: Create detailed checklists with descriptions
- **User Assignment**: Assign lists to specific users
- **Progress Tracking**: Real-time progress tracking with visual indicators
- **Interactive Checklists**: Check off items with timestamps
- **Dashboard**: Overview of all lists, users, and statistics
- **Responsive Design**: Modern, clean UI that works on all devices

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Django 4.2, Django REST Framework
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS3 with modern design principles

## Project Structure

```
sop_checker/
├── backend/
│   ├── manage.py
│   ├── sop_checker_project/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   └── sop_checker/
│       ├── models.py
│       ├── views.py
│       ├── serializers.py
│       ├── urls.py
│       └── admin.py
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Dashboard.js
│       │   ├── CreateList.js
│       │   ├── ListDetail.js
│       │   └── UserLists.js
│       ├── services/
│       │   └── api.js
│       ├── App.js
│       ├── index.js
│       └── index.css
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Supabase account

### Backend Setup

1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   - Copy `env.example` to `.env`
   - Fill in your Supabase database credentials
   ```bash
   cp env.example .env
   ```

4. **Configure Supabase:**
   - Create a new project in Supabase
   - Get your database credentials from Settings > Database
   - Update the `.env` file with your credentials

5. **Run database migrations:**
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the Django development server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the React development server:**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Users
- `GET /users/` - List all users
- `GET /users/{user_id}/lists/` - Get lists assigned to a specific user

### SOP Lists
- `GET /lists/` - List all SOP lists
- `POST /lists/` - Create a new SOP list
- `GET /lists/{id}/` - Get a specific SOP list
- `PUT /lists/{id}/` - Update a SOP list
- `DELETE /lists/{id}/` - Delete a SOP list

### SOP Items
- `POST /items/{item_id}/toggle/` - Toggle the checked status of an item

## Usage

1. **Access the application** at `http://localhost:3000`
2. **Create users** through the Django admin panel at `http://localhost:8000/admin`
3. **Create SOP lists** using the "Create List" button
4. **Assign lists** to users during creation
5. **Track progress** on the dashboard
6. **Check off items** by clicking on individual lists

## Data Models

### SOPList
- `title`: String (required)
- `description`: Text (optional)
- `assigned_user`: Foreign key to User
- `created_by`: Foreign key to User
- `is_completed`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### SOPItem
- `sop_list`: Foreign key to SOPList
- `text`: String (required)
- `is_checked`: Boolean
- `order`: Integer
- `checked_at`: DateTime (optional)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License. 