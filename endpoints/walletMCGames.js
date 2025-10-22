const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://mcgames.bet.br/api/users/wallet?withCurrentUser=true',
  headers: { 
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS1tY2dhbWVzLWJldGJyLmJzMmJldC5jb20vdjIvYXV0aC9sb2dpbiIsImlhdCI6MTc2MTA5NzA1OSwiZXhwIjoxNzYxNzAxODU5LCJuYmYiOjE3NjEwOTcwNTksImp0aSI6InhjUHExamJEZEZwYnZ1ZlEiLCJzdWIiOiIyOTk4MTAxNCIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjciLCJoYSI6IjUiLCJoYiI6Ijg3YTg3NmNkZDE1Y2M5ZTcxNDQ2MjQ1YmZlNTU0ZWMzIiwiaGMiOiI3MDA2YTExYzY2NzViODcwMTAwNDRjMGQ3YmIxMjY4OSIsImhpIjoiYWIyY2M3Y2Q5NzY5YmZkNzBjN2Y2ZGY2NzdhZjMzNGMiLCJoZCI6IjYyMGNlYzI1MzRkY2VkYzFjZGFkNjE4ZWViNjE5Y2VlIiwiaGwiOiI4N2YzMWUzNjVlNWNkMDcyYjA1MTE1ZDRkMWJkZTc0YSIsImhmIjoiMV9hMjQ5MDhjMDk3MjlmODA5OTI1YmFkMzNhYTg5MDAyZF8xNzYxMDk3MDU3In0.16dKWEGwfPwYuajQiEgTYBDQDBb2wCaUYoIHUMGB87o', 
    'Cookie': '__Host-jwt_token_lax=eyJpdiI6IkdiWTZqOTdpbmNtbXlLUVRBelcvd2c9PSIsInZhbHVlIjoiSVFKZlE1VExNcXZtMWZLSFJPTExRSUZrWWtUcTA0aDZ3UXRlQ1FESDdkNTFXMGpGUFVjWUlWeS9WNUExOVErd1FZNENiOEQ2Ymx0ZVJjdEFlaGg4cER1WTVWNDlZZFEvRTNnWUg1aHNaVFU9IiwibWFjIjoiMjViOWE3ZGU1ZDY5MzljMmY3MDk4ZTA3MDMyN2Y2ZTNlY2YxODg4OTI2OTQ5YmNkOGRlNWE4MTlkMGVjZTVhYSIsInRhZyI6IiJ9; __Host-jwt_token_none=eyJpdiI6IjJsRVY3V2JXOTNLdGVqSXdRVXFIaHc9PSIsInZhbHVlIjoiVzV2Y2hnSzZDNEhYVEt4aEx5eWd1ZWYvRDVnSHVaN0xuODh0OEhBTjFBVnVzKzgvalM2SFRPVS9veVpMOGJWMHREK3UrMDNQU2FJbFJabHpGcTNpL1FROTlya0h4TTFPRnduYUJFbjZPT3c9IiwibWFjIjoiMTk4NWYyNmI1NTBhMjNiZWExNDEwYzVkOWVkNjZhZDdkMjA1YzI0Yjk3OTM2NDYyN2Y3ZDY0N2MwZmFhMmY0NSIsInRhZyI6IiJ9; __Host-jwt_token_strict=eyJpdiI6IjVYYXo1WHJ1QkxsTnBWczBlRGFyWEE9PSIsInZhbHVlIjoiYUorZXcrcjg1Y0JUQjBhQXYyandGdDB2WTJuQ09scjFDZ2xXeWdSZU1Na3hUWWpGZlIvL3M1aitYYTRTR1gxdFZYTjhWcHpwQ0podnlGQTFjWDZENjVlWk15MGVheUZONTMrWTNWYnZKdDQ9IiwibWFjIjoiNzk1ZGFhODMzZTFiN2Q2NzllNDI5ZmMxNzk3NWQ3YmNhNWZiNWM4Y2VlNjM5MjhhZDUwM2YzYjBmYmViYjY3MCIsInRhZyI6IiJ9; __cf_bm=.FOiHvf98zdVS3rvuI.l3dkMptWXB55d4XyE6ecucxs-1761097059-1.0.1.1-ZYuoUeE9tt7kZXcfD42IzJZX24rux9Koe1ERrtQdTGJalf748reBMjjdmzSFFmrlhmOnCD_Mpfqh9VR1tF0EQwLEaFaO5f5jtqPpKtRCBao; _cfuvid=pzD0AAEultagytK6mplDCuY5mYZneTEP3.zyh7BfOQI-1761095986437-0.0.1.1-604800000; bet7k_session=eyJpdiI6Ilo1cCtJSUt4eGRhL0NjcnNGUjJIRFE9PSIsInZhbHVlIjoicUZBUlhlaThReXZ1Vkl0ZDlYb0s4MUUwUlRRN0ZOQjBwWVBCQndJemxSTHNLbXJSYjd4YlgxMHdkVWdWSGRrRFNYQWFac2hBM05OeWxHa1JNcGRVZVNXdURTeXA5NjFMTytaT0ludnhBd3Y2WGZrNjgrZWEvclZadTlmYkNaTTMiLCJtYWMiOiIwNWQ0MWMyZGFlOWE5OTQ0NzhiOGFjMGMyMDMxYWM4YzJmZWVlZTU0MzQ2NWI5NWI4Yjc1Mjc4ODQ4MjQ2MmRiIiwidGFnIjoiIn0%3D'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

//retorno
/*
{
    "id": 30347603,
    "balance": 0,
    "credit": 193645,
    "available_value": 0,
    "user_id": 30347683,
    "created_at": "2025-09-27T16:33:33.000000Z",
    "updated_at": "2025-10-19T20:11:23.000000Z",
    "bonus": 0,
    "max_withdraw_amount": null,
    "withdraw_enabled": 1,
    "rollover_is_active": 0,
    "rollover_amount": 0,
    "withdraw_enable_now": true,
    "withdraw_next_date": null,
    "bonus_wallet_result": {
        "id": 24646395,
        "credit": 0,
        "credit_hold": 0,
        "sports_amount_hold": 0,
        "sports_rollover_count": 0,
        "casino_amount_hold": 0,
        "casino_rollover_count": 0,
        "user_id": 30347683,
        "rollover_type": null,
        "expiry_datetime": null,
        "created_at": "2025-09-27T16:33:33.000000Z",
        "updated_at": "2025-09-27T16:33:33.000000Z"
    },
    "cashback_wallet_result": null,
    "has_transactions": "2025-09-27 16:05:39",
    "min_withdraw_amount": null,
    "user_profile": {
        "id": 30347683,
        "name": "Andressa Nery De Santana",
        "email": "dessahedu@gmail.com",
        "username": "bf4ce507667cdaf272cb616df5a402c7",
        "email_verified_at": null,
        "token": "mcgamesbetbr_-cdCPV9ffnMNS2oB97ZhbQBWWSIzPZEfQu25IjlH2Z8biwvmcCKgATKiz",
        "ftd_value": 4000,
        "ftd_date": "2025-09-27 16:05:39",
        "created_at": "2025-09-27T16:33:33.000000Z",
        "updated_at": "2025-10-22T01:36:29.000000Z",
        "is_active": 1,
        "phone": "13996553438",
        "commission": null,
        "manager_id": null,
        "admin_id": null,
        "commission_grid_id": null,
        "affiliation_code": "ef70b460bb6b",
        "recommended_by": null,
        "menu_list": null,
        "bonus_enabled": 0,
        "first_name": "Andressa",
        "last_name": "Santana",
        "mother_name": "Eliane Gaudencio Nery",
        "gender": 0,
        "birth_date": "1991-12-30",
        "cancelled_account": 0,
        "is_test": 0,
        "ddi": "+55",
        "country": "BRA",
        "currency": "BRL",
        "language": "pt-br",
        "timezone": "America/Sao_Paulo",
        "address": "Ana De Carvalho Cruz Mourao, S/n - Anhanguera",
        "city": "Praia Grande",
        "state": "SP",
        "zipcode": "11718035",
        "is_internal": 0,
        "app_source": null,
        "country_data": {
            "id": 254,
            "name": "Brasil",
            "code": "BRA",
            "flag_image_src": "",
            "auto_update": 1,
            "created_at": null,
            "updated_at": "2024-02-15T00:45:02.000000Z",
            "ddi": "+55",
            "currency": "BRL",
            "alpha2": "BR"
        },
        "_cached": {
            "get-credits": {
                "credit": 1936.45,
                "bonus": 0
            },
            "get-first-deposit": {
                "success": true,
                "data": {
                    "id": 51846331863,
                    "type": "credit",
                    "type_id": null,
                    "amount": 400000,
                    "status": "approved",
                    "user_id": null,
                    "wallet_id": 30347603,
                    "src": "deposit_charge",
                    "src_id": 12013761,
                    "created_at": "2025-09-27T19:05:40.000000Z",
                    "updated_at": "2025-09-27T19:14:38.000000Z",
                    "bonus_wallet_id": null,
                    "credit_percent": 0,
                    "bonus_percent": 0,
                    "cashed_out_amount": 0,
                    "old_balance": 0,
                    "old_bonus_balance": 0
                }
            },
            "user-first-bet": {
                "message": "Orderbet",
                "orderBet": null,
                "success": true
            }
        },
        "user_info": {
            "user_id": 30347683,
            "tc_accepted_at": "2025-09-27 13:33:34",
            "mkt_accepted_at": "2025-09-27 13:33:34",
            "lgpd_accepted_at": "2025-09-27 13:33:34",
            "law_accepted_at": "2025-09-27 13:33:34",
            "migrate_accepted_at": "2025-09-27 13:33:34",
            "privacy_accepted_at": "2025-09-27 13:33:34",
            "status": 1,
            "status_updated_at": "2025-09-27 13:33:33",
            "status_note": null,
            "user_pause": 0,
            "user_pause_at": null,
            "user_exclusion": 0,
            "user_exclusion_at": null,
            "spa_exclusion": 0,
            "spa_exclusion_at": null,
            "spa_exclusion_note": null,
            "operator_exclusion": 0,
            "operator_exclusion_at": null,
            "operator_exclusion_note": null,
            "operator_exclusion_by": null,
            "user_limit_period": null,
            "user_limit_time": null,
            "user_limit_time_active": 0,
            "user_limit_time_period": null,
            "user_limit_time_change": null,
            "user_limit_bet": null,
            "user_limit_bet_active": 0,
            "user_limit_bet_period": null,
            "user_limit_bet_change": null,
            "user_limit_loss": null,
            "user_limit_loss_active": 0,
            "user_limit_loss_period": null,
            "user_limit_loss_change": null,
            "user_limit_deposit": null,
            "user_limit_deposit_active": 0,
            "user_limit_deposit_period": null,
            "user_limit_deposit_change": null,
            "user_limit_withdrawal": null,
            "user_limit_last_change": null,
            "last_verification_at": null,
            "login_at": "2025-10-21 22:36:29",
            "login_attempt_qty": 0,
            "login_city": "Campinas",
            "login_state": "SP",
            "login_ip": "179.125.211.139",
            "validate_email_at": null,
            "validate_sms_at": null,
            "kyc_validated_at": "2025-09-27 15:20:22",
            "latitude": "-22.90556",
            "longitude": "-47.06083",
            "strong_password": 1,
            "location_at": null,
            "nationalities": "[{\"id\": 1, \"value\": \"Brasileiro (a)\"}]",
            "created_at": "2025-09-27T16:33:33.000000Z",
            "updated_at": "2025-10-22T01:36:29.000000Z",
            "id": 2346312,
            "two_factor_enabled": 0,
            "two_factor_type": null,
            "two_factor_at": null,
            "login_device": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
            "force_request_kyc": false,
            "force_request_kyc_reasons": []
        },
        "roles": [
            {
                "id": 5,
                "name": "player",
                "guard_name": "api",
                "created_at": "2024-12-22T11:15:56.000000Z",
                "updated_at": "2025-02-04T13:49:25.000000Z",
                "pivot": {
                    "model_id": 30347683,
                    "role_id": 5,
                    "model_type": "App\\Models\\User"
                }
            }
        ],
        "wallet": {
            "id": 30347603,
            "balance": 0,
            "credit": 193645,
            "available_value": 0,
            "user_id": 30347683,
            "created_at": "2025-09-27T16:33:33.000000Z",
            "updated_at": "2025-10-19T20:11:23.000000Z",
            "bonus": 0,
            "max_withdraw_amount": null,
            "withdraw_enabled": 1,
            "rollover_is_active": 0,
            "rollover_amount": 0
        },
        "bonus_wallet": {
            "id": 24646395,
            "credit": 0,
            "credit_hold": 0,
            "sports_amount_hold": 0,
            "sports_rollover_count": 0,
            "casino_amount_hold": 0,
            "casino_rollover_count": 0,
            "user_id": 30347683,
            "rollover_type": null,
            "expiry_datetime": null,
            "created_at": "2025-09-27T16:33:33.000000Z",
            "updated_at": "2025-09-27T16:33:33.000000Z"
        },
        "document": {
            "id": 2381091,
            "type": "cpf",
            "number": "41906938806",
            "user_id": 30347683,
            "created_at": "2025-09-27T16:33:33.000000Z",
            "updated_at": "2025-09-27T16:33:33.000000Z"
        }
    }
}
*/