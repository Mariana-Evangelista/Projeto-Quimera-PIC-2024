#!/usr/bin/env bash
set -euo pipefail

cd /home/ubuntu/app
BACKUP_DIR=/home/ubuntu/backups
KEEP_DAYS=14
mkdir -p "$BACKUP_DIR"

FILE="$BACKUP_DIR/quimera-$(date +%F-%H%M).archive.gz"

# As credenciais vêm das variáveis do próprio container (não aparecem no ps do host).
docker compose -f docker-compose.prod.yml exec -T mongodb sh -c \
  'mongodump --archive --gzip -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin' \
  > "$FILE"

# Descarta backups vazios/corrompidos.
[ -s "$FILE" ] || { rm -f "$FILE"; echo "backup vazio" >&2; exit 1; }

find "$BACKUP_DIR" -name 'quimera-*.archive.gz' -mtime +"$KEEP_DAYS" -delete
echo "Backup ok: $FILE"