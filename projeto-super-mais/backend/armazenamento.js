/*
 * Armazenamento da API: tudo o que lê ou grava arquivos fica AQUI.
 *
 * Cada tipo de informação tem o seu próprio arquivo, dentro da pasta backend/dados/:
 *
 *   dados/
 *     produtos.json                       -> catálogo ATUAL da loja
 *     usuarios.json                       -> usuários cadastrados
 *     historicos/
 *       historico-produtos.json           -> produto ADICIONADO, ATUALIZADO ou EXCLUÍDO
 *       historico-login.json              -> cada tentativa de login (certa ou errada)
 *       historico-carrinho.json           -> quem colocou qual produto no carrinho
 *
 * Os históricos ficam só aqui no backend: o site (frontend) não os exibe.
 *
 * Na primeira execução, se existir o antigo backend/db.json (tudo misturado),
 * os dados dele são COPIADOS para os arquivos novos e o db.json vira db.antigo.json (backup).
 */
const fs = require('fs');
const path = require('path');

const PASTA_DADOS = path.join(__dirname, 'dados');
const PASTA_HISTORICOS = path.join(PASTA_DADOS, 'historicos');
const DB_ANTIGO = path.join(__dirname, 'db.json');

const ARQUIVOS = {
  produtos: 'produtos.json',
  usuarios: 'usuarios.json',
  historicoProdutos: path.join('historicos', 'historico-produtos.json'),
  historicoLogin: path.join('historicos', 'historico-login.json'),
  historicoCarrinho: path.join('historicos', 'historico-carrinho.json')
};

// Administrador do sistema (criado em usuarios.json se ainda não existir)
const ADMIN_EMAIL = 'adim@gmail.com';
const ADMIN_SENHA = '12345';

// ---------- Data e hora no fuso do computador, ex.: 2026-11-22T07:15:00-03:00 ----------
function agora() {
  const d = new Date();
  const dois = (n) => String(n).padStart(2, '0');
  const deslocamento = -d.getTimezoneOffset(); // minutos em relação ao UTC
  const sinal = deslocamento >= 0 ? '+' : '-';
  const horas = dois(Math.floor(Math.abs(deslocamento) / 60));
  const minutos = dois(Math.abs(deslocamento) % 60);
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}` +
         `T${dois(d.getHours())}:${dois(d.getMinutes())}:${dois(d.getSeconds())}${sinal}${horas}:${minutos}`;
}

// ---------- Leitura e gravação ----------
function caminho(nome) {
  return path.join(PASTA_DADOS, ARQUIVOS[nome]);
}

function ler(nome) {
  return JSON.parse(fs.readFileSync(caminho(nome), 'utf-8'));
}

// Grava em um arquivo temporário e depois troca pelo definitivo,
// assim o arquivo nunca fica "pela metade" se algo falhar no meio.
function gravar(nome, lista) {
  const destino = caminho(nome);
  const temporario = destino + '.tmp';
  const texto = JSON.stringify(lista, null, 2) + '\n';
  try {
    fs.writeFileSync(temporario, texto, 'utf-8');
    fs.renameSync(temporario, destino);
  } catch {
    // Alguns antivírus do Windows bloqueiam a troca; nesse caso grava direto
    fs.writeFileSync(destino, texto, 'utf-8');
  }
}

// Próximo id = maior id numérico da lista + 1
function proximoId(lista) {
  const ids = lista.map(item => Number(item.id)).filter(n => !isNaN(n));
  return ids.length ? Math.max(...ids) + 1 : 1;
}

// Id novo para produto: nunca reaproveita o id de um produto já excluído,
// para que o histórico não confunda dois produtos diferentes.
function proximoIdProduto() {
  const idsAtuais = ler('produtos').map(p => Number(p.id));
  const idsDoHistorico = ler('historicoProdutos').map(h => Number(h.produtoId));
  const todos = [...idsAtuais, ...idsDoHistorico].filter(n => !isNaN(n));
  return todos.length ? Math.max(...todos) + 1 : 1;
}

// Guarda o db.json antigo como backup (sem sobrescrever backups anteriores)
function arquivarDbAntigo() {
  let backup = path.join(__dirname, 'db.antigo.json');
  if (fs.existsSync(backup)) {
    backup = path.join(__dirname, `db.antigo-${Date.now()}.json`);
  }
  fs.renameSync(DB_ANTIGO, backup);
  console.log(`O arquivo db.json foi guardado como ${path.basename(backup)}.`);
}

// ---------- Migração 1: db.json antigo (tudo misturado) -> arquivos separados ----------
function migrarDoDbAntigo() {
  let antigo;
  try {
    antigo = JSON.parse(fs.readFileSync(DB_ANTIGO, 'utf-8'));
  } catch {
    console.error('Não foi possível ler o backend/db.json antigo (JSON inválido). Nada foi alterado.');
    process.exit(1);
  }

  const produtos = antigo.produtos || [];
  const usuarios = antigo.usuarios || [];

  // Logins antigos ganham nome e resultado, mantendo todos os dados que já tinham
  const logins = (antigo.logins || []).map(l => {
    const usuario = usuarios.find(u => u.id === l.usuarioId);
    return {
      id: l.id,
      dataHora: l.dataHora,
      usuarioId: l.usuarioId ?? null,
      nome: usuario ? usuario.nome : null,
      email: l.email,
      perfil: l.perfil ?? null,
      sucesso: !!l.sucesso,
      resultado: l.sucesso ? 'Login realizado com sucesso' : 'E-mail ou senha inválidos'
    };
  });

  gravar('produtos', produtos);
  gravar('usuarios', usuarios);
  gravar('historicoLogin', logins);
  gravar('historicoProdutos', []);

  console.log(`Migração concluída: ${produtos.length} produtos, ${usuarios.length} usuários, ${logins.length} logins.`);
  arquivarDbAntigo();
}

// ---------- Migração 2: versão anterior (históricos soltos em dados/) -> dados/historicos/ ----------
function moverSeExistir(arquivoAntigo, nomeNovo) {
  const origem = path.join(PASTA_DADOS, arquivoAntigo);
  if (fs.existsSync(origem) && !fs.existsSync(caminho(nomeNovo))) {
    try {
      fs.renameSync(origem, caminho(nomeNovo));
    } catch {
      fs.copyFileSync(origem, caminho(nomeNovo));
      fs.unlinkSync(origem);
    }
    console.log(`Arquivo ${arquivoAntigo} movido para dados/historicos/${path.basename(caminho(nomeNovo))}`);
  }
}

// ---------- Inicialização ----------
function iniciar() {
  fs.mkdirSync(PASTA_HISTORICOS, { recursive: true });

  // Traz os históricos da versão anterior (se existirem) para a pasta nova, sem perder nada
  moverSeExistir('historico-produtos.json', 'historicoProdutos');
  moverSeExistir('logins.json', 'historicoLogin');

  const jaExistemArquivosNovos = Object.keys(ARQUIVOS).some(nome => fs.existsSync(caminho(nome)));

  // O db.json só é usado UMA vez, para a migração. Se já existem dados novos, ele é apenas arquivado.
  if (fs.existsSync(DB_ANTIGO)) {
    if (!jaExistemArquivosNovos) {
      migrarDoDbAntigo();
    } else {
      console.log('Já existem dados em backend/dados; o db.json não foi usado.');
      arquivarDbAntigo();
    }
  }

  // Garante que os arquivos existam (vazios, se for a primeira vez)
  for (const nome of Object.keys(ARQUIVOS)) {
    if (!fs.existsSync(caminho(nome))) {
      gravar(nome, []);
    }
  }

  // Garante o administrador
  const usuarios = ler('usuarios');
  if (!usuarios.some(u => u.email === ADMIN_EMAIL)) {
    usuarios.push({
      id: proximoId(usuarios),
      nome: 'Administrador',
      email: ADMIN_EMAIL,
      senha: ADMIN_SENHA,
      perfil: 'admin',
      criadoEm: agora()
    });
    gravar('usuarios', usuarios);
  }
}

module.exports = { iniciar, ler, gravar, proximoId, proximoIdProduto, agora };
