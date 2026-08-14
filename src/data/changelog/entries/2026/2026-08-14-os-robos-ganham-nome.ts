import type {ChangelogEntry} from '../../types';

const entrada: ChangelogEntry = {
  id: '2026-08-14-os-robos-ganham-nome',
  date: '2026-08-14',
  title: 'O Recenseador ganha nome e lugar, e o Curador entra no roadmap',
  summary:
    'A varredura mensal de todas as leis do ano vivia escondida dentro da seção do vigia do Diário Oficial, como se fosse detalhe dele. É outro robô, com outra pergunta e outra cadência — e agora tem nome próprio na página que explica o sistema.',
  body: [
    'São perguntas distintas, e confundi-las esconde uma delas. O Vigia pergunta se a pena publicada é a que a lei comina hoje, e é completo sobre os diplomas que conhece. O Sentinela pergunta se nasceu lei penal que ainda não vigiamos. O Recenseador pergunta o que já existia e nunca foi lido — e é a mais desconfortável das três, porque a resposta não aparece em lugar nenhum quando é "sim".',
    'A página que descreve o sistema deixou de se chamar "os quatro robôs": com o quinto documentado e um sexto previsto, o número no título estava condenado a envelhecer. O endereço mudou junto.',
    'Entra no roadmap o **Curador**, robô do acervo histórico. O Recenseador varre o ano corrente; a legislação penal brasileira tem quase dois séculos e nunca foi varrida por inteiro. O Curador nasce fazendo essa varredura completa, com duas perguntas em cada lei: há tipo penal que o catálogo perdeu, e há tipo penal revogado que o catálogo ainda publica.',
    'O segundo é o mais grave, e é o que sobra como trabalho permanente dele. Um crime revogado que continua no ar afirma que a conduta é punível quando ela não é — e afirma isso justamente a quem consulta para se defender. Feita a varredura inicial, a rotina mensal do Curador é só essa: vigiar a morte dos tipos, e migrá-los para o acervo com a data de corte e o que passou a reger a conduta. Nunca apagá-los, porque continuam regendo o fato anterior.',
    'É divisão de trabalho, não multiplicação de robôs. Conferir a pena de um tipo vivo e perceber que um tipo morreu são coisas de natureza diferente: têm fonte própria, destino próprio e cadência própria. Separar deixa cada robô com um critério só — que foi exatamente o que fez o Auditor e o Arquivista funcionarem.',
  ],
  tipo: 'melhoria',
  areas: ['Documentação', 'Acervo histórico'],
  version: 'v2.0.6',
};

export default entrada;
