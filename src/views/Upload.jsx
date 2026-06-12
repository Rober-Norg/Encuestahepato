// src/views/Upload.jsx — Oleadas, drag & drop, delete por respuesta, PDF individual
import React, { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { C, Icon, Card, Badge, EmptyState, useIsMobile } from '../components/Shared.jsx'
import { QUESTION_BLOCKS } from '../data.js'

// Normaliza texto quitando tildes y pasando a minúsculas
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Keywords únicos por pregunta del formulario Google Forms (basado en Survey.jsx)
const SURVEY_HINTS = [
  { id:'p00h', kw:['hospital perteneces','a que hospital','que hospital perteneces'] },
  { id:'p00a', kw:['cual es su especialidad','cual es tu especialidad'] },
  { id:'p00b', kw:['comunidad autonoma donde ejerce','en que comunidad autonoma','comunidad autonoma ejerce'] },
  { id:'p00c', kw:['tipo de centro donde trabaja','tipo de centro en el que trabaja'] },
  { id:'p00d', kw:['pacientes con vhd tiene actualmente','cuantos pacientes con vhd'] },
  { id:'p00e', kw:['anos lleva atendiendo','hepatitis viral','cuantos anos lleva'] },
  { id:'p01a', kw:['testing sistematico de vhd en pacientes','vhb+ esta','el testing sistematico de vhd'] },
  { id:'p01b', kw:['donde cree que se pierden mas pacientes','se pierden mas pacientes con vhd'] },
  { id:'p01c', kw:['testando sistematicamente para vhd','escapando mas del sistema','cree que todos los pacientes con vhb'] },
  { id:'p02a', kw:['test de vhd esta protocolizado','vhd esta protocolizado','el test de vhd esta'] },
  { id:'p02b', kw:['reflex testing o double reflex','se utiliza reflex testing','double reflex'] },
  { id:'p02c', kw:['que falla mas en el proceso diagnostico','falla mas en el proceso'] },
  { id:'p02d', kw:['matiz sobre el diagnostico','anadir algun matiz sobre'] },
  { id:'p03a', kw:['hbsag positivo','en que punto se pierden mas pacientes hasta confirmar'] },
  { id:'p03b', kw:['porcentaje aproximado de sus pacientes vhb','vhb+ activos tiene el test de vhd'] },
  { id:'p03c', kw:['funnel diagnostico','donde se rompe el funnel','observacion sobre donde se rompe'] },
  { id:'p04a', kw:['como suelen llegarle los pacientes con vhd','suelen llegarle los pacientes con vhd'] },
  { id:'p04b', kw:['circuito claro de derivacion para pacientes','existe un circuito claro de derivacion'] },
  { id:'p04c', kw:['comentario sobre la derivacion','anadir algun comentario sobre la derivacion'] },
  { id:'p05a', kw:['estadio llegan habitualmente sus pacientes','en que estadio llegan habitualmente'] },
  { id:'p05b', kw:['comentario sobre el estadio de presentacion','estadio de presentacion'] },
  { id:'p06a', kw:['quien toma realmente la decision de iniciar','quien decide realmente iniciar tratamiento'] },
  { id:'p06b', kw:['medida se siente seguro tomando','siente seguro tomando la decision'] },
  { id:'p06c', kw:['comentario sobre la toma de decision'] },
  { id:'p07a', kw:['nivel de dificultad para acceder al tratamiento','calificaria el nivel de dificultad'] },
  { id:'p07b', kw:['barreras encuentra para iniciar tratamiento','que barreras encuentra para iniciar'] },
  { id:'p07c', kw:['cuanto tiempo pasa habitualmente desde que decide tratar','tiempo pasa habitualmente desde'] },
  { id:'p07d', kw:['describir con mas detalle las barreras de acceso','detalle las barreras de acceso'] },
  { id:'p08a', kw:['tipo de pacientes considera mas clara la indicacion','indicacion de tratamiento hoy'] },
  { id:'p08b', kw:['criterio de seleccion adicional'] },
  { id:'p09a', kw:['principal necesidad no cubierta actualmente en hepatitis','necesidad no cubierta actualmente'] },
  { id:'p09b', kw:['medida ayudaria mas a mejorar el manejo','que medida ayudaria mas a mejorar'] },
  { id:'p09c', kw:['cambiaria primero si tuviera los recursos','diria que es la principal necesidad no cubierta'] },
]

// Convierte respuestas del survey (p01a…p09c) al formato de análisis (b1_q1…b9_q15)
function mapSurveyToAnswers(raw) {
  const arr = v => Array.isArray(v) ? v.join('; ') : (v || '')
  return {
    b1_q1:  raw.p01c || arr(raw.p01b) || '',
    b1_q2:  arr(raw.p01b) || '',
    b2_q3:  raw.p02a || '',
    b2_q4:  raw.p02b || '',
    b2_q5:  raw.p02c || raw.p02d || '',
    b3_q6:  raw.p03a || raw.p03c || '',
    b4_q7:  arr(raw.p04a) || '',
    b4_q8:  raw.p04b || raw.p04c || '',
    b5_q9:  raw.p05a || raw.p05b || '',
    b6_q10: raw.p06a || raw.p06c || '',
    b7_q11: raw.p07a || '',
    b7_q12: [arr(raw.p07b), raw.p07d].filter(Boolean).join(' ').trim(),
    b8_q13: [arr(raw.p08a), raw.p08b].filter(Boolean).join(' ').trim(),
    b9_q14: raw.p09a || raw.p09c || '',
    b9_q15: raw.p09b || raw.p09c || '',
  }
}

export default function Upload({ waves, onAddWave, onDeleteWave, onDeleteResponse, onDownloadPDF }) {
  const [dragging, setDragging]       = useState(false)
  const [processing, setProcessing]   = useState(false)
  const [waveName, setWaveName]       = useState('')
  const [previewRows, setPreviewRows] = useState(null)
  const [pendingData, setPendingData] = useState(null)
  const [selectedWave, setSelectedWave] = useState(null)
  const [error, setError]             = useState('')
  const [expandedResp, setExpandedResp] = useState(null)
  const fileRef = useRef(null)
  const isMobile = useIsMobile()

  const parseExcel = useCallback((arrayBuffer) => {
    try {
      const wb    = XLSX.read(arrayBuffer, { type:'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows  = XLSX.utils.sheet_to_json(sheet, { header:1, defval:'' })
      if (rows.length < 2) return []
      const rawHeaders  = rows[0].map(h => String(h))
      const normHeaders = rawHeaders.map(norm)

      // ── Detectar formato Google Forms (encuesta de la app) ──────────────────
      // Mapea índice de columna → id de pregunta del survey (p00h … p09c)
      const surveyColMap = {}
      normHeaders.forEach((h, i) => {
        if (!h) return
        const hit = SURVEY_HINTS.find(hint => hint.kw.some(kw => h.includes(kw)))
        if (hit) surveyColMap[i] = hit.id
      })

      if (Object.keys(surveyColMap).length >= 4) {
        // Formato encuesta detectado: parsear con mapeo correcto
        const responses = []
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r]
          if (!row.some(v => String(v).trim())) continue
          const raw = {}
          Object.entries(surveyColMap).forEach(([ci, qid]) => {
            raw[qid] = String(row[Number(ci)] || '').trim()
          })
          responses.push({
            id: `imp_${Date.now()}_${r}`,
            wave: '',
            date: new Date().toISOString().split('T')[0],
            doctor: {
              nombre:       'Anónimo',
              hospital:     raw.p00h || '',
              region:       raw.p00b || '',
              especialidad: raw.p00a || '',
              tipocentro:   raw.p00c || '',
              numPacientes: raw.p00d || '',
              experiencia:  raw.p00e || '',
            },
            answers:          mapSurveyToAnswers(raw),
            structuredAnswers: raw,
          })
        }
        return responses
      }

      // ── Fallback: mapeado posicional para Excel personalizados ──────────────
      const headers = normHeaders
      const idx = (terms) => headers.findIndex(h => terms.some(t => h.includes(t)))
      const nombreIdx       = idx(['nombre','name','doctor','médico','medico'])
      const hospitalIdx     = idx(['hospital','centro'])
      const regionIdx       = idx(['comunidad','región','region','provincia'])
      const especialidadIdx = idx(['especialidad','perfil','especialista'])
      const metaSet = new Set([0, nombreIdx, hospitalIdx, regionIdx, especialidadIdx].filter(i => i >= 0))
      const answerCols = headers.map((_,i) => i).filter(i => !metaSet.has(i))
      const allQids    = QUESTION_BLOCKS.flatMap(b => b.questions.map(q => q.id))
      const responses  = []
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r]
        if (!row.some(v => String(v).trim())) continue
        const answers = {}
        answerCols.forEach((colIdx, ai) => {
          const qid = allQids[ai]
          if (qid) answers[qid] = String(row[colIdx] || '').trim()
        })
        responses.push({
          id: `imp_${Date.now()}_${r}`, wave:'', date: new Date().toISOString().split('T')[0],
          doctor: {
            nombre:       nombreIdx >= 0       ? String(row[nombreIdx]||`Doctor ${r}`).trim() : `Doctor ${r}`,
            hospital:     hospitalIdx >= 0     ? String(row[hospitalIdx]||'').trim() : '',
            region:       regionIdx >= 0       ? String(row[regionIdx]||'').trim() : '',
            especialidad: especialidadIdx >= 0 ? String(row[especialidadIdx]||'').trim() : ''
          },
          answers
        })
      }
      return responses
    } catch(e) { console.error(e); return [] }
  }, [])

  const processFile = useCallback(async (file) => {
    setError(''); setProcessing(true)
    try {
      const buf = await file.arrayBuffer()
      let responses = []
      if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
        responses = parseExcel(buf)
      } else if (file.name.endsWith('.txt')) {
        const text = new TextDecoder().decode(buf)
        responses = [{ id:`txt_${Date.now()}`, wave:'', date:new Date().toISOString().split('T')[0],
          doctor:{ nombre:file.name.replace('.txt',''), hospital:'', region:'', especialidad:'' },
          answers:{ b1_q1:text } }]
      } else {
        setError('Formato no soportado. Usa .xlsx, .xls, .csv o .txt')
        setProcessing(false); return
      }
      if (!responses.length) { setError('No se encontraron respuestas en el archivo.'); setProcessing(false); return }
      setPreviewRows(responses.slice(0, 5))
      setPendingData(responses)
      setWaveName(`Oleada ${waves.length + 1} — ${new Date().toLocaleDateString('es-ES', { month:'short', year:'numeric' })}`)
    } catch(e) { setError('Error al procesar el archivo: ' + e.message) }
    setProcessing(false)
  }, [waves, parseExcel])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const confirmUpload = () => {
    if (!pendingData || !waveName.trim()) return
    onAddWave({ id:`w_${Date.now()}`, name:waveName.trim(), date:new Date().toISOString().split('T')[0],
      source:'Archivo importado', isSample:false,
      responses:pendingData.map(r => ({ ...r, wave:waveName.trim() })) })
    setPendingData(null); setPreviewRows(null); setWaveName('')
  }

  const cancelUpload = () => { setPendingData(null); setPreviewRows(null); setWaveName(''); setError('') }

  const allResponses = waves.flatMap(w => w.responses || [])
  const viewWave     = selectedWave ? waves.find(w => w.id === selectedWave) : null

  const inputStyle = {
    width:'100%', padding:'10px 14px', borderRadius:8, border:`1px solid ${C.border}`,
    fontSize:14, color:C.textPri, fontFamily:'inherit', outline:'none'
  }

  return (
    <div style={{ padding: isMobile ? '20px 16px 48px' : '32px 32px 48px', maxWidth:1100 }}>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.textPri }}>Repositorio de Datos</h2>
        <p style={{ margin:'6px 0 0', fontSize:13, color:C.textSec }}>
          Sube ficheros Excel exportados de Google Forms o realiza encuestas directamente. Los datos se acumulan por oleadas.
        </p>
      </div>

      {/* Stats rápidas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { label:'Oleadas', value: waves.length, color:C.blue },
          { label:'Respuestas', value: allResponses.length, color:C.navy },
          { label:'Anónimas', value: allResponses.filter(r=>r.fromSurvey).length, color:C.success },
        ].map(s => (
          <div key={s.label} style={{ background:C.white, borderRadius:10, padding:'14px 16px', border:`1px solid ${C.border}`, textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:C.textSec, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20, marginBottom:20 }}>
        {/* Zona de carga */}
        <Card title="Importar Excel / CSV">
          {!pendingData ? (
            <>
              <div
                onDragOver={e=>{e.preventDefault();setDragging(true)}}
                onDragLeave={()=>setDragging(false)}
                onDrop={handleDrop}
                onClick={()=>fileRef.current?.click()}
                style={{ border:`2px dashed ${dragging?C.blue:C.border}`, borderRadius:12, padding:'36px 20px', textAlign:'center', cursor:'pointer', background:dragging?C.lightBg:C.bg, transition:'all 0.2s' }}
              >
                <div style={{ color:dragging?C.blue:C.gray, marginBottom:10 }}><Icon name="upload" size={32} color="currentColor"/></div>
                <div style={{ fontSize:14, fontWeight:600, color:C.textPri, marginBottom:4 }}>{processing ? 'Procesando…' : 'Arrastra tu archivo aquí'}</div>
                <div style={{ fontSize:12, color:C.textSec }}>o toca para seleccionar</div>
                <div style={{ fontSize:11, color:C.gray, marginTop:8 }}>Formatos: .xlsx · .xls · .csv · .txt</div>
              </div>
              {error && <div style={{ fontSize:12, color:C.danger, marginTop:10, padding:'8px 12px', background:'#FEF2F2', borderRadius:8 }}>{error}</div>}
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" style={{ display:'none' }}
                onChange={e=>{if(e.target.files[0]) processFile(e.target.files[0]); e.target.value=''}} />
            </>
          ) : (
            <>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.textSec, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Nombre de la oleada</div>
                <input style={inputStyle} value={waveName} onChange={e=>setWaveName(e.target.value)} placeholder="Ej: Oleada 2 — Feb 2026"/>
              </div>
              <div style={{ background:C.bg, borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:12, color:C.textSec }}>
                <strong style={{ color:C.textPri }}>{pendingData.length} respuestas</strong> detectadas listas para importar.
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={confirmUpload} disabled={!waveName.trim()} style={{ flex:1, padding:'11px', borderRadius:8, border:'none', background:waveName.trim()?C.blue:C.border, color:C.white, cursor:waveName.trim()?'pointer':'not-allowed', fontFamily:'inherit', fontSize:13, fontWeight:700 }}>
                  ✓ Confirmar importación
                </button>
                <button onClick={cancelUpload} style={{ padding:'11px 16px', borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.textSec, cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>Cancelar</button>
              </div>
            </>
          )}
        </Card>

        {/* Lista de oleadas */}
        <Card title="Oleadas" subtitle={`${waves.length} oleadas · ${allResponses.length} respuestas totales`}>
          {waves.length === 0 ? <EmptyState title="Sin oleadas" sub="Sube tu primer archivo o realiza encuestas." icon="wave"/> : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {waves.map(w => {
                const isSelected = selectedWave === w.id
                const fromSurvey = (w.responses||[]).filter(r=>r.fromSurvey).length
                return (
                  <div key={w.id}
                    style={{ padding:'12px 14px', borderRadius:10, border:`1.5px solid ${isSelected?C.blue:C.border}`, background:isSelected?C.lightBg:C.bg, cursor:'pointer', transition:'all 0.15s' }}
                    onClick={()=>setSelectedWave(isSelected?null:w.id)}
                  >
                    <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span style={{ fontSize:13, fontWeight:700, color:C.textPri }}>{w.name}</span>
                          {w.isSample && <Badge color={C.amber}>MUESTRA</Badge>}
                          {fromSurvey > 0 && <Badge color={C.success}>{fromSurvey} en app</Badge>}
                        </div>
                        <div style={{ fontSize:11, color:C.textSec, marginTop:3 }}>
                          {w.responses?.length||0} respuestas · {w.date}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                        {!w.isSample && (
                          <button onClick={e=>{e.stopPropagation(); if(window.confirm(`¿Eliminar toda la oleada "${w.name}"?`)) onDeleteWave(w.id)}}
                            style={{ background:C.danger+'12', border:`1px solid ${C.danger}30`, borderRadius:7, padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.danger, fontWeight:600, fontFamily:'inherit' }}
                            title="Eliminar oleada"
                          >
                            <Icon name="trash" size={13} color={C.danger}/> Eliminar
                          </button>
                        )}
                        {w.isSample && (
                          <button onClick={e=>{e.stopPropagation(); if(window.confirm('¿Eliminar los datos de muestra?')) onDeleteWave(w.id)}}
                            style={{ background:'rgba(232,150,58,0.1)', border:`1px solid rgba(232,150,58,0.3)`, borderRadius:7, padding:'6px 10px', cursor:'pointer', display:'flex', alignItems:'center', gap:5, fontSize:11, color:C.amber, fontWeight:600, fontFamily:'inherit' }}
                          >
                            <Icon name="trash" size={13} color={C.amber}/> Quitar muestra
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Vista previa de importación */}
      {previewRows?.length > 0 && (
        <Card title="Vista previa" subtitle="Primeras 5 respuestas detectadas" style={{ marginBottom:20 }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, minWidth:500 }}>
              <thead>
                <tr style={{ background:C.bg }}>
                  {['Doctor','Hospital','Región','Especialidad','Extracto respuesta'].map(h=>(
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:600, color:C.textSec, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r,i)=>(
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:'8px 12px', color:C.textPri, fontWeight:500, whiteSpace:'nowrap' }}>{r.doctor.nombre}</td>
                    <td style={{ padding:'8px 12px', color:C.textSec, whiteSpace:'nowrap' }}>{r.doctor.hospital||'—'}</td>
                    <td style={{ padding:'8px 12px', color:C.textSec, whiteSpace:'nowrap' }}>{r.doctor.region||'—'}</td>
                    <td style={{ padding:'8px 12px' }}><Badge>{r.doctor.especialidad||'—'}</Badge></td>
                    <td style={{ padding:'8px 12px', color:C.textSec, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {String(r.answers?.b1_q1||'—').slice(0,80)}{(r.answers?.b1_q1?.length||0)>80?'…':''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Detalle de oleada seleccionada — tabla de respuestas */}
      {viewWave && (
        <Card
          title={`Respuestas: ${viewWave.name}`}
          subtitle={`${viewWave.responses?.length||0} respuestas`}
          style={{ marginTop:20 }}
        >
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, minWidth:isMobile?400:600 }}>
              <thead>
                <tr style={{ background:C.bg }}>
                  {['#','Perfil','Región','Especialidad','Fecha','Acciones'].map(h=>(
                    <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, color:C.textSec, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(viewWave.responses||[]).map((r,i) => {
                  const isExpanded = expandedResp === r.id
                  const canPDF     = r.fromSurvey && r.structuredAnswers
                  return (
                    <React.Fragment key={r.id}>
                      <tr style={{ borderBottom: isExpanded ? 'none' : `1px solid ${C.border}`, background:i%2===0?C.white:C.bg }}>
                        <td style={{ padding:'9px 12px', color:C.gray, fontSize:11 }}>{i+1}</td>
                        <td style={{ padding:'9px 12px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background: r.fromSurvey ? C.success+'22' : C.blue+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: r.fromSurvey ? C.success : C.blue, flexShrink:0 }}>
                              {r.fromSurvey ? '✓' : (r.doctor.nombre?.[0] || 'D')}
                            </div>
                            <div>
                              <div style={{ fontWeight:600, color:C.textPri, fontSize:12 }}>
                                {r.fromSurvey ? 'Anónimo' : r.doctor.nombre}
                              </div>
                              {r.doctor.tipocentro && <div style={{ fontSize:10, color:C.gray }}>{r.doctor.tipocentro}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'9px 12px', color:C.textSec, whiteSpace:'nowrap' }}>{r.doctor.region||'—'}</td>
                        <td style={{ padding:'9px 12px' }}><Badge color={C.blue}>{r.doctor.especialidad||'—'}</Badge></td>
                        <td style={{ padding:'9px 12px', color:C.textSec, fontSize:11, whiteSpace:'nowrap' }}>{r.date}</td>
                        <td style={{ padding:'9px 12px' }}>
                          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                            {canPDF && (
                              <button onClick={()=>onDownloadPDF(r)} title="Descargar PDF"
                                style={{ background:C.blue+'12', border:`1px solid ${C.blue}30`, borderRadius:7, padding:'5px 9px', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11, color:C.blue, fontWeight:600, fontFamily:'inherit' }}>
                                <Icon name="export" size={12} color={C.blue}/>
                                {!isMobile && 'PDF'}
                              </button>
                            )}
                            <button onClick={()=>setExpandedResp(isExpanded?null:r.id)} title="Ver respuestas"
                              style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:7, padding:'5px 9px', cursor:'pointer', display:'flex', alignItems:'center', fontSize:11, color:C.textSec, fontFamily:'inherit' }}>
                              {isExpanded ? '▲' : '▼'}
                            </button>
                            <button onClick={()=>{ if(window.confirm('¿Eliminar esta respuesta?')) onDeleteResponse(viewWave.id, r.id) }}
                              title="Eliminar respuesta"
                              style={{ background:'none', border:'none', cursor:'pointer', padding:'5px', color:C.gray }}
                              onMouseEnter={e=>e.currentTarget.style.color=C.danger}
                              onMouseLeave={e=>e.currentTarget.style.color=C.gray}
                            >
                              <Icon name="trash" size={14} color="currentColor"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={r.id+'_exp'} style={{ borderBottom:`1px solid ${C.border}` }}>
                          <td colSpan={6} style={{ padding:'0 0 12px 0', background:C.bg }}>
                            <div style={{ padding:'12px 16px', display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'8px 24px' }}>
                              {Object.entries(r.structuredAnswers || r.answers || {}).slice(0,10).map(([k,v]) => {
                                if (!v || (Array.isArray(v) && !v.length)) return null
                                const label = k.startsWith('p') ? k.toUpperCase() : k
                                const display = Array.isArray(v) ? v.join(', ') : String(v)
                                return (
                                  <div key={k} style={{ fontSize:11 }}>
                                    <span style={{ fontWeight:700, color:C.textSec }}>{label}:</span>
                                    <span style={{ color:C.textPri, marginLeft:4 }}>{display.slice(0,120)}{display.length>120?'…':''}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
