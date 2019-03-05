#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d%H%M")
cd /backups/postgres_backups
# TODO : Update your servername, username and database names
$PGPATH/bin/pg_dump -h localhost -U postgres -F t <dbname> > <dbname>_${TIMESTAMP}.tar
gzip <dbname>_${TIMESTAMP}.tar
# Cleanup configuration backups older than 30 days. 
find /backups/postgres_backups -name "<dbname>*.gz" -mtime +30 -type f -delete