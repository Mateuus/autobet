const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://mcgames.bet.br/api/alternar/token',
  headers: { 
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS1tY2dhbWVzLWJldGJyLmJzMmJldC5jb20vdjIvYXV0aC9sb2dpbiIsImlhdCI6MTc2MTA5NTQ0MiwiZXhwIjoxNzYxNzAwMjQyLCJuYmYiOjE3NjEwOTU0NDIsImp0aSI6InVNTzM5QXJ6RTJua0hLS1AiLCJzdWIiOiIyOTk4MTAxNCIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJoYSI6IjUiLCJoYiI6IjQ4MzRkMTc5NzZjZmY2NDU1NmRlMTNlNWNkNzMyNTU1IiwiaGMiOiI3MDA2YTExYzY2NzViODcwMTAwNDRjMGQ3YmIxMjY4OSIsImhpIjoiYWIyY2M3Y2Q5NzY5YmZkNzBjN2Y2ZGY2NzdhZjMzNGMiLCJoZCI6IjYyMGNlYzI1MzRkY2VkYzFjZGFkNjE4ZWViNjE5Y2VlIiwiaGwiOiI4N2YzMWUzNjVlNWNkMDcyYjA1MTE1ZDRkMWJkZTc0YSIsImhmIjoiMV82NDNkZThkM2ZlYWQwMWJkNGEzNjg3YzkxM2RjYWJiZV8xNzYxMDk1NDQwIn0.LI_OBcW9mud6AhrUiRh_qcofEmDnFLfNSkIxm-gtK24', 
    'Cookie': '__Host-jwt_token_lax=eyJpdiI6IldmZEtud1Awb2FIWmdCM2NMUXB3ZHc9PSIsInZhbHVlIjoiZldVdWxpU3FrenorTjhMZngzWHIvYkl4dFlDQkpRM25YZ0l4L1N0U3BnZ1ZGM2FhMG54eEswbGJ4b3BLbXcrWlp2RHcxZDlPamtmMlptMStUcGdTVHhMS01Sb1h5Y0F6WXBDYXNvcE9vMUk9IiwibWFjIjoiZGY2M2JjMjM0M2ViZGZlNDA4MTViZDBjYzFmNDAzNjBjMmI5MGE0NDc3Yjg1NzIzNjhhYjM1ZGI2YzI2MDQ3MyIsInRhZyI6IiJ9; __Host-jwt_token_none=eyJpdiI6IlFCaDVZRjBLOU9BNTJoL3Q2eEpKSXc9PSIsInZhbHVlIjoid2FRdGdiVXNyYnd0dWw3RzVvU1NsbUdIWHVhTHl4MUo5cXFtdldJZXNIYk1ERGUyTmhkZXNVemlnVWtIN3dtSmVrdzdhY1lMOVlCWk9UaXJNUzRtMk40dnRvMWZBTzJweGsrMlB0d0NaalU9IiwibWFjIjoiMDBmYTliNWFlZDdjZThkZDAxNDJmYzYwYWZlNjczN2JjNWYxMzEyYzk0ZTA3NTFkNjkzYzAyNzMzYTgyZTM5MSIsInRhZyI6IiJ9; __Host-jwt_token_strict=eyJpdiI6ImxoTjVBVHlaSTJTdDhOd2dYUkNLMHc9PSIsInZhbHVlIjoiS3pTSkRMd2VPZGJ2cDltTktWWXNlaG5HVERVM1hQbFZHUXpnRFdpWXBNNGZjdXhlRG9OTHFKSDc0Z2UzdW9zejFDK05mSFFMMmNFYXpYbnZXYjNNaGE0S0ZRMnNJS3JvS3RTZDdtdnRybGs9IiwibWFjIjoiNzdlNjJjMGY5NWZjNTk0NWUwNWFiNTQ2YTk4N2NhN2U1MGIzYTc1ZGU2MmZjZDdmY2MwMjQ4NDVkMzJlZGMwMSIsInRhZyI6IiJ9; __cf_bm=d8pxyCpNbf03e7wOo335Vas2xf.UpTywJJiESmw7WnQ-1761095021-1.0.1.1-zzhMlB3cL2KNFvrl31281XMnR_36UUktGNmTCb6Z034C4ct8mJCCotabk18p0P.aDNCnHWFoL4MMAdEk_4l6LLhd975MDrlU7JFnCsz_rpU; _cfuvid=2GcvgCqQUD_rO4KGBCmseh00G._OGjPtiVYrXgGgA24-1761093886745-0.0.1.1-604800000; bet7k_session=eyJpdiI6IlJxUFl1b0lzVGZTbTNRMGR0cE4vOGc9PSIsInZhbHVlIjoiaGtXbm4vWS91akhVcW05cVNOWnRMZWRBUzhSMzdjMGo0SVJlSldVOGFRbmxpemZzSkRHWWxvUEkvZ084Y0lrMzJiSHBxeUZpN05NYTZrT25nc2RmR1NEL0ordzFabEZKMDBzUW1sZTFmQlZjMGM0N0E5dXpFVk8rci9uREROdHMiLCJtYWMiOiI5ODcyODRhNTJmNmU5ZDU1MjUzNDBiZjc4OTUyZTM2NTFiNWNhZWQxZmU4NGQzNjkzNWEwZWU2MGMwODEwMzdhIiwidGFnIjoiIn0%3D'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

//reposta quando o token está errado 401 Unauthorized
{
  "status": "Wrong auth validation",
  "payloadTest": {
      "iss": "https://api-mcgames-betbr.bs2bet.com/v2/auth/login",
      "iat": 1761095592,
      "exp": 1761700392,
      "nbf": 1761095592,
      "jti": "8nlioNo6siNa8kdZ",
      "sub": "29981014",
      "prv": "23bd5c8949f600adb39e701c400872db7a5976f7",
      "ha": "5",
      "hb": "f95cf3603f859bc8d0b41906c5a82cba",
      "hc": "7006a11c6675b87010044c0d7bb12689",
      "hi": "ab2cc7cd9769bfd70c7f6df677af334c",
      "hd": "684957fdda5a20327b67563b9df7f032",
      "hl": "87f31e365e5cd072b05115d4d1bde74a",
      "hf": "1_29eeeb36bf94f88503f2b0f0f8e3d909_1761095590"
  }
}