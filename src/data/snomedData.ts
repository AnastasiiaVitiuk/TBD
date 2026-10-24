import { SupportedLanguage, SNOMEDGrounding, RedFlagAssessment } from '../types';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', speechCode: 'pl-PL', greeting: 'Cześć! W czym mogę Ci pomóc?' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES', greeting: '¡Hola! ¿Cómo se siente hoy?' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', speechCode: 'uk-UA', greeting: 'Вітаю! Що вас турбує?' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', speechCode: 'pa-IN', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਹਾਨੂੰ ਕੀ ਤਕਲੀਫ਼ ਹੈ?' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', speechCode: 'ur-PK', greeting: 'السلام علیکم! آپ کیسی طبیعت ہے؟' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA', greeting: 'مرحباً! ما هي الأعراض التي تشعر بها؟' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', speechCode: 'ro-RO', greeting: 'Bună! Cu ce simptome vă confruntați?' },
  { code: 'zh', name: 'Cantonese / Chinese', nativeName: '廣東話 / 中文', flag: '🇭🇰', speechCode: 'zh-HK', greeting: '你好！請問你邊度唔舒服？' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', speechCode: 'pt-PT', greeting: 'Olá! O que está sentindo hoje?' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', speechCode: 'bn-BD', greeting: 'নমস্কার! আপনার কি সমস্যা হচ্ছে?' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speechCode: 'en-GB', greeting: 'Hello! How can we help you today?' },
];

export interface CatalogEntry {
  snomedConceptId: string;
  snomedPreferredTerm: string;
  icd10Code: string;
  clinicalCategory: 'Symptom' | 'Finding' | 'Disorder' | 'Body Structure';
  isRedFlag: boolean;
  englishLayPhrase: string;
  plainEnglishExplanation: string;
  multilingual: Record<string, {
    layPhrases: string[];
    plainExplanation: string;
  }>;
}

export const SNOMED_CATALOG: CatalogEntry[] = [
  {
    snomedConceptId: '25376007',
    snomedPreferredTerm: 'Dyspepsia / Epigastric pain',
    icd10Code: 'K30',
    clinicalCategory: 'Symptom',
    isRedFlag: false,
    englishLayPhrase: 'burning stomach / indigestion / acid heartburn',
    plainEnglishExplanation: 'Irritation or burning sensation in the upper digestive tract or stomach.',
    multilingual: {
      es: {
        layPhrases: ['ardor en el estómago', 'fuego en la panza', 'acidez', 'quemazón'],
        plainExplanation: 'Sensación de quemazón o acidez en la parte alta del estómago.',
      },
      pl: {
        layPhrases: ['pieczenie w żołądku', 'zgaga', 'ogień w brzuchu', 'ból brzucha po jedzeniu'],
        plainExplanation: 'Uczucie pieczenia lub kwasowości w górnej części żołądka.',
      },
      uk: {
        layPhrases: ['печіння в шлунку', 'печія', 'вогонь у животі', 'пече живіт'],
        plainExplanation: 'Відчуття печіння або кислотності у верхній частині шлунка.',
      },
      ar: {
        layPhrases: ['حرقة في المعدة', 'حموضة', 'نار في بطني'],
        plainExplanation: 'شعور بالحرقة أو الحموضة في الجزء العلوي من المعدة.',
      },
      pa: {
        layPhrases: ['ਢਿੱਡ ਵਿੱਚ ਸੜਨ', 'ਐਸਿਡ', 'ਛਾਤੀ ਚ ਸੜਨ'],
        plainExplanation: 'ਪੇਟ ਦੇ ਉੱਪਰਲੇ ਹਿੱਸੇ ਵਿੱਚ ਜਲਣ ਜਾਂ ਗੈਸ ਦਾ ਅਹਿਸਾਸ।',
      },
      ro: {
        layPhrases: ['arsură la stomac', 'arsuri', 'aciditate', 'foc în burtă'],
        plainExplanation: 'Senzație de arsură sau aciditate în partea superioară a stomacului.',
      },
    },
  },
  {
    snomedConceptId: '29857009',
    snomedPreferredTerm: 'Acute central chest pain / Angina pectoris',
    icd10Code: 'R07.9',
    clinicalCategory: 'Symptom',
    isRedFlag: true,
    englishLayPhrase: 'crushing chest pain / heavy pressure on chest',
    plainEnglishExplanation: 'Tight, crushing, or heavy sensation in the center of the chest, radiating to arm, neck or jaw.',
    multilingual: {
      es: {
        layPhrases: ['dolor opresivo en el pecho', 'presión en el corazón', 'me aprieta el pecho', 'dolor que va al brazo'],
        plainExplanation: 'Dolor o presión intensa en el pecho que puede irradiarse al brazo o cuello. Requiere atención de urgencia.',
      },
      pl: {
        layPhrases: ['ściskający ból w klatce piersiowej', 'ciężar na sercu', 'ból promieniujący do ramienia'],
        plainExplanation: 'Silny ból lub ucisk w klatce piersiowej, mogący promieniować do ramienia lub szyi. Wymaga pilnej pomocy.',
      },
      uk: {
        layPhrases: ['стискаючий біль у грудях', 'тисне серце', 'важко в грудях', 'віддає в ліву руку'],
        plainExplanation: 'Сильний стискаючий біль або тиск у грудній клітці, який може віддавати в руку чи шию. Потребує негайної допомоги.',
      },
      ar: {
        layPhrases: ['ألم ضاغط في الصدر', 'ثقل على قلبي', 'ألم يمتد إلى الذراع'],
        plainExplanation: 'ألم أو ضغط شديد في الصدر قد يمتد إلى الذراع أو الرقبة. يتطلب عناية طارئة.',
      },
      pa: {
        layPhrases: ['ਛਾਤੀ ਵਿੱਚ ਦਬਾਅ', 'ਦਿਲ ਤੇ ਭਾਰ', 'ਦਰਦ ਖੱਬੀ ਬਾਂਹ ਵੱਲ ਜਾਂਦਾ ਹੈ'],
        plainExplanation: 'ਛਾਤੀ ਵਿੱਚ ਗੰਭੀਰ ਦਬਾਅ ਜਾਂ ਦਰਦ। ਤੁਰੰਤ ਐਮਰਜੈਂਸੀ ਮਦਦ ਦੀ ਲੋੜ ਹੈ।',
      },
      ro: {
        layPhrases: ['durere apăsătoare în piept', 'strângere în piept', 'durere spre braț'],
        plainExplanation: 'Durere intensă sau apăsare în piept, ce poate radia spre braț. Necesită asistență de urgență.',
      },
    },
  },
  {
    snomedConceptId: '267036007',
    snomedPreferredTerm: 'Dyspnea / Shortness of breath',
    icd10Code: 'R06.0',
    clinicalCategory: 'Symptom',
    isRedFlag: true,
    englishLayPhrase: 'cannot breathe / breathlessness / suffocating feeling',
    plainEnglishExplanation: 'Difficulty getting enough air into the lungs or breathing very rapidly with effort.',
    multilingual: {
      es: {
        layPhrases: ['no puedo respirar', 'me falta el aire', 'ahogo', 'asfixia'],
        plainExplanation: 'Dificultad para meter aire a los pulmones o sensación de falta de aliento.',
      },
      pl: {
        layPhrases: ['duszność', 'brak tchu', 'nie mogę złapać powietrza', 'dusi mnie'],
        plainExplanation: 'Trudność w nabraniu powietrza do płuc lub uczucie dławienia.',
      },
      uk: {
        layPhrases: ['задишка', 'не можу дихати', 'бракує повітря', 'задихаюся'],
        plainExplanation: 'Важкість при вдиху або відчуття нестачі кисню в легенях.',
      },
      ar: {
        layPhrases: ['ضيق في التنفس', 'لا أستطيع التنفس', 'اختناق'],
        plainExplanation: 'صعوبة في إدخال الهواء إلى الرئتين أو ضيق مفاجئ في التنفس.',
      },
      pa: {
        layPhrases: ['ਸਾਹ ਲੈਣ ਚ ਤਕਲੀਫ', 'ਸਾਹ ਚੜ੍ਹਦਾ ਹੈ', 'ਦਮ ਘੁੱਟਦਾ ਹੈ'],
        plainExplanation: 'ਸਾਹ ਲੈਣ ਵਿੱਚ ਬਹੁਤ ਔਖ ਹੋਣਾ ਜਾਂ ਦਮ ਘੁੱਟਣਾ।',
      },
      ro: {
        layPhrases: ['nu pot respira', 'lipsă de aer', 'mă sufoc', 'dificultate respiratorie'],
        plainExplanation: 'Dificultate în a inspira suficient aer în plămâni sau respirație greoaie.',
      },
    },
  },
  {
    snomedConceptId: '37796009',
    snomedPreferredTerm: 'Migraine with or without aura',
    icd10Code: 'G43.9',
    clinicalCategory: 'Disorder',
    isRedFlag: false,
    englishLayPhrase: 'pounding one-sided headache / sensitive to light and sound',
    plainEnglishExplanation: 'Severe throbbing headache usually on one side of the head, often with nausea and light sensitivity.',
    multilingual: {
      es: {
        layPhrases: ['dolor pulsátil en un lado de la cabeza', 'migraña', 'la luz me molesta la cabeza'],
        plainExplanation: 'Dolor de cabeza intenso y palpitante en un solo lado, con molestia a la luz y ruidos.',
      },
      pl: {
        layPhrases: ['pulsujący ból połowy głowy', 'migrena', 'światłowstręt', 'łupanie w skroni'],
        plainExplanation: 'Silny, pulsujący ból po jednej stronie głowy, często z wrażliwością na światło.',
      },
      uk: {
        layPhrases: ['пульсуючий біль з одного боку голови', 'мігрень', 'болить скроня', 'світло ріже очі'],
        plainExplanation: 'Сильний пульсуючий головний біль з одного боку, чутливість до світла та звуків.',
      },
      ar: {
        layPhrases: ['صداع نصفي', 'نبض شديد في جانب الرأس', 'ألم في الشقيقة'],
        plainExplanation: 'صداع حاد نابض في جانب واحد من الرأس مع حساسية للضوء.',
      },
      pa: {
        layPhrases: ['ਅੱਧਾ ਸਿਰ ਦਰਦ', 'ਮਾਈਗ੍ਰੇਨ', 'ਸਿਰ ਚ ਧੜਕਣ ਵਰਗਾ ਦਰਦ'],
        plainExplanation: 'ਸਿਰ ਦੇ ਇੱਕ ਪਾਸੇ ਤੇਜ਼ ਧੜਕਣ ਵਾਲਾ ਦਰਦ ਅਤੇ ਰੌਸ਼ਨੀ ਨਾਲ ਤਕਲੀਫ਼।',
      },
      ro: {
        layPhrases: ['migrenă', 'durere pulsatilă pe o parte a capului', 'mă deranjează lumina'],
        plainExplanation: 'Durere intensă și pulsatilă pe o singură parte a capului, cu sensibilitate la lumină.',
      },
    },
  },
  {
    snomedConceptId: '399153001',
    snomedPreferredTerm: 'Vertigo / Vestibular dizziness',
    icd10Code: 'R42',
    clinicalCategory: 'Symptom',
    isRedFlag: false,
    englishLayPhrase: 'spinning room / balance loss / dizzy spell',
    plainEnglishExplanation: 'A feeling that you or the environment around you is spinning or tilting.',
    multilingual: {
      es: {
        layPhrases: ['todo me da vueltas', 'mareo que gira', 'vértigo'],
        plainExplanation: 'Sensación de que la habitación o uno mismo está girando sin control.',
      },
      pl: {
        layPhrases: ['kręci mi się w głowie', 'świat wiruje', 'zawroty głowy'],
        plainExplanation: 'Uczucie wirowania otoczenia lub utraty równowagi.',
      },
      uk: {
        layPhrases: ['все крутиться перед очима', 'паморочиться в голові', 'вертиго'],
        plainExplanation: 'Відчуття обертання предметів навколо або втрати рівноваги.',
      },
      ar: {
        layPhrases: ['الغرفة تدور بي', 'دوار', 'دوخة شديدة'],
        plainExplanation: 'إحساس بدوران المحيط أو فقدان التوازن بشكل مفاجئ.',
      },
      pa: {
        layPhrases: ['ਸਿਰ ਘੁੰਮਣਾ', 'ਚੱਕਰ ਆਉਣੇ', 'ਸਭ ਕੁਝ ਘੁੰਮਦਾ ਦਿਸਣਾ'],
        plainExplanation: 'ਸਿਰ ਘੁੰਮਣ ਜਾਂ ਸੰਤੁਲਨ ਵਿਗੜਨ ਦਾ ਅਹਿਸਾਸ ਹੋਣਾ।',
      },
      ro: {
        layPhrases: ['se învârte camera cu mine', 'amețeală puternică', 'vertij'],
        plainExplanation: 'Senzația că totul în jur se învârte sau pierdere de echilibru.',
      },
    },
  },
  {
    snomedConceptId: '49650001',
    snomedPreferredTerm: 'Dysuria / Painful micturition (UTI symptom)',
    icd10Code: 'R30.0',
    clinicalCategory: 'Symptom',
    isRedFlag: false,
    englishLayPhrase: 'burning sensation when peeing / painful urination',
    plainEnglishExplanation: 'Discomfort, stinging, or burning pain while passing urine.',
    multilingual: {
      es: {
        layPhrases: ['arde al orinar', 'dolor al hacer pis', 'infección de orina'],
        plainExplanation: 'Escozor o dolor molesto al momento de orinar.',
      },
      pl: {
        layPhrases: ['piecze przy sikaniu', 'ból przy oddawaniu moczu', 'zapalenie pęcherza'],
        plainExplanation: 'Pieczenie lub kłujący ból w trakcie oddawania moczu.',
      },
      uk: {
        layPhrases: ['пече коли пісяю', 'біль при сечовипусканні', 'цистит'],
        plainExplanation: 'Печіння або ріжучий біль під час сечовипускання.',
      },
      ar: {
        layPhrases: ['حرقة عند التبول', 'ألم أثناء خروج البول', 'التهاب المسالك'],
        plainExplanation: 'حرقة أو وخز مؤلم عند التبول.',
      },
      pa: {
        layPhrases: ['ਪਿਸ਼ਾਬ ਕਰਨ ਵੇਲੇ ਸੜਨ', 'ਪਿਸ਼ਾਬ ਚ ਦਰਦ'],
        plainExplanation: 'ਪਿਸ਼ਾਬ ਕਰਦੇ ਸਮੇਂ ਜਲਣ ਜਾਂ ਦਰਦ ਮਹਿਸੂਸ ਹੋਣਾ।',
      },
      ro: {
        layPhrases: ['ustură când urinez', 'durere la urinare', 'infecție urinară'],
        plainExplanation: 'Senzație de usturime sau durere la eliminarea urinei.',
      },
    },
  },
  {
    snomedConceptId: '66857006',
    snomedPreferredTerm: 'Hemoptysis / Coughing up blood',
    icd10Code: 'R04.2',
    clinicalCategory: 'Finding',
    isRedFlag: true,
    englishLayPhrase: 'coughing up blood / spitting blood from lungs',
    plainEnglishExplanation: 'Coughing up blood or blood-stained mucus from the respiratory tract.',
    multilingual: {
      es: {
        layPhrases: ['tosiendo sangre', 'escupo sangre', 'tos con flema roja'],
        plainExplanation: 'Expulsión de sangre o flema con sangre al toser. Requiere evaluación médica urgente.',
      },
      pl: {
        layPhrases: ['krwioplucie', 'kaszel z krwią', 'odkrztuszanie krwi'],
        plainExplanation: 'Odkrztuszanie krwi lub śluzu podbarwionego krwią. Wymaga pilnej konsultacji.',
      },
      uk: {
        layPhrases: ['кашель з кровʼю', 'плююся кровʼю', 'відкашлюю кров'],
        plainExplanation: 'Викашлювання крові або харкотиння з прожилками крові. Потребує негайного огляду лікаря.',
      },
      ar: {
        layPhrases: ['سعال مصحوب بالدم', 'أبصق دماً', 'دم مع الكحة'],
        plainExplanation: 'خروج دم مع السعال من الجهاز التنفسي. يحتاج لتدخل طبي فوري.',
      },
      pa: {
        layPhrases: ['ਖੰਘ ਨਾਲ ਖੂਨ ਆਉਣਾ', 'ਥੁੱਕ ਚ ਖੂਨ'],
        plainExplanation: 'ਖੰਘਣ ਵੇਲੇ ਖੂਨ ਨਿਕਲਣਾ। ਤੁਰੰਤ ਡਾਕਟਰੀ ਜਾਂਚ ਦੀ ਲੋੜ ਹੈ।',
      },
      ro: {
        layPhrases: ['tușesc sânge', 'scuip sânge', 'sânge în spută'],
        plainExplanation: 'Tuse cu eliminare de sânge sau spută cu sânge. Necesită consult medical de urgență.',
      },
    },
  },
  {
    snomedConceptId: '84445001',
    snomedPreferredTerm: 'Morning joint stiffness',
    icd10Code: 'M25.6',
    clinicalCategory: 'Symptom',
    isRedFlag: false,
    englishLayPhrase: 'stiff fingers or knees in the morning / joints hard to move',
    plainEnglishExplanation: 'Difficulty moving joints upon waking up that lasts several minutes or hours.',
    multilingual: {
      es: {
        layPhrases: ['articulaciones duras por la mañana', 'rigidez matutina', 'dedos tiesos'],
        plainExplanation: 'Dificultad y molestia para doblar las articulaciones al levantarse de la cama.',
      },
      pl: {
        layPhrases: ['poranna sztywność stawów', 'zastane kolana rano', 'zdrętwiałe palce'],
        plainExplanation: 'Trudność w poruszaniu stawami po przebudzeniu, ustępująca w ciągu dnia.',
      },
      uk: {
        layPhrases: ['ранкова скутість суглобів', 'важко розімʼяти пальці зранку', 'затерпли суглоби'],
        plainExplanation: 'Складність у русі суглобів після сну, яка поступово минає.',
      },
      ar: {
        layPhrases: ['تيبس المفاصل صباحاً', 'صعوبة تحريك الأصابع عند الاستيقاظ'],
        plainExplanation: 'صعوبة وتصلب في حركة المفاصل فور الاستيقاظ من النوم.',
      },
      pa: {
        layPhrases: ['ਸਵੇਰੇ ਜੋੜਾਂ ਦਾ ਆਕੜਨਾ', 'ਉੱਠਣ ਵੇਲੇ ਗੋਡੇ ਜਾਮ ਹੋਣੇ'],
        plainExplanation: 'ਸਵੇਰੇ ਉੱਠਣ ਵੇਲੇ ਜੋੜਾਂ ਵਿੱਚ ਆਕੜ ਜਾਂ ਹਿਲਣ-ਜੁਲਣ ਵਿੱਚ ਦਿੱਕਤ।',
      },
      ro: {
        layPhrases: ['rigiditate matinală a articulațiilor', 'încheieturi înțepenite dimineața'],
        plainExplanation: 'Dificultate în mișcarea articulațiilor la trezire, care se ameliorează treptat.',
      },
    },
  },
];

/**
 * Fast clinical red flag scanner across user text.
 * Checks for cardiac, stroke, respiratory distress, and hemorrhaging markers.
 */
export function evaluateRedFlags(text: string, langCode: string): RedFlagAssessment {
  const lower = text.toLowerCase();
  const triggered: string[] = [];

  // Cardiac red flags
  if (
    lower.includes('chest') && (lower.includes('crush') || lower.includes('tight') || lower.includes('pressure') || lower.includes('arm') || lower.includes('jaw')) ||
    lower.includes('pecho') && (lower.includes('opresivo') || lower.includes('presion') || lower.includes('brazo')) ||
    lower.includes('klatce') && (lower.includes('ścisk') || lower.includes('ramienia') || lower.includes('sercu')) ||
    lower.includes('грудях') && (lower.includes('стиска') || lower.includes('руку') || lower.includes('серце'))
  ) {
    triggered.push('Potential acute coronary syndrome / severe chest pressure radiating to arm or jaw');
  }

  // Respiratory failure
  if (
    lower.includes("can't breathe") || lower.includes('cannot breathe') || lower.includes('suffocat') ||
    lower.includes('no puedo respirar') || lower.includes('me ahogo') ||
    lower.includes('duszność') || lower.includes('nie mogę złapać powietrza') ||
    lower.includes('не можу дихати') || lower.includes('задихаюся')
  ) {
    triggered.push('Severe acute dyspnea / Respiratory distress');
  }

  // Stroke / FAST signs
  if (
    lower.includes('droop') || lower.includes('slurred') || lower.includes('face numb') || lower.includes('cannot move arm') ||
    lower.includes('cara caída') || lower.includes('habla trabada') ||
    lower.includes('opadanie kącika') || lower.includes('bełkotliwa mowa') ||
    lower.includes('перекосило обличчя') || lower.includes('відняло руку')
  ) {
    triggered.push('Potential acute cerebrovascular event / Stroke (FAST protocol)');
  }

  // Severe bleeding / Hemoptysis
  if (
    lower.includes('coughing blood') || lower.includes('throwing up blood') || lower.includes('vomiting blood') ||
    lower.includes('tosiendo sangre') || lower.includes('vomitando sangre') ||
    lower.includes('krwioplucie') || lower.includes('wymioty z krwią') ||
    lower.includes('кашель з кров') || lower.includes('блювота з кров')
  ) {
    triggered.push('Hemoptysis / Acute gastrointestinal hemorrhage');
  }

  const isEmergency = triggered.length > 0;

  const adviceEn = isEmergency
    ? 'CRITICAL RED FLAG: Call 999 immediately or attend the nearest NHS A&E (Emergency Department). Do not wait for a routine appointment.'
    : 'No acute emergency red flags detected based on current reported symptoms.';

  let advicePatient = adviceEn;
  if (isEmergency) {
    switch (langCode) {
      case 'es':
        advicePatient = 'ALERTA DE EMERGENCIA: Llame al 999 de inmediato o acuda al departamento de Urgencias (A&E) más cercano. No espere.';
        break;
      case 'pl':
        advicePatient = 'ALARM ZAGROŻENIA ŻYCIA: Zadzwoń natychmiast pod 999 lub udaj się na najbliższy Szpitalny Oddział Ratunkowy (A&E).';
        break;
      case 'uk':
        advicePatient = 'ТЕРМІНОВА НЕБЕЗПЕКА: Негайно зателефонуйте за номером 999 або зверніться до найближчого відділення невідкладної допомоги (A&E).';
        break;
      case 'ar':
        advicePatient = 'تحذير طوارئ عاجل: اتصل بالرقم 999 فوراً أو توجه إلى أقرب قسم طوارئ (A&E) في المستشفى.';
        break;
      case 'pa':
        advicePatient = 'ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ: ਤੁਰੰਤ 999 ਤੇ ਕਾਲ ਕਰੋ ਜਾਂ ਨੇੜਲੇ ਹਸਪਤਾਲ ਐਮਰਜੈਂਸੀ (A&E) ਵਿਖੇ ਜਾਓ।';
        break;
      case 'ro':
        advicePatient = 'ALERTĂ DE URGENȚĂ: Sunați imediat la 999 sau mergeți la cel mai apropiat departament de primiri urgențe (A&E).';
        break;
      default:
        advicePatient = adviceEn;
    }
  }

  return {
    detected: isEmergency,
    severityLevel: isEmergency ? 'EMERGENCY_999' : 'NONE',
    symptomsTriggered: triggered,
    recommendation: adviceEn,
    recommendationInPatientLang: advicePatient,
  };
}

/**
 * Match patient speech or text against clinical concepts in SNOMED CT.
 * Simulates MongoDB Atlas Vector Search + Hybrid text match.
 */
export function groundLayTermsToSNOMED(
  text: string,
  langCode: string
): SNOMEDGrounding[] {
  const lower = text.toLowerCase();
  const matched: SNOMEDGrounding[] = [];

  for (const entry of SNOMED_CATALOG) {
    let bestScore = 0;
    let matchedPatientPhrase = '';
    let plainExpPatient = entry.plainEnglishExplanation;

    // Check English terms
    const engPhrases = entry.englishLayPhrase.split(' / ');
    for (const phrase of engPhrases) {
      if (lower.includes(phrase.toLowerCase())) {
        bestScore = Math.max(bestScore, 0.95);
        matchedPatientPhrase = phrase;
      }
    }

    // Check language-specific phrases
    const langData = entry.multilingual[langCode];
    if (langData) {
      plainExpPatient = langData.plainExplanation;
      for (const phrase of langData.layPhrases) {
        if (lower.includes(phrase.toLowerCase())) {
          bestScore = Math.max(bestScore, 0.98);
          matchedPatientPhrase = phrase;
        }
      }
    }

    // If partial overlap or broad symptom match
    if (bestScore === 0) {
      const keywords = entry.snomedPreferredTerm.toLowerCase().split(/[ /]+/);
      const hitCount = keywords.filter((kw) => kw.length > 3 && lower.includes(kw)).length;
      if (hitCount > 0) {
        bestScore = 0.65 + hitCount * 0.1;
        matchedPatientPhrase = keywords.find((kw) => lower.includes(kw)) || entry.englishLayPhrase;
      }
    }

    if (bestScore > 0.6) {
      matched.push({
        id: `sn-${entry.snomedConceptId}`,
        patientPhrase: matchedPatientPhrase || entry.englishLayPhrase,
        patientLanguage: langCode,
        englishLayPhrase: entry.englishLayPhrase,
        snomedConceptId: entry.snomedConceptId,
        snomedPreferredTerm: entry.snomedPreferredTerm,
        icd10Code: entry.icd10Code,
        clinicalCategory: entry.clinicalCategory,
        plainExplanation: entry.plainEnglishExplanation,
        plainExplanationInPatientLang: plainExpPatient,
        matchScore: Number(bestScore.toFixed(2)),
        source: 'snomed-ct-catalog',
      });
    }
  }

  // If no match found from specific keywords, provide a safe fallback grounding
  if (matched.length === 0 && text.trim().length > 3) {
    matched.push({
      id: 'sn-general',
      patientPhrase: text.slice(0, 40) + '...',
      patientLanguage: langCode,
      englishLayPhrase: 'Unspecified discomfort / physical symptom',
      snomedConceptId: '418107008',
      snomedPreferredTerm: 'Symptom and sign (finding)',
      icd10Code: 'R68.89',
      clinicalCategory: 'Finding',
      plainExplanation: 'General physical symptom reported by patient requiring clinical assessment.',
      plainExplanationInPatientLang: 'Ogólny objaw zgłoszony przez pacjenta wymagający badania lekarskiego.',
      matchScore: 0.72,
      source: 'snomed-ct-catalog',
    });
  }

  return matched;
}
