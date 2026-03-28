import type { DriveStep } from "driver.js"

export const protocolsDetailSteps: DriveStep[] = [
  {
    popover: {
      title: "Detalhe do Protocolo",
      description:
        "Esta é a página central de um protocolo. Aqui você acompanha toda a vida do processo — desde a criação até o encerramento — e executa as ações necessárias. Vamos conhecer cada seção.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='protocol-actions']",
    popover: {
      title: "Ações do Protocolo",
      description:
        "Botões de ação disponíveis: <strong>Editar</strong> (dados gerais), <strong>Encaminhar</strong> (tramitar para outra secretaria ou setor), <strong>Movimento</strong> (registrar despacho ou parecer), <strong>Documentos</strong> (anexar arquivos) e <strong>Status</strong> (alterar a situação do processo).",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='protocol-timeline']",
    popover: {
      title: "Histórico de Movimentações",
      description:
        "Linha do tempo completa e <strong>imutável</strong> de todas as tramitações do protocolo. Cada entrada registra: quem fez, de onde veio, para onde foi e quando. É a rastreabilidade total do processo.",
      side: "top",
    },
  },
  {
    element: "[data-tour='protocol-documents']",
    popover: {
      title: "Documentos Anexados",
      description:
        "Lista todos os arquivos vinculados ao protocolo. Documentos podem ser <strong>Internos</strong> (visíveis apenas internamente) ou <strong>Restritos</strong> (requerem número do protocolo e senha para acesso externo). Cada arquivo tem hash de integridade registrado.",
      side: "top",
    },
  },
  {
    element: "[data-tour='protocol-location']",
    popover: {
      title: "Localização Atual",
      description:
        "Indica em qual <strong>secretaria e setor</strong> o protocolo está localizado no momento. Sempre atualizado a cada encaminhamento. Use esta informação para saber com quem falar sobre o processo.",
      side: "left",
    },
  },
  {
    element: "[data-tour='nav-protocols']",
    popover: {
      title: "Pronto para trabalhar!",
      description:
        "Você já conhece o essencial do sistema de protocolos. Retorne à lista sempre que precisar localizar um processo. Tour concluído!",
      side: "right",
    },
  },
]
