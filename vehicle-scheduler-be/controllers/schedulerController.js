const axios = require("axios");
const { optimizeVehicles } = require("../services/schedulerService");

exports.getSchedule = async (req, res) => {
  try {
    const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJnYW50YW5hbmRpbmkuMjMuY3NtQGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjE5OTg0MSwiaWF0IjoxNzgyMTk4OTQxLCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZDAwNDk4MWQtZTFmMi00NzUyLWI5YzgtMTgyMWE3ZmU5NDE1IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmFuZGluaSBnYW50YSIsInN1YiI6ImIzMzYwMGUzLTI5ZWItNDJkMC05NTA0LTVjZmI0YmY1NGM3NCJ9LCJlbWFpbCI6ImdhbnRhbmFuZGluaS4yMy5jc21AYW5pdHMuZWR1LmluIiwibmFtZSI6Im5hbmRpbmkgZ2FudGEiLCJyb2xsTm8iOiJhMjMxMjY1NTIyNjYiLCJhY2Nlc3NDb2RlIjoiTVRxeGFyIiwiY2xpZW50SUQiOiJiMzM2MDBlMy0yOWViLTQyZDAtOTUwNC01Y2ZiNGJmNTRjNzQiLCJjbGllbnRTZWNyZXQiOiJNY05wd3JyYWVrSFN5VnpVIn0.Nc_fbRrADpDmunn35lJLmVNmcOYgha6tTutJepQG--o";

    const depotsResponse = await axios.get(
      "http://4.224.186.213/evaluation-service/depots",
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      }
    );

    const vehiclesResponse = await axios.get(
      "http://4.224.186.213/evaluation-service/vehicles",
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      }
    );
    console.log("Depots:", depotsResponse.data);
    console.log("Vehicles:", vehiclesResponse.data);

    const depots = depotsResponse.data.depots;
    const vehicles = vehiclesResponse.data.vehicles;



    const results = depots.map((depot) => {
      const schedule = optimizeVehicles(
        vehicles,
        depot.MechanicHours
      );

      return {
        depotId: depot.ID,
        mechanicHours: depot.MechanicHours,
        totalImpact: schedule.totalImpact,
        selectedVehicles: schedule.selectedVehicles
      };
    });

    res.json(results);
  } catch (error) {
  console.log("ERROR DATA:", error.response?.data);
  console.log("ERROR STATUS:", error.response?.status);

  res.status(500).json({
    error: error.response?.data || error.message
  });
}
};