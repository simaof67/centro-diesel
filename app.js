/* =========================================================================
   CENTRO DIESEL — Manuel Francisco Raposo & Ca. Lda.
   Aplicação de Gestão de Escritório, Tabela de Preços & Assistente Virtual
   ========================================================================= */

const STORAGE_KEY = 'centro_diesel_app_v1';

const CATEGORY_FALLBACKS = {
  'Bombas Injetoras': 'assets/bomba-injetora.svg',
  'Injetores': 'assets/injetores-common-rail.svg',
  'Auto-Diagnóstico': 'assets/diagnostico-auto.svg',
  'Turbos e Hidráulica': 'assets/turbocompressor.svg',
  'Serviços Rápidos Auto': 'assets/revisao-geral.svg'
};

const DEFAULT_SERVICES = [
  {
    id: 'srv-bi-01',
    code: 'BI-01',
    name: 'Teste e Calibração de Bomba Injetora em Bancada',
    category: 'Bombas Injetoras',
    description: 'Ensaio completo em bancada de testes com verificação de débito, pressão, avanço e estanquicidade.',
    price: 75,
    duration: '2h00',
    warranty: '6 meses',
    stock: 'Disponível',
    visible: true,
    image: 'http://www.mfrcentrodiesel.com/wp-content/uploads/2014/10/DSCF16091-1140x400.jpg',
    fallback: 'assets/bomba-injetora.svg'
  },
  {
    id: 'srv-bi-02',
    code: 'BI-02',
    name: 'Reparação Bomba Injetora Rotativa / Em Linha',
    category: 'Bombas Injetoras',
    description: 'Desmontagem total, substituição de vedantes, retentores e componentes desgastados com afinação final em bancada.',
    price: 340,
    duration: '1 dia',
    warranty: '12 meses',
    stock: 'Disponível',
    visible: true,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/bomba-injetora.svg'
  },
  {
    id: 'srv-bi-03',
    code: 'BI-03',
    name: 'Reparação Bomba Alta Pressão Common Rail',
    category: 'Bombas Injetoras',
    description: 'Reconstrução especializada para bombas Bosch CP1/CP3/CP4, Delphi, Denso e Stanadyne com relatório de bancada.',
    price: 390,
    duration: '1-2 dias',
    warranty: '12 meses',
    stock: 'Disponível',
    visible: true,
    image: 'http://www.mfrcentrodiesel.com/wp-content/uploads/2014/10/audi_diesel_cars_2-1140x400.jpg',
    fallback: 'assets/bomba-injetora.svg'
  },
  {
    id: 'srv-inj-01',
    code: 'INJ-01',
    name: 'Teste Eletrónico de Injetor Common Rail (un.)',
    category: 'Injetores',
    description: 'Avaliação individual em bancada eletrónica de pré-injeção, débito máximo, marcha lenta e retorno.',
    price: 25,
    duration: '45 min',
    warranty: 'Relatório Técnico',
    stock: 'Disponível',
    visible: true,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/injetores-common-rail.svg'
  },
  {
    id: 'srv-inj-02',
    code: 'INJ-02',
    name: 'Limpeza por Ultrassons e Ajuste de Injetor (un.)',
    category: 'Injetores',
    description: 'Descarbonização profunda por ultrassons, substituição de anilhas corta-fogo e calibração de pressão.',
    price: 45,
    duration: '1h30',
    warranty: '6 meses',
    stock: 'Disponível',
    visible: true,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/injetores-common-rail.svg'
  },
  {
    id: 'srv-inj-03',
    code: 'INJ-03',
    name: 'Reconstrução Completa de Injetor c/ Codificação IMA (un.)',
    category: 'Injetores',
    description: 'Substituição de válvula de controlo e ponteira original Bosch/Delphi/Denso com geração de novo código IMA.',
    price: 145,
    duration: '3h00',
    warranty: '12 meses',
    stock: 'Disponível',
    visible: true,
    image: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/injetores-common-rail.svg'
  },
  {
    id: 'srv-dia-01',
    code: 'DIA-01',
    name: 'Auto-Diagnóstico Computorizado Multimarca',
    category: 'Auto-Diagnóstico',
    description: 'Leitura completa de centralinas Diesel e Gasolina, parâmetros em tempo real, regenerações e reset de avisos.',
    price: 35,
    duration: '45 min',
    warranty: 'Relatório Digital',
    stock: 'Disponível',
    visible: true,
    image: 'http://www.mfrcentrodiesel.com/wp-content/uploads/2014/02/6-940x250.jpg',
    fallback: 'assets/diagnostico-auto.svg'
  },
  {
    id: 'srv-dia-02',
    code: 'DIA-02',
    name: 'Teste de Compressão e Fugas no Sistema de Injeção',
    category: 'Auto-Diagnóstico',
    description: 'Verificação mecânica de compressão por cilindro, pressão do rail e teste de retornos no veículo.',
    price: 65,
    duration: '1h30',
    warranty: 'Relatório Técnico',
    stock: 'Disponível',
    visible: true,
    image: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/diagnostico-auto.svg'
  },
  {
    id: 'srv-tur-01',
    code: 'TUR-01',
    name: 'Cravação de Tubos Hidráulicos de Alta Pressão',
    category: 'Turbos e Hidráulica',
    description: 'Fabrico e cravação à medida de tubagens flexíveis e rígidas para direção, óleo, travões e alta pressão.',
    price: 40,
    duration: '45 min',
    warranty: '12 meses',
    stock: 'Disponível',
    visible: true,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/turbocompressor.svg'
  },
  {
    id: 'srv-tur-02',
    code: 'TUR-02',
    name: 'Desmontagem e Revisão de Turbocompressor',
    category: 'Turbos e Hidráulica',
    description: 'Desmontagem, limpeza de geometria variável, calibragem do cartucho (CHRA) e verificação de lubrificação.',
    price: 280,
    duration: '1 dia',
    warranty: '12 meses',
    stock: 'Stock Reduzido',
    visible: true,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/turbocompressor.svg'
  },
  {
    id: 'srv-rap-01',
    code: 'SRV-01',
    name: 'Revisão Completa (Óleo Sintético + Filtros)',
    category: 'Serviços Rápidos Auto',
    description: 'Mudança de óleo homologado, filtro de óleo, ar, gasóleo e habitáculo com verificação de 25 pontos.',
    price: 125,
    duration: '1h30',
    warranty: '12 meses',
    stock: 'Disponível',
    visible: true,
    image: 'http://www.mfrcentrodiesel.com/wp-content/uploads/2014/02/mudanca-oleo+filtro-640x250.jpg',
    fallback: 'assets/revisao-geral.svg'
  },
  {
    id: 'srv-rap-02',
    code: 'SRV-02',
    name: 'Substituição Kit Distribuição e Bomba de Água',
    category: 'Serviços Rápidos Auto',
    description: 'Troca completa de correia de distribuição, tensores, rolamentos e bomba de água com líquido refrigerante.',
    price: 290,
    duration: '4h00',
    warranty: '24 meses',
    stock: 'Peça por Encomenda',
    visible: true,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/revisao-geral.svg'
  },
  {
    id: 'srv-rap-03',
    code: 'SRV-03',
    name: 'Limpeza Profissional Filtro de Partículas (DPF)',
    category: 'Serviços Rápidos Auto',
    description: 'Desentupimento e limpeza profunda do filtro DPF/FAP com medição de contrapressão e reposição na centralina.',
    price: 160,
    duration: '3h00',
    warranty: '12 meses',
    stock: 'Disponível',
    visible: true,
    image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=900&q=80',
    fallback: 'assets/revisao-geral.svg'
  }
];

function getTodayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function getDefaultState() {
  return {
    settings: {
      ivaRate: 16, // Taxa IVA Açores padrão
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      useGemini: false,
      ttsEnabled: true,
      autoAnswer: true
    },
    services: JSON.parse(JSON.stringify(DEFAULT_SERVICES)),
    bays: [
      { id: 'bay-1', name: 'Bancada Bosch #1', status: 'Ocupada', vehicle: '64-PZ-18 • Mercedes Sprinter', task: 'Bomba Common Rail CP3' },
      { id: 'bay-2', name: 'Bancada Common Rail #2', status: 'Livre', vehicle: 'Disponível', task: 'Pronta para teste injetores' },
      { id: 'bay-3', name: 'Elevador Rápido #1', status: 'Ocupada', vehicle: 'AA-42-RT • VW Caddy 2.0 TDI', task: 'Revisão + Limpeza DPF' },
      { id: 'bay-4', name: 'Diagnóstico Eletrónico', status: 'Reservada', vehicle: '19-ML-83 • Renault Master', task: 'Diagnóstico às 14:30' }
    ],
    workOrders: [
      {
        id: 'FO-2026-104',
        client: 'Transportes Atlântico Açores',
        phone: '917 440 212',
        plate: '64-PZ-18',
        vehicle: 'Mercedes-Benz Sprinter 316 CDI',
        status: 'Em Bancada de Teste',
        bay: 'Bancada Bosch #1',
        desc: 'Perda de pressão no rail a quente. Bomba CP3 e 4 injetores em bancada.',
        total: 672.80,
        createdAt: getTodayISO(0)
      },
      {
        id: 'FO-2026-105',
        client: 'José Medeiros Pacheco',
        phone: '962 119 405',
        plate: 'AA-42-RT',
        vehicle: 'VW Caddy 2.0 TDI',
        status: 'Pronto para Entrega',
        bay: 'Elevador Rápido #1',
        desc: 'Revisão completa óleo + filtros e limpeza profissional DPF.',
        total: 330.60,
        createdAt: getTodayISO(0)
      },
      {
        id: 'FO-2026-106',
        client: 'Quinta Leiteira S. Miguel',
        phone: '296 488 120',
        plate: '81-DF-90',
        vehicle: 'Toyota Hilux 2.4 D-4D',
        status: 'Aguardar Orçamento',
        bay: 'Por Atribuir',
        desc: 'Fumo branco ao ligar a frio. Aguardar teste eletrónico aos 4 injetores Denso.',
        total: 116.00,
        createdAt: getTodayISO(-1)
      }
    ],
    bookings: [
      {
        id: 'AG-01',
        client: 'Carlos Arruda',
        phone: '913 228 901',
        vehicle: '19-ML-83 • Renault Master',
        date: getTodayISO(0),
        time: '14:30',
        service: 'Auto-Diagnóstico Computorizado Multimarca',
        source: 'Assistente IA',
        status: 'Confirmada'
      },
      {
        id: 'AG-02',
        client: 'Ana Beatriz Cabral',
        phone: '965 710 334',
        vehicle: '33-GH-21 • Peugeot 308 1.6 HDi',
        date: getTodayISO(1),
        time: '09:00',
        service: 'Revisão Completa + Teste Injetores',
        source: 'Portal Cliente',
        status: 'Pendente'
      }
    ],
    calls: [
      {
        id: 'CH-1001',
        timestamp: `${getTodayISO(0)} 09:42`,
        phone: '913 228 901',
        callerName: 'Carlos Arruda',
        duration: '01:38',
        intent: 'Marcação Auto-Diagnóstico',
        vehicle: '19-ML-83 • Renault Master',
        quotedTotal: 40.60,
        status: 'Convertida em Marcação',
        messages: [
          { sender: 'ai', text: 'Centro Diesel, Manuel Francisco Raposo & Ca., bom dia! Em que podemos ajudar?' },
          { sender: 'caller', text: 'Bom dia, a minha Renault Master matrícula 19-ML-83 acendeu a luz de injeção. Queria marcar um diagnóstico hoje à tarde.' },
          { sender: 'ai', text: 'Com certeza, Sr. Carlos. O Auto-Diagnóstico Computorizado Multimarca tem o valor base de 35,00 € (+ IVA). Registámos pré-marcação para hoje às 14:30 na Zona Comercial dos Valados.' }
        ]
      },
      {
        id: 'CH-1002',
        timestamp: `${getTodayISO(0)} 11:15`,
        phone: '918 904 511',
        callerName: 'Oficina Parceira Ribeira Grande',
        duration: '01:12',
        intent: 'Orçamento Teste Injetores',
        vehicle: 'Ford Transit 2.2 TDCi',
        quotedTotal: 116.00,
        status: 'Informação Prestada',
        messages: [
          { sender: 'ai', text: 'Centro Diesel, bom dia! Está a falar com a assistente virtual.' },
          { sender: 'caller', text: 'Quanto levam para testar 4 injetores Common Rail fora do carro?' },
          { sender: 'ai', text: 'O Teste Eletrónico de Injetor Common Rail custa 25,00 € por unidade sem IVA. Para 4 injetores fica por 100,00 € sem IVA (116,00 € já com IVA a 16%).' }
        ]
      }
    ],
    quoteDraft: {
      number: 'ORC-2026-001',
      clientName: '',
      clientPhone: '',
      clientNif: '',
      clientEmail: '',
      vehiclePlate: '',
      vehicleModel: '',
      notes: '',
      items: [], // { serviceId, qty }
      extraParts: [] // { name, qty, price }
    }
  };
}

let state = loadState();
let activeTab = 'dashboard';
let activeOfficeSubtab = 'workorders';
let selectedPriceCategory = 'Todas';

// Active Phone Call Session State
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
    services: [], // { serviceId, name, qty, unitPrice }
    totalWithVat: 0
  }
};

let speechRecognition = null;
let isListeningMic = false;

/* =========================================================================
   PERSISTENCE & FORMATTERS
   ========================================================================= */

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    const def = getDefaultState();
    return {
      ...def,
      ...parsed,
      settings: { ...def.settings, ...(parsed.settings || {}) },
      quoteDraft: { ...def.quoteDraft, ...(parsed.quoteDraft || {}) }
    };
  } catch (err) {
    console.warn('Erro ao ler localStorage, a usar dados iniciais:', err);
    return getDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Erro ao guardar localStorage:', err);
  }
}

function formatMoney(value) {
  const num = Number(value) || 0;
  return num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function calcWithVat(basePrice, customRate) {
  const rate = customRate !== undefined ? Number(customRate) : Number(state.settings.ivaRate || 16);
  return Number(basePrice) * (1 + rate / 100);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const colors = {
    success: 'bg-slate-900 text-white border-l-4 border-emerald-400',
    warning: 'bg-slate-900 text-white border-l-4 border-amber-400',
    error: 'bg-rose-900 text-white border-l-4 border-rose-400',
    info: 'bg-blue-950 text-white border-l-4 border-blue-400'
  };
  const toast = document.createElement('div');
  toast.className = `toast-enter px-4 py-3 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2.5 ${colors[type] || colors.success}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 260);
  }, 3400);
}

/* =========================================================================
   NAVIGATION & MODALS
   ========================================================================= */

const TAB_META = {
  dashboard: {
    title: 'Painel de Escritório',
    subtitle: 'Resumo diário da oficina, atendimento automático e folhas de obra'
  },
  assistant: {
    title: 'Assistente Telefónico Virtual (296 383 150)',
    subtitle: 'Atendimento automático por voz/texto com consulta à Tabela de Preços em tempo real'
  },
  prices: {
    title: 'Tabela de Preços & Serviços (Modo Dono)',
    subtitle: 'Edite qualquer preço na hora — sincroniza automaticamente com o Assistente IA e Orçamentos'
  },
  office: {
    title: 'Secretaria, Folhas de Obra & Orçamentos',
    subtitle: 'Receção de viaturas, agenda de marcações e emissão de orçamentos A4'
  },
  portal: {
    title: 'Portal Público do Cliente (mfrcentrodiesel.com)',
    subtitle: 'Pré-visualização do novo site moderno com preços ao vivo e pedido de marcação online'
  }
};

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(`tab-${tabId}`);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  const meta = TAB_META[tabId] || TAB_META.dashboard;
  document.getElementById('topbar-title').textContent = meta.title;
  document.getElementById('topbar-subtitle').textContent = meta.subtitle;

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth < 1024) {
    sidebar.classList.add('hidden');
  }

  renderAll();
}

function switchOfficeSubtab(subtabId) {
  activeOfficeSubtab = subtabId;
  document.querySelectorAll('.office-subpanel').forEach(el => el.classList.add('hidden'));
  document.getElementById(`panel-${subtabId}`).classList.remove('hidden');

  document.querySelectorAll('#office-subtabs .subtab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.subtab === subtabId);
  });
  renderOfficeSection();
}

function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

/* =========================================================================
   RENDER: DASHBOARD
   ========================================================================= */

function renderDashboard() {
  const activeWo = state.workOrders.filter(w => w.status !== 'Entregue');
  const estRevenue = activeWo.reduce((acc, w) => acc + (Number(w.total) || 0), 0);
  const lowStockCount = state.services.filter(s => s.stock !== 'Disponível').length;

  document.getElementById('kpi-calls').textContent = state.calls.length;
  document.getElementById('kpi-bookings').textContent = state.bookings.length;
  document.getElementById('kpi-workorders').textContent = activeWo.length;
  document.getElementById('kpi-revenue').textContent = formatMoney(estRevenue);
  document.getElementById('kpi-alerts').textContent = lowStockCount;

  // Bays
  const baysEl = document.getElementById('dashboard-bays');
  const bayBadge = {
    'Livre': 'bg-emerald-100 text-emerald-800',
    'Ocupada': 'bg-amber-100 text-amber-800',
    'Reservada': 'bg-blue-100 text-blue-800'
  };
  baysEl.innerHTML = state.bays.map(bay => `
    <div class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <span class="font-bold text-xs text-slate-900">${escapeHtml(bay.name)}</span>
        <select onchange="updateBayStatus('${bay.id}', this.value)" class="text-[11px] font-bold px-2 py-0.5 rounded-full border-0 cursor-pointer ${bayBadge[bay.status] || 'bg-slate-200'}">
          <option value="Livre" ${bay.status === 'Livre' ? 'selected' : ''}>Livre</option>
          <option value="Ocupada" ${bay.status === 'Ocupada' ? 'selected' : ''}>Ocupada</option>
          <option value="Reservada" ${bay.status === 'Reservada' ? 'selected' : ''}>Reservada</option>
        </select>
      </div>
      <div class="text-xs font-semibold text-slate-700">${escapeHtml(bay.vehicle)}</div>
      <div class="text-[11px] text-slate-500">${escapeHtml(bay.task)}</div>
    </div>
  `).join('');

  // Recent Calls
  const recentCallsEl = document.getElementById('dashboard-recent-calls');
  if (state.calls.length === 0) {
    recentCallsEl.innerHTML = `<div class="text-xs text-slate-400 italic py-6 text-center">Nenhuma chamada registada ainda.</div>`;
  } else {
    recentCallsEl.innerHTML = state.calls.slice(0, 4).map(c => `
      <div class="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition flex items-start justify-between gap-2">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-bold text-xs text-slate-900 truncate">${escapeHtml(c.callerName || c.phone)}</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">${escapeHtml(c.intent)}</span>
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(c.timestamp)} • ${escapeHtml(c.vehicle || 'Viatura não indicada')}</div>
          <div class="text-[11px] font-semibold text-emerald-700 mt-0.5">Estimativa: ${formatMoney(c.quotedTotal)} • ${escapeHtml(c.status)}</div>
        </div>
        <button onclick="viewTranscript('${c.id}')" class="shrink-0 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-[11px] font-semibold transition">
          Ver
        </button>
      </div>
    `).join('');
  }

  // Quick Price Strip (top 4 services)
  const quickPricesEl = document.getElementById('dashboard-quick-prices');
  const featured = state.services.slice(0, 4);
  quickPricesEl.innerHTML = featured.map(srv => `
    <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">${escapeHtml(srv.code)}</span>
        <span class="text-[11px] text-slate-500 card-iva-dash-${srv.id}">c/ IVA: <strong>${formatMoney(calcWithVat(srv.price))}</strong></span>
      </div>
      <div class="text-xs font-bold text-slate-900 line-clamp-2 min-h-[2rem]">${escapeHtml(srv.name)}</div>
      <div class="flex items-center gap-1.5">
        <button onclick="nudgeServicePrice('${srv.id}', -5)" class="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-rose-50 text-xs font-bold text-rose-700">-5€</button>
        <input type="number" step="0.5" min="0" value="${srv.price}" onchange="setServicePrice('${srv.id}', this.value)" class="w-full px-2 py-1 rounded border border-slate-300 text-xs font-extrabold text-center text-slate-900 focus:border-amber-500 focus:outline-none" />
        <button onclick="nudgeServicePrice('${srv.id}', 5)" class="px-2 py-1 rounded bg-white border border-slate-300 hover:bg-emerald-50 text-xs font-bold text-emerald-700">+5€</button>
      </div>
    </div>
  `).join('');
}

window.updateBayStatus = function (bayId, newStatus) {
  const bay = state.bays.find(b => b.id === bayId);
  if (!bay) return;
  bay.status = newStatus;
  if (newStatus === 'Livre') {
    bay.vehicle = 'Disponível';
    bay.task = 'Posto pronto para nova viatura';
  }
  saveState();
  renderDashboard();
  showToast(`${bay.name} marcada como "${newStatus}".`, 'info');
};

/* =========================================================================
   RENDER: TABELA DE PREÇOS (MODO DONO)
   ========================================================================= */

function renderPricesTab() {
  const search = (document.getElementById('price-search').value || '').trim().toLowerCase();
  const ivaInput = document.getElementById('iva-rate-input');
  if (document.activeElement !== ivaInput) {
    ivaInput.value = state.settings.ivaRate;
  }

  document.querySelectorAll('.cat-pill').forEach(pill => {
    const active = pill.dataset.cat === selectedPriceCategory;
    pill.className = active
      ? 'cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white'
      : 'cat-pill px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200';
  });

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
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
        Nenhum serviço encontrado para esta pesquisa.
      </div>`;
    return;
  }

  const stockBadge = {
    'Disponível': 'bg-emerald-500/90 text-white',
    'Stock Reduzido': 'bg-amber-500/95 text-slate-950',
    'Peça por Encomenda': 'bg-rose-600/90 text-white'
  };

  grid.innerHTML = filtered.map(srv => {
    const imgSrc = escapeHtml(srv.image || srv.fallback || CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
    const fallbackSrc = escapeHtml(srv.fallback || CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
    const withVat = calcWithVat(srv.price);

    return `
      <article id="service-card-${srv.id}" class="service-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
        <div>
          <div class="relative h-44 bg-slate-900 overflow-hidden">
            <img src="${imgSrc}" onerror="this.onerror=null;this.src='${fallbackSrc}';" alt="${escapeHtml(srv.name)}" class="service-card-img w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30"></div>
            <div class="absolute top-3 left-3 flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-md bg-slate-950/85 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30">${escapeHtml(srv.code)}</span>
              <span class="px-2 py-0.5 rounded-md bg-white/90 text-slate-900 text-[11px] font-bold">${escapeHtml(srv.category)}</span>
            </div>
            <span class="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${stockBadge[srv.stock] || 'bg-slate-700 text-white'}">
              ${escapeHtml(srv.stock)}
            </span>
            <div class="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200">
              <span>Duração: <strong>${escapeHtml(srv.duration)}</strong></span>
              <span>Garantia: <strong>${escapeHtml(srv.warranty)}</strong></span>
            </div>
          </div>

          <div class="p-4 space-y-2">
            <h4 class="font-extrabold text-sm text-slate-900 leading-snug">${escapeHtml(srv.name)}</h4>
            <p class="text-xs text-slate-500 leading-relaxed">${escapeHtml(srv.description)}</p>
          </div>
        </div>

        <!-- Owner Instant Price Editor -->
        <div class="p-4 pt-3 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold uppercase text-slate-500">Preço Base s/ IVA</span>
            <span id="card-vat-label-${srv.id}" class="text-xs font-bold text-emerald-700">
              c/ IVA (${state.settings.ivaRate}%): ${formatMoney(withVat)}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="nudgeServicePrice('${srv.id}', -5)" class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-rose-50 text-xs font-bold text-rose-700 transition">-5€</button>
            <div class="relative flex-1">
              <input
                type="number"
                step="0.5"
                min="0"
                value="${srv.price}"
                oninput="livePreviewCardVat('${srv.id}', this.value)"
                onchange="setServicePrice('${srv.id}', this.value)"
                class="w-full px-3 py-1.5 pr-7 rounded-lg border border-amber-300 bg-white text-sm font-extrabold text-center text-slate-900 focus:border-amber-500 focus:outline-none"
              />
              <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">€</span>
            </div>
            <button onclick="nudgeServicePrice('${srv.id}', 5)" class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-emerald-50 text-xs font-bold text-emerald-700 transition">+5€</button>
          </div>

          <div class="flex items-center justify-between pt-1">
            <label class="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer">
              <input type="checkbox" ${srv.visible ? 'checked' : ''} onchange="toggleServiceVisibility('${srv.id}', this.checked)" class="rounded text-amber-600" />
              Visível no Portal
            </label>
            <div class="flex items-center gap-1.5">
              <button onclick="openEditServiceModal('${srv.id}')" class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-900 hover:text-white text-[11px] font-semibold transition">Editar</button>
              <button onclick="deleteService('${srv.id}')" class="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-rose-600 hover:text-white text-[11px] font-semibold text-rose-600 transition" title="Remover serviço">✕</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

window.livePreviewCardVat = function (serviceId, val) {
  const num = Math.max(0, parseFloat(val) || 0);
  const label = document.getElementById(`card-vat-label-${serviceId}`);
  if (label) {
    label.textContent = `c/ IVA (${state.settings.ivaRate}%): ${formatMoney(calcWithVat(num))}`;
  }
};

window.setServicePrice = function (serviceId, newPrice) {
  const srv = state.services.find(s => s.id === serviceId);
  if (!srv) return;
  const parsed = Math.max(0, Math.round((parseFloat(newPrice) || 0) * 100) / 100);
  srv.price = parsed;
  saveState();
  syncAfterPriceChange(`Preço de "${srv.code}" atualizado para ${formatMoney(parsed)} s/ IVA.`, serviceId);
};

window.nudgeServicePrice = function (serviceId, delta) {
  const srv = state.services.find(s => s.id === serviceId);
  if (!srv) return;
  srv.price = Math.max(0, Math.round((Number(srv.price) + delta) * 100) / 100);
  saveState();
  syncAfterPriceChange(`Preço de "${srv.code}" ajustado para ${formatMoney(srv.price)} s/ IVA.`, serviceId);
};

window.toggleServiceVisibility = function (serviceId, visible) {
  const srv = state.services.find(s => s.id === serviceId);
  if (!srv) return;
  srv.visible = visible;
  saveState();
  renderPortal();
  showToast(`"${srv.code}" ${visible ? 'publicado' : 'ocultado'} no Portal do Cliente.`, 'info');
};

window.deleteService = function (serviceId) {
  const srv = state.services.find(s => s.id === serviceId);
  if (!srv) return;
  if (!confirm(`Tem a certeza que deseja remover "${srv.name}" da tabela?`)) return;
  state.services = state.services.filter(s => s.id !== serviceId);
  saveState();
  renderAll();
  showToast(`Serviço "${srv.code}" removido.`, 'warning');
};

function syncAfterPriceChange(toastMsg, highlightId = null) {
  renderAll();
  if (highlightId) {
    const card = document.getElementById(`service-card-${highlightId}`);
    if (card) card.classList.add('price-updated-flash');
  }
  showToast(toastMsg + ' Assistente Virtual sincronizado!', 'success');
}

function applyBulkPercentage(pct) {
  const numPct = parseFloat(pct);
  if (isNaN(numPct) || numPct === 0) {
    showToast('Indique uma percentagem válida (ex: 5 ou -5).', 'warning');
    return;
  }
  let count = 0;
  state.services.forEach(srv => {
    if (selectedPriceCategory === 'Todas' || srv.category === selectedPriceCategory) {
      srv.price = Math.max(1, Math.round(srv.price * (1 + numPct / 100) * 2) / 2);
      count++;
    }
  });
  saveState();
  renderAll();
  showToast(`Ajuste de ${numPct > 0 ? '+' : ''}${numPct}% aplicado a ${count} serviços. Assistente IA atualizado!`, 'success');
}

/* =========================================================================
   SERVICE MODAL (ADD / EDIT)
   ========================================================================= */

window.openEditServiceModal = function (serviceId = null) {
  const modalTitle = document.getElementById('modal-service-title');
  const fileInput = document.getElementById('srv-image-file');
  fileInput.value = '';

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

/* =========================================================================
   VIRTUAL PHONE ASSISTANT (VOZ + TEXTO + PREÇOS DINÂMICOS + GEMINI API)
   ========================================================================= */

function renderAssistantTab() {
  const isGeminiReady = state.settings.useGemini && Boolean(state.settings.geminiApiKey);
  const badge = document.getElementById('ai-engine-badge');
  badge.textContent = isGeminiReady ? `Gemini API (${state.settings.geminiModel})` : 'Motor Local + Preços Vivos';
  badge.className = isGeminiReady
    ? 'px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800'
    : 'px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-700';

  document.getElementById('ai-price-sync-count').textContent =
    `${state.services.length} serviços sincronizados com a Tabela do Dono (IVA ${state.settings.ivaRate}%)`;

  document.getElementById('ai-tts-toggle').checked = state.settings.ttsEnabled;
  document.getElementById('ai-auto-answer').checked = state.settings.autoAnswer;

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
        <div class="text-sm font-bold text-slate-700">Linha 296 383 150 pronta a simular</div>
        <p class="text-xs max-w-sm">Clique em <strong>"Atender / Iniciar"</strong> ou escolha uma pergunta rápida à esquerda para testar como a Assistente Virtual atende os clientes com os seus preços atuais.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = activeCall.messages.map(msg => {
    const isAi = msg.sender === 'ai';
    return `
      <div class="flex ${isAi ? 'justify-start' : 'justify-end'}">
        <div class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
          isAi
            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
            : 'bg-slate-900 text-white rounded-tr-sm'
        }">
          <div class="text-[10px] font-bold uppercase tracking-wider mb-1 ${isAi ? 'text-amber-600' : 'text-amber-400'}">
            ${isAi ? 'Assistente Centro Diesel' : (activeCall.callerName || activeCall.callerPhone || 'Cliente')}
          </div>
          <div class="whitespace-pre-line">${escapeHtml(msg.text)}</div>
        </div>
      </div>
    `;
  }).join('');
  container.scrollTop = container.scrollHeight;
}

function renderCallTriage() {
  document.getElementById('triage-intent').textContent = activeCall.triage.intent;
  const vehInput = document.getElementById('triage-vehicle');
  if (document.activeElement !== vehInput) {
    vehInput.value = activeCall.triage.vehicle;
  }

  const srvEl = document.getElementById('triage-services');
  if (activeCall.triage.services.length === 0) {
    srvEl.innerHTML = `<div class="italic text-slate-400">Nenhum serviço detetado ainda</div>`;
  } else {
    srvEl.innerHTML = activeCall.triage.services.map(item => {
      const liveSrv = state.services.find(s => s.id === item.serviceId);
      const unitBase = liveSrv ? liveSrv.price : item.unitPrice;
      const lineTotal = calcWithVat(unitBase * item.qty);
      return `
        <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <span class="font-medium text-slate-800 truncate pr-2">${item.qty}x ${escapeHtml(liveSrv ? liveSrv.name : item.name)}</span>
          <span class="font-bold text-slate-900 shrink-0">${formatMoney(lineTotal)}</span>
        </div>
      `;
    }).join('');
  }

  // Recompute total dynamically from live prices
  const totalVat = activeCall.triage.services.reduce((sum, item) => {
    const liveSrv = state.services.find(s => s.id === item.serviceId);
    const unitBase = liveSrv ? liveSrv.price : item.unitPrice;
    return sum + calcWithVat(unitBase * item.qty);
  }, 0);
  activeCall.triage.totalWithVat = Math.round(totalVat * 100) / 100;
  document.getElementById('triage-total').textContent = formatMoney(activeCall.triage.totalWithVat);
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
    triage: {
      intent: 'Chamada Atendida — Em Curso',
      vehicle: '',
      services: [],
      totalWithVat: 0
    }
  };

  document.getElementById('call-status-pill').textContent = 'Em Chamada';
  document.getElementById('call-status-pill').className = 'px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300';
  document.getElementById('call-display-name').textContent = name ? `${name} (${phone})` : phone;
  document.getElementById('call-avatar-ring').classList.add('call-ring-active');
  document.getElementById('btn-start-call').disabled = true;
  document.getElementById('btn-end-call').disabled = false;

  activeCall.timerInterval = setInterval(() => {
    const secs = Math.floor((Date.now() - activeCall.startTime) / 1000);
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    activeCall.durationStr = `${mm}:${ss}`;
    document.getElementById('call-timer').textContent = activeCall.durationStr;
  }, 1000);

  const greeting = 'Centro Diesel, Manuel Francisco Raposo & Companhia, bom dia! Está a falar com a assistente virtual da oficina em Ponta Delgada. Em que posso ajudar hoje?';
  activeCall.messages.push({ sender: 'ai', text: greeting });
  renderCallTranscript();
  renderCallTriage();
  speakPortuguese(greeting);
}

function endAndSaveCall() {
  if (!activeCall.inProgress) return;
  clearInterval(activeCall.timerInterval);
  stopSpeaking();
  stopListeningMic();

  const record = {
    id: 'CH-' + Date.now().toString().slice(-4),
    timestamp: new Date().toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' }),
    phone: activeCall.callerPhone,
    callerName: activeCall.callerName || 'Cliente Telefónico',
    duration: activeCall.durationStr,
    intent: activeCall.triage.intent,
    vehicle: activeCall.triage.vehicle || 'Não indicada',
    quotedTotal: activeCall.triage.totalWithVat,
    status: activeCall.triage.services.length > 0 ? 'Orçamento Informado' : 'Informação Prestada',
    messages: [...activeCall.messages]
  };

  state.calls.unshift(record);
  saveState();

  activeCall.inProgress = false;
  document.getElementById('call-status-pill').textContent = 'Chamada Gravada';
  document.getElementById('call-status-pill').className = 'px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300';
  document.getElementById('call-avatar-ring').classList.remove('call-ring-active');
  document.getElementById('btn-start-call').disabled = false;
  document.getElementById('btn-end-call').disabled = true;

  renderAll();
  showToast('Chamada terminada e guardada no Registo de Chamadas.', 'success');
}

function speakPortuguese(text) {
  if (!state.settings.ttsEnabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.toLowerCase().startsWith('pt-pt')) ||
                    voices.find(v => v.lang.toLowerCase().startsWith('pt'));
    if (ptVoice) utter.voice = ptVoice;
    utter.lang = 'pt-PT';
    utter.rate = 1.02;

    const wave = document.getElementById('voice-wave');
    utter.onstart = () => wave && wave.classList.add('speaking');
    utter.onend = () => wave && wave.classList.remove('speaking');
    utter.onerror = () => wave && wave.classList.remove('speaking');
    window.speechSynthesis.speak(utter);
  } catch (e) {
    console.warn('SpeechSynthesis indisponível:', e);
  }
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const wave = document.getElementById('voice-wave');
  if (wave) wave.classList.remove('speaking');
}

function toggleMicrophone() {
  if (isListeningMic) {
    stopListeningMic();
    return;
  }
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    showToast('O seu navegador não suporta microfone Web Speech. Use os botões ou escreva a mensagem.', 'warning');
    return;
  }
  if (!activeCall.inProgress) startSimulatedCall();
  stopSpeaking();

  speechRecognition = new SpeechRec();
  speechRecognition.lang = 'pt-PT';
  speechRecognition.interimResults = false;
  speechRecognition.maxAlternatives = 1;

  const wave = document.getElementById('voice-wave');
  const micLabel = document.getElementById('mic-btn-label');

  speechRecognition.onstart = () => {
    isListeningMic = true;
    wave.classList.add('listening');
    micLabel.textContent = 'A ouvir... Clique para parar';
  };
  speechRecognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript) handleCallerMessage(transcript);
  };
  speechRecognition.onerror = (event) => {
    showToast(`Microfone: ${event.error}. Pode escrever normalmente abaixo.`, 'warning');
    stopListeningMic();
  };
  speechRecognition.onend = () => {
    stopListeningMic();
  };

  speechRecognition.start();
}

function stopListeningMic() {
  isListeningMic = false;
  if (speechRecognition) {
    try { speechRecognition.stop(); } catch (_) {}
  }
  const wave = document.getElementById('voice-wave');
  if (wave) wave.classList.remove('listening');
  const micLabel = document.getElementById('mic-btn-label');
  if (micLabel) micLabel.textContent = 'Falar pelo Microfone (Reconhecimento Voz)';
}

function extractQuantityFromText(text) {
  const lower = text.toLowerCase();
  const wordMap = { 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3, 'quatro': 4, 'cinco': 5, 'seis': 6 };
  const numMatch = lower.match(/\b([1-8])\s*(injetor|injetores|unidade|unidades|bomba|bombas|tubo|tubos)\b/);
  if (numMatch) return parseInt(numMatch[1], 10);
  for (const [word, qty] of Object.entries(wordMap)) {
    if (new RegExp(`\\b${word}\\s+(injetor|injetores|unidade|unidades|bomba|bombas|tubo|tubos)\\b`).test(lower)) {
      return qty;
    }
  }
  return null;
}

function extractVehicleInfo(text) {
  const plateMatch = text.toUpperCase().match(/\b([A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{2}|\d{2}[-\s]?[A-Z]{2}[-\s]?\d{2}|\d{2}[-\s]?\d{2}[-\s]?[A-Z]{2}|[A-Z]{2}[-\s]?\d{2}[-\s]?\d{2})\b/);
  const brands = ['mercedes', 'sprinter', 'renault', 'master', 'clio', 'megane', 'peugeot', 'boxer', 'partner', 'citroen', 'berlingo', 'jumper', 'vw', 'volkswagen', 'caddy', 'transporter', 'golf', 'passat', 'ford', 'transit', 'focus', 'ranger', 'toyota', 'hilux', 'dyna', 'hiace', 'isuzu', 'nissan', 'navara', 'bmw', 'audi', 'fiat', 'ducato', 'iveco', 'daily', 'carrinha', 'trator', 'camião'];
  const lower = text.toLowerCase();
  const foundBrands = brands.filter(b => new RegExp(`\\b${b}\\b`, 'i').test(lower));
  let parts = [];
  if (plateMatch) parts.push(plateMatch[0].replace(/\s+/g, '-'));
  if (foundBrands.length) parts.push(foundBrands.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' '));
  return parts.join(' • ');
}

function mergeTriageServices(newItems) {
  newItems.forEach(item => {
    const existing = activeCall.triage.services.find(s => s.serviceId === item.serviceId);
    if (existing) {
      existing.qty = item.qty;
    } else {
      activeCall.triage.services.push(item);
    }
  });
}

function buildLocalAssistantReply(userText) {
  const lower = userText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const iva = state.settings.ivaRate;
  const qty = extractQuantityFromText(userText);

  const findCode = (code) => state.services.find(s => s.code.toUpperCase() === code);
  const replyParts = [];
  const detectedServices = [];
  let intent = activeCall.triage.intent;

  // 1. Address / Hours / Contact
  if (/(morada|onde fica|localizacao|endereco|horario|hora|abre|fecha|telefone|email|contacto)/.test(lower)) {
    intent = 'Informação Localização & Horário';
    replyParts.push(
      `A oficina Centro Diesel (Manuel Francisco Raposo & Ca. Lda.) fica na Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24, 9500-652 Ponta Delgada (São Miguel, Açores).`,
      `Estamos abertos de segunda a sexta-feira, das 08:30 às 12:30 e das 14:00 às 18:00. O nosso telefone direto é o 296 383 150 e o e-mail é mfrcentrodiesel@gmail.com.`
    );
  }

  // 2. Injectors (Common Rail / ultrassons / reconstrução / IMA)
  if (/(injetor|injetores|injector|bico|common rail|ima)/.test(lower)) {
    const q = qty || (lower.includes('injetores') ? 4 : 1);
    const srvTest = findCode('INJ-01');
    const srvClean = findCode('INJ-02');
    const srvRecon = findCode('INJ-03');
    intent = `Orçamento Injetores (${q} un.)`;

    if (/(reparar|reconstru|arranjar|substituir|novo|custa)/.test(lower) && srvRecon) {
      detectedServices.push({ serviceId: srvRecon.id, name: srvRecon.name, qty: q, unitPrice: srvRecon.price });
      const baseTotal = srvRecon.price * q;
      const vatTotal = calcWithVat(baseTotal);
      let line = `Para ${q} injetor(es) Common Rail, o preço atual na nossa tabela para Reconstrução Completa c/ Codificação IMA (${srvRecon.code}) é de ${formatMoney(srvRecon.price)} por unidade s/ IVA (${formatMoney(baseTotal)} s/ IVA no total, ou ${formatMoney(vatTotal)} já com IVA a ${iva}%).`;
      if (srvTest) {
        line += ` Se pretender começar apenas pelo Teste Eletrónico em Bancada (${srvTest.code}), fica a ${formatMoney(srvTest.price)} por injetor s/ IVA (${formatMoney(calcWithVat(srvTest.price * q))} c/ IVA pelos ${q}).`;
      }
      replyParts.push(line);
    } else if (/(limp|ultrass)/.test(lower) && srvClean) {
      detectedServices.push({ serviceId: srvClean.id, name: srvClean.name, qty: q, unitPrice: srvClean.price });
      replyParts.push(`A Limpeza por Ultrassons e Ajuste de Injetores (${srvClean.code}) está a ${formatMoney(srvClean.price)} por unidade s/ IVA — para ${q} unidade(s) totaliza ${formatMoney(calcWithVat(srvClean.price * q))} c/ IVA (${iva}%).`);
    } else if (srvTest) {
      detectedServices.push({ serviceId: srvTest.id, name: srvTest.name, qty: q, unitPrice: srvTest.price });
      replyParts.push(`O Teste Eletrónico de Injetor Common Rail (${srvTest.code}) custa ${formatMoney(srvTest.price)} por unidade s/ IVA (${formatMoney(calcWithVat(srvTest.price * q))} c/ IVA para ${q} injetor(es)).`);
    }
  }

  // 3. Injection Pumps (Bombas Injetoras)
  if (/(bomba|bombas|rotativa|em linha|alta pressao|cp3|cp4|bosch|delphi|denso|stanadyne)/.test(lower)) {
    intent = 'Orçamento Bomba Injetora';
    const srvTestPump = findCode('BI-01');
    const srvCommonPump = findCode('BI-03');
    const srvRotaryPump = findCode('BI-02');
    const target = lower.includes('rotativa') || lower.includes('linha') ? (srvRotaryPump || srvCommonPump) : (srvCommonPump || srvTestPump);
    if (srvTestPump && lower.includes('test')) {
      detectedServices.push({ serviceId: srvTestPump.id, name: srvTestPump.name, qty: 1, unitPrice: srvTestPump.price });
      replyParts.push(`O Teste e Calibração de Bomba Injetora em Bancada (${srvTestPump.code}) tem o valor base de ${formatMoney(srvTestPump.price)} s/ IVA (${formatMoney(calcWithVat(srvTestPump.price))} c/ IVA).`);
    } else if (target) {
      detectedServices.push({ serviceId: target.id, name: target.name, qty: 1, unitPrice: target.price });
      replyParts.push(`Para ${target.name} (${target.code}), o valor base de reparação na nossa tabela atual é ${formatMoney(target.price)} s/ IVA (${formatMoney(calcWithVat(target.price))} c/ IVA a ${iva}%). Recomendamos sempre confirmar primeiro o teste em bancada${srvTestPump ? ` (${formatMoney(srvTestPump.price)} s/ IVA)` : ''}.`);
    }
  }

  // 4. Symptoms: Black smoke, loss of power, won't start
  if (/(fumo|forca|potencia|engasga|custa a pegar|nao pega|luz|avaria|falha)/.test(lower)) {
    intent = 'Triagem Avaria / Sintoma Diesel';
    const srvDiag = findCode('DIA-01');
    const srvFugas = findCode('DIA-02');
    const srvDpf = findCode('SRV-03');
    if (srvDiag) detectedServices.push({ serviceId: srvDiag.id, name: srvDiag.name, qty: 1, unitPrice: srvDiag.price });
    if (srvFugas) detectedServices.push({ serviceId: srvFugas.id, name: srvFugas.name, qty: 1, unitPrice: srvFugas.price });
    replyParts.push(
      `Sintomas de fumo preto ou perda de força costumam estar ligados a injetores com retorno excessivo, filtro de partículas (DPF), válvula EGR ou turbo.`,
      `Recomendamos iniciar com o ${srvDiag ? `${srvDiag.name} (${formatMoney(srvDiag.price)} s/ IVA / ${formatMoney(calcWithVat(srvDiag.price))} c/ IVA)` : 'Auto-Diagnóstico'} e o ${srvFugas ? `Teste de Compressão e Fugas (${formatMoney(srvFugas.price)} s/ IVA)` : 'Teste de Fugas'}${srvDpf ? `. Caso o DPF esteja colmatado, a Limpeza Profissional DPF fica por ${formatMoney(srvDpf.price)} s/ IVA` : ''}. Posso agendar a receção da viatura para amanhã?`
    );
  }

  // 5. Diagnostic & Booking requests
  if (/(marcar|marcacao|agendar|amanha|hoje|vaga|disponibilidade|diagnostico)/.test(lower) && !replyParts.some(p => p.includes('Diagnóstico'))) {
    intent = 'Pedido de Marcação';
    const srvDiag = findCode('DIA-01');
    if (srvDiag && detectedServices.length === 0) {
      detectedServices.push({ serviceId: srvDiag.id, name: srvDiag.name, qty: 1, unitPrice: srvDiag.price });
    }
    replyParts.push(
      `Com todo o gosto! Temos disponibilidade na bancada de diagnóstico para amanhã às 09:00 ou às 14:30.${srvDiag ? ` O Auto-Diagnóstico Multimarca custa ${formatMoney(srvDiag.price)} s/ IVA (${formatMoney(calcWithVat(srvDiag.price))} c/ IVA).` : ''} Pode indicar-me a matrícula e o modelo do veículo para deixar já pré-marcado na secretaria?`
    );
  }

  // 6. Turbo, Hydraulics, Maintenance, Oil, Distribution, DPF
  if (/(turbo|turbocompressor|assobio)/.test(lower)) {
    const srvTurbo = findCode('TUR-02');
    if (srvTurbo) {
      intent = 'Orçamento Turbocompressor';
      detectedServices.push({ serviceId: srvTurbo.id, name: srvTurbo.name, qty: 1, unitPrice: srvTurbo.price });
      replyParts.push(`A Desmontagem e Revisão de Turbocompressor (${srvTurbo.code}) tem o preço base de ${formatMoney(srvTurbo.price)} s/ IVA (${formatMoney(calcWithVat(srvTurbo.price))} c/ IVA a ${iva}%).`);
    }
  }
  if (/(tubo|hidraulic|crava)/.test(lower)) {
    const srvTube = findCode('TUR-01');
    if (srvTube) {
      intent = 'Orçamento Hidráulica';
      detectedServices.push({ serviceId: srvTube.id, name: srvTube.name, qty: qty || 1, unitPrice: srvTube.price });
      replyParts.push(`A Cravação de Tubos Hidráulicos de Alta Pressão (${srvTube.code}) custa ${formatMoney(srvTube.price)} s/ IVA (${formatMoney(calcWithVat(srvTube.price))} c/ IVA).`);
    }
  }
  if (/(revisao|oleo|filtro|distribuicao|dpf|particulas)/.test(lower)) {
    intent = 'Orçamento Serviços Rápidos';
    const srvRev = findCode('SRV-01');
    const srvDist = findCode('SRV-02');
    const srvDpf = findCode('SRV-03');
    if (/(revisao|oleo|filtro)/.test(lower) && srvRev) {
      detectedServices.push({ serviceId: srvRev.id, name: srvRev.name, qty: 1, unitPrice: srvRev.price });
      replyParts.push(`A Revisão Completa (Óleo Sintético + Filtros) está a ${formatMoney(srvRev.price)} s/ IVA (${formatMoney(calcWithVat(srvRev.price))} c/ IVA).`);
    }
    if (/distribuicao/.test(lower) && srvDist) {
      detectedServices.push({ serviceId: srvDist.id, name: srvDist.name, qty: 1, unitPrice: srvDist.price });
      replyParts.push(`A Substituição de Kit Distribuição e Bomba de Água fica por ${formatMoney(srvDist.price)} s/ IVA (${formatMoney(calcWithVat(srvDist.price))} c/ IVA).`);
    }
    if (/(dpf|particulas)/.test(lower) && srvDpf) {
      detectedServices.push({ serviceId: srvDpf.id, name: srvDpf.name, qty: 1, unitPrice: srvDpf.price });
      replyParts.push(`A Limpeza Profissional de Filtro de Partículas (DPF) tem o valor de ${formatMoney(srvDpf.price)} s/ IVA (${formatMoney(calcWithVat(srvDpf.price))} c/ IVA).`);
    }
  }

  // 7. Dynamic match against ANY custom service added by the owner!
  if (detectedServices.length === 0 && replyParts.length === 0) {
    const customMatch = state.services.find(srv => {
      const tokens = srv.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(w => w.length >= 4);
      return tokens.some(tok => lower.includes(tok)) || lower.includes(srv.code.toLowerCase());
    });
    if (customMatch) {
      intent = `Consulta ${customMatch.code}`;
      const q = qty || 1;
      detectedServices.push({ serviceId: customMatch.id, name: customMatch.name, qty: q, unitPrice: customMatch.price });
      replyParts.push(`Segundo a nossa tabela atualizada, o serviço "${customMatch.name}" (${customMatch.code}) tem o preço base de ${formatMoney(customMatch.price)} s/ IVA — com IVA (${iva}%) fica em ${formatMoney(calcWithVat(customMatch.price * q))}${q > 1 ? ` para ${q} unidades` : ''}. Deseja agendar?`);
    }
  }

  // 8. Fallback helpful greeting / triage prompt
  if (replyParts.length === 0) {
    if (/(obrigad|adeus|ate logo|tudo bem|bom dia|boa tarde)/.test(lower)) {
      replyParts.push('Obrigado por contactar a Centro Diesel em Ponta Delgada! Se precisar de marcar ou confirmar algum orçamento, estamos disponíveis pelo 296 383 150. Tenha uma ótima viagem!');
    } else {
      intent = 'Atendimento Geral';
      replyParts.push('Compreendido! Posso informar-lhe os preços atualizados de Bombas Injetoras, Injetores Common Rail, Auto-Diagnóstico, Turbos ou Revisões Rápidas, e também marcar já uma hora na oficina. Qual é o problema da viatura ou o serviço que procura?');
    }
  }

  return {
    text: replyParts.join(' '),
    intent,
    detectedServices
  };
}

async function queryGeminiIfEnabled(userText) {
  if (!state.settings.useGemini || !state.settings.geminiApiKey) return null;
  const priceTableSummary = state.services.map(s =>
    `- [${s.code}] ${s.name} (${s.category}): ${s.price.toFixed(2)}€ s/ IVA | ${calcWithVat(s.price).toFixed(2)}€ c/ IVA (${state.settings.ivaRate}%) | Duração: ${s.duration} | Stock: ${s.stock}`
  ).join('\n');

  const systemPrompt = `És a assistente telefónica virtual da oficina Centro Diesel (Manuel Francisco Raposo & Ca. Lda.) em Ponta Delgada, São Miguel, Açores.
Morada: Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24, 9500-652 Ponta Delgada. Tel: 296 383 150. Email: mfrcentrodiesel@gmail.com.
Horário: Segunda a Sexta, 08:30–12:30 e 14:00–18:00.
Responde em Português de Portugal, de forma natural, simpática e concisa (como ao telefone, máximo 3-4 frases).
Usa EXCLUSIVAMENTE os preços desta tabela atualizada pelo dono:\n${priceTableSummary}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(state.settings.geminiModel)}:generateContent?key=${encodeURIComponent(state.settings.geminiApiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 280 }
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function handleCallerMessage(rawText) {
  const text = (rawText || '').trim();
  if (!text) return;
  if (!activeCall.inProgress) startSimulatedCall();

  activeCall.messages.push({ sender: 'caller', text });
  const vehicleFound = extractVehicleInfo(text);
  if (vehicleFound) {
    activeCall.triage.vehicle = vehicleFound;
  }
  renderCallTranscript();

  // Run local analyzer always for deterministic triage & service extraction
  const localResult = buildLocalAssistantReply(text);
  if (localResult.intent) activeCall.triage.intent = localResult.intent;
  if (localResult.detectedServices.length > 0) {
    mergeTriageServices(localResult.detectedServices);
  }
  renderCallTriage();

  let finalReply = localResult.text;
  if (state.settings.useGemini && state.settings.geminiApiKey) {
    try {
      const geminiReply = await queryGeminiIfEnabled(text);
      if (geminiReply) finalReply = geminiReply;
    } catch (err) {
      console.warn('Gemini API falhou, a usar motor local:', err);
      showToast('Gemini API indisponível — resposta gerada pelo Motor Local com preços sincronizados.', 'warning');
    }
  }

  activeCall.messages.push({ sender: 'ai', text: finalReply });
  renderCallTranscript();
  renderCallTriage();
  speakPortuguese(finalReply);
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
    listEl.innerHTML = `<div class="py-6 text-center text-xs text-slate-400">Sem chamadas correspondentes no registo.</div>`;
    return;
  }

  listEl.innerHTML = filtered.map(c => `
    <div class="py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-0.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-bold text-xs text-slate-900">${escapeHtml(c.callerName)}</span>
          <span class="text-xs text-slate-500 font-mono">${escapeHtml(c.phone)}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">${escapeHtml(c.intent)}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">${escapeHtml(c.status)}</span>
        </div>
        <div class="text-[11px] text-slate-500">${escapeHtml(c.timestamp)} • Duração: ${escapeHtml(c.duration)} • Viatura: ${escapeHtml(c.vehicle)}</div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs font-extrabold text-slate-900">${formatMoney(c.quotedTotal)}</span>
        <button onclick="viewTranscript('${c.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-xs font-semibold transition">Transcrição</button>
      </div>
    </div>
  `).join('');
}

window.viewTranscript = function (callId) {
  const call = state.calls.find(c => c.id === callId);
  if (!call) return;
  document.getElementById('modal-transcript-title').textContent = `Chamada ${call.id} — ${call.callerName} (${call.phone})`;
  document.getElementById('modal-transcript-body').innerHTML = `
    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
      <div><strong>Data/Hora:</strong> ${escapeHtml(call.timestamp)}</div>
      <div><strong>Duração:</strong> ${escapeHtml(call.duration)}</div>
      <div><strong>Viatura:</strong> ${escapeHtml(call.vehicle)}</div>
      <div><strong>Total Orçamentado:</strong> ${formatMoney(call.quotedTotal)}</div>
    </div>
    <div class="space-y-2 pt-2">
      ${(call.messages || []).map(m => `
        <div class="p-2.5 rounded-xl ${m.sender === 'ai' ? 'bg-amber-50 border border-amber-200' : 'bg-slate-900 text-white'}">
          <div class="font-bold text-[10px] uppercase mb-0.5 ${m.sender === 'ai' ? 'text-amber-700' : 'text-amber-400'}">
            ${m.sender === 'ai' ? 'Assistente Centro Diesel' : escapeHtml(call.callerName)}
          </div>
          <div>${escapeHtml(m.text)}</div>
        </div>
      `).join('')}
    </div>
  `;
  openModal('modal-transcript');
};

function convertTriageToBooking() {
  const name = document.getElementById('call-name-input').value.trim() || 'Cliente Telefónico';
  const phone = document.getElementById('call-phone-input').value.trim() || '296 383 150';
  const vehicle = document.getElementById('triage-vehicle').value.trim() || 'Viatura a confirmar';
  const serviceSummary = activeCall.triage.services.map(s => `${s.qty}x ${s.name}`).join(', ') || activeCall.triage.intent;

  state.bookings.unshift({
    id: 'AG-' + Date.now().toString().slice(-3),
    client: name,
    phone,
    vehicle,
    date: getTodayISO(1),
    time: '09:30',
    service: serviceSummary,
    source: 'Assistente IA',
    status: 'Confirmada'
  });
  saveState();
  renderAll();
  showToast(`Marcação criada na Agenda para ${name} (${vehicle})!`, 'success');
}

function convertTriageToWorkOrder() {
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
    desc: `Criada via Assistente Telefónico IA: ${serviceSummary}`,
    total: activeCall.triage.totalWithVat,
    createdAt: getTodayISO(0)
  });
  saveState();
  renderAll();
  showToast('Folha de Obra criada com sucesso!', 'success');
}

function openTriageInQuoteBuilder() {
  state.quoteDraft.clientName = document.getElementById('call-name-input').value.trim();
  state.quoteDraft.clientPhone = document.getElementById('call-phone-input').value.trim();
  const vehRaw = document.getElementById('triage-vehicle').value.trim();
  state.quoteDraft.vehiclePlate = vehRaw.split('•')[0]?.trim() || '';
  state.quoteDraft.vehicleModel = vehRaw;
  state.quoteDraft.items = activeCall.triage.services.map(s => ({ serviceId: s.serviceId, qty: s.qty }));
  state.quoteDraft.notes = `Triagem telefónica: ${activeCall.triage.intent}`;
  saveState();
  switchTab('office');
  switchOfficeSubtab('quotes');
  showToast('Dados da chamada carregados no Orçamentador!', 'info');
}

/* =========================================================================
   RENDER: SECRETARIA (FOLHAS DE OBRA, AGENDA & ORÇAMENTOS)
   ========================================================================= */

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
              <span class="font-mono text-xs font-bold text-amber-700">${escapeHtml(wo.id)}</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">${escapeHtml(wo.plate)}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-900 mt-1">${escapeHtml(wo.client)}</h4>
            <div class="text-xs text-slate-500">${escapeHtml(wo.vehicle)} • Tel: ${escapeHtml(wo.phone)}</div>
          </div>
          <select onchange="updateWorkOrderStatus('${wo.id}', this.value)" class="px-2.5 py-1 rounded-full text-[11px] font-bold border-0 cursor-pointer ${statusColors[wo.status] || 'bg-slate-100'}">
            <option ${wo.status === 'Aguardar Orçamento' ? 'selected' : ''}>Aguardar Orçamento</option>
            <option ${wo.status === 'Em Bancada de Teste' ? 'selected' : ''}>Em Bancada de Teste</option>
            <option ${wo.status === 'Aguardar Peças' ? 'selected' : ''}>Aguardar Peças</option>
            <option ${wo.status === 'Pronto para Entrega' ? 'selected' : ''}>Pronto para Entrega</option>
            <option ${wo.status === 'Entregue' ? 'selected' : ''}>Entregue</option>
          </select>
        </div>
        <p class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">${escapeHtml(wo.desc)}</p>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div>
          <span class="text-slate-400">Posto:</span> <strong class="text-slate-700">${escapeHtml(wo.bay)}</strong>
          <span class="mx-1.5 text-slate-300">|</span>
          <strong class="text-slate-900">${formatMoney(wo.total)}</strong>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="printSingleWorkOrder('${wo.id}')" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white font-semibold transition">Imprimir</button>
          <button onclick="openEditWorkOrderModal('${wo.id}')" class="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-slate-950 text-amber-800 font-semibold transition">Editar</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateWorkOrderStatus = function (id, newStatus) {
  const wo = state.workOrders.find(w => w.id === id);
  if (!wo) return;
  wo.status = newStatus;
  saveState();
  renderAll();
  showToast(`Folha ${wo.id} atualizada para "${newStatus}".`, 'info');
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
    'Portal Cliente': 'bg-emerald-100 text-emerald-800',
    'Secretaria': 'bg-blue-100 text-blue-800'
  };

  listEl.innerHTML = state.bookings.map(b => `
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3.5">
        <div class="px-3 py-2 rounded-xl bg-slate-900 text-white text-center min-w-[78px]">
          <div class="text-[10px] text-amber-400 font-bold">${escapeHtml(b.date)}</div>
          <div class="text-sm font-extrabold">${escapeHtml(b.time)}</div>
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-sm text-slate-900">${escapeHtml(b.client)}</span>
            <span class="text-xs text-slate-500">${escapeHtml(b.phone)}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${sourceBadge[b.source] || 'bg-slate-100'}">${escapeHtml(b.source)}</span>
          </div>
          <div class="text-xs text-slate-700 font-medium mt-0.5">${escapeHtml(b.vehicle)} — ${escapeHtml(b.service)}</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="convertBookingToWorkOrder('${b.id}')" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition">Abrir Folha de Obra</button>
        <button onclick="deleteBooking('${b.id}')" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition">Remover</button>
      </div>
    </div>
  `).join('');
}

window.convertBookingToWorkOrder = function (bookingId) {
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
    createdAt: getTodayISO(0)
  });
  b.status = 'Em Oficina';
  saveState();
  switchOfficeSubtab('workorders');
  renderAll();
  showToast(`Folha de Obra aberta para ${b.client}!`, 'success');
};

window.deleteBooking = function (bookingId) {
  state.bookings = state.bookings.filter(b => b.id !== bookingId);
  saveState();
  renderAll();
  showToast('Marcação removida da agenda.', 'info');
};

/* =========================================================================
   QUOTE BUILDER & PRINT A4
   ========================================================================= */

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
  if (document.activeElement !== ivaInput) {
    ivaInput.value = state.settings.ivaRate;
  }

  // Service Picker
  const picker = document.getElementById('quote-service-picker');
  picker.innerHTML = state.services.map(srv => {
    const selected = q.items.find(i => i.serviceId === srv.id);
    return `
      <div class="p-2.5 rounded-xl border ${selected ? 'border-amber-400 bg-amber-50/70' : 'border-slate-200 bg-slate-50'} flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[10px] font-mono font-bold text-slate-500">${escapeHtml(srv.code)}</div>
          <div class="text-xs font-bold text-slate-900 truncate">${escapeHtml(srv.name)}</div>
          <div class="text-[11px] font-semibold text-amber-700">${formatMoney(srv.price)} s/ IVA</div>
        </div>
        <button onclick="addServiceToQuote('${srv.id}')" class="shrink-0 px-2.5 py-1.5 rounded-lg ${selected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-white'} text-xs font-bold hover:opacity-90">
          ${selected ? `+1 (${selected.qty})` : '+ Add'}
        </button>
      </div>
    `;
  }).join('');

  // Extra parts
  const extraEl = document.getElementById('quote-extra-parts');
  if (q.extraParts.length === 0) {
    extraEl.innerHTML = `<div class="text-xs text-slate-400 italic">Sem peças extras adicionadas.</div>`;
  } else {
    extraEl.innerHTML = q.extraParts.map((part, idx) => `
      <div class="grid grid-cols-12 gap-2 items-center">
        <input type="text" value="${escapeHtml(part.name)}" placeholder="Nome da peça" onchange="updateExtraPart(${idx}, 'name', this.value)" class="col-span-6 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs" />
        <input type="number" min="1" value="${part.qty}" onchange="updateExtraPart(${idx}, 'qty', this.value)" class="col-span-2 px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-center" />
        <input type="number" min="0" step="0.5" value="${part.price}" onchange="updateExtraPart(${idx}, 'price', this.value)" class="col-span-3 px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-right" />
        <button onclick="removeExtraPart(${idx})" class="col-span-1 text-rose-600 font-bold text-xs">✕</button>
      </div>
    `).join('');
  }

  // Selected lines & totals
  const linesEl = document.getElementById('quote-selected-lines');
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
          <div class="font-bold text-slate-900 truncate">${escapeHtml(srv.name)}</div>
          <div class="text-[11px] text-slate-500">${item.qty} × ${formatMoney(srv.price)} s/ IVA</div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="font-bold text-slate-900">${formatMoney(lineTotal)}</span>
          <button onclick="changeQuoteItemQty(${idx}, -1)" class="w-5 h-5 rounded bg-white border border-slate-300 text-xs font-bold">-</button>
          <button onclick="changeQuoteItemQty(${idx}, 1)" class="w-5 h-5 rounded bg-white border border-slate-300 text-xs font-bold">+</button>
        </div>
      </div>
    `;
  });

  q.extraParts.forEach(part => {
    const lineTotal = (Number(part.price) || 0) * (Number(part.qty) || 1);
    subtotal += lineTotal;
    linesHtml += `
      <div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50/50 border border-amber-200">
        <div class="min-w-0">
          <div class="font-bold text-slate-900 truncate">[Peça] ${escapeHtml(part.name || 'Componente')}</div>
          <div class="text-[11px] text-slate-500">${part.qty} × ${formatMoney(part.price)} s/ IVA</div>
        </div>
        <span class="font-bold text-slate-900 shrink-0">${formatMoney(lineTotal)}</span>
      </div>
    `;
  });

  linesEl.innerHTML = linesHtml || `<div class="text-slate-400 italic py-4 text-center">Selecione serviços ou adicione peças à esquerda</div>`;

  const ivaRate = Number(ivaInput.value || state.settings.ivaRate || 16);
  const ivaAmount = subtotal * (ivaRate / 100);
  const total = subtotal + ivaAmount;

  document.getElementById('quote-subtotal').textContent = formatMoney(subtotal);
  document.getElementById('quote-iva-amount').textContent = formatMoney(ivaAmount);
  document.getElementById('quote-total').textContent = formatMoney(total);
}

window.addServiceToQuote = function (serviceId) {
  const existing = state.quoteDraft.items.find(i => i.serviceId === serviceId);
  if (existing) existing.qty += 1;
  else state.quoteDraft.items.push({ serviceId, qty: 1 });
  saveState();
  renderQuoteBuilder();
};

window.changeQuoteItemQty = function (idx, delta) {
  const item = state.quoteDraft.items[idx];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.quoteDraft.items.splice(idx, 1);
  saveState();
  renderQuoteBuilder();
};

window.updateExtraPart = function (idx, field, val) {
  const part = state.quoteDraft.extraParts[idx];
  if (!part) return;
  part[field] = field === 'name' ? val : (parseFloat(val) || 0);
  saveState();
  renderQuoteBuilder();
};

window.removeExtraPart = function (idx) {
  state.quoteDraft.extraParts.splice(idx, 1);
  saveState();
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
  saveState();
}

function buildPrintHeader(docTitle, docRef) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0f172a;padding-bottom:14px;margin-bottom:18px;">
      <div>
        <div style="font-size:22px;font-weight:800;color:#0f172a;">CENTRO DIESEL</div>
        <div style="font-size:12px;font-weight:700;color:#d97706;">Manuel Francisco Raposo &amp; Ca. Lda.</div>
        <div style="font-size:11px;color:#475569;margin-top:4px;">
          Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24<br/>
          9500-652 Ponta Delgada • São Miguel, Açores<br/>
          Tel: 296 383 150 • Email: mfrcentrodiesel@gmail.com
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:16px;font-weight:800;color:#0f172a;">${escapeHtml(docTitle)}</div>
        <div style="font-size:13px;font-weight:700;color:#d97706;margin-top:2px;">${escapeHtml(docRef)}</div>
        <div style="font-size:11px;color:#64748b;margin-top:4px;">Data: ${new Date().toLocaleDateString('pt-PT')}</div>
      </div>
    </div>
  `;
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
    rows += `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${escapeHtml(srv.code)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(srv.name)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${item.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(srv.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">${formatMoney(totalLine)}</td>
      </tr>`;
  });

  q.extraParts.forEach(part => {
    const totalLine = (Number(part.price) || 0) * (Number(part.qty) || 1);
    subtotal += totalLine;
    rows += `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-family:monospace;">PEÇA</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(part.name || 'Componente')}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${part.qty}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(part.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:700;">${formatMoney(totalLine)}</td>
      </tr>`;
  });

  const ivaVal = subtotal * (ivaRate / 100);
  const grandTotal = subtotal + ivaVal;

  document.getElementById('print-sheet').innerHTML = `
    ${buildPrintHeader('ORÇAMENTO / PRO-FORMA', q.number)}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;background:#f8fafc;padding:12px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:18px;font-size:12px;">
      <div>
        <div><strong>Cliente:</strong> ${escapeHtml(q.clientName || 'Consumidor Final')}</div>
        <div><strong>Telefone:</strong> ${escapeHtml(q.clientPhone || '—')}</div>
        <div><strong>NIF:</strong> ${escapeHtml(q.clientNif || '—')}</div>
      </div>
      <div>
        <div><strong>Matrícula:</strong> ${escapeHtml(q.vehiclePlate || '—')}</div>
        <div><strong>Viatura:</strong> ${escapeHtml(q.vehicleModel || '—')}</div>
        <div><strong>Notas:</strong> ${escapeHtml(q.notes || '—')}</div>
      </div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:18px;">
      <thead>
        <tr style="background:#0f172a;color:#ffffff;text-align:left;">
          <th style="padding:8px;">Código</th>
          <th style="padding:8px;">Descrição do Serviço / Peça</th>
          <th style="padding:8px;text-align:center;">Qtd</th>
          <th style="padding:8px;text-align:right;">Unit. s/ IVA</th>
          <th style="padding:8px;text-align:right;">Total s/ IVA</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="5" style="padding:12px;text-align:center;color:#64748b;">Sem linhas selecionadas</td></tr>'}</tbody>
    </table>
    <div style="margin-left:auto;width:270px;font-size:13px;border:1px solid #cbd5e1;padding:12px;border-radius:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Subtotal s/ IVA:</span><strong>${formatMoney(subtotal)}</strong></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>IVA (${ivaRate}% Açores):</span><strong>${formatMoney(ivaVal)}</strong></div>
      <div style="display:flex;justify-content:space-between;border-top:2px solid #0f172a;padding-top:8px;font-size:15px;"><span>TOTAL:</span><strong>${formatMoney(grandTotal)}</strong></div>
    </div>
    <div style="margin-top:34px;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:10px;">
      Orçamento válido por 15 dias salvo desmontagem adicional que revele anomalias ocultas. Documento emitido pelo sistema de gestão Centro Diesel.
    </div>
  `;
  window.print();
}

window.printSingleWorkOrder = function (id) {
  const wo = state.workOrders.find(w => w.id === id);
  if (!wo) return;
  document.getElementById('print-sheet').innerHTML = `
    ${buildPrintHeader('FOLHA DE OBRA OFICINAL', wo.id)}
    <div style="background:#f8fafc;padding:14px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;line-height:1.7;">
      <div><strong>Cliente:</strong> ${escapeHtml(wo.client)} &nbsp;|&nbsp; <strong>Telefone:</strong> ${escapeHtml(wo.phone)}</div>
      <div><strong>Matrícula:</strong> ${escapeHtml(wo.plate)} &nbsp;|&nbsp; <strong>Viatura:</strong> ${escapeHtml(wo.vehicle)}</div>
      <div><strong>Estado Atual:</strong> ${escapeHtml(wo.status)} &nbsp;|&nbsp; <strong>Posto / Bancada:</strong> ${escapeHtml(wo.bay)}</div>
      <div style="margin-top:8px;"><strong>Trabalhos / Sintomas:</strong><br/>${escapeHtml(wo.desc)}</div>
      <div style="margin-top:12px;font-size:15px;"><strong>Valor Estimado c/ IVA:</strong> ${formatMoney(wo.total)}</div>
    </div>
    <div style="margin-top:50px;display:flex;justify-content:space-between;font-size:12px;">
      <div style="border-top:1px solid #334155;width:42%;padding-top:6px;">Assinatura do Técnico / Responsável</div>
      <div style="border-top:1px solid #334155;width:42%;padding-top:6px;">Assinatura do Cliente (Autorização)</div>
    </div>
  `;
  window.print();
};

function printDailySummary() {
  const woRows = state.workOrders.map(w => `
    <tr>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${escapeHtml(w.id)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;font-weight:700;">${escapeHtml(w.plate)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escapeHtml(w.client)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escapeHtml(w.status)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatMoney(w.total)}</td>
    </tr>
  `).join('');

  const bkRows = state.bookings.map(b => `
    <tr>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escapeHtml(b.date)} ${escapeHtml(b.time)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escapeHtml(b.client)} (${escapeHtml(b.phone)})</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escapeHtml(b.vehicle)}</td>
      <td style="padding:6px;border-bottom:1px solid #e2e8f0;">${escapeHtml(b.service)}</td>
    </tr>
  `).join('');

  document.getElementById('print-sheet').innerHTML = `
    ${buildPrintHeader('FOLHA DIÁRIA DE SECRETARIA & OFICINA', 'RESUMO OPERACIONAL')}
    <h3 style="font-size:14px;margin:10px 0 6px;">Folhas de Obra Ativas (${state.workOrders.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:18px;">
      <thead><tr style="background:#0f172a;color:#fff;text-align:left;"><th style="padding:6px;">Ref</th><th style="padding:6px;">Matrícula</th><th style="padding:6px;">Cliente</th><th style="padding:6px;">Estado</th><th style="padding:6px;text-align:right;">Estimado</th></tr></thead>
      <tbody>${woRows}</tbody>
    </table>
    <h3 style="font-size:14px;margin:10px 0 6px;">Agenda de Marcações (${state.bookings.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <thead><tr style="background:#334155;color:#fff;text-align:left;"><th style="padding:6px;">Data / Hora</th><th style="padding:6px;">Cliente</th><th style="padding:6px;">Viatura</th><th style="padding:6px;">Serviço</th></tr></thead>
      <tbody>${bkRows}</tbody>
    </table>
  `;
  window.print();
}

/* =========================================================================
   RENDER: PORTAL PÚBLICO DO CLIENTE
   ========================================================================= */

function renderPortal() {
  document.getElementById('portal-iva-text').textContent = `${state.settings.ivaRate}%`;
  const visibleServices = state.services.filter(s => s.visible !== false);

  const grid = document.getElementById('portal-services-grid');
  grid.innerHTML = visibleServices.map(srv => {
    const imgSrc = escapeHtml(srv.image || srv.fallback || CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
    const fallbackSrc = escapeHtml(srv.fallback || CATEGORY_FALLBACKS[srv.category] || 'assets/hero-oficina.svg');
    return `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
        <div>
          <div class="h-44 bg-slate-900 relative overflow-hidden">
            <img src="${imgSrc}" onerror="this.onerror=null;this.src='${fallbackSrc}';" alt="${escapeHtml(srv.name)}" class="w-full h-full object-cover" />
            <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-950/85 text-amber-400 text-[11px] font-bold">${escapeHtml(srv.category)}</span>
          </div>
          <div class="p-4 space-y-1.5">
            <h4 class="font-extrabold text-sm text-slate-900">${escapeHtml(srv.name)}</h4>
            <p class="text-xs text-slate-500">${escapeHtml(srv.description)}</p>
          </div>
        </div>
        <div class="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-semibold">Desde (c/ IVA)</div>
            <div class="text-lg font-extrabold text-slate-900">${formatMoney(calcWithVat(srv.price))}</div>
          </div>
          <a href="#portal-contact-section" onclick="prefillPortalService('${escapeHtml(srv.name)}')" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition">
            Pedir Marcação
          </a>
        </div>
      </div>
    `;
  }).join('');

  const selectEl = document.getElementById('p-service');
  selectEl.innerHTML = visibleServices.map(s =>
    `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)} (${formatMoney(calcWithVat(s.price))} c/ IVA)</option>`
  ).join('') + `<option value="Outro / Informação Geral">Outro Assunto / Pedido de Informação</option>`;
}

window.prefillPortalService = function (serviceName) {
  const selectEl = document.getElementById('p-service');
  if (selectEl) selectEl.value = serviceName;
};

/* =========================================================================
   BADGES & MASTER RENDER
   ========================================================================= */

function renderAll() {
  document.getElementById('nav-badge-calls').textContent = state.calls.length;
  document.getElementById('nav-badge-services').textContent = state.services.length;
  document.getElementById('nav-badge-wo').textContent = state.workOrders.filter(w => w.status !== 'Entregue').length;
  document.getElementById('sidebar-iva-badge').textContent = `${state.settings.ivaRate}%`;
  document.getElementById('sidebar-engine-badge').textContent =
    (state.settings.useGemini && state.settings.geminiApiKey) ? 'Gemini API' : 'Local IA';

  renderDashboard();
  renderAssistantTab();
  renderPricesTab();
  renderOfficeSection();
  renderPortal();

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* =========================================================================
   EVENT WIRING & BOOTSTRAP
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Mobile menu
  document.getElementById('btn-mobile-menu').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('hidden');
  });
  document.getElementById('btn-close-mobile-menu').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('hidden');
  });

  // Quick Topbar Actions
  document.getElementById('btn-quick-simulate-call').addEventListener('click', () => {
    switchTab('assistant');
    startSimulatedCall();
  });
  document.getElementById('btn-quick-edit-prices').addEventListener('click', () => {
    switchTab('prices');
  });

  // Dashboard quick buttons
  document.querySelectorAll('[data-tab-jump]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tabJump));
  });
  document.querySelector('[data-action="dash-call"]').addEventListener('click', () => {
    switchTab('assistant');
    startSimulatedCall();
  });
  document.querySelector('[data-action="dash-new-wo"]').addEventListener('click', () => {
    openEditWorkOrderModal(null);
  });
  document.querySelector('[data-action="dash-prices"]').addEventListener('click', () => {
    switchTab('prices');
  });
  document.querySelector('[data-action="dash-print-day"]').addEventListener('click', printDailySummary);

  // Assistant Phone Console
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
    const input = document.getElementById('call-message-input');
    const txt = input.value;
    input.value = '';
    handleCallerMessage(txt);
  });

  document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => handleCallerMessage(btn.dataset.scenario));
  });

  document.getElementById('triage-vehicle').addEventListener('input', (e) => {
    activeCall.triage.vehicle = e.target.value;
  });

  document.getElementById('btn-triage-booking').addEventListener('click', convertTriageToBooking);
  document.getElementById('btn-triage-workorder').addEventListener('click', convertTriageToWorkOrder);
  document.getElementById('btn-triage-quote').addEventListener('click', openTriageInQuoteBuilder);

  document.getElementById('ai-tts-toggle').addEventListener('change', (e) => {
    state.settings.ttsEnabled = e.target.checked;
    if (!e.target.checked) stopSpeaking();
    saveState();
  });
  document.getElementById('ai-auto-answer').addEventListener('change', (e) => {
    state.settings.autoAnswer = e.target.checked;
    saveState();
  });
  document.getElementById('call-history-search').addEventListener('input', renderCallHistory);

  // Prices Tab
  document.getElementById('price-search').addEventListener('input', renderPricesTab);
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedPriceCategory = pill.dataset.cat;
      renderPricesTab();
    });
  });
  document.querySelectorAll('.bulk-pct-btn').forEach(btn => {
    btn.addEventListener('click', () => applyBulkPercentage(btn.dataset.bulk));
  });
  document.getElementById('btn-apply-bulk').addEventListener('click', () => {
    applyBulkPercentage(document.getElementById('bulk-percent-input').value);
  });
  document.getElementById('iva-rate-input').addEventListener('change', (e) => {
    state.settings.ivaRate = Math.max(0, Math.min(30, parseFloat(e.target.value) || 0));
    saveState();
    syncAfterPriceChange(`Taxa de IVA atualizada para ${state.settings.ivaRate}%.`);
  });
  document.getElementById('btn-new-service').addEventListener('click', () => openEditServiceModal(null));

  // Service Form Submit + Local Photo File Upload
  document.getElementById('srv-image-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById('srv-image').value = ev.target.result;
      showToast('Imagem local carregada para este serviço!', 'info');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('form-service').addEventListener('submit', (e) => {
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
      fallback: CATEGORY_FALLBACKS[category] || 'assets/hero-oficina.svg',
      visible: document.getElementById('srv-visible').checked
    };

    if (id) {
      const idx = state.services.findIndex(s => s.id === id);
      if (idx !== -1) state.services[idx] = { ...state.services[idx], ...payload };
      showToast(`Serviço "${payload.code}" atualizado e sincronizado!`, 'success');
    } else {
      state.services.unshift(payload);
      showToast(`Novo serviço "${payload.code}" adicionado à tabela e ao Assistente IA!`, 'success');
    }
    saveState();
    closeModal('modal-service');
    renderAll();
  });

  // Office Subtabs & Forms
  document.querySelectorAll('#office-subtabs .subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchOfficeSubtab(btn.dataset.subtab));
  });
  document.getElementById('wo-search').addEventListener('input', renderWorkOrders);
  document.getElementById('wo-status-filter').addEventListener('change', renderWorkOrders);
  document.getElementById('btn-new-workorder').addEventListener('click', () => openEditWorkOrderModal(null));

  document.getElementById('form-workorder').addEventListener('submit', (e) => {
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
      createdAt: getTodayISO(0)
    };
    if (id) {
      const idx = state.workOrders.findIndex(w => w.id === id);
      if (idx !== -1) state.workOrders[idx] = payload;
    } else {
      state.workOrders.unshift(payload);
    }
    saveState();
    closeModal('modal-workorder');
    renderAll();
    showToast(`Folha de Obra ${payload.id} guardada.`, 'success');
  });

  document.getElementById('btn-new-booking').addEventListener('click', () => {
    document.getElementById('bk-date').value = getTodayISO(0);
    openModal('modal-booking');
  });
  document.getElementById('form-booking').addEventListener('submit', (e) => {
    e.preventDefault();
    state.bookings.unshift({
      id: 'AG-' + Date.now().toString().slice(-3),
      client: document.getElementById('bk-client').value.trim(),
      phone: document.getElementById('bk-phone').value.trim(),
      vehicle: document.getElementById('bk-vehicle').value.trim() || 'Por indicar',
      date: document.getElementById('bk-date').value,
      time: document.getElementById('bk-time').value,
      service: document.getElementById('bk-service').value.trim() || 'Diagnóstico / Revisão',
      source: 'Secretaria',
      status: 'Confirmada'
    });
    saveState();
    closeModal('modal-booking');
    e.target.reset();
    renderAll();
    showToast('Marcação adicionada à agenda!', 'success');
  });

  // Quote Builder events
  ['q-client-name', 'q-client-phone', 'q-client-nif', 'q-client-email', 'q-vehicle-plate', 'q-vehicle-model', 'q-notes'].forEach(id => {
    document.getElementById(id).addEventListener('input', syncQuoteHeaderInputs);
  });
  document.getElementById('btn-add-extra-part').addEventListener('click', () => {
    state.quoteDraft.extraParts.push({ name: '', qty: 1, price: 0 });
    saveState();
    renderQuoteBuilder();
  });
  document.getElementById('quote-iva-override').addEventListener('change', renderQuoteBuilder);
  document.getElementById('btn-print-quote').addEventListener('click', printQuoteDocument);
  document.getElementById('btn-save-quote-wo').addEventListener('click', () => {
    syncQuoteHeaderInputs();
    const q = state.quoteDraft;
    if (!q.clientName || !q.vehiclePlate) {
      showToast('Preencha pelo menos o Nome do Cliente e a Matrícula.', 'warning');
      return;
    }
    const subtotal = q.items.reduce((acc, i) => {
      const srv = state.services.find(s => s.id === i.serviceId);
      return acc + (srv ? srv.price * i.qty : 0);
    }, 0) + q.extraParts.reduce((acc, p) => acc + (p.price * p.qty), 0);
    const ivaRate = Number(document.getElementById('quote-iva-override').value || state.settings.ivaRate || 16);
    const totalVat = Math.round(subtotal * (1 + ivaRate / 100) * 100) / 100;
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
      total: totalVat,
      createdAt: getTodayISO(0)
    });
    saveState();
    renderAll();
    switchOfficeSubtab('workorders');
    showToast('Orçamento convertido em Folha de Obra!', 'success');
  });
  document.getElementById('btn-clear-quote').addEventListener('click', () => {
    state.quoteDraft = getDefaultState().quoteDraft;
    saveState();
    renderQuoteBuilder();
    showToast('Rascunho de orçamento limpo.', 'info');
  });

  // Portal Events
  document.getElementById('btn-portal-open-assistant').addEventListener('click', () => {
    switchTab('assistant');
    startSimulatedCall();
  });
  document.getElementById('btn-hero-call-ai').addEventListener('click', () => {
    switchTab('assistant');
    startSimulatedCall();
  });
  document.getElementById('btn-portal-card-assistant').addEventListener('click', () => {
    switchTab('assistant');
    startSimulatedCall();
  });

  document.getElementById('portal-contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const client = document.getElementById('p-name').value.trim();
    const phone = document.getElementById('p-phone').value.trim();
    const vehicle = document.getElementById('p-vehicle').value.trim() || 'Por indicar';
    const service = document.getElementById('p-service').value;
    const msg = document.getElementById('p-message').value.trim();

    state.bookings.unshift({
      id: 'AG-' + Date.now().toString().slice(-3),
      client,
      phone,
      vehicle,
      date: getTodayISO(1),
      time: '10:00',
      service: `${service} — "${msg}"`,
      source: 'Portal Cliente',
      status: 'Pendente'
    });
    saveState();
    e.target.reset();
    renderAll();
    showToast(`Obrigado, ${client}! Pedido enviado para a agenda da Centro Diesel em Ponta Delgada.`, 'success');
  });

  // Settings Modal (Gemini API & Backup)
  const openSettingsFn = () => {
    document.getElementById('cfg-gemini-key').value = state.settings.geminiApiKey || '';
    document.getElementById('cfg-gemini-model').value = state.settings.geminiModel || 'gemini-2.5-flash';
    document.getElementById('cfg-use-gemini').checked = Boolean(state.settings.useGemini);
    openModal('modal-settings');
  };
  document.getElementById('btn-open-settings').addEventListener('click', openSettingsFn);
  document.getElementById('btn-assistant-gemini-cfg').addEventListener('click', openSettingsFn);

  document.getElementById('btn-save-settings').addEventListener('click', () => {
    state.settings.geminiApiKey = document.getElementById('cfg-gemini-key').value.trim();
    state.settings.geminiModel = document.getElementById('cfg-gemini-model').value;
    state.settings.useGemini = document.getElementById('cfg-use-gemini').checked;
    saveState();
    closeModal('modal-settings');
    renderAll();
    showToast('Definições guardadas com sucesso!', 'success');
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `centro-diesel-backup-${getTodayISO(0)}.json`;
    a.click();
    showToast('Backup JSON exportado!', 'success');
  });

  document.getElementById('input-import-json').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!imported.services || !imported.workOrders) throw new Error('Formato inválido');
        state = { ...getDefaultState(), ...imported };
        saveState();
        closeModal('modal-settings');
        renderAll();
        showToast('Backup restaurado com sucesso!', 'success');
      } catch (err) {
        showToast('Ficheiro de backup inválido.', 'error');
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-reset-data').addEventListener('click', () => {
    if (!confirm('Isto irá repor os serviços, preços e dados de exemplo originais. Continuar?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = getDefaultState();
    saveState();
    closeModal('modal-settings');
    renderAll();
    showToast('Dados originais da Centro Diesel repostos.', 'info');
  });

  // Close Modals
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.add('hidden');
    });
  });

  // Initial Render
  renderAll();
});
