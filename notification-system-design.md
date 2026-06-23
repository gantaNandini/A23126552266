# Notification System Design

## Overview

This document describes the architecture and design of the notification system for the Campus Evaluation backend. The system is responsible for delivering timely notifications to relevant users based on events triggered within the platform.

## Goals

- Decouple notification delivery from core business logic
- Support multiple notification channels (email, in-app)
- Ensure reliable delivery with basic retry handling
- Keep the system lightweight and easy to extend

## Architecture

```
[Event Source]
     │
     ▼
[Notification Service]
     │
     ├──► [Email Channel]     → SMTP / Email API
     └──► [In-App Channel]    → WebSocket / REST push
```

### Components

| Component              | Responsibility                                           |
|------------------------|----------------------------------------------------------|
| Event Source           | Any service (e.g., scheduler) that triggers a notification |
| Notification Service   | Routes events to the appropriate notification channel    |
| Email Channel          | Formats and sends email notifications                    |
| In-App Channel         | Pushes real-time updates to connected clients            |

## Notification Flow

1. A service (e.g., `vehicle-scheduler-be`) completes a schedule and emits an event.
2. The Notification Service receives the event payload.
3. The service determines the target recipients and channel.
4. The notification is formatted and dispatched.
5. Delivery status is logged via the logging middleware.

## Event Payload Schema

```json
{
  "eventType": "SCHEDULE_COMPLETE",
  "timestamp": "2026-06-23T10:00:00Z",
  "data": {
    "depotId": 2,
    "totalImpact": 141,
    "vehicleCount": 5
  },
  "recipients": ["admin@example.com"]
}
```

## Channels

### Email
- Triggered for schedule completion and critical error events
- Uses an SMTP provider or transactional email API
- Template-based formatting for consistency

### In-App
- Real-time delivery via WebSocket connection
- Falls back to polling if WebSocket is unavailable
- Displays in the user's notification panel

## Error Handling & Retry

- Failed deliveries are logged with error details
- A simple retry mechanism (up to 3 attempts) is applied before marking as failed
- All delivery attempts are recorded via the logging middleware

## Future Enhancements

- SMS notifications via a third-party provider
- Notification preferences per user
- Delivery receipts and read status tracking
- Queue-based delivery (e.g., using Redis or a message broker)

## Author

**Nandini Ganta**  
Roll Number: A23126552266  
Email: gantanandini.23.csm@anits.edu.in
