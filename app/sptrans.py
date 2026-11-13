"""
Cliente da API Olho Vivo (SPTrans) para a chegada ao vivo.
O token vem da variável de ambiente SPTRANS_TOKEN, nunca do código.
Guarda a previsão de cada ponto por 30 s para não sobrecarregar a API.
"""
import os
import time

import httpx

URL = "https://api.olhovivo.sptrans.com.br/v2.1"
CACHE_SEGUNDOS = 30


class SPTransIndisponivel(Exception):
    pass


class ClienteSPTrans:
    def __init__(self, token=None):
        self.token = token if token is not None else os.getenv("SPTRANS_TOKEN", "")
        self.cliente = httpx.Client(base_url=URL, timeout=10)
        self.autenticado = False
        self.cache = {}

    def login(self):
        if not self.token:
            raise SPTransIndisponivel("Token da SPTrans não configurado")
        # a API responde 411 se o POST vier sem Content-Length
        resp = self.cliente.post("/Login/Autenticar", params={"token": self.token}, content=b"")
        if resp.status_code != 200 or resp.text.strip().lower() != "true":
            raise SPTransIndisponivel("SPTrans recusou o login")
        self.autenticado = True

    def previsao(self, codigo_parada):
        guardado = self.cache.get(codigo_parada)
        if guardado and time.time() - guardado[0] < CACHE_SEGUNDOS:
            return guardado[1]

        try:
            if not self.autenticado:
                self.login()
            resp = self.cliente.get("/Previsao/Parada", params={"codigoParada": codigo_parada})
            if resp.status_code == 401:  # sessão expirou
                self.login()
                resp = self.cliente.get("/Previsao/Parada", params={"codigoParada": codigo_parada})
            resp.raise_for_status()
        except httpx.HTTPError as erro:
            raise SPTransIndisponivel(f"Falha ao consultar a SPTrans: {erro.__class__.__name__}") from erro

        dados = resp.json()
        ponto = dados.get("p") or {}
        chegadas = []
        for linha in ponto.get("l") or []:
            for veiculo in linha.get("vs") or []:
                chegadas.append({
                    "linha": linha.get("c"),
                    "destino": linha.get("lt1") if linha.get("sl") == 1 else linha.get("lt0"),
                    "horario": veiculo.get("t"),
                    "acessivel": bool(veiculo.get("a")),
                })
        chegadas.sort(key=lambda c: c["horario"] or "")
        resultado = {"hora_consulta": dados.get("hr"), "chegadas": chegadas[:12]}
        self.cache[codigo_parada] = (time.time(), resultado)
        return resultado
