const Cylon = require("cylon");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3100;
let isPlaying = false;
let debounce = false;
let debouncePress = false; // Para debounce en press
let debounceRelease = false; // Para debounce en release
let counter = 0;

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
    button: { driver: "button", pin: 2, pull: "up" }, // Configurar el botón con pull-up interno
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

    // Configura el pull-up interno del botón
    my.button.on("push", function () {
      if (!debouncePress) {
        debouncePress = true;
        console.log("Botón presionado");

        // Aquí empieza el juego
        if (!isPlaying) {
          console.log("Game started");
          isPlaying = true;
          my.led.turnOn(); // Enciende el LED al iniciar el juego
        } else {
          // Aquí se gana el juego
          console.log("Game won");
          isPlaying = false;
          my.led.turnOff(); // Apaga el LED al ganar
        }

        // Debounce para evitar múltiples activaciones al presionar
        setTimeout(() => {
          debouncePress = false;
        }, 500);
      }
    });

    // Detectar cuando se suelta el botón
    // my.button.on("release", function () {
    //   if (!debounceRelease) {
    //     debounceRelease = true;
    //     console.log("Botón liberado");

    //     // Debounce para evitar múltiples activaciones al liberar
    //     setTimeout(() => {
    //       debounceRelease = false;
    //     }, 500);
    //   }
    // });

    // Evento cuando se presiona el botón
    // my.button.on("push", async function () {
    //   console.log("Button pressed");

    //   debounce = true; // Activar el debounce para evitar múltiples disparos

    //   if (!isPlaying) {
    //     // Llamada al endpoint de inicio del juego
    //     try {
    //       console.log("Game started");
    //       isPlaying = true; // Cambiar el estado a jugando
    //       my.led.turnOn(); // Encender el LED
    //     } catch (error) {
    //       console.error("Error al iniciar el juego:", error);
    //     }
    //   } else {
    //     // Llamada al endpoint de victoria del juego
    //     try {
    //       console.log("Game won");
    //       isPlaying = false; // Cambiar el estado a victoria
    //       my.led.turnOff(); // Apagar el LED
    //     } catch (error) {
    //       console.error("Error al ganar el juego:", error);
    //     }
    //   }
    // });

    app.get("/game/state", (req, res) => {
      res.json({ isPlaying });
    });

    // Inicia el servidor Express
    app.listen(port, () => {
      console.log(`Express server running on http://localhost:${port}`);
    });
  },
}).start();
