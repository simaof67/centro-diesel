/* =========================================================================
   CENTRO DIESEL — Versão Pública do Cliente + Conta Privada (index.html)
   ========================================================================= */

(function () {
  const Store = window.CentroDieselStore;
  const Auth = window.CentroDieselAuth;
  const AI = window.CentroDieselAI;

  let publicState = Store.getDefaultState();
  let selectedCategory = 'Todas';
  let currentClient = null;
  let myBookings = [];
  let myCalls = [];

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

  /* =======================================================================
     VIEW SWITCHING (OFICINA vs A MINHA CONTA)
     ======================================================================= */

  function showClientView(viewName) {
    const homeEl = document.getElementById('view-client-home');
    const acctEl = document.getElementById('view-client-account');
    const btnHome = document.getElementById('btn-nav-client-home');
    const btnAcct = document.getElementById('btn-nav-client-account');

    if (viewName === 'account') {
      homeEl.classList.add('hidden');
      acctEl.classList.remove('hidden');
      btnHome.classList.remove('text-amber-400');
      btnAcct.classList.add('border-amber-500');
      refreshClientAccount();
    } else {
      acctEl.classList.add('hidden');
      homeEl.classList.remove('hidden');
      btnHome.classList.add('text-amber-400');
      btnAcct.classList.remove('border-amber-500');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  }

  /* =======================================================================
     PUBLIC SITE RENDERING
     ======================================================================= */

  function renderPublicSite() {
    const w = publicState.workshop || {};
    const iva = Number(publicState.settings.ivaRate || 16);

    document.getElementById('client-hero-hours').textContent = w.hours || 'Segunda a Sexta: 08:30 – 12:30 | 14:00 – 18:00';
    document.getElementById('client-iva-badge').textContent = iva;
    document.getElementById('c-info-company').textContent = w.company || 'Manuel Francisco Raposo & Ca. Lda.';
    document.getElementById('c-info-address').textContent = w.address || '';
    document.getElementById('c-info-region').textContent = w.region || 'Ilha de São Miguel, Açores';
    document.getElementById('c-info-phone').textContent = w.phone || '296 383 150';
    document.getElementById('c-info-email').textContent = w.email || 'mfrcentrodiesel@gmail.com';
    document.getElementById('c-info-hours').textContent = w.hours || '';

    const notes = (publicState.settings.aiNotes || '').trim();
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
    const iva = Number(publicState.settings.ivaRate || 16);

    document.querySelectorAll('.c-cat-pill').forEach(pill => {
      const active = pill.dataset.cat === selectedCategory;
      pill.className = active
        ? 'c-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white'
        : 'c-cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
    });

    const visibleServices = (publicState.services || []).filter(s => s.visible !== false);
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
     CLIENT ACCOUNT MANAGEMENT (STRICT ISOLATION)
     ======================================================================= */

  async function refreshClientAccount() {
    const data = await Auth.getClientMe();
    if (data && data.user) {
      currentClient = data.user;
      myBookings = data.myBookings || [];
      myCalls = data.myCalls || [];
    } else {
      currentClient = null;
      myBookings = [];
      myCalls = [];
    }
    renderClientAccountUI();
  }

  function renderClientAccountUI() {
    const navLabel = document.getElementById('nav-client-account-label');
    const authCard = document.getElementById('client-auth-card');
    const dash = document.getElementById('client-account-dashboard');
    const bookingPill = document.getElementById('booking-auth-pill');

    if (currentClient) {
      navLabel.textContent = `@${currentClient.username}`;
      authCard.classList.add('hidden');
      dash.classList.remove('hidden');

      bookingPill.textContent = `Sessão ativa: @${currentClient.username}`;
      bookingPill.classList.remove('hidden');

      // Pre-fill booking and AI forms with authenticated user's own details
      if (!document.getElementById('c-name').value) document.getElementById('c-name').value = currentClient.fullName || '';
      if (!document.getElementById('c-phone').value) document.getElementById('c-phone').value = currentClient.phone || '';
      if (!document.getElementById('c-email').value) document.getElementById('c-email').value = currentClient.email || '';
      if (!document.getElementById('c-vehicle').value) document.getElementById('c-vehicle').value = currentClient.vehicle || '';
      document.getElementById('cai-name').value = currentClient.fullName || '';
      document.getElementById('cai-phone').value = currentClient.phone || '';

      document.getElementById('acct-avatar').textContent = (currentClient.fullName || currentClient.username || 'C').charAt(0).toUpperCase();
      document.getElementById('acct-fullname').textContent = currentClient.fullName;
      document.getElementById('acct-username').textContent = `@${currentClient.username}`;
      document.getElementById('acct-email').textContent = currentClient.email;

      document.getElementById('prof-fullname').value = currentClient.fullName || '';
      document.getElementById('prof-email').value = currentClient.email || '';
      document.getElementById('prof-phone').value = currentClient.phone || '';
      document.getElementById('prof-vehicle').value = currentClient.vehicle || '';

      const bkEl = document.getElementById('acct-my-bookings');
      if (myBookings.length === 0) {
        bkEl.innerHTML = `<div class="text-slate-400 italic py-3">Ainda não tem marcações associadas à sua conta.</div>`;
      } else {
        bkEl.innerHTML = myBookings.map(b => `
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-bold text-slate-900">${Store.escapeHtml(b.date)} às ${Store.escapeHtml(b.time)} • ${Store.escapeHtml(b.vehicle)}</div>
              <div class="text-slate-600 mt-0.5">${Store.escapeHtml(b.service)}</div>
            </div>
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">${Store.escapeHtml(b.status)}</span>
          </div>`).join('');
      }

      const callsEl = document.getElementById('acct-my-calls');
      if (myCalls.length === 0) {
        callsEl.innerHTML = `<div class="text-slate-400 italic py-3">Nenhuma consulta registada na sua conta.</div>`;
      } else {
        callsEl.innerHTML = myCalls.map(c => `
          <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div class="font-bold text-slate-900">${Store.escapeHtml(c.intent)} • ${Store.escapeHtml(c.timestamp)}</div>
              <div class="text-slate-600">Viatura: ${Store.escapeHtml(c.vehicle)}</div>
            </div>
            <span class="font-extrabold text-emerald-700">${Store.formatMoney(c.quotedTotal)}</span>
          </div>`).join('');
      }
    } else {
      navLabel.textContent = 'A Minha Conta';
      dash.classList.add('hidden');
      authCard.classList.remove('hidden');
      bookingPill.classList.add('hidden');
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function switchAuthFormTab(mode) {
    const btnLogin = document.getElementById('tab-btn-login');
    const btnReg = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('form-client-login');
    const formReg = document.getElementById('form-client-register');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('reg-error').classList.add('hidden');

    if (mode === 'register') {
      btnReg.className = 'py-3.5 text-xs font-extrabold text-slate-900 bg-white border-b-2 border-amber-500';
      btnLogin.className = 'py-3.5 text-xs font-bold text-slate-500 hover:text-slate-800';
      formLogin.classList.add('hidden');
      formReg.classList.remove('hidden');
    } else {
      btnLogin.className = 'py-3.5 text-xs font-extrabold text-slate-900 bg-white border-b-2 border-amber-500';
      btnReg.className = 'py-3.5 text-xs font-bold text-slate-500 hover:text-slate-800';
      formReg.classList.add('hidden');
      formLogin.classList.remove('hidden');
    }
  }

  /* =======================================================================
     CLIENT INTERACTIVE AI PHONE MODAL
     ======================================================================= */

  function openClientAIModal() {
    clientCall.open = true;
    document.getElementById('modal-client-ai').classList.remove('hidden');
    document.getElementById('cai-tts-toggle').checked = publicState.settings.ttsEnabled !== false;
    if (currentClient) {
      if (!document.getElementById('cai-name').value) document.getElementById('cai-name').value = currentClient.fullName || '';
      if (!document.getElementById('cai-phone').value) document.getElementById('cai-phone').value = currentClient.phone || '';
    }

    if (clientCall.messages.length === 0) {
      const greeting = publicState.settings.aiGreeting || Store.getDefaultState().settings.aiGreeting;
      clientCall.messages.push({ sender: 'ai', text: greeting });
      renderClientAITranscript();
      speakClientAI(greeting);
    }
    if (window.lucide) window.lucide.createIcons();
  }

  function closeClientAIModal() {
    clientCall.open = false;
    AI.stopSpeaking(() => document.getElementById('cai-wave').classList.remove('speaking'));
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
        </div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;

    const quoteBox = document.getElementById('cai-quote-box');
    const iva = Number(publicState.settings.ivaRate || 16);
    if (clientCall.triage.services.length > 0) {
      quoteBox.classList.remove('hidden');
      const totalVat = clientCall.triage.services.reduce((sum, item) => {
        const live = publicState.services.find(s => s.id === item.serviceId);
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

    const reply = await AI.generateReply(publicState, text, clientCall.triage.intent);
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
    document.getElementById('cai-wave')?.classList.remove('listening');
    document.getElementById('cai-mic-label').textContent = 'Falar';
  }

  function toggleClientMic() {
    if (clientCall.isListening) {
      stopClientMic();
      return;
    }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      Store.showToast('Microfone indisponível neste navegador. Escreva abaixo.', 'warning');
      return;
    }
    AI.stopSpeaking();
    const rec = new SpeechRec();
    rec.lang = 'pt-PT';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    clientCall.recognition = rec;

    rec.onstart = () => {
      clientCall.isListening = true;
      document.getElementById('cai-wave').classList.add('listening');
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
    const callerName = document.getElementById('cai-name').value.trim() || (currentClient ? currentClient.fullName : 'Visitante do Site');
    const callerPhone = document.getElementById('cai-phone').value.trim() || (currentClient ? currentClient.phone : 'Via Web');
    await Store.submitClientCall({
      timestamp: new Date().toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
      phone: callerPhone,
      callerName,
      duration: 'Web IA',
      intent: clientCall.triage.intent,
      vehicle: clientCall.triage.vehicle || (currentClient?.vehicle || 'Não indicada'),
      quotedTotal: clientCall.triage.totalWithVat || 0,
      status: statusLabel,
      messages: [...clientCall.messages]
    }, Auth.getClientToken());
    if (currentClient) await refreshClientAccount();
  }

  /* =======================================================================
     BOOTSTRAP
     ======================================================================= */

  document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('c-date').value = Store.getTodayISO(1);

    publicState = await Store.fetchPublicData();
    renderPublicSite();
    await refreshClientAccount();

    Store.subscribePublicSync(
      () => publicState,
      (newState) => {
        publicState = newState;
        renderPublicSite();
        if (clientCall.open) renderClientAITranscript();
        Store.showToast('Preçário atualizado pela oficina!', 'info');
      }
    );

    // Header navigation
    document.getElementById('btn-logo-home').addEventListener('click', () => showClientView('home'));
    document.getElementById('btn-nav-client-home').addEventListener('click', () => showClientView('home'));
    document.getElementById('btn-back-to-shop').addEventListener('click', () => showClientView('home'));
    document.getElementById('btn-nav-client-account').addEventListener('click', () => showClientView('account'));
    document.querySelectorAll('.client-anchor').forEach(a => {
      a.addEventListener('click', () => showClientView('home'));
    });

    // Account Tabs & Forms
    document.getElementById('tab-btn-login').addEventListener('click', () => switchAuthFormTab('login'));
    document.getElementById('tab-btn-register').addEventListener('click', () => switchAuthFormTab('register'));

    document.getElementById('form-client-login').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('login-error');
      errBox.classList.add('hidden');
      try {
        await Auth.loginClient(
          document.getElementById('login-identifier').value,
          document.getElementById('login-password').value
        );
        e.target.reset();
        await refreshClientAccount();
        Store.showToast(`Bem-vindo, @${currentClient.username}!`, 'success');
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
      }
    });

    document.getElementById('form-client-register').addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('reg-error');
      errBox.classList.add('hidden');
      try {
        await Auth.registerClient({
          username: document.getElementById('reg-username').value,
          fullName: document.getElementById('reg-fullname').value,
          email: document.getElementById('reg-email').value,
          phone: document.getElementById('reg-phone').value,
          vehicle: document.getElementById('reg-vehicle').value,
          password: document.getElementById('reg-password').value
        });
        e.target.reset();
        await refreshClientAccount();
        Store.showToast(`Conta @${currentClient.username} criada com sucesso!`, 'success');
      } catch (err) {
        errBox.textContent = err.message;
        errBox.classList.remove('hidden');
      }
    });

    document.getElementById('form-client-profile').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await Auth.updateClientProfile({
          fullName: document.getElementById('prof-fullname').value,
          email: document.getElementById('prof-email').value,
          phone: document.getElementById('prof-phone').value,
          vehicle: document.getElementById('prof-vehicle').value,
          currentPassword: document.getElementById('prof-cur-pass').value,
          newPassword: document.getElementById('prof-new-pass').value
        });
        document.getElementById('prof-cur-pass').value = '';
        document.getElementById('prof-new-pass').value = '';
        await refreshClientAccount();
        Store.showToast('Perfil atualizado com segurança!', 'success');
      } catch (err) {
        Store.showToast(err.message, 'error');
      }
    });

    document.getElementById('btn-client-logout').addEventListener('click', async () => {
      await Auth.logoutClient();
      currentClient = null;
      myBookings = [];
      myCalls = [];
      document.getElementById('c-name').value = '';
      document.getElementById('c-phone').value = '';
      document.getElementById('c-email').value = '';
      document.getElementById('c-vehicle').value = '';
      renderClientAccountUI();
      Store.showToast('Sessão terminada.', 'info');
    });

    // Price Filters
    document.getElementById('client-price-search').addEventListener('input', renderPublicServices);
    document.getElementById('client-toggle-vat').addEventListener('change', renderPublicServices);
    document.querySelectorAll('.c-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        selectedCategory = pill.dataset.cat;
        renderPublicServices();
      });
    });

    // Booking Form
    document.getElementById('client-booking-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const client = document.getElementById('c-name').value.trim();
      const phone = document.getElementById('c-phone').value.trim();
      const vehicle = document.getElementById('c-vehicle').value.trim();
      const service = document.getElementById('c-service').value;
      const date = document.getElementById('c-date').value || Store.getTodayISO(1);
      const msg = document.getElementById('c-message').value.trim();

      try {
        await Store.submitClientBooking({
          client,
          phone,
          vehicle,
          date,
          time: '09:30',
          service: `${service} — "${msg}"`,
          source: 'Site Cliente',
          status: 'Pendente'
        }, Auth.getClientToken());
        e.target.reset();
        document.getElementById('c-date').value = Store.getTodayISO(1);
        if (currentClient) await refreshClientAccount();
        Store.showToast(`Obrigado, ${client}! O seu pedido entrou na agenda da Centro Diesel.`, 'success');
      } catch (err) {
        Store.showToast(err.message, 'error');
      }
    });

    // AI Phone Modal
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
      const client = document.getElementById('cai-name').value.trim() || (currentClient ? currentClient.fullName : 'Cliente Assistente IA');
      const phone = document.getElementById('cai-phone').value.trim() || (currentClient ? currentClient.phone : 'A confirmar');
      const vehicle = clientCall.triage.vehicle || (currentClient?.vehicle || 'Viatura a confirmar');
      const serviceText = clientCall.triage.services.map(s => `${s.qty}x ${s.name}`).join(', ') || clientCall.triage.intent;

      await Store.submitClientBooking({
        client,
        phone,
        vehicle,
        date: Store.getTodayISO(1),
        time: '09:30',
        service: serviceText,
        source: 'Assistente IA (Site)',
        status: 'Confirmada'
      }, Auth.getClientToken());
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
