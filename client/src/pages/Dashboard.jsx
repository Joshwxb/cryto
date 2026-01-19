import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, LogOut, X, ShoppingCart, 
  Briefcase, ArrowDownCircle, RefreshCcw, 
  CreditCard, Landmark, Coins, Copy, CheckCircle2, ChevronLeft, Download
} from 'lucide-react';
import api from '../services/api';
// axios import removed as we are now using our custom 'api' instance exclusively

const Dashboard = () => {
  const { user, logout, setUser, isRealMode, setIsRealMode } = useContext(AuthContext);
  const [prices, setPrices] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [tradeType, setTradeType] = useState('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState('select'); 
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [copied, setCopied] = useState(false);

  const activeBalance = isRealMode ? 0.00 : (user?.balance || 0);

  useEffect(() => {
    // 1. PWA Listener
    const handleInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // 2. UPDATED: Fetch Prices via your Backend Proxy
    const fetchPrices = async () => {
      try {
        // This now hits: https://crytotrade-pro-0exo.onrender.com/api/trade/coins
        const { data } = await api.get('/trade/coins');
        setPrices(data);
      } catch (error) { 
        console.error("Market data fetch error:", error); 
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh every minute
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setInstallPrompt(null);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDepositSelect = async (method) => {
    setSelectedMethod(method.id);
    setDepositStep('details');
    try {
      await api.post('/payment/log', { 
        email: user?.email, 
        method: method.name 
      });
    } catch (e) { console.log("Logging skipped"); }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    if (isRealMode && tradeType === 'buy') {
      alert("Insufficient Funds: Please fund your Real Account to start live trading.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/trade/execute', {
        coinId: selectedCoin.id,
        symbol: selectedCoin.symbol,
        amount: parseFloat(tradeAmount),
        price: selectedCoin.current_price,
        type: tradeType 
      });
      alert(`Success! ${tradeType === 'buy' ? 'Bought' : 'Sold'} ${tradeAmount} ${selectedCoin.symbol.toUpperCase()}`);
      if(setUser) {
        setUser(prev => ({ ...prev, balance: data.balance, portfolio: data.portfolio }));
      }
      setSelectedCoin(null);
      setTradeAmount('');
    } catch (err) {
      alert(err.response?.data?.message || "Trade failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 relative">
      {/* 1. Header Navigation */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-widest">CryptoTrade <span className="text-cyan-400 font-black italic">PRO</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active Terminal: <span className="text-slate-300 font-mono">{user?.name}</span></p>
          </div>
          
          {installPrompt && (
            <button 
              onClick={handleInstallApp}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-cyan-500 transition-all text-cyan-400"
            >
              <Download size={14}/> Download Terminal
            </button>
          )}
        </div>

        <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner backdrop-blur-md">
            <button onClick={() => setIsRealMode(false)} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${!isRealMode ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Demo</button>
            <button onClick={() => setIsRealMode(true)} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isRealMode ? 'bg-green-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Real</button>
        </div>

        <button onClick={logout} className="p-3 bg-slate-900 border border-slate-800 hover:bg-red-500/10 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-xl group">
            <LogOut size={18} className="group-hover:rotate-12 transition-transform"/>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
            key={isRealMode ? 'real' : 'demo'}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
            className={`p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between h-72 relative overflow-hidden transition-all duration-500 ${isRealMode ? 'bg-gradient-to-br from-green-600 to-emerald-950' : 'bg-gradient-to-br from-cyan-600 to-blue-950'}`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={120}/></div>
          <div>
            <p className="text-white/60 font-black tracking-[0.3em] text-[10px] uppercase mb-4">{isRealMode ? 'Live Asset Portfolio' : 'Simulation Capital'}</p>
            <h2 className="text-6xl font-black mt-2 tracking-tighter leading-none">${activeBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
          </div>
          
          {isRealMode ? (
              <button onClick={() => setShowDepositModal(true)} className="bg-white text-emerald-950 text-[10px] font-black py-4 px-8 rounded-2xl w-fit uppercase tracking-widest transition-all hover:scale-105 shadow-xl">
                  + Deposit Funds
              </button>
          ) : (
            <div className="flex items-center gap-3 text-cyan-200 text-[10px] font-black uppercase tracking-widest">
                <span className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping" /> Paper Trading Mode Active
            </div>
          )}
        </motion.div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] flex flex-col h-72 shadow-2xl">
            <h3 className="flex items-center gap-3 font-black mb-6 text-slate-400 text-[10px] uppercase tracking-[0.3em]"><Briefcase size={16} className="text-cyan-400"/> Inventory</h3>
            <div className="overflow-y-auto flex-grow space-y-4 pr-2 scrollbar-hide">
                <AnimatePresence mode='wait'>
                {(!isRealMode && user?.portfolio?.filter(asset => asset.amount > 0).length > 0) ? (
                    user.portfolio.filter(asset => asset.amount > 0).map(asset => {
                        const marketPrice = prices.find(p => p.id === asset.coinId)?.current_price || 0;
                        return (
                            <motion.div key={asset.coinId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-center p-5 bg-slate-800/20 border border-slate-700/30 rounded-3xl group transition-all">
                                <div>
                                    <p className="uppercase font-black text-sm text-white tracking-widest">{asset.symbol}</p>
                                    <p className="text-cyan-400 text-[10px] font-mono font-black mt-1">{asset.amount.toFixed(4)} Units</p>
                                </div>
                                <button onClick={() => { setTradeType('sell'); setSelectedCoin({ id: asset.coinId, symbol: asset.symbol, current_price: marketPrice, name: asset.coinId }); }} className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Sell</button>
                            </motion.div>
                        )
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 text-center space-y-3">
                        <RefreshCcw size={40} className="animate-spin-slow"/><p className="text-[10px] uppercase font-black tracking-[0.4em] italic">No active positions</p>
                    </div>
                )}
                </AnimatePresence>
            </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <h3 className="flex items-center gap-3 font-black text-xl px-2 mt-8 text-white uppercase tracking-widest italic"><TrendingUp className="text-cyan-400" size={24}/> GLOBAL TICKER</h3>
          <div className="grid grid-cols-1 gap-4">
            {prices.length > 0 ? prices.map((coin) => {
                const isOwned = !isRealMode && user?.portfolio?.some(asset => asset.coinId === coin.id && asset.amount > 0);
                return (
                    <motion.div key={coin.id} whileHover={{ scale: 1.005 }} className="flex items-center justify-between p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem] backdrop-blur-xl transition-all">
                        <div className="flex items-center gap-5">
                            <div className="p-3 bg-slate-800 rounded-2xl"><img src={coin.image} alt={coin.name} className="w-10 h-10" /></div>
                            <div>
                                <p className="font-black text-white text-xl uppercase tracking-tighter italic">{coin.symbol}</p>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{coin.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-right">
                                <p className="font-black text-lg tracking-tighter">${coin.current_price.toLocaleString()}</p>
                                <p className={`text-[10px] font-bold ${coin.price_change_percentage_24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {coin.price_change_percentage_24h > 0 ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                </p>
                            </div>
                            <button onClick={() => { setTradeType(isOwned ? 'sell' : 'buy'); setSelectedCoin(coin); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isOwned ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500' : 'bg-cyan-500 text-slate-950'}`}>
                                {isOwned ? 'Sell Owned' : 'Buy Now'}
                            </button>
                        </div>
                    </motion.div>
                );
            }) : (
              <div className="text-center py-20 opacity-30 uppercase font-black tracking-[0.5em]">Syncing Market Data...</div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowDepositModal(false); setDepositStep('select'); }} className="absolute inset-0 bg-slate-950/98 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-slate-900 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                {depositStep === 'details' && (
                    <button onClick={() => setDepositStep('select')} className="text-slate-500 hover:text-cyan-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"><ChevronLeft size={16}/> Back</button>
                )}
                <button onClick={() => { setShowDepositModal(false); setDepositStep('select'); }} className="ml-auto text-slate-500 hover:text-white transition-colors"><X/></button>
              </div>

              {depositStep === 'select' ? (
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                    <div className="text-center mb-10">
                        <h3 className="text-3xl font-black uppercase tracking-tighter italic">Fund Wallet</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Select a gateway</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            { id: 'crypto', name: 'Crypto Deposit', icon: <Coins/>, desc: 'BTC / ETH / USDT' },
                            { id: 'card', name: 'Credit Card', icon: <CreditCard/>, desc: 'Instant via Stripe' },
                            { id: 'bank', name: 'Bank Transfer', icon: <Landmark/>, desc: 'SWIFT / SEPA' }
                        ].map((method) => (
                            <button key={method.id} onClick={() => handleDepositSelect(method)} className="w-full flex items-center gap-6 p-6 bg-slate-800/30 border border-slate-700/50 rounded-3xl hover:bg-slate-800 hover:border-cyan-500/50 transition-all text-left group">
                                <div className="p-3 bg-slate-900 rounded-2xl text-slate-400 group-hover:text-cyan-400 transition-colors">{method.icon}</div>
                                <div><p className="font-black text-white uppercase tracking-widest text-xs">{method.name}</p><p className="text-slate-500 text-[10px] mt-1 font-bold">{method.desc}</p></div>
                            </button>
                        ))}
                    </div>
                </motion.div>
              ) : (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                    {selectedMethod === 'crypto' && (
                        <div className="text-center">
                            <h4 className="text-xl font-black text-white uppercase mb-4">Send USDT (ERC20)</h4>
                            <div className="bg-white p-4 rounded-3xl w-48 h-48 mx-auto mb-6">
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x71C7656EC7ab88b098defB751B7401B5f6d8976F`} className="w-full h-full" alt="QR" />
                            </div>
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                                <code className="text-[10px] text-cyan-400 font-mono break-all text-left">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</code>
                                <button onClick={() => handleCopy('0x71C7656EC7ab88b098defB751B7401B5f6d8976F')} className="p-2 text-slate-500 hover:text-white">
                                    {copied ? <CheckCircle2 size={18} className="text-green-500"/> : <Copy size={18}/>}
                                </button>
                            </div>
                        </div>
                    )}
                    {selectedMethod === 'card' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-black text-white uppercase mb-2 text-center">Card Checkout</h4>
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <label className="text-[9px] text-slate-500 font-black uppercase block mb-1">Card Number</label>
                                <input type="text" placeholder="**** **** **** ****" className="bg-transparent w-full text-white font-mono outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800"><input type="text" placeholder="MM/YY" className="bg-transparent w-full text-white outline-none" /></div>
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800"><input type="text" placeholder="CVC" className="bg-transparent w-full text-white outline-none" /></div>
                            </div>
                            <button onClick={() => alert("Gateway Syncing...")} className="w-full bg-cyan-500 py-4 rounded-2xl text-slate-950 font-black uppercase text-xs tracking-[0.2em]">Pay Now</button>
                        </div>
                    )}
                    {selectedMethod === 'bank' && (
                        <div className="space-y-4">
                            <h4 className="text-xl font-black text-white uppercase mb-2 text-center">Wire Transfer</h4>
                            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 space-y-4">
                                {[ { l: 'Bank', v: 'Chase Bank' }, { l: 'Beneficiary', v: 'CryptoTrade Pro' }, { l: 'Swift', v: 'CHASUS33' } ].map(i => (
                                    <div key={i.l} className="flex justify-between border-b border-slate-800 pb-2"><span className="text-[9px] text-slate-500 font-black uppercase">{i.l}</span><span className="text-[10px] text-white font-mono">{i.v}</span></div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCoin(null)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl">
              <button onClick={() => setSelectedCoin(null)} className="absolute top-10 right-10 text-slate-600 hover:text-white transition-colors"><X/></button>
              <div className="text-center mb-10">
                <img src={selectedCoin.image} className="w-16 h-16 mx-auto mb-6" alt="coin" />
                <h3 className="text-3xl font-black uppercase tracking-tighter italic">{tradeType} {selectedCoin.name}</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Price: ${selectedCoin.current_price?.toLocaleString()}</p>
              </div>
              <form onSubmit={handleTrade} className="space-y-8">
                <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800">
                  <label className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">Amount</label>
                  <input required type="number" step="any" value={tradeAmount} onChange={(e) => setTradeAmount(e.target.value)} className="w-full bg-transparent text-3xl font-black outline-none mt-2 text-white" placeholder="0.00" />
                </div>
                <button disabled={loading} className={`w-full ${tradeType === 'buy' ? 'bg-cyan-500' : 'bg-red-500'} text-slate-950 font-black py-6 rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-all text-xs uppercase tracking-[0.4em]`}>
                  {loading ? "PROCESSING..." : <>{tradeType === 'buy' ? <ShoppingCart size={20}/> : <ArrowDownCircle size={20}/>} Confirm Trade</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;