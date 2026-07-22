const express = require('express');
const router = express.Router();
const cartasController = require('../controllers/cartasController');

// Listar todas as cartas
router.get('/', cartasController.listar);

// Formulário para criar nova carta
router.get('/nova', cartasController.formularioNova);

// Salvar nova carta
router.post('/criar', cartasController.criar);

// Ver uma carta específica
router.get('/:id', cartasController.visualizar);

// Formulário para editar
router.get('/:id/editar', cartasController.formularioEditar);

// Atualizar carta
router.post('/:id/atualizar', cartasController.atualizar);

// Deletar carta
router.post('/:id/deletar', cartasController.deletar);

module.exports = router;
