// src/views/Comparativas.jsx
import React, { useState, useMemo } from 'react'
import { C, Card, EmptyState, RadarChart, Badge, SentimentBar, FilterBar } from '../components/Shared.jsx'
import { QUESTION_BLOCKS } from '../data.js'
import { computeRadarData, computeSentiment, getUniqueValues } from '../utils.js'

export default function Comparativas({ responses, waves, filters, onChangeFilters }) {
  const [groupBy,     setGroupBy]     = useState('especialidad')
  const [activeBlock, setActiveBlock] = useState(QUESTION_BLOCKS[0].id)

  const groupValues = useMemo(() => getUniqueValues(responses, groupBy), [responses, groupBy])

  const groupedData = useMemo(() => {
    return groupValues.map(val => {
      const group = responses.filter(r => r.doctor[groupBy] === val)
      const radar = computeRadarData(group, activeBlock)
      const qids  = QUESTION_BLOCKS.find(b => b.id === activeBlock)?.questions.map(q => q.id) || []
      const sent  = group.length
        ? group.map(r => computeSentiment(qids.map(qid => r.answers[qid]||'').join(' ')).score).reduce((a,b)=>a+b,0) / group.length
        : 0
      return { val, group, radar, sent, n: group.length }
    }).filter(g => g.n > 0)
  }, [responses, groupBy, activeBlock])

  const overallRadar = useMemo(() => computeRadarData(responses, activeBlock), [responses, activeBlock])
  const block        = QUESTION_BLOCKS.find(b => b.id === activeBlock)

  const groupByOpts = [
    { value:'especialidad', label:'Especialidad' },
    { value:'region',       label:'Comunidad Autónoma' },
    { value:'hospital',     label:'Hospital' }
  ]

  const btnStyle = (active) => ({
    padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:active?700:500,
    cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
    border:active?`1.5px solid ${C.blue}`:`1px solid ${C.border}`,
    background:active?C.blue:C.white, color:active?C.white:C.textSec
  })

  return (
    <div style={{ padding:'32px 32px 48px', maxWidth:1200 }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.textPri }}>Comparativas</h2>
        <p style={{ margin:'6px 0 0', fontSize:13, color:C.textSec }}>Compara respuestas entre grupos para un bloque temático.</p>
      </div>

      <FilterBar responses={responses} filters={filters} onChange={onChangeFilters} waves={waves} />

      <div style={{ display:'flex', flexWrap:'wrap', gap:16, marginBottom:24, alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textSec, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Agrupar por</div>
          <div style={{ display:'flex', gap:8 }}>
            {groupByOpts.map(o => <button key={o.value} onClick={()=>setGroupBy(o.value)} style={btnStyle(groupBy===o.value)}>{o.label}</button>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textSec, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Bloque</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {QUESTION_BLOCKS.map(b => <button key={b.id} onClick={()=>setActiveBlock(b.id)} style={{ ...btnStyle(activeBlock===b.id), padding:'6px 12px', fontSize:11 }}>{b.num}. {b.short}</button>)}
          </div>
        </div>
      </div>

      {!responses.length ? (
        <EmptyState title="Sin datos" sub="Sube un archivo en la sección Datos." icon="compare" />
      ) : (
        <>
          <Card title={`Sentimiento por ${groupByOpts.find(o=>o.value===groupBy)?.label}`}
            subtitle={`Bloque: ${block?.title} · ${responses.length} respuestas totales`}
            style={{ marginBottom:20 }}
          >
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ background:C.bg }}>
                    {[groupByOpts.find(o=>o.value===groupBy)?.label,'Respuestas','Sentimiento','Score'].map(h=>(
                      <th key={h} style={{ padding:'10px 14px', textAlign: h==='Respuestas'||h==='Score'?'center':'left', fontWeight:700, color:C.textSec, borderBottom:`1px solid ${C.border}`, minWidth: h==='Sentimiento'?200:undefined }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...groupedData].sort((a,b)=>b.sent-a.sent).map((g,i) => {
                    const col = g.sent > 0.1 ? C.success : g.sent < -0.1 ? C.danger : C.amber
                    const lbl = g.sent > 0.1 ? 'Positivo' : g.sent < -0.1 ? 'Negativo' : 'Neutral'
                    return (
                      <tr key={g.val} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.white:C.bg }}>
                        <td style={{ padding:'11px 14px', fontWeight:600, color:C.textPri }}>{g.val}</td>
                        <td style={{ padding:'11px 14px', textAlign:'center', color:C.textSec }}>{g.n}</td>
                        <td style={{ padding:'11px 14px' }}><SentimentBar score={g.sent} label={lbl} /></td>
                        <td style={{ padding:'11px 14px', textAlign:'center', fontWeight:700, color:col }}>{g.sent>=0?'+':''}{(g.sent*100).toFixed(0)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {groupedData.length > 0 && (
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.textPri, marginBottom:16 }}>
                Diagramas de araña por {groupByOpts.find(o=>o.value===groupBy)?.label.toLowerCase()}
              </h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                <Card title="Vista global" subtitle={`Todos (${responses.length})`}>
                  {overallRadar ? <RadarChart data={overallRadar} height={240} maxVal={100} colorOverride={C.navy} /> : <EmptyState title="Sin datos" />}
                </Card>
                {groupedData.map(g => (
                  <Card key={g.val} title={g.val} subtitle={`${g.n} respuesta${g.n!==1?'s':''}`}>
                    {g.radar && g.radar.data.some(v=>v>0)
                      ? <RadarChart data={g.radar} height={240} maxVal={100} />
                      : <EmptyState title="Sin categorías detectadas" />}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card title="Respuestas individuales" subtitle={`${responses.length} respuestas · Bloque: ${block?.title}`} style={{ marginTop:20 }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                <thead>
                  <tr style={{ background:C.bg }}>
                    {['Doctor','Hospital','Región','Especialidad','Primera pregunta (extracto)'].map(h=>(
                      <th key={h} style={{ padding:'9px 12px', textAlign:'left', fontWeight:700, color:C.textSec, borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.slice(0,20).map((r,i)=>{
                    const ans = r.answers[block?.questions[0]?.id] || '—'
                    return (
                      <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}`, background:i%2===0?C.white:C.bg }}>
                        <td style={{ padding:'9px 12px', fontWeight:600, color:C.textPri, whiteSpace:'nowrap' }}>{r.doctor.nombre}</td>
                        <td style={{ padding:'9px 12px', color:C.textSec, whiteSpace:'nowrap' }}>{r.doctor.hospital}</td>
                        <td style={{ padding:'9px 12px', color:C.textSec, whiteSpace:'nowrap' }}>{r.doctor.region}</td>
                        <td style={{ padding:'9px 12px' }}><Badge color={C.blue}>{r.doctor.especialidad||'—'}</Badge></td>
                        <td style={{ padding:'9px 12px', color:C.textSec, maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{String(ans).slice(0,120)}{ans.length>120?'…':''}</td>
                      </tr>
                    )
                  })}
                  {responses.length > 20 && <tr><td colSpan={5} style={{ padding:'10px 12px', textAlign:'center', color:C.gray, fontSize:11, fontStyle:'italic' }}>Mostrando 20 de {responses.length} respuestas</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
