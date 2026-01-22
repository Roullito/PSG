--
-- PostgreSQL database dump
--

\restrict 68H0bhM3wiVI2V4UWWsAZBmeRfam0YSNbVI7jAq2xlBHNMHPL4C7n6V1hDd6OC8

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: matchtype; Type: TYPE; Schema: public; Owner: veo_user
--

CREATE TYPE public.matchtype AS ENUM (
    'LEAGUE',
    'CUP',
    'FRIENDLY',
    'TOURNAMENT'
);


ALTER TYPE public.matchtype OWNER TO veo_user;

--
-- Name: metriccategory; Type: TYPE; Schema: public; Owner: veo_user
--

CREATE TYPE public.metriccategory AS ENUM (
    'POSSESSION',
    'PASSES',
    'EVENTS',
    'COMBINATIONS',
    'GENERAL'
);


ALTER TYPE public.metriccategory OWNER TO veo_user;

--
-- Name: metricdatatype; Type: TYPE; Schema: public; Owner: veo_user
--

CREATE TYPE public.metricdatatype AS ENUM (
    'INT',
    'FLOAT',
    'PERCENT'
);


ALTER TYPE public.metricdatatype OWNER TO veo_user;

--
-- Name: metricscope; Type: TYPE; Schema: public; Owner: veo_user
--

CREATE TYPE public.metricscope AS ENUM (
    'TEAM',
    'PLAYER'
);


ALTER TYPE public.metricscope OWNER TO veo_user;

--
-- Name: metricside; Type: TYPE; Schema: public; Owner: veo_user
--

CREATE TYPE public.metricside AS ENUM (
    'OWN',
    'OPPONENT',
    'NONE'
);


ALTER TYPE public.metricside OWNER TO veo_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO veo_user;

--
-- Name: match_player_participations; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.match_player_participations (
    id integer NOT NULL,
    match_id integer NOT NULL,
    player_id integer NOT NULL,
    is_starter boolean,
    is_captain boolean,
    minutes_played integer,
    position_played character varying(50)
);


ALTER TABLE public.match_player_participations OWNER TO veo_user;

--
-- Name: match_player_participations_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.match_player_participations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.match_player_participations_id_seq OWNER TO veo_user;

--
-- Name: match_player_participations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.match_player_participations_id_seq OWNED BY public.match_player_participations.id;


--
-- Name: matches; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.matches (
    id integer NOT NULL,
    team_id integer NOT NULL,
    season_id integer NOT NULL,
    date date NOT NULL,
    opponent_name character varying(200) NOT NULL,
    is_home boolean,
    match_type public.matchtype,
    competition character varying(200),
    score_for integer,
    score_against integer,
    veo_title character varying(300),
    veo_url character varying(500),
    veo_duration integer,
    veo_camera character varying(100)
);


ALTER TABLE public.matches OWNER TO veo_user;

--
-- Name: matches_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.matches_id_seq OWNER TO veo_user;

--
-- Name: matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.matches_id_seq OWNED BY public.matches.id;


--
-- Name: metric_definitions; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.metric_definitions (
    id integer NOT NULL,
    slug character varying(100) NOT NULL,
    label_fr character varying(200) NOT NULL,
    description_fr text,
    scope public.metricscope NOT NULL,
    category public.metriccategory NOT NULL,
    datatype public.metricdatatype,
    unit character varying(50),
    side public.metricside,
    is_derived boolean,
    formula text
);


ALTER TABLE public.metric_definitions OWNER TO veo_user;

--
-- Name: metric_definitions_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.metric_definitions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.metric_definitions_id_seq OWNER TO veo_user;

--
-- Name: metric_definitions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.metric_definitions_id_seq OWNED BY public.metric_definitions.id;


--
-- Name: player_match_metric_values; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.player_match_metric_values (
    id integer NOT NULL,
    match_id integer NOT NULL,
    player_id integer NOT NULL,
    metric_id integer NOT NULL,
    value_number double precision NOT NULL
);


ALTER TABLE public.player_match_metric_values OWNER TO veo_user;

--
-- Name: player_match_metric_values_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.player_match_metric_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.player_match_metric_values_id_seq OWNER TO veo_user;

--
-- Name: player_match_metric_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.player_match_metric_values_id_seq OWNED BY public.player_match_metric_values.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.players (
    id integer NOT NULL,
    team_id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    main_position character varying(50) NOT NULL,
    secondary_positions character varying(200)
);


ALTER TABLE public.players OWNER TO veo_user;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO veo_user;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: seasons; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.seasons (
    id integer NOT NULL,
    label character varying(100) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL
);


ALTER TABLE public.seasons OWNER TO veo_user;

--
-- Name: seasons_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.seasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seasons_id_seq OWNER TO veo_user;

--
-- Name: seasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.seasons_id_seq OWNED BY public.seasons.id;


--
-- Name: team_match_metric_values; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.team_match_metric_values (
    id integer NOT NULL,
    match_id integer NOT NULL,
    metric_id integer NOT NULL,
    side public.metricside NOT NULL,
    value_number double precision NOT NULL
);


ALTER TABLE public.team_match_metric_values OWNER TO veo_user;

--
-- Name: team_match_metric_values_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.team_match_metric_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_match_metric_values_id_seq OWNER TO veo_user;

--
-- Name: team_match_metric_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.team_match_metric_values_id_seq OWNED BY public.team_match_metric_values.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: veo_user
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(200) NOT NULL
);


ALTER TABLE public.teams OWNER TO veo_user;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: veo_user
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO veo_user;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: veo_user
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: match_player_participations id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.match_player_participations ALTER COLUMN id SET DEFAULT nextval('public.match_player_participations_id_seq'::regclass);


--
-- Name: matches id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.matches ALTER COLUMN id SET DEFAULT nextval('public.matches_id_seq'::regclass);


--
-- Name: metric_definitions id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.metric_definitions ALTER COLUMN id SET DEFAULT nextval('public.metric_definitions_id_seq'::regclass);


--
-- Name: player_match_metric_values id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.player_match_metric_values ALTER COLUMN id SET DEFAULT nextval('public.player_match_metric_values_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: seasons id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.seasons ALTER COLUMN id SET DEFAULT nextval('public.seasons_id_seq'::regclass);


--
-- Name: team_match_metric_values id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.team_match_metric_values ALTER COLUMN id SET DEFAULT nextval('public.team_match_metric_values_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.alembic_version (version_num) FROM stdin;
001_initial
\.


--
-- Data for Name: match_player_participations; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.match_player_participations (id, match_id, player_id, is_starter, is_captain, minutes_played, position_played) FROM stdin;
\.


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.matches (id, team_id, season_id, date, opponent_name, is_home, match_type, competition, score_for, score_against, veo_title, veo_url, veo_duration, veo_camera) FROM stdin;
\.


--
-- Data for Name: metric_definitions; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.metric_definitions (id, slug, label_fr, description_fr, scope, category, datatype, unit, side, is_derived, formula) FROM stdin;
1	player_matches	Matchs	\N	PLAYER	GENERAL	INT	count	NONE	f	\N
2	player_starts	Titulaire	\N	PLAYER	GENERAL	INT	count	NONE	f	\N
3	player_captaincies	Capitanats	\N	PLAYER	GENERAL	INT	count	NONE	f	\N
4	player_motm	Meilleur joueur du match	\N	PLAYER	GENERAL	INT	count	NONE	f	\N
5	player_total_events	Nombre total d'événements	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
6	player_goals	Buts	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
7	player_shots	Tirs	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
8	player_corners	Corners	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
9	player_free_kicks	Coups francs	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
10	player_goal_kicks	Coups de pied de but	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
11	player_penalties	Penaltys	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
12	player_goal_assists	Goal assists	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
13	player_throw_ins	Throw-ins	\N	PLAYER	EVENTS	INT	count	NONE	f	\N
14	player_attempts	Nombre de tentatives	\N	PLAYER	COMBINATIONS	INT	count	NONE	t	goals + shots
15	player_conversion_rate	Taux de conversion	\N	PLAYER	COMBINATIONS	PERCENT	%	NONE	t	goals / attempts * 100
16	player_goal_involvements	Goal involvements	\N	PLAYER	COMBINATIONS	INT	count	NONE	t	goals + assists
17	team_possession_pct	Possession (%)	\N	TEAM	POSSESSION	PERCENT	%	OWN	f	\N
18	team_possession_minutes	Possession (minutes)	\N	TEAM	POSSESSION	FLOAT	minutes	OWN	f	\N
19	team_possession_won	Possessions gagnées	\N	TEAM	POSSESSION	INT	count	OWN	f	\N
20	team_possession_third_def_pct	Possession tiers défensif (%)	\N	TEAM	POSSESSION	PERCENT	%	OWN	f	\N
21	team_possession_third_mid_pct	Possession tiers milieu (%)	\N	TEAM	POSSESSION	PERCENT	%	OWN	f	\N
22	team_possession_third_att_pct	Possession tiers attaque (%)	\N	TEAM	POSSESSION	PERCENT	%	OWN	f	\N
23	team_pass_zone_def_pct	Passes zone défensive (%)	\N	TEAM	PASSES	PERCENT	%	OWN	f	\N
24	team_pass_zone_mid_pct	Passes zone milieu (%)	\N	TEAM	PASSES	PERCENT	%	OWN	f	\N
25	team_pass_zone_att_pct	Passes zone attaque (%)	\N	TEAM	PASSES	PERCENT	%	OWN	f	\N
26	team_passes_completed	Passes réussies	\N	TEAM	PASSES	INT	count	OWN	f	\N
27	team_sequences_3_5	Séquences 3-5 passes	\N	TEAM	PASSES	INT	count	OWN	f	\N
28	team_sequences_6_plus	Séquences 6+ passes	\N	TEAM	PASSES	INT	count	OWN	f	\N
29	team_longest_sequence	Séquence la plus longue	\N	TEAM	PASSES	INT	count	OWN	f	\N
30	team_goals_scored	Buts marqués	\N	TEAM	EVENTS	INT	count	OWN	f	\N
31	team_goals_conceded	Buts encaissés	\N	TEAM	EVENTS	INT	count	OPPONENT	f	\N
32	team_free_kicks	Coups francs	\N	TEAM	EVENTS	INT	count	OWN	f	\N
33	team_shots	Tirs	\N	TEAM	EVENTS	INT	count	OWN	f	\N
34	team_shots_conceded	Tirs encaissés	\N	TEAM	EVENTS	INT	count	OPPONENT	f	\N
35	team_corners	Corners	\N	TEAM	EVENTS	INT	count	OWN	f	\N
36	team_goal_kicks	Coups de pied de but	\N	TEAM	EVENTS	INT	count	OWN	f	\N
37	team_throw_ins	Throw-ins	\N	TEAM	EVENTS	INT	count	OWN	f	\N
38	team_attempts	Tentatives totales	\N	TEAM	COMBINATIONS	INT	count	OWN	t	goals_scored + shots
39	team_conversion_rate	Taux de conversion	\N	TEAM	COMBINATIONS	PERCENT	%	OWN	t	goals_scored / attempts * 100
40	team_attempts_conceded	Tentatives encaissées	\N	TEAM	COMBINATIONS	INT	count	OPPONENT	t	goals_conceded + shots_conceded
41	team_offensive_events	Événements offensifs	\N	TEAM	COMBINATIONS	INT	count	OWN	t	goals_scored + corners + free_kicks + shots
42	team_defensive_events	Événements défensifs	\N	TEAM	COMBINATIONS	INT	count	OPPONENT	t	goals_conceded + shots_conceded
43	team_win_rate	Taux de victoire	\N	TEAM	COMBINATIONS	PERCENT	%	OWN	t	wins / total_matches * 100
\.


--
-- Data for Name: player_match_metric_values; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.player_match_metric_values (id, match_id, player_id, metric_id, value_number) FROM stdin;
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.players (id, team_id, first_name, last_name, main_position, secondary_positions) FROM stdin;
\.


--
-- Data for Name: seasons; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.seasons (id, label, start_date, end_date) FROM stdin;
\.


--
-- Data for Name: team_match_metric_values; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.team_match_metric_values (id, match_id, metric_id, side, value_number) FROM stdin;
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: veo_user
--

COPY public.teams (id, name) FROM stdin;
\.


--
-- Name: match_player_participations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.match_player_participations_id_seq', 1, false);


--
-- Name: matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.matches_id_seq', 1, false);


--
-- Name: metric_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.metric_definitions_id_seq', 43, true);


--
-- Name: player_match_metric_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.player_match_metric_values_id_seq', 1, false);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.players_id_seq', 1, false);


--
-- Name: seasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.seasons_id_seq', 1, false);


--
-- Name: team_match_metric_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.team_match_metric_values_id_seq', 1, false);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: veo_user
--

SELECT pg_catalog.setval('public.teams_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: match_player_participations match_player_participations_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.match_player_participations
    ADD CONSTRAINT match_player_participations_pkey PRIMARY KEY (id);


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_pkey PRIMARY KEY (id);


--
-- Name: metric_definitions metric_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.metric_definitions
    ADD CONSTRAINT metric_definitions_pkey PRIMARY KEY (id);


--
-- Name: metric_definitions metric_definitions_slug_key; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.metric_definitions
    ADD CONSTRAINT metric_definitions_slug_key UNIQUE (slug);


--
-- Name: player_match_metric_values player_match_metric_values_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.player_match_metric_values
    ADD CONSTRAINT player_match_metric_values_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: seasons seasons_label_key; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_label_key UNIQUE (label);


--
-- Name: seasons seasons_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.seasons
    ADD CONSTRAINT seasons_pkey PRIMARY KEY (id);


--
-- Name: team_match_metric_values team_match_metric_values_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.team_match_metric_values
    ADD CONSTRAINT team_match_metric_values_pkey PRIMARY KEY (id);


--
-- Name: teams teams_name_key; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_name_key UNIQUE (name);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: team_match_metric_values uq_match_metric_side; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.team_match_metric_values
    ADD CONSTRAINT uq_match_metric_side UNIQUE (match_id, metric_id, side);


--
-- Name: match_player_participations uq_match_player; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.match_player_participations
    ADD CONSTRAINT uq_match_player UNIQUE (match_id, player_id);


--
-- Name: player_match_metric_values uq_match_player_metric; Type: CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.player_match_metric_values
    ADD CONSTRAINT uq_match_player_metric UNIQUE (match_id, player_id, metric_id);


--
-- Name: ix_match_player_participations_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_match_player_participations_id ON public.match_player_participations USING btree (id);


--
-- Name: ix_matches_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_matches_id ON public.matches USING btree (id);


--
-- Name: ix_metric_definitions_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_metric_definitions_id ON public.metric_definitions USING btree (id);


--
-- Name: ix_metric_definitions_slug; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_metric_definitions_slug ON public.metric_definitions USING btree (slug);


--
-- Name: ix_player_match_metric_values_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_player_match_metric_values_id ON public.player_match_metric_values USING btree (id);


--
-- Name: ix_players_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_players_id ON public.players USING btree (id);


--
-- Name: ix_seasons_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_seasons_id ON public.seasons USING btree (id);


--
-- Name: ix_team_match_metric_values_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_team_match_metric_values_id ON public.team_match_metric_values USING btree (id);


--
-- Name: ix_teams_id; Type: INDEX; Schema: public; Owner: veo_user
--

CREATE INDEX ix_teams_id ON public.teams USING btree (id);


--
-- Name: match_player_participations match_player_participations_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.match_player_participations
    ADD CONSTRAINT match_player_participations_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);


--
-- Name: match_player_participations match_player_participations_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.match_player_participations
    ADD CONSTRAINT match_player_participations_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: matches matches_season_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_season_id_fkey FOREIGN KEY (season_id) REFERENCES public.seasons(id);


--
-- Name: matches matches_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.matches
    ADD CONSTRAINT matches_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: player_match_metric_values player_match_metric_values_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.player_match_metric_values
    ADD CONSTRAINT player_match_metric_values_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);


--
-- Name: player_match_metric_values player_match_metric_values_metric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.player_match_metric_values
    ADD CONSTRAINT player_match_metric_values_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.metric_definitions(id);


--
-- Name: player_match_metric_values player_match_metric_values_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.player_match_metric_values
    ADD CONSTRAINT player_match_metric_values_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: players players_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: team_match_metric_values team_match_metric_values_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.team_match_metric_values
    ADD CONSTRAINT team_match_metric_values_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id);


--
-- Name: team_match_metric_values team_match_metric_values_metric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: veo_user
--

ALTER TABLE ONLY public.team_match_metric_values
    ADD CONSTRAINT team_match_metric_values_metric_id_fkey FOREIGN KEY (metric_id) REFERENCES public.metric_definitions(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 68H0bhM3wiVI2V4UWWsAZBmeRfam0YSNbVI7jAq2xlBHNMHPL4C7n6V1hDd6OC8

