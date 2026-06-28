import { useState } from 'react'
import './GlobalFooter.css'

// Inline SVG for GitHub icon to prevent version mismatch errors
const GithubIcon = ({ size = 16 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
)

export default function GlobalFooter() {
  const [modalType, setModalType] = useState(null) // 'privacy' | 'terms' | null

  // Environment variable loading with fallbacks
  const schoolName = import.meta.env.VITE_SCHOOL_NAME || '서울수색초등학교'
  const creatorName = import.meta.env.VITE_CREATOR_NAME || 'sota'
  const githubUrl = import.meta.env.VITE_GITHUB_URL || 'https://github.com/gogh9/WorldMap'
  const contactEmail = 'gogh9@susaek.sen.es.kr'

  const openModal = (type) => setModalType(type)
  const closeModal = () => setModalType(null)

  return (
    <footer className="global-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-school">🏫 {schoolName}</span>
          <span className="footer-divider">•</span>
          <span className="footer-creator">제작자: <strong>{creatorName}</strong></span>
        </div>

        <div className="footer-center">
          <button className="footer-link-btn" onClick={() => openModal('privacy')}>개인정보처리방침</button>
          <span className="footer-divider">•</span>
          <button className="footer-link-btn" onClick={() => openModal('terms')}>사용약관</button>
        </div>

        <div className="footer-right">
          <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="footer-github-link" title="GitHub Repository">
            <GithubIcon size={16} />
            <span>Open Source</span>
          </a>
        </div>
      </div>

      {/* Modal Dialog overlay */}
      {modalType && (
        <div className="footer-modal-overlay" onClick={closeModal}>
          <div className="footer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'privacy' ? '🛡️ 개인정보처리방침' : '📜 서비스 이용약관'}</h2>
              <button className="modal-close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              {modalType === 'privacy' ? (
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
              ) : (
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
