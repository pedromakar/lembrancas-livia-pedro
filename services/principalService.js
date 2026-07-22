// Service para lógica de negócio da página principal

exports.calcularTempoJunto = (dataInicio) => {
  const agora = new Date();
  const diferenca = agora - dataInicio;

  return {
    dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)),
    horas: Math.floor((diferenca / (1000 * 60 * 60)) % 24),
    minutos: Math.floor((diferenca / 1000 / 60) % 60),
    segundos: Math.floor((diferenca / 1000) % 60)
  };
};
