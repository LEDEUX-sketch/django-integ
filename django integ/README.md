# TitanVault Setup Guide

This project contains the robust e-commerce platform for TitanVault, featuring a React (Next.js) frontend and a Django REST API backend powered by MySQL.

## How to Share via Google Drive

To easily share this project without uploading massive dependency folders, you should compress it first.

1. **Clean up dependencies (Optional but highly recommended):**
   Before zipping the project, delete the following folders if they exist to save huge amounts of space and upload time:
   - `node_modules/` (inside the root folder)
   - `.next/` (inside the root folder)
   - `backend/__pycache__/`
   
2. **Zip the project folder:**
   - Right-click the main `django integ` folder.
   - Select **"Compress to ZIP file"** (or use your preferred archiving tool like 7-Zip).
   
3. **Export and Upload your Database (Optional but recommended for sharing data):**
   - If you want your friend to see the exact products, users, and orders you currently have in your database (instead of an empty one or just the seed data), you should export your `toybox_db` to a `.sql` file.
   - You can do this by running this command in a terminal (note: `mysqldump` might not be in your Windows PATH so you may need to run this from your MySQL server's `bin` folder, or use a tool like MySQL Workbench's **Data Export** feature):
     ```bash
     mysqldump -u root -p toybox_db > toybox_db_backup.sql
     ```
   - Make sure to upload this `toybox_db_backup.sql` file to your Google Drive alongside the `.zip` file.

4. **Upload to Google Drive:**
   - Go to [Google Drive](https://drive.google.com/).
   - Drag and drop the created `.zip` file (and the `.sql` backup file if you made one) into your Drive.
   - Right-click the uploaded file, select **Share**, and change the general access to "Anyone with the link" (or share it directly with specific emails).
   - Copy the link and share it!

---

## How to Run the Project Locally

Follow these steps to get the full stack running on your machine.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (for the frontend)
- [Python 3.10+](https://www.python.org/downloads/) (for the backend)
- [MySQL](https://dev.mysql.com/downloads/installer/) server running locally

### 1. Database Setup (MySQL)
1. Open your MySQL command line or a tool like MySQL Workbench.
2. Create the database using the following command:
   ```sql
   CREATE DATABASE toybox_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Update the database credentials in the Django backend if necessary (check `backend/toybox_backend/settings.py` to ensure the `USER` and `PASSWORD` match your local MySQL configuration, default is usually `root` with no password or a password you set during installation).

### 2. Backend Setup (Django)
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. *(Optional but recommended)* Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install the required Python packages:
   ```bash
   pip install django==4.2 mysqlclient djangorestframework django-cors-headers
   ```
4. Run the database migrations to create the tables:
   ```bash
   python manage.py migrate
   ```
5. *(Optional)* Seed the database with sample products:
   Open a new terminal or API client and send a POST request to `http://127.0.0.1:8000/api/seed/` after starting the server.
6. Start the Django development server:
   ```bash
   python manage.py runserver
   ```
   *The backend API will now be running at `http://localhost:8000`.*

### 3. Frontend Setup (Next.js)
1. Open a **new** terminal window and navigate to the root directory of the project.
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend application will now be running at `http://localhost:3000`.*

### Accessing the Application
- **Storefront:** Go to `http://localhost:3000` to browse products.
- **Admin Dashboard:** Go to `http://localhost:3000/admin`. You can initiate an admin account or log in if you have one.
  - *Default test admin credentials (created upon first login attempt):* 
    - Email: `admin@toybox.com`
    - Password: `admin123`
