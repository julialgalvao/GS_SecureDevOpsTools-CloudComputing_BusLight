"""
Métricas para o Prometheus (as 4 métricas de ouro).
- latência e tráfego: http_request_duration_seconds / http_requests_total
- erros: http_requests_total com status 5xx
- saturação: process_cpu_seconds_total e process_resident_memory_bytes (vêm do prometheus_client)
"""
import time

from prometheus_client import Counter, Gauge, Histogram

REQUISICOES = Counter("http_requests_total", "Requisições HTTP", ["method", "route", "status"])
LATENCIA = Histogram(
    "http_request_duration_seconds",
    "Tempo de resposta das requisições",
    ["method", "route"],
    buckets=(0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5),
)
EM_ANDAMENTO = Gauge("http_requests_in_progress", "Requisições sendo atendidas agora")
SPTRANS_FALHAS = Counter("buslight_sptrans_falhas_total", "Consultas à SPTrans que falharam")


async def medir(request, call_next):
    # usa o caminho da rota (/api/pontos/{codigo}/chegada) para não criar uma série por ponto
    inicio = time.perf_counter()
    EM_ANDAMENTO.inc()
    status = 500
    try:
        resposta = await call_next(request)
        status = resposta.status_code
        return resposta
    finally:
        EM_ANDAMENTO.dec()
        rota = request.scope.get("route")
        caminho = rota.path if rota else "nao_encontrada"
        LATENCIA.labels(request.method, caminho).observe(time.perf_counter() - inicio)
        REQUISICOES.labels(request.method, caminho, str(status)).inc()
