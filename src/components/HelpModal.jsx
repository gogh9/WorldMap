import { HelpCircle, LogIn, Sparkles, AlertTriangle } from 'lucide-react'
import './HelpModal.css'

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2><HelpCircle size={20} className="header-icon" /> 백지도 탐험 가이드 (User Guide)</h2>
          <button className="help-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="help-modal-body">
          <p className="help-welcome">🗺️ 세계 백지도 탐험 서비스에 오신 것을 환영합니다! 아래 사용법을 읽고 나만의 세계지도를 탐험해 보세요.</p>
          
          <div className="help-guide-grid">
            {/* Login section */}
            <div className="guide-card">
              <div className="card-header-container">
                <LogIn size={20} className="card-icon login-icon" />
                <h3>01. 로그인 방법</h3>
              </div>
              <p>첫 화면에서 <strong>'GOOGLE 로그인'</strong> 버튼을 클릭하여 소셜 계정으로 빠르고 안전하게 인증하거나, 지도 링크에 따라 학생 이름으로 직접 입장할 수 있습니다.</p>
            </div>

            {/* Core Features section */}
            <div className="guide-card">
              <div className="card-header-container">
                <Sparkles size={20} className="card-icon features-icon" />
                <h3>02. 주요 기능 안내</h3>
              </div>
              <ul>
                <li><strong>나라/바다/대륙 선택</strong>: 지도 상의 빈 백지도를 클릭하면 우측 패널에 이름을 입력할 수 있는 정보 창이 활성화됩니다.</li>
                <li><strong>명칭 공동 등록</strong>: 여러 친구들이 등록한 명칭 정답이 설정된 기준 횟수만큼 누적되면, 백지도에 해당 지명이 선명하게 공개됩니다!</li>
                <li><strong>탐험 노트 작성</strong>: 각 지역에 관한 흥미로운 지식이나 스스로 조사한 정보를 메모하여 반 친구들과 실시간으로 공유하고 학습해 보세요.</li>
              </ul>
            </div>

            {/* Precautions section */}
            <div className="guide-card">
              <div className="card-header-container">
                <AlertTriangle size={20} className="card-icon warnings-icon" />
                <h3>03. 이용자 주의사항</h3>
              </div>
              <ul>
                <li>반 친구들이 함께 완성해 가는 지도이므로 장난식 기입이나 정확하지 않은 정보 등록은 피해 주세요.</li>
                <li>욕설, 비속어, 광고성 글이나 비방하는 표현을 남길 경우, 담당 선생님이나 관리자에 의해 <strong>예고 없이 영구 삭제</strong> 및 이용 차단 조치가 될 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="help-modal-footer">
          <button className="help-confirm-btn" onClick={onClose}>탐험 시작하기</button>
        </div>
      </div>
    </div>
  )
}
