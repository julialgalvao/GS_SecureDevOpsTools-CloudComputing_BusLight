#!/usr/bin/env bash
# Dispara o alerta BusLightErrosAltos sem derrubar o site: pede a chegada ao vivo
# de um ponto quando a VM não tem o token da SPTrans, o que devolve 503 (erro 5xx).
# Uso: MVP_URL=http://buslight-gs.northcentralus.cloudapp.azure.com ./disparar_alerta.sh
set -euo pipefail

: "${MVP_URL:?informe MVP_URL (ex: http://buslight-gs.northcentralus.cloudapp.azure.com)}"

PONTO=$(curl -fsS "$MVP_URL/api/pontos" | python3 -c "import sys, json; print(json.load(sys.stdin)[0]['codigo_parada'])")
echo "Ponto usado: $PONTO. Gerando respostas 503 por 4 minutos (alerta dispara depois de 2 minutos acima de 5%)."

fim=$((SECONDS + 240))
while [ $SECONDS -lt $fim ]; do
  curl -s -o /dev/null -w "%{http_code} " "$MVP_URL/api/pontos/$PONTO/chegada" || true
  sleep 0.5
done
echo
echo "Abra o Prometheus em http://localhost:9090/alerts e tire o print do alerta em FIRING."
