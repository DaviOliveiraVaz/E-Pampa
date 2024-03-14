const cep = require('cep-promise');

cep(96400020)
  .then(console.log)
  .catch(console.error);