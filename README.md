# Campus Evaluation Backend

Backend services developed as part of the **Affordmed Campus Evaluation** program.

## Repository Structure

```
Campus-Evaluation-BE/
├── vehicle-scheduler-be/        # Optimized vehicle maintenance scheduler
├── notification-app-be/         # Notification delivery service
├── logging-middleware/          # Reusable logging module
├── notification-system-design.md
└── README.md
```

---

## Services

### 🚗 vehicle-scheduler-be

A Node.js + Express microservice that fetches depot and vehicle data from the Affordmed Evaluation APIs and generates an optimized maintenance schedule using a **0/1 Knapsack dynamic programming** algorithm.

- **Endpoint:** `GET /schedule`
- **Algorithm:** Knapsack DP — maximizes total impact within each depot's mechanic-hour capacity
- **Stack:** Node.js, Express.js, Axios

[View README →](./vehicle-scheduler-be/README.md)

---

### 🔔 notification-app-be

Backend service for managing and delivering notifications triggered by platform events such as schedule completions and errors.

- Supports email and in-app notification channels
- Designed as a decoupled microservice

[View README →](./notification-app-be/README.md)  
[View System Design →](./notification-system-design.md)

---

### 📋 logging-middleware

A reusable logging module that sends structured log entries to the Affordmed Logging API. Integrated across all backend services for consistent event and error tracking.

[View README →](./logging-middleware/README.md)

---

## Quick Start

### Vehicle Scheduler

```bash
cd vehicle-scheduler-be
npm install
node server.js
```

API available at: `http://localhost:3000/schedule`

---

## Sample API Response

```json
[
  {
    "depotId": 2,
    "mechanicHours": 135,
    "totalImpact": 141,
    "selectedVehicles": [
      {
        "TaskID": "abc123",
        "Duration": 7,
        "Impact": 5
      }
    ]
  }
]
```

---

## Screenshots

The `screenshots/` folder contains:
- Successful API execution output in Postman
- Optimized scheduling results

---

## Technologies Used

- Node.js
- Express.js
- Axios
- JavaScript (CommonJS)
- REST APIs
- Dynamic Programming (0/1 Knapsack)

---

## Author

**Nandini Ganta**  
Roll Number: A23126552266  
Email: gantanandini.23.csm@anits.edu.in  
Institution: ANITS (Anil Neerukonda Institute of Technology and Sciences)
