# Task Manager App

A simple **Task Manager App** built with:

- **Frontend:** React.js + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB

## 🚀 Features

✅ User Authentication (JWT-based)  
✅ Create, Update, Delete Tasks  
✅ Mark Tasks as Completed/Pending  
✅ Responsive UI with Tailwind CSS  
✅ REST API with Express.js & MongoDB

---

## 🛠️ Installation & Setup

### **1. Clone the Repository**

```sh
git clone https://github.com/your-username/task-manager.git
cd task-manager
```

---

## 🔥 Frontend Setup (React + Tailwind)

```sh
cd frontend
npm install
npm run dev  # Starts the frontend at http://localhost:5173 (or React default port)
```

---

## ⚡ Backend Setup (Node.js + Express + MongoDB)

```sh
cd backend
npm install
npm start  # Starts backend at http://localhost:5000
```

### **Backend Environment Variables (`backend/.env`)**

Create a `.env` file in the `backend/` folder and add:

```sh
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 🚀 Deployment

### **Frontend Deployment on Vercel**

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/) → New Project
3. Select the `task-manager` repo & set the root directory to `frontend/`
4. Deploy 🎉

### **Backend Deployment**

- Use **Railway, Render, or Vercel Functions** to deploy the backend.
- Update **Frontend `.env`** to point to the deployed backend URL.

---

## 📌 API Endpoints (Backend)

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| POST   | `/api/auth/register` | Register a new user  |
| POST   | `/api/auth/login`    | Login user & get JWT |
| GET    | `/api/tasks`         | Get all tasks        |
| POST   | `/api/tasks`         | Create a new task    |
| PUT    | `/api/tasks/:id`     | Update a task        |
| DELETE | `/api/tasks/:id`     | Delete a task        |

---

## 📜 License

This project is **MIT Licensed**.

---

### 🎯 **Contributions & Issues**

Feel free to **fork**, raise an **issue**, or submit a **PR**! 🚀
