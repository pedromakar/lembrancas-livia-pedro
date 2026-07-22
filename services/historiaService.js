const fs   = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'data', 'historia.json');

const lerHistoria = () => {
  try {
    const arquivo = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(arquivo || '[]');
  } catch (_) {
    return [];
  }
};

const escreverHistoria = (dados) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(dados, null, 2), 'utf8');
};

exports.obterTodos = async () => lerHistoria();

exports.obterPorId = async (id) => {
  return lerHistoria().find((e) => e.id === Number(id)) || null;
};

exports.criar = async (dados) => {
  const eventos = lerHistoria();
  const novoId  = eventos.length > 0 ? Math.max(...eventos.map((e) => e.id)) + 1 : 1;

  const novoEvento = {
    id:           novoId,
    data:         dados.data         || '',
    dataFormatada: dados.dataFormatada || '',
    titulo:       dados.titulo        || '',
    descricao:    dados.descricao     || '',
    emoji:        dados.emoji         || '❤️',
    cor:          dados.cor           || 'bordo',
    foto:         dados.foto          || '',
    destaque:     dados.destaque === 'true' || dados.destaque === true
  };

  eventos.push(novoEvento);
  escreverHistoria(eventos);
  return novoEvento;
};

exports.atualizar = async (id, dados) => {
  const eventos = lerHistoria();
  const idx     = eventos.findIndex((e) => e.id === Number(id));
  if (idx === -1) throw new Error('Evento não encontrado');

  eventos[idx] = {
    ...eventos[idx],
    data:         dados.data          || eventos[idx].data,
    dataFormatada: dados.dataFormatada || eventos[idx].dataFormatada,
    titulo:       dados.titulo         || eventos[idx].titulo,
    descricao:    dados.descricao      || eventos[idx].descricao,
    emoji:        dados.emoji          || eventos[idx].emoji,
    cor:          dados.cor            || eventos[idx].cor,
    foto:         dados.foto !== undefined ? dados.foto : eventos[idx].foto,
    destaque:     dados.destaque === 'true' || dados.destaque === true
  };

  escreverHistoria(eventos);
  return eventos[idx];
};

exports.deletar = async (id) => {
  const eventos    = lerHistoria();
  const filtrados  = eventos.filter((e) => e.id !== Number(id));
  escreverHistoria(filtrados);
  return true;
};
