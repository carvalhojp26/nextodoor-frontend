export interface Endereco {
  rua: string;
  numeroPorta: number;
  codigoPostal: string;
  freguesia: string;
  distrito: string;
}

export interface Utilizador {
  idUtilizador: number;
  nomeUtilizador: string;
  Endereco: Endereco;
}

export interface CategoriaTarefa {
  idCategoriaTarefa: number;
  categoriaTarefa: string;
  pontosCategoria: number;
}

export interface criacaoTarefa {
  idTarefaCriada: number;
  nomeTarefa: string;
  dataInicio: string;
  dataFim: string;
  descricaoTarefa: string;
  Utilizador: Utilizador;
  categoriaTarefa: CategoriaTarefa;
  estadoCriacaoTarefa: estadoCriacaoTarefa;
}

export interface estadoCriacaoTarefa {
  idEstadoCriacaoTarefa: number;
  estadoCriacaoTarefa: string;
}

