const WebSocket = require('ws');
const constants = require('../config/constants');

class WebSocketManager {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.realtimeData = {};
        this.subscribedPairs = new Set();
        this.connect();
    }

    connect() {
        try {
            this.ws = new WebSocket('wss://www.lbkex.net/ws/V2/');
            this.ws.on('open', () => {
                console.log('✔ WebSocket connected to LBank');
                this.connected = true;
                this.subscribeToAllPairs();
            });

            this.ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.type === 'tick' && message.tick) {
                        const symbol = message.pair;
                        const tickData = message.tick;
                        const currentPrice = tickData.latest;

                        // اینجا gistManager.addPrice فراخوانی میشد
                        // gistManager.addPrice(symbol, currentPrice);

                        this.realtimeData[symbol] = {
                            price: currentPrice,
                            high_24h: tickData.high,
                            low_24h: tickData.low,
                            volume: tickData.vol,
                            change: tickData.change,
                            timestamp: message.TS,
                            last_updated: new Date().toISOString()
                        };

                        // کش سرور آپدیت میشد
                        // cache.realtimePrices = { ...this.realtimeData };
                    }
                } catch (error) {
                    console.error('✗ WebSocket message processing error', error);
                }
            });

            this.ws.on('error', (error) => {
                console.error('✗ WebSocket error', error);
                this.connected = false;
            });

            this.ws.on('close', (code, reason) => {
                console.log(`△ WebSocket disconnected - Code: ${code}, Reason: ${reason}`);
                this.connected = false;
                setTimeout(() => {
                    console.log('Attempting WebSocket reconnection...');
                    this.connect();
                }, 5000);
            });
        } catch (error) {
            console.error('WebSocket connection error', error);
            setTimeout(() => this.connect(), 10000);
        }
    }

    subscribeToAllPairs() {
        if (this.connected && this.ws) {
            console.log(`Subscribing to ${constants.ALL_TRADING_PAIRS.length} trading pairs`);
            const batchSize = 10;
            for (let i = 0; i < constants.ALL_TRADING_PAIRS.length; i += batchSize) {
                setTimeout(() => {
                    const batch = constants.ALL_TRADING_PAIRS.slice(i, i + batchSize);
                    this.subscribeBatch(batch);
                }, i * 100);
            }
        }
    }

    get top20Pairs() {
        return [
            'btc_usdt', 'eth_usdt', 'bnb_usdt', 'sol_usdt', 'xrp_usdt',
            'ada_usdt', 'avax_usdt', 'dot_usdt', 'link_usdt', 'matic_usdt',
            'ltc_usdt', 'bch_usdt', 'atom_usdt', 'etc_usdt', 'xlm_usdt',
            'fil_usdt', 'hbar_usdt', 'near_usdt', 'apt_usdt', 'arb_usdt'
        ];
    }

    subscribeBatch(pairs) {
        pairs.forEach(pair => {
            const subscription = {
                "action": "subscribe",
                "subscribe": "tick",
                "pair": pair
            };
            this.ws.send(JSON.stringify(subscription));
            this.subscribedPairs.add(pair);
        });
        console.log(`✔ Subscribed to ${pairs.length} pairs`);
    }

    getRealtimeData() {
        return this.realtimeData;
    }

    getConnectionStatus() {
        return {
            connected: this.connected,
            active_coins: Object.keys(this.realtimeData).length,
            total_subscribed: this.subscribedPairs.size,
            coins: Object.keys(this.realtimeData)
        };
    }
}

module.exports = WebSocketManager;
