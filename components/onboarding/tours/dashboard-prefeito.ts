import type { DriveStep } from "driver.js"

export const dashboardPrefeitoSteps: DriveStep[] = [
  {
    popover: {
      title: "Painel gerencial do município",
      description:
        "Este é o Dashboard global — uma visão consolidada de todos os protocolos do município. Vamos conhecer cada indicador.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='dash-kpi-total']",
    popover: {
      title: "Total de Protocolos",
      description:
        "Quantidade total de processos registrados no sistema desde o início. O número abaixo indica os criados nos <strong>últimos 30 dias</strong>, mostrando o ritmo atual de entrada.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-kpi-queue']",
    popover: {
      title: "Em Tramitação",
      description:
        "Processos ativos no momento — soma dos <strong>Abertos</strong> (registrados, aguardando início) e <strong>Em Andamento</strong> (em movimento entre secretarias). É o volume de trabalho corrente do município.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-kpi-overdue']",
    popover: {
      title: "Pendentes e Atrasados",
      description:
        "Protocolos com status <strong>Pendente</strong> (aguardando documento ou resposta externa). Se houver atrasos com prazo vencido, aparece um alerta em vermelho. Requer atenção prioritária.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-kpi-closed']",
    popover: {
      title: "Encerrados",
      description:
        "Total de processos finalizados. O tempo médio de tramitação em dias é um <strong>indicador de desempenho</strong> da gestão municipal — quanto menor, mais ágil o serviço público.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-status-chart']",
    popover: {
      title: "Distribuição por Status",
      description:
        "Visão gráfica de todos os protocolos por status. Permite identificar rapidamente se há acúmulo em alguma fase do fluxo administrativo.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-by-secretariat']",
    popover: {
      title: "Por Secretaria",
      description:
        "Distribuição dos protocolos entre as secretarias. As barras mostram a <strong>participação percentual</strong> de cada secretaria no total — revela quais unidades concentram mais demanda.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-flows']",
    popover: {
      title: "Fluxos Inter-Secretaria",
      description:
        "Os encaminhamentos mais frequentes entre secretarias. Mostra como os processos circulam pela prefeitura e quais secretarias dependem mais umas das outras.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-temporal']",
    popover: {
      title: "Evolução Mensal (12 meses)",
      description:
        "Histórico de volume de protocolos mês a mês. Permite identificar <strong>sazonalidades</strong>, crescimento da demanda e o impacto de políticas ou eventos sobre o volume administrativo.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-flow-matrix']",
    popover: {
      title: "Matriz de Fluxos",
      description:
        "Mapa de calor com todos os fluxos entre secretarias. Células mais escuras indicam maior volume de encaminhamentos naquele par. Útil para identificar gargalos e dependências estruturais.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-security']",
    popover: {
      title: "Indicadores de Segurança",
      description:
        "Monitoramento de <strong>tentativas inválidas de acesso a documentos</strong> nos últimos 7 dias e protocolos com prazo vencido. Sinais de alerta para a gestão de conformidade.",
      side: "right",
    },
  },
  {
    element: "[data-tour='dash-activity']",
    popover: {
      title: "Atividade Recente",
      description:
        "Registro em tempo real das últimas ações no sistema. Clique em <em>Ver tudo</em> para acessar o <strong>log completo de auditoria</strong> com filtros por usuário, secretaria e data.",
      side: "top",
    },
  },
  {
    element: "[data-tour='nav-metrics']",
    popover: {
      title: "Análises avançadas",
      description:
        "Para análises mais aprofundadas, acesse <strong>Métricas</strong> — tempo médio por secretaria, gargalos e desempenho histórico. Dashboard concluído!",
      side: "right",
    },
  },
]
