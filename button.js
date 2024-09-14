const { Board, Led, Servo, Button, Switch } = require("johnny-five");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3100;
let isPlaying = false;
let countdownTimeout = null;
let switchPressed = false;

// Create a new Johnny-Five board instance
const board = new Board({
  port: "COM1", // Change this to the correct COM port for your board
});

board.on("ready", function () {
  // Devices: LED, Servo, Button, and Switch
  const greenLed = new Led(13); // LED on pin 13 (onboard LED)
  const redLed = new Led(11);
  const servo = new Servo(10); // Servo on pin 10
  const switchControl = new Switch(2); // Switch on pin 2

  // CORS middleware
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // Endpoint to turn on the LED
  app.post("/led/on", (req, res) => {
    greenLed.on();
    console.log("LED_BUILTIN is ON");
    res.send("LED is turned ON");
  });

  // Endpoint to turn off the LED
  app.post("/led/off", (req, res) => {
    greenLed.off();
    console.log("LED_BUILTIN is OFF");
    res.send("LED is turned OFF");
  });

  // Endpoint to move the servo to 90 degrees
  app.post("/servo/90", (req, res) => {
    servo.to(90);
    console.log("Servo moved to 90 degrees");
    res.send("Servo moved to 90 degrees");
  });

  // Endpoint to move the servo to 180 degrees
  app.post("/servo/180", (req, res) => {
    servo.to(180);
    console.log("Servo moved to 180 degrees");
    res.send("Servo moved to 180 degrees");
  });

  // Endpoint to reset the servo to 0 degrees
  app.post("/servo/reset", (req, res) => {
    servo.to(0);
    console.log("Servo reset to 0 degrees");
    res.send("Servo reset to 0 degrees");
  });

  // Endpoint to get the game state
  app.get("/game/state", (req, res) => {
    res.json({ isPlaying });
  });

  // Endpoint para recibir segundos para el temporizador
  app.post("/game/timeout", (req, res) => {
    const { seconds } = req.body;

    if (typeof seconds !== "number" || seconds <= 0) {
      return res.status(400).send("Debes enviar un número de segundos válido.");
    }

    console.log(`Recibido request para temporizador, `, req.body);
    console.log(`Temporizador configurado para ${seconds} segundos`);

    // Si el switch ya ha sido presionado (primer ciclo del juego)
    switchControl.on("close", () => {
      if (!switchPressed) {
        // Primera pulsación: Inicia el juego
        isPlaying = true;
        switchPressed = true;
        greenLed.on(); // Enciende el LED verde
        console.log("Juego iniciado, LED verde encendido");

        // Inicia la cuenta atrás
        countdownTimeout = setTimeout(() => {
          greenLed.off(); // Apaga el LED verde cuando termina el tiempo
          console.log("Tiempo de juego terminado");
          isPlaying = false; // Cambia el estado del juego a falso al terminar el tiempo
          switchPressed = false; // Permite reiniciar el ciclo
        }, seconds * 1000);
      } else {
        // Segunda pulsación: Resetea el juego
        resetGame();
      }
    });

    // Envía la respuesta inmediatamente después de configurar el temporizador
    res.send(`Temporizador iniciado por ${seconds} segundos.`);
  });

  function resetGame() {
    if (countdownTimeout) {
      clearTimeout(countdownTimeout); // Cancela el timeout si está corriendo
      countdownTimeout = null; // Asegúrate de que se borre la referencia al temporizador
    }

    greenLed.off(); // Apaga el LED verde
    redLed.on(); // Enciende el LED rojo
    isPlaying = false; // Cambia el estado de juego a falso
    switchPressed = false; // Resetea el estado del switch
    console.log("Juego reiniciado, LED rojo encendido");

    setTimeout(() => {
      redLed.off(); // Apaga el LED rojo después de un breve periodo
      console.log("LED rojo apagado, juego listo para iniciar de nuevo.");
    }, 2000); // Apaga el LED rojo después de 2 segundos
  }

  // Start the Express server
  app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
  });
});

board.on("error", (err) => {
  console.error("Board error:", err.message);
});
