export default function DashboardLoading() {
  return (
    <div style={{ padding: '24px', height: '100%' }}>

      {/* Header shimmer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="sk" style={{ width: 180, height: 24, borderRadius: 6, marginBottom: 8 }} />
          <div className="sk" style={{ width: 120, height: 14, borderRadius: 4 }} />
        </div>
        <div className="sk" style={{ width: 110, height: 36, borderRadius: 8 }} />
      </div>

      {/* Stat cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className="sk" style={{ width: 36, height: 36, borderRadius: 8 }} />
              <div className="sk" style={{ width: 48, height: 18, borderRadius: 4 }} />
            </div>
            <div className="sk" style={{ width: '60%', height: 28, borderRadius: 6, marginBottom: 8 }} />
            <div className="sk" style={{ width: '80%', height: 12, borderRadius: 4 }} />
          </div>
        ))}
      </div>

      {/* Second row — two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div className="sk" style={{ width: 130, height: 18, borderRadius: 5 }} />
              <div className="sk" style={{ width: 60, height: 18, borderRadius: 5 }} />
            </div>
            {[0, 1, 2, 3].map(j => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div className="sk" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="sk" style={{ width: '70%', height: 13, borderRadius: 4, marginBottom: 6 }} />
                  <div className="sk" style={{ width: '45%', height: 11, borderRadius: 4 }} />
                </div>
                <div className="sk" style={{ width: 60, height: 22, borderRadius: 12 }} />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Third row — wide panel */}
      <div style={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="sk" style={{ width: 150, height: 18, borderRadius: 5 }} />
          <div className="sk" style={{ width: 70, height: 18, borderRadius: 5 }} />
        </div>
        {[0, 1, 2].map(j => (
          <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div className="sk" style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="sk" style={{ width: '50%', height: 13, borderRadius: 4, marginBottom: 6 }} />
              <div className="sk" style={{ width: '30%', height: 11, borderRadius: 4 }} />
            </div>
            <div className="sk" style={{ width: 80, height: 22, borderRadius: 12 }} />
          </div>
        ))}
      </div>

      <style>{`
        .sk {
          background: linear-gradient(90deg, #f3f4f6 25%, #e9ebee 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
