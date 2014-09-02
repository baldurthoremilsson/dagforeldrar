--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = off;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET escape_string_warning = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE addresses (
    address text NOT NULL,
    lat double precision,
    lon double precision
);


--
-- Name: dagforeldrar; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE dagforeldrar (
    nafn text,
    lausplass text,
    heimilisfang text,
    postnumer integer,
    simi text,
    hverfi text,
    vinnutimi text,
    netfang text,
    heimasida text,
    vinnutimistart time without time zone,
    vinnutimiend time without time zone,
    lat double precision,
    lon double precision,
    versionstart integer,
    versionend integer,
    id integer NOT NULL
);


--
-- Name: dagforeldrar_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE dagforeldrar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


--
-- Name: dagforeldrar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE dagforeldrar_id_seq OWNED BY dagforeldrar.id;


--
-- Name: versions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE versions (
    id integer NOT NULL,
    date timestamp without time zone DEFAULT now()
);


--
-- Name: versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO MINVALUE
    CACHE 1;


--
-- Name: versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE versions_id_seq OWNED BY versions.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY dagforeldrar ALTER COLUMN id SET DEFAULT nextval('dagforeldrar_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY versions ALTER COLUMN id SET DEFAULT nextval('versions_id_seq'::regclass);


--
-- Name: addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (address);


--
-- Name: dagforeldrar_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY dagforeldrar
    ADD CONSTRAINT dagforeldrar_pkey PRIMARY KEY (id);


--
-- Name: versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY versions
    ADD CONSTRAINT versions_pkey PRIMARY KEY (id);


--
-- Name: dagforeldrar_versionend_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY dagforeldrar
    ADD CONSTRAINT dagforeldrar_versionend_fkey FOREIGN KEY (versionend) REFERENCES versions(id);


--
-- Name: dagforeldrar_versionstart_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY dagforeldrar
    ADD CONSTRAINT dagforeldrar_versionstart_fkey FOREIGN KEY (versionstart) REFERENCES versions(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

