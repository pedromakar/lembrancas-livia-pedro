const fs = require('fs');
const path = require('path');
const principalService  = require('../services/principalService');
const lembrancasService = require('../services/lembrancasService');
const playlistService   = require('../services/playlistService');
const historiaService   = require('../services/historiaService');
const lugaresService    = require('../services/lugaresService');

// Carrega config do casal
function carregarConfig() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json'), 'utf8');
    return JSON.parse(raw);
  } catch (_) {
    return {
      casal: { nome1: 'Makar', nome2: 'Lívia', dataInicio: '2026-01-16', fotoCasal: '', fotoHome: '' },
      frases: [],
      configuracoes: { coracoesAtivos: true, modoCelebracaoAtivo: true }
    };
  }
}

// GET - Página inicial
exports.getPrincipal = async (req, res) => {
  try {
    const config = carregarConfig();
    const dataInicio = new Date(config.casal.dataInicio || '2026-01-16');

    res.render('index', {
      title: 'Nosso Lugar',
      dataInicio,
      config
    });
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Algo deu errado' });
  }
};

// GET - Retorna o tempo junto (em JSON para o JavaScript)
exports.getTempo = async (req, res) => {
  try {
    const config = carregarConfig();
    const dataInicio = new Date(config.casal.dataInicio || '2026-01-16');
    const agora = new Date();
    const diferenca = agora - dataInicio;

    const totalSeg  = Math.floor(diferenca / 1000);
    const totalMin  = Math.floor(totalSeg  / 60);
    const totalHora = Math.floor(totalMin  / 60);
    const totalDias = Math.floor(totalHora / 24);

    res.json({
      anos:     Math.floor(totalDias / 365),
      meses:    Math.floor((totalDias % 365) / 30),
      dias:     Math.floor((totalDias % 365) % 30),
      horas:    totalHora % 24,
      minutos:  totalMin  % 60,
      segundos: totalSeg  % 60
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao calcular tempo' });
  }
};

// GET - API: lembrança aleatória (para botão "Me surpreenda")
exports.getLembrancaAleatoria = async (req, res) => {
  try {
    const lembranca = await lembrancasService.obterAleatoria();
    if (!lembranca) return res.json(null);
    res.json(lembranca);
  } catch (error) {
    res.status(500).json({ erro: 'Erro' });
  }
};

// GET - Página da playlist
exports.getPlaylist = async (req, res) => {
  try {
    const musicas = await playlistService.obterTodas();
    const config  = carregarConfig();
    res.render('playlist', { title: 'Nossa Playlist', musicas, config });
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Algo deu errado' });
  }
};

// POST - Criar música
exports.criarMusica = async (req, res) => {
  try {
    const { titulo, artista, duracao, memoria, url } = req.body;
    await playlistService.criar({ titulo, artista, duracao, memoria, url });
    res.redirect('/playlist');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao adicionar música' });
  }
};

// POST - Editar música
exports.editarMusica = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, artista, duracao, memoria, url } = req.body;
    await playlistService.atualizar(id, { titulo, artista, duracao, memoria, url });
    res.redirect('/playlist');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao editar música' });
  }
};

// POST - Deletar música
exports.deletarMusica = async (req, res) => {
  try {
    const { id } = req.params;
    await playlistService.deletar(id);
    res.redirect('/playlist');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao excluir música' });
  }
};

// GET - Página das lembranças
exports.getLembrancas = async (req, res) => {
  try {
    const lembrancas = await lembrancasService.obterTodas();
    const config     = carregarConfig();
    res.render('lembrancas', { title: 'Lembranças Fofas', lembrancas, config });
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Algo deu errado' });
  }
};

// POST - Criar lembrança
exports.criarLembranca = async (req, res) => {
  try {
    const { titulo, data, descricao, icone, tags, imagem } = req.body;
    await lembrancasService.criar({ titulo, data, descricao, icone, tags, imagem });
    res.redirect('/lembrancas');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao adicionar lembrança' });
  }
};

// POST - Editar lembrança
exports.editarLembranca = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, data, descricao, icone, tags, imagem } = req.body;
    await lembrancasService.atualizar(id, { titulo, data, descricao, icone, tags, imagem });
    res.redirect('/lembrancas');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao editar lembrança' });
  }
};

// POST - Deletar lembrança
exports.deletarLembranca = async (req, res) => {
  try {
    const { id } = req.params;
    await lembrancasService.deletar(id);
    res.redirect('/lembrancas');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao excluir lembrança' });
  }
};

// POST - Favoritar / desfavoritar lembrança (API JSON)
exports.toggleFavoritoLembranca = async (req, res) => {
  try {
    const { id } = req.params;
    const lembranca = await lembrancasService.toggleFavorito(id);
    res.json({ favorito: lembranca.favorito, id: lembranca.id });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao favoritar' });
  }
};

// GET - Nossa História
exports.getHistoria = async (req, res) => {
  try {
    const eventos = await historiaService.obterTodos();
    const config  = carregarConfig();
    res.render('historia', { title: 'Nossa História', eventos, config });
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Algo deu errado' });
  }
};

// POST - Criar evento
exports.criarEvento = async (req, res) => {
  try {
    const { data, dataFormatada, titulo, descricao, emoji, cor, foto, destaque } = req.body;
    await historiaService.criar({ data, dataFormatada, titulo, descricao, emoji, cor, foto, destaque });
    res.redirect('/historia');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao criar evento' });
  }
};

// POST - Editar evento
exports.editarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, dataFormatada, titulo, descricao, emoji, cor, foto, destaque } = req.body;
    await historiaService.atualizar(id, { data, dataFormatada, titulo, descricao, emoji, cor, foto, destaque });
    res.redirect('/historia');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao editar evento' });
  }
};

// POST - Deletar evento
exports.deletarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    await historiaService.deletar(id);
    res.redirect('/historia');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao excluir evento' });
  }
};

// ─── LUGARES ────────────────────────────────────────────────────

exports.getLugares = async (req, res) => {
  try {
    const lugares = await lugaresService.obterTodos();
    const config  = carregarConfig();
    res.render('lugares', { title: 'Lugares', lugares, config });
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Algo deu errado' });
  }
};

exports.criarLugar = async (req, res) => {
  try {
    const { nome, descricao, emoji, lat, lng, data, cor, foto } = req.body;
    await lugaresService.criar({ nome, descricao, emoji, lat, lng, data, cor, foto });
    res.redirect('/lugares');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao criar lugar' });
  }
};

exports.editarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, emoji, lat, lng, data, cor, foto } = req.body;
    await lugaresService.atualizar(id, { nome, descricao, emoji, lat, lng, data, cor, foto });
    res.redirect('/lugares');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao editar lugar' });
  }
};

exports.deletarLugar = async (req, res) => {
  try {
    await lugaresService.deletar(req.params.id);
    res.redirect('/lugares');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao excluir lugar' });
  }
};

// ─── ESTATÍSTICAS ──────────────────────────────────────────────

exports.getEstatisticas = async (req, res) => {
  try {
    const [lembrancas, cartas, musicas, lugares, eventos] = await Promise.all([
      lembrancasService.obterTodas(),
      require('../services/cartasService').obterTodas(),
      playlistService.obterTodas(),
      lugaresService.obterTodos(),
      historiaService.obterTodos()
    ]);
    const config   = carregarConfig();
    const dataInicio = new Date(config.casal.dataInicio || '2026-01-16');
    const diasJuntos = Math.floor((new Date() - dataInicio) / (1000 * 60 * 60 * 24));
    const stats = {
      diasJuntos,
      lembrancas:  lembrancas.length,
      favoritas:   lembrancas.filter(l => l.favorito).length,
      cartas:      cartas.length,
      musicas:     musicas.length,
      lugares:     lugares.length,
      momentos:    eventos.length
    };
    res.render('estatisticas', { title: 'Estatísticas', stats, config });
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Algo deu errado' });
  }
};
