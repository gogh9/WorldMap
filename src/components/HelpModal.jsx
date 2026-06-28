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
              <p>첫 화면에서 <strong>'구글 계정으로 시작하기'</strong> 버튼을 클릭하여 소셜 계정으로 빠르고 안전하게 인증할 수 있습니다.</p>
            </div>

            {/* Core Features section */}
            <div className="guide-card">
              <div className="card-header-container">
                <Sparkles size={20} className="card-icon features-icon" />
                <h3>02. 주요 기능 안내</h3>
              </div>
              <ul>
                <li><strong>나라/바다/대륙 선택</strong>: 지도 상의 빈 백지도를 클릭하면 우측 패널에 상세 정보 입력 창이 뜹니다.</li>
                <li><strong>명칭 공동 등록</strong>: 여러 친구들이 입력한 이름이 설정된 기준 횟수만큼 누적되면, 백지도에 해당 국가명이 선명하게 공개됩니다!</li>
                <li><strong>탐험 노트 작성</strong>: 각 지역에 관한 흥미로운 상식이나 조사한 정보를 등록하고 공유하세요.</li>
              </ul>
            </div>

            {/* Precautions section */}
            <div className="guide-card">
              <div className="card-header-container">
                <AlertTriangle size={20} className="card-icon warnings-icon" />
                <h3>03. 이용자 주의사항</h3>
              </div>
              <ul>
                <li>교육 목적으로 함께 완성하는 지도입니다. 정확하지 않거나 장난식 정보는 지양해 주세요.</li>
                <li>비속어, 타인 비방, 광고 글을 작성할 경우, 관리자나 교사에 의해 글이 <strong>예고 없이 영구 삭제</strong>되거나 이용이 중지될 수 있습니다.</li>
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
