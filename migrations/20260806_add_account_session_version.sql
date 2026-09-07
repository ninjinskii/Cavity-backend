-- Existing JWTs do not contain a session version and will be invalidated at deployment.
ALTER TABLE public.account
ADD COLUMN session_version character varying(36);

UPDATE public.account
SET session_version = 'legacy'
WHERE session_version IS NULL;

ALTER TABLE public.account
ALTER COLUMN session_version SET NOT NULL;
