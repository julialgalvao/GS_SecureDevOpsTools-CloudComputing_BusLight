#!/usr/bin/env bash
# Sobe o Prometheus e o Grafana direto no Mac (Homebrew), sem Docker, apontando para o MVP publicado.
# Pré-requisito: brew install prometheus grafana
# Uso:    MVP_HOST=<nome-dns-da-vm> METRICS_TOKEN=<token> ./iniciar_local.sh
# Parar:  ./iniciar_local.sh parar
set -euo pipefail
cd "$(dirname "$0")"
AQUI="$PWD"
RUN="$AQUI/.run"

parar() {
  for p in prometheus grafana; do
    if [ -f "$RUN/$p.pid" ]; then kill "$(cat "$RUN/$p.pid")" 2>/dev/null || true; rm -f "$RUN/$p.pid"; fi
  done
  echo "Prometheus e Grafana parados."
}
if [ "${1:-}" = "parar" ]; then parar; exit 0; fi

: "${MVP_HOST:?informe MVP_HOST (ex: buslight-gs.northcentralus.cloudapp.azure.com)}"
: "${METRICS_TOKEN:?informe METRICS_TOKEN (o mesmo do .env da VM)}"
command -v prometheus >/dev/null || { echo "Falta o Prometheus: brew install prometheus"; exit 1; }
command -v grafana >/dev/null || { echo "Falta o Grafana: brew install grafana"; exit 1; }

parar >/dev/null
mkdir -p "$RUN"/prometheus/targets "$RUN"/tsdb "$RUN"/grafana/{dados,logs,plugins} \
         "$RUN"/grafana/provisioning/datasources "$RUN"/grafana/provisioning/dashboards

# ---------------- Prometheus: mesmos arquivos do docker compose, com os caminhos trocados
printf '[{"targets": ["%s"], "labels": {"ambiente": "azure"}}]\n' "$MVP_HOST" > "$RUN/prometheus/targets/buslight.json"
printf '%s' "$METRICS_TOKEN" > "$RUN/prometheus/metrics_token"
sed "s#/etc/prometheus#$RUN/prometheus#g" prometheus/prometheus.yml > "$RUN/prometheus/prometheus.yml"
cp prometheus/alert.rules.yml "$RUN/prometheus/alert.rules.yml"

# ---------------- Grafana: datasource local e dashboard versionado
sed "s#http://prometheus:9090#http://127.0.0.1:9090#" grafana/provisioning/datasources/prometheus.yml > "$RUN/grafana/provisioning/datasources/prometheus.yml"
sed "s#/var/lib/grafana/dashboards#$AQUI/grafana/dashboards#" grafana/provisioning/dashboards/buslight.yml > "$RUN/grafana/provisioning/dashboards/buslight.yml"

if [ ! -f .env ]; then echo "GRAFANA_SENHA=$(openssl rand -hex 12)" > .env; fi
# shellcheck disable=SC1091
. ./.env

nohup prometheus \
  --config.file="$RUN/prometheus/prometheus.yml" \
  --storage.tsdb.path="$RUN/tsdb" \
  --web.listen-address=127.0.0.1:9090 \
  > "$RUN/prometheus.log" 2>&1 &
echo $! > "$RUN/prometheus.pid"

GRAFANA_HOME="$(brew --prefix grafana)/share/grafana"
GF_PATHS_DATA="$RUN/grafana/dados" GF_PATHS_LOGS="$RUN/grafana/logs" GF_PATHS_PLUGINS="$RUN/grafana/plugins" \
GF_PATHS_PROVISIONING="$RUN/grafana/provisioning" GF_SERVER_HTTP_ADDR=127.0.0.1 GF_SERVER_HTTP_PORT=3000 \
GF_SECURITY_ADMIN_USER=admin GF_SECURITY_ADMIN_PASSWORD="$GRAFANA_SENHA" GF_USERS_ALLOW_SIGN_UP=false \
nohup grafana server --homepath "$GRAFANA_HOME" > "$RUN/grafana.log" 2>&1 &
echo $! > "$RUN/grafana.pid"

echo "Prometheus: http://127.0.0.1:9090   Grafana: http://127.0.0.1:3000 (usuário admin, senha em monitoring/.env)"
echo "Alvo monitorado: http://$MVP_HOST  |  para parar: ./iniciar_local.sh parar"
