import type { DriveStep } from "driver.js"

export const protocolsListSteps: DriveStep[] = [
  {
    popover: {
      title: "Lista de Protocolos",
      description:
        "Esta é a central de protocolos do sistema. Aqui você visualiza, filtra e acessa todos os processos que tramitam na prefeitura. Vamos conhecer cada parte.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='protocols-filters']",
    popover: {
      title: "Filtros de Busca",
      description:
        "Localize protocolos por <strong>número, título ou interessado</strong>. Filtre por status (Aberto, Em Andamento, Pendente, Encerrado), tipo, prioridade, secretaria e intervalo de datas. Os filtros se combinam para buscas precisas.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='protocols-new-btn']",
    popover: {
      title: "Novo Protocolo",
      description:
        "Clique aqui para registrar um novo processo. Você vai informar o tipo, título, descrição, interessado, secretaria de origem e pode definir um prazo e enviar documentos logo na criação.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='protocols-table']",
    popover: {
      title: "Tabela de Protocolos",
      description:
        "Cada linha exibe: <strong>número único</strong> (formato ANO.SEQUENCIAL), título, tipo, status, prioridade e secretaria atual. Protocolos com <strong>prazo vencido</strong> aparecem com fundo vermelho e ícone de alerta — priorize-os.",
      side: "top",
    },
  },
  {
    element: "[data-tour='nav-protocols']",
    popover: {
      title: "Sempre acessível",
      description:
        "Você pode retornar à lista de protocolos a qualquer momento pelo menu lateral. Clique em qualquer linha da tabela para abrir o <strong>detalhe completo</strong> do protocolo. Tour concluído!",
      side: "right",
    },
  },
]
