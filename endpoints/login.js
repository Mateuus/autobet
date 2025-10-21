 //pode ser qualquer site que usar essa estrutura, exemplo: https://lotogreen.bet.br, https://estrelabet.bet.br, https://mcgames.bet.br
const axios = require('axios');
let data = JSON.stringify({
  "email": "muvucasbars@gmail.com",
  "password": "Mts.19950927",
  "login": "muvucasbars@gmail.com"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://lotogreen.bet.br/api/auth/login',
  headers: { 
    'Origin': 'https://lotogreen.bet.br', 
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
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2JhY2tvZmZpY2UubG90b2dyZWVuLmNvbS9hcGkvYXV0aC9sb2dpbiIsImlhdCI6MTc2MTA3NTc1NywiZXhwIjoxNzYxMjQ4NTU3LCJuYmYiOjE3NjEwNzU3NTcsImp0aSI6IlZSV2xYd2FUUE0zelVsVEwiLCJzdWIiOiIwMWs4MmoweWU2ejN3MHJ3dnlzZGo0M2RhdiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJ1c2VyX2lkIjoiMDFrODJqMHllNnozdzByd3Z5c2RqNDNkYXYiLCJuYW1lIjoiTWF0ZXVzIFJvZHJpZ3VlcyBTYW50YW5hIiwiZW1haWwiOiJtdXZ1Y2FzYmFyc0BnbWFpbC5jb20iLCJwaG9uZSI6IjEzOTc0MTk4ODMwIiwiYmFsYW5jZSI6MTAxOCwiZG9jdW1lbnQiOiIyMzU5Nzk5ODg2MCJ9.lrgESX9HgcpKf67ckxa99Ckb7xjNAn-f-ML059W_5ls",
    "token_type": "bearer",
    "expires_in": 172800
}
*/