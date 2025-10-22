const axios = require('axios');
let data = JSON.stringify({
  "culture": "pt-BR",
  "timezoneOffset": 180,
  "integration": "estrelabet",
  "deviceType": 1,
  "numFormat": "en-GB",
  "countryCode": "BR",
  "odds": [
    {
      "oddId": 2911669707,
      "price": 1.3847,
      "eventId": 14083496,
      "marketTypeId": 1,
      "selectionTypeId": 1,
      "sportTypeId": 1,
      "isBoost": false,
      "marketSliceType": 0
    }
  ]
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://sb2frontend-altenar2.biahosted.com/api/Widget/GetOddsStates',
  headers: { 
    'Origin': 'https://mcgames.bet.br', 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 
    'Content-Type': 'application/json'
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
