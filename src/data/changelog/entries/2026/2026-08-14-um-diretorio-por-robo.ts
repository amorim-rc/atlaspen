import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-14-um-diretorio-por-robo',
  date: '2026-08-14',
  title: 'Cada robô passa a morar no diretório com o nome dele',
  summary:
    'Os robôs tinham nome na documentação e no log, e não no código: viviam todos numa pasta chamada "crawler", que não é o nome de nenhum deles. Agora cada um é um sistema próprio, e o que sobra no núcleo é só o que dois deles precisam aplicar de forma idêntica.',
  body: [
    'A estrutura passou a ser scripts/robos, com um diretório por robô — vigia, sentinela, recenseador, auditor, arquivista — mais um proponente, que não é robô: não vigia nada, só transforma achado em pull request. O núcleo guarda o que é de todos: o relógio de Brasília, o download, o parser do compilado, a leitura de vigência e a de revogação.',
    'Duas peças foram promovidas ao núcleo por uma razão precisa, e não por comodidade. A primeira é a normalização de dispositivo, que transforma "Art. 121, §2º, I" no identificador com que os robôs se entendem: o Vigia confere a moldura contra o dispositivo que o registro diz ser, e o Auditor pergunta se o nome conversa com esse mesmo dispositivo. Com duas cópias, os dois divergiriam em silêncio, e o registro passaria a existir para um e não para o outro — foi assim que nasceram artigos inexistentes como o "Art. 13-O".',
    'A segunda é o critério que separa lei que cria crime de lei que fala de pena. O Sentinela aplica-o ao Diário Oficial da semana; o Recenseador, a todas as leis do ano. Comparar os dois resultados só faz sentido se o critério for um só: com duas cópias, uma divergência entre eles não distinguiria "a lei mudou" de "os filtros discordam".',
    'Junto veio uma correção de concorrência que não tinha nada a ver com os diretórios e era mais urgente que eles. Três fluxos automáticos escrevem no repositório — o carimbo da conferência, a regeneração dos dados derivados e a criação da tag de versão —, e o terceiro não declarava grupo nenhum: dois merges seguidos disparavam duas execuções simultâneas, ambas tentando criar a mesma tag. Os três passaram a compartilhar um grupo, e são serializados entre si; o resto continua em paralelo.',
  ],
  tipo: 'melhoria',
  areas: ['Documentação'],
  version: 'v2.0.6',
};

export default entrada;
