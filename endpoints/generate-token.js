const axios = require('axios');
let data = JSON.stringify({
  "user_id": "01k82j0ye6z3w0rwvysdj43dav",
  "token": "_loto_LJgUuy0KFQejCGra",
  "expires_at": "2025-10-21T19:28:17.224299Z"
});

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://lotogreen.bet.br/api/generate-token',
  headers: { 
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2JhY2tvZmZpY2UubG90b2dyZWVuLmNvbS9hcGkvYXV0aC9sb2dpbiIsImlhdCI6MTc2MTA3NTc1NywiZXhwIjoxNzYxMjQ4NTU3LCJuYmYiOjE3NjEwNzU3NTcsImp0aSI6IlZSV2xYd2FUUE0zelVsVEwiLCJzdWIiOiIwMWs4MmoweWU2ejN3MHJ3dnlzZGo0M2RhdiIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJ1c2VyX2lkIjoiMDFrODJqMHllNnozdzByd3Z5c2RqNDNkYXYiLCJuYW1lIjoiTWF0ZXVzIFJvZHJpZ3VlcyBTYW50YW5hIiwiZW1haWwiOiJtdXZ1Y2FzYmFyc0BnbWFpbC5jb20iLCJwaG9uZSI6IjEzOTc0MTk4ODMwIiwiYmFsYW5jZSI6MTAxOCwiZG9jdW1lbnQiOiIyMzU5Nzk5ODg2MCJ9.lrgESX9HgcpKf67ckxa99Ckb7xjNAn-f-ML059W_5ls', 
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
