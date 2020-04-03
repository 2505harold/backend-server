const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const medicoSchema = new Schema({
  nombre: { type: String, required: [true, "El nombre es requerido"] },
  img: { type: String, required: false },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: [true, "El ID del usuario es requerido"]
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: "Hospital",
    required: [true, "El ID del hospital es requerido"]
  }
});

module.exports = mongoose.model("Medico", medicoSchema);
