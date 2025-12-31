import React, { useState, useEffect } from 'react';
import { getTeams, getSeasons, getTeamKPIs, getTeamTimeseries, getTeamRadar, getMetrics } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { format } from 'date-fns';

function Dashboard() {
  const [teams, setTeams] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [kpis, setKpis] = useState([]);
  const [timeseries, setTimeseries] = useState(null);
  const [radar, setRadar] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [selectedKpiMetrics, setSelectedKpiMetrics] = useState([
    'team_possession_pct',
    'team_goals_scored',
    'team_shots',
    'team_conversion_rate'
  ]);
  const [selectedTimeseriesMetric, setSelectedTimeseriesMetric] = useState('team_possession_pct');
  const [selectedRadarMetrics, setSelectedRadarMetrics] = useState([
    'team_possession_pct',
    'team_goals_scored',
    'team_shots',
    'team_passes_completed',
    'team_corners',
    'team_free_kicks'
  ]);
  const [radarPeriods, setRadarPeriods] = useState({
    fromA: '',
    toA: '',
    fromB: '',
    toB: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedTeam && selectedSeason) {
      loadDashboardData();
    }
  }, [selectedTeam, selectedSeason, dateFrom, dateTo]);

  const loadInitialData = async () => {
    try {
      const [teamsRes, seasonsRes, metricsRes] = await Promise.all([
        getTeams(),
        getSeasons(),
        getMetrics({ scope: 'TEAM', is_derived: false })
      ]);

      setTeams(teamsRes.data);
      setSeasons(seasonsRes.data);
      setMetrics(metricsRes.data);

      if (teamsRes.data.length > 0) {
        setSelectedTeam(teamsRes.data[0].id);
      }
      if (seasonsRes.data.length > 0) {
        setSelectedSeason(seasonsRes.data[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    try {
      // Load KPIs
      const kpiParams = {
        team_id: selectedTeam,
        metrics: selectedKpiMetrics.join(','),
        season_id: selectedSeason,
        compute_delta: true
      };
      if (dateFrom) kpiParams.from = dateFrom;
      if (dateTo) kpiParams.to = dateTo;

      const kpiRes = await getTeamKPIs(kpiParams);
      setKpis(kpiRes.data.kpis);

      // Load timeseries
      const tsRes = await getTeamTimeseries({
        team_id: selectedTeam,
        metric: selectedTimeseriesMetric,
        last_n: 10
      });
      setTimeseries(tsRes.data);

      // Load radar if periods are set
      if (radarPeriods.fromA && radarPeriods.toA && radarPeriods.fromB && radarPeriods.toB) {
        const radarRes = await getTeamRadar({
          team_id: selectedTeam,
          metrics: selectedRadarMetrics.join(','),
          ...radarPeriods
        });
        setRadar(radarRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRadarData = async () => {
    if (!selectedTeam || !radarPeriods.fromA || !radarPeriods.toA || !radarPeriods.fromB || !radarPeriods.toB) {
      return;
    }

    try {
      const radarRes = await getTeamRadar({
        team_id: selectedTeam,
        metrics: selectedRadarMetrics.join(','),
        ...radarPeriods
      });
      setRadar(radarRes.data);
    } catch (error) {
      console.error('Error loading radar data:', error);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Dashboard</h1>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">Équipe</label>
            <select
              className="form-control"
              value={selectedTeam || ''}
              onChange={(e) => setSelectedTeam(Number(e.target.value))}
            >
              <option value="">Sélectionner...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Saison</label>
            <select
              className="form-control"
              value={selectedSeason || ''}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
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
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date fin</label>
            <input
              type="date"
              className="form-control"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading && <div className="loading">Chargement...</div>}

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid grid-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="kpi-card">
              <div className="kpi-label">{kpi.metric_label}</div>
              <div className="kpi-value">
                {kpi.value} {kpi.unit}
              </div>
              {kpi.delta !== null && (
                <div className={`kpi-delta ${kpi.delta >= 0 ? 'positive' : 'negative'}`}>
                  {kpi.delta >= 0 ? '↑' : '↓'} {Math.abs(kpi.delta).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timeseries Chart */}
      {timeseries && timeseries.data.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">10 derniers matchs - {timeseries.metric_label}</h2>
            <select
              className="form-control"
              style={{ width: '250px' }}
              value={selectedTimeseriesMetric}
              onChange={(e) => {
                setSelectedTimeseriesMetric(e.target.value);
                loadDashboardData();
              }}
            >
              {metrics.map(m => (
                <option key={m.slug} value={m.slug}>{m.label_fr}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeseries.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="opponent_name"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0066ff" name={timeseries.metric_label} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Radar Chart */}
      <div className="card">
        <h2 className="card-title">Comparaison de périodes</h2>

        <div className="grid grid-4" style={{ marginBottom: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Période A - Début</label>
            <input
              type="date"
              className="form-control"
              value={radarPeriods.fromA}
              onChange={(e) => setRadarPeriods({...radarPeriods, fromA: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Période A - Fin</label>
            <input
              type="date"
              className="form-control"
              value={radarPeriods.toA}
              onChange={(e) => setRadarPeriods({...radarPeriods, toA: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Période B - Début</label>
            <input
              type="date"
              className="form-control"
              value={radarPeriods.fromB}
              onChange={(e) => setRadarPeriods({...radarPeriods, fromB: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Période B - Fin</label>
            <input
              type="date"
              className="form-control"
              value={radarPeriods.toB}
              onChange={(e) => setRadarPeriods({...radarPeriods, toB: e.target.value})}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={loadRadarData}>
          Comparer
        </button>

        {radar && radar.metrics.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radar.metrics.map(m => ({
              metric: m.metric_label.substring(0, 20),
              [radar.label_a]: m.value_a,
              [radar.label_b]: m.value_b
            }))}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              <Radar name={radar.label_a} dataKey={radar.label_a} stroke="#0066ff" fill="#0066ff" fillOpacity={0.6} />
              <Radar name={radar.label_b} dataKey={radar.label_b} stroke="#ff6600" fill="#ff6600" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
