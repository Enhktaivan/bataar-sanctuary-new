import type React from 'react';
import rates from './currencyRates.json';
import copy from './currencyCopy.json';
type Runtime = typeof React;
export type Currency = keyof typeof rates.rates;
const currencies = Object.keys(rates.rates) as Currency[];
let preference: {lang:string; currency:Currency} | null = null;
let requestedLanguage: string | null = null;
try {requestedLanguage=new URLSearchParams(window.location.search).get('lang')||localStorage.getItem('bataar_lang');} catch {}
const currencyLanguage=(lang:string)=>lang==='en'&&requestedLanguage==='it'?'it':lang;
window.addEventListener('bataar-language-change',((event:CustomEvent<{lang:string}>)=>{requestedLanguage=event.detail.lang;preference=null;window.dispatchEvent(new Event('bataar-currency'));}) as EventListener);
export function defaultCurrency(lang:string):Currency {return (rates.defaults[lang as keyof typeof rates.defaults] || 'GBP') as Currency;}
export function selectedCurrency(lang:string):Currency {const effective=currencyLanguage(lang);return preference?.lang===effective ? preference.currency : defaultCurrency(effective);}
export function useCurrency(runtime:Runtime,lang:string) {
 const [choice,setChoice]=runtime.useState(()=>selectedCurrency(lang));
 runtime.useEffect(()=>{setChoice(selectedCurrency(lang));const update=()=>setChoice(selectedCurrency(lang));window.addEventListener('bataar-currency',update);return ()=>window.removeEventListener('bataar-currency',update);},[lang]);
 return choice;
}
export function money(mnt:number,currency:Currency,lang:string) {return new Intl.NumberFormat(lang==='mn'?'mn-MN':lang,{style:'currency',currency,maximumFractionDigits:currency==='MNT'||currency==='KRW'||currency==='JPY'?0:2}).format(mnt/rates.rates[currency]);}
export function CurrencyControl({lang,reactRuntime}:{lang:string;reactRuntime:Runtime}) {
 const currency=useCurrency(reactRuntime,lang),t=copy[lang as keyof typeof copy]||copy.en;
 return <div className="my-3 text-xs space-y-2" data-testid="currency-control"><label>{t[0]} <select className="border p-2 bg-white text-stone-900" value={currency} onChange={e=>{preference={lang:currencyLanguage(lang),currency:e.target.value as Currency};window.dispatchEvent(new Event('bataar-currency'));}}>{currencies.map(c=><option key={c} value={c}>{c}</option>)}</select></label><p><a href={rates.source} target="_blank" rel="noreferrer" className="underline">{t[1]}</a> · {rates.date}{currency!=='MNT'?' · 1 '+currency+' = '+rates.rates[currency].toLocaleString('en-US')+' MNT':''}</p><p>{t[2]}</p></div>;
}
export function CurrencyPrice({amount,lang,reactRuntime}:{amount:number;lang:string;reactRuntime:Runtime}) {const currency=useCurrency(reactRuntime,lang);return <span data-testid="converted-price">{currency==='MNT'?money(amount,'MNT',lang):<>≈ {money(amount,currency,lang)} <small className="block text-xs font-normal">{amount.toLocaleString('en-US')} MNT</small></>}</span>;}
