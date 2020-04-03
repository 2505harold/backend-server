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
const hospitalRoutes = require("./routes/hospital");
const medicoRoutes = require("./routes/medico");
const busquedaRoutes = require("./routes/busqueda");
const uploadRoutes = require("./routes/upload");
const imagenesRoutes = require("./routes/imagenes");

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
app.use("/img", imagenesRoutes);
app.use("/upload", uploadRoutes);
app.use("/busqueda", busquedaRoutes);
app.use("/medico", medicoRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/login", loginRoutes);
app.use("/usuario", usuarioRoutes);
app.use("/", appRoutes);

// escuchar peticiones
app.listen(app.get("port"), () => {
  console.log("server en puerto " + app.get("port"));
});
