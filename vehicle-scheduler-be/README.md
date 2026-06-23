# Vehicle Scheduler Backend

A Node.js + Express microservice that generates an optimized vehicle maintenance schedule for each depot by fetching live data from the Affordmed Evaluation APIs.

## Overview

The service fetches depot and vehicle data, then uses a **0/1 Knapsack dynamic programming algorithm** to determine the best combination of vehicles to service per depot — maximizing total impact while staying within each depot's available mechanic hours.

## Project Structure

```
vehicle-scheduler-be/
├── controllers/
│   └── schedulerController.js   # Fetches depot & vehicle data, builds response
├── routes/
│   └── schedulerRoutes.js       # Defines GET /schedule route
├── services/
│   └── schedulerService.js      # Knapsack DP optimization logic
├── server.js                    # Express app entry point
└── package.json
```

## API Endpoint

### Get Optimized Schedule

```
GET /schedule
```

Returns an optimized maintenance schedule for every depot.

#### Sample Response

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

## Algorithm

`schedulerService.js` implements the classic **0/1 Knapsack** algorithm:

- **Capacity** → `MechanicHours` available at the depot
- **Weight** → `Duration` (hours) required to service a vehicle
- **Value** → `Impact` score of servicing the vehicle
- The DP table is back-traced to identify the exact set of selected vehicles

## Installation & Running

```bash
cd vehicle-scheduler-be
npm install
node server.js
```

Server runs on **http://localhost:3000**

## Dependencies

| Package   | Version  | Purpose                    |
|-----------|----------|----------------------------|
| express   | ^5.2.1   | HTTP server framework      |
| axios     | ^1.18.1  | HTTP client for API calls  |
| cors      | ^2.8.6   | Cross-Origin Resource Sharing |

## Notes

- Affordmed Evaluation APIs are accessed using **Bearer Token** authentication.
- The token is embedded in the controller for evaluation purposes.

## Author

**Nandini Ganta**  
Roll Number: A23126552266  
Email: gantanandini.23.csm@anits.edu.in
