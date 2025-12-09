const mongoose = require('mongoose');

const reservaConfigSchema = new mongoose.Schema({
  politicaCancelacion: {
    type: String,
    default: 'Se puede cancelar sin costo hasta 2 días antes de la fecha de la reserva.'
  },
  politicaModificacion: {
    type: String,
    default: 'Se puede modificar la reserva hasta 8 horas antes.'
  },
  politicaAbono: {
    type: String,
    default: 'Para eventos o platos especiales, se podría requerir un abono del 10% o 15% (configurable).'
  },
  bancoNombre: {
    type: String,
    default: 'BANCOLOMBIA'
  },
  cuentaNumero: {
    type: String,
    default: '47675777558'
  },
  cuentaTipo: {
    type: String,
    default: 'Ahorros'
  },
  cuentaNombre: {
    type: String,
    default: 'María Mendoza'
  },
  nequiNumero: {
    type: String,
    default: '@3105539582'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ReservaConfig', reservaConfigSchema);