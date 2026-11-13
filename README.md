# Global Solutions - Secure DevOps Tools & Cloud Computing - BusLight

> *Luz para você ir a qualquer destino.*
> Global Solution 2026.2 · CitizenTech · FIAP · Engenharia de Software · 4º ano (4ES)

Componente **Produção** do BusLight — atividade **Deploy Blindado**: o MVP no ar na AWS, empacotado em container, com infraestrutura criada por **Terraform**, pipeline **DevSecOps** que barra segredo vazado e vulnerabilidade antes de chegar ao cidadão, e observabilidade com **Prometheus e Grafana**.

---

## 👥 Integrantes

| Nome completo | RM |
|---|---|
| Aline Fernandes Zeppelini | RM97966 |
| Camilly Breitbach Ishida | RM551474 |
| Julia Leite Galvão | RM550201 |

---

## 📑 Sumário

1. [O produto](#-o-produto)
2. [Ficha Técnica do MVP](#-ficha-técnica-do-mvp)
3. [As seis perguntas do briefing](#-as-seis-perguntas-do-briefing)
4. [ODS conectados](#-ods-conectados)
5. [Arquitetura](#️-arquitetura)
6. [Container](#-container)
7. [Infraestrutura como código](#️-infraestrutura-como-código-terraform)
8. [Pipeline DevSecOps](#-pipeline-devsecops)
9. [Observabilidade](#-observabilidade)
10. [Responsabilidade compartilhada](#-responsabilidade-compartilhada)
11. [LGPD](#-lgpd--onde-ficam-os-dados-pessoais)
12. [Estimativa de custo](#-estimativa-de-custo)
13. [Atendimento aos critérios](#-atendimento-aos-critérios-da-disciplina)
14. [Estrutura do repositório](#-estrutura-do-repositório)
15. [Como reproduzir](#️-como-reproduzir)
16. [Links](#-links)

---

## 🚏 O produto

**BusLight** é um ponto de ônibus inteligente, previsível e seguro.

Na periferia de São Paulo, o trabalhador que depende do ônibus espera muito tempo no ponto, muitas vezes à noite e em lugar escuro, sem saber se o ônibus já passou ou se vai demorar. O BusLight mostra quando o ônibus realmente chega e avisa a hora certa de sair de casa, reduzindo o tempo em que a pessoa fica exposta no ponto.

**Território do piloto:** os 144 pontos dos corredores **Parelheiros / Rio Bonito / Santo Amaro** e **Campo Limpo**, na zona sul, que ligam bairros como Parelheiros, Grajaú, Capão Redondo e Campo Limpo ao centro. Os dados vêm do [repositório de Dados](https://github.com/julialgalvao/GS_BigDataArchitecture-DataIntegration_BusLight) (Airflow + Databricks).

**Telas do MVP**

| Tela | O que mostra | Dado |
|---|---|---|
| **Mapa de pontos** | Pontos da região coloridos pela espera média | Ouro: `vw_mvp_mapa_pontos` |
| **Chegada ao vivo** | Próximos ônibus de um ponto, em tempo real | API SPTrans Olho Vivo |
| **Linhas** | Ranking das linhas com mais atraso | Ouro: `vw_mvp_ranking_linhas` |
| **Saia de casa às...** | Horário recomendado para sair e esperar o mínimo | Ouro: `vw_mvp_saia_de_casa` |
| **Meus alertas** | Ponto favorito e telefone **mascarado** | Ouro: `dim_usuario` |

---

## 🧩 Ficha Técnica do MVP

| Campo | Conteúdo |
|---|---|
| Nome do produto | BusLight |
| Cidadão e território | Trabalhador da periferia da zona sul de São Paulo (Parelheiros, Grajaú, Capão Redondo, Campo Limpo) que depende de ônibus, principalmente quem sai cedo ou volta tarde; com atenção a mulheres, idosos e pessoas com deficiência |
| Problema, em uma frase | O passageiro espera tempo demais no ponto, sem saber quando o ônibus chega, muitas vezes à noite e em lugar inseguro |
| Proposta de valor | Saber quando o ônibus chega e a hora certa de sair de casa, para esperar o mínimo possível no ponto |
| Arquitetura: componentes | App web + API (este repositório) · Pipeline de dados · Assistente de IA generativa · Visão computacional no ponto · Robô de alertas (RPA) · Totem físico com sensores (Maker) |
| Fontes de dados | SPTrans Olho Vivo, Open-Meteo, IBGE e cadastro de usuários simulado |
| Modelos de IA utilizados | LLM local com RAG e agente (assistente do passageiro) · YOLO customizado (lotação do ponto) |
| URL do MVP e repositórios | MVP: [preencher] · Cloud: [este repositório](https://github.com/julialgalvao/GS_SecureDevOpsTools-CloudComputing_BusLight) · Dados: [GS_BigDataArchitecture-DataIntegration_BusLight](https://github.com/julialgalvao/GS_BigDataArchitecture-DataIntegration_BusLight) |
| Indicadores de impacto | Minutos de espera evitados, pontos críticos identificados, usuários noturnos atendidos |
| ODS conectados | 11, 10 e 9 |

---

## 🧭 As seis perguntas do briefing

| Pergunta | Resposta |
|---|---|
| **Quem é o cidadão beneficiado?** | O trabalhador da periferia de São Paulo que depende do ônibus, principalmente em horário noturno |
| **Qual problema será resolvido?** | A espera longa, imprevisível e insegura no ponto de ônibus |
| **Como a solução funcionará?** | Um app web acessível mostra a chegada real dos ônibus, os pontos com maior espera e a hora certa de sair de casa, com dados reais da SPTrans tratados no lakehouse |
| **Quais tecnologias serão empregadas?** | Neste componente: Python (FastAPI), Docker, Terraform, AWS (EC2, VPC, Elastic IP, SSM), GitHub Actions, Gitleaks, Semgrep, Trivy, Prometheus e Grafana |
| **Quem participará do ecossistema?** | Passageiros (usam de graça), Prefeitura e SPTrans (painel de gestão), empresas de mídia em ponto de ônibus e empresas com funcionários de turno noturno |
| **Como o impacto poderá ser medido e ampliado?** | Medido pelos minutos de espera evitados e pelo uso do app em horário noturno; ampliado replicando a infraestrutura por código (Terraform) para outras cidades |

---

## 🌍 ODS conectados

| ODS | Meta | Como o BusLight contribui |
|---|---|---|
| **11 – Cidades e comunidades sustentáveis** | 11.2 – transporte seguro e acessível | Torna o transporte público mais previsível e reduz o tempo de exposição no ponto |
| **10 – Redução das desigualdades** | 10.2 – inclusão de todos | Foca na periferia, onde a espera é maior |
| **9 – Indústria, inovação e infraestrutura** | 9.1 – infraestrutura confiável e acessível | Infraestrutura de informação em nuvem, segura e reproduzível |

---

## 🏗️ Arquitetura

```
 Desenvolvedor
      │ git push
      ▼
┌───────────────────────────── GitHub Actions ─────────────────────────────┐
│  gitleaks ─▶ semgrep ─▶ build da imagem ─▶ trivy ─▶ push (GHCR) ─▶ deploy  │
│  (segredo)   (código)                     (CVE)                   (SSM)   │
└──────────────────────────────────────────────────────────────────┬────────┘
                                                                   │
              ┌────────────────────── AWS (criada por Terraform) ──▼────────┐
              │  VPC + subnet pública                                       │
              │  ┌────────────── EC2 (Amazon Linux) ──────────────┐         │
  Cidadão ───▶│  │  docker compose                                 │         │
  (HTTP 80)   │  │   ├─ nginx (porta 80, proxy reverso)            │         │
              │  │   └─ app BusLight (FastAPI, usuário não root)   │──▶ API SPTrans
              │  │        /, /api/*, /health, /metrics              │         │
              │  └─────────────────────────────────────────────────┘         │
              │  Security Group: entrada só 80 · sem SSH (acesso via SSM)    │
              │  Elastic IP: endereço fixo do MVP                            │
              │  Instance profile: LabInstanceProfile (AWS Academy)          │
              └──────────────────────────────────────────────────────────────┘
                          ▲ scrape /metrics
              ┌───────────┴────────────┐
              │ Prometheus + Grafana   │  (local, apontando para a URL pública)
              │ dashboard + alerta     │
              └────────────────────────┘
```

**Integração com o componente de Dados:** a camada Ouro (Databricks) é exportada em JSON para `app/data/` e servida pela API. A chegada ao vivo consulta a API SPTrans pelo backend, com o token guardado como segredo (nunca no navegador).

---

## 🐳 Container

| Item | Como é feito |
|---|---|
| Imagem enxuta | `python:3.12-slim` com **multi-stage build**; só as dependências de produção |
| Usuário não root | `USER buslight` (UID 10001) |
| Sem segredo na imagem | Token da SPTrans entra só como variável de ambiente em tempo de execução; `.dockerignore` exclui `.env` |
| Healthcheck | `HEALTHCHECK` chamando `/health` |
| Stack | `docker compose up` sobe app + nginx |

---

## ☁️ Infraestrutura como código (Terraform)

| Recurso | Função |
|---|---|
| `aws_vpc`, `aws_subnet`, `aws_internet_gateway`, `aws_route_table` | Rede própria do BusLight |
| `aws_security_group` | Entrada **apenas na porta 80**; nenhuma porta administrativa aberta |
| `aws_instance` | EC2 que roda a stack com Docker (instalado via `user_data`), com o perfil `LabInstanceProfile` para acesso via **SSM Session Manager**, sem SSH |
| `aws_eip` | Elastic IP: o endereço do MVP não muda quando a instância é parada e ligada de novo |
| `output` | IP/URL pública do MVP e ID da instância |

**Boas práticas exigidas:**
- `terraform.tfstate` e `*.tfvars` **fora do repositório** (no `.gitignore`).
- Porta 22 **nunca** aberta para `0.0.0.0/0` — não há SSH; a administração é pelo SSM.
- Região, tipo de instância e tags em variáveis (`variables.tf`), com exemplo em `terraform.tfvars.example`.

> **Conta AWS Academy (Learner Lab):** o laboratório não permite criar IAM Roles, por isso a instância usa o perfil já existente `LabInstanceProfile`. As credenciais do lab são temporárias e a instância é desligada quando a sessão termina; o Elastic IP mantém a mesma URL e o `user_data`/`restart: always` sobe o app sozinho quando a máquina liga de novo.

---

## 🔐 Pipeline DevSecOps

Workflow em [`.github/workflows/devsecops.yml`](.github/workflows/devsecops.yml), executado **a cada push**.

| Etapa | Ferramenta | Barra o pipeline quando |
|---|---|---|
| 1. Segredos | **Gitleaks** | Encontra token, chave ou senha no código ou no histórico |
| 2. Código (SAST) | **Semgrep** | Encontra padrão de código vulnerável |
| 3. Build | Docker Buildx | A imagem não compila |
| 4. Imagem | **Trivy** | Encontra vulnerabilidade `CRITICAL` na imagem |
| 5. Publicação | GHCR | — |
| 6. Deploy automático | AWS SSM `send-command` | — (só roda se todas as etapas passarem) |

**Segredos do pipeline** em **GitHub Secrets**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (credenciais temporárias do AWS Academy, renovadas a cada sessão do lab), `AWS_REGION`, `EC2_INSTANCE_ID`, `SPTRANS_TOKEN`.

**Execução barrada e corrigida (evidência):**
1. Um commit com um token falso da SPTrans no código → **Gitleaks barra** o pipeline.
2. O token é removido e passa a vir do GitHub Secrets → pipeline **verde** e deploy realizado.

---

## 📈 Observabilidade

Prometheus e Grafana rodam localmente (`monitoring/docker-compose.yml`), coletando `/metrics` da URL pública do MVP.

**As 4 métricas de ouro**

| Métrica | Medida no BusLight | Consulta (PromQL) |
|---|---|---|
| **Latência** | Tempo de resposta da API (p95) | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` |
| **Tráfego** | Requisições por segundo | `sum(rate(http_requests_total[5m]))` |
| **Erros** | % de respostas 5xx | `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))` |
| **Saturação** | CPU e memória do processo | `rate(process_cpu_seconds_total[5m])`, `process_resident_memory_bytes` |

**Alertas**

| Alerta | Condição | Como é demonstrado |
|---|---|---|
| `BusLightFora` | `up == 0` por 1 minuto | Parar o container do app e ver o alerta disparar |
| `BusLightErrosAltos` | Taxa de 5xx acima de 5% por 2 minutos | Simular falha da API SPTrans |

---

## 🤝 Responsabilidade compartilhada

| Responsabilidade da AWS | Responsabilidade da equipe BusLight |
|---|---|
| Data centers, hardware e rede física | Sistema operacional da EC2 e suas atualizações |
| Hipervisor e isolamento entre clientes | Docker, imagens e dependências (verificadas pelo Trivy) |
| Disponibilidade da região e das zonas | Security Group, portas abertas e IAM |
| Segurança física das instalações | Código da aplicação (verificado pelo Semgrep) |
| | Segredos e credenciais (verificados pelo Gitleaks, guardados em Secrets) |
| | Dados dos usuários e conformidade com a LGPD |

---

## 🔒 LGPD — onde ficam os dados pessoais

| Dado | Onde fica | Proteção |
|---|---|---|
| Telefone para alerta (simulado) | Camada Ouro do Databricks (`dim_usuario`) | Hash SHA-256 + versão mascarada; o app só recebe e exibe `(11) *****-1234` |
| Localização do usuário | Usada no navegador na hora | **Não é armazenada** nem enviada para logs |
| Logs e métricas | EC2 e Prometheus | Sem dados pessoais; só rota, status e tempo |
| Credenciais | GitHub Secrets e variável de ambiente na EC2 | Nunca no código nem na imagem |

---

## 💰 Estimativa de custo

Estimativa mensal (região `us-east-1`, uso 24h por dia). Valores de referência; conferir na [AWS Pricing Calculator](https://calculator.aws/).

| Recurso | Especificação | Custo mensal estimado |
|---|---|---|
| EC2 | `t3.micro` (2 vCPU, 1 GB) | ~ US$ 7,60 |
| EBS | 8 GB gp3 | ~ US$ 0,64 |
| Elastic IP / IPv4 público | 1 endereço | ~ US$ 3,65 |
| Transferência de dados | baixo volume (até 100 GB/mês gratuitos) | ~ US$ 0,00 |
| GitHub Actions, GHCR | repositório público | US$ 0,00 |
| Prometheus e Grafana | locais | US$ 0,00 |
| **Total** | | **~ US$ 12/mês** |

> Neste projeto o custo é descontado do crédito do **AWS Academy Learner Lab**, e a instância só fica ligada durante as sessões do laboratório, o que reduz o valor real. Em uma conta própria, o nível gratuito da AWS cobriria a instância no primeiro ano.

---

## ✅ Atendimento aos critérios da disciplina

| Critério (pontos) | Onde está |
|---|---|
| **Container (2,0)** – Dockerfile enxuto, não root, sem segredo, `docker compose` | [`Dockerfile`](Dockerfile), [`docker-compose.yml`](docker-compose.yml) |
| **IaC (3,0)** – Terraform, state e `.tfvars` fora do repo, porta admin fechada | [`infra/`](infra/), [`.gitignore`](.gitignore) |
| **Pipeline (4,0)** – build, Gitleaks, Semgrep, Trivy, Secrets, deploy, execução barrada e corrigida | [`.github/workflows/devsecops.yml`](.github/workflows/devsecops.yml) + prints no PDF |
| **Observabilidade (3,0)** – 4 métricas de ouro e um alerta disparado | [`monitoring/`](monitoring/) + prints no PDF |
| **Documentação (2,0)** – diagrama, responsabilidade compartilhada, LGPD, custo, README reproduzível | Este arquivo |

---

## 📁 Estrutura do repositório

```
├── app/
│   ├── main.py                    # API FastAPI + páginas
│   ├── sptrans.py                 # cliente da API Olho Vivo
│   ├── static/                    # front-end acessível
│   ├── data/                      # exportação JSON da camada Ouro
│   └── requirements.txt
├── infra/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── user_data.sh
│   └── terraform.tfvars.example
├── monitoring/
│   ├── docker-compose.yml
│   ├── prometheus.yml
│   ├── alert.rules.yml
│   └── grafana/                   # dashboard das 4 métricas de ouro
├── nginx/
│   └── default.conf
├── .github/workflows/devsecops.yml
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── .env.example
├── docs/                          # diagramas e evidências
└── README.md
```

---

## ▶️ Como reproduzir

### Pré-requisitos
- Docker Desktop, Terraform 1.6+ e AWS CLI
- Acesso ao **AWS Academy Learner Lab** (ou outra conta AWS): em **AWS Details**, copie as credenciais para `~/.aws/credentials`
- Token gratuito da [API Olho Vivo da SPTrans](https://www.sptrans.com.br/desenvolvedores/)

### 1. Rodar localmente
```bash
git clone https://github.com/julialgalvao/GS_SecureDevOpsTools-CloudComputing_BusLight.git
cd GS_SecureDevOpsTools-CloudComputing_BusLight
cp .env.example .env        # preencha SPTRANS_TOKEN
docker compose up --build
```
Acesse `http://localhost`.

### 2. Criar a infraestrutura
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```
O `output` mostra a URL pública do MVP.

### 3. Publicar pelo pipeline
1. Cadastre os segredos em **Settings → Secrets and variables → Actions** (no Learner Lab, atualize `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` e `AWS_SESSION_TOKEN` a cada nova sessão).
2. Faça um `git push` na branch `main`: o pipeline roda as verificações e publica automaticamente.

### 4. Monitorar
```bash
cd monitoring
docker compose up
```
Prometheus em `http://localhost:9090`, Grafana em `http://localhost:3000`.

---

## 🔗 Links

| Item | Link |
|---|---|
| MVP (URL pública) | [preencher] |
| Repositório de Dados | [GS_BigDataArchitecture-DataIntegration_BusLight](https://github.com/julialgalvao/GS_BigDataArchitecture-DataIntegration_BusLight) |
| Relatório PDF | [preencher] |
