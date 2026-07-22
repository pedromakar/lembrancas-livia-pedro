const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'data', 'cartas.json');

const lerCartas = () => {
  try {
    const arquivo = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(arquivo || '[]');
  } catch (error) {
    console.log('Erro ao ler cartas:', error);
    return [];
  }
};

const escreverCartas = (cartas) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(cartas, null, 2), 'utf8');
};

exports.obterTodas = async () => {
  const cartas = lerCartas();
  return cartas.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
};

exports.obterPorId = async (id) => {
  const cartas = lerCartas();
  return cartas.find((c) => c.id === Number(id)) || null;
};

exports.criar = async (dados) => {
  const cartas = lerCartas();
  const novoId = cartas.length > 0 ? Math.max(...cartas.map((c) => c.id)) + 1 : 1;
  const agora  = new Date().toISOString();

  const novaCarta = {
    id:               novoId,
    titulo:           dados.titulo,
    conteudo:         dados.conteudo,
    data:             dados.data             || '',
    autor:            dados.autor            || '',
    data_criacao:     agora,
    data_atualizacao: agora
  };

  cartas.push(novaCarta);
  escreverCartas(cartas);
  return novaCarta;
};

exports.atualizar = async (id, dados) => {
  const cartas = lerCartas();
  const index  = cartas.findIndex((c) => c.id === Number(id));
  if (index === -1) throw new Error('Carta não encontrada');

  cartas[index] = {
    ...cartas[index],
    titulo:           dados.titulo,
    conteudo:         dados.conteudo,
    data:             dados.data   !== undefined ? dados.data   : cartas[index].data,
    autor:            dados.autor  !== undefined ? dados.autor  : cartas[index].autor,
    data_atualizacao: new Date().toISOString()
  };

  escreverCartas(cartas);
  return cartas[index];
};

exports.deletar = async (id) => {
  const cartas = lerCartas();
  const novasCartas = cartas.filter((c) => c.id !== Number(id));
  escreverCartas(novasCartas);
  return true;
};
