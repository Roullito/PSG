import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMatches, getTeams, getSeasons, createMatch } from '../api/client';
import { format } from 'date-fns';

const MATCH_TYPES = ['LEAGUE', 'CUP', 'FRIENDLY', 'TOURNAMENT'];

function Matches() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [filters, setFilters] = useState({
    team_id: null,
    season_id: null,
    from: '',
    to: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    team_id: '',
    season_id: '',
    date: '',
    opponent_name: '',
    is_home: true,
    match_type: 'LEAGUE',
    competition: '',
    score_for: '',
    score_against: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMatches();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [teamsRes, seasonsRes] = await Promise.all([
        getTeams(),
        getSeasons()
      ]);

      setTeams(teamsRes.data);
      setSeasons(seasonsRes.data);

      if (teamsRes.data.length > 0) {
        setFilters(prev => ({ ...prev, team_id: teamsRes.data[0].id }));
        setFormData(prev => ({
          ...prev,
          team_id: teamsRes.data[0].id,
          season_id: seasonsRes.data[0]?.id || ''
        }));
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadMatches = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.team_id) params.team_id = filters.team_id;
      if (filters.season_id) params.season_id = filters.season_id;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await getMatches(params);
      setMatches(res.data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        team_id: Number(formData.team_id),
        season_id: Number(formData.season_id),
        score_for: formData.score_for ? Number(formData.score_for) : null,
        score_against: formData.score_against ? Number(formData.score_against) : null
      };

      await createMatch(data);

      setShowForm(false);
      setFormData({
        team_id: filters.team_id || '',
        season_id: '',
        date: '',
        opponent_name: '',
        is_home: true,
        match_type: 'LEAGUE',
        competition: '',
        score_for: '',
        score_against: ''
      });
      loadMatches();
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Erreur lors de la création du match');
    }
  };

  const getMatchResult = (match) => {
    if (match.score_for === null || match.score_against === null) {
      return '-';
    }

    if (match.score_for > match.score_against) return 'V';
    if (match.score_for < match.score_against) return 'D';
    return 'N';
  };

  const getResultColor = (result) => {
    if (result === 'V') return '#4ade80';
    if (result === 'D') return '#f87171';
    return '#fbbf24';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Matchs</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Nouveau match
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">Équipe</label>
            <select
              className="form-control"
              value={filters.team_id || ''}
              onChange={(e) => setFilters({...filters, team_id: Number(e.target.value)})}
            >
              <option value="">Toutes</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Saison</label>
            <select
              className="form-control"
              value={filters.season_id || ''}
              onChange={(e) => setFilters({...filters, season_id: e.target.value ? Number(e.target.value) : null})}
            >
              <option value="">Toutes</option>
              {seasons.map(season => (
                <option key={season.id} value={season.id}>{season.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date début</label>
            <input
              type="date"
              className="form-control"
              value={filters.from}
              onChange={(e) => setFilters({...filters, from: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date fin</label>
            <input
              type="date"
              className="form-control"
              value={filters.to}
              onChange={(e) => setFilters({...filters, to: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Nouveau match</h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Équipe *</label>
                <select
                  className="form-control"
                  value={formData.team_id}
                  onChange={(e) => setFormData({...formData, team_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Saison *</label>
                <select
                  className="form-control"
                  value={formData.season_id}
                  onChange={(e) => setFormData({...formData, season_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {seasons.map(season => (
                    <option key={season.id} value={season.id}>{season.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adversaire *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.opponent_name}
                  onChange={(e) => setFormData({...formData, opponent_name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de match</label>
                <select
                  className="form-control"
                  value={formData.match_type}
                  onChange={(e) => setFormData({...formData, match_type: e.target.value})}
                >
                  {MATCH_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Compétition</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.competition}
                  onChange={(e) => setFormData({...formData, competition: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.is_home}
                    onChange={(e) => setFormData({...formData, is_home: e.target.checked})}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Match à domicile
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Score pour</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={formData.score_for}
                    onChange={(e) => setFormData({...formData, score_for: e.target.value})}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Score contre</label>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    value={formData.score_against}
                    onChange={(e) => setFormData({...formData, score_against: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Créer
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Matches table */}
      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Adversaire</th>
                <th>Type</th>
                <th>Score</th>
                <th>Résultat</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matches.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                    Aucun match trouvé
                  </td>
                </tr>
              ) : (
                matches.map(match => {
                  const result = getMatchResult(match);
                  return (
                    <tr key={match.id}>
                      <td>{match.date}</td>
                      <td>
                        {match.is_home ? '🏠' : '✈️'} {match.opponent_name}
                      </td>
                      <td>{match.match_type}</td>
                      <td>
                        {match.score_for !== null && match.score_against !== null
                          ? `${match.score_for} - ${match.score_against}`
                          : '-'}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-block',
                          width: '30px',
                          height: '30px',
                          lineHeight: '30px',
                          textAlign: 'center',
                          borderRadius: '50%',
                          backgroundColor: getResultColor(result),
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {result}
                        </span>
                      </td>
                      <td>
                        <Link to={`/matches/${match.id}`} className="btn btn-sm btn-primary">
                          Détails
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Matches;
