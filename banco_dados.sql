-- Script SQL para criar o banco de dados e tabelas
-- Execute isso no seu MySQL

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS nosso_lugar;
USE nosso_lugar;

-- Criar tabela de cartas
CREATE TABLE cartas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo LONGTEXT NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir algumas cartas de exemplo (opcional)
INSERT INTO cartas (titulo, conteudo) VALUES
('Primeira carta', 'Esta é uma carta de exemplo. Você pode editar ou deletar depois!'),
('Nosso dia especial', 'Lembro do dia em que nos conhecemos, foi tão especial...');
