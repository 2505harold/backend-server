//Requires
const express = require("express");
var mongoose = require("mongoose");

//Inicialzar variables
const app = express();
app.set("port", process.env.PORT || "3000");

//importar rutas
const appRoutes = require("./routes/app");
const usuarioRoutes = require("./routes/usuario");
const loginRoutes = require("./routes/login");

//conexion a la base de datos
mongoose.connect(
  "mongodb://localhost/hospitalDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  },
  (err, resp) => {
    if (err) throw err; //detiene todo el proceso y mostramos el cerror el consola
    console.log("conectado a DB");
  }
);

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//rutass
app.use("/login", loginRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/", appRoutes);

// escuchar peticiones
app.listen(app.get("port"), () => {
  console.log("server en puerto " + app.get("port"));
});
