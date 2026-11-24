/* =========================================================================
   CENTRO DIESEL — Autenticação & Isolamento de Contas (Cliente vs Dono)
   Comunica com server.ps1 (/api/auth/* e /api/owner/*) com tokens separados.
   ========================================================================= */

(function (global) {
  const CLIENT_TOKEN_KEY = 'cd_client_token_v1';
  const OWNER_TOKEN_KEY = 'cd_owner_token_v1';

  function isServerMode() {
    return window.location.protocol === 'http:' || window.location.protocol === 'https:';
  }

  function getClientToken() {
    try { return sessionStorage.getItem(CLIENT_TOKEN_KEY) || ''; } catch (_) { return ''; }
  }
  function setClientToken(tok) {
    try {
      if (tok) sessionStorage.setItem(CLIENT_TOKEN_KEY, tok);
      else sessionStorage.removeItem(CLIENT_TOKEN_KEY);
    } catch (_) {}
  }

  function getOwnerToken() {
    try { return sessionStorage.getItem(OWNER_TOKEN_KEY) || ''; } catch (_) { return ''; }
  }
  function setOwnerToken(tok) {
    try {
      if (tok) sessionStorage.setItem(OWNER_TOKEN_KEY, tok);
      else sessionStorage.removeItem(OWNER_TOKEN_KEY);
    } catch (_) {}
  }

  async function apiRequest(path, method = 'GET', body = null, token = '') {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(path, {
      method,
      headers,
      cache: 'no-store',
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Erro HTTP ${res.status}`);
    }
    return data;
  }

  /* ---- Offline static file:// fallback (salted SHA-256 via Web Crypto) ---- */
  const OFFLINE_USERS_KEY = 'cd_offline_users_v1';

  async function sha256Hex(str) {
    const enc = new TextEncoder().encode(str);
    if (window.crypto && window.crypto.subtle) {
      const buf = await window.crypto.subtle.digest('SHA-256', enc);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Simple fallback if file:// disables crypto.subtle
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return 'h' + Math.abs(h).toString(16);
  }

  async function getOfflineUsers() {
    let list = [];
    try { list = JSON.parse(localStorage.getItem(OFFLINE_USERS_KEY) || '[]'); } catch (_) {}
    if (!list.some(u => u.role === 'owner')) {
      const salt = 'cd-owner-salt';
      const hash = await sha256Hex(salt + ':CentroDiesel2026!');
      list.push({
        id: 'usr-owner-1',
        username: 'dono',
        fullName: 'Proprietário Centro Diesel',
        email: 'mfrcentrodiesel@gmail.com',
        phone: '296 383 150',
        vehicle: '',
        role: 'owner',
        salt,
        passwordHash: hash,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(list));
    }
    return list;
  }

  function stripUserSecret(u) {
    return {
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone || '',
      vehicle: u.vehicle || '',
      role: u.role,
      createdAt: u.createdAt
    };
  }

  /* ---- CLIENT AUTH API ---- */

  async function registerClient(payload) {
    if (isServerMode()) {
      const res = await apiRequest('/api/auth/register', 'POST', payload);
      setClientToken(res.token);
      return res.user;
    }
    const users = await getOfflineUsers();
    const uName = (payload.username || '').trim().toLowerCase();
    const email = (payload.email || '').trim().toLowerCase();
    if (!/^[a-z0-9_.-]{3,24}$/.test(uName)) throw new Error('Nome de utilizador inválido.');
    if (users.some(u => u.username === uName)) throw new Error('Nome de utilizador já existe.');
    if (users.some(u => u.email === email)) throw new Error('Este e-mail já está registado.');
    const salt = Math.random().toString(36).slice(2);
    const passwordHash = await sha256Hex(salt + ':' + payload.password);
    const newUser = {
      id: 'usr-' + Date.now(),
      username: uName,
      fullName: (payload.fullName || '').trim(),
      email,
      phone: (payload.phone || '').trim(),
      vehicle: (payload.vehicle || '').trim(),
      role: 'client',
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
    setClientToken(newUser.id);
    return stripUserSecret(newUser);
  }

  async function loginClient(identifier, password) {
    if (isServerMode()) {
      const res = await apiRequest('/api/auth/login', 'POST', { identifier, password });
      setClientToken(res.token);
      return res.user;
    }
    const users = await getOfflineUsers();
    const idLower = (identifier || '').trim().toLowerCase();
    const user = users.find(u => u.role === 'client' && (u.username === idLower || u.email === idLower));
    if (!user) throw new Error('Utilizador ou palavra-passe incorretos.');
    const hash = await sha256Hex(user.salt + ':' + password);
    if (hash !== user.passwordHash) throw new Error('Utilizador ou palavra-passe incorretos.');
    setClientToken(user.id);
    return stripUserSecret(user);
  }

  async function getClientMe() {
    const token = getClientToken();
    if (!token) return null;
    if (isServerMode()) {
      try {
        return await apiRequest('/api/auth/me', 'GET', null, token);
      } catch (_) {
        setClientToken('');
        return null;
      }
    }
    const users = await getOfflineUsers();
    const user = users.find(u => u.id === token && u.role === 'client');
    if (!user) {
      setClientToken('');
      return null;
    }
    const state = global.CentroDieselStore.loadOwnerOfflineFallback();
    return {
      user: stripUserSecret(user),
      myBookings: (state.bookings || []).filter(b => b.userId === user.id),
      myCalls: (state.calls || []).filter(c => c.userId === user.id)
    };
  }

  async function updateClientProfile(payload) {
    const token = getClientToken();
    if (!token) throw new Error('Sessão expirada.');
    if (isServerMode()) {
      const res = await apiRequest('/api/auth/profile', 'POST', payload, token);
      return res.user;
    }
    const users = await getOfflineUsers();
    const idx = users.findIndex(u => u.id === token);
    if (idx < 0) throw new Error('Conta não encontrada.');
    if (payload.fullName) users[idx].fullName = payload.fullName.trim();
    if (payload.email) users[idx].email = payload.email.trim().toLowerCase();
    if (payload.phone !== undefined) users[idx].phone = payload.phone.trim();
    if (payload.vehicle !== undefined) users[idx].vehicle = payload.vehicle.trim();
    if (payload.newPassword) {
      const curHash = await sha256Hex(users[idx].salt + ':' + (payload.currentPassword || ''));
      if (curHash !== users[idx].passwordHash) throw new Error('Palavra-passe atual incorreta.');
      users[idx].passwordHash = await sha256Hex(users[idx].salt + ':' + payload.newPassword);
    }
    localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
    return stripUserSecret(users[idx]);
  }

  async function logoutClient() {
    const token = getClientToken();
    if (token && isServerMode()) {
      try { await apiRequest('/api/auth/logout', 'POST', {}, token); } catch (_) {}
    }
    setClientToken('');
  }

  /* ---- OWNER AUTH API ---- */

  async function ownerLogin(identifier, password) {
    if (isServerMode()) {
      const res = await apiRequest('/api/owner/login', 'POST', { identifier, password });
      setOwnerToken(res.token);
      return res.user;
    }
    const users = await getOfflineUsers();
    const idLower = (identifier || '').trim().toLowerCase();
    const match = users.find(u => u.username === idLower || u.email === idLower);
    if (match && match.role !== 'owner') {
      throw new Error('Acesso negado: contas de cliente não podem entrar na Área do Dono.');
    }
    if (!match) throw new Error('Credenciais de proprietário inválidas.');
    const hash = await sha256Hex(match.salt + ':' + password);
    if (hash !== match.passwordHash) throw new Error('Credenciais de proprietário inválidas.');
    setOwnerToken(match.id);
    return stripUserSecret(match);
  }

  async function getOwnerMe() {
    const token = getOwnerToken();
    if (!token) return null;
    if (isServerMode()) {
      try {
        const res = await apiRequest('/api/owner/me', 'GET', null, token);
        return res.user;
      } catch (_) {
        setOwnerToken('');
        return null;
      }
    }
    const users = await getOfflineUsers();
    const owner = users.find(u => u.id === token && u.role === 'owner');
    return owner ? stripUserSecret(owner) : null;
  }

  async function updateOwnerAccount(payload) {
    const token = getOwnerToken();
    if (!token) throw new Error('Sessão do dono expirada.');
    if (isServerMode()) {
      const res = await apiRequest('/api/owner/account', 'POST', payload, token);
      return res.user;
    }
    const users = await getOfflineUsers();
    const idx = users.findIndex(u => u.id === token && u.role === 'owner');
    if (idx < 0) throw new Error('Conta de dono não encontrada.');
    if (payload.username) users[idx].username = payload.username.trim().toLowerCase();
    if (payload.fullName) users[idx].fullName = payload.fullName.trim();
    if (payload.email) users[idx].email = payload.email.trim().toLowerCase();
    if (payload.newPassword) {
      const curHash = await sha256Hex(users[idx].salt + ':' + (payload.currentPassword || ''));
      if (curHash !== users[idx].passwordHash) throw new Error('Palavra-passe atual incorreta.');
      users[idx].passwordHash = await sha256Hex(users[idx].salt + ':' + payload.newPassword);
    }
    localStorage.setItem(OFFLINE_USERS_KEY, JSON.stringify(users));
    return stripUserSecret(users[idx]);
  }

  async function getOwnerClientsMasked() {
    const token = getOwnerToken();
    if (!token) return [];
    if (isServerMode()) {
      const res = await apiRequest('/api/owner/clients', 'GET', null, token);
      return res.clients || [];
    }
    const users = await getOfflineUsers();
    return users
      .filter(u => u.role === 'client')
      .map(u => {
        const parts = (u.email || '').split('@');
        const masked = parts.length === 2 ? `${parts[0].slice(0, 1)}***@${parts[1]}` : '***';
        return {
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          emailMasked: masked,
          phone: u.phone || '',
          vehicle: u.vehicle || '',
          createdAt: u.createdAt
        };
      });
  }

  async function ownerLogout() {
    const token = getOwnerToken();
    if (token && isServerMode()) {
      try { await apiRequest('/api/auth/logout', 'POST', {}, token); } catch (_) {}
    }
    setOwnerToken('');
  }

  global.CentroDieselAuth = {
    getClientToken,
    getOwnerToken,
    registerClient,
    loginClient,
    getClientMe,
    updateClientProfile,
    logoutClient,
    ownerLogin,
    getOwnerMe,
    updateOwnerAccount,
    getOwnerClientsMasked,
    ownerLogout
  };
})(window);
