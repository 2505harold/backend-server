const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const Usuario = require("../models/usuario");
const middleware = require("../middlewares/auth");

// ====================================
// Obetener todos los usuarios
// ====================================
app.get("/", (req, res, next) => {
  Usuario.find({}, "nombre email img").exec((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando usuario",
        errors: err
      });
    }

    return res.status(200).json({
      ok: true,
      usuarios
    });
  });
});

// ====================================
// Crear un nuevo usuario
// ====================================
app.post("/", middleware.validar_token, (req, res) => {
  const body = req.body;

  //creando una referencia del tipo suaurio
  const usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario",
        errors: err
      });
    }
    return res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });
});

// ====================================
// Actualizr usuarios
// ====================================
app.put("/:id", middleware.validar_token, (req, res) => {
  const id = req.params.id;
  const body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: "El usuario con el id " + id + " no existe ",
        errors: { message: "No existe un usuario con ese ID" }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: "Error al actualizar usuario",
          errors: err
        });
      }
      return res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });
    });
  });
});

// ====================================
// Eliminar un usuario por el ID
// ====================================
app.delete("/:id", middleware.validar_token, (req, res) => {
  const id = req.params.id;
  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuarop",
        errors: err
      });
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe usuario con el id " + id,
        errors: { message: "NO existe usuario" }
      });
    }

    return res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });
  });
});

module.exports = app;
