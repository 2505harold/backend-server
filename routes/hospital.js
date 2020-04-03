const express = require("express");
const app = express();
const middleware = require("../middlewares/auth");
const Hospital = require("../models/hospital");

// ====================================
// Obtener todos los hospitales
// ====================================
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "Ocurrio un error con obtener la lista de hosptakes",
          error: err
        });
      }

      Hospital.count({}, (err, conteo) => {
        return res.status(200).json({
          ok: true,
          hospitales,
          total: conteo
        });
      });
    });
});

// ====================================
// Insertar nuevo hospital
// ====================================
app.post("/", middleware.validar_token, (req, res) => {
  const body = req.body;
  const hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });
  hospital.save((err, hospital) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Dados no han sido ingtesados correctamente",
        error: err
      });
    }

    res.status(201).json({
      ok: true,
      hospital,
      usuarioToken: req.usuario
    });
  });
});

// ====================================
// actualizar hospital by id
// ====================================
app.put("/:id", middleware.validar_token, (req, res) => {
  const id = req.params.id;
  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar hospital",
        error: err
      });
    }
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "el hospital con ID : " + id + " no existe",
        error: err
      });
    }

    hospital.nombre = req.body.nombre;
    hospital.usuario = req.usuario._id;
    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar el usuario",
          error: err
        });
      }

      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

// ====================================
// Eliminar hospital by id
// ====================================
app.delete("/:id", middleware.validar_token, (req, res) => {
  const id = req.params.id;
  Hospital.findByIdAndDelete(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar",
        error: err
      });
    }
    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: "el hospital con ID : " + id + " no existe",
        error: err
      });
    }
    res.status(200).json({
      ok: true,
      hospital
    });
  });
});

module.exports = app;
