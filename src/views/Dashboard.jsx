// src/views/Dashboard.jsx
import React, { useMemo } from 'react'
import { C, Icon, StatCard, Card, EmptyState, RadarChart, BarChart, DonutChart, SentimentBar, FilterBar, SampleBanner, useIsMobile } from '../components/Shared.jsx'
import { computeOverviewRadar, computeSentiment, getSpecialtyDistribution, getRegionDistribution, getSentimentByBlock } from '../utils.js'

export default function Dashboard({ responses, waves, filters, onChangeFilters, onNavigate }) {
  const isMobile = useIsMobile()
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
    <div style={{ padding: isMobile ? '32px 16px' : '40px 32px' }}>
      <EmptyState title="No hay datos todavía" sub="Sube un fichero Excel o texto en la sección Datos para empezar." icon="upload" />
    </div>
  )

  return (
    <div style={{ padding: isMobile ? '20px 16px 48px' : '32px 32px 48px', maxWidth:1200 }}>
      {hasSample && <SampleBanner onGoToUpload={() => onNavigate('datos')} />}

      <FilterBar responses={responses} filters={filters} onChange={onChangeFilters} waves={waves} />

      {/* Stat cards: 2 columnas en móvil, 4 en desktop */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 16 : 28 }}>
        <StatCard label="Respuestas"  value={totalResp}         icon="users"    color={C.blue}    sub={`${waves.length} oleada${waves.length !== 1 ? 's' : ''}`} />
        <StatCard label="Regiones"    value={regions.length}    icon="map"      color={C.navy}    sub="CCAA cubiertas" />
        <StatCard label="Hospitales"  value={hospitals.length}  icon="hospital" color="#2CA8E0"   sub="centros únicos" />
        <StatCard label="Sentimiento" value={sentLabel} sub={`Score medio: ${(avgSentScore * 100).toFixed(0)}%`} icon="mood" color={sentColor} />
      </div>

      {/* Radar + Donut: apilados en móvil */}
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:20, marginBottom:20 }}>
        <Card title="Perfil de Gestión — 9 Bloques" subtitle="Score de cobertura/adecuación por bloque (0–10)"
          action={
            <button onClick={() => onNavigate('analisis')} style={{ padding:'6px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.blue, fontSize:12, cursor:'pointer', fontWeight:600, fontFamily:'inherit' }}>
              Ver detalle →
            </button>
          }
        >
          {overviewRadar && <RadarChart data={overviewRadar} height={isMobile ? 240 : 300} maxVal={10} />}
        </Card>
        <Card title="Distribución por Especialidad" subtitle="Nº de respuestas por perfil médico">
          <DonutChart labels={specDist.map(([s]) => s)} values={specDist.map(([,n]) => n)} height={isMobile ? 240 : 300} />
        </Card>
      </div>

      {/* Sentimiento por bloque: 1 columna en móvil */}
      <Card title="Sentimiento por Bloque" subtitle="Percepción media de los médicos en cada área temática" style={{ marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 8 : '10px 32px' }}>
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

      {/* Distribución geográfica */}
      <Card title="Distribución Geográfica" subtitle="Respuestas por comunidad autónoma">
        {regionDist.length > 0
          ? <BarChart labels={regionDist.map(([r]) => r)} values={regionDist.map(([,n]) => n)} height={Math.max(180, regionDist.length * 34)} unit=" resp." />
          : <EmptyState title="Sin datos geográficos" />
        }
      </Card>
    </div>
  )
}
