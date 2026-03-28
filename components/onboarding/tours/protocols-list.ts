import type { DriveStep } from "driver.js"

export const protocolsListSteps: DriveStep[] = [
  {
    popover: {
      title: "📋 Sistema de Protocolos",
      description:
        "Um <strong>protocolo</strong> é um processo administrativo formal aberto por um cidadão ou servidor. Ele tramita entre secretarias e setores até ser resolvido e encerrado. Cada protocolo recebe um número único no formato <code>ANO.SEQUENCIAL</code> (ex: <code>2026.000042</code>).",
      side: "over",
      align: "center",
    },
  },
  {
    popover: {
      title: "📊 Status do Protocolo",
      description:
        "Cada protocolo está em um dos seguintes estados:<br><br>" +
        "🟢 <strong>Aberto</strong> — recém-criado, aguardando análise<br>" +
        "🔵 <strong>Em Andamento</strong> — sendo tratado ativamente<br>" +
        "🟡 <strong>Pendente</strong> — aguardando informação ou ação externa<br>" +
        "🟠 <strong>Diferido</strong> — adiado temporariamente<br>" +
        "⚫ <strong>Encerrado</strong> — resolvido e finalizado<br>" +
        "🗄️ <strong>Arquivado</strong> — encerrado e movido para arquivo",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='protocols-table']",
    popover: {
      title: "📝 Lista de Protocolos",
      description:
        "Cada linha é um processo. A coluna <strong>Secretaria Atual</strong> indica onde o protocolo está agora. Protocolos com <strong>prazo vencido</strong> ficam em vermelho com ícone de alerta — precisam de atenção imediata. Clique no ícone de olho para abrir o detalhe.",
      side: "top",
    },
  },
  {
    element: "[data-tour='protocols-filters']",
    popover: {
      title: "🔍 Filtros de Busca",
      description:
        "Encontre qualquer protocolo por <strong>número, título ou nome do interessado</strong>. Use os filtros para refinar por status, tipo (requerimento, ofício, denúncia etc.), prioridade e secretaria responsável. Combine filtros para buscas precisas.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='protocols-new-btn']",
    popover: {
      title: "➕ Criar Novo Protocolo",
      description:
        "Abre o formulário de cadastro. Você vai informar: tipo do processo, título descritivo, secretaria de origem, dados do interessado (cidadão ou empresa), prazo e documentos iniciais. O número único é gerado automaticamente pelo sistema.",
      side: "bottom",
    },
  },
]
