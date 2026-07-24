function PlaceholderScreen() {
  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px', color: '#1a1a1a' }}>
        다음 단계 준비 중
      </h1>
      <p style={{ fontSize: 15, color: '#666', margin: 0 }}>
        목표 선택 화면이 여기에 들어올 예정이에요.
      </p>
    </div>
  )
}

export default PlaceholderScreen
