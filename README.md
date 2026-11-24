# Centro Diesel — Site Público do Cliente & Painel Privado do Dono

Aplicação web dividida em **duas versões sincronizadas em tempo real** para a oficina **Centro Diesel (Manuel Francisco Raposo & Ca. Lda.)**, Zona Comercial dos Valados, Ponta Delgada (Ilha de São Miguel, Açores).

## As Duas Versões

### 1. Versão do Cliente (`index.html`)
Site público limpo pensado para os clientes da oficina:
- **Preçário ao Vivo:** mostra os preços reais definidos pelo dono (com opção para ver **c/ IVA 16% Açores** ou **s/ IVA**), fotografias reais dos serviços e avisos/promoções da gerência.
- **Assistente Telefónico Virtual (`296 383 150`):** janela interativa onde o cliente pode falar por voz ou texto com a assistente IA, que responde com os preços e regras exatas configuradas pelo dono, e permite confirmar logo uma pré-marcação.
- **Marcação Online:** substitui o antigo formulário (`mfrcentrodiesel.com/?page_id=76`) e envia os pedidos diretamente para a agenda da secretaria.

### 2. Versão do Dono & Escritório (`dono.html`)
Área privada protegida por **PIN** (**PIN padrão: `1234`**, configurável ou desativável nas Definições):
- **Preços & Regras da IA:** o dono altera preços (`-5€` / `+5€`, edição direta, ajuste em massa `%`, IVA %) e define o **horário**, a **saudação telefónica** e **instruções/promoções** que a IA diz aos clientes.
- **Central Telefónica IA:** simulador para testar chamadas após alterar preços e histórico completo de chamadas (incluindo chamadas feitas no Site do Cliente).
- **Painel de Escritório & Secretaria:** folhas de obra por matrícula, agenda unificada de marcações, controlo de bancadas e emissão/impressão de orçamentos A4.

## Sincronização Entre os Dois Sites
Ambas as versões partilham `store.js` e `ai-engine.js`:
- **No servidor local (`server.ps1`):** os dados guardam em `data.json` via `/api/state` e sincronizam automaticamente entre separadores ou navegadores.
- **Sem servidor (localStorage):** sincronizam instantaneamente no mesmo navegador entre separadores abertos.

## Como Executar

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

- **Site do Cliente:** `http://localhost:8080/`
- **Área do Dono:** `http://localhost:8080/dono.html` (PIN padrão: `1234`)

## Contactos Oficiais da Oficina
- **Empresa:** Manuel Francisco Raposo & Ca. Lda. (Centro Diesel)
- **Morada:** Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24, 9500-652 Ponta Delgada, São Miguel, Açores
- **Telefone:** 296 383 150
- **E-mail:** mfrcentrodiesel@gmail.com
