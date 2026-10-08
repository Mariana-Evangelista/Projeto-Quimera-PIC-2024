#!/usr/bin/env bash
# Executado na EC2 via SSM (como root), DEPOIS do git pull.
# Espera a variável OLD_REV (commit anterior ao pull).
set -euo pipefail

cd /home/ubuntu/app
COMPOSE="docker compose -f docker-compose.prod.yml"

if [ "$(id -u)" -ne 0 ]; then
  echo "Este script deve rodar como root (via SSM)." >&2
  exit 1
fi

NEW_REV=$(sudo -u ubuntu git rev-parse HEAD)
echo "Deploy: ${OLD_REV:-desconhecido} -> ${NEW_REV}"

$COMPOSE pull api
$COMPOSE up -d --remove-orphans

# Caddyfile é bind mount de arquivo único: se mudou, reinicia o Caddy.
if [ -n "${OLD_REV:-}" ] && [ "$OLD_REV" != "$NEW_REV" ] \
   && sudo -u ubuntu git diff --name-only "$OLD_REV" "$NEW_REV" | grep -qx 'Caddyfile'; then
  echo "Caddyfile alterado, reiniciando caddy"
  $COMPOSE restart caddy
fi

# Espera a API ficar saudável (até ~150s).
CID=$($COMPOSE ps -q api)
for i in $(seq 1 30); do
  STATUS=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CID" 2>/dev/null || echo unknown)
  echo "api health: $STATUS ($i/30)"
  [ "$STATUS" = "healthy" ] && break
  sleep 5
done

if [ "$STATUS" != "healthy" ]; then
  echo "API não ficou saudável. Últimos logs:" >&2
  $COMPOSE logs --tail 80 api >&2
  exit 1
fi

docker image prune -f
echo "Deploy concluído."