# Notification App Backend

Backend service for the Campus Evaluation notification system. This service is responsible for sending and managing notifications as part of the Affordmed Campus Evaluation project.

## Overview

The notification app backend handles the delivery of notifications to relevant stakeholders. It is designed as a standalone microservice that can be integrated with the broader Campus Evaluation platform.

## System Design

See [`notification-system-design.md`](../notification-system-design.md) for the full architecture and design decisions behind the notification system.

## Project Structure

```
notification-app-be/
├── services/        # Business logic for notification delivery
└── README.md
```

## Notification Types

The system is designed to support:

- **Email notifications** — alerts sent to depot managers or administrators
- **In-app notifications** — real-time updates within the evaluation platform
- **Scheduled notifications** — triggered based on maintenance schedule outcomes

## Getting Started

```bash
cd notification-app-be
npm install
npm start
```

## Author

**Nandini Ganta**  
Roll Number: A23126552266  
Email: gantanandini.23.csm@anits.edu.in
