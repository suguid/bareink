import type { Messages } from '../types.ts'

export const ptBR: Messages = {
  reasons: {
    'record-list': 'Lista de registros não é série: cada linha é um item, não um ponto de uma tendência.',
    'single-row': 'Uma linha só: números soltos leem melhor como cartões do que como barras.',
    'mixed-units': 'Medidas em unidades diferentes: o gráfico precisaria de dois eixos.',
    'too-many-series': 'Mais de 3 séries: painéis lado a lado, ou tabela.',
    'flow-stages': 'Etapas que somam do total até o resultado: cascata.',
    'share-few': 'Parte de um todo com até 4 partes: uma barra de 0 a 100%. Nunca pizza.',
    'share-many': 'Parte de um todo com mais de 4 partes: barras horizontais ordenadas.',
    'too-few-periods': 'Menos de 3 períodos: duas colunas não mostram tendência.',
    'signed-mixed': 'Resultado com sinais mistos ao longo do tempo: o sinal importa mais que o tamanho.',
    'level-trend': 'Nível ao longo do tempo (saldo, preço, ocupação): linha.',
    'volume-trend': 'Volume por período (entradas, saídas, receita): colunas com eixo no zero.',
    'category-multi': 'Categorias com mais de uma medida: tabela.',
    'category-negative': 'Valores negativos entre categorias sem sentido de desvio: tabela.',
    'category-flat': 'Valores quase iguais: o gráfico só mostraria barras do mesmo tamanho.',
    'category-rank': 'Categorias: barras horizontais em ordem decrescente.',
    'category-top': 'Categorias: barras horizontais, as 8 maiores e o resto agrupado.',
    empty: 'Nenhuma linha para mostrar.',
    fallback: 'Nenhuma regra se aplicou: na dúvida, tabela.',
  },
  others: (n) => `Outras ${n}`,
  rest: 'Resto',
  forecast: 'previsto',
  open: 'em aberto',
  axisOffset: (start) => `O eixo começa em ${start}: a variação passa de 10% do valor.`,
}
