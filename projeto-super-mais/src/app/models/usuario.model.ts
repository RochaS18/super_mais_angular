export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'admin' | 'cliente';
  criadoEm?: string;
}

// Resposta do login: o "crachá" (token) + os dados do usuário
export interface Sessao {
  token: string;
  usuario: Usuario;
}
