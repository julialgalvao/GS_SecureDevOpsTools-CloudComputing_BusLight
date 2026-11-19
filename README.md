# Global Solutions - Secure DevOps Tools & Cloud Computing - BusLight

> *Luz para você ir a qualquer destino.*
> Global Solution 2026.2 · CitizenTech · FIAP · Engenharia de Software · 4º ano (4ES)

**MVP no ar:** [http://buslight-gs.northcentralus.cloudapp.azure.com](http://buslight-gs.northcentralus.cloudapp.azure.com)

Componente **Produção** do BusLight — atividade **Deploy Blindado**: o MVP no ar no **Microsoft Azure**, empacotado em container, com infraestrutura criada por **Terraform**, pipeline **DevSecOps** que barra segredo vazado e vulnerabilidade antes de chegar ao cidadão, e observabilidade com **Prometheus e Grafana**.

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
| **Conheça-nos** | O que o app faz e o que cada disciplina construiu: visão computacional (detecção e rastreio de pessoas e ônibus no ponto), automação de alertas, robô físico, dados e nuvem, ODS, perguntas frequentes e equipe. Tem um **assistente** na lateral, que responde com os dados do app | Conteúdo do app + material da equipe (automação: [linesiscl/GS-BusLight](https://github.com/linesiscl/GS-BusLight)) |
| **Integração nas outras abas** | Chegada ao vivo: quantos ônibus são acessíveis. Meus alertas: simulação do robô, com a luz verde, amarela ou vermelha conforme a espera | Dados do próprio app |

---

## 🧩 Ficha Técnica do MVP

| Campo | Conteúdo |
|---|---|
| Nome do produto | BusLight |
| Cidadão e território | Trabalhador da periferia da zona sul de São Paulo (Parelheiros, Grajaú, Capão Redondo, Campo Limpo) que depende de ônibus, principalmente quem sai cedo ou volta tarde; com atenção a mulheres, idosos e pessoas com deficiência |
| Problema, em uma frase | O passageiro espera tempo demais no ponto, sem saber quando o ônibus chega, muitas vezes à noite e em lugar inseguro |
| Proposta de valor | Saber quando o ônibus chega e a hora certa de sair de casa, para esperar o mínimo possível no ponto |
| Arquitetura: componentes | App web + API (este repositório) · Pipeline de dados (repositório de Dados). Demais componentes da GS, entregues nas outras disciplinas da equipe: visão computacional no ponto e automação de alertas com robô físico (RPA). O assistente de IA generativa é uma proposta de evolução |
| Fontes de dados | SPTrans Olho Vivo, Open-Meteo, IBGE e cadastro de usuários simulado |
| Modelos de IA utilizados | Visão computacional: YOLO11n treinado para pessoas, ônibus e recursos de acessibilidade. Proposta de evolução: assistente do passageiro com LLM e RAG |
| URL do MVP e repositórios | MVP: [http://buslight-gs.northcentralus.cloudapp.azure.com](http://buslight-gs.northcentralus.cloudapp.azure.com) · Cloud: [este repositório](https://github.com/julialgalvao/GS_SecureDevOpsTools-CloudComputing_BusLight) · Dados: [GS_BigDataArchitecture-DataIntegration_BusLight](https://github.com/julialgalvao/GS_BigDataArchitecture-DataIntegration_BusLight) |
| Indicadores de impacto | Minutos de espera evitados, pontos críticos identificados, usuários noturnos atendidos |
| ODS conectados | 11, 10 e 9 |

---

## 🧭 As seis perguntas do briefing

| Pergunta | Resposta |
|---|---|
| **Quem é o cidadão beneficiado?** | O trabalhador da periferia de São Paulo que depende do ônibus, principalmente em horário noturno |
| **Qual problema será resolvido?** | A espera longa, imprevisível e insegura no ponto de ônibus |
| **Como a solução funcionará?** | Um app web acessível mostra a chegada real dos ônibus, os pontos com maior espera e a hora certa de sair de casa, com dados reais da SPTrans tratados no lakehouse |
| **Quais tecnologias serão empregadas?** | Neste componente: Python (FastAPI), Docker, Terraform, Azure (VM Linux, rede virtual, IP público estático), GitHub Actions, Gitleaks, Semgrep, Trivy, Prometheus e Grafana |
| **Quem participará do ecossistema?** | Passageiros (usam de graça), Prefeitura e SPTrans (painel de gestão), empresas de mídia em ponto de ônibus e empresas com funcionários de turno noturno |
| **Como o impacto poderá ser medido e ampliado?** | Medido pelos minutos de espera evitados e pelo uso do app em horário noturno; ampliado replicando a infraestrutura por código (Terraform) para outras cidades |

---

## 🌍 ODS conectados

| ODS | Meta | Como o BusLight contribui |
|---|---|---|
| **11 – Cidades e comunidades sustentáveis** | 11.2 – transporte seguro e acessível | Torna o transporte público mais previsível e reduz o tempo de exposição no ponto |
| **10 – Redução das desigualdades** | 10.2 – inclusão de todos | Foca na periferia, onde a espera pesa mais |
| **9 – Indústria, inovação e infraestrutura** | 9.1 – infraestrutura confiável e acessível | Infraestrutura de informação em nuvem, segura e reproduzível |

---

## 🏗️ Arquitetura

```
 Desenvolvedor
      │ git push
      ▼
┌───────────────────────────── GitHub Actions ─────────────────────────────┐
│  gitleaks ─▶ semgrep ─▶ build da imagem ─▶ trivy ─▶ push (GHCR) ─▶ deploy  │
│  (segredo)   (código)                     (CVE)                   (pull)  │
└──────────────────────────────────────────────────────────────────┬────────┘
                                                                   │
            ┌──────────────── Azure (criada por Terraform) ───────▼────────┐
            │  Resource group · rede virtual · sub-rede pública             │
            │  ┌────────────── VM Linux (Ubuntu) ───────────────┐          │
Cidadão ───▶│  │  docker compose                                 │          │
(HTTP 80)   │  │   ├─ nginx (porta 80, proxy reverso)            │          │
            │  │   ├─ app BusLight (FastAPI, usuário não root)   │──▶ API SPTrans
            │  │   └─ node-exporter (métricas da máquina)        │          │
            │  └─────────────────────────────────────────────────┘          │
            │  NSG: entrada só na porta 80 · sem SSH, sem porta admin       │
            │  IP público estático com nome DNS fixo                        │
            │  Sem identidade gerenciada · deploy por pull (timer na VM)    │
            └───────────────────────────────────────────────────────────────┘
                          ▲ scrape /metrics e /node-metrics (token)
              ┌───────────┴────────────┐
              │ Prometheus + Grafana   │  (local, apontando para a URL pública)
              │ dashboard + alerta     │
              └────────────────────────┘
```

**Integração com o componente de Dados:** a camada Ouro (Databricks) é exportada em JSON para `app/data/` pelo notebook `04_exportar_mvp` do repositório de Dados e servida pela API. A chegada ao vivo consulta a API SPTrans pelo backend, com o token guardado como segredo (nunca no navegador).

**Rotas da API**

| Rota | O que devolve |
|---|---|
| `GET /` | Site do MVP (PWA acessível) |
| `GET /api/resumo` | Pontos monitorados e espera média geral e noturna |
| `GET /api/pontos?faixa=noite` | Pontos com a espera média, do maior para o menor |
| `GET /api/pontos/{codigo}/chegada` | Próximos ônibus ao vivo (SPTrans); se a SPTrans cair, devolve `503` com a espera média histórica |
| `GET /api/saia-de-casa?ponto=&faixa=&caminhada_min=` | Antecedência recomendada e minutos evitados por linha |
| `GET /api/linhas` | Ranking das linhas com maior espera |
| `GET /api/alertas/{id}` | Alerta do usuário com o telefone **mascarado** |
| `GET /health` | Saúde do app (usada pelo healthcheck e pelo teste de fumaça do deploy) |
| `GET /metrics` | Métricas do Prometheus (protegida por token no nginx) |

---

## 🐳 Container

| Item | Como é feito |
|---|---|
| Imagem enxuta | `python:3.15-slim` com **multi-stage build**; só as dependências de produção; `.dockerignore` deixa de fora testes, infra e docs |
| Usuário não root | `USER buslight` (UID 10001, sem shell) |
| Sem segredo na imagem | Token da SPTrans entra só como variável de ambiente em tempo de execução; `.dockerignore` exclui `.env` |
| Healthcheck | `HEALTHCHECK` chamando `/health`, que também devolve o commit que gerou a imagem; o nginx só sobe depois do app saudável |
| Endurecimento | Container do app com sistema de arquivos **somente leitura**, `cap_drop: ALL` e `no-new-privileges` |
| Stack | `docker compose up` sobe app + nginx (proxy reverso com cabeçalhos de segurança, CSP e limite de requisições por IP) |

---

## ☁️ Infraestrutura como código (Terraform)

A infraestrutura de produção está em [`infra-azure/`](infra-azure/) e cria **9 recursos** com `terraform apply`:

| Recurso | Função |
|---|---|
| `azurerm_resource_group` | Agrupa tudo do BusLight; apagar o grupo apaga o custo |
| `azurerm_virtual_network` + `azurerm_subnet` | Rede própria do BusLight |
| `azurerm_network_security_group` | Entrada **apenas na porta 80**; todo o resto fica bloqueado |
| `azurerm_public_ip` | IP **estático** com nome DNS fixo (`buslight-gs.northcentralus.cloudapp.azure.com`) |
| `azurerm_network_interface` | Liga a VM à sub-rede e ao IP público |
| `azurerm_linux_virtual_machine` | VM Ubuntu que roda a stack com Docker (instalado por `custom_data`); não há SSH nem porta administrativa |
| `tls_private_key` | O Azure exige uma chave na criação da VM; ela fica só no state e a porta 22 está fechada |

**Boas práticas exigidas:**
- `terraform.tfstate` e `*.tfvars` **fora do repositório** (no `.gitignore`); o repositório só tem o `terraform.tfvars.example`.
- Porta 22 **nunca** aberta para `0.0.0.0/0`: não há SSH nem outra porta administrativa. A VM busca a versão nova sozinha, e nada entra por fora.
- Região, tamanho da VM e nome DNS em variáveis (`variables.tf`).

**Detalhes de segurança a mais:** nenhuma identidade nem credencial na VM, disco gerenciado com a criptografia em repouso padrão do Azure, tags padrão e o Terraform varrido pelo **Trivy** no pipeline (a única exceção, o site público na porta 80, está justificada no [`.trivyignore`](.trivyignore)).

**Restrições da assinatura Azure for Students que moldaram a infraestrutura**
- Uma política da assinatura só permite criar recursos em `eastus2`, `canadacentral`, `northcentralus`, `centralus` e `southcentralus`.
- Nas regiões `eastus2` e `centralus` não havia VM x86 barata disponível para a assinatura (`SkuNotAvailable`). Em `northcentralus` o tamanho `Standard_B2ats_v2` (2 vCPUs, 1 GB) está liberado, e é o usado.
- A VM tem 1 GB de memória, então o script de inicialização cria um swap de 1 GB para o primeiro `docker pull`.

**Deploy por *pull*:** como não há SSH nem acesso de entrada, um timer do systemd (`buslight-atualiza`) confere a cada minuto se há imagem nova no GHCR e atualiza o app. O pipeline publica a imagem e depois **espera o `/health` público devolver o commit dele**.

> **Alternativa em AWS:** a pasta [`infra/`](infra/) tem o mesmo ambiente em AWS (VPC, Security Group só na porta 80, EC2, Elastic IP). Ele foi testado no AWS Academy e criou os 8 recursos, mas os laboratórios do curso apagam tudo quando a sessão termina, então não servem para manter o MVP no ar durante a correção. Por isso a produção é no Azure.

---

---

## 🔐 Pipeline DevSecOps

Workflow em [`.github/workflows/devsecops.yml`](.github/workflows/devsecops.yml), executado **a cada push**.

| Etapa | Ferramenta | Barra o pipeline quando |
|---|---|---|
| 1. Segredos | **Gitleaks** | Encontra token, chave ou senha no código ou no histórico |
| 2. Código (SAST) | **Semgrep** (`p/security-audit`, `p/python`, `p/dockerfile`) | Encontra padrão de código vulnerável |
| 3. Testes | **pytest** (15 testes da API, incluindo LGPD e controle de acesso) | Algum teste falha |
| 4. Infra como código | **Trivy** (scan de configuração) | Terraform ou Dockerfile com configuração insegura `HIGH`/`CRITICAL` |
| 5. Terraform | `terraform fmt -check` e `terraform validate`, nas duas pastas de infra | Código da infra mal formatado ou inválido |
| 6. Build | Docker Buildx | A imagem não compila |
| 7. Imagem | **Trivy** | Encontra vulnerabilidade `CRITICAL` na imagem |
| 8. Publicação | GHCR (tag com o SHA do commit + `latest`) | — |
| 8b. Stack no `docker compose` | Sobe app, nginx e node-exporter, confere `/health`, o site e as métricas (401 sem token, 200 com o `METRICS_TOKEN` do GitHub Secrets) | A stack não sobe ou as métricas ficam abertas |
| 9. Deploy automático | Deploy por *pull*: a VM baixa a imagem nova do GHCR; o job espera o `/health` público devolver o commit do pipeline e roda um teste de fumaça | A VM não atualiza em 10 minutos ou o site não responde |

As etapas 1 a 5 rodam em paralelo; build, publicação e deploy só acontecem se todas passarem, e publicação/deploy só na branch `main`.

**Detalhes de segurança a mais no pipeline:** todas as GitHub Actions estão fixadas pelo **SHA do commit** (não por tag, que pode ser alterada), permissões mínimas (`contents: read`; `packages: write` só no job da imagem) e **Dependabot** semanal para dependências Python, imagem base e actions.

**Segredos e configuração do pipeline**: o `METRICS_TOKEN` fica em **GitHub Secrets** (usado no job do compose e no teste de fumaça do deploy), e o `GITHUB_TOKEN` publica a imagem no GHCR. A variável `MVP_URL` (Settings → Variables) aponta o deploy para a URL pública. Não há credencial de nuvem no GitHub. O token da SPTrans fica só na VM (`.env`, permissão 600) e o `terraform.tfvars` fica fora do Git.

**Execução barrada e corrigida (evidência):**
1. Na branch `prova/token-vazado`, um commit coloca um token falso da SPTrans direto no código → **Gitleaks barra** o pipeline e nada é publicado.
2. O commit seguinte troca o valor fixo por `os.getenv("SPTRANS_TOKEN")` (o token real fica fora do código, em variável de ambiente) → pipeline **verde**.
3. Num vazamento real, apagar o arquivo não basta: o token continua no histórico do Git, então ele é **revogado** no portal da SPTrans e um novo é gerado.

---

## 📈 Observabilidade

Prometheus e Grafana rodam localmente ou no GitHub Codespaces (`monitoring/docker-compose.yml`), coletando da URL pública do MVP:
- `/metrics` – métricas do app (FastAPI);
- `/node-metrics` – métricas da VM pelo **node-exporter** (CPU, memória e disco da máquina).

As duas rotas só respondem com o `METRICS_TOKEN`; as portas 8000 e 9100 nunca ficam expostas na internet.

**As 4 métricas de ouro**

| Métrica | Medida no BusLight | Consulta (PromQL) |
|---|---|---|
| **Latência** | Tempo de resposta da API (p50 e p95) | `histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))` |
| **Tráfego** | Requisições por segundo, por rota | `sum by (route) (rate(http_requests_total[5m]))` |
| **Erros** | % de respostas 5xx e falhas na SPTrans | `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))` |
| **Saturação** | CPU e memória do app e CPU, memória e disco da VM | `process_resident_memory_bytes`, `1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m]))` |

**Alertas** ([`alert.rules.yml`](monitoring/prometheus/alert.rules.yml))

| Alerta | Condição | Como é demonstrado |
|---|---|---|
| `BusLightFora` | `up == 0` por 1 minuto | Desalocar a VM (`az vm deallocate`) e ver o alerta disparar |
| `BusLightErrosAltos` | Taxa de 5xx acima de 5% por 2 minutos | Script `monitoring/disparar_alerta.sh`: pede a chegada ao vivo com a VM sem o token da SPTrans, o que gera respostas 503 (com o token configurado, a rota responde 200 e o alerta não dispara) |
| `BusLightLento` | p95 acima de 1 s por 5 minutos | — |
| `VMSaturada` | CPU ou memória acima de 90%, ou disco acima de 85%, por 5 minutos | — |

---

## 🤝 Responsabilidade compartilhada

O BusLight roda em uma VM, ou seja, em **IaaS**: o Azure cuida da base, e a equipe cuida de tudo que roda em cima dela.

| Responsabilidade do Azure | Responsabilidade da equipe BusLight |
|---|---|
| Data centers, hardware e rede física | Sistema operacional da VM e suas atualizações |
| Hipervisor e isolamento entre clientes | Docker, imagens e dependências (verificadas pelo Trivy) |
| Disponibilidade da região e criptografia em repouso do disco gerenciado (padrão do Azure) | Regras do NSG, portas abertas e acessos |
| Segurança física das instalações | Código da aplicação (verificado pelo Semgrep) |
| | Segredos e credenciais (verificados pelo Gitleaks, guardados em Secrets) |
| | Dados dos usuários e conformidade com a LGPD |

---

## 🔒 LGPD — onde ficam os dados pessoais

| Dado | Onde fica | Proteção |
|---|---|---|
| Telefone para alerta (simulado) | Camada Ouro do Databricks (`dim_usuario`) | Hash SHA-256 + versão mascarada; o app só recebe e exibe `(11) *****-1234` |
| Localização do usuário | Usada no navegador na hora | **Não é armazenada** nem enviada para logs |
| Logs e métricas | VM e Prometheus | Sem dados pessoais; só rota, status e tempo |
| Credenciais | GitHub Secrets e `.env` da VM (permissão 600), fora do Git (`terraform.tfvars` e `.env` da VM) | Nunca no código, na imagem nem no Terraform |

---

## 💰 Estimativa de custo

Estimativa mensal para a VM ligada 24 horas por dia na região `northcentralus`. Os valores seguem a tabela pública de preços do Azure (referência de `eastus`, em dólares) e devem ser conferidos na [calculadora de preços do Azure](https://azure.microsoft.com/pricing/calculator/).

| Recurso | Especificação | Custo mensal estimado |
|---|---|---|
| VM Linux | `Standard_B2ats_v2` (2 vCPUs, 1 GB), US$ 0,0094 por hora | ~ US$ 6,90 |
| Disco gerenciado | Standard SSD de 30 GB | ~ US$ 2,40 |
| IP público | 1 endereço estático (SKU Standard) | ~ US$ 3,65 |
| Tráfego de saída | Baixo volume (os primeiros 100 GB do mês são gratuitos) | ~ US$ 0,00 |
| GitHub Actions e GHCR | Repositório público | US$ 0,00 |
| Prometheus e Grafana | Rodam fora da nuvem | US$ 0,00 |
| **Total** | | **~ US$ 13 por mês** |

O MVP precisa ficar no ar por cerca de 2 semanas (entrega e correção), o que dá **perto de US$ 6**. O custo real medido no Azure até 19/11 foi de **R$ 3,68** (VM, disco, IP e rede, em três dias de uso). O valor sai do crédito educacional da assinatura Azure for Students, e um alerta de orçamento avisa antes de o crédito acabar. Depois da correção, `terraform destroy` apaga tudo e o custo vai a zero. Para reduzir ainda mais, dá para desalocar a VM fora do horário de uso, e o IP estático mantém o endereço.

---

---

## ✅ Atendimento aos critérios da disciplina

| Critério (pontos) | Onde está |
|---|---|
| **Container (2,0)** – Dockerfile enxuto, não root, sem segredo, `docker compose` | [`Dockerfile`](Dockerfile), [`docker-compose.yml`](docker-compose.yml) |
| **IaC (3,0)** – Terraform, state e `.tfvars` fora do repo, porta admin fechada | [`infra-azure/`](infra-azure/), [`.gitignore`](.gitignore) |
| **Pipeline (4,0)** – build, Gitleaks, Semgrep, Trivy, Secrets, deploy, execução barrada e corrigida | [`.github/workflows/devsecops.yml`](.github/workflows/devsecops.yml) + prints no PDF |
| **Observabilidade (3,0)** – 4 métricas de ouro e um alerta disparado | [`monitoring/`](monitoring/) + prints no PDF |
| **Documentação (2,0)** – diagrama, responsabilidade compartilhada, LGPD, custo, README reproduzível | Este arquivo |

**Além do que foi pedido**

| Extra | Por que importa |
|---|---|
| Testes automatizados no pipeline (15 testes: o telefone nunca sai sem máscara e o cadastro não pode ser listado trocando o id na URL — OWASP A01) | O deploy só acontece se a API funciona e respeita a LGPD |
| Trivy também no Terraform e no Dockerfile, com exceções justificadas | A infraestrutura passa pela mesma barreira de segurança que o código |
| Actions fixadas por SHA, permissões mínimas e Dependabot | Protege o próprio pipeline contra ataques de cadeia de suprimentos |
| Teste de fumaça depois do deploy, conferindo o commit que está no ar | O pipeline só fica verde se o MVP responde na URL pública com a versão certa |
| `terraform fmt` e `terraform validate` no pipeline, para Azure e AWS | A infra é checada a cada push, igual ao código |
| node-exporter na VM (pelo nginx, com token) | Saturação da máquina inteira, não só do processo do app |
| Sem SSH: em vez de restringir a porta 22 a um IP, ela nem existe; o deploy é por *pull*, sem acesso de entrada | Menos superfície de ataque |
| nginx com CSP, cabeçalhos de segurança, limite de requisições e `/metrics` protegido por token | Endurecimento da aplicação exposta na internet |
| Container somente leitura, sem capabilities, VM sem identidade e disco gerenciado com criptografia em repouso padrão | Reduz o estrago se algo for comprometido |
| Dashboard do Grafana e alertas versionados como código | Monitoramento reproduzível |
| Site acessível (contraste, teclado, leitor de tela) e offline (PWA) | Princípios "acessível de verdade" e "resiliente ao mundo real" da GS |
| Ambiente pronto no GitHub Codespaces | Qualquer avaliador reproduz tudo no navegador |
| Mesma infraestrutura também em AWS (`infra/`) | Mostra que o Terraform e a stack não prendem o projeto a uma nuvem |
| Aba **Conheça-nos** no app | Quem abre o link entende o que o produto faz, para quem e por quê |

---

## 📁 Estrutura do repositório

```
├── app/
│   ├── main.py                    # API FastAPI + site
│   ├── sptrans.py                 # cliente da API Olho Vivo (chegada ao vivo, cache de 30 s)
│   ├── metricas.py                # métricas de ouro para o Prometheus
│   ├── static/                    # front-end acessível (PWA, funciona offline) + Leaflet
│   ├── data/                      # exportação JSON da camada Ouro (repositório de Dados)
│   └── requirements.txt
├── tests/test_app.py              # 15 testes da API (rodam no pipeline)
├── infra-azure/                   # produção: Terraform do Azure
│   ├── versions.tf                # providers azurerm e tls
│   ├── main.tf                    # resource group, rede, NSG, IP estático, NIC e VM
│   ├── variables.tf               # região, tamanho da VM, nome DNS, token de métricas
│   ├── outputs.tf                 # URL do MVP, IP e nome da VM
│   ├── user_data.sh.tftpl         # instala Docker, sobe a stack e cria o timer de atualização
│   └── terraform.tfvars.example
├── infra/                         # alternativa: o mesmo ambiente em AWS (VPC, EC2, Elastic IP)
├── monitoring/
│   ├── docker-compose.yml         # Prometheus + Grafana
│   ├── iniciar.sh                 # gera o alvo e o token e sobe o monitoramento (Docker)
│   ├── iniciar_local.sh           # o mesmo, sem Docker (Homebrew: prometheus e grafana)
│   ├── disparar_alerta.sh         # gera respostas 503 para disparar o alerta BusLightErrosAltos
│   ├── prometheus/                # prometheus.yml e alert.rules.yml
│   └── grafana/                   # datasource e dashboard das 4 métricas de ouro (como código)
├── nginx/default.conf.template    # proxy reverso, cabeçalhos de segurança, /metrics com token
├── .github/
│   ├── workflows/devsecops.yml    # pipeline DevSecOps
│   └── dependabot.yml
├── .devcontainer/                 # ambiente do GitHub Codespaces (Docker, Terraform, Azure CLI, AWS CLI)
├── Dockerfile
├── docker-compose.yml
├── .dockerignore · .gitignore · .trivyignore · .semgrepignore · .env.example
└── README.md
```

---

## ▶️ Como reproduzir

Todo o fluxo funciona no navegador pelo **GitHub Codespaces** (**Code → Codespaces → Create codespace**) ou em qualquer máquina com Docker, Terraform 1.6+ e Azure CLI.

### Pré-requisitos
- Uma assinatura do **Azure** (por exemplo, **Azure for Students**)
- Token gratuito da [API Olho Vivo da SPTrans](https://www.sptrans.com.br/desenvolvedores/)

### 1. Rodar localmente
```bash
cp .env.example .env        # preencha SPTRANS_TOKEN e METRICS_TOKEN (openssl rand -hex 24)
docker compose up --build
pytest                      # testes da API
```
Acesse `http://localhost:8080` (no Codespaces, pela aba **Ports**).

### 2. Criar a infraestrutura
```bash
az login
cd infra-azure
cp terraform.tfvars.example terraform.tfvars   # preencha subscription_id, metrics_token e (opcional) sptrans_token
terraform init
terraform plan
terraform apply
```
O `output` mostra a URL pública do MVP. Se o Azure recusar a região ou o tamanho da VM, escolha uma região permitida pela política da assinatura e um tamanho liberado (`az vm list-skus -l <regiao> --size Standard_B --resource-type virtualMachines`). Se o provedor reclamar de "subnet not found", rode `terraform apply` de novo.

### 3. Publicar pelo pipeline
1. Em **Settings → Secrets and variables → Actions**, cadastre o Secret `METRICS_TOKEN` (o mesmo do `terraform.tfvars`) e a Variable `MVP_URL` (a `url_mvp` do Terraform). Não há credencial de nuvem no GitHub.
2. Faça um `git push` na branch `main`: o pipeline roda as verificações, publica a imagem e espera a VM atualizar.
3. Na primeira publicação, deixe o pacote da imagem público em **Packages → gs_securedevopstools-cloudcomputing_buslight → Package settings → Change visibility**, para a VM conseguir baixá-la.

### 4. Monitorar
Com Docker (ou no Codespaces):
```bash
cd monitoring
MVP_HOST=buslight-gs.northcentralus.cloudapp.azure.com METRICS_TOKEN=<mesmo-token-do-secret> ./iniciar.sh
```
Prometheus em `http://localhost:9090` (aba **Alerts**) e Grafana em `http://localhost:3000` (usuário `admin`, senha gerada no `monitoring/.env`), dashboard **BusLight – 4 métricas de ouro**.

Sem Docker (por exemplo, no Mac): `brew install prometheus grafana` e depois `MVP_HOST=... METRICS_TOKEN=... ./iniciar_local.sh` (para parar, `./iniciar_local.sh parar`).

**Para disparar os alertas:**
- `BusLightErrosAltos`: `MVP_URL=http://buslight-gs.northcentralus.cloudapp.azure.com ./disparar_alerta.sh`, que gera respostas `503` por 4 minutos sem derrubar o site. Só funciona com a VM **sem** o token da SPTrans; com o token configurado, use outra falha (por exemplo, parar o app).

**Ligar a Chegada ao vivo sem recriar a VM:** o token da SPTrans não vai no Terraform nem no repositório. Leia o valor em uma variável do terminal e envie pelo Azure, que grava no `.env` da VM e reinicia os containers:
```bash
read -s "T?Token da SPTrans: "; echo
az vm run-command invoke -g rg-buslight -n vm-buslight --command-id RunShellScript \
  --scripts 'cd /opt/buslight && sed -i "s/^SPTRANS_TOKEN=.*/SPTRANS_TOKEN=$1/" .env && docker compose up -d --force-recreate && docker compose ps' \
  --parameters "$T" --query "value[0].message" -o tsv; unset T
```
- `BusLightFora`: `az vm deallocate -g rg-buslight -n vm-buslight`, esperar 1 minuto e religar com `az vm start`. O IP estático mantém a URL.

### 5. Encerrar
```bash
cd infra-azure && terraform destroy
```

---

## 🔗 Links

| Item | Link |
|---|---|
| MVP (URL pública) | [http://buslight-gs.northcentralus.cloudapp.azure.com](http://buslight-gs.northcentralus.cloudapp.azure.com) |
| Repositório de Dados | [GS_BigDataArchitecture-DataIntegration_BusLight](https://github.com/julialgalvao/GS_BigDataArchitecture-DataIntegration_BusLight) |
| Relatório PDF | Enviado no Teams da disciplina, com o link deste repositório |
