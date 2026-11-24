# Centro Diesel — Site do Cliente & Site Privado do Dono (Com Contas e Privacidade)

Aplicação web dividida em **duas versões separadas e sincronizadas em tempo real** para a oficina **Centro Diesel (Manuel Francisco Raposo & Ca. Lda.)**, Zona Comercial dos Valados, Ponta Delgada (Ilha de São Miguel, Açores).

## As Duas Versões

### 1. Site Público do Cliente (`index.html`)
- **Preçário ao Vivo & Assistente Telefónico IA (`296 383 150`):** mostra os preços definidos pelo dono (c/ IVA 16% ou s/ IVA), fotografias reais e assistente virtual por voz/texto.
- **Aba "A Minha Conta" (por Nome de Utilizador `@username`):**
  - Cada cliente cria a sua própria conta (`@utilizador`, e-mail, palavra-passe, telefone e viatura) ou inicia sessão.
  - **Privacidade estrita:** cada cliente apenas vê os **seus próprios dados, marcações e consultas IA**. É impossível ver e-mails, palavras-passe ou marcações de outros clientes.
- **Sem ligações para a Área do Dono:** o site do cliente não contém menus nem links de administração.

### 2. Site Privado do Dono & Escritório (`dono.html`)
- **Login Exclusivo do Dono:** requer conta com função de proprietário (`role: owner`); contas de cliente são bloqueadas pelo servidor (`403 Forbidden`).
  - **Utilizador inicial:** `dono`
  - **Palavra-passe inicial:** `CentroDiesel2026!` *(altere na aba Conta & Segurança após entrar)*
- **Aba "Preços & Regras da IA":** editar preços (`-5€` / `+5€`, edição direta, ajuste `%`, IVA %), horário, saudação telefónica e instruções/promoções que a IA comunica aos clientes.
- **Aba "Central Telefónica IA":** simulador de chamadas e registo completo de atendimento.
- **Aba "Painel de Escritório" & "Secretaria & Orçamentos":** folhas de obra, agenda de marcações unificada, controlo de bancadas e impressão de orçamentos A4.
- **Aba "Conta & Segurança":** alterar nome de utilizador, e-mail e palavra-passe do proprietário, além de consultar clientes registados com **e-mails mascarados** e **palavras-passe encriptadas (PBKDF2-HMAC-SHA256)**.

## Segurança & Arquitetura
- **Encriptação:** Palavras-passe armazenadas exclusivamente com salt aleatório de 16 bytes + **PBKDF2-HMAC-SHA256 (50 000 iterações)** em `users.json` no servidor (`server.ps1`).
- **Isolamento no Servidor:** Ficheiros internos (`users.json`, `sessions.json`, `data.json`, `server.ps1`) têm acesso direto bloqueado via HTTP (`403 Forbidden`). O endpoint `/api/public` nunca expõe dados de utilizadores, e-mails, palavras-passe ou marcações de terceiros.

## Como Executar

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

- **Site do Cliente:** `http://localhost:8080/`
- **Site Exclusivo do Dono:** `http://localhost:8080/dono.html`

## Contactos Oficiais da Oficina
- **Empresa:** Manuel Francisco Raposo & Ca. Lda. (Centro Diesel)
- **Morada:** Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24, 9500-652 Ponta Delgada, São Miguel, Açores
- **Telefone:** 296 383 150
- **E-mail:** mfrcentrodiesel@gmail.com
