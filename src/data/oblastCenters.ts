export interface OblastCenter {
  regionId: string
  name: string
  lat: number
  lon: number
}

// Адміністративні центри областей (та Сімферополь для АР Крим) — довідкові точки
// для орієнтування на карті. Київ і Севастополь не мають тут запису: вони самі
// є окремими одиницями верхнього рівня (kyivska-oblast НЕ включає власного
// запису "Київ" — це те саме місто, що вже існує як незалежний регіон, і
// дублювання його тут лише накладало б два однакові знаки в одній точці).
// Координати звірені наживо через OpenStreetMap Overpass API там, де позначено
// "verified"; решта — усталені загальновідомі координати центру міста.
export const OBLAST_CENTERS: OblastCenter[] = [
  { regionId: 'vinnytska-oblast', name: 'Вінниця', lat: 49.232, lon: 28.468 }, // verified
  { regionId: 'volynska-oblast', name: 'Луцьк', lat: 50.7451, lon: 25.3201 }, // verified
  { regionId: 'dnipropetrovska-oblast', name: 'Дніпро', lat: 48.4647, lon: 35.0462 },
  { regionId: 'donetska-oblast', name: 'Донецьк', lat: 48.0159, lon: 37.8013 }, // verified
  { regionId: 'zhytomyrska-oblast', name: 'Житомир', lat: 50.2601, lon: 28.6696 }, // verified
  { regionId: 'zakarpatska-oblast', name: 'Ужгород', lat: 48.6224, lon: 22.3023 }, // verified
  { regionId: 'zaporizka-oblast', name: 'Запоріжжя', lat: 47.8508, lon: 35.1183 }, // verified
  { regionId: 'ivano-frankivska-oblast', name: 'Івано-Франківськ', lat: 48.9225, lon: 24.7103 }, // verified
  { regionId: 'kirovohradska-oblast', name: 'Кропивницький', lat: 48.5079, lon: 32.2623 },
  { regionId: 'luhanska-oblast', name: 'Луганськ', lat: 48.5717, lon: 39.2973 }, // verified
  { regionId: 'lvivska-oblast', name: 'Львів', lat: 49.8397, lon: 24.0297 },
  { regionId: 'mykolaivska-oblast', name: 'Миколаїв', lat: 46.975, lon: 31.9946 },
  { regionId: 'odeska-oblast', name: 'Одеса', lat: 46.4843, lon: 30.7323 }, // verified
  { regionId: 'poltavska-oblast', name: 'Полтава', lat: 49.5897, lon: 34.5508 }, // verified
  { regionId: 'rivnenska-oblast', name: 'Рівне', lat: 50.6199, lon: 26.2516 },
  { regionId: 'sumska-oblast', name: 'Суми', lat: 50.9077, lon: 34.7981 },
  { regionId: 'ternopilska-oblast', name: 'Тернопіль', lat: 49.5558, lon: 25.5924 }, // verified
  { regionId: 'kharkivska-oblast', name: 'Харків', lat: 49.9935, lon: 36.2304 },
  { regionId: 'khersonska-oblast', name: 'Херсон', lat: 46.6401, lon: 32.6144 }, // verified
  { regionId: 'khmelnytska-oblast', name: 'Хмельницький', lat: 49.4196, lon: 26.9794 }, // verified
  { regionId: 'cherkaska-oblast', name: 'Черкаси', lat: 49.4444, lon: 32.0598 },
  { regionId: 'chernivetska-oblast', name: 'Чернівці', lat: 48.2865, lon: 25.9377 }, // verified
  { regionId: 'chernihivska-oblast', name: 'Чернігів', lat: 51.4941, lon: 31.2943 }, // verified
  { regionId: 'avtonomna-respublika-krym', name: 'Сімферополь', lat: 44.9521, lon: 34.1024 },
]
