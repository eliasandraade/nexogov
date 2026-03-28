import type { DriveStep } from "driver.js"

export const servidorTourSteps: DriveStep[] = [
  {
    popover: {
      title: "Bem-vindo ao NexoGov!",
      description:
        "Sistema de tramitação de processos da prefeitura. Este tutorial mostra as áreas que você vai usar no dia a dia.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='nav-protocols']",
    popover: {
      title: "Protocolos",
      description:
        "Aqui você cria novos protocolos, consulta o andamento dos processos e realiza encaminhamentos entre setores e secretarias.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-queue']",
    popover: {
      title: "Minha Fila",
      description:
        "Processos encaminhados para o seu setor que precisam de atenção. Acompanhe e trate cada item desta fila.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-profile']",
    popover: {
      title: "Meu Perfil",
      description:
        "Atualize sua senha e dados de conta. Você também pode rever este tutorial aqui quando precisar.",
      side: "right",
    },
  },
  {
    element: "[data-tour='sidebar-footer']",
    popover: {
      title: "Pronto para começar!",
      description:
        "Qualquer dúvida, contate o administrador do sistema ou reveja este tutorial em Meu Perfil.",
      side: "top",
    },
  },
]
