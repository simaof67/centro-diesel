/* =========================================================================
   CENTRO DIESEL — Shared Store & Real-Time Sync (Versão Cliente <-> Versão Dono)
   Sincroniza via localStorage (eventos cross-tab) e /api/state (server.ps1)
   ========================================================================= */

(function (global) {
  const STORAGE_KEY = 'centro_diesel_shared_v2';

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
      updatedAt: 0,
      workshop: {
        company: 'Manuel Francisco Raposo & Ca. Lda.',
        brand: 'Centro Diesel',
        address: 'Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24, 9500-652 Ponta Delgada',
        region: 'Ilha de São Miguel, Açores',
        phone: '296 383 150',
        email: 'mfrcentrodiesel@gmail.com',
        hours: 'Segunda a Sexta: 08:30 – 12:30 | 14:00 – 18:00'
      },
      settings: {
        ivaRate: 16,
        ownerPin: '1234',
        requirePin: true,
        aiGreeting: 'Centro Diesel, Manuel Francisco Raposo & Companhia, bom dia! Está a falar com a assistente virtual da oficina em Ponta Delgada. Em que posso ajudar hoje?',
        aiNotes: '',
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash',
        useGemini: false,
        ttsEnabled: true,
        autoAnswer: true
      },
      services: JSON.parse(JSON.stringify(DEFAULT_SERVICES)),
      bays: [
        { id: 'bay-1', name: 'Bancada Bosch #1', status: 'Ocupada', vehicle: '64-PZ-18 • Mercedes Sprinter (Exemplo)', task: 'Bomba Common Rail CP3' },
        { id: 'bay-2', name: 'Bancada Common Rail #2', status: 'Livre', vehicle: 'Disponível', task: 'Pronta para teste injetores' },
        { id: 'bay-3', name: 'Elevador Rápido #1', status: 'Ocupada', vehicle: 'AA-42-RT • VW Caddy 2.0 TDI (Exemplo)', task: 'Revisão + Limpeza DPF' },
        { id: 'bay-4', name: 'Diagnóstico Eletrónico', status: 'Reservada', vehicle: '19-ML-83 • Renault Master (Exemplo)', task: 'Diagnóstico às 14:30' }
      ],
      workOrders: [
        {
          id: 'FO-2026-104',
          client: 'Transportes Atlântico Açores (Exemplo)',
          phone: '917 440 212',
          plate: '64-PZ-18',
          vehicle: 'Mercedes-Benz Sprinter 316 CDI',
          status: 'Em Bancada de Teste',
          bay: 'Bancada Bosch #1',
          desc: 'Registo de exemplo — pode limpar todos os dados fictícios nas Definições.',
          total: 672.80,
          createdAt: getTodayISO(0)
        }
      ],
      bookings: [
        {
          id: 'AG-01',
          client: 'Carlos Arruda (Exemplo)',
          phone: '913 228 901',
          vehicle: '19-ML-83 • Renault Master',
          date: getTodayISO(0),
          time: '14:30',
          service: 'Auto-Diagnóstico Computorizado Multimarca',
          source: 'Assistente IA',
          status: 'Confirmada'
        }
      ],
      calls: [
        {
          id: 'CH-1001',
          timestamp: `${getTodayISO(0)} 09:42`,
          phone: '913 228 901',
          callerName: 'Carlos Arruda (Exemplo)',
          duration: '01:38',
          intent: 'Marcação Auto-Diagnóstico',
          vehicle: '19-ML-83 • Renault Master',
          quotedTotal: 40.60,
          status: 'Convertida em Marcação',
          messages: [
            { sender: 'ai', text: 'Centro Diesel, Manuel Francisco Raposo & Ca., bom dia! Em que podemos ajudar?' },
            { sender: 'caller', text: 'Bom dia, a minha Renault Master matrícula 19-ML-83 acendeu a luz de injeção. Queria marcar um diagnóstico hoje à tarde.' },
            { sender: 'ai', text: 'Com certeza. O Auto-Diagnóstico Computorizado Multimarca tem o valor base de 35,00 € (+ IVA). Registámos pré-marcação para hoje às 14:30 na Zona Comercial dos Valados.' }
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
        items: [],
        extraParts: []
      }
    };
  }

  function mergeWithDefault(parsed) {
    const def = getDefaultState();
    return {
      ...def,
      ...(parsed || {}),
      workshop: { ...def.workshop, ...((parsed && parsed.workshop) || {}) },
      settings: { ...def.settings, ...((parsed && parsed.settings) || {}) },
      quoteDraft: { ...def.quoteDraft, ...((parsed && parsed.quoteDraft) || {}) }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      return mergeWithDefault(JSON.parse(raw));
    } catch (err) {
      console.warn('Erro ao ler localStorage:', err);
      return getDefaultState();
    }
  }

  function isHttpOrigin() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
  }

  async function saveState(state) {
    state.updatedAt = Date.now();
    const json = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, json);
    } catch (err) {
      console.error('Erro ao guardar localStorage:', err);
    }

    if (isHttpOrigin()) {
      try {
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: json
        });
      } catch (err) {
        console.warn('Falha ao sincronizar com /api/state:', err);
      }
    }
  }

  async function syncFromServer(currentState) {
    if (!isHttpOrigin()) return { changed: false, state: currentState };
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (!res.ok) return { changed: false, state: currentState };
      const data = await res.json();
      if (data && !data.empty && Array.isArray(data.services)) {
        const merged = mergeWithDefault(data);
        const curTs = Number(currentState.updatedAt || 0);
        const srvTs = Number(merged.updatedAt || 0);
        if (srvTs > curTs || curTs === 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch (_) {}
          return { changed: true, state: merged };
        }
      }
    } catch (err) {
      // Silencioso se servido de forma estática sem /api/state
    }
    return { changed: false, state: currentState };
  }

  function subscribeSync(getCurrentState, onChange) {
    // 1. Instant cross-tab sync via localStorage 'storage' event
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = mergeWithDefault(JSON.parse(e.newValue));
          onChange(parsed);
        } catch (_) {}
      }
    });

    // 2. Lightweight server poll when running via server.ps1 (syncs across different browsers/devices)
    if (isHttpOrigin()) {
      setInterval(async () => {
        const cur = getCurrentState();
        const result = await syncFromServer(cur);
        if (result.changed) {
          onChange(result.state);
        }
      }, 3500);
    }
  }

  function clearSampleData(state) {
    state.workOrders = [];
    state.bookings = [];
    state.calls = [];
    state.bays = (state.bays || []).map(b => ({
      ...b,
      status: 'Livre',
      vehicle: 'Disponível',
      task: 'Posto livre'
    }));
    return state;
  }

  function resetToDefaults() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    const fresh = getDefaultState();
    saveState(fresh);
    return fresh;
  }

  function formatMoney(value) {
    const num = Number(value) || 0;
    return num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  function calcWithVat(basePrice, ivaRate) {
    const rate = Number(ivaRate !== undefined ? ivaRate : 16);
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
    if (!container) return;
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

  global.CentroDieselStore = {
    STORAGE_KEY,
    CATEGORY_FALLBACKS,
    DEFAULT_SERVICES,
    getTodayISO,
    getDefaultState,
    mergeWithDefault,
    loadState,
    saveState,
    syncFromServer,
    subscribeSync,
    clearSampleData,
    resetToDefaults,
    formatMoney,
    calcWithVat,
    escapeHtml,
    showToast
  };
})(window);
