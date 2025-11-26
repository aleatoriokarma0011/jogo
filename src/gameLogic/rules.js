const mustDrawList = [
  'Uma pizza fumegante',
  'Um dragão amigável',
  'Uma praia ao pôr do sol',
  'Um robô dançando',
  'Uma nave espacial',
  'Um castelo medieval',
  'Um cachorro brincando',
  'Uma cidade futurista',
  'Um vulcão em erupção',
  'Um bolo de aniversário',
];

const forbiddenRulesList = [
  'Não use a cor vermelha',
  'Não desenhe círculos',
  'Não use a borracha',
  'Não desenhe triângulos',
  'Não desenhe números',
  'Não escreva palavras',
  'Não use a cor azul',
  'Não preencha áreas sólidas',
  'Não desenhe corações',
  'Não use a cor verde',
  'Não faça linhas retas',
  'Não desenhe estrelas',
];

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRules() {
  const mustDraw = randomFrom(mustDrawList);
  const forbiddenRules = forbiddenRulesList
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.random() > 0.5 ? 3 : 2);
  const timeLimit = 45; // segundos
  return { mustDraw, forbiddenRules, timeLimit };
}

module.exports = {
  generateRules,
};
