# Centro Diesel — Gestão de Escritório, Tabela de Preços & Assistente Telefónico Virtual

Aplicação web desenvolvida para a oficina **Centro Diesel (Manuel Francisco Raposo & Ca. Lda.)**, localizada na Zona Comercial dos Valados, Ponta Delgada (Ilha de São Miguel, Açores).

## Funcionalidades Principais

1. **Painel de Escritório (Dashboard)**
   - Indicadores ao vivo: chamadas atendidas pelo Assistente IA, marcações, folhas de obra em curso, faturação estimada (com IVA dos Açores a 16% configurável) e alertas de stock.
   - Controlo de ocupação das bancadas (*Bancada Bosch #1*, *Bancada Common Rail #2*, *Elevador Rápido #1*, *Diagnóstico Eletrónico*).
   - Impressão da **Folha Diária** em formato A4.

2. **Assistente Telefónico Virtual (`296 383 150`)**
   - Simulador de chamadas em tempo real com voz em Português (`Web Speech API`), microfone e cenários rápidos de teste.
   - **Sincronização imediata com a Tabela de Preços do Dono**: qualquer alteração de preço feita pelo proprietário é refletida na hora nas respostas do assistente telefónico.
   - Triagem automática de chamadas com conversão em 1 clique para **Marcação na Agenda**, **Folha de Obra** ou **Orçamento**.
   - Suporte opcional à **Google Gemini API** (chave configurável diretamente nas Definições da app) mantendo funcionamento 100% operacional offline através do motor local.

3. **Tabela de Preços & Catálogo (Modo Dono)**
   - 13 serviços pré-configurados nas áreas de *Bombas Injetoras*, *Injetores Common Rail*, *Auto-Diagnóstico*, *Turbos e Hidráulica* e *Serviços Rápidos Auto*.
   - Edição instantânea de preços (`-5€` / `+5€`, input direto, ajuste percentual em massa, cálculo automático com IVA, upload de imagem própria e adição de novos arranjos).

4. **Secretaria, Folhas de Obra & Orçamentos A4**
   - Gestão de viaturas por matrícula e estado.
   - Agenda de marcações unificada (Secretaria, Assistente IA e Portal do Cliente).
   - Orçamentador Pro-Forma com exportação/impressão oficial em A4.

5. **Portal Público do Cliente**
   - Versão modernizada do portal antigo (`mfrcentrodiesel.com/?page_id=76`) com preçário sincronizado, morada/contactos de Ponta Delgada e formulário de marcação online ligado à secretaria.

## Como Executar Localmente

Pode abrir diretamente o ficheiro `index.html` no navegador ou iniciar o servidor local incluído (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Depois abra no navegador: `http://localhost:8080`

## Contactos Oficiais da Oficina

- **Empresa:** Manuel Francisco Raposo & Ca. Lda. (Centro Diesel)
- **Morada:** Zona Comercial dos Valados, Rua António de Medeiros Almeida – Lotes 23/24, 9500-652 Ponta Delgada, São Miguel, Açores
- **Telefone:** 296 383 150
- **E-mail:** mfrcentrodiesel@gmail.com
