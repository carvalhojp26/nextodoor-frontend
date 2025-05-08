import Cookies from 'js-cookie';

export async function createTaskRealization(data: {
  criacaoTarefaidTarefaCriada: number;
  estadoRealizacaoTarefaidEstadoRealizacaoTarefa: number;
}): Promise<void> {
  const token = Cookies.get('jwt');

  const response = await fetch('http://localhost:3000/api/taskRealizations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({
      criacaoTarefaidTarefaCriada: data.criacaoTarefaidTarefaCriada,
      estadoRealizacaoTarefaidEstadoRealizacaoTarefa: data.estadoRealizacaoTarefaidEstadoRealizacaoTarefa,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Error creating task realization.'; 
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) { //Backend envia { "error": "mensagem..." }
        errorMessage = errorData.error;
      } 
    } catch (error) {
      console.error("Unable to parse JSON error response:", error);
    }
    throw new Error(errorMessage);
  }
}