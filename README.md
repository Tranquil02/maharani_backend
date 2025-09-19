
#  Maharani Backend

This is the backend server for the Maharani project, built with **Node.js**, **Express**, and **MongoDB**. It handles user authentication, product and service management, and other backend operations.

---

##  Features

- JWT Authentication
- Role-based Access Control
- Modular MVC Architecture
- MongoDB Atlas Support
- REST API Design

---

##  Project Structure

```
maharani_backend/
├── Auth/              # Authentication logic
├── Controllers/       # Route handlers
├── Middleware/        # JWT and error middlewares
├── Models/            # Mongoose schemas
├── Routes/            # All express route definitions
├── server.js          # App entry point
├── .env               # Environment configuration
└── package.json       # Project metadata
```

---

##  Setup

### Prerequisites

- Node.js v14+
- MongoDB Atlas URI
- Postman (for API testing)

### Installation

```bash
git clone https://github.com/Tranquil02/maharani_backend.git
cd maharani_backend
npm install
```

### Environment Variables

Create a `.env` file with:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/maharani
JWT_SECRET=your_jwt_secret
```

### Run Server

```bash
npm start
```

---

##  API Endpoints (Sample)

| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| POST   | /api/auth/signup      | User registration     |
| POST   | /api/auth/login       | User login (JWT)      |
| GET    | /api/products         | List all products     |
| POST   | /api/products/add     | Add a new product     |

---


##  Contributing

Contributions are welcome!

1. Fork the repository  
2. Create your feature branch: `git checkout -b feature/your-feature`  
3. Commit changes: `git commit -am 'Add new feature'`  
4. Push to branch: `git push origin feature/your-feature`  
5. Create a Pull Request

---

##  License

This project is Under Development and available under the [MIT License](LICENSE).
