/* =========================================================================
   CENTRO DIESEL — Versão Pública do Cliente (index.html + cliente.js)
   Lê os preços, horários e notas do Dono em tempo real via CentroDieselStore.
   ========================================================================= */

(function () {
  const Store = window.CentroDieselStore;
  const AI = window.CentroDieselAI;

  let state = Store.loadState();
  let selectedCategory = 'Todas';

  let clientCall = {
    open: false,
    messages: [],
    triage: {
      intent: 'Consulta de Cliente',
      vehicle: '',
      services: [],
      totalWithVat: 0
    },
    isListening: false,
    recognition: null
  };

  function renderPublicSite() {
    const w = state.workshop || {};
    const iva = Number(state.settings.ivaRate || 16);

    document.getElementById('client-hero-hours').textContent = w.hours || 'Segunda a Sexta: 08:30 – 12:30 | 14:00 – 18:00';
    document.getElementById('client-iva-badge').textContent = iva;
    document.getElementById('c-info-company').textContent = w.company || 'Manuel Francisco Raposo & Ca. Lda.';
    document.getElementById('c-info-address').textContent = w.address || '';
    document.getElementById('c-info-region').textContent = w.region || 'Ilha de São Miguel, Açores';
    document.getElementById('c-info-phone').textContent = w.phone || '296 383 150';
    document.getElementById('c-info-email').textContent = w.email || 'mfrcentrodiesel@gmail.com';
    document.getElementById('c-info-hours').textContent = w.hours || '';

    // Owner announcement / AI notes banner
    const notes = (state.settings.aiNotes || '').trim();
    const noticeBox = document.getElementById('client-owner-notice');
    if (notes) {
      noticeBox.classList.remove('hidden');
      document.getElementById('client-owner-notice-text').textContent = notes;
    } else {
      noticeBox.classList.add('hidden');
    }

    renderPublicServices();

    if (window.lucide) window.lucide.createIcons();
  }

  function renderPublicServices() {
    const search = (document.getElementById('client-price-search').value || '').trim().toLowerCase();
    const showVat = document.getElementById('client-toggle-vat').checked;
    const iva = Number(state.settings.ivaRate || 16);

    document.querySelectorAll('.c-cat-pill').forEach(pill => {
      const active = pill.dataset.cat === selectedCategory;
      pill.className = active
        ? 'c-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white'
        : 'c-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
    });

    const visibleServices = state.services.filter(s => s.visible !== false);
    const filtered = visibleServices.filter(srv => {
      const matchCat = selectedCategory === 'Todas' || srv.category === selectedCategory;
      const matchSearch = !search ||
        srv.name.toLowerCase().includes(search) ||
        srv.code.toLowerCase().includes(search) ||
        srv.category.toLowerCase().includes(search) ||
        (srv.description || '').toLowerCase().includes(search);
      return matchCat && matchSearch;
    });

    const grid = document.getElementById('client-services-grid');
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">Nenhum serviço encontrado para esta pesquisa.</div>`;
    } else {
      const stockBadge = {
        'Disponível': 'bg-emerald-500/90 text-white',
        'Stock Reduzido': 'bg-amber-500/95 text-slate-950',
        'Peça por Encomenda': 'bg-rose-600/90 text-white'
      };

      grid.innerHTML = filtered.map(srv => {
        const imgSrc = Store.escapeHtml(srv.image || srv.fallback || Store.CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
        const fallbackSrc = Store.escapeHtml(srv.fallback || Store.CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
        const mainPrice = showVat ? Store.calcWithVat(srv.price, iva) : srv.price;
        const altPrice = showVat ? srv.price : Store.calcWithVat(srv.price, iva);

        return `
          <article class="service-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div class="relative h-44 bg-slate-900 overflow-hidden">
                <img src="${imgSrc}" onerror="this.onerror=null;this.src='${fallbackSrc}';" alt="${Store.escapeHtml(srv.name)}" class="service-card-img w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/25"></div>
                <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/85 text-amber-400 text-[11px] font-bold">${Store.escapeHtml(srv.category)}</span>
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${stockBadge[srv.stock] || 'bg-slate-700 text-white'}">${Store.escapeHtml(srv.stock)}</span>
                <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
                  <span>Duração: <strong>${Store.escapeHtml(srv.duration)}</strong></span>
                  <span>Garantia: <strong>${Store.escapeHtml(srv.warranty)}</strong></span>
                </div>
              </div>
              <div class="p-4 space-y-1.5">
                <div class="text-[10px] font-mono font-bold text-slate-400">${Store.escapeHtml(srv.code)}</div>
                <h3 class="font-extrabold text-sm text-slate-900 leading-snug">${Store.escapeHtml(srv.name)}</h3>
                <p class="text-xs text-slate-500 leading-relaxed">${Store.escapeHtml(srv.description)}</p>
              </div>
            </div>
            <div class="px-4 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <div>
                <div class="text-[10px] font-bold uppercase text-slate-500">${showVat ? `Preço c/ IVA (${iva}%)` : 'Preço Base s/ IVA'}</div>
                <div class="text-lg font-extrabold text-slate-900">${Store.formatMoney(mainPrice)}</div>
                <div class="text-[10px] text-slate-400">${showVat ? `(${Store.formatMoney(altPrice)} s/ IVA)` : `(${Store.formatMoney(altPrice)} c/ IVA)`}</div>
              </div>
              <a href="#marcacao" onclick="selectClientService('${Store.escapeHtml(srv.name)}')" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shrink-0">
                Pedir Marcação
              </a>
            </div>
          </article>
        `;
      }).join('');
    }

    // Update booking select dropdown
    const selectEl = document.getElementById('c-service');
    const prevVal = selectEl.value;
    selectEl.innerHTML = visibleServices.map(s =>
      `<option value="${Store.escapeHtml(s.name)}">${Store.escapeHtml(s.name)} (${Store.formatMoney(Store.calcWithVat(s.price, iva))} c/ IVA)</option>`
    ).join('') + `<option value="Outro / Informação Geral">Outro Assunto / Pedido de Informação</option>`;
    if (prevVal) selectEl.value = prevVal;
  }

  window.selectClientService = function (serviceName) {
    const sel = document.getElementById('c-service');
    if (sel) sel.value = serviceName;
  };

  /* =======================================================================
     CLIENT INTERACTIVE AI PHONE MODAL
     ======================================================================= */

  function openClientAIModal() {
    clientCall.open = true;
    document.getElementById('modal-client-ai').classList.remove('hidden');
    document.getElementById('cai-tts-toggle').checked = state.settings.ttsEnabled !== false;

    if (clientCall.messages.length === 0) {
      const greeting = state.settings.aiGreeting || Store.getDefaultState().settings.aiGreeting;
      clientCall.messages.push({ sender: 'ai', text: greeting });
      renderClientAITranscript();
      speakClientAI(greeting);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function closeClientAIModal() {
    clientCall.open = false;
    AI.stopSpeaking(() => {
      document.getElementById('cai-wave').classList.remove('speaking');
    });
    stopClientMic();
    document.getElementById('modal-client-ai').classList.add('hidden');
  }

  function speakClientAI(text) {
    const ttsOn = document.getElementById('cai-tts-toggle').checked;
    const wave = document.getElementById('cai-wave');
    AI.speakPortuguese(
      text,
      ttsOn,
      () => wave && wave.classList.add('speaking'),
      () => wave && wave.classList.remove('speaking')
    );
  }

  function renderClientAITranscript() {
    const box = document.getElementById('cai-transcript');
    box.innerHTML = clientCall.messages.map(m => {
      const isAi = m.sender === 'ai';
      return `
        <div class="flex ${isAi ? 'justify-start' : 'justify-end'}">
          <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
            isAi ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm' : 'bg-slate-900 text-white rounded-tr-sm'
          }">
            <div class="text-[10px] font-bold uppercase mb-1 ${isAi ? 'text-amber-600' : 'text-amber-400'}">
              ${isAi ? 'Assistente Centro Diesel' : (document.getElementById('cai-name').value.trim() || 'Você')}
            </div>
            <div class="whitespace-pre-line">${Store.escapeHtml(m.text)}</div>
          </div>
        </div>
      `;
    }).join('');
    box.scrollTop = box.scrollHeight;

    // Quote summary bar
    const quoteBox = document.getElementById('cai-quote-box');
    const iva = Number(state.settings.ivaRate || 16);
    if (clientCall.triage.services.length > 0) {
      quoteBox.classList.remove('hidden');
      const totalVat = clientCall.triage.services.reduce((sum, item) => {
        const live = state.services.find(s => s.id === item.serviceId);
        const unit = live ? live.price : item.unitPrice;
        return sum + Store.calcWithVat(unit * item.qty, iva);
      }, 0);
      clientCall.triage.totalWithVat = Math.round(totalVat * 100) / 100;
      document.getElementById('cai-quote-summary').textContent =
        clientCall.triage.services.map(s => `${s.qty}x ${s.name}`).join(' • ');
      document.getElementById('cai-quote-total').textContent = Store.formatMoney(clientCall.triage.totalWithVat);
    } else {
      quoteBox.classList.add('hidden');
    }
  }

  async function sendClientAIMessage(rawText) {
    const text = (rawText || '').trim();
    if (!text) return;
    clientCall.messages.push({ sender: 'caller', text });
    const veh = AI.extractVehicleInfo(text);
    if (veh) clientCall.triage.vehicle = veh;
    renderClientAITranscript();

    const reply = await AI.generateReply(state, text, clientCall.triage.intent);
    clientCall.triage.intent = reply.intent;
    reply.detectedServices.forEach(item => {
      const existing = clientCall.triage.services.find(s => s.serviceId === item.serviceId);
      if (existing) existing.qty = item.qty;
      else clientCall.triage.services.push(item);
    });

    clientCall.messages.push({ sender: 'ai', text: reply.text });
    renderClientAITranscript();
    speakClientAI(reply.text);
  }

  function stopClientMic() {
    clientCall.isListening = false;
    if (clientCall.recognition) {
      try { clientCall.recognition.stop(); } catch (_) {}
    }
    const wave = document.getElementById('cai-wave');
    if (wave) wave.classList.remove('listening');
    document.getElementById('cai-mic-label').textContent = 'Falar';
  }

  function toggleClientMic() {
    if (clientCall.isListening) {
      stopClientMic();
      return;
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      Store.showToast('O seu navegador não suporta microfone. Escreva a sua pergunta abaixo.', 'warning');
      return;
    }
    AI.stopSpeaking();
    const rec = new SpeechRec();
    rec.lang = 'pt-PT';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    clientCall.recognition = rec;

    const wave = document.getElementById('cai-wave');
    rec.onstart = () => {
      clientCall.isListening = true;
      wave.classList.add('listening');
      document.getElementById('cai-mic-label').textContent = 'A ouvir...';
    };
    rec.onresult = (e) => {
      const txt = e.results[0][0].transcript;
      if (txt) sendClientAIMessage(txt);
    };
    rec.onerror = () => stopClientMic();
    rec.onend = () => stopClientMic();
    rec.start();
  }

  async function saveClientCallRecord(statusLabel) {
    if (clientCall.messages.length <= 1) return;
    const callerName = document.getElementById('cai-name').value.trim() || 'Visitante do Site';
    const callerPhone = document.getElementById('cai-phone').value.trim() || 'Via Web';

    state.calls.unshift({
      id: 'CH-' + Date.now().toString().slice(-4),
      timestamp: new Date().toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      phone: callerPhone,
      callerName,
      duration: 'Web IA',
      intent: clientCall.triage.intent,
      vehicle: clientCall.triage.vehicle || 'Não indicada',
      quotedTotal: clientCall.triage.totalWithVat || 0,
      status: statusLabel,
      messages: [...clientCall.messages]
    });
    await Store.saveState(state);
  }

  /* =======================================================================
     BOOTSTRAP & SYNC
     ======================================================================= */

  document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('c-date').value = Store.getTodayISO(1);

    // Sync initial state from server if running via server.ps1
    const syncRes = await Store.syncFromServer(state);
    if (syncRes.changed) state = syncRes.state;
    renderPublicSite();

    // Real-time sync when Owner edits prices/hours/notes in dono.html
    Store.subscribeSync(
      () => state,
      (newState) => {
        state = newState;
        renderPublicSite();
        if (clientCall.open) renderClientAITranscript();
        Store.showToast('Preçário atualizado pela oficina!', 'info');
      }
    );

    // Filters
    document.getElementById('client-price-search').addEventListener('input', renderPublicServices);
    document.getElementById('client-toggle-vat').addEventListener('change', renderPublicServices);
    document.querySelectorAll('.c-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        selectedCategory = pill.dataset.cat;
        renderPublicServices();
      });
    });

    // Booking Form -> Saves directly to shared state for dono.html
    document.getElementById('client-booking-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const client = document.getElementById('c-name').value.trim();
      const phone = document.getElementById('c-phone').value.trim();
      const vehicle = document.getElementById('c-vehicle').value.trim();
      const service = document.getElementById('c-service').value;
      const date = document.getElementById('c-date').value || Store.getTodayISO(1);
      const msg = document.getElementById('c-message').value.trim();

      state.bookings.unshift({
        id: 'AG-' + Date.now().toString().slice(-3),
        client,
        phone,
        vehicle,
        date,
        time: '09:30',
        service: `${service} — "${msg}"`,
        source: 'Site Cliente',
        status: 'Pendente'
      });
      await Store.saveState(state);
      e.target.reset();
      document.getElementById('c-date').value = Store.getTodayISO(1);
      Store.showToast(`Obrigado, ${client}! O seu pedido entrou na agenda da Centro Diesel.`, 'success');
    });

    // Client AI Phone Modal Triggers
    ['btn-open-client-ai', 'btn-hero-open-ai', 'btn-card-open-ai', 'btn-fab-ai'].forEach(id => {
      document.getElementById(id).addEventListener('click', openClientAIModal);
    });
    document.getElementById('btn-close-client-ai').addEventListener('click', closeClientAIModal);
    document.getElementById('cai-mic').addEventListener('click', toggleClientMic);

    document.getElementById('cai-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const inp = document.getElementById('cai-input');
      const txt = inp.value;
      inp.value = '';
      sendClientAIMessage(txt);
    });

    document.querySelectorAll('.cai-quick').forEach(btn => {
      btn.addEventListener('click', () => sendClientAIMessage(btn.dataset.caiQ));
    });

    document.getElementById('cai-confirm-booking').addEventListener('click', async () => {
      const client = document.getElementById('cai-name').value.trim() || 'Cliente Assistente IA';
      const phone = document.getElementById('cai-phone').value.trim() || 'A confirmar';
      const vehicle = clientCall.triage.vehicle || 'Viatura a confirmar';
      const serviceText = clientCall.triage.services.map(s => `${s.qty}x ${s.name}`).join(', ') || clientCall.triage.intent;

      state.bookings.unshift({
        id: 'AG-' + Date.now().toString().slice(-3),
        client,
        phone,
        vehicle,
        date: Store.getTodayISO(1),
        time: '09:30',
        service: serviceText,
        source: 'Assistente IA (Site)',
        status: 'Confirmada'
      });
      await saveClientCallRecord('Convertida em Marcação');
      Store.showToast('Pré-marcação enviada para a secretaria da oficina!', 'success');
      closeClientAIModal();
    });

    document.getElementById('cai-end-call').addEventListener('click', async () => {
      await saveClientCallRecord('Consulta no Site');
      clientCall.messages = [];
      clientCall.triage.services = [];
      closeClientAIModal();
      Store.showToast('Chamada registada. Obrigado por contactar a Centro Diesel!', 'info');
    });
  });
})();
