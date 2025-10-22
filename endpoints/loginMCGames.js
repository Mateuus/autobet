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
  url: 'https://mcgames.bet.br/api/auth/login',
  headers: { 
    'Content-Type': 'application/json', 
    'Cookie': '__Host-jwt_token_lax=eyJpdiI6IldmZEtud1Awb2FIWmdCM2NMUXB3ZHc9PSIsInZhbHVlIjoiZldVdWxpU3FrenorTjhMZngzWHIvYkl4dFlDQkpRM25YZ0l4L1N0U3BnZ1ZGM2FhMG54eEswbGJ4b3BLbXcrWlp2RHcxZDlPamtmMlptMStUcGdTVHhMS01Sb1h5Y0F6WXBDYXNvcE9vMUk9IiwibWFjIjoiZGY2M2JjMjM0M2ViZGZlNDA4MTViZDBjYzFmNDAzNjBjMmI5MGE0NDc3Yjg1NzIzNjhhYjM1ZGI2YzI2MDQ3MyIsInRhZyI6IiJ9; __Host-jwt_token_none=eyJpdiI6IlFCaDVZRjBLOU9BNTJoL3Q2eEpKSXc9PSIsInZhbHVlIjoid2FRdGdiVXNyYnd0dWw3RzVvU1NsbUdIWHVhTHl4MUo5cXFtdldJZXNIYk1ERGUyTmhkZXNVemlnVWtIN3dtSmVrdzdhY1lMOVlCWk9UaXJNUzRtMk40dnRvMWZBTzJweGsrMlB0d0NaalU9IiwibWFjIjoiMDBmYTliNWFlZDdjZThkZDAxNDJmYzYwYWZlNjczN2JjNWYxMzEyYzk0ZTA3NTFkNjkzYzAyNzMzYTgyZTM5MSIsInRhZyI6IiJ9; __Host-jwt_token_strict=eyJpdiI6ImxoTjVBVHlaSTJTdDhOd2dYUkNLMHc9PSIsInZhbHVlIjoiS3pTSkRMd2VPZGJ2cDltTktWWXNlaG5HVERVM1hQbFZHUXpnRFdpWXBNNGZjdXhlRG9OTHFKSDc0Z2UzdW9zejFDK05mSFFMMmNFYXpYbnZXYjNNaGE0S0ZRMnNJS3JvS3RTZDdtdnRybGs9IiwibWFjIjoiNzdlNjJjMGY5NWZjNTk0NWUwNWFiNTQ2YTk4N2NhN2U1MGIzYTc1ZGU2MmZjZDdmY2MwMjQ4NDVkMzJlZGMwMSIsInRhZyI6IiJ9; __cf_bm=d8pxyCpNbf03e7wOo335Vas2xf.UpTywJJiESmw7WnQ-1761095021-1.0.1.1-zzhMlB3cL2KNFvrl31281XMnR_36UUktGNmTCb6Z034C4ct8mJCCotabk18p0P.aDNCnHWFoL4MMAdEk_4l6LLhd975MDrlU7JFnCsz_rpU; _cfuvid=2GcvgCqQUD_rO4KGBCmseh00G._OGjPtiVYrXgGgA24-1761093886745-0.0.1.1-604800000; bet7k_session=eyJpdiI6IjdRdDByWGFRbXhqSEdISUJnckpQS2c9PSIsInZhbHVlIjoiaFNsMFNMa2wzUEF5M2ZDUnlzS3B2ZmJVNjdKRUNuU3VnK2Z2R2R5KzNxVWRpMHd2U1BKN1ZnZmdzWVJxVm5LSFN2WmcrNXlWNHM4eVpBdzV1NjVGeWhlTTlnZm10S1padnBMVjU0V0VKWXZNeGhWOTdpM3IzSjVwbXMvUTJpWFIiLCJtYWMiOiJmNTg0YjA5ZWJiYzA3MjMwMjYwYmQ2OTRhMmQ1ZTQxNGVlMWY5NjE1NTRiZmU3ZWY3MTY0YzJiOGZjNjU4NjNkIiwidGFnIjoiIn0%3D'
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
