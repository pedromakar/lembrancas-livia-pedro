# 🚀 COMECE AQUI

Guia passo a passo para colocar seu presente digital para sua namorada funcionando!

## Passo 1: Instalar dependências

Abra o terminal na pasta do projeto e execute:

```
npm install
```

Vai demorar um pouco... relaxa! 😊

## Passo 2: Configurar o armazenamento de cartas

O projeto agora usa arquivo JSON local para guardar as cartas. Você não precisa instalar banco de dados.

- O arquivo de dados é `data/cartas.json`.
- Se quiser começar do zero, deixe o conteúdo assim:

```json
[]
```

## Passo 3: Configurar arquivo .env

O arquivo `.env` já existe. Se precisar alterar, abra com seu editor de código:

```
PORT=3000
DB_HOST=localhost
DB_USER=root              ← Seu usuário MySQL
DB_PASSWORD=              ← Sua senha MySQL (deixe vazio se não tem)
DB_NAME=nosso_lugar
SESSION_SECRET=seu-super-secret-key-aqui
```

**IMPORTANTE**: Se você colocou uma senha no MySQL, Digite ela em `DB_PASSWORD`

## Passo 4: ⚙️ MUDE A DATA DO RELACIONAMENTO

Este é um passo **MUITO IMPORTANTE**!

Abra o arquivo: `controllers/principalController.js`

Procure por esta linha (linha 11):

```javascript
const dataInicio = new Date('2022-07-15');
```

**MUDE PARA SUA DATA!** Use este formato: `YYYY-MM-DD`

Exemplos:
- Se começou em 15 de julho de 2022: `'2022-07-15'`
- Se começou em 3 de dezembro de 2023: `'2023-12-03'`
- Se começou em 1º de janeiro de 2024: `'2024-01-01'`

## Passo 5: Iniciar o servidor

No terminal, execute um desses comandos:

```
npm start
```

Ou (se quer que atualize automaticamente quando você editar arquivos):

```
npm run dev
```

## Passo 6: Acessar a página

Abra seu navegador e vá em:

```
http://localhost:3000
```

Pronto! 🎉 Sua página está rodando!

## ❓ Erros Comuns

### Erro: "PROTOCOL_CONNECTION_LOST"

O MySQL não está rodando. Tente reiniciar:

**Windows:**
```
net start mysql80
```

**Mac/Linux:**
```
sudo service mysql restart
```

### Erro: "Cannot find module 'express'"

Rode novamente:
```
npm install
```

### As cartas não aparecem

Verifique se você rodou o SQL. Tente novamente:
```
mysql -u root -p < banco_dados.sql
```

## 🎨 Próximas Personalização

Depois que estiver tudo rodando, você pode customizar:

1. **Mudar cores** → Busca por `--cor-principal` nos arquivos
2. **Mudar textos** → Edita os arquivos em `views/`
3. **Mudar nome da página** → Edita `Nosso Lugar` nos arquivos

## 💡 Dicas

- Use o **Ctrl+C** no terminal pra parar o servidor
- Se fizer mudanças no código, a página recarrega automaticamente (se tiver usado `npm run dev`)
- Sempre deixe o terminal aberto enquanto está desenvolvendo

## 🎯 Teste as Funcionalidades

1. ✅ Contador tá atualizando a cada segundo?
2. ✅ Consegue clicar em "Nova Carta"?
3. ✅ Consegue criar uma carta?
4. ✅ A carta aparece na lista?
5. ✅ Consegue editar a carta?
6. ✅ Consegue deletar a carta?

Se tudo funciona: **PARABÉNS!** 🎊

Agora é só personalizar e mostrar para ela! 💕

---

**Precisa de ajuda?** Leia o `README.md` para mais detalhes
