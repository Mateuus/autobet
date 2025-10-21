const axios = require('axios');
let data = JSON.stringify({
  "culture": "pt-BR",
  "timezoneOffset": 180,
  "integration": "lotogreen",
  "deviceType": 1,
  "numFormat": "en-GB",
  "countryCode": "BR",
  "token": "_loto_95KS3KlNXdqIOFQ6" //token pego no generate-token.js
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://sb2auth-altenar2.biahosted.com/api/WidgetAuth/SignIn',
  headers: { 
    'Origin': 'https://lotogreen.bet.br', 
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

//resposta:
/*
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDb25maWd1cmF0aW9uSWQiOiIxMiIsIlBlcnNvblR5cGUiOiIzIiwiUGVyc29uSWQiOiI2NzUwMjk5NyIsIlVzZXJOYW1lIjoiTWF0ZXVzIFJvZHJpZ3VlcyBTYW50YW5hIiwiTG9naW5JZCI6Ijc1NTE4MjAyIiwiQ3VycmVuY3lTaWduIjoiUiQiLCJNaW5Cb251c1ByaWNlIjoiMS4yNSIsIkJvbnVzVGVtcGxhdGVJZCI6IjM2MyIsIkN1cnJlbmN5SWQiOiI5ODYiLCJDdXJyZW5jeUNvZGUiOiJCUkwiLCJDb3VudHJ5Q29kZSI6IkJSIiwiQnJhbmRJZCI6Ijc3MCIsIkNsaWVudElQIjoiMTc5LjEyNS4yMTEuMTM5IiwiZXhwIjoxNzYxMDc2NjkyLCJpc3MiOiJTQjIiLCJhdWQiOiJTQjIifQ.ijdaYCHJcxB3-KERgG0x8TBu0LqsTMONL7uoyaMt5jw",
    "currency": "BRL",
    "isUserLocked": false,
    "isAgency": false,
    "currencySign": "R$",
    "currencyId": 986,
    "currencyDisplay": 0,
    "encryptedPlayerId": "53IX2njrpncpHT7Egr/3gA==",
    "regDate": "2025-10-21T05:06:26.45"
}
*/