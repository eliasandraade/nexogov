import type { DriveStep } from "driver.js"

export const gestorTourSteps: DriveStep[] = [
  {
    popover: {
      title: "Bem-vindo ao NexoGov!",
      description:
        "Este tutorial apresenta as principais áreas do sistema para gestores e secretários. Você poderá revisitá-lo em Meu Perfil.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='nav-dashboard']",
    popover: {
      title: "Dashboard",
      description:
        "Painel de controle com KPIs, distribuição por secretaria, fluxos inter-secretaria e evolução mensal dos protocolos.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-protocols']",
    popover: {
      title: "Protocolos",
      description:
        "Lista completa de protocolos com filtros por status, secretaria, data e prioridade. Aqui você também cria novos processos.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-queue']",
    popover: {
      title: "Minha Fila",
      description:
        "Processos encaminhados especificamente para a sua secretaria que aguardam ação. Mantenha esta fila atualizada.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-metrics']",
    popover: {
      title: "Métricas",
      description:
        "Análises avançadas dos fluxos administrativos, tempo médio de tramitação, gargalos e desempenho por secretaria.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-reports']",
    popover: {
      title: "Relatórios",
      description:
        "Gere relatórios consolidados por período, secretaria ou tipo de protocolo para apoio à tomada de decisão.",
      side: "right",
    },
  },
  {
    element: "[data-tour='sidebar-footer']",
    popover: {
      title: "Pronto!",
      description:
        "Você está pronto para usar o NexoGov. Reveja este tutorial a qualquer momento em Meu Perfil.",
      side: "top",
    },
  },
]
