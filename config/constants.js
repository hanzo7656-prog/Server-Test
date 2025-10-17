require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,

  // API Keys
  COINSTATS_API_KEY: "uNb+sOjnjCQmV30dYrChxgh55hRHElmiZLnKJX+5U6g=",
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GIST_ID: process.env.GIST_ID,

  // ALL_TRADING_PAIRS
  ALL_TRADING_PAIRS: [
    "btc_usdt", "eth_usdt", "xrp_usdt", "ada_usdt", "dot_usdt", "doge_usdt", "sol_usdt",
    "matic_usdt", "avax_usdt", "link_usdt", "bch_usdt", "ltc_usdt", "etc_usdt", "trx_usdt",
    "atom_usdt", "bnb_usdt", "xlm_usdt", "eos_usdt", "xtz_usdt", "algo_usdt", "neo_usdt",
    "ftm_usdt", "hbar_usdt", "egld_usdt", "theta_usdt", "vet_usdt", "fil_usdt", "icp_usdt",
    "xmr_usdt", "ape_usdt", "gala_usdt", "sand_usdt", "mana_usdt", "enj_usdt", "bat_usdt",
    "comp_usdt", "mkr_usdt", "zec_usdt", "dash_usdt", "waves_usdt", "omg_usdt", "zil_usdt",
    "ont_usdt", "stx_usdt", "celo_usdt", "wnxm_usdt", "sc_usdt", "zen_usdt", "hot_usdt",
    "iotx_usdt", "one_usdt", "nano_usdt", "ardr_usdt", "qtum_usdt", "lsk_usdt", "strat_usdt",
    "kmd_usdt", "pivx_usdt", "grs_usdt", "nav_usdt", "emc2_usdt", "sys_usdt", "via_usdt",
    "mona_usdt", "dcr_usdt", "sia_usdt", "lbc_usdt", "rep_usdt", "gnt_usdt", "loom_usdt",
    "poly_usdt", "ren_usdt", "fun_usdt", "req_usdt", "salt_usdt", "mtl_usdt", "mco_usdt",
    "edo_usdt", "powr_usdt", "eng_usdt", "ast_usdt", "dgd_usdt", "adx_usdt", "qsp_usdt",
    "mda_usdt", "snt_usdt", "agix_usdt", "ocean_usdt", "band_usdt", "nmr_usdt", "rlc_usdt",
    "storj_usdt", "keep_usdt", "om_usdt", "front_usdt", "perp_usdt", "api3_usdt", "grt_usdt",
    "lqty_usdt", "alcx_usdt", "pool_usdt", "rad_usdt", "farm_usdt", "audio_usdt", "rsr_usdt",
    "dodo_usdt", "lit_usdt", "ygg_usdt", "slp_usdt", "axs_usdt", "sandbox_usdt", "enjin_usdt",
    "mdx_usdt", "flow_usdt", "rose_usdt", "ar_usdt", "rune_usdt", "sushi_usdt", "crv_usdt",
    "knc_usdt", "bal_usdt", "uma_usdt", "badger_usdt", "fxs_usdt", "cvx_usdt", "tribe_usdt",
    "gno_usdt", "ilus_usdt", "pla_usdt", "super_usdt", "ach_usdt", "imx_usdt", "gods_usdt",
    "vra_usdt", "sps_usdt", "dar_usdt", "mgm_usdt", "ceek_usdt", "vr_usdt", "bmax_usdt",
    "hero_usdt", "pyr_usdt", "ufo_usdt", "elon_usdt", "shib_usdt", "floki_usdt", "samo_usdt",
    "baby_usdt", "kishu_usdt", "hoge_usdt", "akita_usdt", "husky_usdt", "lunc_usdt",
    "bonk_usdt", "wif_usdt", "myro_usdt", "popcat_usdt", "toshi_usdt", "mew_usdt", "mog_usdt",
    "turbo_usdt", "pepe_usdt", "wojak_usdt", "aidoge_usdt", "pudgy_usdt", "lady_usdt",
    "based_usdt", "degen_usdt", "moutai_usdt", "aave_usdt", "snx_usdt", "uni_usdt", "cake_usdt",
    "bake_usdt", "burger_usdt", "inj_usdt", "lina_usdt", "reef_usdt", "dusk_usdt", "ogn_usdt",
    "for_usdt", "mir_usdt", "cos_usdt", "ctk_usdt", "tko_usdt", "alpaca_usdt", "perl_usdt",
    "stpt_usdt", "troy_usdt", "vite_usdt", "hbtc_usdt", "mdt_usdt", "mbox_usdt", "gmt_usdt",
    "time_usdt", "raca_usdt", "beans_usdt", "edu_usdt", "id_usdt", "ondo_usdt", "pixel_usdt",
    "voxel_usdt", "high_usdt", "looks_usdt", "blur_usdt", "psp_usdt", "oxt_usdt", "num_usdt",
    "mask_usdt", "glm_usdt", "ant_usdt", "bond_usdt", "fida_usdt", "maps_usdt", "drop_usdt",
    "px_usdt", "clv_usdt", "cfx_usdt", "ckb_usdt", "mx_usdt", "fet_usdt", "stmx_usdt",
    "chz_usdt", "ankr_usdt", "skl_usdt", "arpa_usdt", "strax_usdt", "mbl_usdt", "quick_usdt",
    "sfund_usdt", "bsw_usdt", "axie_usdt", "tfuel_usdt", "hnt_usdt", "loka_usdt", "dydx_usdt",
    "pundix_usdt", "dent_usdt", "cvc_usdt", "data_usdt", "nkn_usdt", "key_usdt", "dock_usdt",
    "phb_usdt", "mxc_usdt"
  ],

  // تایم‌فریم‌های موجود
  TIMEFRAMES: ["1h", "4h", "24h", "7d", "30d", "180d"],

  // تنظیمات کش
  CACHE_CONFIG: {
    timeout: 5 * 60 * 1000, // 5 دقیقه
    batchSize: 5
  },

  // URLهای API
  API_URLS: {
    base: "https://openapiv1.coinstats.app",
    exchange: "https://openapiv1.coinstats.app/coins/price/exchange",
    tickers: "https://openapiv1.coinstats.app/tickers/exchanges",
    avgPrice: "https://openapiv1.coinstats.app/coins/price/avg",
    markets: "https://openapiv1.coinstats.app/markets",
    currencies: "https://openapiv1.coinstats.app/currencies",
    newsSources: "https://openapiv1.coinstats.app/news/sources",
    news: "https://openapiv1.coinstats.app/news",
    btcDominance: "https://openapiv1.coinstats.app/insights/btc-dominance",
    fearGreed: "https://openapiv1.coinstats.app/insights/fear-and-greed",
    fearGreedChart: "https://openapiv1.coinstats.app/insights/fear-and-greed/chart",
    rainbowChart: "https://openapiv1.coinstats.app/insights/rainbow-chart/bitcoin"
  }
};
