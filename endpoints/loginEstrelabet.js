const axios = require('axios');
let data = JSON.stringify({
  "login": "muvucasbars@gmail.com",
  "domain": "www.estrelabet.bet.br",
  "lnSessionId": "dd8a1dbe-f571-403b-9722-c1540018f8e7",
  "password": "Mateuus.27"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://www.estrelabet.bet.br/next/pb/api/login',
  headers: { 
    'Content-Type': 'application/json', 
    'Cookie': '__cf_bm=9lZSEa8BVxT8qXi5HgyVHQbX_3hRIz89b8Cept0o80M-1761098324-1.0.1.1-6HWnq3qnob4Qj4OcWyv24nfLMI3V_SIlL_9ZRyNkugz.8P8cnnJsZrmdcmixvz5yokjaQFZa8QZjaMl46Oc9z6GS_z2zlcGPdKYCyysD79w; _cfuvid=8afnYcLwv9QC7lC0Z64ACK92qG8pRct5bQ09BZBkJ7w-1761098324745-0.0.1.1-604800000; ci_session=gg0q7i3il744aj7a6j11k6e0h2boo6ol'
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
/*{
    "data": {
        "success": true,
        "id": "gg0q7i3il744aj7a6j11k6e0h2boo6ol",
        "sessionLimit": 0,
        "ecrCategory": "real_user",
        "language": "pt_BR",
        "rvpSessionId": "d0c61ed6-e442-4384-a1d6-b4d74d98af49_SESSIONKEY",
        "riverplayUrl": "wss://push.estrelabet.com",
        "pragmaticSessionId": "d0c61ed6-e442-4384-a1d6-b4d74d98af49_SESSIONKEY",
        "pragmaticUrl": "wss://push.estrelabet.com",
        "mobileVerificationStatus": "SUCCESS",
        "emailVerificationStatus": "SUCCESS",
        "twoFactorAuthEnabled": false,
        "user": {
            "id": "EST2022099960136",
            "rvpSessionId": "d0c61ed6-e442-4384-a1d6-b4d74d98af49_SESSIONKEY",
            "riverplayUrl": "wss://push.estrelabet.com",
            "pragmaticSessionId": "d0c61ed6-e442-4384-a1d6-b4d74d98af49_SESSIONKEY",
            "pragmaticUrl": "wss://push.estrelabet.com",
            "partnerId": "estrelabet"
        },
        "lastLoginTime": "1761098596",
        "userJurisdiction": "brazil",
        "jurisdictionResponse": "",
        "postAuthPopUpDetails": [],
        "policies": [
            {
                "policyType": "BONUS_RULES",
                "policyVersionId": "2.0",
                "policyAccepted": true,
                "policyConfirmationDate": "2023-10-01 14:43:55.0",
                "policyVersionType": "MATERIAL"
            },
            {
                "policyType": "PRIVACY_POLICY",
                "policyVersionId": "2.0",
                "policyAccepted": true,
                "policyConfirmationDate": "2023-10-01 14:43:55.0",
                "policyVersionType": "MATERIAL"
            },
            {
                "policyType": "SPORTS_BETTING_RULES",
                "policyVersionId": "2.0",
                "policyAccepted": true,
                "policyConfirmationDate": "2023-10-01 14:43:55.0",
                "policyVersionType": "MATERIAL"
            },
            {
                "policyType": "TERMS_AND_CONDITIONS",
                "policyVersionId": "2.1.1",
                "policyAccepted": true,
                "policyConfirmationDate": "2025-05-02 22:24:30.0",
                "policyVersionType": "MINOR"
            }
        ],
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWNjZXNzIjp0cnVlLCJpZCI6ImdnMHE3aTNpbDc0NGFqN2E2ajExazZlMGgyYm9vNm9sIiwic2Vzc2lvbkxpbWl0IjowLCJlY3JDYXRlZ29yeSI6InJlYWxfdXNlciIsImxhbmd1YWdlIjoicHRfQlIiLCJydnBTZXNzaW9uSWQiOiJkMGM2MWVkNi1lNDQyLTQzODQtYTFkNi1iNGQ3NGQ5OGFmNDlfU0VTU0lPTktFWSIsInJpdmVycGxheVVybCI6IndzczovL3B1c2guZXN0cmVsYWJldC5jb20iLCJwcmFnbWF0aWNTZXNzaW9uSWQiOiJkMGM2MWVkNi1lNDQyLTQzODQtYTFkNi1iNGQ3NGQ5OGFmNDlfU0VTU0lPTktFWSIsInByYWdtYXRpY1VybCI6IndzczovL3B1c2guZXN0cmVsYWJldC5jb20iLCJtb2JpbGVWZXJpZmljYXRpb25TdGF0dXMiOiJTVUNDRVNTIiwiZW1haWxWZXJpZmljYXRpb25TdGF0dXMiOiJTVUNDRVNTIiwidHdvRmFjdG9yQXV0aEVuYWJsZWQiOmZhbHNlLCJ1c2VyIjp7ImlkIjoiRVNUMjAyMjA5OTk2MDEzNiIsInJ2cFNlc3Npb25JZCI6ImQwYzYxZWQ2LWU0NDItNDM4NC1hMWQ2LWI0ZDc0ZDk4YWY0OV9TRVNTSU9OS0VZIiwicml2ZXJwbGF5VXJsIjoid3NzOi8vcHVzaC5lc3RyZWxhYmV0LmNvbSIsInByYWdtYXRpY1Nlc3Npb25JZCI6ImQwYzYxZWQ2LWU0NDItNDM4NC1hMWQ2LWI0ZDc0ZDk4YWY0OV9TRVNTSU9OS0VZIiwicHJhZ21hdGljVXJsIjoid3NzOi8vcHVzaC5lc3RyZWxhYmV0LmNvbSIsInBhcnRuZXJJZCI6ImVzdHJlbGFiZXQifSwibGFzdExvZ2luVGltZSI6IjE3NjEwOTg1OTYiLCJ1c2VySnVyaXNkaWN0aW9uIjoiYnJhemlsIiwianVyaXNkaWN0aW9uUmVzcG9uc2UiOiIiLCJwb3N0QXV0aFBvcFVwRGV0YWlscyI6W10sInBvbGljaWVzIjpbeyJwb2xpY3lUeXBlIjoiQk9OVVNfUlVMRVMiLCJwb2xpY3lWZXJzaW9uSWQiOiIyLjAiLCJwb2xpY3lBY2NlcHRlZCI6dHJ1ZSwicG9saWN5Q29uZmlybWF0aW9uRGF0ZSI6IjIwMjMtMTAtMDEgMTQ6NDM6NTUuMCIsInBvbGljeVZlcnNpb25UeXBlIjoiTUFURVJJQUwifSx7InBvbGljeVR5cGUiOiJQUklWQUNZX1BPTElDWSIsInBvbGljeVZlcnNpb25JZCI6IjIuMCIsInBvbGljeUFjY2VwdGVkIjp0cnVlLCJwb2xpY3lDb25maXJtYXRpb25EYXRlIjoiMjAyMy0xMC0wMSAxNDo0Mzo1NS4wIiwicG9saWN5VmVyc2lvblR5cGUiOiJNQVRFUklBTCJ9LHsicG9saWN5VHlwZSI6IlNQT1JUU19CRVRUSU5HX1JVTEVTIiwicG9saWN5VmVyc2lvbklkIjoiMi4wIiwicG9saWN5QWNjZXB0ZWQiOnRydWUsInBvbGljeUNvbmZpcm1hdGlvbkRhdGUiOiIyMDIzLTEwLTAxIDE0OjQzOjU1LjAiLCJwb2xpY3lWZXJzaW9uVHlwZSI6Ik1BVEVSSUFMIn0seyJwb2xpY3lUeXBlIjoiVEVSTVNfQU5EX0NPTkRJVElPTlMiLCJwb2xpY3lWZXJzaW9uSWQiOiIyLjEuMSIsInBvbGljeUFjY2VwdGVkIjp0cnVlLCJwb2xpY3lDb25maXJtYXRpb25EYXRlIjoiMjAyNS0wNS0wMiAyMjoyNDozMC4wIiwicG9saWN5VmVyc2lvblR5cGUiOiJNSU5PUiJ9XSwiaWF0IjoxNzYxMDk4NjI4LCJleHAiOjE3NjExMDIyMjh9._QyJ261A1qmmCoSApPafjnkKox0StiL2PrH7weggFcc",
        "cookieHeader": "_shown_chat_message=%7B%22sent_message%22%3A0%2C%22sent_to_agent%22%3Afalse%7D; Max-Age=43200; Domain=estrelabet.bet.br; HttpOnly; Secure; SameSite=Lax, ci_session=gg0q7i3il744aj7a6j11k6e0h2boo6ol; Max-Age=43200; Domain=estrelabet.bet.br; HttpOnly; Secure; SameSite=Lax, vst-no=2; Max-Age=43200; Domain=estrelabet.bet.br; HttpOnly; Secure; SameSite=Lax, __cf_bm=yKkAS.lBRWdUftjNC1cKKzvd0clnpOV_yhGpqCWDUeE-1761098628-1.0.1.1-SecsHN2651Jgsq78cI7Af9Q1CiKhJFRR5D3lGm14_mzOfFczM8yiAuW5q6beOKFCWRIY7YV1TzLbPuY.ohRKTgfuo_Aonkt6jA5lioZfiH8; path=/; expires=Wed, 22-Oct-25 02:33:48 GMT; domain=.estrelabet.bet.br; HttpOnly; Secure; SameSite=None"
    },
    "error": null
}*/