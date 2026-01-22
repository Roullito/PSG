#!/usr/bin/env bash
set -euo pipefail

API="${API:-http://localhost:8000}"
RUN_DIR="${RUN_DIR:-/tmp/veo_e2e}"
mkdir -p "$RUN_DIR"

need() { command -v "$1" >/dev/null || { echo "Missing dependency: $1"; exit 1; }; }
need curl
need jq

ts="$(date +%s)"
SEASON_LABEL="2024-2025-e2e-$ts"
TEAM_NAME="Pilot Team e2e $ts"

echo "[1/8] Create season"
curl -sS -X POST "$API/seasons" -H "Content-Type: application/json" -d "{
  \"label\": \"$SEASON_LABEL\",
  \"start_date\": \"2024-08-01\",
  \"end_date\": \"2025-06-30\"
}" | tee "$RUN_DIR/season.json" >/dev/null
SEASON_ID="$(jq -r '.id' "$RUN_DIR/season.json")"
echo "SEASON_ID=$SEASON_ID"

echo "[2/8] Create team"
curl -sS -X POST "$API/teams" -H "Content-Type: application/json" -d "{ \"name\": \"$TEAM_NAME\" }" \
| tee "$RUN_DIR/team.json" >/dev/null
TEAM_ID="$(jq -r '.id' "$RUN_DIR/team.json")"
echo "TEAM_ID=$TEAM_ID"

echo "[3/8] Create player"
curl -sS -X POST "$API/players" -H "Content-Type: application/json" -d "{
  \"team_id\": $TEAM_ID,
  \"first_name\": \"Alex\",
  \"last_name\": \"Test\",
  \"main_position\": \"Attaquant\",
  \"secondary_positions\": \"Ailier\"
}" | tee "$RUN_DIR/player.json" >/dev/null
PLAYER_ID="$(jq -r '.id' "$RUN_DIR/player.json")"
echo "PLAYER_ID=$PLAYER_ID"

echo "[4/8] Create match (with VEO fields)"
curl -sS -X POST "$API/matches" -H "Content-Type: application/json" -d "{
  \"team_id\": $TEAM_ID,
  \"season_id\": $SEASON_ID,
  \"date\": \"2024-09-15\",
  \"opponent_name\": \"Test Opponent\",
  \"is_home\": true,
  \"match_type\": \"LEAGUE\",
  \"competition\": \"Pilot League\",
  \"score_for\": 3,
  \"score_against\": 1,
  \"veo_title\": \"VEO - Pilot Match\",
  \"veo_url\": \"https://veo.example/match/123\",
  \"veo_duration\": 5400,
  \"veo_camera\": \"Cam-01\"
}" | tee "$RUN_DIR/match.json" >/dev/null
MATCH_ID="$(jq -r '.id' "$RUN_DIR/match.json")"
echo "MATCH_ID=$MATCH_ID"

echo "[5/8] Set participations"
curl -sS -X PUT "$API/matches/$MATCH_ID/participations" -H "Content-Type: application/json" -d "{
  \"participations\": [
    {
      \"player_id\": $PLAYER_ID,
      \"is_starter\": true,
      \"is_captain\": true,
      \"minutes_played\": 90,
      \"position_played\": \"Attaquant\"
    }
  ]
}" | tee "$RUN_DIR/participations.json" >/dev/null

echo "[6/8] Set team metrics"
curl -sS -X PUT "$API/metrics/matches/$MATCH_ID/team-metrics" -H "Content-Type: application/json" -d '{
  "values": [
    { "metric_slug": "team_possession_pct", "side": "OWN", "value": 62.5 },
    { "metric_slug": "team_goals_scored",   "side": "OWN", "value": 3 },
    { "metric_slug": "team_goals_conceded", "side": "OPPONENT", "value": 1 },
    { "metric_slug": "team_shots",          "side": "OWN", "value": 15 },
    { "metric_slug": "team_shots_conceded", "side": "OPPONENT", "value": 8 }
  ]
}' | tee "$RUN_DIR/team_metrics_put.json" >/dev/null

echo "[7/8] Set player metrics"
curl -sS -X PUT "$API/metrics/matches/$MATCH_ID/player-metrics" -H "Content-Type: application/json" -d "{
  \"values\": [
    { \"player_id\": $PLAYER_ID, \"metric_slug\": \"player_goals\", \"value\": 2 },
    { \"player_id\": $PLAYER_ID, \"metric_slug\": \"player_shots\", \"value\": 5 },
    { \"player_id\": $PLAYER_ID, \"metric_slug\": \"player_goal_assists\", \"value\": 1 }
  ]
}" | tee "$RUN_DIR/player_metrics_put.json" >/dev/null

echo "[8/8] KPI analytics (includes derived conversion_rate)"
curl -sS "$API/analytics/team/kpis?team_id=$TEAM_ID&metrics=team_possession_pct,team_goals_scored,team_conversion_rate,team_shots&season_id=$SEASON_ID&compute_delta=false" \
| tee "$RUN_DIR/kpis.json" >/dev/null

echo "---- KPI output ----"
jq '.' "$RUN_DIR/kpis.json"

echo "OK: E2E VEO V1 completed. Artifacts in $RUN_DIR"
