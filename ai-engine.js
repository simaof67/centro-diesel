/* =========================================================================
   CENTRO DIESEL — Motor de Assistente Telefónico Virtual (IA + Voz PT)
   Lê os preços, horários e instruções configurados pelo Dono em tempo real.
   ========================================================================= */

(function (global) {
  function extractQuantityFromText(text) {
    const lower = String(text || '').toLowerCase();
    const wordMap = { um: 1, uma: 1, dois: 2, duas: 2, 'três': 3, tres: 3, quatro: 4, cinco: 5, seis: 6 };
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
    const plateMatch = String(text || '').toUpperCase().match(/\b([A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{2}|\d{2}[-\s]?[A-Z]{2}[-\s]?\d{2}|\d{2}[-\s]?\d{2}[-\s]?[A-Z]{2}|[A-Z]{2}[-\s]?\d{2}[-\s]?\d{2})\b/);
    const brands = ['mercedes', 'sprinter', 'renault', 'master', 'clio', 'megane', 'peugeot', 'boxer', 'partner', 'citroen', 'berlingo', 'jumper', 'vw', 'volkswagen', 'caddy', 'transporter', 'golf', 'passat', 'ford', 'transit', 'focus', 'ranger', 'toyota', 'hilux', 'dyna', 'hiace', 'isuzu', 'nissan', 'navara', 'bmw', 'audi', 'fiat', 'ducato', 'iveco', 'daily', 'carrinha', 'trator', 'camião'];
    const lower = String(text || '').toLowerCase();
    const foundBrands = brands.filter(b => new RegExp(`\\b${b}\\b`, 'i').test(lower));
    const parts = [];
    if (plateMatch) parts.push(plateMatch[0].replace(/\s+/g, '-'));
    if (foundBrands.length) parts.push(foundBrands.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' '));
    return parts.join(' • ');
  }

  function buildLocalReply(state, userText, currentIntent = 'Atendimento Geral') {
    const { formatMoney, calcWithVat } = global.CentroDieselStore;
    const lower = String(userText || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const iva = Number(state.settings.ivaRate || 16);
    const qty = extractQuantityFromText(userText);
    const workshop = state.workshop || {};
    const aiNotes = (state.settings.aiNotes || '').trim();

    const findCode = (code) => state.services.find(s => s.code.toUpperCase() === code);
    const replyParts = [];
    const detectedServices = [];
    let intent = currentIntent;

    // 1. Morada / Horário / Contactos
    if (/(morada|onde fica|localizacao|endereco|horario|hora|abre|fecha|telefone|email|contacto)/.test(lower)) {
      intent = 'Informação Localização & Horário';
      replyParts.push(
        `A oficina ${workshop.brand || 'Centro Diesel'} (${workshop.company || 'Manuel Francisco Raposo & Ca. Lda.'}) fica em ${workshop.address || 'Zona Comercial dos Valados, Ponta Delgada'}.`,
        `O horário de funcionamento é: ${workshop.hours || 'Segunda a Sexta: 08:30 – 12:30 | 14:00 – 18:00'}. Telefone: ${workshop.phone || '296 383 150'} | E-mail: ${workshop.email || 'mfrcentrodiesel@gmail.com'}.`
      );
    }

    // 2. Promoções / Avisos / Condições do Dono
    if (/(promoc|desconto|aviso|condic|campanha|oferta)/.test(lower) && aiNotes) {
      intent = 'Condições & Promoções';
      replyParts.push(`Informação da gerência: ${aiNotes}`);
    }

    // 3. Injetores Common Rail
    if (/(injetor|injetores|injector|bico|common rail|ima)/.test(lower)) {
      const q = qty || (lower.includes('injetores') ? 4 : 1);
      const srvTest = findCode('INJ-01');
      const srvClean = findCode('INJ-02');
      const srvRecon = findCode('INJ-03');
      intent = `Orçamento Injetores (${q} un.)`;

      if (/(reparar|reconstru|arranjar|substituir|novo|custa|preco|valor)/.test(lower) && srvRecon) {
        detectedServices.push({ serviceId: srvRecon.id, name: srvRecon.name, qty: q, unitPrice: srvRecon.price });
        const baseTotal = srvRecon.price * q;
        const vatTotal = calcWithVat(baseTotal, iva);
        let line = `Para ${q} injetor(es) Common Rail, o preço atual na tabela do dono para Reconstrução Completa c/ Codificação IMA (${srvRecon.code}) é de ${formatMoney(srvRecon.price)} por unidade s/ IVA (${formatMoney(baseTotal)} s/ IVA no total, ou ${formatMoney(vatTotal)} já com IVA a ${iva}%).`;
        if (srvTest) {
          line += ` Se preferir iniciar apenas pelo Teste Eletrónico em Bancada (${srvTest.code}), custa ${formatMoney(srvTest.price)} por unidade s/ IVA (${formatMoney(calcWithVat(srvTest.price * q, iva))} c/ IVA pelos ${q}).`;
        }
        replyParts.push(line);
      } else if (/(limp|ultrass)/.test(lower) && srvClean) {
        detectedServices.push({ serviceId: srvClean.id, name: srvClean.name, qty: q, unitPrice: srvClean.price });
        replyParts.push(`A Limpeza por Ultrassons e Ajuste de Injetores (${srvClean.code}) está a ${formatMoney(srvClean.price)} por unidade s/ IVA (${formatMoney(calcWithVat(srvClean.price * q, iva))} c/ IVA a ${iva}% para ${q} unidade(s)).`);
      } else if (srvTest) {
        detectedServices.push({ serviceId: srvTest.id, name: srvTest.name, qty: q, unitPrice: srvTest.price });
        replyParts.push(`O Teste Eletrónico de Injetor Common Rail (${srvTest.code}) custa ${formatMoney(srvTest.price)} por unidade s/ IVA (${formatMoney(calcWithVat(srvTest.price * q, iva))} c/ IVA para ${q} injetor(es)).`);
      }
    }

    // 4. Bombas Injetoras
    if (/(bomba|bombas|rotativa|em linha|alta pressao|cp3|cp4|bosch|delphi|denso|stanadyne)/.test(lower)) {
      intent = 'Orçamento Bomba Injetora';
      const srvTestPump = findCode('BI-01');
      const srvCommonPump = findCode('BI-03');
      const srvRotaryPump = findCode('BI-02');
      const target = (lower.includes('rotativa') || lower.includes('linha')) ? (srvRotaryPump || srvCommonPump) : (srvCommonPump || srvTestPump);
      if (srvTestPump && lower.includes('test')) {
        detectedServices.push({ serviceId: srvTestPump.id, name: srvTestPump.name, qty: 1, unitPrice: srvTestPump.price });
        replyParts.push(`O Teste e Calibração de Bomba Injetora em Bancada (${srvTestPump.code}) tem o valor base de ${formatMoney(srvTestPump.price)} s/ IVA (${formatMoney(calcWithVat(srvTestPump.price, iva))} c/ IVA).`);
      } else if (target) {
        detectedServices.push({ serviceId: target.id, name: target.name, qty: 1, unitPrice: target.price });
        replyParts.push(`Para ${target.name} (${target.code}), o valor base na nossa tabela atual é ${formatMoney(target.price)} s/ IVA (${formatMoney(calcWithVat(target.price, iva))} c/ IVA a ${iva}%).${srvTestPump ? ` O ensaio prévio em bancada fica por ${formatMoney(srvTestPump.price)} s/ IVA.` : ''}`);
      }
    }

    // 5. Sintomas (fumo preto, perda de força, luz motor)
    if (/(fumo|forca|potencia|engasga|custa a pegar|nao pega|luz|avaria|falha)/.test(lower)) {
      intent = 'Triagem Avaria / Sintoma Diesel';
      const srvDiag = findCode('DIA-01');
      const srvFugas = findCode('DIA-02');
      const srvDpf = findCode('SRV-03');
      if (srvDiag) detectedServices.push({ serviceId: srvDiag.id, name: srvDiag.name, qty: 1, unitPrice: srvDiag.price });
      if (srvFugas) detectedServices.push({ serviceId: srvFugas.id, name: srvFugas.name, qty: 1, unitPrice: srvFugas.price });
      replyParts.push(
        `Sintomas de fumo preto ou perda de força estão normalmente associados a injetores com retorno elevado, filtro de partículas (DPF), EGR ou turbocompressor.`,
        `Recomendamos iniciar com o ${srvDiag ? `${srvDiag.name} (${formatMoney(srvDiag.price)} s/ IVA / ${formatMoney(calcWithVat(srvDiag.price, iva))} c/ IVA)` : 'Auto-Diagnóstico'}${srvFugas ? ` e o Teste de Compressão e Fugas (${formatMoney(srvFugas.price)} s/ IVA)` : ''}${srvDpf ? `. Caso necessite de Limpeza DPF, o valor atual é ${formatMoney(srvDpf.price)} s/ IVA` : ''}. Quer deixar pré-marcado para amanhã?`
      );
    }

    // 6. Marcações & Diagnóstico
    if (/(marcar|marcacao|agendar|amanha|hoje|vaga|disponibilidade|diagnostico)/.test(lower) && !replyParts.some(p => p.includes('Diagnóstico'))) {
      intent = 'Pedido de Marcação';
      const srvDiag = findCode('DIA-01');
      if (srvDiag && detectedServices.length === 0) {
        detectedServices.push({ serviceId: srvDiag.id, name: srvDiag.name, qty: 1, unitPrice: srvDiag.price });
      }
      replyParts.push(
        `Com todo o gosto! Temos vaga de receção para amanhã às 09:00 ou às 14:30.${srvDiag ? ` O Auto-Diagnóstico Multimarca custa ${formatMoney(srvDiag.price)} s/ IVA (${formatMoney(calcWithVat(srvDiag.price, iva))} c/ IVA).` : ''} Indique-me o seu nome, contacto e matrícula para registar já na agenda.`
      );
    }

    // 7. Turbos, Hidráulica e Serviços Rápidos
    if (/(turbo|turbocompressor|assobio)/.test(lower)) {
      const srvTurbo = findCode('TUR-02');
      if (srvTurbo) {
        intent = 'Orçamento Turbocompressor';
        detectedServices.push({ serviceId: srvTurbo.id, name: srvTurbo.name, qty: 1, unitPrice: srvTurbo.price });
        replyParts.push(`A Desmontagem e Revisão de Turbocompressor (${srvTurbo.code}) tem o preço base de ${formatMoney(srvTurbo.price)} s/ IVA (${formatMoney(calcWithVat(srvTurbo.price, iva))} c/ IVA a ${iva}%).`);
      }
    }
    if (/(tubo|hidraulic|crava)/.test(lower)) {
      const srvTube = findCode('TUR-01');
      if (srvTube) {
        intent = 'Orçamento Hidráulica';
        detectedServices.push({ serviceId: srvTube.id, name: srvTube.name, qty: qty || 1, unitPrice: srvTube.price });
        replyParts.push(`A Cravação de Tubos Hidráulicos de Alta Pressão (${srvTube.code}) custa ${formatMoney(srvTube.price)} s/ IVA (${formatMoney(calcWithVat(srvTube.price, iva))} c/ IVA).`);
      }
    }
    if (/(revisao|oleo|filtro|distribuicao|dpf|particulas)/.test(lower)) {
      intent = 'Orçamento Serviços Rápidos';
      const srvRev = findCode('SRV-01');
      const srvDist = findCode('SRV-02');
      const srvDpf = findCode('SRV-03');
      if (/(revisao|oleo|filtro)/.test(lower) && srvRev) {
        detectedServices.push({ serviceId: srvRev.id, name: srvRev.name, qty: 1, unitPrice: srvRev.price });
        replyParts.push(`A Revisão Completa (Óleo Sintético + Filtros) está a ${formatMoney(srvRev.price)} s/ IVA (${formatMoney(calcWithVat(srvRev.price, iva))} c/ IVA).`);
      }
      if (/distribuicao/.test(lower) && srvDist) {
        detectedServices.push({ serviceId: srvDist.id, name: srvDist.name, qty: 1, unitPrice: srvDist.price });
        replyParts.push(`A Substituição de Kit Distribuição e Bomba de Água fica por ${formatMoney(srvDist.price)} s/ IVA (${formatMoney(calcWithVat(srvDist.price, iva))} c/ IVA).`);
      }
      if (/(dpf|particulas)/.test(lower) && srvDpf) {
        detectedServices.push({ serviceId: srvDpf.id, name: srvDpf.name, qty: 1, unitPrice: srvDpf.price });
        replyParts.push(`A Limpeza Profissional de Filtro de Partículas (DPF) tem o valor de ${formatMoney(srvDpf.price)} s/ IVA (${formatMoney(calcWithVat(srvDpf.price, iva))} c/ IVA).`);
      }
    }

    // 8. Pesquisa dinâmica em qualquer serviço criado pelo dono
    if (detectedServices.length === 0 && replyParts.length === 0) {
      const customMatch = state.services.find(srv => {
        const tokens = srv.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(w => w.length >= 4);
        return tokens.some(tok => lower.includes(tok)) || lower.includes(srv.code.toLowerCase());
      });
      if (customMatch) {
        intent = `Consulta ${customMatch.code}`;
        const q = qty || 1;
        detectedServices.push({ serviceId: customMatch.id, name: customMatch.name, qty: q, unitPrice: customMatch.price });
        replyParts.push(`De acordo com a tabela atual da oficina, o serviço "${customMatch.name}" (${customMatch.code}) custa ${formatMoney(customMatch.price)} s/ IVA (${formatMoney(calcWithVat(customMatch.price * q, iva))} c/ IVA a ${iva}%${q > 1 ? ` para ${q} unidades` : ''}). Deseja agendar?`);
      }
    }

    // 9. Resposta geral se nada específico coincidiu
    if (replyParts.length === 0) {
      if (/(obrigad|adeus|ate logo|tudo bem|bom dia|boa tarde)/.test(lower)) {
        replyParts.push(`Obrigado por contactar a Centro Diesel em Ponta Delgada! Estamos disponíveis pelo ${workshop.phone || '296 383 150'}. Tenha uma excelente viagem!`);
      } else {
        intent = 'Atendimento Geral';
        replyParts.push('Com certeza! Posso dar-lhe os valores atualizados de Bombas Injetoras, Injetores Common Rail, Auto-Diagnóstico, Turbos ou Revisões Rápidas, e agendar já a sua viatura. Qual é o arranjo ou sintoma do carro?');
      }
    }

    // 10. Incluir instrução/regra personalizada definida pelo dono quando há orçamento/marcação
    if (aiNotes && (detectedServices.length > 0 || intent.includes('Marcação')) && !replyParts.some(p => p.includes(aiNotes))) {
      replyParts.push(`Nota da gerência: ${aiNotes}`);
    }

    return {
      text: replyParts.join(' '),
      intent,
      detectedServices
    };
  }

  async function queryGeminiIfEnabled(state, userText) {
    if (!state.settings.useGemini || !state.settings.geminiApiKey) return null;
    const { calcWithVat } = global.CentroDieselStore;
    const iva = Number(state.settings.ivaRate || 16);
    const workshop = state.workshop || {};
    const aiNotes = (state.settings.aiNotes || '').trim();

    const priceTableSummary = state.services.map(s =>
      `- [${s.code}] ${s.name} (${s.category}): ${Number(s.price).toFixed(2)}€ s/ IVA | ${calcWithVat(s.price, iva).toFixed(2)}€ c/ IVA (${iva}%) | Duração: ${s.duration} | Stock: ${s.stock}`
    ).join('\n');

    const systemPrompt = `És a assistente telefónica virtual da oficina ${workshop.brand || 'Centro Diesel'} (${workshop.company || 'Manuel Francisco Raposo & Ca. Lda.'}).
Morada: ${workshop.address || 'Zona Comercial dos Valados, Ponta Delgada'}.
Telefone: ${workshop.phone || '296 383 150'} | E-mail: ${workshop.email || 'mfrcentrodiesel@gmail.com'}.
Horário: ${workshop.hours || 'Segunda a Sexta: 08:30 – 12:30 | 14:00 – 18:00'}.
${aiNotes ? `Instruções / Regras especiais do Dono da Oficina (OBRIGATÓRIO cumprir/mencionar quando relevante):\n${aiNotes}\n` : ''}
Responde em Português de Portugal natural, profissional e conciso (máximo 3-4 frases).
Usa EXCLUSIVAMENTE os preços desta tabela atualizada pelo dono:\n${priceTableSummary}`;

    const model = state.settings.geminiModel || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(state.settings.geminiApiKey)}`;
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

  async function generateReply(state, userText, currentIntent) {
    const localResult = buildLocalReply(state, userText, currentIntent);
    let finalReply = localResult.text;
    let usedGemini = false;

    if (state.settings.useGemini && state.settings.geminiApiKey) {
      try {
        const geminiReply = await queryGeminiIfEnabled(state, userText);
        if (geminiReply) {
          finalReply = geminiReply;
          usedGemini = true;
        }
      } catch (err) {
        console.warn('Gemini API indisponível, a usar motor local:', err);
      }
    }

    return {
      text: finalReply,
      intent: localResult.intent,
      detectedServices: localResult.detectedServices,
      usedGemini
    };
  }

  function speakPortuguese(text, ttsEnabled, onStart, onEnd) {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const ptVoice = voices.find(v => v.lang.toLowerCase().startsWith('pt-pt')) ||
                      voices.find(v => v.lang.toLowerCase().startsWith('pt'));
      if (ptVoice) utter.voice = ptVoice;
      utter.lang = 'pt-PT';
      utter.rate = 1.02;
      utter.onstart = () => onStart && onStart();
      utter.onend = () => onEnd && onEnd();
      utter.onerror = () => onEnd && onEnd();
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  function stopSpeaking(onStop) {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    if (onStop) onStop();
  }

  global.CentroDieselAI = {
    extractQuantityFromText,
    extractVehicleInfo,
    buildLocalReply,
    queryGeminiIfEnabled,
    generateReply,
    speakPortuguese,
    stopSpeaking
  };
})(window);
