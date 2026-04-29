'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'

type FilaLead = {
  nombre: string
  telefono: string
  dni?: string
  email?: string
  mensaje?: string
}

type ResultadoImportacion = {
  importados: number
  duplicados: number
  errores: number
}

type Importacion = {
  id: string
  nombreArchivo: string
  totalImportados: number
  totalDuplicados: number
  totalErrores: number
  creadoEn: string
}

export default function ImportarLeadsPage() {
  const [filas, setFilas] = useState<FilaLead[]>([])
  const [archivo, setArchivo] = useState<string>('')
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importaciones, setImportaciones] = useState<Importacion[]>([])
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const cargarImportaciones = useCallback(async () => {
    const res = await fetch('/api/importaciones')
    if (res.ok) setImportaciones(await res.json())
  }, [])

  useEffect(() => { cargarImportaciones() }, [cargarImportaciones])

  function procesarArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setArchivo(file.name)
    setResultado(null)
    setError(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const hoja = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(hoja)

        const leads: FilaLead[] = json
          .map(row => {
            const get = (posibles: string[]) => {
              for (const p of posibles) {
                const key = Object.keys(row).find(k => k.toLowerCase().trim().includes(p))
                if (key && row[key]) return String(row[key]).trim()
              }
              return undefined
            }

            return {
              nombre: get(['nombre', 'name', 'cliente']) ?? '',
              telefono: get(['telefono', 'teléfono', 'phone', 'tel', 'celular', 'numero telefonico', 'número telefónico']) ?? '',
              dni: get(['dni', 'documento', 'doc', 'cedula', 'cédula']),
              email: get(['email', 'mail', 'correo']),
              mensaje: get(['mensaje', 'nota', 'descripcion', 'descripción', 'observacion']),
            }
          })
          .filter(l => l.nombre && l.telefono)

        setFilas(leads)
      } catch {
        setError('No se pudo leer el archivo. Asegurate de que sea un .xlsx o .csv válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function importar() {
    if (filas.length === 0) return
    setCargando(true)
    setError(null)

    try {
      const res = await fetch('/api/leads/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filas, nombreArchivo: archivo }),
      })

      if (!res.ok) throw new Error('Error en el servidor')

      const { importados, duplicados, errores } = await res.json()
      setResultado({ importados, duplicados, errores })
    } catch {
      setError('Error al importar. Intentá de nuevo.')
    }

    setFilas([])
    setArchivo('')
    if (inputRef.current) inputRef.current.value = ''
    setCargando(false)
    cargarImportaciones()
  }

  async function eliminarImportacion(id: string) {
    setEliminando(id)
    await fetch(`/api/importaciones/${id}`, { method: 'DELETE' })
    setImportaciones(prev => prev.filter(i => i.id !== id))
    setEliminando(null)
    setConfirmandoEliminar(null)
  }

  return (
    <div style={{ padding: '40px 48px', background: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Importar leads desde Excel</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>
          Subí un archivo .xlsx o .csv con tu base de clientes. El sistema asignará los leads automáticamente entre los agentes.
        </p>
      </div>

      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Instrucciones */}
        <div style={{ background: '#eff6ff', borderRadius: 14, border: '1px solid #bfdbfe', padding: '20px 24px' }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1d4ed8', margin: '0 0 10px' }}>Formato esperado del archivo</p>
          <p style={{ fontSize: 13, color: '#374151', margin: '0 0 8px' }}>El archivo debe tener columnas con estos nombres (no importa el orden ni las mayúsculas):</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['nombre', 'telefono', 'dni (opcional)', 'email (opcional)', 'mensaje (opcional)'].map(col => (
              <span key={col} style={{ fontSize: 12, background: 'white', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: 20, color: '#1d4ed8', fontWeight: 500 }}>
                {col}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '12px 0 0' }}>
            Los teléfonos duplicados no se importan dos veces — el sistema los detecta automáticamente.
          </p>
        </div>

        {/* Upload */}
        <div style={{ background: 'white', borderRadius: 14, border: '2px dashed #e5e7eb', padding: '32px', textAlign: 'center' }}>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={procesarArchivo}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
              {archivo || 'Hacé click para seleccionar un archivo'}
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
              Formatos soportados: .xlsx, .xls, .csv
            </p>
          </label>
        </div>

        {/* Preview */}
        {filas.length > 0 && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                Vista previa — {filas.length} leads detectados
              </p>
            </div>
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Nombre', 'Teléfono', 'DNI', 'Email', 'Mensaje'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filas.slice(0, 20).map((f, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f9fafb' }}>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#111827' }}>{f.nombre}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151' }}>{f.telefono}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#6b7280' }}>{f.dni ?? '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#6b7280' }}>{f.email ?? '—'}</td>
                      <td style={{ padding: '10px 16px', fontSize: 13, color: '#6b7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.mensaje ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filas.length > 20 && (
                <p style={{ fontSize: 12, color: '#9ca3af', padding: '10px 16px', margin: 0 }}>
                  + {filas.length - 20} filas más...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Resultado */}
        {resultado && (
          <div style={{ background: '#f0fdf4', borderRadius: 14, border: '1px solid #bbf7d0', padding: '20px 24px' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#15803d', margin: '0 0 12px' }}>✅ Importación completada</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>Importados</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#15803d', margin: 0 }}>{resultado.importados}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>Duplicados (ignorados)</p>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#a16207', margin: 0 }}>{resultado.duplicados}</p>
              </div>
              {resultado.errores > 0 && (
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>Errores</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#dc2626', margin: 0 }}>{resultado.errores}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', borderRadius: 14, border: '1px solid #fecaca', padding: '16px 20px' }}>
            <p style={{ fontSize: 14, color: '#dc2626', margin: 0 }}>{error}</p>
          </div>
        )}

        {filas.length > 0 && (
          <button
            onClick={importar}
            disabled={cargando}
            style={{
              background: cargando ? '#9ca3af' : '#111827',
              color: 'white', border: 'none', borderRadius: 12,
              padding: '14px', fontSize: 15, fontWeight: 600,
              cursor: cargando ? 'not-allowed' : 'pointer',
            }}
          >
            {cargando ? `Importando... (${filas.length} leads)` : `Importar ${filas.length} leads →`}
          </button>
        )}

        {/* Historial de importaciones */}
        {importaciones.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 12px' }}>Importaciones anteriores</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {importaciones.map(imp => (
                <div key={imp.id} style={{
                  background: 'white', borderRadius: 12, border: '1px solid #f3f4f6',
                  padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {imp.nombreArchivo}
                    </p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                      {new Date(imp.creadoEn).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>+{imp.totalImportados}</span>
                      {imp.totalDuplicados > 0 && (
                        <span style={{ fontSize: 12, color: '#a16207', fontWeight: 500 }}>{imp.totalDuplicados} dup.</span>
                      )}
                      {imp.totalErrores > 0 && (
                        <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 500 }}>{imp.totalErrores} err.</span>
                      )}
                    </div>
                    {confirmandoEliminar === imp.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, color: '#374151' }}>¿Eliminás?</span>
                        <button
                          onClick={() => eliminarImportacion(imp.id)}
                          disabled={eliminando === imp.id}
                          style={{
                            background: '#dc2626', border: 'none', borderRadius: 8,
                            padding: '5px 10px', fontSize: 12, color: 'white', fontWeight: 600,
                            cursor: eliminando === imp.id ? 'not-allowed' : 'pointer',
                            opacity: eliminando === imp.id ? 0.5 : 1,
                          }}
                        >
                          {eliminando === imp.id ? '...' : 'Sí, eliminar'}
                        </button>
                        <button
                          onClick={() => setConfirmandoEliminar(null)}
                          style={{
                            background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
                            padding: '5px 10px', fontSize: 12, color: '#6b7280', cursor: 'pointer',
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmandoEliminar(imp.id)}
                        style={{
                          background: 'none', border: '1px solid #fecaca', borderRadius: 8,
                          padding: '5px 10px', fontSize: 12, color: '#dc2626', cursor: 'pointer',
                        }}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
