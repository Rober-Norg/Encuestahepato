// src/views/Analysis.jsx
import React, { useState, useMemo } from 'react'
import { C, Card, EmptyState, RadarChart, BarChart, WordCloud, Badge, FilterBar, CHART_COLORS, useIsMobile } from '../components/Shared.jsx'
import { QUESTION_BLOCKS } from '../data.js'
import { computeRadarData, computeSentiment, extractWordFrequency } from '../utils.js'

export default function Analysis({ responses, waves, filters, onChangeFilters }) {
  const isMobile = useIsMobile()
  const [activeBlock, setActiveBlock] = useState(QUESTION_BLOCKS[0].id)

  const block      = useMemo(() => QUESTION_BLOCKS.find(b => b.id === activeBlock), [activeBlock])
  const radarData  = useMemo(() => computeRadarData(responses, activeBlock), [responses, activeBlock])

  const allTexts = useMemo(() => {
    if (!block) return []
    const qids = block.questions.map(q => q.id)
    return responses.flatMap(r => qids.map(qid => r.answers[qid] || '').filter(Boolean))
  }, [responses, block])

  const wordFreq = useMemo(() => extractWordFrequency(allTexts, 40), [allTexts])

  const sentData = useMemo(() => {
    if (!block || !responses.length) return null
    const qids = block.questions.map(q => q.id)
    const scores = responses.map(r => computeSentiment(qids.map(qid => r.answers[qid] || '').join(' ')))
    const pos = scores.filter(s => s.label === 'Positivo').length
    const neg = scores.filter(s => s.label === 'Negativo').length
    const neu = scores.filter(s => s.label === 'Neutral').length
    const avg = scores.reduce((a, b) => a + b.score, 0) / scores.length
    return { pos, neg, neu, avg, total: scores.length }
  }, [responses, block])

  const verbatims = useMemo(() => {
    if (!block) return []
    const qids = block.questions.map(q => q.id)
    return responses.map(r => ({
      doctor: r.doctor,
      texts: qids.map(qid => ({ q: block.questions.find(q => q.id === qid)?.text || '', a: r.answers[qid] || '' })).filter(t => t.a)
    })).filter(r => r.texts.length).slice(0, 6)
  }, [responses, block])

  const sentColor = sentData ? (sentData.avg > 0.1 ? C.success : sentData.avg < -0.1 ? C.danger : C.amber) : C.gray

  const btnStyle = (active) => ({
    padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:active?700:500,
    cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
    border:active?`1.5px solid ${C.blue}`:`1px solid ${C.border}`,
    background:active?C.blue:C.white, color:active?C.white:C.textSec
  })

  return (
    <div style={{ padding: isMobile ? '20px 16px 48px' : '32px 32px 48px', maxWidth:1200 }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:C.textPri }}>Análisis por Bloque</h2>
        <p style={{ margin:'6px 0 0', fontSize:13, color:C.textSec }}>Selecciona un bloque temático para ver su radar, distribución y análisis de texto.</p>
      </div>

      <FilterBar responses={responses} filters={filters} onChange={onChangeFilters} waves={waves} />

      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24, padding:'14px', background:C.bg, borderRadius:12, border:`1px solid ${C.border}` }}>
        {QUESTION_BLOCKS.map(b => (
          <button key={b.id} onClick={() => setActiveBlock(b.id)} style={btnStyle(activeBlock === b.id)}>
            <span style={{ marginRight:5, opacity:0.7 }}>{b.num}.</span>{b.short}
          </button>
        ))}
      </div>

      {!responses.length ? (
        <EmptyState title="Sin datos" sub="Sube un archivo en la sección Datos para ver el análisis." icon="chart" />
      ) : (
        <>
          <div style={{ marginBottom:20, padding:'14px 18px', background:C.lightBg, borderRadius:10, borderLeft:`4px solid ${C.blue}` }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.navy }}>{block?.num}. {block?.title}</div>
            <div style={{ fontSize:12, color:C.textSec, marginTop:4, display:'flex', flexDirection:'column', gap:4 }}>
              {block?.questions.map(q => <span key={q.id}>— {q.text}</span>)}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20, marginBottom:20 }}>
            <Card title="Diagrama de Araña" subtitle={`Distribución de categorías (% de ${responses.length} respuestas)`}>
              {radarData ? <RadarChart data={radarData} height={300} maxVal={100} /> : <EmptyState title="Sin datos clasificados" sub="Las respuestas no contienen palabras clave detectables." />}
            </Card>

            <Card title="Distribución por Categoría" subtitle="% de respuestas por categoría">
              {radarData && radarData.data.some(v => v > 0) ? (
                <>
                  <BarChart labels={radarData.labels} values={radarData.data} height={220} unit="%" />
                  <div style={{ marginTop:16, display:'flex', flexWrap:'wrap', gap:'6px 16px' }}>
                    {block?.categories.map((cat, i) => (
                      <div key={cat.id} style={{ display:'flex', alignItems:'center', gap:6, fontSize:11 }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:CHART_COLORS[i % CHART_COLORS.length], flexShrink:0 }} />
                        <span style={{ color:C.textSec }}>{cat.label}: <strong style={{ color:C.textPri }}>{radarData.data[i]}%</strong></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <EmptyState title="Sin categorías detectadas" />}
            </Card>
          </div>

          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20, marginBottom:20 }}>
            <Card title="Análisis de Sentimiento" subtitle="Percepción de los médicos en este bloque">
              {sentData ? (
                <div>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontSize:48, fontWeight:800, color:sentColor, lineHeight:1 }}>
                        {sentData.avg >= 0 ? '+' : ''}{(sentData.avg * 100).toFixed(0)}
                      </div>
                      <div style={{ fontSize:13, color:C.textSec, marginTop:4 }}>score medio</div>
                    </div>
                  </div>
                  {[{ label:'Respuestas positivas', count:sentData.pos, color:C.success },{ label:'Respuestas neutrales', count:sentData.neu, color:C.amber },{ label:'Respuestas negativas', count:sentData.neg, color:C.danger }].map(item => (
                    <div key={item.label} style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:12 }}>
                        <span style={{ color:C.textSec }}>{item.label}</span>
                        <span style={{ fontWeight:700, color:item.color }}>{item.count} ({Math.round(item.count/sentData.total*100)}%)</span>
                      </div>
                      <div style={{ height:6, borderRadius:6, background:C.border, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.round(item.count/sentData.total*100)}%`, background:item.color, borderRadius:6, transition:'width 0.5s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="Sin datos de sentimiento" />}
            </Card>

            <Card title="Nube de Palabras" subtitle="Términos más frecuentes en las respuestas">
              <WordCloud words={wordFreq} maxWords={35} />
            </Card>
          </div>

          <Card title="Citas Destacadas" subtitle="Respuestas de los médicos a este bloque (extractos)">
            {verbatims.length === 0 ? <EmptyState title="Sin verbatims" /> : (
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:14 }}>
                {verbatims.map((v, i) => (
                  <div key={i} style={{ background:C.bg, borderRadius:10, padding:'14px 16px', border:`1px solid ${C.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:C.white, flexShrink:0 }}>
                        {v.doctor.nombre.split(' ').slice(-1)[0]?.[0] || 'D'}
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.textPri }}>{v.doctor.nombre}</div>
                        <div style={{ fontSize:11, color:C.textSec }}>{v.doctor.hospital} · {v.doctor.especialidad}</div>
                      </div>
                    </div>
                    {v.texts.slice(0, 2).map((t, j) => (
                      <div key={j} style={{ marginBottom:j < v.texts.length-1 ? 8 : 0 }}>
                        <div style={{ fontSize:10, fontWeight:600, color:C.blue, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>P{j+1}</div>
                        <div style={{ fontSize:12, color:C.textSec, lineHeight:1.6 }}>"{String(t.a).slice(0,160)}{t.a.length>160?'…':''}"</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
