const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://prod20350-kbet-152319626.fssb.io/api/eventlist/eu/events/league-events?leagueId=735481265247240192',
  headers: { 
    'Cookie': 'authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYW5ndWFnZUNvZGUiOiJici1wdCIsImN1cnJlbmN5UmF0ZSI6MSwiY3VycmVuY3lSYXRlZXVyIjoxLCJjdXN0b21lckxpbWl0cyI6W10sImN1c3RvbWVyVHlwZSI6ImFub24iLCJjdXJyZW5jeUNvZGUiOiJCUkwiLCJjdXJyZW5jeUNvZGVBbm9uIjoiIiwiY3VzdG9tZXJJZCI6LTEsImJldHRpbmdWaWV3IjoiRXVyb3BlYW4gVmlldyIsInNvcnRpbmdUeXBlSWQiOjAsImJldHRpbmdMYXlvdXQiOjEsImRpc3BsYXlUeXBlSWQiOjEsInRpbWV6b25lSWQiOjE1LCJhdXRvVGltZVpvbmUiOjEsImxhc3RJbnB1dFN0YWtlIjowLCJldU9kZHNJZCI6IjEiLCJhc2lhbk9kZHNJZCI6IjEiLCJrb3JlYW5PZGRzSWQiOiIxIiwiaW50VGFiRXhwYW5kZWQiOjEsImRvbWFpbklEIjozNTkwLCJhZ2VudElEIjoxNTIzMTk2MjYsInNpdGVJZCI6MjAzNTAsInNlbGVjdGVkT3B0aW9uSWQiOjAsImN1c3RvbWVyTGV2ZWwiOjAsImJhbGFuY2VQcmlvcml0eSI6MSwiRVBPRW5hYmxlZCI6dHJ1ZSwiaWF0IjoxNzYxMTU1MDE2fQ.FN0nZxOc0LgTeTDOIgkdQFbECiIbP92RyfSBkj_H5HM; session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcklkIjotMSwiZXhwaXJlZERhdGUiOjE3NjEyNDI4NTc4MzAsImlhdCI6MTc2MTE1NTAxNn0.WpkawRCTe0BNlywaVsX4Zj3ewZ_VQf48xSpx96RixXM'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

//resposta
{
    "data": [
        [
            "767092289674997760",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "4892",
                    {
                        "BR-PT": "Zaglebie Sosnowiec"
                    },
                    "Home"
                ],
                [
                    "3498",
                    {
                        "BR-PT": "Podbeskidzie"
                    },
                    "Away"
                ]
            ],
            98,
            "Zaglebie Sosnowiec vs Podbeskidzie",
            "2025-10-22T18:00:00.000Z",
            [
                "0",
                "0",
                null,
                {
                    "firstHalfScore1": "0",
                    "firstHalfScore2": "0",
                    "secondHalfScore1": "0",
                    "secondHalfScore2": "0",
                    "cornersTeam1": "1",
                    "cornersTeam2": "0",
                    "penaltiesTeam1": "0",
                    "penaltiesTeam2": "0",
                    "redCardsTeam1": "0",
                    "redCardsTeam2": "0",
                    "yellowCardsTeam1": "0",
                    "yellowCardsTeam2": "0",
                    "firstExtraTimeScore1": "0",
                    "firstExtraTimeScore2": "0",
                    "secondExtraTimeScore1": "0",
                    "secondExtraTimeScore2": "0",
                    "shootoutPenaltiesTeam1": "0",
                    "shootoutPenaltiesTeam2": "0",
                    "firstExtraTimeCornersScore1": "0",
                    "firstExtraTimeCornersScore2": "0",
                    "secondExtraTimeCornersScore1": "0",
                    "secondExtraTimeCornersScore2": "0"
                }
            ],
            true,
            false,
            {
                "ClockRunning": true,
                "ClockDirection": 0,
                "GameTime": 274,
                "GamePart": 23,
                "UpdateDate": "2025-10-22T18:07:31.285Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967532515609501",
            null,
            "Zaglebie-Sosnowiec-vs-Podbeskidzie",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            30,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "HomeShirtColorPrimary": "#FF0000",
                "AwayShirtColorPrimary": "#0000FF",
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "767741018136440832",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "361262",
                    {
                        "BR-PT": "OKS Swit Skolwin"
                    },
                    "Home"
                ],
                [
                    "215336113920024576",
                    {
                        "BR-PT": "LKS Lodz II"
                    },
                    "Away"
                ]
            ],
            80,
            "OKS Swit Skolwin vs LKS Lodz II",
            "2025-10-24T13:00:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967528698495147",
            null,
            "OKS-Swit-Skolwin-vs-LKS-Lodz-II",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "767795194266710016",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "267905",
                    {
                        "BR-PT": "KKS 1925 Kalisz"
                    },
                    "Home"
                ],
                [
                    "346644",
                    {
                        "BR-PT": "Slask Wroclaw II"
                    },
                    "Away"
                ]
            ],
            81,
            "KKS 1925 Kalisz vs Slask Wroclaw II",
            "2025-10-24T16:00:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967515342726602",
            null,
            "KKS-1925-Kalisz-vs-Slask-Wroclaw-II",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "768071319207358464",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "34336",
                    {
                        "BR-PT": "Hutnik Krakow"
                    },
                    "Home"
                ],
                [
                    "4892",
                    {
                        "BR-PT": "Zaglebie Sosnowiec"
                    },
                    "Away"
                ]
            ],
            82,
            "Hutnik Krakow vs Zaglebie Sosnowiec",
            "2025-10-25T11:15:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967521793420521",
            null,
            "Hutnik-Krakow-vs-Zaglebie-Sosnowiec",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "AwayShirtColorPrimary": "#008040",
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "768101531496247296",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "36762",
                    {
                        "BR-PT": "GKS Jastrzebie"
                    },
                    "Home"
                ],
                [
                    "3498",
                    {
                        "BR-PT": "Podbeskidzie"
                    },
                    "Away"
                ]
            ],
            96,
            "GKS Jastrzebie vs Podbeskidzie",
            "2025-10-25T12:00:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967521823504693",
            null,
            "GKS-Jastrzebie-vs-Podbeskidzie",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "HomeShirtColorPrimary": "#000000",
                "AwayShirtColorPrimary": "#0000FF",
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "768101531966087168",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "222372",
                    {
                        "BR-PT": "Rekord Bielsko-Biala"
                    },
                    "Home"
                ],
                [
                    "66613",
                    {
                        "BR-PT": "Olimpia Grudziadz"
                    },
                    "Away"
                ]
            ],
            98,
            "Rekord Bielsko-Biala vs Olimpia Grudziadz",
            "2025-10-25T12:30:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967521823524797",
            null,
            "Rekord-Bielsko-Biala-vs-Olimpia-Grudziadz",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "768490267593732096",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "119965",
                    {
                        "BR-PT": "Chojniczanka Chojnice"
                    },
                    "Home"
                ],
                [
                    "348016",
                    {
                        "BR-PT": "Podhale Nowy Targ"
                    },
                    "Away"
                ]
            ],
            90,
            "Chojniczanka Chojnice vs Podhale Nowy Targ",
            "2025-10-25T15:00:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967525596114266",
            null,
            "Chojniczanka-Chojnice-vs-Podhale-Nowy-Targ",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            28,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "768490267237261312",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "94176",
                    {
                        "BR-PT": "Sokol Kleczew"
                    },
                    "Home"
                ],
                [
                    "15033",
                    {
                        "BR-PT": "Stal Stalowa Wola"
                    },
                    "Away"
                ]
            ],
            100,
            "Sokol Kleczew vs Stal Stalowa Wola",
            "2025-10-26T12:00:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967523566760584",
            null,
            "Sokol-Kleczew-vs-Stal-Stalowa-Wola",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "AwayShirtColorPrimary": "#000000",
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ],
        [
            "768490270714294272",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "34326",
                    {
                        "BR-PT": "Sandecja Nowy Sacz"
                    },
                    "Home"
                ],
                [
                    "27164",
                    {
                        "BR-PT": "Warta Poznan"
                    },
                    "Away"
                ]
            ],
            98,
            "Sandecja Nowy Sacz vs Warta Poznan",
            "2025-10-26T14:00:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967523576763053",
            null,
            "Sandecja-Nowy-Sacz-vs-Warta-Poznan",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {},
            null,
            null
        ],
        [
            "768508022464212992",
            "735481265247240192",
            "Polônia - 2 Liga",
            "1",
            "Futebol",
            "175",
            "PL",
            "Polônia",
            [
                [
                    "38647",
                    {
                        "BR-PT": "CWKS Resovia Rzeszow"
                    },
                    "Home"
                ],
                [
                    "433061",
                    {
                        "BR-PT": "Unia Skierniewice"
                    },
                    "Away"
                ]
            ],
            77,
            "CWKS Resovia Rzeszow vs Unia Skierniewice",
            "2025-10-26T18:30:00.000Z",
            [
                "",
                "",
                null,
                {}
            ],
            false,
            false,
            {
                "ClockRunning": false,
                "ClockDirection": 0,
                "UpdateDate": "0001-01-01T00:00:00.000Z",
                "GameTimeBFFGotAt": 1761156457845
            },
            false,
            [],
            "638967523848227798",
            null,
            "CWKS-Resovia-Rzeszow-vs-Unia-Skierniewice",
            "Polônia-2-Liga",
            "Polônia",
            "Futebol",
            1,
            90012000,
            "Fixture",
            29,
            false,
            null,
            {
                "IsBetBuilderEnabled": false,
                "IsExposureEnabled": false,
                "IsVIPExcludeEnabled": false,
                "IsWBComboEnabled": false,
                "IsWBSingleEnabled": false,
                "EarlyPayout": null
            },
            "2662",
            "613",
            {
                "HasVARCoverage": "false",
                "HasIncidentCoverage": "true"
            },
            null,
            null
        ]
    ]
}