import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Produto } from '../../models/produto.model';
import { Usuario } from '../../models/usuario.model';
import { ProdutosService } from '../../services/produtos.service';
import { UsuariosService } from '../../services/usuarios.service';
import { AutenticacaoService } from '../../services/autenticacao.service';

type Aba = 'produtos' | 'login';

@Component({
  selector: 'app-administracao-adm-shell',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './administracao-adm-shell.component.html',
  styleUrl: './administracao-adm-shell.component.css'
})
export class AdministracaoAdmShellComponent implements OnInit {

  private produtosService = inject(ProdutosService);
  private usuariosService = inject(UsuariosService);
  private auth = inject(AutenticacaoService);
  private router = inject(Router);

  private readonly IMAGEM_PADRAO =
    '/original/carrinho/carrinho-supermais/carrinho-supermais/assets/images/produto-placeholder.svg';

  // Administrador logado (aparece na identificação do painel)
  admin = this.auth.usuarioLogado;

  // false = quem abriu a página não é administrador (nada do painel é mostrado)
  autorizado = false;

  // Aba ativa do menu: só existem "Produtos" e "Login"
  aba = signal<Aba>('produtos');

  // Mensagem de confirmação ou de erro mostrada no topo do painel
  aviso = signal<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  // Listas vindas da API
  produtos = signal<Produto[]>([]);
  usuarios = signal<Usuario[]>([]);

  // Busca na lista de produtos (por nome, categoria, seção ou ID)
  busca = signal('');

  produtosFiltrados = computed(() => {
    const termo = this.busca().trim().toLocaleLowerCase('pt-BR');
    if (!termo) {
      return this.produtos();
    }
    return this.produtos().filter(p =>
      String(p.id).includes(termo) ||
      p.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
      p.marca.toLocaleLowerCase('pt-BR').includes(termo) ||
      (p.secao ?? '').toLocaleLowerCase('pt-BR').includes(termo)
    );
  });

  // ID do produto que está selecionado para edição (null = nenhum)
  produtoId = signal<number | string | null>(null);

  // O produto selecionado, procurado na lista pelo ID
  selecionado = computed(() => {
    const id = this.produtoId();
    return id === null ? undefined : this.produtos().find(p => p.id === id);
  });

  // Campo "Localizar por ID"
  idBusca = '';

  // Campos do formulário de produto (ligados com [(ngModel)])
  nome = '';
  categoria = '';
  secao = 'Ferramentas';
  preco = '';
  imagem = '';
  descricao = '';

  ngOnInit(): void {
    // Barreira no frontend. A proteção de verdade é feita pela API (401/403).
    if (!this.auth.ehAdmin()) {
      alert('Acesso restrito ao administrador. Faça login com a conta de administrador.');
      this.router.navigate(['/']);
      return;
    }
    this.autorizado = true;
    this.carregarProdutos();
    this.carregarUsuarios();
  }

  // ---------- Mensagens e erros ----------
  private avisar(tipo: 'ok' | 'erro', texto: string): void {
    this.aviso.set({ tipo, texto });
    setTimeout(() => this.aviso.set(null), 6000);
  }

  private tratarErro(erro: HttpErrorResponse, mensagemPadrao: string): void {
    if (erro.status === 401) {
      // Token inválido ou expirado (por exemplo, a API foi reiniciada)
      this.auth.encerrarSessaoLocal();
      alert('Sua sessão expirou. Faça login novamente.');
      this.router.navigate(['/']);
    } else if (erro.status === 403) {
      this.avisar('erro', 'Você não tem permissão para realizar esta ação.');
    } else if (erro.status === 0) {
      this.avisar('erro', 'Não foi possível conectar à API. Verifique se ela está rodando (npm run api).');
    } else {
      this.avisar('erro', erro.error?.mensagem ?? mensagemPadrao);
    }
  }

  // ---------- Menu ----------
  mudarAba(aba: Aba): void {
    this.aba.set(aba);
    if (aba === 'produtos') {
      this.carregarProdutos();
    } else {
      this.carregarUsuarios();
    }
  }

  sair(): void {
    this.auth.sair();
    this.router.navigate(['/']);
  }

  // ---------- Produtos: consulta ----------
  // GET /produtos
  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (lista) => this.produtos.set(lista),
      error: (erro) => this.tratarErro(erro, 'Não foi possível carregar os produtos.')
    });
  }

  atualizarBusca(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  // GET /produtos/:id - localiza um produto pelo ID e carrega os dados no formulário
  localizarPorId(): void {
    const id = this.idBusca.trim();
    if (!id) {
      this.avisar('erro', 'Digite o ID do produto que deseja localizar.');
      return;
    }
    this.produtosService.buscarPorId(id).subscribe({
      next: (produto) => {
        this.editar(produto);
        this.avisar('ok', `Produto de ID ${produto.id} carregado no formulário.`);
      },
      error: (erro: HttpErrorResponse) => {
        if (erro.status === 404) {
          this.avisar('erro', `Nenhum produto encontrado com o ID ${id}.`);
        } else {
          this.tratarErro(erro, 'Não foi possível localizar o produto.');
        }
      }
    });
  }

  // ---------- Produtos: formulário ----------
  // Seleciona o produto: guarda o ID e preenche o formulário com os dados atuais
  editar(produto: Produto): void {
    this.produtoId.set(produto.id);
    this.idBusca = String(produto.id);
    this.nome = produto.nome;
    this.categoria = produto.marca;
    this.secao = produto.secao ?? 'Ferramentas';
    this.preco = String(produto.preco).replace('.', ',');
    this.imagem = produto.imagem;
    this.descricao = produto.descricao ?? '';
  }

  // Limpa o formulário e volta ao modo "novo produto"
  limparFormulario(): void {
    this.produtoId.set(null);
    this.idBusca = '';
    this.nome = '';
    this.categoria = '';
    this.secao = 'Ferramentas';
    this.preco = '';
    this.imagem = '';
    this.descricao = '';
  }

  // Confere os campos e devolve os dados prontos para enviar (ou null se algo estiver errado)
  private lerFormulario() {
    const precoNumero = Number(this.preco.replace(',', '.'));

    if (!this.nome.trim() || !this.categoria.trim() || isNaN(precoNumero) || precoNumero <= 0) {
      this.avisar('erro', 'Preencha nome, categoria e um preço válido (ex.: 199,90).');
      return null;
    }
    return {
      nome: this.nome.trim(),
      marca: this.categoria.trim(),
      secao: this.secao,
      preco: precoNumero,
      imagem: this.imagem.trim(),
      descricao: this.descricao.trim()
    };
  }

  // ---------- Produtos: ações ----------
  // POST - botão "Adicionar produto"
  adicionarProduto(): void {
    const dados = this.lerFormulario();
    if (!dados) {
      return;
    }
    // Sem id: quem cria o id é a API
    const novo = { ...dados, peso: '', imagem: dados.imagem || this.IMAGEM_PADRAO } as Produto;

    this.produtosService.incluir(novo).subscribe({
      next: (produto) => {
        this.avisar('ok', `Produto "${produto.nome}" adicionado com o ID ${produto.id}.`);
        this.limparFormulario();
        this.carregarProdutos();
      },
      error: (erro) => this.tratarErro(erro, 'Erro ao adicionar o produto.')
    });
  }

  // PUT /produtos/:id - botão "Atualizar registro"
  atualizarRegistro(): void {
    const original = this.selecionado();
    if (!original) {
      this.avisar('erro', 'Selecione um produto na lista (ou localize pelo ID) antes de atualizar.');
      return;
    }
    const dados = this.lerFormulario();
    if (!dados) {
      return;
    }
    // Parte do produto original (mantém o id, peso, precoAntigo e desconto) e troca só o que o formulário traz
    const alterado: Produto = { ...original, ...dados, imagem: dados.imagem || original.imagem };

    this.produtosService.editar(alterado).subscribe({
      next: (produto) => {
        this.avisar('ok', `Registro do produto de ID ${produto.id} atualizado com sucesso.`);
        this.limparFormulario();
        this.carregarProdutos();
      },
      error: (erro) => this.tratarErro(erro, 'Erro ao atualizar o registro.')
    });
  }

  // DELETE /produtos/:id - botão "Excluir" do formulário (produto selecionado)
  excluirSelecionado(): void {
    const produto = this.selecionado();
    if (!produto) {
      this.avisar('erro', 'Selecione um produto na lista (ou localize pelo ID) antes de excluir.');
      return;
    }
    this.excluir(produto);
  }

  // DELETE /produtos/:id - botão "Excluir" de cada linha da lista
  excluir(produto: Produto): void {
    if (confirm(`Deseja realmente excluir o produto de ID ${produto.id} ("${produto.nome}")?\nEsta ação remove o produto da loja.`)) {
      this.produtosService.excluir(produto.id).subscribe({
        next: () => {
          this.produtos.set(this.produtos().filter(p => p.id !== produto.id));
          if (this.produtoId() === produto.id) {
            this.limparFormulario();
          }
          this.avisar('ok', `Produto de ID ${produto.id} ("${produto.nome}") excluído com sucesso.`);
        },
        error: (erro) => this.tratarErro(erro, 'Erro ao excluir o produto.')
      });
    }
  }

  // ---------- Aba Login: usuários ----------
  // GET /usuarios (a API só responde se o token for de administrador)
  carregarUsuarios(): void {
    this.usuariosService.listar().subscribe({
      next: (lista) => this.usuarios.set(lista),
      error: (erro) => this.tratarErro(erro, 'Não foi possível carregar os usuários.')
    });
  }

  // DELETE /usuarios/:id
  excluirUsuario(usuario: Usuario): void {
    if (confirm(`Deseja realmente excluir o usuário "${usuario.nome}"?`)) {
      this.usuariosService.excluir(usuario.id).subscribe({
        next: () => {
          // Atualiza a lista na tela sem recarregar a aplicação
          this.usuarios.set(this.usuarios().filter(u => u.id !== usuario.id));
          this.avisar('ok', `Usuário "${usuario.nome}" excluído com sucesso.`);
        },
        error: (erro) => this.tratarErro(erro, 'Erro ao excluir o usuário.')
      });
    }
  }
}
