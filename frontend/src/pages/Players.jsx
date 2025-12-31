import React, { useState, useEffect } from 'react';
import { getPlayers, getTeams, createPlayer, updatePlayer, deletePlayer } from '../api/client';

const POSITIONS = [
  'Gardien',
  'Défenseur central',
  'Latéral droit',
  'Latéral gauche',
  'Milieu défensif',
  'Milieu central',
  'Milieu offensif',
  'Ailier droit',
  'Ailier gauche',
  'Attaquant'
];

function Players() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    main_position: '',
    secondary_positions: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      loadPlayers();
    }
  }, [selectedTeam]);

  const loadTeams = async () => {
    try {
      const res = await getTeams();
      setTeams(res.data);
      if (res.data.length > 0) {
        setSelectedTeam(res.data[0].id);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadPlayers = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    try {
      const res = await getPlayers(selectedTeam);
      setPlayers(res.data);
    } catch (error) {
      console.error('Error loading players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPlayer) {
        await updatePlayer(editingPlayer.id, formData);
      } else {
        await createPlayer({ ...formData, team_id: selectedTeam });
      }

      setShowForm(false);
      setEditingPlayer(null);
      setFormData({
        first_name: '',
        last_name: '',
        main_position: '',
        secondary_positions: ''
      });
      loadPlayers();
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      first_name: player.first_name,
      last_name: player.last_name,
      main_position: player.main_position,
      secondary_positions: player.secondary_positions || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce joueur ?')) return;

    try {
      await deletePlayer(id);
      loadPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlayer(null);
    setFormData({
      first_name: '',
      last_name: '',
      main_position: '',
      secondary_positions: ''
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Joueurs</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nouveau joueur
        </button>
      </div>

      {/* Team selector */}
      <div className="card">
        <div className="form-group">
          <label className="form-label">Équipe</label>
          <select
            className="form-control"
            value={selectedTeam || ''}
            onChange={(e) => setSelectedTeam(Number(e.target.value))}
            style={{ maxWidth: '300px' }}
          >
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Player form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              {editingPlayer ? 'Modifier le joueur' : 'Nouveau joueur'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Position principale *</label>
                <select
                  className="form-control"
                  value={formData.main_position}
                  onChange={(e) => setFormData({...formData, main_position: e.target.value})}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {POSITIONS.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Positions secondaires</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Ailier droit, Attaquant"
                  value={formData.secondary_positions}
                  onChange={(e) => setFormData({...formData, secondary_positions: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                {editingPlayer ? 'Mettre à jour' : 'Créer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Players table */}
      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Position principale</th>
                <th>Positions secondaires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Aucun joueur trouvé
                  </td>
                </tr>
              ) : (
                players.map(player => (
                  <tr key={player.id}>
                    <td>{player.last_name}</td>
                    <td>{player.first_name}</td>
                    <td>{player.main_position}</td>
                    <td>{player.secondary_positions || '-'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(player)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(player.id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Players;
