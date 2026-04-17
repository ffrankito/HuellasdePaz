'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import Link from 'next/link'

type EstadoLead = 'nuevo' | 'contactado' | 'interesado' | 'cotizado' | 'convertido' | 'perdido'

type Lead = {
  id: string
  nombre: string
  telefono: string
  email: string | null
  origen: string | null
  estado: EstadoLead
  creadoEn: string
}

const columnas: { id: EstadoLead; label: string; color: string }[] = [
  { id: 'nuevo', label: 'Nuevo', color: '#1d4ed8' },
  { id: 'contactado', label: 'Contactado', color: '#15803d' },
  { id: 'interesado', label: 'Interesado', color: '#a16207' },
  { id: 'cotizado', label: 'Cotizado', color: '#7e22ce' },
  { id: 'convertido', label: 'Convertido', color: '#15803d' },
  { id: 'perdido', label: 'Perdido', color: '#dc2626' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => { setLeads(data); setLoading(false) })
  }, [])

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const leadId = result.draggableId
    const nuevoEstado = result.destination.droppableId as EstadoLead
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, estado: nuevoEstado } : l))
    await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', margin: 0 }}>Leads</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 0 }}>{leads.length} leads registrados</p>
        </div>
        <Link href="/dashboard/leads/nuevo" style={{
          background: '#111827', color: 'white', padding: '10px 20px',
          borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
        }}>
          + Nuevo lead
        </Link>
      </div>

      {loading ? (
        <p style={{ fontSize: 14, color: '#9ca3af' }}>Cargando...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, flex: 1, alignItems: 'start' }}>
            {columnas.map(col => {
              const leadsColumna = leads.filter(l => l.estado === col.id)
              return (
                <div key={col.id} style={{ minWidth: 200, flex: '0 0 200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '0 4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{col.label}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto', background: '#f3f4f6', padding: '1px 7px', borderRadius: 20 }}>{leadsColumna.length}</span>
                  </div>
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          minHeight: 200, background: snapshot.isDraggingOver ? '#f0f9ff' : '#f3f4f6',
                          borderRadius: 14, padding: 8, transition: 'background 0.15s',
                          display: 'flex', flexDirection: 'column', gap: 8,
                        }}
                      >
                        {leadsColumna.map((lead, index) => (
                          <Draggable key={lead.id} draggableId={lead.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  background: 'white', borderRadius: 12, padding: '14px 16px',
                                  border: '1px solid #f3f4f6',
                                  boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
                                  cursor: 'grab', ...provided.draggableProps.style,
                                }}
                              >
                                <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{lead.nombre}</p>
                                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>{lead.telefono}</p>
                                {lead.origen && (
                                  <span style={{ fontSize: 11, color: '#6b7280', background: '#f9fafb', padding: '3px 8px', borderRadius: 20, border: '1px solid #f3f4f6' }}>
                                    {lead.origen}
                                  </span>
                                )}
                                <Link
                                  href={`/dashboard/leads/${lead.id}`}
                                  style={{
                                    display: 'block', marginTop: 10, fontSize: 12, fontWeight: 600,
                                    color: '#1d4ed8', textDecoration: 'none', textAlign: 'center',
                                    background: '#eff6ff', padding: '6px', borderRadius: 8,
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  Ver detalle →
                                </Link>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}