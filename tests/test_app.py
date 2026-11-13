"""
Testes da API do BusLight (rodam no pipeline antes do build da imagem).
Uso: pytest tests/
"""
import re

import pytest
from fastapi.testclient import TestClient

from app import main
from app.sptrans import SPTransIndisponivel

cliente = TestClient(main.app)
UM_PONTO = next(iter(main.pontos))


def test_health():
    resp = cliente.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_site_abre():
    resp = cliente.get("/")
    assert resp.status_code == 200
    assert "BusLight" in resp.text


def test_resumo():
    dados = cliente.get("/api/resumo").json()
    assert dados["pontos"] == 144
    assert dados["espera_media_min"] > 0


def test_pontos_ordenados_pela_espera():
    dados = cliente.get("/api/pontos").json()
    esperas = [p["espera_media_min"] for p in dados]
    assert esperas == sorted(esperas, reverse=True)


def test_faixa_invalida_e_recusada():
    assert cliente.get("/api/pontos?faixa=qualquer").status_code == 422


def test_ponto_inexistente():
    assert cliente.get("/api/pontos/1/chegada").status_code == 404


def test_saia_de_casa():
    faixa = next(iter(main.pontos[UM_PONTO]["espera_por_faixa"]))
    resp = cliente.get(f"/api/saia-de-casa?ponto={UM_PONTO}&faixa={faixa}&caminhada_min=7")
    assert resp.status_code == 200
    assert resp.json()["antecedencia_recomendada_min"] == 9


def test_chegada_sem_sptrans_devolve_media(monkeypatch):
    def falhar(codigo):
        raise SPTransIndisponivel("fora do ar")

    monkeypatch.setattr(main.sptrans, "previsao", falhar)
    resp = cliente.get(f"/api/pontos/{UM_PONTO}/chegada")
    assert resp.status_code == 503
    assert resp.json()["espera_media_min"] is not None


def test_chegada_ao_vivo(monkeypatch):
    monkeypatch.setattr(main.sptrans, "previsao", lambda codigo: {"hora_consulta": "22:00", "chegadas": []})
    resp = cliente.get(f"/api/pontos/{UM_PONTO}/chegada")
    assert resp.status_code == 200
    assert resp.json()["hora_consulta"] == "22:00"


@pytest.mark.parametrize("rota", ["/api/alertas?limite=20", "/api/alertas/U0001"])
def test_telefone_nunca_aparece_completo(rota):
    # LGPD: a API só pode devolver o telefone mascarado, nunca o número nem o hash
    dados = cliente.get(rota).json()
    usuarios = dados if isinstance(dados, list) else [dados]
    for u in usuarios:
        assert "telefone" not in u and "telefone_hash" not in u
        assert re.fullmatch(r"\(\d{2}\) \*{5}-\d{4}", u["telefone_mascarado"])


def test_metricas_de_ouro():
    cliente.get("/health")
    texto = cliente.get("/metrics").text
    assert "http_requests_total" in texto
    assert "http_request_duration_seconds_bucket" in texto
