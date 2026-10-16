-- Lancer avec : psql -U postgres -v db_password="$DB_PASSWORD" -f sql/setup.sql  (DB_PASSWORD vient du .env)
CREATE USER doums_admin WITH PASSWORD :'db_password';

CREATE DATABASE doumsdeal OWNER doums_admin;

GRANT ALL PRIVILEGES ON DATABASE doumsdeal TO doums_admin;