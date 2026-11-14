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
  }
  abas.forEach((aba, i) => {
    aba.addEventListener("click", () => ativar(aba));
    aba.addEventListener("keydown", (ev) => {
      if (ev.key === "ArrowRight") ativar(abas[(i + 1) % abas.length]);
      if (ev.key === "ArrowLeft") ativar(abas[(i - 1 + abas.length) % abas.length]);
    });
  });
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
    tr.append(el("td", p.nome), el("td", p.regiao.replace("Corredor ", "")), el("td", `${p.espera_media_min} min`));
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
      el("td", `${l.espera_media_min} min`),
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

document.addEventListener("DOMContentLoaded", () => {
  configurarAbas();
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
