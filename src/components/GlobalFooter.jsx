import { useState } from 'react'
import './GlobalFooter.css'

// Inline SVG for Help icon to prevent version mismatch errors
const HelpIcon = ({ size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export default function GlobalFooter({ inline = false }) {
  const [modalType, setModalType] = useState(null) // 'privacy' | 'terms' | 'help' | null

  // Environment variable loading with fallbacks
  const schoolName = import.meta.env.VITE_SCHOOL_NAME || '서울수색초등학교'
  const creatorName = import.meta.env.VITE_CREATOR_NAME || '김세찬'
  const contactEmail = 'gogh999@gmail.com'

  const openModal = (type) => setModalType(type)
  const closeModal = () => setModalType(null)

  return (
    <footer className={inline ? "" : "global-footer"}>
      <div className="footer-content" style={{ justifyContent: 'center', gap: inline ? '16px' : '20px', marginTop: inline ? '24px' : '0' }}>
        <button className="footer-link-btn" onClick={() => openModal('privacy')}>개인정보처리방침</button>
        <span className="footer-divider">{inline ? '·' : '•'}</span>
        <button className="footer-link-btn" onClick={() => openModal('terms')}>사용약관</button>
        <span className="footer-divider">{inline ? '·' : '•'}</span>
        <button className="footer-link-btn" onClick={() => openModal('help')} title="사용방법 안내">도움말</button>
      </div>

      {/* Modal Dialog overlay */}
      {modalType && (
        <div className="footer-modal-overlay" onClick={closeModal}>
          <div className="footer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'privacy' 
                  ? '🛡️ 개인정보처리방침' 
                  : modalType === 'terms' 
                  ? '📜 서비스 이용약관' 
                  : '🗺️ 백지도 탐험 가이드'}
              </h2>
              <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {modalType === 'privacy' && (
                <div className="policy-text">
                  <h3>1. 수집하는 개인정보 항목</h3>
                  <p>본 서비스는 로그인 및 교육 활동 참여를 위해 아래와 같은 정보를 수집합니다.</p>
                  <ul>
                    <li>구글 소셜 로그인 정보: 이메일 주소, 이름(닉네임), 프로필 이미지 URL</li>
                    <li>서비스 사용 데이터: 생성한 지도 정보, 국가/바다/대륙별 등록 명칭 및 활동 기록(노트)</li>
                  </ul>

                  <h3>2. 개인정보의 수집 및 이용 목적</h3>
                  <p>수집된 개인정보는 다음 목적 이외의 용도로 사용되지 않으며, 목적이 변경될 시에는 사전 동의를 구합니다.</p>
                  <ul>
                    <li>이용자 식별: 중복 계정 가입 및 오용 방지, 선생님과 학생 간 구별</li>
                    <li>서비스 기능 제공: 학생별 백지도 학습 현황 표시, 공동 편집 이력 관리</li>
                  </ul>

                  <h3>3. 개인정보의 보유 및 이용 기간</h3>
                  <p>본 서비스는 교육용 프로젝트 서비스로 사용 기간 동안 한시적으로 데이터를 보관합니다.</p>
                  <ul>
                    <li>이용자가 계정 삭제를 요청하거나 웹 서비스의 보관 목적이 다한 경우 지체 없이 파기합니다.</li>
                    <li>보존 기간: 회원 탈퇴 시 즉시 파기</li>
                  </ul>

                  <h3>4. 개인정보의 파기절차 및 방법</h3>
                  <p>개인정보는 이용 목적이 달성된 후 별도의 데이터 보관 프로세스 없이 데이터베이스에서 영구적으로 완전히 삭제(Hard Delete)됩니다.</p>

                  <h3>5. 개인정보 보호책임자 및 문의처</h3>
                  <p>개인정보 처리에 관한 문의 사항은 아래로 연락해 주시기 바랍니다.</p>
                  <p className="contact-info">이메일: <strong>{contactEmail}</strong></p>
                </div>
              )}
              {modalType === 'terms' && (
                <div className="terms-text">
                  <h3>1. 서비스 이용 조건</h3>
                  <p>본 서비스는 전국의 초등학교, 중학교 및 교육 기관의 사회, 지리 수업 목적을 위해 개발된 교육용 비상업적 웹 어플리케이션입니다. 누구나 회원가입 후 백지도 학습 및 제작 기능을 자유롭게 이용할 수 있습니다.</p>

                  <h3>2. 개발자 책임 범위</h3>
                  <ul>
                    <li>본 서비스는 '있는 그대로(AS-IS)' 제공되며, 예기치 않은 시스템 장애나 데이터베이스 유실로 인해 발생한 학습 기록 손실에 대해 개발자는 고의 또는 중과실이 없는 한 손해를 배상할 책임을 지지 않습니다.</li>
                    <li>학생들이 학습을 위해 자율적으로 등록한 정보(국가 이름, 설명 등)의 정확성 및 윤리적 적합성에 관한 책임은 전적으로 등록자 본인과 해당 지도를 관리하는 담당 교사에게 있습니다.</li>
                  </ul>

                  <h3>3. 이용자의 금지 행위</h3>
                  <p>안전하고 쾌적한 학습 환경을 위해 아래 사항을 엄격히 금지하며, 위반 시 관리자 및 선생님에 의해 데이터가 예고 없이 삭제되거나 이용이 제한될 수 있습니다.</p>
                  <ul>
                    <li>타인의 소셜 계정을 도용하거나 부정한 방법으로 접근하는 행위</li>
                    <li>국가 명칭 및 메모 작성 칸에 욕설, 비속어, 음란물, 광고성 스팸 또는 특정 개인/집단에 대한 혐오 표현을 게시하는 행위</li>
                    <li>고의로 시스템의 취약점을 탐색하거나 과도한 트래픽 유발 등 웹 서비스 운영을 방해하는 해킹 시도</li>
                  </ul>

                  <h3>4. 약관의 변경 및 안내</h3>
                  <p>약관 내용은 서비스 기능 개선과 정책 반영을 위해 예고 없이 변경될 수 있습니다. 이용자는 수시로 본 약관을 통해 변경 여부를 확인할 수 있습니다.</p>
                </div>
              )}
              {modalType === 'help' && (
                <div className="help-text">
                  <p className="help-welcome" style={{ marginBottom: '20px', fontSize: '15px' }}>
                    🗺️ 세계 백지도 탐험 서비스에 오신 것을 환영합니다! 아래 안내를 읽고 나만의 세계지도를 탐험해 보세요.
                  </p>

                  <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '6px', marginTop: '16px' }}>🔑 1. 로그인 및 입장</h3>
                  <p style={{ margin: '8px 0 16px' }}>첫 화면에서 <strong>'GOOGLE 로그인'</strong> 버튼을 클릭하여 소셜 계정으로 빠르고 안전하게 입장할 수 있습니다. 공유받은 개별 지도 링크를 통해 접속하시는 경우, 로그인 화면 하단에서 <strong>학생 이름만 입력</strong>하여 소셜 계정 없이 즉시 간편 입장도 가능합니다.</p>

                  <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '6px', marginTop: '16px' }}>🗺️ 2. 지명 맞추기 및 자동 검증</h3>
                  <p style={{ margin: '8px 0 16px' }}>지도에서 빈 지리적 영역(국가, 바다, 대륙)을 클릭하면 우측 정보 입력 패널이 열립니다. 띄어쓰기나 대소문자에 무관하게 보편적인 지명(예: 대한민국, 한국, 남한, Korea 등)과 공식 국문/영문 명칭이 모두 인식되도록 <strong>지명 자동 검증 시스템</strong>이 탑재되어 있습니다.</p>

                  <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '6px', marginTop: '16px' }}>👥 3. 백지도 공동 완성 규칙</h3>
                  <p style={{ margin: '8px 0 16px' }}>혼자 정답을 맞춘다고 지명이 공개되지 않으며, 반 친구들 **여러 명(설정된 기준 인원수 이상)**이 동일한 지명 정답을 함께 등록해야 해당 지역의 이름이 백지도 상에 선명하게 드러나 공개됩니다.</p>

                  <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '6px', marginTop: '16px' }}>📝 4. 탐험 노트 및 실시간 공유</h3>
                  <p style={{ margin: '8px 0 16px' }}>알맞은 이름을 맞춘 뒤, 해당 국가나 지역에 대해 스스로 조사한 지식, 문화, 역사 등의 흥미로운 정보를 메모로 적어 등록하면, 반 친구들과 실시간으로 공유하고 함께 학습할 수 있습니다.</p>

                  <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '6px', marginTop: '16px' }}>📊 5. 학습 진행 상황 모니터링</h3>
                  <p style={{ margin: '8px 0 16px' }}>오른쪽 사이드바 영역에서 지도의 <strong>누적 방문 횟수</strong> 및 완료한 지명 수와 전체 지명 수를 한눈에 볼 수 있는 <strong>완료율 게이지 바</strong>를 실시간으로 확인하면서 전체 지도를 탐험해 나갈 수 있습니다.</p>

                  <h3 style={{ borderBottom: '1px solid #282828', paddingBottom: '6px', marginTop: '16px' }}>⚠️ 6. 이용자 주의사항</h3>
                  <ul style={{ margin: '8px 0 16px', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '8px' }}>반 친구들이 함께 완성해 가는 지도이므로 장난식 기입이나 정확하지 않은 정보 등록은 피해주시기 바랍니다.</li>
                    <li style={{ marginBottom: '8px' }}>욕설, 비속어, 스팸 광고나 타인을 비방하는 표현을 작성할 경우, 담당 선생님 또는 시스템 관리자에 의해 <strong>예고 없이 영구 삭제 및 이용 제한</strong> 조치가 취해질 수 있습니다.</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-confirm-btn" onClick={closeModal}>확인</button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}
