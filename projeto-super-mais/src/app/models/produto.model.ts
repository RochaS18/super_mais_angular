export interface Produto {
  id: number | string; // json-server gera id em texto ao incluir; os produtos originais têm id numérico
  nome: string;
  marca: string;
  peso: string;
  preco: number;
  precoAntigo?: number;
  desconto?: number; // em %, mostrado no selo "xx% OFF"
  imagem: string;
  secao?: string; // 'Alimentos' | 'Doces' | 'Ferramentas' | 'Higiene'
  descricao?: string; // preenchida no painel administrativo
  criadoEm?: string; // data em que foi adicionado pelo painel
  atualizadoEm?: string; // data da última alteração feita pelo painel
}
