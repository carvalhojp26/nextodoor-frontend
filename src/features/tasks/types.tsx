export interface Endereco {
  rua: string;
  numeroPorta: number;
  codigoPostal: string;
  freguesia: string;
  distrito: string;
}

export interface Utilizador {
  nomeUtilizador: string;
  Endereco: Endereco;
}

export interface CategoriaTarefa {
  categoriaTarefa: string;
  pontosCategoria: number;
}

export interface Tarefa {
  nomeTarefa: string;
  dataInicio: string;
  dataFim: string;
  descricaoTarefa: string;
  Utilizador: Utilizador;
  categoriaTarefa: CategoriaTarefa;
}