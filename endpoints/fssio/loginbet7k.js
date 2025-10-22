const axios = require('axios');
let data = JSON.stringify({
  "login": "23597998860",
  "email": "23597998860",
  "password": "Mateuus.27",
  "app_source": "web",
  "captcha_token": ""
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://7k.bet.br/api/auth/login',
  headers: { 
    'Origin': 'https://7k.bet.br', 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 
    'Content-Type': 'application/json', 
    'Cookie': '__Host-jwt_token_lax=eyJpdiI6ImNkeEtjUmplRVZxYkdmYU5TbFNLT0E9PSIsInZhbHVlIjoiblFXek8vcnk4OVA0L2o0TmxVLzhwQldzU0hWZllRYUFmdmJPYnNDdWhyemFUN2NLOVYyUURPdkhEWDZXTTkyTEtTMXYzV3paUGVFYW03Q1VTRlJ5VGM4NWQ0ZW9VQzNMSlAvVFh4Q0lNZnM9IiwibWFjIjoiMmEzN2ExNjUyM2I2MGZmMmE3MmRjZTI0MWQ4Mzk5YjJlOTAzY2M3MGZiMTRiYjcwNjNmNGM0NjEyNWFjNjBlZCIsInRhZyI6IiJ9; __Host-jwt_token_none=eyJpdiI6Im5KSUVhVVR6MXRRUVJNTXI2MEpxa3c9PSIsInZhbHVlIjoiV0t5NDE3MWRlVUlwOHU3bDNHMjBBbXpJTW1ZOWZSbmRTVUZ2QVVvdE9TZDlYSXN4YVI5U0RORWNTczVoQXI0dHhjVEVXVDZNU2ZaQmwzVC9uR3NGb01OUERnK0JaeGRJTWlTTzlWemI5UWM9IiwibWFjIjoiZmY4OWQwZjg2MWE2OTJjZTViZGMzM2FkZWU1YTVjZmFlMWM2ZGFjZWQ4ZDExNWFlMzg1NTk2YTZhNjU3NjEyMiIsInRhZyI6IiJ9; __Host-jwt_token_strict=eyJpdiI6IkgxYm9pdkxQcjN2c2d1SjNpNFE4a2c9PSIsInZhbHVlIjoicjVJdTVaZmJ6MnJzeWtTYTJwdUw5K2ZGcDhTSVFQbVhmUFY5MDBGeEQxUHcvY0M3K1V6MDRaTDN5U0tKRUFJeDlVeTVCWGJQL3k5RFVUWU9CUnpOc1dyOGZBcElFUll4MnluTGF3dncxQzg9IiwibWFjIjoiZTEwYjFlZGQ4ZTJmMzgwNmFkODAxYzk4YWNiNzczZDcxZGVmZjliN2Q3MmY5MmU1NzFlMmEyYzczNDcxMDFkMyIsInRhZyI6IiJ9; __cf_bm=30wmx9F1Frj30X9S6HH11RGOoVZ.6Qpq1ZvMB7vX7bQ-1761151049-1.0.1.1-wDEyPALaShPvE2nmpPRPlNrNkKdfygeWG0YtYuO2WC4ZcNuhfnxvcnDTOfaUwj_dwMbIRIB7fwkk.puG_HTAISmELQp_WpMqEnaaOx460r0; _cfuvid=Foy2exmvkzCjgHWAziEcs97wvoRzmS91AslLb8SzRLg-1761151049664-0.0.1.1-604800000; bet7k_session=eyJpdiI6IkFHbkQ2MVpNdExya0ZLZ09VMFprTGc9PSIsInZhbHVlIjoiRE52RE1qSFlNZ0twOTVSd1NKczFLMUV0VnUrdzNMbmdjQms2UTU3RTVocm92dzJHUkgzQTZhYTZmbjBRNmlWY1Zyb1huamxuOXRIVGJKV3ZqOTBXL3FxZlhtMU1UdURXY1VzMExWMFlBMVp1ZXhpL2JiT3hHZjZRWDIyQitsMlAiLCJtYWMiOiJhNzE5ZTU5OGU4MTQ1NDgzNTY5NjVlNjI2Njg5Mzg1MDU3ZWVkNzM4NjU1MzliYWQzOTdkNjUyNTYyZTk4NzQwIiwidGFnIjoiIn0%3D'
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
