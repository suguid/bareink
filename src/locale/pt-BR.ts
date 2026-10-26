import type { Messages } from '../types.ts'

export const ptBR: Messages = {
  reasons: {
    'record-list': 'Lista de itens, não uma série: tabela.',
    'single-row': 'Uma linha: números leem melhor em cartões.',
    'mixed-units': 'Unidades diferentes pediriam dois eixos: tabela.',
    'too-many-series': 'Mais de 3 séries: tabela.',
    'flow-stages': 'Etapas de um total até um resultado: cascata.',
    'share-few': 'Até 4 partes de um todo: uma barra de 0 a 100%, nunca pizza.',
    'share-many': 'Mais de 4 partes de um todo: barras ordenadas.',
    'too-few-periods': 'Menos de 3 períodos não mostram tendência: tabela.',
    'signed-mixed': 'Sinais mistos no tempo: o sinal importa mais que o tamanho.',
    'level-trend': 'Nível ao longo do tempo: linha.',
    'volume-trend': 'Volume por período: colunas a partir do zero.',
    'category-multi': 'Categorias com várias medidas: tabela.',
    'category-negative': 'Valores negativos entre categorias: tabela.',
    'category-flat': 'Valores quase iguais dariam barras iguais: tabela.',
    'category-rank': 'Categorias: barras, da maior para a menor.',
    'category-top': 'Categorias: as 8 maiores em barras, o resto agrupado.',
    empty: 'Nenhuma linha.',
    fallback: 'Nenhuma regra se aplicou: tabela.',
  },
  others: (n) => `Outras ${n}`,
  rest: 'Resto',
  forecast: 'previsto',
  open: 'em aberto',
  axisOffset: (start) => `Eixo começa em ${start}: a variação passa de 10% do valor.`,
}
