export default function GenericLoading() {
  return (
    <div style={{ padding: '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <div className="sk" style={{ width: 160, height: 24, borderRadius: 6, marginBottom: 8 }} />
          <div className="sk" style={{ width: 100, height: 14, borderRadius: 4 }} />
        </div>
        <div className="sk" style={{ width: 120, height: 38, borderRadius: 10 }} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[200, 140, 170].map((w, i) => (
          <div key={i} className="sk" style={{ width: w, height: 34, borderRadius: 10 }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ background: 'white', border: '1px solid #f3f4f6', borderRadius: 12, padding: 20 }}>
            <div className="sk" style={{ width: '70%', height: 16, borderRadius: 4, marginBottom: 12 }} />
            <div className="sk" style={{ width: '50%', height: 12, borderRadius: 4, marginBottom: 8 }} />
            <div className="sk" style={{ width: '90%', height: 12, borderRadius: 4, marginBottom: 16 }} />
            <div className="sk" style={{ width: 80, height: 26, borderRadius: 20 }} />
          </div>
        ))}
      </div>
      <style>{`
        .sk { background: linear-gradient(90deg, #f3f4f6 25%, #e9ebee 50%, #f3f4f6 75%); background-size: 200% 100%; animation: sk 1.4s infinite; }
        @keyframes sk { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </div>
  )
}
