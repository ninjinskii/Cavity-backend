#!/bin/bash

docker-compose run --rm db bash << EOF
pg_dump postgresql://postgres:[password]@db.pyjhfmsgwwdcdcmyiffc.supabase.co:6543/postgres > /home/backup.sql
EOF
exit
