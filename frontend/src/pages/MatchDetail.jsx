import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMatch,
  getPlayers,
  getParticipations,
  updateParticipations,
  getMetrics,
  getTeamMetrics,
  updateTeamMetrics,
  getPlayerMetrics,
  updatePlayerMetrics
} from '../api/client';

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('participations');
  const [loading, setLoading] = useState(false);

  // Participations state
  const [players, setPlayers] = useState([]);
  const [participations, setParticipations] = useState([]);

  // Metrics state
  const [teamMetricsDefs, setTeamMetricsDefs] = useState([]);
  const [playerMetricsDefs, setPlayerMetricsDefs] = useState([]);
  const [teamMetricsValues, setTeamMetricsValues] = useState({});
  const [playerMetricsValues, setPlayerMetricsValues] = useState({});

  useEffect(() => {
    loadMatch();
    loadMetrics();
  }, [id]);

  useEffect(() => {
    if (match) {
      loadPlayers();
      loadParticipations();
      loadTeamMetrics();
      loadPlayerMetrics();
    }
  }, [match]);

  const loadMatch = async () => {
    try {
      const res = await getMatch(id);
      setMatch(res.data);
    } catch (error) {
      console.error('Error loading match:', error);
      alert('Match non trouvé');
      navigate('/matches');
    }
  };

  const loadPlayers = async () => {
    if (!match) return;

    try {
      const res = await getPlayers(match.team_id);
      setPlayers(res.data);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadParticipations = async () => {
    try {
      const res = await getParticipations(id);
      setParticipations(res.data);
    } catch (error) {
      console.error('Error loading participations:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const [teamRes, playerRes] = await Promise.all([
        getMetrics({ scope: 'TEAM', is_derived: false }),
        getMetrics({ scope: 'PLAYER', is_derived: false })
      ]);

      setTeamMetricsDefs(teamRes.data);
      setPlayerMetricsDefs(playerRes.data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const loadTeamMetrics = async () => {
    try {
      const res = await getTeamMetrics(id);
      const valuesMap = {};
      res.data.forEach(v => {
        const key = `${v.metric_slug}_${v.side}`;
        valuesMap[key] = v.value;
      });
      setTeamMetricsValues(valuesMap);
    } catch (error) {
      console.error('Error loading team metrics:', error);
    }
  };

  const loadPlayerMetrics = async () => {
    try {
      const res = await getPlayerMetrics(id);
      const valuesMap = {};
      res.data.forEach(v => {
        const key = `${v.player_id}_${v.metric_slug}`;
        valuesMap[key] = v.value;
      });
      setPlayerMetricsValues(valuesMap);
    } catch (error) {
      console.error('Error loading player metrics:', error);
    }
  };

  const handleParticipationChange = (playerId, field, value) => {
    const existing = participations.find(p => p.player_id === playerId);

    if (existing) {
      setParticipations(participations.map(p =>
        p.player_id === playerId ? { ...p, [field]: value } : p
      ));
    } else {
      setParticipations([...participations, {
        player_id: playerId,
        is_starter: field === 'is_starter' ? value : false,
        is_captain: field === 'is_captain' ? value : false,
        minutes_played: field === 'minutes_played' ? value : null,
        position_played: field === 'position_played' ? value : null
      }]);
    }
  };

  const saveParticipations = async () => {
    setLoading(true);
    try {
      await updateParticipations(id, { participations });
      alert('Participations sauvegardées');
      loadParticipations();
    } catch (error) {
      console.error('Error saving participations:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamMetricChange = (slug, side, value) => {
    const key = `${slug}_${side}`;
    setTeamMetricsValues({ ...teamMetricsValues, [key]: value });
  };

  const saveTeamMetrics = async () => {
    setLoading(true);
    try {
      const values = Object.entries(teamMetricsValues)
        .filter(([key, value]) => value !== '' && value !== null)
        .map(([key, value]) => {
          const [slug, side] = key.split('_');
          // Re-construct the side (handle multi-word slugs)
          const parts = key.split('_');
          const sideValue = parts[parts.length - 1];
          const slugValue = parts.slice(0, -1).join('_');

          return {
            metric_slug: slugValue,
            side: sideValue,
            value: Number(value)
          };
        });

      await updateTeamMetrics(id, { values });
      alert('Statistiques équipe sauvegardées');
      loadTeamMetrics();
    } catch (error) {
      console.error('Error saving team metrics:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerMetricChange = (playerId, slug, value) => {
    const key = `${playerId}_${slug}`;
    setPlayerMetricsValues({ ...playerMetricsValues, [key]: value });
  };

  const savePlayerMetrics = async () => {
    setLoading(true);
    try {
      const values = Object.entries(playerMetricsValues)
        .filter(([key, value]) => value !== '' && value !== null)
        .map(([key, value]) => {
          const parts = key.split('_');
          const playerId = Number(parts[0]);
          const slug = parts.slice(1).join('_');

          return {
            player_id: playerId,
            metric_slug: slug,
            value: Number(value)
          };
        });

      await updatePlayerMetrics(id, { values });
      alert('Statistiques joueurs sauvegardées');
      loadPlayerMetrics();
    } catch (error) {
      console.error('Error saving player metrics:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  if (!match) {
    return <div className="loading">Chargement...</div>;
  }

  const getParticipation = (playerId) => {
    return participations.find(p => p.player_id === playerId) || {
      player_id: playerId,
      is_starter: false,
      is_captain: false,
      minutes_played: null,
      position_played: null
    };
  };

  return (
    <div>
      <button className="btn btn-secondary" onClick={() => navigate('/matches')} style={{ marginBottom: '1rem' }}>
        ← Retour
      </button>

      {/* Match header */}
      <div className="card">
        <h1>{match.opponent_name}</h1>
        <p>
          {match.date} • {match.match_type}
          {match.score_for !== null && match.score_against !== null && (
            <> • Score: {match.score_for} - {match.score_against}</>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'participations' ? 'active' : ''}`}
          onClick={() => setActiveTab('participations')}
        >
          Participations
        </button>
        <button
          className={`tab ${activeTab === 'team-stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('team-stats')}
        >
          Stats équipe
        </button>
        <button
          className={`tab ${activeTab === 'player-stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('player-stats')}
        >
          Stats joueurs
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'participations' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Participations</h2>
            <button
              className="btn btn-primary"
              onClick={saveParticipations}
              disabled={loading}
            >
              Sauvegarder
            </button>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Joueur</th>
                <th>Titulaire</th>
                <th>Capitaine</th>
                <th>Minutes</th>
                <th>Position</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => {
                const part = getParticipation(player.id);
                return (
                  <tr key={player.id}>
                    <td>{player.first_name} {player.last_name}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={part.is_starter}
                        onChange={(e) => handleParticipationChange(player.id, 'is_starter', e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={part.is_captain}
                        onChange={(e) => handleParticipationChange(player.id, 'is_captain', e.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        max="120"
                        value={part.minutes_played || ''}
                        onChange={(e) => handleParticipationChange(player.id, 'minutes_played', e.target.value ? Number(e.target.value) : null)}
                        style={{ width: '80px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={part.position_played || ''}
                        onChange={(e) => handleParticipationChange(player.id, 'position_played', e.target.value)}
                        style={{ width: '150px' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'team-stats' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Statistiques équipe</h2>
            <button
              className="btn btn-primary"
              onClick={saveTeamMetrics}
              disabled={loading}
            >
              Sauvegarder
            </button>
          </div>

          <div className="grid grid-2">
            {teamMetricsDefs.map(metric => (
              <div key={metric.slug} className="form-group">
                <label className="form-label">
                  {metric.label_fr} {metric.unit && `(${metric.unit})`}
                </label>
                <input
                  type="number"
                  className="form-control"
                  step={metric.datatype === 'FLOAT' || metric.datatype === 'PERCENT' ? '0.01' : '1'}
                  min="0"
                  max={metric.datatype === 'PERCENT' ? '100' : undefined}
                  value={teamMetricsValues[`${metric.slug}_${metric.side}`] || ''}
                  onChange={(e) => handleTeamMetricChange(metric.slug, metric.side, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'player-stats' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Statistiques joueurs</h2>
            <button
              className="btn btn-primary"
              onClick={savePlayerMetrics}
              disabled={loading}
            >
              Sauvegarder
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, background: 'white', zIndex: 1 }}>
                    Joueur
                  </th>
                  {playerMetricsDefs.map(metric => (
                    <th key={metric.slug}>
                      {metric.label_fr}
                      {metric.unit && ` (${metric.unit})`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {players.map(player => (
                  <tr key={player.id}>
                    <td style={{ position: 'sticky', left: 0, background: 'white' }}>
                      {player.first_name} {player.last_name}
                    </td>
                    {playerMetricsDefs.map(metric => (
                      <td key={metric.slug}>
                        <input
                          type="number"
                          className="form-control"
                          step={metric.datatype === 'FLOAT' || metric.datatype === 'PERCENT' ? '0.01' : '1'}
                          min="0"
                          value={playerMetricsValues[`${player.id}_${metric.slug}`] || ''}
                          onChange={(e) => handlePlayerMetricChange(player.id, metric.slug, e.target.value)}
                          style={{ width: '100px' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MatchDetail;
