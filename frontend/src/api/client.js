import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Seasons
export const getSeasons = () => api.get('/seasons');
export const createSeason = (data) => api.post('/seasons', data);

// Teams
export const getTeams = () => api.get('/teams');
export const createTeam = (data) => api.post('/teams', data);

// Players
export const getPlayers = (teamId) => api.get('/players', { params: { team_id: teamId } });
export const createPlayer = (data) => api.post('/players', data);
export const updatePlayer = (id, data) => api.patch(`/players/${id}`, data);
export const deletePlayer = (id) => api.delete(`/players/${id}`);

// Matches
export const getMatches = (params) => api.get('/matches', { params });
export const createMatch = (data) => api.post('/matches', data);
export const getMatch = (id) => api.get(`/matches/${id}`);
export const updateMatch = (id, data) => api.patch(`/matches/${id}`, data);
export const deleteMatch = (id) => api.delete(`/matches/${id}`);

// Participations
export const getParticipations = (matchId) => api.get(`/matches/${matchId}/participations`);
export const updateParticipations = (matchId, data) => api.put(`/matches/${matchId}/participations`, data);
export const duplicateParticipations = (matchId, sourceMatchId) =>
  api.post(`/matches/${matchId}/duplicate-participations/${sourceMatchId}`);

// Metrics
export const getMetrics = (params) => api.get('/metrics', { params });
export const getTeamMetrics = (matchId) => api.get(`/metrics/matches/${matchId}/team-metrics`);
export const updateTeamMetrics = (matchId, data) => api.put(`/metrics/matches/${matchId}/team-metrics`, data);
export const getPlayerMetrics = (matchId) => api.get(`/metrics/matches/${matchId}/player-metrics`);
export const updatePlayerMetrics = (matchId, data) => api.put(`/metrics/matches/${matchId}/player-metrics`, data);

// Analytics
export const getTeamKPIs = (params) => api.get('/analytics/team/kpis', { params });
export const getTeamTimeseries = (params) => api.get('/analytics/team/timeseries', { params });
export const getTeamRadar = (params) => api.get('/analytics/team/radar', { params });
export const getPlayerLeaderboard = (params) => api.get('/analytics/players/leaderboard', { params });

export default api;
