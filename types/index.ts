//user de busca
export interface User {
  id: string;
  email: string;
  username?: string;
  cpf_cnpj?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  organizador: number;
  organizador_nome: string;
  data_inicio: string;
  data_fim: string;
  tipo: "PRESENCIAL" | "ONLINE" | "HIBRIDO";
  local_presencial?: string;
  vagas_totais: number;
  vagas_restantes: number;
  carga_horaria_horas: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inscricao {
  id: string;
  evento: number;
  evento_titulo: string;
  participante: number;
  participante_nome: string;
  presenca_confirmada: boolean;
  data_checkin?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificado {
  id: string;
  inscricao: string;
  codigo_validacao: string;
  participante_nome: string;
  evento_titulo: string;
  carga_horaria: number;
  data_emissao: string;
  url_pdf?: string;
}

//user de login
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}