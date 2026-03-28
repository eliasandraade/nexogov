import type { DriveStep } from "driver.js"

export const adminTourSteps: DriveStep[] = [
  {
    popover: {
      title: "Bem-vindo ao NexoGov!",
      description:
        "Este tutorial vai guiá-lo pela configuração inicial do sistema. São poucos passos e você poderá revisitá-lo quando quiser.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='nav-secretariats']",
    popover: {
      title: "Secretarias",
      description:
        "Comece aqui. Cadastre todas as secretarias do município — elas são a base da estrutura organizacional do sistema.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-organs']",
    popover: {
      title: "Órgãos",
      description:
        "Órgãos são subdivisões internas de uma secretaria. Cadastre-os conforme a estrutura real da prefeitura.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-sectors']",
    popover: {
      title: "Setores",
      description:
        "Setores são as unidades operacionais onde os protocolos tramitam. Cada setor pertence a uma secretaria ou órgão.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-users']",
    popover: {
      title: "Usuários",
      description:
        "Cadastre os servidores e defina seus perfis de acesso. Cada usuário é vinculado a uma secretaria e/ou setor.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-protocols']",
    popover: {
      title: "Protocolos",
      description:
        "Com a estrutura configurada, os protocolos podem ser criados e tramitados entre secretarias e setores.",
      side: "right",
    },
  },
  {
    element: "[data-tour='nav-dashboard']",
    popover: {
      title: "Dashboard",
      description:
        "Acompanhe KPIs, fluxos inter-secretaria, evolução temporal e indicadores de segurança em tempo real.",
      side: "right",
    },
  },
  {
    element: "[data-tour='sidebar-footer']",
    popover: {
      title: "Pronto para começar!",
      description:
        "Configuração concluída. Em qualquer momento, você pode rever este tutorial acessando Meu Perfil.",
      side: "top",
    },
  },
]
