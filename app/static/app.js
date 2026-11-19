// BusLight - front-end
// Todo texto vindo da API entra com textContent (nunca innerHTML) para evitar XSS.

const FAIXAS = { madrugada: "Madrugada", manha: "Manhã", tarde: "Tarde", noite: "Noite" };
let pontos = [];
let mapa;
let camadaPontos;

function el(tag, texto, classe) {
  const e = document.createElement(tag);
  if (texto !== undefined && texto !== null) e.textContent = texto;
  if (classe) e.className = classe;
  return e;
}

function limpar(alvo) {
  while (alvo.firstChild) alvo.removeChild(alvo.firstChild);
}

async function api(caminho) {
  const resp = await fetch(caminho, { headers: { Accept: "application/json" } });
  const dados = await resp.json().catch(() => ({}));
  return { ok: resp.ok, status: resp.status, dados };
}

function corDaEspera(min) {
  if (min > 15) return "#B3261E";
  if (min > 8) return "#B85C00";
  return "#1E7B3A";
}

function paraMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function paraHora(minutos) {
  const total = (minutos + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ---------------------------------------------------------------- abas
function configurarAbas() {
  const abas = [...document.querySelectorAll('[role="tab"]')];
  function ativar(aba) {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute("aria-selected", String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      document.getElementById(a.getAttribute("aria-controls")).hidden = !ativa;
    });
    aba.focus();
    if (aba.id === "aba-mapa" && mapa) mapa.invalidateSize();
    const ass = document.getElementById("assistente");
    if (ass) ass.hidden = aba.id !== "aba-sobre";
  }
  // botões da aba Conheça-nos que levam para outra aba
  document.querySelectorAll(".ir-aba").forEach((b) => {
    b.addEventListener("click", () => {
      ativar(document.getElementById(b.dataset.aba));
      const secao = b.dataset.alvo && document.getElementById(b.dataset.alvo);
      if (secao) secao.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  abas.forEach((aba, i) => {
    aba.addEventListener("click", () => ativar(aba));
    aba.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowRight") ativar(abas[(i + 1) % abas.length]);
      if (ev.key === "ArrowLeft") ativar(abas[(i - 1 + abas.length) % abas.length]);
    });
  });
}

// célula com selo colorido pela espera (verde, laranja, vermelho)
function selo(minutos) {
  const td = el("td");
  const cor = minutos <= 8 ? "ok" : minutos <= 15 ? "medio" : "alto";
  td.append(el("span", `${minutos} min`, `selo-espera ${cor}`));
  return td;
}

// ---------------------------------------------------------------- resumo
async function carregarResumo() {
  const { ok, dados } = await api("/api/resumo");
  const alvo = document.getElementById("resumo");
  if (!ok) {
    alvo.textContent = "Não foi possível carregar o resumo.";
    return;
  }
  const noite = dados.espera_media_noite_min ? ` · à noite: ${dados.espera_media_noite_min} min` : "";
  alvo.textContent = `${dados.pontos} pontos monitorados · espera média de ${dados.espera_media_min} min${noite}`;
  document.getElementById("n-pontos").textContent = dados.pontos;
  document.getElementById("n-espera").textContent = dados.espera_media_min;
  document.getElementById("n-noite").textContent = dados.espera_media_noite_min ?? "–";
  document.getElementById("n-coletas").textContent = dados.coletas ?? "–";
  document.getElementById("sobre-pontos").textContent = dados.pontos;
  document.getElementById("sobre-espera").textContent = dados.espera_media_min;
  document.getElementById("sobre-noite").textContent = dados.espera_media_noite_min ?? "–";
  document.getElementById("sobre-coletas").textContent = dados.coletas ?? "–";
}

// ---------------------------------------------------------------- mapa
async function carregarMapa(faixa) {
  const { ok, dados } = await api(`/api/pontos${faixa ? `?faixa=${faixa}` : ""}`);
  if (!ok) return;

  if (!mapa) {
    mapa = L.map("mapa", { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap",
    }).addTo(mapa);
    camadaPontos = L.layerGroup().addTo(mapa);
  }
  camadaPontos.clearLayers();
  const limites = [];
  dados.forEach((p) => {
    limites.push([p.latitude, p.longitude]);
    L.circleMarker([p.latitude, p.longitude], {
      radius: 7,
      color: "#FFFFFF",
      weight: 1,
      fillColor: corDaEspera(p.espera_media_min),
      fillOpacity: 0.9,
    })
      .bindTooltip(`${p.nome} – ${p.espera_media_min} min`)
      .addTo(camadaPontos);
  });
  if (limites.length) mapa.fitBounds(limites, { padding: [20, 20] });

  const tabela = document.getElementById("tabela-pontos");
  limpar(tabela);
  dados.slice(0, 10).forEach((p) => {
    const tr = el("tr");
    tr.append(el("td", p.nome), el("td", p.regiao.replace("Corredor ", "")), selo(p.espera_media_min));
    tabela.append(tr);
  });
}

// ---------------------------------------------------------------- listas de pontos
async function carregarPontos() {
  const { ok, dados } = await api("/api/pontos");
  if (!ok) return;
  pontos = dados.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  document.querySelectorAll(".lista-pontos").forEach((select) => {
    pontos.forEach((p) => {
      const op = el("option", `${p.nome} (${p.regiao.replace("Corredor ", "").split(" /")[0]})`);
      op.value = p.codigo_parada;
      select.append(op);
    });
  });
}

// ---------------------------------------------------------------- chegada ao vivo
async function mostrarChegada(ev) {
  ev.preventDefault();
  const codigo = document.getElementById("ponto-chegada").value;
  const alvo = document.getElementById("resultado-chegada");
  limpar(alvo);
  alvo.append(el("p", "Consultando a SPTrans..."));

  const { ok, dados } = await api(`/api/pontos/${codigo}/chegada`);
  limpar(alvo);
  const cartao = el("div", null, ok ? "cartao" : "cartao erro");
  if (!ok) {
    cartao.append(el("p", "A previsão ao vivo está indisponível agora."));
    if (dados.espera_media_min) cartao.append(el("p", `Neste ponto, a espera média costuma ser de ${dados.espera_media_min} min.`));
    alvo.append(cartao);
    return;
  }
  cartao.append(el("p", `${dados.ponto} · consulta às ${dados.hora_consulta}`));
  if (!dados.chegadas.length) {
    cartao.append(el("p", "Nenhum ônibus previsto para os próximos minutos."));
  } else {
    const lista = el("ul");
    dados.chegadas.forEach((c) => {
      const acessivel = c.acessivel ? " · acessível" : "";
      lista.append(el("li", `${c.horario} – ${c.linha} (${c.destino})${acessivel}`));
    });
    cartao.append(lista);
    const acess = dados.chegadas.filter((c) => c.acessivel).length;
    cartao.append(el("p", `${acess} de ${dados.chegadas.length} ônibus previstos são acessíveis.`, "acessiveis"));
  }
  alvo.append(cartao);
}

// ---------------------------------------------------------------- saia de casa
async function calcularSaida(ev) {
  ev.preventDefault();
  const ponto = document.getElementById("ponto-saia").value;
  const faixa = document.getElementById("faixa-saia").value;
  const caminhada = Number(document.getElementById("caminhada").value || 0);
  const alvo = document.getElementById("resultado-saia");
  limpar(alvo);

  const { ok, dados } = await api(`/api/saia-de-casa?ponto=${ponto}&faixa=${faixa}&caminhada_min=${caminhada}`);
  const cartao = el("div", null, ok ? "cartao" : "cartao erro");
  if (!ok) {
    cartao.append(el("p", dados.detail || "Sem dados para esse ponto nesse horário."));
    alvo.append(cartao);
    return;
  }

  // com a previsão ao vivo, dá para dizer o horário exato de sair
  const aoVivo = await api(`/api/pontos/${ponto}/chegada`);
  if (aoVivo.ok && aoVivo.dados.chegadas.length) {
    const agora = paraMinutos(aoVivo.dados.hora_consulta);
    const proximo = aoVivo.dados.chegadas.find((c) => paraMinutos(c.horario) - agora >= dados.antecedencia_recomendada_min);
    if (proximo) {
      const saida = paraMinutos(proximo.horario) - dados.antecedencia_recomendada_min;
      cartao.append(el("p", `Saia de casa às ${paraHora(saida)}`, "destaque"));
      cartao.append(el("p", `para pegar o ${proximo.linha} das ${proximo.horario}, chegando 2 min antes.`));
    }
  } else {
    cartao.append(el("p", `Saia ${dados.antecedencia_recomendada_min} min antes do horário do ônibus`, "destaque"));
  }

  const melhor = dados.linhas[0];
  cartao.append(el("p", `Sem o aviso, quem chega sem saber o horário espera em média ${melhor.espera_sem_aviso_min} min pela linha ${melhor.linha} à ${FAIXAS[faixa].toLowerCase()}. Com o aviso, são ${melhor.espera_com_aviso_min} min.`));
  alvo.append(cartao);

  const tabela = el("table");
  const cab = el("tr");
  ["Linha", "Espera sem aviso", "Minutos evitados"].forEach((t) => {
    const th = el("th", t);
    th.scope = "col";
    cab.append(th);
  });
  const thead = el("thead");
  thead.append(cab);
  const corpo = el("tbody");
  dados.linhas.slice(0, 8).forEach((l) => {
    const tr = el("tr");
    tr.append(el("td", l.linha), el("td", `${l.espera_sem_aviso_min} min`), el("td", `${l.minutos_evitados} min`));
    corpo.append(tr);
  });
  tabela.append(thead, corpo);
  alvo.append(tabela);
}

// ---------------------------------------------------------------- linhas
async function carregarLinhas() {
  const { ok, dados } = await api("/api/linhas?limite=15");
  if (!ok) return;
  const tabela = document.getElementById("tabela-linhas");
  dados.forEach((l) => {
    const tr = el("tr");
    tr.append(
      el("td", l.posicao),
      el("td", l.letreiro),
      el("td", `${l.terminal_principal} / ${l.terminal_secundario}`),
      selo(l.espera_media_min),
      el("td", `${l.atraso_medio_min} min`),
    );
    tabela.append(tr);
  });
}

// ---------------------------------------------------------------- alertas
async function carregarAlertas() {
  const { ok, dados } = await api("/api/alertas");
  if (!ok) return;
  const select = document.getElementById("usuario");
  dados.forEach((u) => {
    const op = el("option", `${u.sk_usuario} · ${u.telefone_mascarado}`);
    op.value = u.sk_usuario;
    select.append(op);
  });
  select.addEventListener("change", () => mostrarAlerta(select.value));
  if (dados.length) mostrarAlerta(dados[0].sk_usuario);
}

function simularRobo(minutos) {
  // mesma régua de cores do mapa; é uma simulação com os dados do app, não o robô físico
  const nivel = minutos > 15 ? "alta" : minutos > 8 ? "media" : "ok";
  const frase = {
    ok: "Espera dentro do normal: o robô mostraria a luz verde.",
    media: "Espera acima do ideal: o robô mostraria a luz amarela.",
    alta: "Espera longa: o robô mostraria a luz vermelha e sinalizaria o alerta.",
  }[nivel];
  const caixa = el("div", null, "robo-sim");
  const luz = el("span", null, `luz ${nivel}`);
  luz.setAttribute("aria-hidden", "true");
  const texto = el("div");
  texto.append(
    el("p", "Simulação do robô de alertas", "robo-titulo"),
    el("p", frase),
    el("p", "É uma simulação com os dados do app. O robô físico lê os alertas gerados pela automação da equipe.", "robo-nota"),
  );
  caixa.append(luz, texto);
  return caixa;
}

async function mostrarAlerta(id) {
  const { ok, dados } = await api(`/api/alertas/${encodeURIComponent(id)}`);
  const alvo = document.getElementById("resultado-alerta");
  limpar(alvo);
  if (!ok) return;
  const cartao = el("div", null, "cartao");
  cartao.append(
    el("p", `Telefone: ${dados.telefone_mascarado}`),
    el("p", `Ponto favorito: ${dados.ponto_favorito || "—"}`),
    el("p", `Horário do alerta: ${FAIXAS[dados.faixa_horaria_preferida] || dados.faixa_horaria_preferida}`),
  );
  if (dados.espera_media_min) cartao.append(el("p", `Espera média nesse horário: ${dados.espera_media_min} min`));
  alvo.append(cartao);
  if (dados.espera_media_min) alvo.append(simularRobo(dados.espera_media_min));
}

// ---------------------------------------------------------------- offline
function configurarOffline() {
  const status = document.getElementById("status-rede");
  const atualizar = () => {
    status.textContent = navigator.onLine ? "" : "Sem internet: mostrando os últimos dados salvos.";
  };
  window.addEventListener("online", atualizar);
  window.addEventListener("offline", atualizar);
  atualizar();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
}

// ---------------------------------------------------------------- assistente do BusLight
// Responde com regras e com os dados do app. Não usa modelo de linguagem.
const PERGUNTAS = [
  { id: "noite", rotulo: "Qual ponto tem mais espera à noite?" },
  { id: "linhas", rotulo: "Quais linhas mais atrasam?" },
  { id: "sair", rotulo: "A que horas devo sair de casa?" },
  { id: "espera", rotulo: "O que é espera média?" },
  { id: "robo", rotulo: "Como o robô avisa?" },
  { id: "visao", rotulo: "O que a visão computacional faz?" },
  { id: "local", rotulo: "O app guarda minha localização?" },
];

const PALAVRAS = [
  ["noite", ["noite", "noturn", "mais espera", "pior ponto"]],
  ["linhas", ["linha", "atras"]],
  ["sair", ["sair", "saio", "casa", "horas"]],
  ["espera", ["média", "media", "significa"]],
  ["robo", ["robô", "robo", "alerta", "luz"]],
  ["visao", ["visão", "visao", "câmera", "camera", "yolo", "lotação", "lotacao"]],
  ["local", ["local", "privacidade", "lgpd", "telefone"]],
];

function mensagem(texto, quem) {
  const conversa = document.getElementById("assistente-conversa");
  const m = el("div", texto, `msg ${quem}`);
  conversa.append(m);
  conversa.scrollTop = conversa.scrollHeight;
  return m;
}

async function responder(id) {
  if (id === "noite") {
    const { ok, dados } = await api("/api/pontos?faixa=noite");
    if (!ok || !dados.length) return mensagem("Não consegui buscar os pontos agora.", "bot");
    const top = dados.slice(0, 3).map((p) => `${p.nome} (${p.espera_media_min} min)`).join("; ");
    return mensagem(`À noite, os pontos com mais espera são: ${top}.`, "bot");
  }
  if (id === "linhas") {
    const { ok, dados } = await api("/api/linhas?limite=3");
    if (!ok || !dados.length) return mensagem("Não consegui buscar as linhas agora.", "bot");
    const top = dados.map((l) => `${l.letreiro} (${l.espera_media_min} min)`).join("; ");
    return mensagem(`As linhas com maior espera média são: ${top}.`, "bot");
  }
  if (id === "sair") {
    const m = mensagem("Escolha o ponto e eu calculo, considerando 5 minutos de caminhada e o horário da noite.", "bot");
    const select = el("select");
    select.setAttribute("aria-label", "Ponto");
    pontos.slice(0, 200).forEach((p) => {
      const op = el("option", p.nome);
      op.value = p.codigo_parada;
      select.append(op);
    });
    const botao = el("button", "Calcular");
    botao.type = "button";
    botao.addEventListener("click", async () => {
      const r = await api(`/api/saia-de-casa?ponto=${select.value}&faixa=noite&caminhada_min=5`);
      if (!r.ok) return mensagem("Esse ponto não tem dados à noite. Tente outro.", "bot");
      const melhor = r.dados.linhas[0];
      mensagem(`Saia ${r.dados.antecedencia_recomendada_min} min antes do horário do ônibus. Sem o aviso, quem chega sem saber espera ${melhor.espera_sem_aviso_min} min pela linha ${melhor.linha}; com o aviso, ${melhor.espera_com_aviso_min} min.`, "bot");
    });
    m.append(el("br"), select, el("br"), botao);
    return m;
  }
  const fixas = {
    espera: "É o tempo, em minutos, entre a chegada de um ônibus de uma linha e o próximo, no ponto e no horário escolhidos, calculado com as coletas que fizemos.",
    robo: "Uma automação compara a espera prevista com o limite de cada linha (espera normal mais um excedente) e registra um alerta. O robô físico lê os alertas e sinaliza com luzes e movimentos. Veja a simulação na aba Meus alertas.",
    visao: "Um modelo (YOLO11n) foi treinado para reconhecer pessoas, ônibus, cadeiras de rodas, muletas e bengalas em imagens de pontos de ônibus, para estimar a lotação e apoiar a acessibilidade. Os resultados estão nesta página.",
    local: "Não. A localização, quando usada, serve só naquele momento e não é gravada. O telefone do alerta é guardado protegido e aparece mascarado.",
  };
  return mensagem(fixas[id], "bot");
}

function configurarAssistente() {
  const raiz = document.getElementById("assistente");
  if (!raiz) return;
  const caixa = document.getElementById("assistente-caixa");
  const abrir = document.getElementById("assistente-abrir");
  const fechar = document.getElementById("assistente-fechar");
  const botoes = document.getElementById("assistente-perguntas");
  const form = document.getElementById("assistente-form");
  const campo = document.getElementById("assistente-texto");

  function alternar(abrirCaixa) {
    caixa.hidden = !abrirCaixa;
    abrir.setAttribute("aria-expanded", String(abrirCaixa));
    if (abrirCaixa && !document.getElementById("assistente-conversa").children.length) {
      mensagem("Oi! Eu sou o assistente do BusLight. Respondo com os dados deste app. Escolha uma pergunta ou escreva a sua.", "bot");
    }
    if (abrirCaixa) campo.focus();
  }
  abrir.addEventListener("click", () => alternar(caixa.hidden));
  document.querySelectorAll("[data-abrir-assistente]").forEach((b) => b.addEventListener("click", () => alternar(true)));
  fechar.addEventListener("click", () => {
    alternar(false);
    abrir.focus();
  });

  PERGUNTAS.forEach((p) => {
    const b = el("button", p.rotulo);
    b.type = "button";
    b.addEventListener("click", () => {
      mensagem(p.rotulo, "voce");
      responder(p.id);
    });
    botoes.append(b);
  });

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const texto = campo.value.trim();
    if (!texto) return;
    mensagem(texto, "voce");
    campo.value = "";
    const t = texto.toLowerCase();
    const achou = PALAVRAS.find(([, termos]) => termos.some((x) => t.includes(x)));
    if (achou) responder(achou[0]);
    else mensagem("Não entendi essa pergunta. Tente uma das opções abaixo.", "bot");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  configurarAbas();
  configurarAssistente();
  configurarOffline();
  carregarResumo();
  carregarMapa("");
  carregarPontos();
  carregarLinhas();
  carregarAlertas();
  document.getElementById("faixa-mapa").addEventListener("change", (ev) => carregarMapa(ev.target.value));
  document.getElementById("form-chegada").addEventListener("submit", mostrarChegada);
  document.getElementById("form-saia").addEventListener("submit", calcularSaida);
});
