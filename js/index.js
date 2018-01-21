(function(){
  var app = new Vue({
    el: '#app',
    data: {
      coinData: [],
      coinDataLimit: 1,
      refreshSeconds: 20,
      coinsToTrack: [],
      cachedCoins: [],
      setup: false,
      loaded: false
    },
    methods: {
      getCoinInfo: function() {
        this.loadingCoinData = true;
        this.$http.get('https://api.coinmarketcap.com/v1/ticker/?limit=' + this.coinDataLimit * 100).then(response => {
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
          this.coinsToTrack.push(coin);
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
      }
    },
    mounted() {
      this.getSavedCoins();
      this.getCoinInfo();
    }
  });

})();
