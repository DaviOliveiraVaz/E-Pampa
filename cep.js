const cep = require('cep-promise');

const inputCep = document.getElementById('cep');

inputCep.addEventListener('change', () => {
  const cepValue = inputCep.value.replace(/\D/g, ''); // Remover caracteres não numéricos do valor do CEP
  
  cep(cepValue)
    .then(result => {
      const { street, city, state, country } = result;
      console.log('Rua:', street);
      console.log('Cidade:', city);
      console.log('Estado:', state);
      console.log('País:', country);
    })
    .catch(err => {
      console.error(err);
    });
});
