import type { DriveStep } from "driver.js"

export const dashboardGestorSteps: DriveStep[] = [
  {
    popover: {
      title: "Seu painel de controle",
      description:
        "Este é o Dashboard da sua secretaria. Aqui você acompanha em tempo real todos os indicadores operacionais. Vamos conhecer cada um deles.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='dash-kpi-total']",
    popover: {
      title: "Total Envolvidos",
      description:
        "Quantidade total de protocolos que passaram pela sua secretaria — seja como origem, destino ou localização atual. Inclui todos os status. O número abaixo indica os criados nos últimos 30 dias.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-kpi-queue']",
    popover: {
      title: "Na Fila",
      description:
        "Protocolos que estão <strong>atualmente localizados</strong> na sua secretaria e aguardam ação. Este é o número mais importante para o dia a dia — mantenha-o controlado.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-kpi-overdue']",
    popover: {
      title: "Atrasados",
      description:
        "Protocolos com <strong>prazo vencido</strong> que ainda não foram encerrados. Aparece em vermelho quando há atrasos. Estes processos precisam de atenção imediata.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-kpi-closed']",
    popover: {
      title: "Encerrados",
      description:
        "Total de protocolos finalizados. O subtítulo mostra o <strong>tempo médio de tramitação em dias</strong> — um indicador de eficiência da sua secretaria.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-kpi-staff']",
    popover: {
      title: "Servidores",
      description:
        "Quantidade de servidores ativos vinculados à sua secretaria no sistema. Útil para dimensionar a carga de trabalho em relação à equipe disponível.",
      side: "bottom",
    },
  },
  {
    element: "[data-tour='dash-status-chart']",
    popover: {
      title: "Protocolos por Status",
      description:
        "Gráfico de barras com a distribuição de todos os protocolos envolvendo sua secretaria por status: Abertos, Em Andamento, Pendentes, Encerrados e Arquivados. Identifica onde os processos estão acumulando.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-flows']",
    popover: {
      title: "Fluxos Saindo desta Secretaria",
      description:
        "Lista os encaminhamentos mais frequentes que <strong>saíram</strong> da sua secretaria para outras. Mostra o caminho que os processos percorrem e revela dependências entre secretarias.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-temporal']",
    popover: {
      title: "Evolução Mensal",
      description:
        "Gráfico de linha com o volume de protocolos criados nos <strong>últimos 12 meses</strong>. Permite identificar sazonalidades, picos de demanda e tendências ao longo do ano.",
      side: "top",
    },
  },
  {
    element: "[data-tour='dash-activity']",
    popover: {
      title: "Atividade Recente",
      description:
        "Log das últimas ações realizadas no sistema pela sua secretaria — criações, encaminhamentos, atualizações de status. Clique em <em>Ver tudo</em> para acessar o histórico completo de auditoria.",
      side: "top",
    },
  },
  {
    element: "[data-tour='nav-queue']",
    popover: {
      title: "Quer agir agora?",
      description:
        "Acesse <strong>Minha Fila</strong> para ver os protocolos que estão na sua secretaria aguardando encaminhamento ou resposta. Dashboard concluído!",
      side: "right",
    },
  },
]
