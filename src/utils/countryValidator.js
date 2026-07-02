import countries from 'i18n-iso-countries'
import koLocale from 'i18n-iso-countries/langs/ko.json'

// Register Korean locale
countries.registerLocale(koLocale)

// Dictionary for common alternative names and aliases
const COUNTRY_ALIASES = {
  // Countries (ISO2 Code)
  "KR": ["한국", "남한", "코리아", "대한민국", "korea", "south korea"],
  "US": ["미국", "미합중국", "아메리카", "미국령", "usa", "united states", "america"],
  "GB": ["영국", "잉글랜드", "영란", "uk", "united kingdom", "england", "great britain"],
  "NL": ["네덜란드", "네델란드", "홀란드", "netherlands", "holland"],
  "AE": ["아랍에미리트", "아랍에미레이트", "uae", "united arab emirates"],
  "DE": ["독일", "도이칠란드", "도이칠란트", "germany", "deutschland"],
  "RU": ["러시아", "러시아연방", "러시아 연방", "russia", "russian federation"],
  "KP": ["북한", "북조선", "조선민주주의인민공화국", "north korea", "dprk"],
  "JP": ["일본", "일본국", "japan"],
  "CN": ["중국", "중화인민공화국", "중공", "china"],
  "FR": ["프랑스", "불란서", "france"],
  "IT": ["이탈리아", "이태리", "italy", "italia"],
  "ES": ["스페인", "에스파냐", "spain", "espana"],
  "CA": ["캐나다", "canada"],
  "AU": ["호주", "오스트레일리아", "australia"],
  "IN": ["인도", "india"],
  "BR": ["브라질", "brazil", "brasil"],
  "MX": ["멕시코", "mexico"],
  "NZ": ["뉴질랜드", "new zealand"],
  "CH": ["스위스", "switzerland", "swiss"],
  "SE": ["스웨덴", "sweden"],
  "NO": ["노르웨이", "norway"],
  "FI": ["핀란드", "finland"],
  "DK": ["덴마크", "denmark"],
  "PL": ["폴란드", "poland"],
  "UA": ["우크라이나", "ukraine"],
  "TR": ["터키", "튀르키예", "turkey", "turkiye"],
  "EG": ["이집트", "egypt"],
  "ZA": ["남아프리카공화국", "남아공", "south africa"],
  "SA": ["사우디아라비아", "사우디 아라비아", "사우디", "saudi arabia", "saudi"],
  "VN": ["베트남", "월남", "vietnam"],
  "PH": ["필리핀", "philippines"],
  "TH": ["태국", "타이", "thailand"],
  "MY": ["말레이시아", "malaysia"],
  "SG": ["싱가포르", "싱가폴", "singapore"],
  "ID": ["인도네시아", "indonesia"],
  "PK": ["파키스탄", "pakistan"],
  "BD": ["방글라데시", "bangladesh"],
  "IL": ["이스라엘", "israel"],
  "IR": ["이란", "iran"],
  "IQ": ["이라크", "iraq"],
  "KH": ["캄보디아", "cambodia"],
  "LA": ["라오스", "laos"],
  "MM": ["미얀마", "버마", "myanmar"],
  "MN": ["몽골", "몽고", "mongolia"],
  "NP": ["네팔", "nepal"],
  "LK": ["스리랑카", "sri lanka"],
  "KZ": ["카자흐스탄", "kazakhstan"],
  "UZ": ["우즈베키스탄", "uzbekistan"],
  "AR": ["아르헨티나", "argentina"],
  "CL": ["칠레", "chile"],
  "CO": ["콜롬비아", "colombia"],
  "PE": ["페루", "peru"],
  "VE": ["베네수엘라", "venezuela"],
  "CU": ["쿠바", "cuba"],
  "AQ": ["남극", "남극대륙", "antarctica"],

  // Oceans (ocean_linkId)
  "ocean_pacific": ["태평양", "pacific ocean", "pacific", "북태평양", "남태평양"],
  "ocean_atlantic": ["대서양", "atlantic ocean", "atlantic", "북대서양", "남대서양"],
  "ocean_indian": ["인도양", "indian ocean", "indian"],
  "ocean_arctic": ["북극해", "arctic ocean", "북극 바다", "arctic"],
  "ocean_antarctic": ["남극해", "southern ocean", "antarctic ocean", "남극 바다"],

  // Continents (continent_linkId)
  "continent_asia": ["아시아", "asia", "아시아대륙"],
  "continent_europe": ["유럽", "europe", "유럽대륙"],
  "continent_africa": ["아프리카", "africa", "아프리카대륙"],
  "continent_north_america": ["북아메리카", "북미", "north america", "북아메리카대륙"],
  "continent_south_america": ["남아메리카", "남미", "south america", "남아메리카대륙"],
  "continent_oceania": ["오세아니아", "oceania", "오세아니아대륙", "호주대륙"],
  "continent_antarctica": ["남극", "남극대륙", "antarctica"],

  // Polar regions
  "polar_arctic": ["북극", "북극지방", "북극권", "arctic"]
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

  return false;
}
