const express = require("express");
const fileUpload = require("express-fileupload");
const Usuario = require("../models/usuario");
const Medico = require("../models/medico");
const Hospital = require("../models/hospital");
const fs = require("fs");
const app = express(express);

//middleware
app.use(fileUpload());

// ====================================
// Get
// ====================================
app.put("/:tipo/:id", (req, res) => {
  const tipo = req.params.tipo;
  const id = req.params.id;

  //tipos de coleccion
  const tiposValidos = ["hospitales", "medicos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de coleccion no es valida",
      errors: {
        message:
          "Los tipos de coleccion permitida son " + tiposValidos.join(", ")
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No ha seleccionado nada",
      errors: { message: "Debe seleccionar una imagen" }
    });
  }

  //Obtener nombre del archivo
  const archivo = req.files.imagen;
  const nombreCortado = archivo.name.split(".");
  const extensionArchivo = nombreCortado[nombreCortado.length - 1];

  //Solo estas extensiones aceptamos
  const extensionesValidas = ["png", "gif", "jpg", "jpeg"];
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Archivo no valido",
      errors: {
        message: "Las extensiones validas son " + extensionesValidas.join(", ")
      }
    });
  }

  //Nombre de archivo personalizado
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  //Mover el archivo del temporal a un path expecifico
  const path = `./uploads/${tipo}/${nombreArchivo}`;
  //mover archivo
  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover archivo",
        errors: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  switch (tipo) {
    case "usuarios":
      Usuario.findById(id, (err, usuario) => {
        const pathViejo = "./uploads/usuarios/" + usuario.img;
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error en la base de datos",
            errors: err
          });
        }
        if (!usuario) {
          return res.status(400).json({
            ok: false,
            mensaje: "Usuario no existe",
            errors: { mensaje: "El usuario con ID " + id + " no existe" }
          });
        }
        //si exite archivo eliminalo
        if (fs.existsSync(pathViejo)) {
          fs.unlinkSync(pathViejo);
        }

        usuario.img = nombreArchivo;
        usuario.save((err, usuarioActualizado) => {
          if (err) {
            return res.status(500).json({
              ok: true,
              mensaje: "Error en la base de datos",
              errors: err
            });
          }
          return res.status(200).json({
            ok: true,
            mensaje: "Imagen de usuario actualizado",
            usuario: usuarioActualizado
          });
        });
      });
      break;
    case "hospitales":
      Hospital.findById(id, (err, hospital) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error en la base de datos",
            errors: err
          });
        }
        if (!hospital) {
          return res.status(400).json({
            ok: false,
            mensaje: "Hospital no existe",
            errors: { mensaje: "El hospital con ID " + id + " no existe" }
          });
        }
        const pathViejo = "./uploads/hospitales/" + hospital.img;
        if (fs.existsSync(pathViejo)) {
          fs.unlink(pathViejo);
        }
        hospital.img = nombreArchivo;
        hospital.save((err, hospitalActualizado) => {
          if (err) {
            return res.status(500).json({
              ok: true,
              mensaje: "Error en la base de datos",
              errors: err
            });
          }
          return res.status(200).json({
            ok: true,
            mensaje: "Hospital actualizado",
            hospital: hospitalActualizado
          });
        });
      });
      break;
    case "medicos":
      Medico.findById(id, (err, medico) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error en la base de datos",
            errors: err
          });
        }
        if (!medico) {
          return res.status(400).json({
            ok: false,
            mensaje: "Medico no existe",
            errors: { mensaje: "El medico con ID " + id + " no existe" }
          });
        }
        const pathViejo = "./uploads/medicos/" + medico.img;
        if (fs.existsSync(pathViejo)) {
          fs.unlink(pathViejo);
        }
        medico.img = nombreArchivo;
        medico.save((err, medicoActualizado) => {
          if (err) {
            return res.status(500).json({
              ok: true,
              mensaje: "Error en la base de datos",
              errors: err
            });
          }
          return res.status(200).json({
            ok: true,
            mensaje: "Medico actualizado",
            medico: medicoActualizado
          });
        });
      });
      break;
  }
}

module.exports = app;
