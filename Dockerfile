# BusLight - imagem do app (FastAPI)
# Multi-stage: as dependências são instaladas numa etapa e só o resultado vai para a imagem final.

FROM python:3.15-slim AS dependencias
WORKDIR /build
COPY app/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


FROM python:3.15-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# usuário sem privilégios para rodar o app
RUN groupadd --gid 10001 buslight \
 && useradd --uid 10001 --gid buslight --no-create-home --shell /usr/sbin/nologin buslight

COPY --from=dependencias /install /usr/local
WORKDIR /srv
COPY --chown=buslight:buslight app ./app

USER buslight
EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)"

# o token da SPTrans entra só como variável de ambiente na hora de rodar o container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips", "*"]
