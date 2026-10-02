import type React from 'react';
import './sanctuary-sections.css';
export function SanctuaryMedia({currentLang='mn',runtime}:{currentLang?:string;runtime:typeof React}) {
  const mn=currentLang==='mn';const [url,setUrl]=runtime.useState(''),[error,setError]=runtime.useState(false);
  runtime.useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
  return <section className="sanctuary-media-card"><div className="sanctuary-media-heading"><span className="sanctuary-eyebrow">WILDLIFE FILM</span><h3>{mn?'Цоохор ирвэсийн бичлэг':'Snow leopard film'}</h3><p>{mn?'Бодит бичлэгийн эх сурвалж баталгаажсаны дараа энд нийтэлнэ.':'Verified footage will be published here when available.'}</p></div><div className="sanctuary-film-frame">
    {url&&!error?<video key={url} src={url} controls playsInline preload="metadata" onError={()=>setError(true)}/>:<><img src="./assets/gobi_snow_leopard_ridge_1788084150553-D7fO5MDL.jpg" alt={mn?'Ирвэсийн хэсгийн тайлбар зураг':'Wildlife section illustration'} loading="lazy"/><div className="sanctuary-film-caption">{error?(mn?'Энэ бичлэгийг browser тоглуулах боломжгүй. MP4 (H.264) эсвэл WebM сонгоно уу.':'Unsupported video. Choose MP4 (H.264) or WebM.'):(mn?'Бичлэг хараахан нэмэгдээгүй':'Footage not yet available')}<small>{mn?'Тайлбар зураг · шууд камерын дүрс биш':'Illustration · not a live camera feed'}</small></div></>}
    </div><div className="sanctuary-film-actions"><label className="sanctuary-file-button">{mn?'Бичлэгээ урьдчилан үзэх':'Preview your video'}<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>{const f=e.target.files?.[0];if(f){setError(false);setUrl(URL.createObjectURL(f));}e.target.value='';}}/></label>{url&&<button onClick={()=>{setUrl('');setError(false);}}>{mn?'Хаах':'Close preview'}</button>}<p>{mn?'Сонгосон файл зөвхөн таны төхөөрөмж дээр тоглоно. Сайт дээр нийтлэгдэхгүй.':'Selected files play locally and are not published to the website.'}</p></div></section>;
}

