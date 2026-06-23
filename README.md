# Campus Evaluation Backend

This repository contains the backend services developed as part of the Affordmed Campus Evaluation.

## Project Structure

### logging-middleware

A reusable logging module used across the backend services. It sends structured logs to the Affordmed logging API and helps track application events and errors consistently.

### vehicle-scheduler-be

A Node.js and Express based microservice that fetches depot and vehicle data from the Affordmed Evaluation APIs and generates an optimized maintenance schedule.

The service determines the best set of vehicles to service for each depot while ensuring the total maintenance duration stays within the available mechanic hours.

## API Endpoint

### Get Optimized Schedule

```http
GET /schedule
```

### Sample Response

```json
[
  {
    "depotId": 2,
    "mechanicHours": 135,
    "totalImpact": 141,
    "selectedVehicles": [
      {
        "TaskID": "...",
        "Duration": 7,
        "Impact": 5
      }
    ]
  }
]
```

## Installation

Clone the repository and install dependencies:

```bash
cd vehicle-scheduler-be
npm install
```

Start the server:

```bash
node server.js
```

The application will run on:

```bash
http://localhost:3000
```

## Technologies Used

* Node.js
* Express.js
* Axios
* JavaScript
* REST APIs

## Screenshots

The repository includes screenshots showing:

* Project folder structure
* Successful API execution in Postman
* Optimized scheduling output

## Notes

* Protected Affordmed APIs were accessed using Bearer Token authentication.
* Vehicle scheduling was implemented using an optimization approach to maximize total impact within the mechanic-hours constraint.
* Logging integration was reused from the logging middleware developed in the previous stage.

## Author

Nandini Ganta

Roll Number: A23126552266
