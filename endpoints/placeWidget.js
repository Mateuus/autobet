const axios = require('axios');
let data = JSON.stringify({
  "culture": "pt-BR",
  "timezoneOffset": 180,
  "integration": "lotogreen",
  "deviceType": 1,
  "numFormat": "en-GB",
  "countryCode": "BR",
  "betType": 0,
  "isAutoCharge": false,
  "stakes": [
    1
  ],
  "oddsChangeAction": 0,
  "betMarkets": [
    {
      "id": 14234298,
      "isBanker": false,
      "dbId": 10,
      "sportName": "Futebol",
      "rC": false,
      "eventName": "Monagas SC vs. Academia de Puerto Cabello",
      "catName": "Venezuela",
      "champName": "Primeira Divisão",
      "sportTypeId": 1,
      "odds": [
        {
          "id": 3012490477,
          "sPOV": "2.5",
          "marketId": 1226481696,
          "price": 1.95,
          "marketName": "Total de gols",
          "marketTypeId": 18,
          "mostBalanced": true,
          "selectionTypeId": 12,
          "selectionName": "Mais de 2.5",
          "widgetInfo": {
            "widget": 20,
            "page": 7,
            "tabIndex": null,
            "tipsterId": null,
            "suggestionType": null
          }
        }
      ]
    }
  ],
  "eachWays": [
    false
  ],
  "requestId": "azfwXCRshJpuJCW_5TzSc",
  "confirmedByClient": false,
  "device": 0
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://sb2betgateway-altenar2.biahosted.com/api/widget/placeWidget',
  headers: { 
    'Origin': 'https://lotogreen.bet.br', //pode ser qualquer site que usar essa estrutura, exemplo: https://lotogreen.bet.br, https://estrelabet.bet.br, https://mcgames.bet.br
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJDb25maWd1cmF0aW9uSWQiOiIxMiIsIlBlcnNvblR5cGUiOiIzIiwiUGVyc29uSWQiOiI2NzUwMjk5NyIsIlVzZXJOYW1lIjoiTWF0ZXVzIFJvZHJpZ3VlcyBTYW50YW5hIiwiTG9naW5JZCI6Ijc1NTE4MjAyIiwiQ3VycmVuY3lTaWduIjoiUiQiLCJNaW5Cb251c1ByaWNlIjoiMS4yNSIsIkJvbnVzVGVtcGxhdGVJZCI6IjM2MyIsIkN1cnJlbmN5SWQiOiI5ODYiLCJDdXJyZW5jeUNvZGUiOiJCUkwiLCJDb3VudHJ5Q29kZSI6IkJSIiwiQnJhbmRJZCI6Ijc3MCIsIkNsaWVudElQIjoiMTc5LjEyNS4yMTEuMTM5IiwiZXhwIjoxNzYxMDc2NjkyLCJpc3MiOiJTQjIiLCJhdWQiOiJTQjIifQ.ijdaYCHJcxB3-KERgG0x8TBu0LqsTMONL7uoyaMt5jw', //token pego no SignIn.js
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

//resposta: //Respota com está tudo ok, tem outras
/*
{
    "bets": [
        {
            "id": 4178208295,
            "type": 0,
            "status": 0,
            "unitStake": 1.0,
            "totalStake": 1.0,
            "finalStake": 1.0,
            "openStake": 1.0,
            "totalWin": 1.95,
            "createdDate": "2025-10-21T19:43:43.23Z",
            "combLength": 1,
            "linesCount": 1,
            "currency": "BRL",
            "selections": [
                {
                    "id": 3012490477,
                    "status": 0,
                    "price": 1.95,
                    "priceType": 0,
                    "name": "Mais de 2.5",
                    "spec": "{\"1\":\"2.5\"}",
                    "marketName": "Total de gols",
                    "marketTypeId": 18,
                    "isLive": false,
                    "isBetBuilder": false,
                    "isBanker": false,
                    "isVirtual": false,
                    "dbId": 10,
                    "eventId": 14234298,
                    "eventName": "Monagas SC vs. Academia de Puerto Cabello",
                    "eventDate": "2025-10-21T21:30:00Z",
                    "isLiveOrVirtual": false,
                    "sportTypeId": 1,
                    "sportId": 66,
                    "champId": 4251,
                    "catId": 847,
                    "marketId": 1226481696,
                    "selectionTypeId": 12
                }
            ],
            "remainingTotalWin": 1.95,
            "cashOutValue": 0.0,
            "partialCashOut": 0.0,
            "bonus": 0.00,
            "bonusPart": 0.0,
            "initBonusPart": 0.0,
            "bonusPartPercent": 0.0,
            "bonusInsurance": 0.0,
            "isCancelAllowed": false,
            "totalOdds": 1.95
        }
    ]
}
*/