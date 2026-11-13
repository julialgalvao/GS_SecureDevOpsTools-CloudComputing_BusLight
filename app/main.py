"""
BusLight - API e site do MVP

Os dados de espera vêm da camada Ouro do Databricks (JSON exportado pelo notebook
04_exportar_mvp do repositório de Dados, salvo em app/data/). A chegada ao vivo consulta
a API Olho Vivo da SPTrans pelo backend, para o token nunca ir para o navegador.
"""
import json
import os
from collections import defaultdict
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from app import metricas
from app.sptrans import ClienteSPTrans, SPTransIndisponivel

PASTA = Path(__file__).resolve().parent
DADOS = Path(os.getenv("BUSLIGHT_DADOS", PASTA / "data"))
FAIXAS = ("madrugada", "manha", "tarde", "noite")


def carregar(nome):
    return json.loads((DADOS / f"{nome}.json").read_text(encoding="utf-8"))


mapa = carregar("mapa_pontos")
ranking = carregar("ranking_linhas")
saia = carregar("saia_de_casa")
usuarios = {u["sk_usuario"]: u for u in carregar("usuarios")}
meta = carregar("meta")

pontos = {}
for linha in mapa:
    p = pontos.setdefault(linha["codigo_parada"], {
        "codigo_parada": linha["codigo_parada"],
        "nome": linha["nome"],
        "endereco": linha["endereco"],
        "latitude": linha["latitude"],
        "longitude": linha["longitude"],
        "regiao": linha["regiao"],
        "espera_por_faixa": {},
    })
    p["espera_por_faixa"][linha["faixa_horaria"]] = linha["espera_media_min"]

saia_por_ponto = defaultdict(list)
for linha in saia:
    saia_por_ponto[linha["codigo_parada"]].append(linha)

sptrans = ClienteSPTrans()

app = FastAPI(title="BusLight", version="1.0.0", docs_url=None, redoc_url=None)
app.middleware("http")(metricas.medir)


def espera_media(ponto, faixa=None):
    valores = ponto["espera_por_faixa"]
    if faixa:
        return valores.get(faixa)
    return round(sum(valores.values()) / len(valores), 1) if valores else None


def buscar_ponto(codigo):
    ponto = pontos.get(codigo)
    if not ponto:
        raise HTTPException(status_code=404, detail="Ponto não monitorado")
    return ponto


@app.get("/health")
def health():
    return {"status": "ok", "pontos": len(pontos)}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/api/resumo")
def resumo():
    medias = [espera_media(p) for p in pontos.values()]
    noite = [p["espera_por_faixa"]["noite"] for p in pontos.values() if "noite" in p["espera_por_faixa"]]
    return {
        "pontos": len(pontos),
        "linhas": len(ranking),
        "espera_media_min": round(sum(medias) / len(medias), 1),
        "espera_media_noite_min": round(sum(noite) / len(noite), 1) if noite else None,
        "coletas": len(meta.get("coletas", [])),
        "atualizado_em": meta.get("gerado_em"),
        "origem": meta.get("origem"),
    }


@app.get("/api/pontos")
def listar_pontos(faixa: str | None = Query(default=None, pattern="^(madrugada|manha|tarde|noite)$")):
    lista = []
    for p in pontos.values():
        media = espera_media(p, faixa)
        if media is None:
            continue
        lista.append({k: p[k] for k in ("codigo_parada", "nome", "endereco", "latitude", "longitude", "regiao")} | {"espera_media_min": media})
    lista.sort(key=lambda p: p["espera_media_min"], reverse=True)
    return lista


@app.get("/api/pontos/{codigo}")
def detalhe_ponto(codigo: int):
    return buscar_ponto(codigo)


@app.get("/api/pontos/{codigo}/chegada")
def chegada_ao_vivo(codigo: int):
    ponto = buscar_ponto(codigo)
    try:
        previsao = sptrans.previsao(codigo)
    except SPTransIndisponivel as erro:
        # sem a SPTrans, o app continua útil mostrando a espera média histórica do ponto
        metricas.SPTRANS_FALHAS.inc()
        return JSONResponse(status_code=503, content={
            "detail": str(erro),
            "ponto": ponto["nome"],
            "espera_media_min": espera_media(ponto),
        })
    return {"ponto": ponto["nome"], **previsao}


@app.get("/api/linhas")
def linhas(limite: int = Query(default=15, ge=1, le=200)):
    return ranking[:limite]


@app.get("/api/saia-de-casa")
def saia_de_casa(
    ponto: int,
    faixa: str = Query(pattern="^(madrugada|manha|tarde|noite)$"),
    caminhada_min: int = Query(default=5, ge=0, le=60),
):
    p = buscar_ponto(ponto)
    opcoes = [s for s in saia_por_ponto[ponto] if s["faixa_horaria"] == faixa]
    if not opcoes:
        raise HTTPException(status_code=404, detail="Sem dados desse ponto nessa faixa horária")
    opcoes.sort(key=lambda s: s["espera_sem_aviso_min"], reverse=True)
    return {
        "ponto": p["nome"],
        "faixa_horaria": faixa,
        "caminhada_min": caminhada_min,
        "antecedencia_recomendada_min": caminhada_min + opcoes[0]["espera_com_aviso_min"],
        "linhas": opcoes,
    }


@app.get("/api/alertas")
def alertas_exemplo(limite: int = Query(default=5, ge=1, le=20)):
    # usuários do cadastro simulado; o telefone já chega mascarado da Ouro
    return list(usuarios.values())[:limite]


@app.get("/api/alertas/{id_usuario}")
def alerta(id_usuario: str):
    usuario = usuarios.get(id_usuario)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    ponto = pontos.get(usuario["sk_ponto_favorito"])
    return usuario | {
        "ponto_favorito": ponto["nome"] if ponto else None,
        "espera_media_min": espera_media(ponto, usuario["faixa_horaria_preferida"]) if ponto else None,
    }


@app.get("/", include_in_schema=False)
def inicio():
    return FileResponse(PASTA / "static" / "index.html")


@app.get("/sw.js", include_in_schema=False)
def service_worker():
    # servido na raiz para o service worker cobrir o site inteiro
    return FileResponse(PASTA / "static" / "sw.js", media_type="application/javascript")


app.mount("/static", StaticFiles(directory=PASTA / "static"), name="static")
