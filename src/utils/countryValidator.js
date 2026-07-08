import countries from 'i18n-iso-countries'
import koLocale from 'i18n-iso-countries/langs/ko.json'

// Register Korean locale
countries.registerLocale(koLocale)

// Dictionary for common alternative names and aliases
export const COUNTRY_ALIASES = {
  "AD": ["안도라"],
  "AE": ["아랍에미리트", "아랍에미레이트"],
  "AF": ["아프가니스탄"],
  "AG": ["안티구아 바부다", "안티구아바부다"],
  "AL": ["알바니아"],
  "AM": ["아르메니아"],
  "AO": ["앙골라"],
  "AR": ["아르헨티나"],
  "AT": ["오스트리아"],
  "AU": ["오스트레일리아", "호주"],
  "AZ": ["아제르바이잔"],
  "BA": ["보스니아 헤르체고비나", "보스니아헤르체고비나"],
  "BB": ["바베이도스"],
  "BD": ["방글라데시"],
  "BE": ["벨기에"],
  "BF": ["부르키나파소"],
  "BG": ["불가리아"],
  "BH": ["바레인"],
  "BI": ["부룬디"],
  "BJ": ["베냉"],
  "BN": ["브루나이"],
  "BO": ["볼리비아"],
  "BR": ["브라질"],
  "BS": ["바하마"],
  "BT": ["부탄"],
  "BW": ["보츠와나"],
  "BY": ["벨라루스"],
  "BZ": ["벨리즈"],
  "CA": ["캐나다"],
  "CD": ["콩고 민주 공화국", "콩고민주공화국"],
  "CF": ["중앙 아프리카", "중앙아프리카"],
  "CG": ["콩고"],
  "CH": ["스위스"],
  "CI": ["코트디부아르"],
  "CL": ["칠레"],
  "CM": ["카메룬"],
  "CN": ["중국", "중화인민공화국"],
  "CO": ["콜롬비아"],
  "CR": ["코스타리카"],
  "CU": ["쿠바"],
  "CV": ["카보 베르데", "카보베르데"],
  "CY": ["사이프러스"],
  "CZ": ["체코", "체코 공화국", "체코공화국"],
  "DE": ["독일"],
  "DJ": ["지부티"],
  "DK": ["덴마크"],
  "DM": ["도미니카 연방", "도미니카연방"],
  "DO": ["도미니카 공화국", "도미니카공화국"],
  "DZ": ["알제리"],
  "EC": ["에콰도르"],
  "EE": ["에스토니아"],
  "EG": ["이집트"],
  "ER": ["에리트레아"],
  "ES": ["스페인", "에스파냐"],
  "ET": ["이디오피아", "에티오피아"],
  "FI": ["핀란드"],
  "FJ": ["피지"],
  "FM": ["미크로네시아"],
  "FR": ["프랑스", "불란서"],
  "GA": ["가봉"],
  "GB": ["영국", "잉글랜드", "영란"],
  "GD": ["그레나다"],
  "GE": ["그루지아", "조지아"],
  "GH": ["가나"],
  "GM": ["감비아"],
  "GN": ["기니"],
  "GQ": ["적도 기니", "적도기니"],
  "GR": ["그리스"],
  "GT": ["과테말라"],
  "GW": ["기네비쏘", "기니비사우"],
  "GY": ["가이아나"],
  "HN": ["온두라스"],
  "HR": ["크로아티아"],
  "HT": ["아이티"],
  "HU": ["헝가리"],
  "ID": ["인도네시아"],
  "IE": ["아일랜드"],
  "IL": ["이스라엘"],
  "IN": ["인도"],
  "IQ": ["이라크"],
  "IR": ["이란"],
  "IS": ["아이슬란드"],
  "IT": ["이탈리아", "이태리"],
  "JM": ["자메이카"],
  "JO": ["요르단"],
  "JP": ["일본", "일본국"],
  "KE": ["케냐"],
  "KG": ["키르키즈스탄"],
  "KH": ["캄보디아"],
  "KI": ["키르바시", "키리바시"],
  "KM": ["코모로"],
  "KN": ["세인트 키츠 네비스", "세인트키츠네비스"],
  "KP": ["북한", "북조선", "조선민주주의인민공화국"],
  "KR": ["대한민국", "한국", "남한"],
  "KW": ["쿠웨이트"],
  "KZ": ["카자흐스탄", "카지흐스탄", "카자호스탄"],
  "LA": ["라오스"],
  "LB": ["레바논"],
  "LC": ["세인트 루시아", "세인트루시아"],
  "LI": ["리히텐슈타인"],
  "LK": ["스리랑카"],
  "LR": ["라이베리아"],
  "LS": ["레소토"],
  "LT": ["리투아니아"],
  "LU": ["룩셈부르크"],
  "LV": ["라트비아"],
  "LY": ["리비아"],
  "MA": ["모로코"],
  "MC": ["모나코"],
  "MD": ["몰도바"],
  "ME": ["몬테네그로"],
  "MG": ["마다가스카르"],
  "MH": ["마샬 군도", "마샬군도"],
  "MK": ["마케도니아"],
  "ML": ["말리"],
  "MM": ["미안마", "미얀마", "버마"],
  "MN": ["몽골", "몽고"],
  "MR": ["모리타니"],
  "MT": ["몰타"],
  "MU": ["모리셔스"],
  "MV": ["몰디브"],
  "MW": ["말라위"],
  "MX": ["멕시코"],
  "MY": ["말레이시아"],
  "MZ": ["모잠비크"],
  "NA": ["나미비아"],
  "NE": ["니제르"],
  "NG": ["나이지리아"],
  "NI": ["니카라과"],
  "NL": ["네덜란드", "네델란드", "홀란드"],
  "NO": ["노르웨이"],
  "NP": ["네팔"],
  "NR": ["나우루"],
  "NZ": ["뉴질랜드"],
  "OM": ["오만"],
  "PA": ["파나마"],
  "PE": ["페루"],
  "PG": ["파푸아 뉴기니", "파푸아뉴기니"],
  "PH": ["필리핀"],
  "PK": ["파키스탄"],
  "PL": ["폴란드"],
  "PS": ["팔레스타인"],
  "PT": ["포르투갈", "포르투칼"],
  "PW": ["팔라우"],
  "PY": ["파라과이"],
  "QA": ["카타르"],
  "RO": ["루마니아"],
  "RS": ["세르비아"],
  "RU": ["러시아", "러시아연방", "러시아 연방"],
  "RW": ["르완다"],
  "SA": ["사우디아라비아"],
  "SB": ["솔로몬 아일랜드", "솔로몬아일랜드"],
  "SC": ["세이셸"],
  "SD": ["수단"],
  "SE": ["스웨덴"],
  "SG": ["싱가포르", "싱가폴"],
  "SI": ["슬로베니아"],
  "SK": ["슬로바키아"],
  "SL": ["시에라 리온", "시에라리온"],
  "SM": ["산 마리노", "산마리노"],
  "SN": ["세네갈"],
  "SO": ["소말리아"],
  "SR": ["수리남"],
  "SS": ["남수단"],
  "ST": ["상토메프린시페"],
  "SV": ["엘살바도르"],
  "SY": ["시리아"],
  "SZ": ["스와질란드", "에스와티니"],
  "TD": ["차드"],
  "TG": ["토고"],
  "TH": ["태국", "타이"],
  "TJ": ["타지키스탄"],
  "TL": ["동티모르"],
  "TM": ["트르크메니스탄", "투르크메니스탄"],
  "TN": ["튀니지아", "튀니지"],
  "TO": ["통가"],
  "TR": ["튀르키예", "터키"],
  "TT": ["트리니다드 토바고", "트리니다드토바고"],
  "TV": ["투발루"],
  "TW": ["대만", "대만(타이페이)", "타이페이", "타이완"],
  "TZ": ["탄자니아"],
  "UA": ["우크라이나"],
  "UG": ["우간다"],
  "US": ["미국", "미합중국", "아메리카"],
  "UY": ["우루과이"],
  "UZ": ["우즈베키스탄"],
  "VA": ["바티칸", "바티칸시국", "바티칸 시국"],
  "VC": ["세인트 빈센트 그레나딘", "세인트빈센트그레나딘"],
  "VE": ["베네수엘라"],
  "VN": ["베트남", "월남"],
  "VU": ["바누아투"],
  "WS": ["사모아"],
  "XK": ["코소보"],
  "YE": ["예멘"],
  "ZA": ["남아프리카 공화국", "남아프리카공화국", "남아공"],
  "ZM": ["잠비아"],
  "ZW": ["짐바브웨 공화국", "짐바브웨공화국", "짐바브웨"],
  "AQ": ["남극", "남극대륙"],

  // Oceans (ocean_linkId)
  "ocean_pacific": ["태평양", "북태평양", "남태평양"],
  "ocean_atlantic": ["대서양", "북대서양", "남대서양"],
  "ocean_indian": ["인도양"],
  "ocean_arctic": ["북극해", "북극 바다"],
  "ocean_antarctic": ["남극해", "남극 바다"],

  // Continents (continent_linkId)
  "continent_asia": ["아시아", "아시아대륙"],
  "continent_europe": ["유럽", "유럽대륙"],
  "continent_africa": ["아프리카", "아프리카대륙"],
  "continent_north_america": ["북아메리카", "북미", "북아메리카대륙"],
  "continent_south_america": ["남아메리카", "남미", "남아메리카대륙"],
  "continent_oceania": ["오세아니아", "오세아니아대륙", "호주대륙"],
  "continent_antarctica": ["남극", "남극대륙"],

  // Polar regions
  "polar_arctic": ["북극", "북극지방", "북극권"]
};

/**
 * Normalizes a string by removing whitespace and converting to lowercase.
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toString().trim().replace(/\s+/g, '').toLowerCase();
}

/**
 * Validates if the user input matches the official name or aliases of the target country/ocean/continent.
 * @param {string} inputName - The name entered by the user.
 * @param {string} targetId - The ID of the clicked target (e.g. "KR", "ocean_pacific", "continent_asia").
 * @returns {boolean} True if the input name matches the expected name.
 */
export function validateCountryName(inputName, targetId) {
  if (!inputName || !targetId) return false;

  const normalizedInput = normalizeString(inputName);

  // 1. Check custom aliases
  const aliases = COUNTRY_ALIASES[targetId] || [];
  for (const alias of aliases) {
    if (normalizeString(alias) === normalizedInput) {
      return true;
    }
  }

  // 2. Check standard i18n-iso-countries database (if targetId is a 2-letter ISO country code)
  // 사용자의 요청("지금 올리는 것으로 교체, 불필요한 부분 제거")에 따라 표준 데이터베이스 자동 정답 매핑은 제거합니다.
  /*
  if (targetId.length === 2 && targetId !== 'AQ') {
    const officialKo = countries.getName(targetId, "ko");
    const officialEn = countries.getName(targetId, "en");

    if (officialKo && normalizeString(officialKo) === normalizedInput) {
      return true;
    }
    if (officialEn && normalizeString(officialEn) === normalizedInput) {
      return true;
    }
  }
  */

  return false;
}
