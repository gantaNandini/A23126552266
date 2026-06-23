# Logging Middleware

A reusable logging module for the Campus Evaluation backend services. It sends structured log entries to the Affordmed Logging API and provides consistent event and error tracking across all microservices.

## Purpose

Instead of writing ad-hoc `console.log` statements in every service, this middleware centralizes logging so that:

- All services emit logs in a consistent format
- Logs are forwarded to the Affordmed evaluation logging endpoint
- Errors and application events are traceable across the system

## Usage

Install the module in any backend service:

```bash
npm install
```

Import and use in your Express app or service:

```js
const logger = require('./logging-middleware');

// Log an info event
logger.log('info', 'Server started on port 3000');

// Log an error
logger.log('error', 'Failed to fetch depot data', { details: error.message });
```

## Integration

This middleware was integrated into the `vehicle-scheduler-be` service to log:

- Incoming API requests
- External API call results (depots, vehicles)
- Errors from the Affordmed evaluation service

## Author

**Nandini Ganta**  
Roll Number: A23126552266  
Email: gantanandini.23.csm@anits.edu.in
