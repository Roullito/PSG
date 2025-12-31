import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import date
from app.db.session import Base
from app.models import (
    Team, Season, Player, Match, MatchPlayerParticipation,
    MetricDefinition, PlayerMatchMetricValue, TeamMatchMetricValue,
    MatchType, MetricScope, MetricCategory, MetricDataType, MetricSide
)
from app.services.analytics import AnalyticsService

# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    """Create a test database session"""
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    yield session

    session.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def sample_data(db_session):
    """Create sample data for testing"""
    # Create team
    team = Team(name="Test Team")
    db_session.add(team)

    # Create season
    season = Season(label="2024", start_date=date(2024, 1, 1), end_date=date(2024, 12, 31))
    db_session.add(season)

    # Create players
    player1 = Player(team_id=1, first_name="John", last_name="Doe", main_position="Attaquant")
    player2 = Player(team_id=1, first_name="Jane", last_name="Smith", main_position="Milieu")
    db_session.add_all([player1, player2])

    # Create match
    match = Match(
        team_id=1,
        season_id=1,
        date=date(2024, 6, 15),
        opponent_name="Rival FC",
        is_home=True,
        match_type=MatchType.LEAGUE,
        score_for=3,
        score_against=1
    )
    db_session.add(match)

    # Create metrics
    metric_goals = MetricDefinition(
        slug="player_goals",
        label_fr="Buts",
        scope=MetricScope.PLAYER,
        category=MetricCategory.EVENTS,
        datatype=MetricDataType.INT,
        unit="count",
        side=MetricSide.NONE,
        is_derived=False
    )

    metric_shots = MetricDefinition(
        slug="player_shots",
        label_fr="Tirs",
        scope=MetricScope.PLAYER,
        category=MetricCategory.EVENTS,
        datatype=MetricDataType.INT,
        unit="count",
        side=MetricSide.NONE,
        is_derived=False
    )

    metric_assists = MetricDefinition(
        slug="player_goal_assists",
        label_fr="Passes décisives",
        scope=MetricScope.PLAYER,
        category=MetricCategory.EVENTS,
        datatype=MetricDataType.INT,
        unit="count",
        side=MetricSide.NONE,
        is_derived=False
    )

    metric_attempts = MetricDefinition(
        slug="player_attempts",
        label_fr="Tentatives",
        scope=MetricScope.PLAYER,
        category=MetricCategory.COMBINATIONS,
        datatype=MetricDataType.INT,
        unit="count",
        side=MetricSide.NONE,
        is_derived=True,
        formula="goals + shots"
    )

    metric_conversion = MetricDefinition(
        slug="player_conversion_rate",
        label_fr="Taux de conversion",
        scope=MetricScope.PLAYER,
        category=MetricCategory.COMBINATIONS,
        datatype=MetricDataType.PERCENT,
        unit="%",
        side=MetricSide.NONE,
        is_derived=True,
        formula="goals / attempts * 100"
    )

    db_session.add_all([metric_goals, metric_shots, metric_assists, metric_attempts, metric_conversion])

    db_session.commit()

    return {
        "team": team,
        "season": season,
        "players": [player1, player2],
        "match": match,
        "metrics": {
            "goals": metric_goals,
            "shots": metric_shots,
            "assists": metric_assists,
            "attempts": metric_attempts,
            "conversion": metric_conversion
        }
    }

def test_player_attempts_calculation(db_session, sample_data):
    """Test that player attempts are calculated correctly"""
    match = sample_data["match"]
    player = sample_data["players"][0]

    # Add metric values
    goals_value = PlayerMatchMetricValue(
        match_id=match.id,
        player_id=player.id,
        metric_id=sample_data["metrics"]["goals"].id,
        value_number=2
    )

    shots_value = PlayerMatchMetricValue(
        match_id=match.id,
        player_id=player.id,
        metric_id=sample_data["metrics"]["shots"].id,
        value_number=5
    )

    db_session.add_all([goals_value, shots_value])
    db_session.commit()

    # Calculate derived metric
    analytics = AnalyticsService(db_session)
    attempts = analytics.compute_player_derived_metric(match.id, player.id, "player_attempts")

    assert attempts == 7  # 2 goals + 5 shots

def test_player_conversion_rate_calculation(db_session, sample_data):
    """Test that player conversion rate is calculated correctly"""
    match = sample_data["match"]
    player = sample_data["players"][0]

    # Add metric values
    goals_value = PlayerMatchMetricValue(
        match_id=match.id,
        player_id=player.id,
        metric_id=sample_data["metrics"]["goals"].id,
        value_number=3
    )

    shots_value = PlayerMatchMetricValue(
        match_id=match.id,
        player_id=player.id,
        metric_id=sample_data["metrics"]["shots"].id,
        value_number=7
    )

    db_session.add_all([goals_value, shots_value])
    db_session.commit()

    # Calculate derived metric
    analytics = AnalyticsService(db_session)
    conversion_rate = analytics.compute_player_derived_metric(match.id, player.id, "player_conversion_rate")

    assert conversion_rate == 30.0  # 3 goals / (3 + 7) attempts * 100

def test_player_conversion_rate_zero_attempts(db_session, sample_data):
    """Test that conversion rate handles zero attempts correctly"""
    match = sample_data["match"]
    player = sample_data["players"][0]

    # No metric values added (0 goals, 0 shots)

    analytics = AnalyticsService(db_session)
    conversion_rate = analytics.compute_player_derived_metric(match.id, player.id, "player_conversion_rate")

    assert conversion_rate == 0.0

def test_team_kpis_aggregation(db_session, sample_data):
    """Test that team KPIs are aggregated correctly across multiple matches"""
    team = sample_data["team"]
    season = sample_data["season"]

    # Create team metrics
    team_goals = MetricDefinition(
        slug="team_goals_scored",
        label_fr="Buts marqués",
        scope=MetricScope.TEAM,
        category=MetricCategory.EVENTS,
        datatype=MetricDataType.INT,
        unit="count",
        side=MetricSide.OWN,
        is_derived=False
    )
    db_session.add(team_goals)
    db_session.commit()

    # Create two matches with goals
    match1 = Match(
        team_id=team.id,
        season_id=season.id,
        date=date(2024, 6, 1),
        opponent_name="Team A",
        is_home=True,
        match_type=MatchType.LEAGUE,
        score_for=2,
        score_against=1
    )

    match2 = Match(
        team_id=team.id,
        season_id=season.id,
        date=date(2024, 6, 8),
        opponent_name="Team B",
        is_home=False,
        match_type=MatchType.LEAGUE,
        score_for=3,
        score_against=0
    )

    db_session.add_all([match1, match2])
    db_session.commit()

    # Add metric values
    value1 = TeamMatchMetricValue(
        match_id=match1.id,
        metric_id=team_goals.id,
        side=MetricSide.OWN,
        value_number=2
    )

    value2 = TeamMatchMetricValue(
        match_id=match2.id,
        metric_id=team_goals.id,
        side=MetricSide.OWN,
        value_number=3
    )

    db_session.add_all([value1, value2])
    db_session.commit()

    # Get aggregated KPIs
    analytics = AnalyticsService(db_session)
    kpis = analytics.get_team_kpis(
        team_id=team.id,
        metric_slugs=["team_goals_scored"],
        season_id=season.id
    )

    assert len(kpis) == 1
    assert kpis[0]["metric_slug"] == "team_goals_scored"
    assert kpis[0]["value"] == 5.0  # 2 + 3

def test_win_rate_calculation(db_session, sample_data):
    """Test win rate calculation"""
    team = sample_data["team"]
    season = sample_data["season"]

    # Create matches with different results
    matches = [
        Match(team_id=team.id, season_id=season.id, date=date(2024, 6, 1), opponent_name="A",
              is_home=True, match_type=MatchType.LEAGUE, score_for=3, score_against=1),  # Win
        Match(team_id=team.id, season_id=season.id, date=date(2024, 6, 8), opponent_name="B",
              is_home=False, match_type=MatchType.LEAGUE, score_for=1, score_against=1),  # Draw
        Match(team_id=team.id, season_id=season.id, date=date(2024, 6, 15), opponent_name="C",
              is_home=True, match_type=MatchType.LEAGUE, score_for=2, score_against=3),  # Loss
        Match(team_id=team.id, season_id=season.id, date=date(2024, 6, 22), opponent_name="D",
              is_home=False, match_type=MatchType.LEAGUE, score_for=4, score_against=0),  # Win
    ]

    db_session.add_all(matches)
    db_session.commit()

    analytics = AnalyticsService(db_session)
    win_rate = analytics.compute_team_win_rate(team_id=team.id, season_id=season.id)

    assert win_rate == 50.0  # 2 wins out of 4 matches

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
