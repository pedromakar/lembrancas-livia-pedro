const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, '..', 'data', 'playlist.json');

const lerPlaylist = () => {
  try {
    const arquivo = fs.readFileSync(FILE_PATH, 'utf8');
    return JSON.parse(arquivo || '[]');
  } catch (error) {
    console.log('Erro ao ler playlist:', error);
    return [];
  }
};

const escreverPlaylist = (playlist) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify(playlist, null, 2), 'utf8');
};

exports.obterTodas = async () => {
  return lerPlaylist();
};

exports.obterPorId = async (id) => {
  const playlist = lerPlaylist();
  return playlist.find((p) => p.id === Number(id)) || null;
};

exports.criar = async (dados) => {
  const playlist = lerPlaylist();
  const novoId = playlist.length > 0 ? Math.max(...playlist.map((p) => p.id)) + 1 : 1;

  const novaMusica = {
    id: novoId,
    titulo: dados.titulo,
    artista: dados.artista,
    duracao: dados.duracao || '3:00',
    memoria: dados.memoria || '',
    url: dados.url || ''
  };

  playlist.push(novaMusica);
  escreverPlaylist(playlist);
  return novaMusica;
};

exports.atualizar = async (id, dados) => {
  const playlist = lerPlaylist();
  const index = playlist.findIndex((p) => p.id === Number(id));
  if (index === -1) {
    throw new Error('Música não encontrada');
  }

  playlist[index] = {
    ...playlist[index],
    titulo: dados.titulo,
    artista: dados.artista,
    duracao: dados.duracao || playlist[index].duracao,
    memoria: dados.memoria || playlist[index].memoria,
    url: dados.url !== undefined ? dados.url : playlist[index].url
  };

  escreverPlaylist(playlist);
  return playlist[index];
};

exports.deletar = async (id) => {
  const playlist = lerPlaylist();
  const novaPlaylist = playlist.filter((p) => p.id !== Number(id));
  escreverPlaylist(novaPlaylist);
  return true;
};
