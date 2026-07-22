# 💕 Nosso Lugar (lembrancas-livia-pedro)

Um presente digital especial para você! Um sistema web interativo e responsivo onde você pode compartilhar mensagens, fotos e momentos especiais com sua namorada.

## 🚀 Características

- ✅ **Página inicial** com contador de tempo junto (atualiza em tempo real)
- ✅ **Sistema CRUD completo** de cartas (criar, ler, editar, deletar)
- ✅ **Design responsivo** - funciona perfeitamente em desktop, tablet e celular
- ✅ **Interface bonita** com gradientes e animações
- ✅ **Banco de dados MySQL** para persistência
- ✅ **Estrutura em camadas** (rotas, controllers, services)

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- Um editor de código (VS Code, Sublime, etc)

## ⚙️ Instalação

### 1. Clone ou copie os arquivos do projeto

```bash
# Navegação até a pasta do projeto
cd livia
```

### 2. Instale as dependências

```bash
npm install
```

### 3. O projeto usa armazenamento local em JSON

- Você não precisa instalar MySQL.
- O arquivo de dados está em `data/cartas.json`.
- Se quiser reiniciar os dados, apague o conteúdo e deixe `[]`.

### 4. Inicie

```bash
npm start
```

### 4. Configure as variáveis de ambiente

Edite o arquivo `.env` com suas credenciais do MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=nosso_lugar
SESSION_SECRET=seu-super-secret-key-aqui
```

### 5. Inicie o servidor

```bash
npm start
```

Ou em modo desenvolvimento com auto-reload:

```bash
npm run dev
```

## 🌐 Acessar a aplicação

Abra seu navegador e acesse:

```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
livia/
├── config/
│   └── db.js                 # Configuração do MySQL
├── controllers/
│   ├── principalController.js # Lógica da página inicial
│   └── cartasController.js    # Lógica de cartas (CRUD)
├── routes/
│   ├── principal.js          # Rotas da página inicial
│   └── cartas.js             # Rotas de cartas
├── services/
│   ├── principalService.js   # Serviços da página principal
│   └── cartasService.js      # Serviços de cartas (banco de dados)
├── views/
│   ├── index.ejs             # Página inicial
│   ├── 404.ejs               # Página de erro 404
│   ├── erro.ejs              # Página de erro genérico
│   └── cartas/
│       ├── lista.ejs         # Lista de cartas
│       ├── formulario.ejs    # Formulário criar/editar
│       └── visualizar.ejs    # Visualizar uma carta
├── public/
│   ├── css/
│   │   └── style.css         # CSS customizado
│   └── js/
│       └── main.js           # JavaScript da aplicação
├── server.js                 # Arquivo principal
├── package.json              # Dependências
├── .env                      # Variáveis de ambiente
└── banco_dados.sql           # Script SQL
```

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **EJS** - Template engine
- **MySQL2** - Driver MySQL
- **Bootstrap 5** - Framework CSS responsivo
- **Font Awesome** - Ícones

## 📝 Conceitos Aprendidos

Este projeto utiliza todos os conceitos aprendidos no curso:

1. ✅ **Funcionamento da Web** (request/response)
2. ✅ **Node.js** (npm, estrutura de projetos)
3. ✅ **Express** (servidor, rotas, middleware)
4. ✅ **Organização em camadas** (rotas, controllers, services)
5. ✅ **Template Engine** (EJS com renderização no servidor)
6. ✅ **Banco de dados** (MySQL com persistência)
7. ✅ **CRUD completo** (Create, Read, Update, Delete)

## 🎨 Personalizações

### Mudar a data de início do relacionamento

No arquivo `controllers/principalController.js`, procure por:

```javascript
const dataInicio = new Date('2022-07-15'); // MUDE PARA A DATA DE VOCÊS
```

E substitua por sua data (formato: YYYY-MM-DD)

### Mudar cores

No arquivo `server.js` ou nas views, procure pela seção de cores:

```css
:root {
    --cor-principal: #ff1493;
    --cor-secundaria: #ff69b4;
    --cor-light: #fff0f5;
}
```

### Mudar textos

Edite os arquivos `.ejs` nas pastas `views/` para alterar textos e mensagens.

## 🐛 Troubleshooting

### Erro: "Cannot find module 'express'"

**Solução**: Execute `npm install` novamente

### Erro: "PROTOCOL_CONNECTION_LOST"

**Solução**: Verifique se o MySQL está rodando e as credenciais estão corretas

### Página não está responsiva

**Solução**: Verifique se o Bootstrap está sendo carregado corretamente nos devtools

## 🚀 Próximas Melhorias

Ideias para evoluir o projeto:

- [ ] Autenticação de usuários
- [ ] Upload de fotos com galeria
- [ ] Quiz/Trivia sobre o casal
- [ ] Contador regressivo para próximas datas
- [ ] Envio de notificações por email
- [ ] Dark mode
- [ ] Compartilhamento social

## ❤️ Dúvidas e Suporte

Se tiver dúvidas sobre alguma parte do código, consulte:

- [Documentação Express](https://expressjs.com/pt-br/)
- [Documentação EJS](https://ejs.co/)
- [Documentação MySQL](https://dev.mysql.com/doc/)
- [Documentação Bootstrap](https://getbootstrap.com/docs/5.3/)

## 📄 Licença

Este projeto é de uso pessoal. Sinta-se livre para modificar e personalizar conforme desejar! 💕

---

**Feito com ❤️ para sua namorada**
