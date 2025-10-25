import { request } from 'axios';
let data = JSON.stringify([
  {
    "selectionId": "0ML766507218492485632D",
    "viewKey": 1,
    "isCrossBet": false,
    "isAddedToBetslip": false,
    "isDynamicMarket": false,
    "isBetBuilderBet": false
  }
]);

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://prod20350-kbet-152319626.fssb.io/api/betslip/betslip',
  headers: { 
    'Cookie': 'authorization=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYW5ndWFnZUNvZGUiOiJici1wdCIsImJldHRpbmdWaWV3IjoiRXVyb3BlYW4gVmlldyIsInNvcnRpbmdUeXBlSWQiOjAsImJldHRpbmdMYXlvdXQiOjEsImN1c3RvbWVyVHlwZSI6InJlYWwiLCJkaXNwbGF5VHlwZUlkIjoxLCJ0aW1lem9uZUlkIjoxMCwib2Rkc1N0eWxlSWQiOiIiLCJhbGxvd0NoYW5nZU9kZCI6MCwiaW50VGFiRXhwYW5kZWQiOjEsImF1dG9UaW1lWm9uZSI6MSwibGFzdElucHV0U3Rha2UiOiIwLjY1IiwiYmFsYW5jZVByaW9yaXR5IjoxLCJjb3VudHJ5Q29kZSI6IkJSIiwiY3VycmVuY3lSYXRlIjowLjEzOTQwMzA5MzQ3NDQ4MSwiY3VycmVuY3lSYXRlZXVyIjowLjE1OTU3NjM2MjA4OTMwOSwiY3VzdG9tZXJJZCI6MTYyMjI0OTg3LCJldU9kZHNJZCI6IjEiLCJrb3JlYW5PZGRzSWQiOiIxIiwiYXNpYW5PZGRzSWQiOiIxIiwib3BlcmF0b3JUb2tlbiI6ImE3a2JldGJyLTViMjRhOTA5Y2VjMzQ1MjI5MmY2ZmQyYzVhZmJkZmEzYjEwMjlhMWM2ZmJlYzAwMzM0Njg0MWIwMjI2OGE5OGMiLCJiYWxhbmNlIjo0LjQ4LCJ0ZXN0Q3VzdG9tZXIiOjAsImN1c3RvbWVyTG9naW4iOiJhN2tiZXRicl8yOTIyNzM0OSIsImN1cnJlbmN5Q29kZSI6IkJSTCIsInN0YXRlQ29kZSI6IiIsImN1c3RvbWVyTGV2ZWwiOjAsImFnZW50SUQiOjE1MjMxOTYyNiwiZG9tYWluSUQiOjM1OTAsInNpdGVJZCI6MjAzNTAsImV4dEN1c3RvbWVySWQiOiJhN2tiZXRicl8yOTIyNzM0OSIsImV4dFNlc3Npb25JZCI6ImE3a2JldGJyLTViMjRhOTA5Y2VjMzQ1MjI5MmY2ZmQyYzVhZmJkZmEzYjEwMjlhMWM2ZmJlYzAwMzM0Njg0MWIwMjI2OGE5OGMiLCJsZXZlbCI6MSwiRVBPRW5hYmxlZCI6dHJ1ZSwiaWF0IjoxNzYxMjMyMjM3LCJib251c0JhbGFuY2UiOjAsInNlbGVjdGVkT3B0aW9uSWQiOjB9._qPd994YyxhJzTXz-Bcy2jTYL8jhLEEv2DDq1m52Zf4; SameSite=None; Secure; Path=/; Max-Age=157680000; Expires=Thu, 24 Oct 2030 03:29:28 GMT; session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcklkIjoxNjIyMjQ5ODcsImV4cGlyZWREYXRlIjoxNzYxNDQ5MzY3OTM2LCJjdXN0b21lcklwIjoiMTc5LjEyNS4yMTEuMTM5IiwiaWF0IjoxNzYxMzYyOTY3fQ.zJQ23SC9RkqYNzx2GxQJ7Ve8UlzJGEyZll3GvxyH5KQ; SameSite=None; Secure; Path=/; Max-Age=157680000; Expires=Thu, 24 Oct 2030 03:29:28 GMT; events_updates=313632323234393837; SameSite=None; Secure; Path=/; Max-Age=157680000; Expires=Thu, 24 Oct 2030 03:29:28 GMT; session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21lcklkIjoxNjIyMjQ5ODcsImV4cGlyZWREYXRlIjoxNzYxNDUzNTE1MzIzLCJjdXN0b21lcklwIjoiMTc5LjEyNS4yMTEuMTM5IiwiaWF0IjoxNzYxMzYyOTY3fQ.DSGH4XBmgUMi1nKjRRfuEk8smqDWo1jMG1MKXYyK2v8', 
    'Content-Type': 'application/json'
  },
  data : data
};

request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});


//respota pode ser [] vazio ou
/*
[
    {
        "market": {
            "Operation": "U",
            "TimeStamp": "638969294842938854",
            "Changeset": {
                "_id": "0ML766507218492485632",
                "ComboBonuses": [
                    "672124631586717696"
                ],
                "EventId": "766507216215056384",
                "IsClientSide": true,
                "IsLive": false,
                "IsRemoved": false,
                "IsSuspended": false,
                "LastUpdateDateTime": "2025-10-24T19:04:34.193Z",
                "LeagueId": "677879777860075520",
                "MarketType": {
                    "LineTypeName": "1X2",
                    "_id": "ML0",
                    "Tier": 1,
                    "Name": "Resultado Final 1x2"
                },
                "ParticipantMapping": "",
                "SplitTypeId": 3,
                "SportId": "1",
                "StartDate": "2025-10-26T19:00:00.000Z",
                "TotalSelectionsCount": 3,
                "TemplateGroupSettings": [],
                "UPDATE_TIMESTAMP": "638969294842938854",
                "BetslipLine": "Resultado Final 1x2",
                "Name": "Resultado Final 1x2",
                "Selections": [],
                "Selection": {
                    "_id": "0ML766507218492485632D",
                    "MarketId": "0ML766507218492485632",
                    "EventId": "766507216215056384",
                    "SportId": "1",
                    "MarketType": {
                        "IsCastMarket": false,
                        "LineTypeId": 1,
                        "LineTypeName": "1X2",
                        "Name": {
                            "AR": "النتيجة الكلية - فوز/تعادل/خسارة",
                            "BR-PT": "Resultado Final 1x2",
                            "DE": "FT 1X2",
                            "EN": "FT 1X2",
                            "ES": "TC 1X2",
                            "ES-MX": "FT 1X2",
                            "FR": "T.a.b. 1N2",
                            "HI": "एफटी 1X2",
                            "IT": "Scommesse Tempo Regolamentare 1X2",
                            "KO": "승무패"
                        },
                        "ShortName": "Full",
                        "Tier": 1,
                        "_id": "ML0"
                    },
                    "Side": 2,
                    "Type": 1,
                    "TypeName": "1X2",
                    "BetslipLine": "Empate",
                    "IsDisabled": false,
                    "Name": "Empate",
                    "IsOption": false,
                    "IsClientSide": true,
                    "ParticipantMapping": "",
                    "DisplayOdds": {
                        "Decimal": "3.49",
                        "Malay": "-0.402",
                        "HK": "2.49",
                        "Indo": "2.49",
                        "American": "249",
                        "Fractional": "25/10"
                    },
                    "TrueOdds": 3.49,
                    "OutcomeType": "Empate",
                    "Tags": [],
                    "TemplateOddsSettingsIndex": 0,
                    "TemplateGroupSettingsIndex": 0,
                    "TemplateCashoutSettingsIndex": 0,
                    "QAParam1": 0,
                    "QAParam2": 0,
                    "IsRemoved": false,
                    "Settings": {
                        "MinBet": 0.09,
                        "MaxWin": 5625,
                        "ComboMinBet": 0.09,
                        "ComboMaxBet": 1350,
                        "SystemMaxBet": 1350,
                        "ComboMaxWin": 0,
                        "SystemMaxWin": 0,
                        "EnableCombos": true,
                        "EnableSingles": true,
                        "EnableSystems": true,
                        "EnableTeasers": false
                    }
                }
            }
        },
        "event": {
            "Operation": "U",
            "TimeStamp": "638969289677137639",
            "Changeset": {
                "_id": "766507216215056384",
                "IsGoingLive": false,
                "IsLive": false,
                "IsRemoved": false,
                "IsSuspended": false,
                "IsTopLeague": true,
                "LeagueGroupId": "738736444901982208",
                "MarketLinesCount": 1800,
                "MasterLeagueId": "530",
                "Score": {
                    "AwayScore": "",
                    "HomeScore": "",
                    "CombinedSecondTierScores": [],
                    "AdditionalScores": {}
                },
                "Settings": {
                    "IsExposureEnabled": false,
                    "IsVIPExcludeEnabled": false,
                    "IsWBComboEnabled": false,
                    "IsWBSingleEnabled": false,
                    "EarlyPayout": 2
                },
                "SportId": "1",
                "StartEventDate": "2025-10-26T19:00:00.000Z",
                "Type": "Fixture",
                "UPDATE_TIMESTAMP": "638969289677137639",
                "EventName": "Botafogo RJ vs Santos",
                "LeagueName": "Brasileirão Série A",
                "SportName": "Futebol",
                "UrlEventName": "Botafogo-RJ-vs-Santos",
                "UrlLeagueName": "Brasileirão-Série-A",
                "UrlRegionName": "Brasil",
                "UrlSportName": "Futebol",
                "Participants": [
                    {
                        "Name": "Botafogo RJ",
                        "VenueRole": "Home",
                        "_id": "122061"
                    },
                    {
                        "Name": "Santos",
                        "VenueRole": "Away",
                        "_id": "1898"
                    }
                ]
            }
        },
        "selectionId": "0ML766507218492485632D",
        "viewKey": 1,
        "timestamp": "31373631353832393231333731!t20l683736337434336e6a34ca9aef95282a46026dc3d1ba7e560197",
        "intervalTiming": "31373631353832393231333731!e20l626d33756577717071666de8df4a63ce357eac2b6d983adeac5e"
    }
]
*/

/*
        //Esess são os retornos mais importantes mas os outros são imporante tambem para fazer a bets (vou passar o endpoint no arquivo betsPOST)
        "timestamp": "31373631353832393231333731!t20l683736337434336e6a34ca9aef95282a46026dc3d1ba7e560197",
        "intervalTiming": "31373631353832393231333731!e20l626d33756577717071666de8df4a63ce357eac2b6d983adeac5e"
*/