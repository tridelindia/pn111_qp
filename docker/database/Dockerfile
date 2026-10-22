FROM postgres:17-alpine

# Bake the pre-populated database backup directly into the image
# When postgres runs with POSTGRES_DB=db_lusail, it will automatically execute this script on first run
COPY init-db.sql /docker-entrypoint-initdb.d/01-init-db.sql

EXPOSE 5432
