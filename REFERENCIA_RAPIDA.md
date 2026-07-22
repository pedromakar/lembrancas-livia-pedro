# 📚 Referência Rápida - Seus Primeiros Passos

## 1️⃣ INSTALAÇÃO

O projeto usa JSON local para armazenamento de cartas (sem banco de dados MySQL).

## 2️⃣ CONFIGURAÇÃO DE DADOS

O arquivo de dados de cartas está em `data/cartas.json`.
Se quiser apagar todos os dados, substitua o conteúdo por:

```json
[]
```

## 3️⃣ CONFIGURE O .env

Abra o arquivo `.env` e verifique:

```env
PORT=3000
SESSION_SECRET=seu-super-secret-key-aqui
```

## 4️⃣ MUDE A DATA! (IMPORTANTE!)

Abra: `controllers/principalController.js`

Na linha ~6, procure:
```javascript
const dataInicio = new Date('2022-07-15');
```

Mude para sua data! Ex: `'2024-03-23'`

## 5️⃣ INICIE!

```bash
npm start
```

Abra: http://localhost:3000

## 💻 Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `npm start` | Inicia o servidor |
| `npm run dev` | Inicia com auto-reload |
| `npm install` | Instala dependências |
| `Ctrl+C` | Para o servidor |

## 📁 Onde Editar

| Arquivo | Para mudar |
|---------|-----------|
| `views/index.ejs` | Página inicial |
| `views/cartas/lista.ejs` | Lista de cartas |
| `public/css/style.css` | Estilos |
| `.env` | Senha MySQL |
| `controllers/principalController.js` | Data de início |

## 🎨 Cores Principais

```css
--cor-principal: #ff1493;    /* Rosa forte */
--cor-secundaria: #ff69b4;   /* Rosa claro */
--cor-light: #fff0f5;        /* Fundo rosinha */
```

## ✨ Tá tudo em ordem!

Toda a estrutura está criada e funcionando.

**Próximo passo:** Siga o `COMECE_AQUI.md`

---

💕 Boa sorte com seu presente!
