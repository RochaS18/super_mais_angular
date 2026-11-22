# Backend do Super Mais

Iniciar a API (na raiz do projeto): `npm run api`  ->  http://localhost:3000

## Onde ficam os dados

Tudo é gravado na pasta `backend/dados/`. Cada tipo de informação tem o seu arquivo:

```
backend/dados/
  produtos.json                      catálogo ATUAL da loja (só o que existe hoje)
  usuarios.json                      usuários cadastrados (cliente e administrador)
  historicos/
    historico-produtos.json          produto ADICIONADO, ATUALIZADO ou EXCLUÍDO
    historico-login.json             cada tentativa de login, certa ou errada
    historico-carrinho.json          quem colocou qual produto no carrinho
```

Os históricos ficam SOMENTE aqui no backend: o site não os exibe. Para consultar, abra os arquivos
no VS Code. Os registros mais novos ficam no FIM de cada arquivo.

Arquivos de código: `server.js` (rotas da API) e `armazenamento.js` (leitura, gravação e migração dos arquivos).

## O que cada histórico guarda

**historico-produtos.json**: `tipo` (adicionado, atualizado ou excluido), `produtoId`, `produtoNome`,
`dataHora`, `realizadoPor` e `resumo` (uma frase explicando o que aconteceu).
- `atualizado`: a lista `alteracoes` mostra cada campo com o valor `antes` e `depois`.
- `adicionado` e `excluido`: `dados` guarda a cópia completa do produto (um produto excluído nunca se perde).

**historico-login.json**: `nome`, `email`, `perfil`, `dataHora`, `sucesso` (true/false) e `resultado`
("Login realizado com sucesso", "Senha incorreta" ou "E-mail não cadastrado"). A senha NUNCA é gravada.

**historico-carrinho.json**: `nome` e `email` do usuário, `usuarioId`, `produtoId`, `produtoNome`,
`quantidade`, `precoUnitario`, `dataHora` e `resumo`. Só é gravado quando o cliente está logado: o nome do
usuário vem do login e o nome do produto vem do catálogo (o site informa apenas o produto e a quantidade).
Cada clique em "adicionar" (e cada "+" na página do carrinho) gera um registro de 1 unidade.

Produtos criados ou alterados pelo painel ganham `criadoEm` / `atualizadoEm` em `produtos.json`.

## Migração automática (não perde dados)

Ao iniciar, a API cuida sozinha dos formatos antigos:
1. Se existir o antigo `backend/db.json` (tudo misturado) e ainda não houver a pasta `dados`, ela copia os produtos,
   usuários e logins para os arquivos novos e guarda o antigo como `db.antigo.json`. Acontece uma vez só.
2. Se houver históricos soltos em `dados/` (versão anterior: `historico-produtos.json` e `logins.json`), eles são
   MOVIDOS para `dados/historicos/` (o de logins passa a se chamar `historico-login.json`).
3. Se já existirem dados e também um `db.json`, o `db.json` não é usado: apenas arquivado como `db.antigo.json`.

**Para manter os dados de outra pasta do projeto:** copie a pasta `dados` inteira dela para dentro deste `backend`
ANTES de iniciar a API pela primeira vez.

## Rotas

| Rota | Quem acessa |
|---|---|
| `GET /produtos`, `GET /produtos/:id` (aceita `?secao=Doces`) | Qualquer pessoa |
| `POST/PUT/DELETE /produtos` | Somente administrador |
| `POST /usuarios` (cadastro) | Qualquer pessoa |
| `GET /usuarios`, `DELETE /usuarios/:id` | Somente administrador |
| `POST /login`, `POST /logout` | Qualquer pessoa |
| `POST /historico-carrinho` | Usuário logado |
