const Cylon = require("cylon");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

// Use CORS middleware
app.use(cors());

// Parse JSON bodies
app.use(express.json());

Cylon.robot({
  connections: {
    firmata: { adaptor: "firmata", port: "COM1" }, // Reemplaza 'COM1' con tu puerto COM
  },

  devices: {
    led: { driver: "led", pin: 13 }, // LED_BUILTIN
    servo: { driver: "servo", pin: 10 }, // Pin del servomotor
  },

  work: function (my) {
    // Endpoint para encender el LED
    app.post("/led/on", (req, res) => {
      my.led.turnOn();
      console.log("LED_BUILTIN is ON");
      res.send("LED is turned ON");
    });

    // Endpoint para apagar el LED
    app.post("/led/off", (req, res) => {
      my.led.turnOff();
      console.log("LED_BUILTIN is OFF");
      res.send("LED is turned OFF");
    });

    // Endpoint para mover el servo a 90 grados
    app.post("/servo/90", (req, res) => {
      my.servo.angle(100);
      console.log("Servo moved to 90 degrees");
      res.send("Servo moved to 90 degrees");
    });

    app.post("/servo/180", (req, res) => {
      my.servo.angle(200);
      console.log("Servo moved to 180 degrees");
      res.send("Servo moved to 180 degrees");
    });

    // Endpoint para resetear el servo (vuelve a 0 grados)
    app.post("/servo/reset", (req, res) => {
      my.servo.angle(0);
      console.log("Servo reset to 0 degrees");
      res.send("Servo reset to 0 degrees");
    });

    // Inicia el servidor Express
    app.listen(port, () => {
      console.log(`Express server running on http://localhost:${port}`);
    });
  },
}).start();
