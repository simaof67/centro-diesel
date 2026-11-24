/* =========================================================================
   CENTRO DIESEL — Área Privada do Dono & Escritório (dono.html + dono.js)
   Autenticação exclusiva por Utilizador + Palavra-passe + Conta & Segurança
   ========================================================================= */

(function () {
  const Store = window.CentroDieselStore;
  const Auth = window.CentroDieselAuth;
  const AI = window.CentroDieselAI;

  let state = Store.getDefaultState();
  let currentOwner = null;
  let maskedClients = [];
  let activeTab = 'prices';
  let activeOfficeSubtab = 'workorders';
  let selectedPriceCategory = 'Todas';
  let pollTimer = null;

  let activeCall = {
    inProgress: false,
    startTime: null,
    timerInterval: null,
    durationStr: '00:00',
    callerPhone: '914 582 310',
    callerName: '',
    messages: [],
    triage: {
      intent: 'Aguardar chamada...',
      vehicle: '',
      services: [],
      totalWithVat: 0
    }
  };

  let speechRecognition = null;
  let isListeningMic = false;

  const TAB_META = {
    prices: {
      title: 'Tabela de Preços & Regras da IA',
      subtitle: 'Defina os preços, horário e instruções — o Site do Cliente e a Assistente IA atualizam na hora'
    },
    assistant: {
      title: 'Central Telefónica IA (296 383 150)',
      subtitle: 'Teste chamadas com os novos preços ou consulte chamadas recebidas no Site do Cliente'
    },
    dashboard: {
      title: 'Painel de Escritório',
      subtitle: 'Resumo diário da oficina, ocupação de bancadas e pedidos recentes'
    },
    office: {
      title: 'Secretaria, Folhas de Obra & Orçamentos A4',
      subtitle: 'Receção de viaturas, agenda de marcações e emissão de orçamentos'
    },
    account: {
      title: 'Conta & Segurança do Proprietário',
      subtitle: 'Altere o seu nome de utilizador, palavra-passe e consulte clientes com privacidade protegida'
    }
  };

  function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }
  function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  function switchTab(tabId) {
    activeTab = tabId;
    document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    const meta = TAB_META[tabId] || TAB_META.prices;
    document.getElementById('topbar-title').textContent = meta.title;
    document.getElementById('topbar-subtitle').textContent = meta.subtitle;

    if (window.innerWidth < 1024) {
      document.getElementById('sidebar').classList.add('hidden');
    }
    if (tabId === 'account' && currentOwner) {
      loadMaskedClients();
    }
    renderAll();
  }

  function switchOfficeSubtab(subtabId) {
    activeOfficeSubtab = subtabId;
    document.querySelectorAll('.office-subpanel').forEach(el => el.classList.add('hidden'));
    document.getElementById(`panel-${subtabId}`).classList.remove('hidden');
    document.querySelectorAll('#office-subtabs .subtab-btn').forEach(btn => {
      const isActive = btn.dataset.subtab === subtabId;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('text-slate-600', !isActive);
      btn.classList.toggle('hover:bg-slate-100', !isActive);
    });
    renderOfficeSection();
  }

  /* =======================================================================
     OWNER AUTHENTICATION & ACCOUNT TAB
     ======================================================================= */

  async function initOwnerSession() {
    const owner = await Auth.getOwnerMe();
    const overlay = document.getElementById('owner-auth-overlay');
    if (owner) {
      currentOwner = owner;
      overlay.classList.add('hidden');
      try {
        state = await Store.fetchOwnerState(Auth.getOwnerToken());
      } catch (err) {
        console.warn('Erro ao carregar estado do dono:', err);
      }
      await loadMaskedClients();
      startOwnerSyncPoll();
      renderAll();
    } else {
      currentOwner = null;
      overlay.classList.remove('hidden');
      stopOwnerSyncPoll();
    }
  }

  async function loadMaskedClients() {
    try {
      maskedClients = await Auth.getOwnerClientsMasked();
      renderOwnerAccountTab();
    } catch (_) {}
  }

  function startOwnerSyncPoll() {
    stopOwnerSyncPoll();
    if (window.location.protocol !== 'http:' && window.location.protocol !== 'https:') return;
    pollTimer = setInterval(async () => {
      if (!currentOwner) return;
      try {
        const latest = await Store.fetchOwnerState(Auth.getOwnerToken());
        if (Number(latest.updatedAt || 0) > Number(state.updatedAt || 0)) {
          state = latest;
          renderAll();
        }
      } catch (_) {}
    }, 5000);
  }

  function stopOwnerSyncPoll() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function renderOwnerAccountTab() {
    if (!currentOwner) return;
    document.getElementById('sidebar-owner-user').textContent = `@${currentOwner.username} • Privado`;
    document.getElementById('owner-acct-fullname').textContent = currentOwner.fullName;
    document.getElementById('owner-acct-username').textContent = `@${currentOwner.username}`;
    document.getElementById('owner-acct-email').textContent = currentOwner.email;

    const uInput = document.getElementById('oa-username');
    const fInput = document.getElementById('oa-fullname');
    const eInput = document.getElementById('oa-email');
    if (document.activeElement !== uInput) uInput.value = currentOwner.username || '';
    if (document.activeElement !== fInput) fInput.value = currentOwner.fullName || '';
    if (document.activeElement !== eInput) eInput.value = currentOwner.email || '';

    const listEl = document.getElementById('owner-clients-list');
    if (!maskedClients || maskedClients.length === 0) {
      listEl.innerHTML = `<div class="py-5 text-center text-slate-400 italic">Nenhum cliente registado até ao momento.</div>`;
    } else {
      listEl.innerHTML = maskedClients.map(c => `
        <div class="py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900">${Store.escapeHtml(c.fullName)}</span>
              <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">@${Store.escapeHtml(c.username)}</span>
            </div>
            <div class="text-slate-500 mt-0.5">
              E-mail: <strong class="text-slate-700">${Store.escapeHtml(c.emailMasked)}</strong>
              ${c.phone ? ` • Tel: ${Store.escapeHtml(c.phone)}` : ''}
              ${c.vehicle ? ` • Viatura: ${Store.escapeHtml(c.vehicle)}` : ''}
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">Password Encriptada</span>
        </div>`).join('');
    }
  }

  /* =======================================================================
     PRICES & AI RULES TAB
     ======================================================================= */

  function renderPricesTab() {
    const hoursEl = document.getElementById('owner-hours-input');
    const greetEl = document.getElementById('owner-ai-greeting');
    const notesEl = document.getElementById('owner-ai-notes');

    if (document.activeElement !== hoursEl) hoursEl.value = state.workshop.hours || '';
    if (document.activeElement !== greetEl) greetEl.value = state.settings.aiGreeting || '';
    if (document.activeElement !== notesEl) notesEl.value = state.settings.aiNotes || '';

    const ivaInput = document.getElementById('iva-rate-input');
    if (document.activeElement !== ivaInput) ivaInput.value = state.settings.ivaRate;

    document.querySelectorAll('.cat-pill').forEach(pill => {
      const active = pill.dataset.cat === selectedPriceCategory;
      pill.className = active
        ? 'cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white'
        : 'cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
    });

    const search = (document.getElementById('price-search').value || '').trim().toLowerCase();
    const filtered = state.services.filter(srv => {
      const matchCat = selectedPriceCategory === 'Todas' || srv.category === selectedPriceCategory;
      const matchSearch = !search ||
        srv.name.toLowerCase().includes(search) ||
        srv.code.toLowerCase().includes(search) ||
        srv.category.toLowerCase().includes(search) ||
        (srv.description || '').toLowerCase().includes(search);
      return matchCat && matchSearch;
    });

    const grid = document.getElementById('services-grid');
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">Nenhum serviço encontrado.</div>`;
      return;
    }

    const stockBadge = {
      'Disponível': 'bg-emerald-500/90 text-white',
      'Stock Reduzido': 'bg-amber-500/95 text-slate-950',
      'Peça por Encomenda': 'bg-rose-600/90 text-white'
    };

    const iva = Number(state.settings.ivaRate || 16);
    grid.innerHTML = filtered.map(srv => {
      const imgSrc = Store.escapeHtml(srv.image || srv.fallback || Store.CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
      const fallbackSrc = Store.escapeHtml(srv.fallback || Store.CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
      const withVat = Store.calcWithVat(srv.price, iva);

      return `
        <article id="service-card-${srv.id}" class="service-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div class="relative h-44 bg-slate-900 overflow-hidden">
              <img src="${imgSrc}" onerror="this.onerror=null;this.src='${fallbackSrc}';" alt="${Store.escapeHtml(srv.name)}" class="service-card-img w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"></div>
              <div class="absolute top-3 left-3 flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded-md bg-slate-950/85 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30">${Store.escapeHtml(srv.code)}</span>
                <span class="px-2 py-0.5 rounded-md bg-white/90 text-slate-900 text-[11px] font-bold">${Store.escapeHtml(srv.category)}</span>
              </div>
              <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${stockBadge[srv.stock] || 'bg-slate-700 text-white'}">${Store.escapeHtml(srv.stock)}</span>
              <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                <span>Duração: <strong>${Store.escapeHtml(srv.duration)}</strong></span>
                <span>Garantia: <strong>${Store.escapeHtml(srv.warranty)}</strong></span>
              </div>
            </div>
            <div class="p-4 space-y-2">
              <h4 class="font-extrabold text-sm text-slate-900 leading-snug">${Store.escapeHtml(srv.name)}</h4>
              <p class="text-xs text-slate-500 leading-relaxed">${Store.escapeHtml(srv.description)}</p>
            </div>
          </div>

          <div class="p-4 pt-3 border-t border-slate-100 bg-slate-50/70 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-bold uppercase text-slate-500">Preço Base s/ IVA</span>
              <span id="card-vat-label-${srv.id}" class="text-xs font-bold text-emerald-700">
                c/ IVA (${iva}%): ${Store.formatMoney(withVat)}
              </span>
            </div>
            <div class="flex items-center gap-1.5">
              <button onclick="nudgeServicePrice('${srv.id}', -5)" class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 text-xs font-bold text-rose-700">-5€</button>
              <div class="relative flex-1">
                <input
                  type="number" step="0.5" min="0" value="${srv.price}"
                  oninput="livePreviewCardVat('${srv.id}', this.value)"
                  onchange="setServicePrice('${srv.id}', this.value)"
                  class="w-full px-3 py-1.5 pr-7 rounded-lg border border-amber-300 bg-white text-sm font-extrabold text-center text-slate-900 focus:border-amber-500 focus:outline-none"
                />
                <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
              </div>
              <button onclick="nudgeServicePrice('${srv.id}', 5)" class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-emerald-50 text-xs font-bold text-emerald-700">+5€</button>
            </div>
            <div class="flex items-center justify-between pt-1">
              <label class="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" ${srv.visible !== false ? 'checked' : ''} onchange="toggleServiceVisibility('${srv.id}', this.checked)" class="rounded text-amber-600" />
                Visível no Site Cliente
              </label>
              <div class="flex items-center gap-1.5">
                <button onclick="openEditServiceModal('${srv.id}')" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-[11px] font-semibold transition">Editar</button>
                <button onclick="deleteService('${srv.id}')" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-rose-600 hover:text-white text-[11px] font-semibold text-rose-600 transition">✕</button>
              </div>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  window.livePreviewCardVat = function (serviceId, val) {
    const num = Math.max(0, parseFloat(val) || 0);
    const label = document.getElementById(`card-vat-label-${serviceId}`);
    const iva = Number(state.settings.ivaRate || 16);
    if (label) {
      label.textContent = `c/ IVA (${iva}%): ${Store.formatMoney(Store.calcWithVat(num, iva))}`;
    }
  };

  async function saveOwnerChanges(toastMsg, highlightId = null) {
    await Store.saveOwnerState(state, Auth.getOwnerToken());
    renderAll();
    if (highlightId) {
      document.getElementById(`service-card-${highlightId}`)?.classList.add('price-updated-flash');
    }
    if (toastMsg) Store.showToast(toastMsg, 'success');
  }

  window.setServicePrice = function (serviceId, newPrice) {
    const srv = state.services.find(s => s.id === serviceId);
    if (!srv) return;
    srv.price = Math.max(0, Math.round((parseFloat(newPrice) || 0) * 100) / 100);
    saveOwnerChanges(`Preço de "${srv.code}" atualizado para ${Store.formatMoney(srv.price)} s/ IVA! Site e IA sincronizados.`, serviceId);
  };

  window.nudgeServicePrice = function (serviceId, delta) {
    const srv = state.services.find(s => s.id === serviceId);
    if (!srv) return;
    srv.price = Math.max(0, Math.round((Number(srv.price) + delta) * 100) / 100);
    saveOwnerChanges(`Preço de "${srv.code}" ajustado para ${Store.formatMoney(srv.price)} s/ IVA!`, serviceId);
  };

  window.toggleServiceVisibility = async function (serviceId, visible) {
    const srv = state.services.find(s => s.id === serviceId);
    if (!srv) return;
    srv.visible = visible;
    await Store.saveOwnerState(state, Auth.getOwnerToken());
    Store.showToast(`"${srv.code}" ${visible ? 'publicado' : 'ocultado'} no Site do Cliente.`, 'info');
  };

  window.deleteService = async function (serviceId) {
    const srv = state.services.find(s => s.id === serviceId);
    if (!srv) return;
    if (!confirm(`Remover "${srv.name}" da tabela?`)) return;
    state.services = state.services.filter(s => s.id !== serviceId);
    await saveOwnerChanges(`Serviço "${srv.code}" removido.`);
  };

  async function applyBulkPercentage(pct) {
    const numPct = parseFloat(pct);
    if (isNaN(numPct) || numPct === 0) {
      Store.showToast('Indique uma percentagem válida (ex: 5 ou -5).', 'warning');
      return;
    }
    let count = 0;
    state.services.forEach(srv => {
      if (selectedPriceCategory === 'Todas' || srv.category === selectedPriceCategory) {
        srv.price = Math.max(1, Math.round(srv.price * (1 + numPct / 100) * 2) / 2);
        count++;
      }
    });
    await saveOwnerChanges(`Ajuste de ${numPct > 0 ? '+' : ''}${numPct}% aplicado a ${count} serviços!`);
  }

  window.openEditServiceModal = function (serviceId = null) {
    const modalTitle = document.getElementById('modal-service-title');
    document.getElementById('srv-image-file').value = '';
    if (serviceId) {
      const srv = state.services.find(s => s.id === serviceId);
      if (!srv) return;
      modalTitle.textContent = `Editar Serviço (${srv.code})`;
      document.getElementById('srv-id').value = srv.id;
      document.getElementById('srv-code').value = srv.code;
      document.getElementById('srv-category').value = srv.category;
      document.getElementById('srv-name').value = srv.name;
      document.getElementById('srv-desc').value = srv.description;
      document.getElementById('srv-price').value = srv.price;
      document.getElementById('srv-duration').value = srv.duration;
      document.getElementById('srv-warranty').value = srv.warranty;
      document.getElementById('srv-stock').value = srv.stock;
      document.getElementById('srv-image').value = srv.image || '';
      document.getElementById('srv-visible').checked = srv.visible !== false;
    } else {
      modalTitle.textContent = 'Adicionar Novo Serviço / Arranjo';
      document.getElementById('srv-id').value = '';
      document.getElementById('srv-code').value = `CD-${String(state.services.length + 1).padStart(2, '0')}`;
      document.getElementById('srv-category').value = 'Injetores';
      document.getElementById('srv-name').value = '';
      document.getElementById('srv-desc').value = '';
      document.getElementById('srv-price').value = 50;
      document.getElementById('srv-duration').value = '1h30';
      document.getElementById('srv-warranty').value = '12 meses';
      document.getElementById('srv-stock').value = 'Disponível';
      document.getElementById('srv-image').value = '';
      document.getElementById('srv-visible').checked = true;
    }
    openModal('modal-service');
  };

  /* =======================================================================
     ASSISTANT TAB
     ======================================================================= */

  function renderAssistantTab() {
    const isGeminiReady = state.settings.useGemini && Boolean(state.settings.geminiApiKey);
    const badge = document.getElementById('ai-engine-badge');
    badge.textContent = isGeminiReady ? `Gemini API (${state.settings.geminiModel})` : 'Motor Local + Preços Vivos';
    badge.className = isGeminiReady
      ? 'px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800'
      : 'px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-700';

    document.getElementById('ai-price-sync-count').textContent =
      `${state.services.length} serviços sincronizados (IVA ${state.settings.ivaRate}%)`;
    document.getElementById('ai-tts-toggle').checked = state.settings.ttsEnabled !== false;
    document.getElementById('ai-auto-answer').checked = state.settings.autoAnswer !== false;

    renderCallTranscript();
    renderCallTriage();
    renderCallHistory();
  }

  function renderCallTranscript() {
    const container = document.getElementById('call-transcript');
    if (activeCall.messages.length === 0) {
      container.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center text-slate-400 px-6 space-y-2">
          <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
            <i data-lucide="phone-incoming" class="w-6 h-6"></i>
          </div>
          <div class="text-sm font-bold text-slate-700">Teste a sua Assistente Telefónica</div>
          <p class="text-xs max-w-sm">Depois de alterar preços ou instruções na aba anterior, clique em <strong>Atender / Iniciar</strong> ou escolha um cenário à esquerda.</p>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    container.innerHTML = activeCall.messages.map(msg => {
      const isAi = msg.sender === 'ai';
      return `
        <div class="flex ${isAi ? 'justify-start' : 'justify-end'}">
          <div class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
            isAi ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm' : 'bg-slate-900 text-white rounded-tr-sm'
          }">
            <div class="text-[10px] font-bold uppercase tracking-wider mb-1 ${isAi ? 'text-amber-600' : 'text-amber-400'}">
              ${isAi ? 'Assistente Centro Diesel' : (activeCall.callerName || activeCall.callerPhone || 'Cliente')}
            </div>
            <div class="whitespace-pre-line">${Store.escapeHtml(msg.text)}</div>
          </div>
        </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  }

  function renderCallTriage() {
    document.getElementById('triage-intent').textContent = activeCall.triage.intent;
    const vehInput = document.getElementById('triage-vehicle');
    if (document.activeElement !== vehInput) vehInput.value = activeCall.triage.vehicle;

    const iva = Number(state.settings.ivaRate || 16);
    const srvEl = document.getElementById('triage-services');
    if (activeCall.triage.services.length === 0) {
      srvEl.innerHTML = `<div class="italic text-slate-400">Nenhum serviço detetado ainda</div>`;
    } else {
      srvEl.innerHTML = activeCall.triage.services.map(item => {
        const liveSrv = state.services.find(s => s.id === item.serviceId);
        const unitBase = liveSrv ? liveSrv.price : item.unitPrice;
        return `
          <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span class="font-medium text-slate-800 truncate pr-2">${item.qty}x ${Store.escapeHtml(liveSrv ? liveSrv.name : item.name)}</span>
            <span class="font-bold text-slate-900 shrink-0">${Store.formatMoney(Store.calcWithVat(unitBase * item.qty, iva))}</span>
          </div>`;
      }).join('');
    }

    const totalVat = activeCall.triage.services.reduce((sum, item) => {
      const liveSrv = state.services.find(s => s.id === item.serviceId);
      const unitBase = liveSrv ? liveSrv.price : item.unitPrice;
      return sum + Store.calcWithVat(unitBase * item.qty, iva);
    }, 0);
    activeCall.triage.totalWithVat = Math.round(totalVat * 100) / 100;
    document.getElementById('triage-total').textContent = Store.formatMoney(activeCall.triage.totalWithVat);
  }

  function speakOwnerCall(text) {
    const wave = document.getElementById('voice-wave');
    AI.speakPortuguese(
      text,
      state.settings.ttsEnabled !== false,
      () => wave && wave.classList.add('speaking'),
      () => wave && wave.classList.remove('speaking')
    );
  }

  function startSimulatedCall() {
    if (activeCall.inProgress) return;
    const phone = document.getElementById('call-phone-input').value.trim() || '914 582 310';
    const name = document.getElementById('call-name-input').value.trim();

    activeCall = {
      inProgress: true,
      startTime: Date.now(),
      timerInterval: null,
      durationStr: '00:00',
      callerPhone: phone,
      callerName: name,
      messages: [],
      triage: { intent: 'Chamada Atendida — Em Curso', vehicle: '', services: [], totalWithVat: 0 }
    };

    document.getElementById('call-status-pill').textContent = 'Em Chamada';
    document.getElementById('call-status-pill').className = 'px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300';
    document.getElementById('call-display-name').textContent = name ? `${name} (${phone})` : phone;
    document.getElementById('call-avatar-ring').classList.add('call-ring-active');
    document.getElementById('btn-start-call').disabled = true;
    document.getElementById('btn-end-call').disabled = false;

    activeCall.timerInterval = setInterval(() => {
      const secs = Math.floor((Date.now() - activeCall.startTime) / 1000);
      activeCall.durationStr = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
      document.getElementById('call-timer').textContent = activeCall.durationStr;
    }, 1000);

    const greeting = state.settings.aiGreeting || Store.getDefaultState().settings.aiGreeting;
    activeCall.messages.push({ sender: 'ai', text: greeting });
    renderCallTranscript();
    renderCallTriage();
    speakOwnerCall(greeting);
  }

  async function endAndSaveCall() {
    if (!activeCall.inProgress) return;
    clearInterval(activeCall.timerInterval);
    AI.stopSpeaking(() => document.getElementById('voice-wave')?.classList.remove('speaking'));
    stopListeningMic();

    state.calls.unshift({
      id: 'CH-' + Date.now().toString().slice(-4),
      userId: '',
      username: '',
      timestamp: new Date().toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      phone: activeCall.callerPhone,
      callerName: activeCall.callerName || 'Teste Telefónico',
      duration: activeCall.durationStr,
      intent: activeCall.triage.intent,
      vehicle: activeCall.triage.vehicle || 'Não indicada',
      quotedTotal: activeCall.triage.totalWithVat,
      status: activeCall.triage.services.length > 0 ? 'Orçamento Informado' : 'Informação Prestada',
      messages: [...activeCall.messages]
    });
    await Store.saveOwnerState(state, Auth.getOwnerToken());

    activeCall.inProgress = false;
    document.getElementById('call-status-pill').textContent = 'Chamada Gravada';
    document.getElementById('call-status-pill').className = 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300';
    document.getElementById('call-avatar-ring').classList.remove('call-ring-active');
    document.getElementById('btn-start-call').disabled = false;
    document.getElementById('btn-end-call').disabled = true;
    renderAll();
    Store.showToast('Chamada guardada no Registo.', 'success');
  }

  async function handleCallerMessage(rawText) {
    const text = (rawText || '').trim();
    if (!text) return;
    if (!activeCall.inProgress) startSimulatedCall();

    activeCall.messages.push({ sender: 'caller', text });
    const veh = AI.extractVehicleInfo(text);
    if (veh) activeCall.triage.vehicle = veh;
    renderCallTranscript();

    const reply = await AI.generateReply(state, text, activeCall.triage.intent);
    if (reply.intent) activeCall.triage.intent = reply.intent;
    reply.detectedServices.forEach(item => {
      const existing = activeCall.triage.services.find(s => s.serviceId === item.serviceId);
      if (existing) existing.qty = item.qty;
      else activeCall.triage.services.push(item);
    });

    activeCall.messages.push({ sender: 'ai', text: reply.text });
    renderCallTranscript();
    renderCallTriage();
    speakOwnerCall(reply.text);
  }

  function stopListeningMic() {
    isListeningMic = false;
    if (speechRecognition) {
      try { speechRecognition.stop(); } catch (_) {}
    }
    document.getElementById('voice-wave')?.classList.remove('listening');
    const lbl = document.getElementById('mic-btn-label');
    if (lbl) lbl.textContent = 'Falar pelo Microfone';
  }

  function toggleMicrophone() {
    if (isListeningMic) { stopListeningMic(); return; }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      Store.showToast('Microfone indisponível neste navegador.', 'warning');
      return;
    }
    if (!activeCall.inProgress) startSimulatedCall();
    AI.stopSpeaking();

    speechRecognition = new SpeechRec();
    speechRecognition.lang = 'pt-PT';
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.onstart = () => {
      isListeningMic = true;
      document.getElementById('voice-wave').classList.add('listening');
      document.getElementById('mic-btn-label').textContent = 'A ouvir...';
    };
    speechRecognition.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      if (txt) handleCallerMessage(txt);
    };
    speechRecognition.onerror = () => stopListeningMic();
    speechRecognition.onend = () => stopListeningMic();
    speechRecognition.start();
  }

  function renderCallHistory() {
    const search = (document.getElementById('call-history-search').value || '').trim().toLowerCase();
    const listEl = document.getElementById('call-history-list');
    const filtered = state.calls.filter(c =>
      !search ||
      (c.phone || '').toLowerCase().includes(search) ||
      (c.callerName || '').toLowerCase().includes(search) ||
      (c.intent || '').toLowerCase().includes(search) ||
      (c.vehicle || '').toLowerCase().includes(search)
    );
    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">Sem chamadas registadas.</div>`;
      return;
    }
    listEl.innerHTML = filtered.map(c => `
      <div class="py-3 flex flex-wrap items-center justify-between gap-3">
        <div class="space-y-0.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-xs text-slate-900">${Store.escapeHtml(c.callerName)}</span>
            ${c.username ? `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">@${Store.escapeHtml(c.username)}</span>` : ''}
            <span class="text-xs text-slate-500 font-mono">${Store.escapeHtml(c.phone)}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">${Store.escapeHtml(c.intent)}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">${Store.escapeHtml(c.status)}</span>
          </div>
          <div class="text-[11px] text-slate-500">${Store.escapeHtml(c.timestamp)} • ${Store.escapeHtml(c.duration)} • Viatura: ${Store.escapeHtml(c.vehicle)}</div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-extrabold text-slate-900">${Store.formatMoney(c.quotedTotal)}</span>
          <button onclick="viewTranscript('${c.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-xs font-semibold transition">Transcrição</button>
        </div>
      </div>`).join('');
  }

  window.viewTranscript = function (callId) {
    const call = state.calls.find(c => c.id === callId);
    if (!call) return;
    document.getElementById('modal-transcript-title').textContent = `Chamada ${call.id} — ${call.callerName}`;
    document.getElementById('modal-transcript-body').innerHTML = `
      <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
        <div><strong>Data/Hora:</strong> ${Store.escapeHtml(call.timestamp)}</div>
        <div><strong>Duração:</strong> ${Store.escapeHtml(call.duration)}</div>
        <div><strong>Viatura:</strong> ${Store.escapeHtml(call.vehicle)}</div>
        <div><strong>Total:</strong> ${Store.formatMoney(call.quotedTotal)}</div>
      </div>
      <div class="space-y-2 pt-2">
        ${(call.messages || []).map(m => `
          <div class="p-2.5 rounded-xl ${m.sender === 'ai' ? 'bg-amber-50 border border-amber-200' : 'bg-slate-900 text-white'}">
            <div class="font-bold text-[10px] uppercase mb-0.5 ${m.sender === 'ai' ? 'text-amber-700' : 'text-amber-400'}">
              ${m.sender === 'ai' ? 'Assistente Centro Diesel' : Store.escapeHtml(call.callerName)}
            </div>
            <div>${Store.escapeHtml(m.text)}</div>
          </div>`).join('')}
      </div>`;
    openModal('modal-transcript');
  };

  /* =======================================================================
     DASHBOARD & OFFICE
     ======================================================================= */

  function renderDashboard() {
    const activeWo = state.workOrders.filter(w => w.status !== 'Entregue');
    const estRevenue = activeWo.reduce((acc, w) => acc + (Number(w.total) || 0), 0);
    const lowStockCount = state.services.filter(s => s.stock !== 'Disponível').length;

    document.getElementById('kpi-calls').textContent = state.calls.length;
    document.getElementById('kpi-bookings').textContent = state.bookings.length;
    document.getElementById('kpi-workorders').textContent = activeWo.length;
    document.getElementById('kpi-revenue').textContent = Store.formatMoney(estRevenue);
    document.getElementById('kpi-alerts').textContent = lowStockCount;

    const bayBadge = {
      Livre: 'bg-emerald-100 text-emerald-800',
      Ocupada: 'bg-amber-100 text-amber-800',
      Reservada: 'bg-blue-100 text-blue-800'
    };
    document.getElementById('dashboard-bays').innerHTML = state.bays.map(bay => `
      <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
        <div class="flex items-center justify-between gap-2">
          <span class="font-bold text-xs text-slate-900">${Store.escapeHtml(bay.name)}</span>
          <select onchange="updateBayStatus('${bay.id}', this.value)" class="text-[11px] font-bold px-2 py-0.5 rounded-full border-0 cursor-pointer ${bayBadge[bay.status] || 'bg-slate-200'}">
            <option value="Livre" ${bay.status === 'Livre' ? 'selected' : ''}>Livre</option>
            <option value="Ocupada" ${bay.status === 'Ocupada' ? 'selected' : ''}>Ocupada</option>
            <option value="Reservada" ${bay.status === 'Reservada' ? 'selected' : ''}>Reservada</option>
          </select>
        </div>
        <div class="text-xs font-semibold text-slate-700">${Store.escapeHtml(bay.vehicle)}</div>
        <div class="text-[11px] text-slate-500">${Store.escapeHtml(bay.task)}</div>
      </div>`).join('');

    const recentCallsEl = document.getElementById('dashboard-recent-calls');
    if (state.calls.length === 0) {
      recentCallsEl.innerHTML = `<div class="text-xs text-slate-400 italic py-6 text-center">Nenhuma chamada registada.</div>`;
    } else {
      recentCallsEl.innerHTML = state.calls.slice(0, 4).map(c => `
        <div class="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-bold text-xs text-slate-900 truncate">${Store.escapeHtml(c.callerName || c.phone)}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">${Store.escapeHtml(c.intent)}</span>
            </div>
            <div class="text-[11px] text-slate-500 mt-0.5">${Store.escapeHtml(c.timestamp)} • ${Store.escapeHtml(c.vehicle)}</div>
            <div class="text-[11px] font-semibold text-emerald-700 mt-0.5">Estimativa: ${Store.formatMoney(c.quotedTotal)} • ${Store.escapeHtml(c.status)}</div>
          </div>
          <button onclick="viewTranscript('${c.id}')" class="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-[11px] font-semibold transition">Ver</button>
        </div>`).join('');
    }

    const iva = Number(state.settings.ivaRate || 16);
    document.getElementById('dashboard-quick-prices').innerHTML = state.services.slice(0, 4).map(srv => `
      <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">${Store.escapeHtml(srv.code)}</span>
          <span class="text-[11px] text-slate-500">c/ IVA: <strong>${Store.formatMoney(Store.calcWithVat(srv.price, iva))}</strong></span>
        </div>
        <div class="text-xs font-bold text-slate-900 line-clamp-2 min-h-[2rem]">${Store.escapeHtml(srv.name)}</div>
        <div class="flex items-center gap-1.5">
          <button onclick="nudgeServicePrice('${srv.id}', -5)" class="px-2 py-1 rounded bg-white border border-slate-300 text-xs font-bold text-rose-700">-5€</button>
          <input type="number" step="0.5" min="0" value="${srv.price}" onchange="setServicePrice('${srv.id}', this.value)" class="w-full px-2 py-1 rounded border border-slate-300 text-xs font-extrabold text-center text-slate-900" />
          <button onclick="nudgeServicePrice('${srv.id}', 5)" class="px-2 py-1 rounded bg-white border border-slate-300 text-xs font-bold text-emerald-700">+5€</button>
        </div>
      </div>`).join('');
  }

  window.updateBayStatus = async function (bayId, newStatus) {
    const bay = state.bays.find(b => b.id === bayId);
    if (!bay) return;
    bay.status = newStatus;
    if (newStatus === 'Livre') { bay.vehicle = 'Disponível'; bay.task = 'Posto pronto'; }
    await saveOwnerChanges(`${bay.name} marcada como "${newStatus}".`);
  };

  function renderOfficeSection() {
    renderWorkOrders();
    renderBookings();
    renderQuoteBuilder();
  }

  function renderWorkOrders() {
    const search = (document.getElementById('wo-search').value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('wo-status-filter').value;
    const container = document.getElementById('workorders-list');

    const filtered = state.workOrders.filter(wo => {
      const matchStatus = statusFilter === 'Todos' || wo.status === statusFilter;
      const matchSearch = !search ||
        wo.plate.toLowerCase().includes(search) ||
        wo.client.toLowerCase().includes(search) ||
        wo.phone.toLowerCase().includes(search) ||
        wo.vehicle.toLowerCase().includes(search) ||
        wo.id.toLowerCase().includes(search);
      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="col-span-full bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">Nenhuma folha de obra encontrada.</div>`;
      return;
    }

    const statusColors = {
      'Aguardar Orçamento': 'bg-slate-100 text-slate-700',
      'Em Bancada de Teste': 'bg-amber-100 text-amber-800',
      'Aguardar Peças': 'bg-rose-100 text-rose-700',
      'Pronto para Entrega': 'bg-emerald-100 text-emerald-800',
      'Entregue': 'bg-blue-100 text-blue-800'
    };

    container.innerHTML = filtered.map(wo => `
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 flex flex-col justify-between">
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono text-xs font-bold text-amber-700">${Store.escapeHtml(wo.id)}</span>
                <span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">${Store.escapeHtml(wo.plate)}</span>
              </div>
              <h4 class="font-bold text-sm text-slate-900 mt-1">${Store.escapeHtml(wo.client)}</h4>
              <div class="text-xs text-slate-500">${Store.escapeHtml(wo.vehicle)} • Tel: ${Store.escapeHtml(wo.phone)}</div>
            </div>
            <select onchange="updateWorkOrderStatus('${wo.id}', this.value)" class="px-2.5 py-1 rounded-full text-[11px] font-bold border-0 cursor-pointer ${statusColors[wo.status] || 'bg-slate-100'}">
              <option ${wo.status === 'Aguardar Orçamento' ? 'selected' : ''}>Aguardar Orçamento</option>
              <option ${wo.status === 'Em Bancada de Teste' ? 'selected' : ''}>Em Bancada de Teste</option>
              <option ${wo.status === 'Aguardar Peças' ? 'selected' : ''}>Aguardar Peças</option>
              <option ${wo.status === 'Pronto para Entrega' ? 'selected' : ''}>Pronto para Entrega</option>
              <option ${wo.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
            </select>
          </div>
          <p class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">${Store.escapeHtml(wo.desc)}</p>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span class="text-slate-400">Posto:</span> <strong class="text-slate-700">${Store.escapeHtml(wo.bay)}</strong>
            <span class="mx-1.5 text-slate-300">|</span>
            <strong class="text-slate-900">${Store.formatMoney(wo.total)}</strong>
          </div>
          <div class="flex items-center gap-1.5">
            <button onclick="printSingleWorkOrder('${wo.id}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white font-semibold transition">Imprimir</button>
            <button onclick="openEditWorkOrderModal('${wo.id}')" class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 font-semibold transition">Editar</button>
          </div>
        </div>
      </div>`).join('');
  }

  window.updateWorkOrderStatus = async function (id, newStatus) {
    const wo = state.workOrders.find(w => w.id === id);
    if (!wo) return;
    wo.status = newStatus;
    await saveOwnerChanges(`Folha ${wo.id} atualizada para "${newStatus}".`);
  };

  window.openEditWorkOrderModal = function (id = null) {
    if (id) {
      const wo = state.workOrders.find(w => w.id === id);
      if (!wo) return;
      document.getElementById('wo-id').value = wo.id;
      document.getElementById('wo-client').value = wo.client;
      document.getElementById('wo-phone').value = wo.phone;
      document.getElementById('wo-plate').value = wo.plate;
      document.getElementById('wo-vehicle').value = wo.vehicle;
      document.getElementById('wo-status').value = wo.status;
      document.getElementById('wo-bay').value = wo.bay;
      document.getElementById('wo-desc').value = wo.desc;
      document.getElementById('wo-total').value = wo.total;
    } else {
      document.getElementById('wo-id').value = '';
      document.getElementById('wo-client').value = '';
      document.getElementById('wo-phone').value = '';
      document.getElementById('wo-plate').value = '';
      document.getElementById('wo-vehicle').value = '';
      document.getElementById('wo-status').value = 'Aguardar Orçamento';
      document.getElementById('wo-bay').value = 'Por Atribuir';
      document.getElementById('wo-desc').value = '';
      document.getElementById('wo-total').value = 0;
    }
    openModal('modal-workorder');
  };

  function renderBookings() {
    const listEl = document.getElementById('bookings-list');
    if (state.bookings.length === 0) {
      listEl.innerHTML = `<div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-400">Sem marcações agendadas.</div>`;
      return;
    }
    const sourceBadge = {
      'Assistente IA': 'bg-amber-100 text-amber-800',
      'Assistente IA (Site)': 'bg-amber-100 text-amber-800',
      'Site Cliente': 'bg-emerald-100 text-emerald-800',
      'Secretaria': 'bg-blue-100 text-blue-800'
    };
    listEl.innerHTML = state.bookings.map(b => `
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3.5">
          <div class="px-3 py-2 rounded-xl bg-slate-900 text-white text-center min-w-[78px]">
            <div class="text-[10px] text-amber-400 font-bold">${Store.escapeHtml(b.date)}</div>
            <div class="text-sm font-extrabold">${Store.escapeHtml(b.time)}</div>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-bold text-sm text-slate-900">${Store.escapeHtml(b.client)}</span>
              ${b.username ? `<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">@${Store.escapeHtml(b.username)}</span>` : ''}
              <span class="text-xs text-slate-500">${Store.escapeHtml(b.phone)}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${sourceBadge[b.source] || 'bg-slate-100'}">${Store.escapeHtml(b.source)}</span>
            </div>
            <div class="text-xs text-slate-700 font-medium mt-0.5">${Store.escapeHtml(b.vehicle)} — ${Store.escapeHtml(b.service)}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="convertBookingToWorkOrder('${b.id}')" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition">Abrir Folha de Obra</button>
          <button onclick="deleteBooking('${b.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition">Remover</button>
        </div>
      </div>`).join('');
  }

  window.convertBookingToWorkOrder = async function (bookingId) {
    const b = state.bookings.find(x => x.id === bookingId);
    if (!b) return;
    state.workOrders.unshift({
      id: 'FO-2026-' + (100 + state.workOrders.length + 1),
      client: b.client,
      phone: b.phone,
      plate: (b.vehicle.split('•')[0] || '').trim() || 'A CONFIRMAR',
      vehicle: b.vehicle,
      status: 'Aguardar Orçamento',
      bay: 'Por Atribuir',
      desc: `Marcação ${b.date} ${b.time}: ${b.service}`,
      total: 0,
      createdAt: Store.getTodayISO(0)
    });
    b.status = 'Em Oficina';
    await Store.saveOwnerState(state, Auth.getOwnerToken());
    switchOfficeSubtab('workorders');
    renderAll();
    Store.showToast(`Folha de Obra aberta para ${b.client}!`, 'success');
  };

  window.deleteBooking = async function (bookingId) {
    state.bookings = state.bookings.filter(b => b.id !== bookingId);
    await saveOwnerChanges('Marcação removida.');
  };

  function renderQuoteBuilder() {
    const q = state.quoteDraft;
    document.getElementById('q-client-name').value = q.clientName || '';
    document.getElementById('q-client-phone').value = q.clientPhone || '';
    document.getElementById('q-client-nif').value = q.clientNif || '';
    document.getElementById('q-client-email').value = q.clientEmail || '';
    document.getElementById('q-vehicle-plate').value = q.vehiclePlate || '';
    document.getElementById('q-vehicle-model').value = q.vehicleModel || '';
    document.getElementById('q-notes').value = q.notes || '';
    document.getElementById('quote-number-badge').textContent = q.number || 'ORC-2026-001';

    const ivaInput = document.getElementById('quote-iva-override');
    if (document.activeElement !== ivaInput) ivaInput.value = state.settings.ivaRate;

    document.getElementById('quote-service-picker').innerHTML = state.services.map(srv => {
      const selected = q.items.find(i => i.serviceId === srv.id);
      return `
        <div class="p-2.5 rounded-xl border ${selected ? 'border-amber-400 bg-amber-50/70' : 'border-slate-200 bg-slate-50'} flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="text-[10px] font-mono font-bold text-slate-500">${Store.escapeHtml(srv.code)}</div>
            <div class="text-xs font-bold text-slate-900 truncate">${Store.escapeHtml(srv.name)}</div>
            <div class="text-[11px] font-semibold text-amber-700">${Store.formatMoney(srv.price)} s/ IVA</div>
          </div>
          <button onclick="addServiceToQuote('${srv.id}')" class="shrink-0 px-2.5 py-1.5 rounded-lg ${selected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'} text-xs font-bold">
            ${selected ? `+1 (${selected.qty})` : '+ Add'}
          </button>
        </div>`;
    }).join('');

    const extraEl = document.getElementById('quote-extra-parts');
    if (q.extraParts.length === 0) {
      extraEl.innerHTML = `<div class="text-xs text-slate-400 italic">Sem peças extras adicionadas.</div>`;
    } else {
      extraEl.innerHTML = q.extraParts.map((part, idx) => `
        <div class="grid grid-cols-12 gap-2 items-center">
          <input type="text" value="${Store.escapeHtml(part.name)}" placeholder="Nome da peça" onchange="updateExtraPart(${idx}, 'name', this.value)" class="col-span-6 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs" />
          <input type="number" min="1" value="${part.qty}" onchange="updateExtraPart(${idx}, 'qty', this.value)" class="col-span-2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-center" />
          <input type="number" min="0" step="0.5" value="${part.price}" onchange="updateExtraPart(${idx}, 'price', this.value)" class="col-span-3 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-right" />
          <button onclick="removeExtraPart(${idx})" class="col-span-1 text-rose-600 font-bold text-xs">✕</button>
        </div>`).join('');
    }

    let subtotal = 0;
    let linesHtml = '';
    q.items.forEach((item, idx) => {
      const srv = state.services.find(s => s.id === item.serviceId);
      if (!srv) return;
      const lineTotal = srv.price * item.qty;
      subtotal += lineTotal;
      linesHtml += `
        <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
          <div class="min-w-0">
            <div class="font-bold text-slate-900 truncate">${Store.escapeHtml(srv.name)}</div>
            <div class="text-[11px] text-slate-500">${item.qty} × ${Store.formatMoney(srv.price)} s/ IVA</div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="font-bold text-slate-900">${Store.formatMoney(lineTotal)}</span>
            <button onclick="changeQuoteItemQty(${idx}, -1)" class="w-5 h-5 rounded bg-white border border-slate-300 text-xs font-bold">-</button>
            <button onclick="changeQuoteItemQty(${idx}, 1)" class="w-5 h-5 rounded bg-white border border-slate-300 text-xs font-bold">+</button>
          </div>
        </div>`;
    });
    q.extraParts.forEach(part => {
      const lineTotal = (Number(part.price) || 0) * (Number(part.qty) || 1);
      subtotal += lineTotal;
      linesHtml += `
        <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-200">
          <div class="min-w-0">
            <div class="font-bold text-slate-900 truncate">[Peça] ${Store.escapeHtml(part.name || 'Componente')}</div>
            <div class="text-[11px] text-slate-500">${part.qty} × ${Store.formatMoney(part.price)} s/ IVA</div>
          </div>
          <span class="font-bold text-slate-900 shrink-0">${Store.formatMoney(lineTotal)}</span>
        </div>`;
    });

    document.getElementById('quote-selected-lines').innerHTML = linesHtml || `<div class="text-slate-400 italic py-4 text-center">Selecione serviços ou adicione peças à esquerda</div>`;
    const ivaRate = Number(ivaInput.value || state.settings.ivaRate || 16);
    const ivaAmount = subtotal * (ivaRate / 100);
    document.getElementById('quote-subtotal').textContent = Store.formatMoney(subtotal);
    document.getElementById('quote-iva-amount').textContent = Store.formatMoney(ivaAmount);
    document.getElementById('quote-total').textContent = Store.formatMoney(subtotal + ivaAmount);
  }

  window.addServiceToQuote = async function (serviceId) {
    const existing = state.quoteDraft.items.find(i => i.serviceId === serviceId);
    if (existing) existing.qty += 1;
    else state.quoteDraft.items.push({ serviceId, qty: 1 });
    await Store.saveOwnerState(state, Auth.getOwnerToken());
    renderQuoteBuilder();
  };

  window.changeQuoteItemQty = async function (idx, delta) {
    const item = state.quoteDraft.items[idx];
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.quoteDraft.items.splice(idx, 1);
    await Store.saveOwnerState(state, Auth.getOwnerToken());
    renderQuoteBuilder();
  };

  window.updateExtraPart = async function (idx, field, val) {
    const part = state.quoteDraft.extraParts[idx];
    if (!part) return;
    part[field] = field === 'name' ? val : (parseFloat(val) || 0);
    await Store.saveOwnerState(state, Auth.getOwnerToken());
    renderQuoteBuilder();
  };

  window.removeExtraPart = async function (idx) {
    state.quoteDraft.extraParts.splice(idx, 1);
    await Store.saveOwnerState(state, Auth.getOwnerToken());
    renderQuoteBuilder();
  };

  function syncQuoteHeaderInputs() {
    state.quoteDraft.clientName = document.getElementById('q-client-name').value;
    state.quoteDraft.clientPhone = document.getElementById('q-client-phone').value;
    state.quoteDraft.clientNif = document.getElementById('q-client-nif').value;
    state.quoteDraft.clientEmail = document.getElementById('q-client-email').value;
    state.quoteDraft.vehiclePlate = document.getElementById('q-vehicle-plate').value;
    state.quoteDraft.vehicleModel = document.getElementById('q-vehicle-model').value;
    state.quoteDraft.notes = document.getElementById('q-notes').value;
    Store.saveOwnerState(state, Auth.getOwnerToken());
  }

  function buildPrintHeader(docTitle, docRef) {
    const w = state.workshop || {};
    return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f172a;padding-bottom:14px;margin-bottom:18px;">
        <div>
          <div style="font-size:22px;font-weight:800;color:#0f172a;">${Store.escapeHtml(w.brand || 'CENTRO DIESEL')}</div>
          <div style="font-size:12px;font-weight:700;color:#d97706;">${Store.escapeHtml(w.company || 'Manuel Francisco Raposo & Ca. Lda.')}</div>
          <div style="font-size:11px;color:#475569;margin-top:4px;">${Store.escapeHtml(w.address || '')}<br/>Tel: ${Store.escapeHtml(w.phone || '296 383 150')} • Email: ${Store.escapeHtml(w.email || '')}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px;font-weight:800;color:#0f172a;">${Store.escapeHtml(docTitle)}</div>
          <div style="font-size:13px;font-weight:700;color:#d97706;margin-top:2px;">${Store.escapeHtml(docRef)}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">Data: ${new Date().toLocaleDateString('pt-PT')}</div>
        </div>
      </div>`;
  }

  function printQuoteDocument() {
    syncQuoteHeaderInputs();
    const q = state.quoteDraft;
    const ivaRate = Number(document.getElementById('quote-iva-override').value || state.settings.ivaRate || 16);
    let rows = '';
    let subtotal = 0;

    q.items.forEach(item => {
      const srv = state.services.find(s => s.id === item.serviceId);
      if (!srv) return;
      const totalLine = srv.price * item.qty;
      subtotal += totalLine;
      rows += `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${Store.escapeHtml(srv.code)}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(srv.name)}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.qty}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${Store.formatMoney(srv.price)}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">${Store.formatMoney(totalLine)}</td></tr>`;
    });
    q.extraParts.forEach(part => {
      const totalLine = (Number(part.price) || 0) * (Number(part.qty) || 1);
      subtotal += totalLine;
      rows += `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:monospace;">PEÇA</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(part.name || 'Componente')}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${part.qty}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${Store.formatMoney(part.price)}</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">${Store.formatMoney(totalLine)}</td></tr>`;
    });

    const ivaVal = subtotal * (ivaRate / 100);
    document.getElementById('print-sheet').innerHTML = `
      ${buildPrintHeader('ORÇAMENTO / PRO-FORMA', q.number)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;background:#f8fafc;padding:12px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:18px;font-size:12px;">
        <div><div><strong>Cliente:</strong> ${Store.escapeHtml(q.clientName || 'Consumidor Final')}</div><div><strong>Telefone:</strong> ${Store.escapeHtml(q.clientPhone || '—')}</div><div><strong>NIF:</strong> ${Store.escapeHtml(q.clientNif || '—')}</div></div>
        <div><div><strong>Matrícula:</strong> ${Store.escapeHtml(q.vehiclePlate || '—')}</div><div><strong>Viatura:</strong> ${Store.escapeHtml(q.vehicleModel || '—')}</div><div><strong>Notas:</strong> ${Store.escapeHtml(q.notes || '—')}</div></div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px;">
        <thead><tr style="background:#0f172a;color:#fff;text-align:left;"><th style="padding:8px;">Código</th><th style="padding:8px;">Descrição</th><th style="padding:8px;text-align:center;">Qtd</th><th style="padding:8px;text-align:right;">Unit. s/ IVA</th><th style="padding:8px;text-align:right;">Total s/ IVA</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-left:auto;width:270px;font-size:13px;border:1px solid #cbd5e1;padding:12px;border-radius:8px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Subtotal s/ IVA:</span><strong>${Store.formatMoney(subtotal)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>IVA (${ivaRate}% Açores):</span><strong>${Store.formatMoney(ivaVal)}</strong></div>
        <div style="display:flex;justify-content:space-between;border-top:2px solid #0f172a;padding-top:8px;font-size:15px;"><span>TOTAL:</span><strong>${Store.formatMoney(subtotal + ivaVal)}</strong></div>
      </div>`;
    window.print();
  }

  window.printSingleWorkOrder = function (id) {
    const wo = state.workOrders.find(w => w.id === id);
    if (!wo) return;
    document.getElementById('print-sheet').innerHTML = `
      ${buildPrintHeader('FOLHA DE OBRA OFICINAL', wo.id)}
      <div style="background:#f8fafc;padding:14px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;line-height:1.7;">
        <div><strong>Cliente:</strong> ${Store.escapeHtml(wo.client)} | <strong>Telefone:</strong> ${Store.escapeHtml(wo.phone)}</div>
        <div><strong>Matrícula:</strong> ${Store.escapeHtml(wo.plate)} | <strong>Viatura:</strong> ${Store.escapeHtml(wo.vehicle)}</div>
        <div><strong>Estado:</strong> ${Store.escapeHtml(wo.status)} | <strong>Bancada:</strong> ${Store.escapeHtml(wo.bay)}</div>
        <div style="margin-top:8px;"><strong>Trabalhos / Sintomas:</strong><br/>${Store.escapeHtml(wo.desc)}</div>
        <div style="margin-top:12px;font-size:15px;"><strong>Valor Estimado c/ IVA:</strong> ${Store.formatMoney(wo.total)}</div>
      </div>`;
    window.print();
  };

  function printDailySummary() {
    const woRows = state.workOrders.map(w => `<tr><td style="padding:6px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(w.id)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;font-weight:700;">${Store.escapeHtml(w.plate)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(w.client)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(w.status)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:right;">${Store.formatMoney(w.total)}</td></tr>`).join('');
    const bkRows = state.bookings.map(b => `<tr><td style="padding:6px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(b.date)} ${Store.escapeHtml(b.time)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(b.client)} (${Store.escapeHtml(b.phone)})</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(b.vehicle)}</td><td style="padding:6px;border-bottom:1px solid #e2e8f0;">${Store.escapeHtml(b.service)}</td></tr>`).join('');
    document.getElementById('print-sheet').innerHTML = `
      ${buildPrintHeader('FOLHA DIÁRIA DE SECRETARIA & OFICINA', 'RESUMO')}
      <h3 style="font-size:14px;margin:10px 0 6px;">Folhas de Obra (${state.workOrders.length})</h3>
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px;"><thead><tr style="background:#0f172a;color:#fff;text-align:left;"><th style="padding:6px;">Ref</th><th style="padding:6px;">Matrícula</th><th style="padding:6px;">Cliente</th><th style="padding:6px;">Estado</th><th style="padding:6px;text-align:right;">Estimado</th></tr></thead><tbody>${woRows}</tbody></table>
      <h3 style="font-size:14px;margin:10px 0 6px;">Agenda (${state.bookings.length})</h3>
      <table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:#334155;color:#fff;text-align:left;"><th style="padding:6px;">Data / Hora</th><th style="padding:6px;">Cliente</th><th style="padding:6px;">Viatura</th><th style="padding:6px;">Serviço</th></tr></thead><tbody>${bkRows}</tbody></table>`;
    window.print();
  }

  /* =======================================================================
     MASTER RENDER & EVENT WIRING
     ======================================================================= */

  function renderAll() {
    document.getElementById('nav-badge-calls').textContent = state.calls.length;
    document.getElementById('nav-badge-services').textContent = state.services.length;
    document.getElementById('nav-badge-wo').textContent = state.workOrders.filter(w => w.status !== 'Entregue').length;
    document.getElementById('sidebar-iva-badge').textContent = `${state.settings.ivaRate}%`;
    document.getElementById('sidebar-engine-badge').textContent =
      (state.settings.useGemini && state.settings.geminiApiKey) ? 'Gemini API' : 'Local IA';

    renderPricesTab();
    renderAssistantTab();
    renderDashboard();
    renderOfficeSection();
    renderOwnerAccountTab();

    if (window.lucide) lucide.createIcons();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await initOwnerSession();

    // Owner Login
    document.getElementById('form-owner-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('owner-login-error');
      errBox.classList.add('hidden');
      try {
        await Auth.ownerLogin(
          document.getElementById('owner-login-user').value,
          document.getElementById('owner-login-pass').value
        );
        e.target.reset();
        await initOwnerSession();
        Store.showToast(`Bem-vindo à Área do Dono, @${currentOwner.username}!`, 'success');
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
      }
    });

    // Owner Logout
    document.getElementById('btn-owner-logout').addEventListener('click', async () => {
      await Auth.ownerLogout();
      currentOwner = null;
      stopOwnerSyncPoll();
      document.getElementById('owner-auth-overlay').classList.remove('hidden');
      Store.showToast('Sessão do proprietário terminada.', 'info');
    });

    // Owner Account & Security Forms
    document.getElementById('form-owner-profile').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        currentOwner = await Auth.updateOwnerAccount({
          username: document.getElementById('oa-username').value,
          fullName: document.getElementById('oa-fullname').value,
          email: document.getElementById('oa-email').value
        });
        renderOwnerAccountTab();
        Store.showToast('Dados da conta do dono atualizados!', 'success');
      } catch (err) {
        Store.showToast(err.message, 'error');
      }
    });

    document.getElementById('form-owner-password').addEventListener('submit', async (e) => {
      e.preventDefault();
      const curPass = document.getElementById('oa-cur-pass').value;
      const newPass = document.getElementById('oa-new-pass').value;
      const confPass = document.getElementById('oa-conf-pass').value;
      if (newPass !== confPass) {
        Store.showToast('A nova palavra-passe e a confirmação não coincidem.', 'error');
        return;
      }
      try {
        await Auth.updateOwnerAccount({ currentPassword: curPass, newPassword: newPass });
        e.target.reset();
        Store.showToast('Palavra-passe do proprietário alterada com segurança!', 'success');
      } catch (err) {
        Store.showToast(err.message, 'error');
      }
    });

    document.getElementById('btn-refresh-clients').addEventListener('click', async () => {
      await loadMaskedClients();
      Store.showToast('Lista de clientes atualizada.', 'info');
    });

    // Save AI Rules & Hours
    document.getElementById('btn-save-ai-rules').addEventListener('click', async () => {
      state.workshop.hours = document.getElementById('owner-hours-input').value.trim();
      state.settings.aiGreeting = document.getElementById('owner-ai-greeting').value.trim();
      state.settings.aiNotes = document.getElementById('owner-ai-notes').value.trim();
      await saveOwnerChanges('Regras da IA e horário guardados! Site do Cliente atualizado.');
    });

    // Navigation & Mobile Menu
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    document.getElementById('btn-mobile-menu').addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('hidden');
    });
    document.getElementById('btn-close-mobile-menu').addEventListener('click', () => {
      document.getElementById('sidebar').classList.add('hidden');
    });
    document.getElementById('btn-quick-test-call').addEventListener('click', () => {
      switchTab('assistant');
      startSimulatedCall();
    });

    // Dashboard shortcuts
    document.querySelectorAll('[data-tab-jump]').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tabJump));
    });
    document.querySelector('[data-action="dash-call"]').addEventListener('click', () => {
      switchTab('assistant');
      startSimulatedCall();
    });
    document.querySelector('[data-action="dash-new-wo"]').addEventListener('click', () => openEditWorkOrderModal(null));
    document.querySelector('[data-action="dash-prices"]').addEventListener('click', () => switchTab('prices'));
    document.querySelector('[data-action="dash-print-day"]').addEventListener('click', printDailySummary);

    // Assistant Tab
    document.getElementById('btn-start-call').addEventListener('click', startSimulatedCall);
    document.getElementById('btn-end-call').addEventListener('click', endAndSaveCall);
    document.getElementById('btn-mic').addEventListener('click', toggleMicrophone);
    document.getElementById('btn-clear-call-chat').addEventListener('click', () => {
      activeCall.messages = [];
      activeCall.triage.services = [];
      activeCall.triage.intent = 'Aguardar chamada...';
      renderCallTranscript();
      renderCallTriage();
    });
    document.getElementById('call-message-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = document.getElementById('call-message-input');
      const txt = inp.value;
      inp.value = '';
      handleCallerMessage(txt);
    });
    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.addEventListener('click', () => handleCallerMessage(btn.dataset.scenario));
    });
    document.getElementById('triage-vehicle').addEventListener('input', (e) => {
      activeCall.triage.vehicle = e.target.value;
    });

    document.getElementById('btn-triage-booking').addEventListener('click', async () => {
      const name = document.getElementById('call-name-input').value.trim() || 'Cliente Telefónico';
      const phone = document.getElementById('call-phone-input').value.trim() || '296 383 150';
      const vehicle = document.getElementById('triage-vehicle').value.trim() || 'Viatura a confirmar';
      const serviceSummary = activeCall.triage.services.map(s => `${s.qty}x ${s.name}`).join(', ') || activeCall.triage.intent;
      state.bookings.unshift({
        id: 'AG-' + Date.now().toString().slice(-3),
        userId: '',
        username: '',
        client: name,
        phone,
        vehicle,
        date: Store.getTodayISO(1),
        time: '09:30',
        service: serviceSummary,
        source: 'Assistente IA',
        status: 'Confirmada'
      });
      await saveOwnerChanges(`Marcação criada na Agenda para ${name}!`);
    });

    document.getElementById('btn-triage-workorder').addEventListener('click', async () => {
      const name = document.getElementById('call-name-input').value.trim() || 'Cliente Telefónico';
      const phone = document.getElementById('call-phone-input').value.trim() || '296 383 150';
      const vehRaw = document.getElementById('triage-vehicle').value.trim() || 'Por Indicar';
      const serviceSummary = activeCall.triage.services.map(s => `${s.qty}x ${s.name}`).join('; ') || activeCall.triage.intent;
      state.workOrders.unshift({
        id: 'FO-2026-' + (100 + state.workOrders.length + 1),
        client: name,
        phone,
        plate: vehRaw.split('•')[0].trim().slice(0, 12) || 'A CONFIRMAR',
        vehicle: vehRaw,
        status: 'Aguardar Orçamento',
        bay: 'Por Atribuir',
        desc: `Assistente IA: ${serviceSummary}`,
        total: activeCall.triage.totalWithVat,
        createdAt: Store.getTodayISO(0)
      });
      await saveOwnerChanges('Folha de Obra criada!');
    });

    document.getElementById('btn-triage-quote').addEventListener('click', async () => {
      state.quoteDraft.clientName = document.getElementById('call-name-input').value.trim();
      state.quoteDraft.clientPhone = document.getElementById('call-phone-input').value.trim();
      const vehRaw = document.getElementById('triage-vehicle').value.trim();
      state.quoteDraft.vehiclePlate = vehRaw.split('•')[0]?.trim() || '';
      state.quoteDraft.vehicleModel = vehRaw;
      state.quoteDraft.items = activeCall.triage.services.map(s => ({ serviceId: s.serviceId, qty: s.qty }));
      state.quoteDraft.notes = `Triagem IA: ${activeCall.triage.intent}`;
      await Store.saveOwnerState(state, Auth.getOwnerToken());
      switchTab('office');
      switchOfficeSubtab('quotes');
    });

    document.getElementById('ai-tts-toggle').addEventListener('change', (e) => {
      state.settings.ttsEnabled = e.target.checked;
      if (!e.target.checked) AI.stopSpeaking();
      Store.saveOwnerState(state, Auth.getOwnerToken());
    });
    document.getElementById('ai-auto-answer').addEventListener('change', (e) => {
      state.settings.autoAnswer = e.target.checked;
      Store.saveOwnerState(state, Auth.getOwnerToken());
    });
    document.getElementById('call-history-search').addEventListener('input', renderCallHistory);

    // Prices Tab
    document.getElementById('price-search').addEventListener('input', renderPricesTab);
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => { selectedPriceCategory = pill.dataset.cat; renderPricesTab(); });
    });
    document.querySelectorAll('.bulk-pct-btn').forEach(btn => {
      btn.addEventListener('click', () => applyBulkPercentage(btn.dataset.bulk));
    });
    document.getElementById('btn-apply-bulk').addEventListener('click', () => {
      applyBulkPercentage(document.getElementById('bulk-percent-input').value);
    });
    document.getElementById('iva-rate-input').addEventListener('change', (e) => {
      state.settings.ivaRate = Math.max(0, Math.min(30, parseFloat(e.target.value) || 0));
      saveOwnerChanges(`Taxa de IVA atualizada para ${state.settings.ivaRate}%.`);
    });
    document.getElementById('btn-new-service').addEventListener('click', () => openEditServiceModal(null));

    document.getElementById('srv-image-file').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('srv-image').value = ev.target.result;
        Store.showToast('Foto carregada!', 'info');
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('form-service').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('srv-id').value;
      const category = document.getElementById('srv-category').value;
      const payload = {
        id: id || ('srv-' + Date.now()),
        code: document.getElementById('srv-code').value.trim().toUpperCase(),
        category,
        name: document.getElementById('srv-name').value.trim(),
        description: document.getElementById('srv-desc').value.trim(),
        price: Math.max(0, parseFloat(document.getElementById('srv-price').value) || 0),
        duration: document.getElementById('srv-duration').value.trim() || '1h00',
        warranty: document.getElementById('srv-warranty').value.trim() || '12 meses',
        stock: document.getElementById('srv-stock').value,
        image: document.getElementById('srv-image').value.trim(),
        fallback: Store.CATEGORY_FALLBACKS[category] || 'assets/hero-oficina.svg',
        visible: document.getElementById('srv-visible').checked
      };
      if (id) {
        const idx = state.services.findIndex(s => s.id === id);
        if (idx !== -1) state.services[idx] = { ...state.services[idx], ...payload };
      } else {
        state.services.unshift(payload);
      }
      closeModal('modal-service');
      await saveOwnerChanges(`Serviço "${payload.code}" guardado e sincronizado!`);
    });

    // Office Tab
    document.querySelectorAll('#office-subtabs .subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchOfficeSubtab(btn.dataset.subtab));
    });
    document.getElementById('wo-search').addEventListener('input', renderWorkOrders);
    document.getElementById('wo-status-filter').addEventListener('change', renderWorkOrders);
    document.getElementById('btn-new-workorder').addEventListener('click', () => openEditWorkOrderModal(null));

    document.getElementById('form-workorder').addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('wo-id').value;
      const payload = {
        id: id || ('FO-2026-' + (100 + state.workOrders.length + 1)),
        client: document.getElementById('wo-client').value.trim(),
        phone: document.getElementById('wo-phone').value.trim(),
        plate: document.getElementById('wo-plate').value.trim().toUpperCase(),
        vehicle: document.getElementById('wo-vehicle').value.trim(),
        status: document.getElementById('wo-status').value,
        bay: document.getElementById('wo-bay').value,
        desc: document.getElementById('wo-desc').value.trim(),
        total: parseFloat(document.getElementById('wo-total').value) || 0,
        createdAt: Store.getTodayISO(0)
      };
      if (id) {
        const idx = state.workOrders.findIndex(w => w.id === id);
        if (idx !== -1) state.workOrders[idx] = payload;
      } else {
        state.workOrders.unshift(payload);
      }
      closeModal('modal-workorder');
      await saveOwnerChanges(`Folha ${payload.id} guardada.`);
    });

    document.getElementById('btn-new-booking').addEventListener('click', () => {
      document.getElementById('bk-date').value = Store.getTodayISO(0);
      openModal('modal-booking');
    });
    document.getElementById('form-booking').addEventListener('submit', async (e) => {
      e.preventDefault();
      state.bookings.unshift({
        id: 'AG-' + Date.now().toString().slice(-3),
        userId: '',
        username: '',
        client: document.getElementById('bk-client').value.trim(),
        phone: document.getElementById('bk-phone').value.trim(),
        vehicle: document.getElementById('bk-vehicle').value.trim() || 'Por indicar',
        date: document.getElementById('bk-date').value,
        time: document.getElementById('bk-time').value,
        service: document.getElementById('bk-service').value.trim() || 'Diagnóstico / Revisão',
        source: 'Secretaria',
        status: 'Confirmada'
      });
      closeModal('modal-booking');
      e.target.reset();
      await saveOwnerChanges('Marcação adicionada à agenda!');
    });

    ['q-client-name', 'q-client-phone', 'q-client-nif', 'q-client-email', 'q-vehicle-plate', 'q-vehicle-model', 'q-notes'].forEach(id => {
      document.getElementById(id).addEventListener('input', syncQuoteHeaderInputs);
    });
    document.getElementById('btn-add-extra-part').addEventListener('click', async () => {
      state.quoteDraft.extraParts.push({ name: '', qty: 1, price: 0 });
      await Store.saveOwnerState(state, Auth.getOwnerToken());
      renderQuoteBuilder();
    });
    document.getElementById('quote-iva-override').addEventListener('change', renderQuoteBuilder);
    document.getElementById('btn-print-quote').addEventListener('click', printQuoteDocument);
    document.getElementById('btn-save-quote-wo').addEventListener('click', async () => {
      syncQuoteHeaderInputs();
      const q = state.quoteDraft;
      if (!q.clientName || !q.vehiclePlate) {
        Store.showToast('Preencha pelo menos o Nome e a Matrícula.', 'warning');
        return;
      }
      const subtotal = q.items.reduce((acc, i) => {
        const srv = state.services.find(s => s.id === i.serviceId);
        return acc + (srv ? srv.price * i.qty : 0);
      }, 0) + q.extraParts.reduce((acc, p) => acc + (p.price * p.qty), 0);
      const ivaRate = Number(document.getElementById('quote-iva-override').value || state.settings.ivaRate || 16);
      const desc = q.items.map(i => {
        const srv = state.services.find(s => s.id === i.serviceId);
        return srv ? `${i.qty}x ${srv.name}` : '';
      }).filter(Boolean).join('; ');
      state.workOrders.unshift({
        id: 'FO-2026-' + (100 + state.workOrders.length + 1),
        client: q.clientName,
        phone: q.clientPhone || '—',
        plate: q.vehiclePlate.toUpperCase(),
        vehicle: q.vehicleModel || 'Viatura',
        status: 'Aguardar Orçamento',
        bay: 'Por Atribuir',
        desc: desc || q.notes || 'Orçamento guardado',
        total: Math.round(subtotal * (1 + ivaRate / 100) * 100) / 100,
        createdAt: Store.getTodayISO(0)
      });
      await saveOwnerChanges('Orçamento convertido em Folha de Obra!');
      switchOfficeSubtab('workorders');
    });
    document.getElementById('btn-clear-quote').addEventListener('click', async () => {
      state.quoteDraft = Store.getDefaultState().quoteDraft;
      await Store.saveOwnerState(state, Auth.getOwnerToken());
      renderQuoteBuilder();
    });

    // Settings Modal
    const openSettingsFn = () => {
      document.getElementById('cfg-gemini-key').value = state.settings.geminiApiKey || '';
      document.getElementById('cfg-gemini-model').value = state.settings.geminiModel || 'gemini-2.5-flash';
      document.getElementById('cfg-use-gemini').checked = Boolean(state.settings.useGemini);
      openModal('modal-settings');
    };
    document.getElementById('btn-open-settings').addEventListener('click', openSettingsFn);
    document.getElementById('btn-assistant-gemini-cfg').addEventListener('click', openSettingsFn);

    document.getElementById('btn-save-settings').addEventListener('click', async () => {
      state.settings.geminiApiKey = document.getElementById('cfg-gemini-key').value.trim();
      state.settings.geminiModel = document.getElementById('cfg-gemini-model').value;
      state.settings.useGemini = document.getElementById('cfg-use-gemini').checked;
      closeModal('modal-settings');
      await saveOwnerChanges('Definições guardadas!');
    });

    document.getElementById('btn-clear-sample-data').addEventListener('click', async () => {
      if (!confirm('Isto apaga os clientes, chamadas e folhas de obra fictícias, mantendo os seus preços e regras da IA. Continuar?')) return;
      state = Store.clearSampleData(state);
      closeModal('modal-settings');
      await saveOwnerChanges('Dados fictícios limpos!');
    });

    document.getElementById('btn-export-json').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `centro-diesel-backup-${Store.getTodayISO(0)}.json`;
      a.click();
    });

    document.getElementById('input-import-json').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!imported.services) throw new Error('Inválido');
          state = Store.mergeWithDefault(imported);
          closeModal('modal-settings');
          await saveOwnerChanges('Backup restaurado!');
        } catch (_) {
          Store.showToast('Ficheiro de backup inválido.', 'error');
        }
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-reset-data').addEventListener('click', async () => {
      if (!confirm('Repor os preços e dados de origem?')) return;
      state = Store.getDefaultState();
      closeModal('modal-settings');
      await saveOwnerChanges('Dados originais repostos.');
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
    });
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.add('hidden');
      });
    });
  });
})();
