CREATE TABLE public.account (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255),
    registration_code integer,
    reset_token character varying,
    last_user character varying,
    last_update_time bigint
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.account_id_seq OWNER TO postgres;

--
-- Name: account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_id_seq OWNED BY public.account.id;


--
-- Name: bottle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bottle (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    wine_id integer NOT NULL,
    vintage integer,
    apogee integer,
    is_favorite integer NOT NULL,
    price real NOT NULL,
    currency character varying(255),
    other_info character varying(255) NOT NULL,
    buy_location character varying(255) NOT NULL,
    buy_date bigint NOT NULL,
    tasting_taste_comment character varying(255) NOT NULL,
    bottle_size character varying(255) NOT NULL,
    consumed integer,
    tasting_id integer,
    is_selected boolean DEFAULT false NOT NULL,
    pdf_path character varying(255) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.bottle OWNER TO postgres;

--
-- Name: bottle__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.bottle ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.bottle__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: county; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.county (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    name character varying(255),
    pref_order integer NOT NULL
);


ALTER TABLE public.county OWNER TO postgres;

--
-- Name: county__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.county ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.county__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: f_review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.f_review (
    _id integer NOT NULL,
    account_id integer NOT NULL,
    bottle_id integer NOT NULL,
    review_id integer NOT NULL,
    value integer
);


ALTER TABLE public.f_review OWNER TO postgres;

--
-- Name: f_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.f_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.f_review_id_seq OWNER TO postgres;

--
-- Name: f_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.f_review_id_seq OWNED BY public.f_review._id;


--
-- Name: f_review_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.f_review ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.f_review_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: friend; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.friend (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    name character varying(255),
    img_path character varying(255) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.friend OWNER TO postgres;

--
-- Name: friend__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.friend ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.friend__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: grape; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grape (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.grape OWNER TO postgres;

--
-- Name: grape__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.grape ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.grape__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: history_entry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.history_entry (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    date bigint NOT NULL,
    bottle_id integer NOT NULL,
    tasting_id integer,
    comment character varying(255) NOT NULL,
    type integer,
    favorite integer
);


ALTER TABLE public.history_entry OWNER TO postgres;

--
-- Name: history_entry__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.history_entry ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.history_entry__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: history_x_friend; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.history_x_friend (
    _id integer NOT NULL,
    account_id integer NOT NULL,
    history_entry_id integer NOT NULL,
    friend_id integer NOT NULL
);


ALTER TABLE public.history_x_friend OWNER TO postgres;

--
-- Name: history_x_friend_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.history_x_friend_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.history_x_friend_id_seq OWNER TO postgres;

--
-- Name: history_x_friend_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.history_x_friend_id_seq OWNED BY public.history_x_friend._id;


--
-- Name: history_x_friend_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.history_x_friend ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.history_x_friend_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: q_grape; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.q_grape (
    _id integer NOT NULL,
    account_id integer NOT NULL,
    bottle_id integer NOT NULL,
    grape_id integer NOT NULL,
    percentage integer NOT NULL
);


ALTER TABLE public.q_grape OWNER TO postgres;

--
-- Name: q_grape__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.q_grape ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.q_grape__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: q_grape_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.q_grape_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.q_grape_id_seq OWNER TO postgres;

--
-- Name: q_grape_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.q_grape_id_seq OWNED BY public.q_grape._id;


--
-- Name: review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review (
    _id integer NOT NULL,
    id integer,
    account_id integer NOT NULL,
    contest_name character varying(255) NOT NULL,
    type integer
);


ALTER TABLE public.review OWNER TO postgres;

--
-- Name: review__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.review ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.review__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tasting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasting (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    date bigint NOT NULL,
    is_midday boolean NOT NULL,
    opportunity character varying(255),
    done boolean
);


ALTER TABLE public.tasting OWNER TO postgres;

--
-- Name: tasting__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tasting ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tasting__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tasting_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasting_action (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    type character varying(255),
    bottle_id integer NOT NULL,
    done integer
);


ALTER TABLE public.tasting_action OWNER TO postgres;

--
-- Name: tasting_action__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tasting_action ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tasting_action__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tasting_x_friend; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasting_x_friend (
    _id integer NOT NULL,
    account_id integer NOT NULL,
    tasting_id integer NOT NULL,
    friend_id integer NOT NULL
);


ALTER TABLE public.tasting_x_friend OWNER TO postgres;

--
-- Name: tasting_x_friend_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasting_x_friend_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasting_x_friend_id_seq OWNER TO postgres;

--
-- Name: tasting_x_friend_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasting_x_friend_id_seq OWNED BY public.tasting_x_friend._id;


--
-- Name: tasting_x_friend_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tasting_x_friend ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.tasting_x_friend_id_seq1
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wine (
    _id integer NOT NULL,
    id integer NOT NULL,
    account_id integer NOT NULL,
    name character varying(255),
    naming character varying(255),
    color character varying(255),
    cuvee character varying(255),
    is_organic integer NOT NULL,
    county_id integer NOT NULL,
    hidden integer,
    img_path character varying(255) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE public.wine OWNER TO postgres;

--
-- Name: wine__id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wine ALTER COLUMN _id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.wine__id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
