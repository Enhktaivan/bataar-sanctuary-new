import type React from 'react';
import './sanctuary-sections.css';
const reelUrl = 'https://www.facebook.com/reel/1841067147056065';
export function SanctuaryMedia({currentLang='mn',runtime}:{currentLang?:string;runtime:typeof React}) {
  const mn = currentLang === 'mn';
  const [videoError, setVideoError] = runtime.useState(false);
  return <section className="sanctuary-media-card" id="snow-leopard-films">
    <div className="sanctuary-media-heading">
      <span className="sanctuary-eyebrow">WILDLIFE FILMS</span>
      <h3>{mn ? 'Цоохор ирвэсийн бичлэгүүд' : 'Snow leopard films'}</h3>
      <p>{mn ? 'Шөнийн судалгааны камерын хоёр бичлэг.' : 'Two wildlife camera recordings at night.'}</p>
    </div>
    <div className="sanctuary-film-grid">
      <article className="sanctuary-film-item">
        <div className="sanctuary-film-frame">
          <video src="./videos/snow-leopard-cliff.mp4" controls playsInline preload="metadata" onError={()=>setVideoError(true)} aria-label={mn ? 'Хадан дээрх ирвэс — 30 секунд' : 'Snow leopard on the cliff — 30 seconds'} />
        </div>
        <div className="sanctuary-film-details">
          <h4>{mn ? 'Хадан дээрх ирвэс' : 'Snow leopard on the cliff'}</h4>
          <p>{mn ? '30 секунд · Эрдэнэбаяны ирүүлсэн бичлэг' : '30 seconds · Footage supplied by Erdenebayan'}</p>
          {videoError && <p role="alert">{mn ? 'Бичлэг ачаалсангүй. Доорх холбоосоор нээнэ үү.' : 'The video could not load. Open it using the link below.'}</p>}
          <a href="./videos/snow-leopard-cliff.mp4" target="_blank" rel="noopener noreferrer">{mn ? 'Бичлэгийг тусад нь нээх' : 'Open video'}</a>
        </div>
      </article>
      <article className="sanctuary-film-item">
        <div className="sanctuary-reel-frame">
          <div className="sanctuary-reel-intro">
            <span className="sanctuary-eyebrow">NATIONAL PARK ACADEMY</span>
            <p>{mn ? 'Ирвэс, тэмээ хамт ус ууж буй ховорхон агшин' : 'A rare moment: a snow leopard and camel sharing water'}</p>
            <a className="sanctuary-reel-link" href={reelUrl} target="_blank" rel="noopener noreferrer">{mn ? '▶ Facebook дээр үзэх ↗' : '▶ Watch on Facebook ↗'}</a>
            <small>{mn ? 'Эх сурвалж сайт дотор тоглуулахыг хязгаарласан тул Facebook дээр нээгдэнэ.' : 'The source restricts embedded playback; this video opens on Facebook.'}</small>
          </div>
        </div>
        <div className="sanctuary-film-details">
          <h4>{mn ? 'Ирвэс ба тэмээ' : 'Snow leopard and camel'}</h4>
          <p>{mn ? 'Эх сурвалж: National Park Academy · Тост, Тосон бумбын хамгаалалтын захиргаа' : 'Source: National Park Academy · Tost Toson Bumba protected area administration'}</p>
        </div>
      </article>
    </div>
  </section>;
}
