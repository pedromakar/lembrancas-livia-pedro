const fs = require('fs');
const path = require('path');
const cartasService = require('../services/cartasService');

function carregarConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'config.json'), 'utf8'));
  } catch (_) {
    return { casal: { nome1: 'Makar', nome2: 'Lívia', dataInicio: '2026-01-16' }, frases: [], configuracoes: {} };
  }
}

// GET - Listar todas as cartas
exports.listar = async (req, res) => {
  try {
    const cartas = await cartasService.obterTodas();
    const config = carregarConfig();
    res.render('cartas/lista', { title: 'Nossas Cartas', cartas, config });
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao listar cartas' });
  }
};

// POST - Criar nova carta (via modal inline)
exports.criar = async (req, res) => {
  try {
    const { titulo, conteudo, data, autor } = req.body;
    if (!titulo || !conteudo) return res.redirect('/cartas');
    await cartasService.criar({ titulo, conteudo, data: data || '', autor: autor || '' });
    res.redirect('/cartas');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao criar carta' });
  }
};

// POST - Editar carta
exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, data, autor } = req.body;
    await cartasService.atualizar(id, { titulo, conteudo, data: data || '', autor: autor || '' });
    res.redirect('/cartas');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao atualizar carta' });
  }
};

// POST - Deletar carta
exports.deletar = async (req, res) => {
  try {
    await cartasService.deletar(req.params.id);
    res.redirect('/cartas');
  } catch (error) {
    console.log(error);
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao deletar carta' });
  }
};

// GET - Visualizar carta (mantido para compatibilidade)
exports.visualizar = async (req, res) => {
  try {
    const carta = await cartasService.obterPorId(req.params.id);
    if (!carta) return res.status(404).render('404', { title: '404' });
    const config = carregarConfig();
    res.render('cartas/visualizar', { title: carta.titulo, carta, config });
  } catch (error) {
    res.status(500).render('erro', { title: 'Erro', mensagem: 'Erro ao buscar carta' });
  }
};

// Mantidos para compatibilidade de rotas existentes
exports.formularioNova    = (req, res) => res.redirect('/cartas');
exports.formularioEditar  = (req, res) => res.redirect('/cartas');
