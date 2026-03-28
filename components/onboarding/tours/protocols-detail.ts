import type { DriveStep } from "driver.js"

export const protocolsDetailSteps: DriveStep[] = [
  {
    popover: {
      title: "📄 Ficha do Protocolo",
      description:
        "Esta página reúne tudo sobre um processo: dados cadastrais, histórico completo de movimentações, documentos e a localização atual. Qualquer ação sobre o protocolo parte daqui.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='protocol-actions']",
    popover: {
      title: "⚡ Ações Disponíveis",
      description:
        "<strong>Encaminhar</strong> — tramita o protocolo para outra secretaria ou setor (a ação mais comum).<br><br>" +
        "<strong>Movimento</strong> — registra um despacho ou parecer sem mover o protocolo de lugar.<br><br>" +
        "<strong>Documentos</strong> — anexa arquivos ao processo.<br><br>" +
        "<strong>Status</strong> — encerra, arquiva ou reabre o protocolo.<br><br>" +
        "<strong>Editar</strong> — corrige título, descrição ou prazo.",
      side: "bottom",
    },
  },
  {
    popover: {
      title: "🔄 Como Funciona a Tramitação",
      description:
        "Ao clicar em <strong>Encaminhar</strong>, você escolhe a secretaria e o setor de destino e registra uma observação. O protocolo passa imediatamente para a fila daquela unidade. Cada encaminhamento fica gravado para sempre no histórico — nenhum registro pode ser apagado.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='protocol-timeline']",
    popover: {
      title: "📅 Histórico de Movimentações",
      description:
        "Linha do tempo <strong>imutável</strong> de toda a vida do protocolo. Cada entrada registra: quem fez a ação, de qual secretaria/setor, para qual destino, quando e com qual observação. É a rastreabilidade completa — fundamental para auditoria e pesquisa.",
      side: "top",
    },
  },
  {
    element: "[data-tour='protocol-documents']",
    popover: {
      title: "📎 Documentos Anexados",
      description:
        "Arquivos vinculados ao processo. Cada documento tem dois níveis de visibilidade:<br><br>" +
        "🔒 <strong>Interno</strong> — visível apenas para servidores logados.<br>" +
        "🔑 <strong>Restrito</strong> — o cidadão pode acessar informando o número do protocolo e a senha criada na abertura do processo.<br><br>" +
        "Todo arquivo tem um <strong>hash de integridade</strong> registrado para garantir que não foi alterado.",
      side: "top",
    },
  },
  {
    element: "[data-tour='protocol-location']",
    popover: {
      title: "📍 Localização Atual",
      description:
        "Indica exatamente em qual <strong>secretaria e setor</strong> o protocolo se encontra neste momento. Atualizado automaticamente a cada encaminhamento. Se você precisa saber com quem falar sobre o processo, esta é a informação.",
      side: "left",
    },
  },
]
