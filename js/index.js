(function(){
  var app = new Vue({
    el: '#app',
    data: {
      coinData: [],
      coinDataLimit: 1,
      refreshSeconds: 20,
      coinsToTrack: [],
      cachedCoins: [],
      convert: 'BTC',
      convertTooltipHide: false,
      convertForm: false,
      portfolio: false,
      setup: false,
      loaded: false
    },
    methods: {
      getCoinInfo: function() {
        this.loadingCoinData = true;
        this.$http.get('https://api.coinmarketcap.com/v1/ticker/?convert=' + this.convert + '&limit=' + this.coinDataLimit * 100).then(response => {
          this.coinData = response.body;
          setTimeout(() => {
            this.getCoinInfo();
          },this.refreshSeconds * 1000);
          setTimeout(() => {
            this.loaded = true;
          }, 1000);
        }, response => {
          console.log('Error');
        });
      },
      selectCoin: function(coin) {
        if(this.isCoinSelected(coin)){
           this.coinsToTrack =  this.coinsToTrack.filter(c => c.id !== coin.id);
        }else{
          this.coinsToTrack.push({ name: coin.name, id: coin.id });
        }
      },
      isCoinSelected: function(coin) {
        return this.coinsToTrack.some(c => c.id === coin.id);
      },
      loadMore: function() {
        this.coinDataLimit++;
        this.getCoinInfo();
      },
      track: function() {
        if(this.coinsToTrack.length) {
          this.loaded = false;
          setTimeout(() => {
            this.setup = true;
            this.loaded = true;
            this.saveCoins();
          }, 500)
        }
      },
      updatedTrackedCoins: function() {
        if(this.coinsToTrack.length && this.coinData.length) {
          let coins = this.coinData.filter(c => this.coinsToTrack.some(ct => ct.id === c.id));
          return coins;
        }
      },
      saveCoins: function() {
        store('trackedCoins', this.coinsToTrack);
        setTimeout(() => {
          this.saveCoins();
        }, this.refreshSeconds * 1000);
      },
      getSavedCoins: function() {
        this.cachedCoins = store.get('trackedCoins') || [];
        if(!this.coinsToTrack.length && this.cachedCoins.length) {
          this.coinsToTrack = this.cachedCoins;
        }
        this.track();
      },
      getCoinQuantity:function(coin) {
        let userCoin =  this.coinsToTrack.find(c => c.id === coin.id);
        if(userCoin && userCoin.quantity) {
          return parseFloat(userCoin.quantity);
        }
      },
      getCoinCost:function(coin) {
        let userCoin =  this.coinsToTrack.find(c => c.id === coin.id);
        if(userCoin && userCoin.cost) {
          return parseFloat(userCoin.cost);
        }
      },
      marketValue: function(coin) {
        if(coin){
          let val = (this.getCoinQuantity(coin) * this.parseMoney(coin.price_usd)).toFixed(2);
          return val;
        }
      },
      valueGain:function(coin) {
        let cost = this.getCoinCost(coin);
        return (((this.marketValue(coin) - cost) / cost) * 100 ).toFixed(2);
      },
      parseMoney: function(money) {
        if(money){
          return Number(money.replace(/[^0-9\.]+/g,""));
        }
      },
      closePortfolio: async function() {
        await this.saveCoins();
        this.portfolio = false;
      },
      viewConvert: function() {
        this.convertTooltipHide = true;
        this.convertForm = !this.convertForm;
      },
      changeConvert: function(symbol) {
        this.convert = symbol;
        store('convertCoin', symbol);
        this.getCoinInfo();
      },
      setupConvert: function(){
        let symbol = store.get('convertCoin');
        if(symbol) {
          this.convert = symbol;
          this.convertTooltipHide = true;
        }
      },
      convertPrice: function(coin){
        return coin['price_' + this.convert.toLowerCase()]
      }
    },
    mounted() {
      this.setupConvert();
      this.getSavedCoins();
      this.getCoinInfo();
    }
  });

})();
