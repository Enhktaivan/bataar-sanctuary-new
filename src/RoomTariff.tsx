import roomTariffLabels from './roomTariffLabels.json';
import {deluxeBreakdown} from './roomStayPrice';
import {standardRoomPricing as standard} from './standardRoomPricing';
export const tariffCopy = {
  mn:['Үнэ харах','Байр / хоног','Өглөөний хоол / хүн','Өдрийн хоол / хүн','Оройн хоол / хүн','Люкс өрөө: хосоороо нэг хүн 320,000 ₮. Ганцаараа байрлавал 2 хүний байрны төлбөр 640,000 ₮. Хоол тусдаа, энгийн өрөөний тарифаар бодит хүний тоонд тооцно.','Ганцаар, 3 хоолтой / хоног','Хоёулаа, 3 хоолтой / хоног'],
  en:['View prices','Accommodation / night','Breakfast / guest','Lunch / guest','Dinner / guest','Deluxe: 320,000 MNT per person sharing. Single occupancy pays the full two-person room charge of 640,000 MNT. Meals are separate, at standard-room meal rates, for actual guests.','Single, with 3 meals / night','Two guests, with 3 meals / night'],
  ja:['料金を見る','宿泊料金／泊','朝食／名','昼食／名','夕食／名','デラックスは2名利用で1名320,000 MNT。1名利用でも客室料金640,000 MNT。食事は別料金で、スタンダードと同じ食事料金を実際の人数分加算します。','1名・3食付き／泊','2名・3食付き／泊'],
  zh:['查看价格','住宿／晚','早餐／人','午餐／人','晚餐／人','豪华房双人入住每人320,000 MNT；单人入住也须支付整间房640,000 MNT。餐费另计，按实际人数采用标准房相同餐费。','1人含三餐／晚','2人含三餐／晚'],
  ko:['요금 보기','숙박 / 박','조식 / 인','중식 / 인','석식 / 인','디럭스 2인 이용 시 1인 320,000 MNT. 1인 이용도 객실 전체 요금 640,000 MNT를 지불합니다. 식사는 별도이며 스탠다드와 같은 식사 요금을 실제 인원수에 적용합니다.','1인, 세 끼 포함 / 박','2인, 세 끼 포함 / 박'],
  ru:['Посмотреть цены','Проживание / ночь','Завтрак / гость','Обед / гость','Ужин / гость','Делюкс: 320 000 MNT с человека при размещении вдвоём. За одноместное размещение взимается полная стоимость номера 640 000 MNT. Питание отдельно по тарифам стандартного номера для фактического числа гостей.','Один гость, три приёма пищи / ночь','Два гостя, три приёма пищи / ночь'],
  de:['Preise ansehen','Unterkunft / Nacht','Frühstück / Gast','Mittagessen / Gast','Abendessen / Gast','Deluxe: 320.000 MNT pro Person bei Doppelbelegung. Bei Einzelbelegung gilt der volle Zimmerpreis von 640.000 MNT. Mahlzeiten separat zum Standardzimmer-Verpflegungstarif für die tatsächliche Gästezahl.','Ein Gast mit drei Mahlzeiten / Nacht','Zwei Gäste mit drei Mahlzeiten / Nacht'],
  fr:['Voir les tarifs','Hébergement / nuit','Petit-déjeuner / personne','Déjeuner / personne','Dîner / personne','Deluxe : 320 000 MNT par personne à deux. En occupation individuelle, le prix complet de la chambre de 640 000 MNT reste dû. Repas en supplément au même tarif que la chambre standard, selon le nombre réel de voyageurs.','Une personne avec trois repas / nuit','Deux personnes avec trois repas / nuit'],
  it:['Vedi prezzi','Alloggio / notte','Colazione / ospite','Pranzo / ospite','Cena / ospite','Deluxe: 320.000 MNT a persona in due. Per uso singolo si paga l’intera camera: 640.000 MNT. Pasti separati alle stesse tariffe della camera standard, per il numero effettivo di ospiti.','Un ospite con tre pasti / notte','Due ospiti con tre pasti / notte'],
} as const;
export function RoomTariff({room,lang='mn'}:{room:string;lang?:string}) {
  if(room!=='deluxe' && room!=='standard') return null;
  const t=tariffCopy[lang as keyof typeof tariffCopy]||tariffCopy.en;
  const labels=roomTariffLabels[lang as keyof typeof roomTariffLabels]||roomTariffLabels.en;
  const rows=[[labels[0],room==='deluxe'?320000:standard.accommodationShared],[labels[1],room==='deluxe'?640000:standard.accommodationSingle],[t[2],standard.breakfast],[t[3],standard.lunch],[t[4],standard.dinner],[labels[4],room==='deluxe'?deluxeBreakdown(1).total:standard.singleTotal],[labels[5],room==='deluxe'?deluxeBreakdown(2).total:standard.sharedTotal*2],[labels[2],room==='deluxe'?250000:standard.staffTotal]] as const;
  return <details className="border border-stone-300 bg-white p-4 text-stone-900" data-testid={room+"-tariff"}>
    <summary className="cursor-pointer font-semibold">{t[0]}</summary>
    {room==='deluxe' && <p className="my-3 text-sm">{t[5]}</p>}
    <dl className="space-y-2 text-sm">{rows.map(([label,value])=><div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="font-semibold whitespace-nowrap">{value.toLocaleString('en-US')} ₮</dd></div>)}</dl>
  </details>;
}
