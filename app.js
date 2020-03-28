//Requires
const express = require("express");
var mongoose = require("mongoose");

//Inicialzar variables
const app = express();
app.set("port", process.env.PORT || "3000");

//conexion a la base de datos
mongoose.connect(
  "mongodb://localhost/hospitalDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, resp) => {
    if (err) throw err; //detiene todo el proceso y mostramos el cerror el consola
    console.log("conectado a DB");
  }
);

//rutas
app.get("/", (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: "Peticion realizada correctamente"
  });
});

// escuchar peticiones
app.listen(app.get("port"), () => {
  console.log("server en puerto " + app.get("port"));
});
