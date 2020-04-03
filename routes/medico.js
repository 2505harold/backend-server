const express = require("express");
const app = express();
const middleware = require("../middlewares/auth");
const Medico = require("../models/medico");

// ====================================
// MOstrar todos los medicos
// ====================================
app.get("/", (req, res) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate("usuario", "nombre email")
    .populate("hospital")
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error en la base de datos",
          error: err
        });
      }

      Medico.count({}, (err, conteo) => {
        return res.status(200).json({
          ok: true,
          medicos,
          total: conteo
        });
      });
    });
});

// ====================================
// Insertar nuevo medico
// ====================================
app.post("/", middleware.validar_token, (req, res) => {
  const body = req.body;
  const medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medico) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "error en los datos ingresados",
        error: err
      });
    }
    return res.status(200).json({
      ok: true,
      medico
    });
  });
});

// ====================================
// Actualizar medicos por ID
// ====================================
app.put("/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "error al buscar el medico",
        error: err
      });
    }
    if (!medico) {
      return res.status(500).json({
        ok: false,
        mensaje: "NO existe el medico con ID : " + id,
        error: "no existe medico"
      });
    }

    medico.nombre = req.body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = req.body.hospital;

    medico.save((err, medicoActualizado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: "error al actualizar",
          error: err
        });
      }

      res.status(200).json({
        ok: true,
        medico: medicoActualizado
      });
    });
  });
});

// ====================================
// Eliminar medico by id
// ====================================
app.delete("/:id", middleware.validar_token, (req, res) => {
  const id = req.params.id;
  Medico.findByIdAndDelete(id, (err, medico) => {
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
        mensaje: "el medico con ID : " + id + " no existe",
        error: err
      });
    }
    res.status(200).json({
      ok: true,
      medico
    });
  });
});

module.exports = app;
