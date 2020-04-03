const express = require("express");
const app = express();
const Hospital = require("../models/hospital");
const Medico = require("../models/medico");
const Usuario = require("../models/usuario");

// ====================================
// Busqueda por coleccion
// ====================================
app.get("/coleccion/:tabla/:busqueda", (req, res) => {
  const tabla = req.params.tabla;
  const busqueda = req.params.busqueda;
  const regex = new RegExp(busqueda, "i");
  var promesa;
  switch (tabla) {
    case "hospitales":
      promesa = buscarHospitales(regex);
      break;
    case "usuarios":
      promesa = buscarUsuarios(regex);
      break;
    case "medicos":
      promesa = buscarMedicos(regex);
      break;
    default:
      res.status(400).json({
        ok: false,
        mensaje: "Solo esta permtidos los tipos Medicos, Hospitales y Usuarios",
        error: { mensaje: "Error de tipo de coleccion" }
      });
      break;
  }

  promesa.then(data => {
    res.status(200).json({
      ok: true,
      [tabla]: data
    });
  });
});

// ====================================
// Obtener busquedas general
// ====================================
app.get("/todo/:busqueda", (req, res) => {
  const busqueda = req.params.busqueda;
  const regex = new RegExp(busqueda, "i");

  Promise.all([
    buscarHospitales(regex),
    buscarMedicos(regex),
    buscarUsuarios(regex)
  ]).then(respuestas => {
    res.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuarios: respuestas[2]
    });
  });
});

function buscarHospitales(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales");
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .populate("hospital")
      .exec((err, medicos) => {
        if (err) {
          reject("Error al cargar medicos");
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuarios(regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "nombre email role")
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar usuarios", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
