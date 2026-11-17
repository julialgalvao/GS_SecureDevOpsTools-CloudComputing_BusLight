#!/usr/bin/env bash
# Sobe o Prometheus e o Grafana apontando para o BusLight publicado.
# Uso: MVP_HOST=<ip-ou-dominio> METRICS_TOKEN=<token> ./iniciar.sh
set -euo pipefail
cd "$(dirname "$0")"

: "${MVP_HOST:?informe MVP_HOST (ex: buslight-gs.northcentralus.cloudapp.azure.com)}"
: "${METRICS_TOKEN:?informe METRICS_TOKEN (o mesmo do .env da VM)}"

mkdir -p prometheus/targets
printf '[{"targets": ["%s"], "labels": {"ambiente": "azure"}}]\n' "$MVP_HOST" > prometheus/targets/buslight.json
printf '%s' "$METRICS_TOKEN" > prometheus/metrics_token
chmod 644 prometheus/metrics_token

if [ ! -f .env ]; then
  echo "GRAFANA_SENHA=$(openssl rand -hex 12)" > .env
fi
cat .env

docker compose up -d
echo "Prometheus: http://localhost:9090   Grafana: http://localhost:3000 (usuário admin)"
