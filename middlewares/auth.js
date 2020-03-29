const SEED = require("../config/config").SEED;
const jwt = require("jsonwebtoken");

// ====================================
// Verifica token
// ====================================
exports.validar_token = (req, res, next) => {
  const token = req.query.token;
  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: "Token no valido",
        errors: err
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};
