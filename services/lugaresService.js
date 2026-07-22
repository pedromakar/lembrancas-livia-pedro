const fs   = require('fs');
const path = require('path');
const FILE_PATH = path.join(__dirname, '..', 'data', 'lugares.json');

const lerLugares = () => {
  try { return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8') || '[]'); }
  catch (_) { return []; }
};

const escreverLugares = (d) => fs.writeFileSync(FILE_PATH, JSON.stringify(d, null, 2), 'utf8');

exports.obterTodos = async () => lerLugares();

exports.criar = async (dados) => {
  const lugares = lerLugares();
  const novoId  = lugares.length > 0 ? Math.max(...lugares.map(l => l.id)) + 1 : 1;
  const novo = {
    id:        novoId,
    nome:      dados.nome      || '',
    descricao: dados.descricao || '',
    emoji:     dados.emoji     || '📍',
    lat:       parseFloat(dados.lat)  || 0,
    lng:       parseFloat(dados.lng)  || 0,
    data:      dados.data      || '',
    cor:       dados.cor       || '#5A1C35',
    foto:      dados.foto      || ''
  };
  lugares.push(novo);
  escreverLugares(lugares);
  return novo;
};

exports.atualizar = async (id, dados) => {
  const lugares = lerLugares();
  const idx     = lugares.findIndex(l => l.id === Number(id));
  if (idx === -1) throw new Error('Lugar não encontrado');
  lugares[idx] = { ...lugares[idx], ...dados, lat: parseFloat(dados.lat)||lugares[idx].lat, lng: parseFloat(dados.lng)||lugares[idx].lng, id: lugares[idx].id };
  escreverLugares(lugares);
  return lugares[idx];
};

exports.deletar = async (id) => {
  const lugares = lerLugares().filter(l => l.id !== Number(id));
  escreverLugares(lugares);
  return true;
};
