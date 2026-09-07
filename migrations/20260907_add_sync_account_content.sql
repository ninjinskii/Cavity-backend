-- The API authenticates its own JWTs then invokes this function with the
-- server-only Supabase service_role key. Do not grant it to anon/authenticated:
-- p_account_id is supplied by the API, not by Supabase Auth.
BEGIN;

CREATE OR REPLACE FUNCTION public.sync_account_content(
    p_account_id integer,
    p_data jsonb
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    table_name text;
    rows jsonb;
    allowed_tables jsonb := jsonb_build_object(
        'bottle', 'id, account_id, wine_id, vintage, apogee, is_favorite, price, currency, other_info, buy_location, buy_date, tasting_taste_comment, bottle_size, consumed, tasting_id, selected, pdf_path, alcohol, storage_location',
        'county', 'id, account_id, name, pref_order',
        'f_review', 'account_id, bottle_id, review_id, value',
        'friend', 'id, account_id, name, img_path',
        'grape', 'id, account_id, name',
        'history_entry', 'id, account_id, date, bottle_id, tasting_id, comment, type, favorite',
        'history_x_friend', 'account_id, history_entry_id, friend_id',
        'q_grape', 'account_id, bottle_id, grape_id, percentage',
        'review', 'id, account_id, contest_name, type',
        'tag', 'id, account_id, name',
        'tag_x_bottle', 'account_id, tag_id, bottle_id',
        'tasting', 'id, account_id, date, is_midday, opportunity, done',
        'tasting_action', 'id, account_id, type, bottle_id, done',
        'tasting_x_friend', 'account_id, tasting_id, friend_id',
        'wine', 'id, account_id, name, naming, color, cuvee, is_organic, county_id, hidden, img_path'
    );
BEGIN
    FOR table_name, rows IN
        SELECT key, value FROM jsonb_each(p_data)
    LOOP
        IF NOT allowed_tables ? table_name THEN
            RAISE EXCEPTION 'Table % is not allowed in sync', table_name;
        END IF;

        EXECUTE format('DELETE FROM public.%I WHERE account_id = $1', table_name)
        USING p_account_id;

        EXECUTE format(
            'INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_recordset(NULL::public.%I, $1)',
            table_name,
            allowed_tables ->> table_name,
            allowed_tables ->> table_name,
            table_name
        )
        USING rows;
    END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_account_content(integer, jsonb) FROM PUBLIC;
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON FUNCTION public.sync_account_content(integer, jsonb) FROM anon;
    END IF;

    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON FUNCTION public.sync_account_content(integer, jsonb) FROM authenticated;
    END IF;

    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT EXECUTE ON FUNCTION public.sync_account_content(integer, jsonb) TO service_role;
    END IF;
END;
$$;

COMMIT;
