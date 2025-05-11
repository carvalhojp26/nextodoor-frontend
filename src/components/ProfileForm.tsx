import React, { useState } from 'react';

interface UserData {
  nomeUtilizador: string;
  dataNascimento: string;
  pontos: number;
  comprovativoResidencia: string;
  email: string;
  utilizador: string;
  password: string;
}

interface ProfileFormProps {
  userData: UserData;
  toggleModal: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userData, toggleModal }) => {
  const [formData, setFormData] = useState(userData);
  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePasswordChange = () => {
    if (oldPassword && newPassword) {
      console.log('Password alterada:', newPassword);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados atualizados:', formData);
    toggleModal();
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Alterar Perfil</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label>Nome Utilizador</label>
            <input
              type="text"
              name="nomeUtilizador"
              value={formData.nomeUtilizador}
              onChange={handleInputChange}
              className="border p-2 rounded-md w-full"
              disabled={!isEditing}
            />
          </div>

          <div className="mb-4">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-2 rounded-md w-full"
              disabled={!isEditing}
            />
          </div>

          <div className="mb-4">
            <label>Data Nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={formData.dataNascimento}
              onChange={handleInputChange}
              className="border p-2 rounded-md w-full"
              disabled={!isEditing}
            />
          </div>

          <div className="mb-4">
            <label>Pontos</label>
            <input
              type="number"
              name="pontos"
              value={formData.pontos}
              onChange={handleInputChange}
              className="border p-2 rounded-md w-full"
              disabled
            />
          </div>

          <div className="mb-4">
            <label>Comprovativo Residencia</label>
            <input
              type="text"
              name="comprovativoResidencia"
              value={formData.comprovativoResidencia}
              onChange={handleInputChange}
              className="border p-2 rounded-md w-full"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="mb-4">
              <label>Senha Antiga</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="border p-2 rounded-md w-full"
              />

              <label>Nova Senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border p-2 rounded-md w-full"
              />
            </div>
          )}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
            {isEditing ? (
              <button type="submit" className="bg-green-500 text-white py-2 px-4 rounded-md">
                Salvar
              </button>
            ) : (
              <button
                type="button"
                className="bg-red-500 text-white py-2 px-4 rounded-md"
                onClick={toggleModal}
              >
                Fechar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
