const axios = require('axios');

let config = {
  method: 'get',
  maxBodyLength: Infinity,
  url: 'https://bff-estrelabet.estrelabet.bet.br/profile/getProfileBalanceCurrency',
  headers: { 
    'sessionid': '2u4l2ncb10m9jptslrh5u3l566t8kgqj', 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', 
    'Cookie': '__cf_bm=lPRj31GhQeE1J8PZg1aGen_hd2OC2IIcE3Tp2PCIP2w-1761098093-1.0.1.1-eJpVnL7rARu0619VVMj6Do4aubnhQpCV1vwuGPmN7qQQasBxtIPSoxz_7VpVBSlSQMfJ4hfizNdyzKlylmutki9RMrYzw5p7f.2x15KKxHk; _cfuvid=rVBfDchO10ZpxAkZ.2jP0pdUB2PDrI6S_ZLvxupdKnM-1761098093459-0.0.1.1-604800000'
  }
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

//respota 
/*


*/