// src/views/Dashboard.jsx
import React, { useMemo } from 'react'
import { C, Icon, StatCard, Card, EmptyState, RadarChart, BarChart, DonutChart, SentimentBar, FilterBar, SampleBanner } from '../components/Shared.jsx'
import { computeOverviewRadar, computeSentiment, getSpecialtyDistribution, getRegionDistribution, getSentimentByBlock } from '../utils.js'

export default function Dashboard({ responses, waves, filters, onChangeFilters, onNavigate }) {
  const hasSample = waves.some(w => w.isSample)
  const totalResp    = responses.length
  const regions      = useMemo(() => [...new Set(responses.map(r => r.doctor.region).filter(Boolean))], [responses])
  const hospitals    = useMemo(() => [...new Set(responses.map(r => r.doctor.hospital).filter(Boolean))], [responses])
  const specDist     = useMemo(() => getSpecialtyDistribution(responses), [responses])
  const regionDist   = useMemo(() => getRegionDistribution(responses), [responses])
  const sentByBlock  = useMemo(() => getSentimentByBlock(responses), [responses])
  const overviewRadar= useMemo(() => computeOverviewRadar(responses), [responses])

  const avgSentScore = useMemo(() => {
    if (!responses.length) return 0
    const all = responses.flatMap(r => Object.values(r.answers || {}))
    const scores = all.map(t => computeSentiment(t).score)
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }, [responses])

  const sentColor = avgSentScore > 0.1 ? C.success : avgSentScore < -0.1 ? C.danger : C.amber
  const sentLabel = avgSentScore > 0.1 ? 'Positivo' : avgSentScore < -0.1 ? 'Negativo' : 'Neutral'

  if (!responses.length) return (
    <div style={{ padding:'40px 32px' }}>
      <EmptyState title="No hay datos todavía" sub="Sube un fichero Excel o texto en la sección Datos para empezar." icon="upload" />
    </div>
  )

  return (
    <div style={{ padding:'32px 32px 48px', maxWidth:1200 }}>
      {hasSample && <SampleBanner onGoToUpload={() => onNavigate('datos')} />}

      <FilterBar responses={responses} filters={filters} onChange={onChangeFilters} waves={waves} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatCard label="Respuestas" value={totalResp} icon="users" color={C.blue} sub={`${waves.length} oleada${waves.length !== 1 ? 's' : ''}`} />
        <StatCard label="Regiones"   value={regions.length}   icon="map"      color={C.navy}    sub="CCAA cubiertas" />
        <StatCard label="Hospitales" value={hospitals.length} icon="hospital"  color="#2CA8E0"   sub="centros únicos" />
        <StatCard label="Sentimiento" value={sentLabel} sub={`Score medio: ${(avgSentScore * 100).toFixed(0)}%`} icon="mood" color={sentColor} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <Card title="Perfil de Gestión — 9 Bloques" subtitle="Score de cobertura/adecuación por bloque (0–10)"
          action={
            <button onClick={() => onNavigate('analisis')} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.blue, fontSize:12, cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>
              Ver detalle →
            </button>
          }
        >
          {overviewRadar && <RadarChart data={overviewRadar} height={300} maxVal={10} />}
        </Card>
        <Card title="Distribución por Especialidad" subtitle="Nº de respuestas por perfil médico">
          <DonutChart labels={specDist.map(([s]) => s)} values={specDist.map(([,n]) => n)} height={300} />
        </Card>
      </div>

      <Card title="Sentimiento por Bloque" subtitle="Percepción media de los médicos en cada área temática" style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 32px' }}>
          {sentByBlock.map(item => (
            <div key={item.block} style={{ paddingBottom:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.textPri }}>{item.fullTitle}</span>
                <span style={{ fontSize:11, color:C.textSec }}>{item.score > 0 ? '+' : ''}{(item.score * 100).toFixed(0)}</span>
              </div>
              <SentimentBar score={item.score} label={item.label} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Distribución Geográfica" subtitle="Respuestas por comunidad autónoma">
        {regionDist.length > 0
          ? <BarChart labels={regionDist.map(([r]) => r)} values={regionDist.map(([,n]) => n)} height={Math.max(180, regionDist.length * 34)} unit=" resp." />
          : <EmptyState title="Sin datos geográficos" />
        }
      </Card>
    </div>
  )
}
