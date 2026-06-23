export const formatDisplayName = (fullName) => {
  if (!fullName) return '익명';
  
  // 공백 제거 (예: "세찬 김" -> "세찬김")
  let name = fullName.replace(/\s+/g, '');
  
  // 한국의 흔한 성씨 모음
  const commonLastNames = "김이박최정강조윤장임한오서신권황안송전홍유고문양손배백허남심노하곽성차주우구라나민진지엄채원천방공현함변염여추도소석선설마길연위표명기반왕금옥육인맹제모탁국어은편용";
  
  if (name.length >= 3) {
    const firstChar = name[0];
    const lastChar = name[name.length - 1];
    
    // "세찬김" 처럼 맨 뒤가 성씨고, 맨 앞은 성씨가 아닌 경우 -> 성씨를 제외한 이름만 반환
    if (commonLastNames.includes(lastChar) && !commonLastNames.includes(firstChar)) {
      return name.substring(0, name.length - 1);
    }
    // "김세찬" 처럼 맨 앞이 성씨인 경우 -> 맨 앞 글자를 제외한 이름만 반환
    if (commonLastNames.includes(firstChar)) {
      return name.substring(1);
    }
  }
  
  return name;
};
