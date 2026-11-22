/*
 * API do Super Mais - Node.js puro (sem bibliotecas externas).
 *
 * Este arquivo cuida das ROTAS (o que a API responde).
 * A leitura e a gravação dos arquivos de dados ficam em armazenamento.js.
 *
 * Para iniciar:  npm run api   (na raiz do projeto)
 */
const http = require('http');
const crypto = require('crypto');
const armazenamento = require('./armazenamento');

const { ler, gravar, proximoId, proximoIdProduto, agora } = armazenamento;

const PORTA = 3000;

// Quem fez login: token -> dados do usuário. Fica na memória (ao reiniciar a API, é preciso entrar de novo).
const sessoes = new Map();

// Permite que o Angular (localhost:4200) converse com esta API (localhost:3000)
const CABECALHOS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// ---------- Erros com código HTTP ----------
class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// ---------- Funções auxiliares da requisição / resposta ----------
function responder(res, status, dados) {
  res.writeHead(status, CABECALHOS);
  res.end(dados === undefined ? '' : JSON.stringify(dados));
}

function lerCorpo(req) {
  return new Promise((resolve, reject) => {
    let texto = '';
    req.on('data', parte => {
      texto += parte;
      if (texto.length > 1000000) {
        reject(new ErroHttp(413, 'Corpo da requisição muito grande.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!texto) {
        return resolve({});
      }
      try {
        const dados = JSON.parse(texto);
        if (typeof dados !== 'object' || dados === null || Array.isArray(dados)) {
          throw new Error();
        }
        resolve(dados);
      } catch {
        reject(new ErroHttp(400, 'JSON inválido.'));
      }
    });
    req.on('error', reject);
  });
}

function semSenha(usuario) {
  const { senha, ...resto } = usuario;
  return resto;
}

// Filtros pela URL, ex.: /produtos?secao=Doces  ou  /historico-produtos?tipo=excluido
function aplicarFiltros(lista, url) {
  let resultado = lista;
  for (const [campo, valor] of url.searchParams) {
    resultado = resultado.filter(item => String(item[campo]) === valor);
  }
  return resultado;
}

// ---------- Controle de acesso ----------
// Lê o cabeçalho "Authorization: Bearer <token>" e devolve quem está logado (ou null)
function sessaoDaRequisicao(req) {
  const [tipo, token] = (req.headers['authorization'] || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return null;
  }
  return sessoes.get(token) || null;
}

// 401 = não está logado | 403 = está logado, mas não é administrador
function exigirAdmin(req) {
  const sessao = sessaoDaRequisicao(req);
  if (!sessao) {
    throw new ErroHttp(401, 'É preciso fazer login.');
  }
  if (sessao.perfil !== 'admin') {
    throw new ErroHttp(403, 'Acesso permitido apenas ao administrador.');
  }
  return sessao;
}

// ---------- Validações e histórico de produtos ----------
const CAMPOS_PRODUTO = ['nome', 'marca', 'peso', 'preco', 'precoAntigo', 'desconto', 'imagem', 'secao', 'descricao'];

const ROTULOS = {
  nome: 'nome', marca: 'categoria', peso: 'peso', preco: 'preço', precoAntigo: 'preço antigo',
  desconto: 'desconto', imagem: 'imagem', secao: 'seção', descricao: 'descrição'
};

// Só aceita campos conhecidos (ignora qualquer outro que venha na requisição)
function filtrarCamposProduto(corpo) {
  const resultado = {};
  for (const campo of CAMPOS_PRODUTO) {
    if (corpo[campo] !== undefined) {
      resultado[campo] = corpo[campo];
    }
  }
  return resultado;
}

function validarProduto(produto) {
  if (typeof produto.nome !== 'string' || !produto.nome.trim()) {
    throw new ErroHttp(400, 'Informe o nome do produto.');
  }
  if (typeof produto.preco !== 'number' || !(produto.preco > 0)) {
    throw new ErroHttp(400, 'Informe um preço válido (maior que zero).');
  }
  produto.nome = produto.nome.trim();
}

function formatarPreco(preco) {
  return 'R$ ' + Number(preco).toFixed(2).replace('.', ',');
}

// Texto de um valor para o resumo do histórico (preços ficam como R$ 9,90)
function formatarValor(campo, valor) {
  if (valor === undefined || valor === null || valor === '') {
    return '(vazio)';
  }
  if (campo === 'preco' || campo === 'precoAntigo') {
    return formatarPreco(valor);
  }
  return String(valor);
}

// Compara o produto antes e depois e lista só o que mudou
function compararProdutos(antes, depois) {
  const alteracoes = [];
  for (const campo of CAMPOS_PRODUTO) {
    const valorAntes = antes[campo] ?? '';
    const valorDepois = depois[campo] ?? '';
    if (valorAntes !== valorDepois) {
      alteracoes.push({ campo, antes: antes[campo] ?? null, depois: depois[campo] ?? null });
    }
  }
  return alteracoes;
}

// Acrescenta uma linha no historico-produtos.json
function registrarHistorico(tipo, produto, sessao, extras) {
  const historico = ler('historicoProdutos');
  historico.push({
    id: proximoId(historico),
    tipo,
    produtoId: produto.id,
    produtoNome: produto.nome,
    dataHora: agora(),
    realizadoPor: sessao.email,
    ...extras
  });
  gravar('historicoProdutos', historico);
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Rotas: /produtos ----------
async function rotaProdutos(req, res, id, url) {
  const produtos = ler('produtos');

  // GET /produtos e GET /produtos/:id  -> públicos (a loja precisa deles)
  if (req.method === 'GET') {
    if (id === undefined) {
      return responder(res, 200, aplicarFiltros(produtos, url));
    }
    const produto = produtos.find(p => String(p.id) === id);
    if (!produto) {
      throw new ErroHttp(404, 'Produto não encontrado.');
    }
    return responder(res, 200, produto);
  }

  // POST, PUT e DELETE -> somente administrador
  if (req.method === 'POST' && id === undefined) {
    const sessao = exigirAdmin(req);
    const dados = filtrarCamposProduto(await lerCorpo(req));
    validarProduto(dados);

    const novo = { id: proximoIdProduto(), marca: '', peso: '', ...dados, criadoEm: agora() };
    produtos.push(novo);
    gravar('produtos', produtos);

    registrarHistorico('adicionado', novo, sessao, {
      resumo: `Produto adicionado na seção ${novo.secao || 'sem seção'} por ${formatarPreco(novo.preco)}`,
      dados: novo
    });
    return responder(res, 201, novo);
  }

  if (req.method === 'PUT' && id !== undefined) {
    const sessao = exigirAdmin(req);
    const posicao = produtos.findIndex(p => String(p.id) === id);
    if (posicao === -1) {
      throw new ErroHttp(404, 'Produto não encontrado.');
    }
    const antes = produtos[posicao];
    const dados = filtrarCamposProduto(await lerCorpo(req));
    const depois = { ...antes, ...dados, id: antes.id };
    validarProduto(depois);

    const alteracoes = compararProdutos(antes, depois);
    if (alteracoes.length === 0) {
      // Nada mudou: não grava nada e não polui o histórico
      return responder(res, 200, antes);
    }

    depois.atualizadoEm = agora();
    produtos[posicao] = depois;
    gravar('produtos', produtos);

    const partes = alteracoes.map(a => `${ROTULOS[a.campo]} (${formatarValor(a.campo, a.antes)} → ${formatarValor(a.campo, a.depois)})`);
    registrarHistorico('atualizado', depois, sessao, {
      resumo: 'Campos alterados: ' + partes.join('; '),
      alteracoes
    });
    return responder(res, 200, depois);
  }

  if (req.method === 'DELETE' && id !== undefined) {
    const sessao = exigirAdmin(req);
    const posicao = produtos.findIndex(p => String(p.id) === id);
    if (posicao === -1) {
      throw new ErroHttp(404, 'Produto não encontrado.');
    }
    const [removido] = produtos.splice(posicao, 1);
    gravar('produtos', produtos);

    // O produto sai do catálogo, mas uma cópia completa dele fica guardada no histórico
    registrarHistorico('excluido', removido, sessao, {
      resumo: `Produto excluído da seção ${removido.secao || 'sem seção'} (${formatarPreco(removido.preco)})`,
      dados: removido
    });
    return responder(res, 200, {});
  }

  throw new ErroHttp(405, 'Método não permitido.');
}

// ---------- Rotas: /usuarios ----------
async function rotaUsuarios(req, res, id) {
  const usuarios = ler('usuarios');

  // POST /usuarios -> cadastro (público). O perfil SEMPRE será "cliente".
  if (req.method === 'POST' && id === undefined) {
    const corpo = await lerCorpo(req);
    const nome = String(corpo.nome || '').trim();
    const email = String(corpo.email || '').trim().toLowerCase();
    const senha = String(corpo.senha || '');

    if (!nome) {
      throw new ErroHttp(400, 'Digite o nome.');
    }
    if (!EMAIL_VALIDO.test(email)) {
      throw new ErroHttp(400, 'Digite um e-mail válido.');
    }
    if (senha.length < 6) {
      throw new ErroHttp(400, 'A senha deve ter pelo menos 6 caracteres.');
    }
    if (usuarios.some(u => u.email === email)) {
      throw new ErroHttp(409, 'Já existe um usuário com este e-mail.');
    }

    const novo = {
      id: proximoId(usuarios),
      nome,
      email,
      senha,
      perfil: 'cliente',
      criadoEm: agora()
    };
    usuarios.push(novo);
    gravar('usuarios', usuarios);
    return responder(res, 201, semSenha(novo));
  }

  // GET /usuarios -> somente administrador (a senha nunca é enviada)
  if (req.method === 'GET' && id === undefined) {
    exigirAdmin(req);
    return responder(res, 200, usuarios.map(semSenha));
  }

  // DELETE /usuarios/:id -> somente administrador
  if (req.method === 'DELETE' && id !== undefined) {
    exigirAdmin(req);
    const posicao = usuarios.findIndex(u => String(u.id) === id);
    if (posicao === -1) {
      throw new ErroHttp(404, 'Usuário não encontrado.');
    }
    if (usuarios[posicao].perfil === 'admin') {
      throw new ErroHttp(403, 'O administrador não pode ser excluído.');
    }
    const [removido] = usuarios.splice(posicao, 1);
    gravar('usuarios', usuarios);

    // Se o usuário excluído estava logado, derruba a sessão dele
    for (const [token, sessao] of sessoes) {
      if (sessao.usuarioId === removido.id) {
        sessoes.delete(token);
      }
    }
    return responder(res, 200, {});
  }

  throw new ErroHttp(405, 'Método não permitido.');
}

// ---------- Rota: POST /login ----------
async function rotaLogin(req, res) {
  if (req.method !== 'POST') {
    throw new ErroHttp(405, 'Método não permitido.');
  }
  const corpo = await lerCorpo(req);
  const email = String(corpo.email || '').trim().toLowerCase();
  const senha = String(corpo.senha || '');

  const usuarioDoEmail = ler('usuarios').find(u => u.email === email);
  const usuario = usuarioDoEmail && usuarioDoEmail.senha === senha ? usuarioDoEmail : null;

  // Todo login (certo ou errado) fica registrado em historicos/historico-login.json. A senha NUNCA é gravada.
  let resultado = 'Login realizado com sucesso';
  if (!usuarioDoEmail) {
    resultado = 'E-mail não cadastrado';
  } else if (!usuario) {
    resultado = 'Senha incorreta';
  }

  const logins = ler('historicoLogin');
  logins.push({
    id: proximoId(logins),
    dataHora: agora(),
    usuarioId: usuarioDoEmail ? usuarioDoEmail.id : null,
    nome: usuarioDoEmail ? usuarioDoEmail.nome : null,
    email,
    perfil: usuarioDoEmail ? usuarioDoEmail.perfil : null,
    sucesso: !!usuario,
    resultado
  });
  gravar('historicoLogin', logins);

  if (!usuario) {
    throw new ErroHttp(401, 'E-mail ou senha inválidos.');
  }

  // Gera um "crachá" (token) aleatório que o Angular enviará nas próximas requisições
  const token = crypto.randomBytes(24).toString('hex');
  sessoes.set(token, { usuarioId: usuario.id, perfil: usuario.perfil, email: usuario.email, nome: usuario.nome });
  return responder(res, 200, { token, usuario: semSenha(usuario) });
}

// ---------- Rota: POST /logout ----------
function rotaLogout(req, res) {
  const [, token] = (req.headers['authorization'] || '').split(' ');
  if (token) {
    sessoes.delete(token);
  }
  return responder(res, 200, {});
}

// ---------- Rota: POST /historico-carrinho -> usuário logado ----------
// Chamada pelo site quando o cliente coloca um produto no carrinho.
// O nome do usuário vem do login (token) e o nome do produto vem do catálogo:
// o site só informa QUAL produto (produtoId) e QUANTAS unidades.
async function rotaHistoricoCarrinho(req, res) {
  if (req.method !== 'POST') {
    throw new ErroHttp(405, 'Método não permitido.');
  }
  const sessao = sessaoDaRequisicao(req);
  if (!sessao) {
    throw new ErroHttp(401, 'É preciso fazer login.');
  }

  const corpo = await lerCorpo(req);
  const quantidade = corpo.quantidade === undefined ? 1 : Number(corpo.quantidade);
  if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 99) {
    throw new ErroHttp(400, 'Quantidade inválida.');
  }

  const produto = ler('produtos').find(p => String(p.id) === String(corpo.produtoId));
  if (!produto) {
    throw new ErroHttp(404, 'Produto não encontrado.');
  }

  const historico = ler('historicoCarrinho');
  const registro = {
    id: proximoId(historico),
    dataHora: agora(),
    usuarioId: sessao.usuarioId,
    nome: sessao.nome,
    email: sessao.email,
    produtoId: produto.id,
    produtoNome: produto.nome,
    quantidade,
    precoUnitario: produto.preco,
    resumo: `${sessao.nome} adicionou ${quantidade}x ${produto.nome} ao carrinho`
  };
  historico.push(registro);
  gravar('historicoCarrinho', historico);
  return responder(res, 201, { id: registro.id });
}

// ---------- Servidor ----------
const servidor = http.createServer(async (req, res) => {
  // Pedido de "permissão" que o navegador faz antes de POST/PUT/DELETE com Authorization
  if (req.method === 'OPTIONS') {
    return responder(res, 204);
  }

  try {
    const url = new URL(req.url, 'http://localhost');
    const [recurso, id] = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);

    switch (recurso) {
      case undefined:           return responder(res, 200, { mensagem: 'API Super Mais no ar' });
      case 'produtos':          return await rotaProdutos(req, res, id, url);
      case 'historico-carrinho': return await rotaHistoricoCarrinho(req, res);
      case 'usuarios':          return await rotaUsuarios(req, res, id);
      case 'login':             return await rotaLogin(req, res);
      case 'logout':            return rotaLogout(req, res);
      default: throw new ErroHttp(404, 'Rota não encontrada.');
    }
  } catch (erro) {
    if (erro instanceof ErroHttp) {
      return responder(res, erro.status, { mensagem: erro.message });
    }
    console.error(erro);
    return responder(res, 500, { mensagem: 'Erro interno no servidor.' });
  }
});

servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`A porta ${PORTA} já está em uso. Feche o outro servidor e tente de novo.`);
  } else {
    console.error(erro);
  }
  process.exit(1);
});

armazenamento.iniciar();
servidor.listen(PORTA, () => {
  console.log(`API Super Mais rodando em http://localhost:${PORTA}`);
  console.log('Dados guardados na pasta backend/dados');
});
