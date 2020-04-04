const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const Usuario = require("../models/usuario");
const SEED = require("../config/config").SEED;

//Google
const CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

// ====================================
// Autenticacion google
// ====================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID
  });
  const payload = ticket.getPayload();
  //const userid = payload["sub"];
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}
app.post("/google", async (req, res) => {
  const token = req.body.token;
  const googleUser = await verify(token).catch(err => {
    return res.status(403).json({
      ok: false,
      mensaje: "Token no valido"
    });
  });

  //el usuario google existe
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: "Debe usar su autenticacion normal"
        });
      } else {
        const token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        });

        return res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token,
          id: usuarioDB._id
        });
      }
    } else {
      //el usuario no existe y hay que crearlo
      const usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ":)";

      usuario.save((err, usuarioDB) => {
        const token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        });

        return res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token,
          id: usuarioDB._id
        });
      });
    }
  });
});

// ====================================
// Autenticacion normal
// ====================================
app.post("/", (req, res) => {
  const body = req.body;

  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al buscar usuario",
        errors: err
      });
    }
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: "credenciales incorrectas",
        errors: err
      });
    }

    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: "credenciales incorrectas",
        errors: err
      });
    }

    //crear un token de validar usuario y password
    usuarioDB.password = ":)";
    const token = jwt.sign({ usuario: usuarioDB }, SEED, {
      expiresIn: 14400
    });

    return res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token,
      id: usuarioDB._id
    });
  });
});

module.exports = app;
