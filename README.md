Notes App (Fullstack)

A fullstack notes management application built with a React frontend and Node.js/Express backend, using MongoDB (via Mongoose) for data storage and JWT authentication for secure user access.

This project allows users to create and manage notes, through a secure and stylish application.

## Features
- User Authentication
Register and login system
Secure routes using JWT
- Notes Management
Create, read, update, and delete notes
Assign priority levels (low, medium, high)
Optional date field
- Modern UI
Built with React and styled using Tailwind CSS

## Tech Stack:
### Frontend:
* React
* Axios
* Tailwind CSS

### Backend:
* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Tokens (JWT)

### Development Tools:
* Concurrently (to run frontend & backend together)

## Project Structure:

## Installation & Setup:

1. Clone the repository
git clone https://github.com/aamirm13/notesapi
cd notes-app

2. Install dependencies
``` 
npm install
cd backend && npm install
cd ../frontend && npm install
``` 

3. Environment Variables: 

Create a .env file inside the /backend directory:

``` 
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
``` 

4. Run the Application:

From the root directory:

``` 
npm run dev
``` 

This will start:

* Backend → http://localhost:5000
* Frontend → http://localhost:5173 (or similar)

