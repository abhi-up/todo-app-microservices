# Node.js Microservices Architecture

A microservices-based application built with Node.js, Express, MongoDB, and RabbitMQ. This project demonstrates a distributed system architecture with three independent services that communicate through message queues.

## 🏗️ Architecture Overview

This project consists of three microservices:

- **User Service** (Port 3001) - Manages user data and operations
- **Task Service** (Port 3002) - Handles task creation and management, publishes events to RabbitMQ
- **Notification Service** (Port 3003) - Consumes messages from RabbitMQ and handles notifications

The services communicate asynchronously using RabbitMQ message queues, ensuring loose coupling and scalability.

## ✨ Features

- **RESTful APIs** for user and task management
- **Event-driven architecture** using RabbitMQ for asynchronous communication
- **MongoDB** for persistent data storage
- **Docker containerization** for easy deployment and scalability
- **Microservices architecture** with independent, scalable services
- **Health check endpoints** for service monitoring

## 🛠️ Tech Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB (Community Server)
- **Message Queue**: RabbitMQ 3 (with Management UI)
- **Containerization**: Docker & Docker Compose
- **Dependencies**:
  - `express` - Web framework
  - `mongoose` - MongoDB ODM
  - `amqplib` - RabbitMQ client
  - `body-parser` - Request body parsing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://www.docker.com/get-started) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0 or higher)
- [Node.js](https://nodejs.org/) (version 18 or higher) - Optional, for local development

## 🚀 Getting Started

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nodejs-microservices
   ```

2. **Start all services using Docker Compose**

   ```bash
   docker-compose up --build
   ```

   This command will:

   - Build Docker images for all three services
   - Start MongoDB container
   - Start RabbitMQ container
   - Start all three microservices
   - Set up networking between containers

### Running Services

Once Docker Compose is running, the following services will be available:

- **User Service**: http://localhost:3001
- **Task Service**: http://localhost:3002
- **Notification Service**: http://localhost:3003
- **RabbitMQ Management UI**: http://localhost:15672 (default credentials: guest/guest)
- **MongoDB**: localhost:27017

## 📡 API Endpoints

### User Service (Port 3001)

#### Get All Users

```http
GET /users
```

**Response:**

```json
[
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
]
```

#### Create User

```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Health Check

```http
GET /
```

### Task Service (Port 3002)

#### Get All Tasks

```http
GET /tasks
```

**Response:**

```json
[
  {
    "_id": "task_id",
    "title": "Complete project",
    "description": "Finish the microservices project",
    "userId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Create Task

```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the microservices project",
  "userId": "user_id"
}
```

**Response:**

```json
{
  "_id": "task_id",
  "title": "Complete project",
  "description": "Finish the microservices project",
  "userId": "user_id",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Note:** When a task is created, a message is automatically published to RabbitMQ queue `task_created`, which is consumed by the Notification Service.

## 📁 Project Structure

```
nodejs-microservices/
├── docker-compose.yml          # Docker Compose configuration
├── user-service/
│   ├── Dockerfile              # User service container definition
│   ├── package.json            # User service dependencies
│   └── index.js                # User service implementation
├── task-service/
│   ├── Dockerfile              # Task service container definition
│   ├── package.json            # Task service dependencies
│   └── index.js                # Task service implementation
└── notification-service/
    ├── Dockerfile              # Notification service container definition
    ├── package.json            # Notification service dependencies
    └── index.js                # Notification service implementation
```

## 🔄 How It Works

1. **User Service**: Handles user CRUD operations and stores data in MongoDB `users` database.

2. **Task Service**:

   - Manages task operations
   - Stores tasks in MongoDB `tasks` database
   - When a task is created, it publishes an event to RabbitMQ queue `task_created`
   - Includes retry logic for RabbitMQ connection

3. **Notification Service**:

   - Listens to the `task_created` queue in RabbitMQ
   - Consumes messages when tasks are created
   - Logs notifications for new tasks

4. **Message Flow**:
   ```
   Task Service → RabbitMQ Queue → Notification Service
   ```

## 🐳 Docker Services

The `docker-compose.yml` file defines the following services:

- **mongo**: MongoDB database server
- **rabbitmq**: RabbitMQ message broker with management UI
- **user-service**: User management microservice
- **task-service**: Task management microservice
- **notification-service**: Notification handling microservice

All services are connected through Docker's internal network, allowing them to communicate using service names as hostnames.

## 🧪 Testing the Application

### 1. Create a User

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### 2. Get All Users

```bash
curl http://localhost:3001/users
```

### 3. Create a Task

```bash
curl -X POST http://localhost:3002/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Task", "description": "This is a test", "userId": "user_id_here"}'
```

### 4. Get All Tasks

```bash
curl http://localhost:3002/tasks
```

### 5. Monitor Notifications

Check the notification service logs to see messages being consumed:

```bash
docker logs notification-service
```

## 🔍 Monitoring

- **RabbitMQ Management UI**: Access at http://localhost:15672

  - Username: `guest`
  - Password: `guest`
  - View queues, connections, and message flow

- **View Service Logs**:
  ```bash
  docker logs user-service
  docker logs task-service
  docker logs notification-service
  ```

## 🛑 Stopping the Services

To stop all services:

```bash
docker-compose down
```

To stop and remove volumes (clears database data):

```bash
docker-compose down -v
```

## 🔧 Development

### Running Services Locally (Without Docker)

If you prefer to run services locally:

1. **Start MongoDB and RabbitMQ** (using Docker or local installations)

2. **Update connection strings** in service files:

   - Change `mongodb://mongo:27017` to `mongodb://localhost:27017`
   - Change `amqp://rabbitmq` to `amqp://localhost`

3. **Install dependencies** in each service:

   ```bash
   cd user-service && npm install
   cd ../task-service && npm install
   cd ../notification-service && npm install
   ```

4. **Run each service**:
   ```bash
   node user-service/index.js
   node task-service/index.js
   node notification-service/index.js
   ```

## 📝 Notes

- Each service uses its own MongoDB database (`users`, `tasks`)
- RabbitMQ connection includes retry logic in the task service
- Services are designed to be independently scalable
- The notification service currently logs notifications; you can extend it to send emails, SMS, or push notifications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Created with ❤️ for microservices architecture demonstration.

---

**Happy Coding! 🚀**
