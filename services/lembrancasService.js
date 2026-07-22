const fs   = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'data', 'lembrancas.json');

const lerLembrancas = () => {
  try {
    const arquivo = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(arquivo || '[]');
  } catch (_) {
    return [];
  }
};

const escreverLembrancas = (lembrancas) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(lembrancas, null, 2), 'utf8');
};

exports.obterTodas = async () => lerLembrancas();

exports.obterPorId = async (id) =>
  lerLembrancas().find((l) => l.id === Number(id)) || null;

exports.criar = async (dados) => {
  const lembrancas = lerLembrancas();
  const novoId = lembrancas.length > 0 ? Math.max(...lembrancas.map((l) => l.id)) + 1 : 1;

  const novaLembranca = {
    id:           novoId,
    titulo:       dados.titulo        || '',
    data:         dados.data          || '',
    dataFormatada: dados.dataFormatada || '',
    descricao:    dados.descricao     || '',
    icone:        dados.icone         || '📸',
    tags:         dados.tags          || '',
    imagem:       dados.imagem        || '',
    favorito:     dados.favorito === 'true' || dados.favorito === true,
    local:        dados.local         || ''
  };

  lembrancas.push(novaLembranca);
  escreverLembrancas(lembrancas);
  return novaLembranca;
};

exports.atualizar = async (id, dados) => {
  const lembrancas = lerLembrancas();
  const idx        = lembrancas.findIndex((l) => l.id === Number(id));
  if (idx === -1) throw new Error('Lembrança não encontrada');

  lembrancas[idx] = {
    ...lembrancas[idx],
    titulo:       dados.titulo        || lembrancas[idx].titulo,
    data:         dados.data          !== undefined ? dados.data   : lembrancas[idx].data,
    dataFormatada: dados.dataFormatada || lembrancas[idx].dataFormatada,
    descricao:    dados.descricao     || lembrancas[idx].descricao,
    icone:        dados.icone         || lembrancas[idx].icone,
    tags:         dados.tags          !== undefined ? dados.tags   : lembrancas[idx].tags,
    imagem:       dados.imagem        !== undefined ? dados.imagem : lembrancas[idx].imagem,
    favorito:     dados.favorito === 'true' || dados.favorito === true,
    local:        dados.local         !== undefined ? dados.local  : lembrancas[idx].local
  };

  escreverLembrancas(lembrancas);
  return lembrancas[idx];
};

exports.toggleFavorito = async (id) => {
  const lembrancas = lerLembrancas();
  const idx        = lembrancas.findIndex((l) => l.id === Number(id));
  if (idx === -1) throw new Error('Lembrança não encontrada');
  lembrancas[idx].favorito = !lembrancas[idx].favorito;
  escreverLembrancas(lembrancas);
  return lembrancas[idx];
};

exports.deletar = async (id) => {
  const lembrancas     = lerLembrancas();
  const novasLembrancas = lembrancas.filter((l) => l.id !== Number(id));
  escreverLembrancas(novasLembrancas);
  return true;
};

exports.obterAleatoria = async () => {
  const lembrancas = lerLembrancas();
  if (!lembrancas.length) return null;
  return lembrancas[Math.floor(Math.random() * lembrancas.length)];
};
