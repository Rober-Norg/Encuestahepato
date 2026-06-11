// src/components/Shared.jsx — Componentes compartidos + responsive
import React, { useState, useEffect, useRef, useMemo } from 'react'
import Chart from 'chart.js/auto'
import { getUniqueValues } from '../utils.js'

export const C = {
  blue:    '#1B75BC',
  navy:    '#1D3252',
  gray:    '#8C9EAD',
  lightBg: '#E8F2FA',
  bg:      '#F4F7FA',
  white:   '#FFFFFF',
  border:  '#D8E3ED',
  amber:   '#E8963A',
  success: '#2B8A3E',
  danger:  '#C42B2B',
  textPri: '#1D3252',
  textSec: '#5A6A7A',
}
export const CHART_COLORS = ['#1B75BC','#2CA8E0','#1D3252','#8C9EAD','#E8963A','#2B8A3E','#C42B2B','#7B5EA7']

// ─── Hook responsive ──────────────────────────────────────────────────────────
export function useIsMobile(breakpoint = 768) {
  const [is, setIs] = useState(() => typeof window !== 'undefined' ? window.innerWidth < breakpoint : false)
  useEffect(() => {
    const h = () => setIs(window.innerWidth < breakpoint)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [breakpoint])
  return is
}

// ─── Iconos ───────────────────────────────────────────────────────────────────
export const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    upload:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    chart:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    compare:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    export:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    users:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    hospital:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    map:       <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    mood:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    trash:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    close:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    check:     <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    info:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    wave:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c.5-3 2.5-5 5-5s4 2 5 5 2.5 5 5 5 4.5-2 5-5"/></svg>,
    pencil:    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  }
  return icons[name] || null
}

export const Badge = ({ children, color = C.blue }) => (
  <span style={{ display:'inline-block', padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600, letterSpacing:'0.03em', background:color+'18', color, whiteSpace:'nowrap' }}>{children}</span>
)

export const StatCard = ({ label, value, sub, icon, color = C.blue }) => (
  <div style={{ background:C.white, borderRadius:12, padding:'16px 20px', border:`1px solid ${C.border}`, display:'flex', alignItems:'flex-start', gap:14, flex:1, minWidth:0 }}>
    <div style={{ width:42, height:42, borderRadius:10, background:color+'15', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <Icon name={icon} size={20} color={color} />
    </div>
    <div style={{ minWidth:0 }}>
      <div style={{ fontSize:24, fontWeight:700, color:C.textPri, lineHeight:1.1 }}>{value}</div>
      <div style={{ fontSize:11, fontWeight:600, color:C.textSec, marginTop:2, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</div>
      {sub && <div style={{ fontSize:11, color:C.gray, marginTop:3 }}>{sub}</div>}
    </div>
  </div>
)

export const Card = ({ children, title, subtitle, style = {}, action }) => (
  <div style={{ background:C.white, borderRadius:12, border:`1px solid ${C.border}`, overflow:'hidden', ...style }}>
    {(title || action) && (
      <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:600, color:C.textPri }}>{title}</div>
          {subtitle && <div style={{ fontSize:11, color:C.gray, marginTop:2 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
    )}
    <div style={{ padding:'18px 20px' }}>{children}</div>
  </div>
)

export const EmptyState = ({ title = 'Sin datos', sub = '', icon = 'info' }) => (
  <div style={{ textAlign:'center', padding:'40px 20px', color:C.gray }}>
    <div style={{ marginBottom:12, opacity:0.4 }}><Icon name={icon} size={36} color={C.gray} /></div>
    <div style={{ fontWeight:600, color:C.textSec, fontSize:14 }}>{title}</div>
    {sub && <div style={{ fontSize:12, marginTop:6, color:C.gray, maxWidth:280, margin:'6px auto 0' }}>{sub}</div>}
  </div>
)

export const RadarChart = ({ data, height = 280, maxVal = 100, colorOverride }) => {
  const canvasRef = useRef(null)
  const instanceRef = useRef(null)
  const key = JSON.stringify(data)
  useEffect(() => {
    if (!canvasRef.current || !data) return
    if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null }
    const color = colorOverride || C.blue
    instanceRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type:'radar',
      data:{ labels:data.labels, datasets:[{ data:data.data, backgroundColor:color+'22', borderColor:color, borderWidth:2.5, pointBackgroundColor:color, pointBorderColor:C.white, pointBorderWidth:2, pointRadius:4, pointHoverRadius:6 }] },
      options:{ responsive:true, maintainAspectRatio:false, animation:{ duration:500 },
        scales:{ r:{ min:0, max:maxVal, ticks:{ stepSize:maxVal/5, font:{size:9}, color:C.gray, backdropColor:'transparent' }, grid:{color:C.border}, pointLabels:{font:{size:10,weight:'500'},color:C.textPri}, angleLines:{color:C.border} } },
        plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:ctx=>` ${ctx.raw}${maxVal===100?'%':'/10'}` } } } }
    })
    return () => { if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null } }
  }, [key]) // eslint-disable-line
  if (!data) return <EmptyState title="Sin datos" />
  return <div style={{ height, position:'relative' }}><canvas ref={canvasRef}></canvas></div>
}

export const BarChart = ({ labels, values, height = 220, unit = '%' }) => {
  const canvasRef = useRef(null)
  const instanceRef = useRef(null)
  const key = JSON.stringify({ labels, values })
  useEffect(() => {
    if (!canvasRef.current) return
    if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null }
    instanceRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type:'bar',
      data:{ labels, datasets:[{ data:values, backgroundColor:CHART_COLORS.slice(0,values.length).map(c=>c+'CC'), borderColor:CHART_COLORS.slice(0,values.length), borderWidth:1.5, borderRadius:6 }] },
      options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:ctx=>` ${ctx.raw}${unit}` } } },
        scales:{ x:{ grid:{color:C.border}, ticks:{color:C.textSec,font:{size:10}}, max:100 }, y:{ grid:{display:false}, ticks:{color:C.textPri,font:{size:10,weight:'500'}} } } }
    })
    return () => { if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null } }
  }, [key]) // eslint-disable-line
  return <div style={{ height, position:'relative' }}><canvas ref={canvasRef}></canvas></div>
}

export const DonutChart = ({ labels, values, height = 220 }) => {
  const canvasRef = useRef(null)
  const instanceRef = useRef(null)
  const key = JSON.stringify({ labels, values })
  useEffect(() => {
    if (!canvasRef.current) return
    if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null }
    instanceRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type:'doughnut',
      data:{ labels, datasets:[{ data:values, backgroundColor:CHART_COLORS, borderColor:C.white, borderWidth:3 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'62%',
        plugins:{ legend:{ position:'right', labels:{ font:{size:11}, color:C.textPri, boxWidth:12, padding:10 } } } }
    })
    return () => { if (instanceRef.current) { instanceRef.current.destroy(); instanceRef.current = null } }
  }, [key]) // eslint-disable-line
  return <div style={{ height, position:'relative' }}><canvas ref={canvasRef}></canvas></div>
}

export const WordCloud = ({ words, maxWords = 35 }) => {
  if (!words?.length) return <EmptyState title="Sin datos" icon="chart" />
  const top = words.slice(0, maxWords)
  const maxC = top[0]?.count || 1, minC = top[top.length-1]?.count || 1, range = maxC - minC || 1
  const sz  = (c) => Math.round(12 + ((c-minC)/range) * 24)
  const op  = (c) => (0.45 + ((c-minC)/range) * 0.55).toFixed(2)
  const fw  = (c) => (c-minC)/range > 0.5 ? 700 : 400
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 12px', justifyContent:'center', padding:'16px 8px' }}>
      {top.map(({ word, count }) => (
        <span key={word} title={`${count} menciones`} style={{ fontSize:sz(count), color:C.blue, opacity:op(count), fontWeight:fw(count), cursor:'default', transition:'transform 0.1s, opacity 0.1s' }}
          onMouseEnter={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='scale(1.08)'}}
          onMouseLeave={e=>{e.currentTarget.style.opacity=op(count);e.currentTarget.style.transform='scale(1)'}}
        >{word}</span>
      ))}
    </div>
  )
}

export const SentimentBar = ({ score, label }) => {
  const pct   = Math.round(((score+1)/2)*100)
  const color = score > 0.15 ? C.success : score < -0.15 ? C.danger : C.amber
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ flex:1, height:7, borderRadius:7, background:C.border, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', borderRadius:7, background:color, transition:'width 0.4s' }} />
      </div>
      <Badge color={color}>{label}</Badge>
    </div>
  )
}

export const Sidebar = ({ activeView, onNavigate, hasSample }) => {
  const navItems = [
    { id:'dashboard',    label:'Dashboard',         icon:'dashboard' },
    { id:'encuesta',     label:'Realizar encuesta', icon:'pencil' },
    { id:'datos',        label:'Datos',             icon:'upload' },
    { id:'analisis',     label:'Análisis',          icon:'chart' },
    { id:'comparativas', label:'Comparativas',      icon:'compare' },
  ]
  return (
    <nav style={{ width:220, flexShrink:0, background:C.navy, display:'flex', flexDirection:'column', height:'100vh' }}>
      <div style={{ padding:'22px 18px 18px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
        <img src="/norgine-logo.png" alt="Norgine" style={{ width:96, display:'block' }} />
        <div style={{ marginTop:10, fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase' }}>Hepatitis D · Encuestas</div>
      </div>
      <div style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
        {navItems.map(item => {
          const active = activeView === item.id
          const isEnc  = item.id === 'encuesta'
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} style={{
              display:'flex', alignItems:'center', gap:12,
              width:'100%', padding:'12px 18px',
              background: isEnc ? 'rgba(27,117,188,0.2)' : active ? 'rgba(255,255,255,0.1)' : 'transparent',
              border:'none', cursor:'pointer', textAlign:'left',
              borderLeft: active ? `3px solid ${C.blue}` : '3px solid transparent',
              color: active || isEnc ? C.white : 'rgba(255,255,255,0.55)',
              fontFamily:'inherit', fontSize:13, fontWeight: active ? 600 : 400, transition:'all 0.12s'
            }}
              onMouseEnter={e=>{if(!active&&!isEnc){e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.8)'}}}
              onMouseLeave={e=>{if(!active&&!isEnc){e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.55)'}}}
            >
              <Icon name={item.icon} size={16} color="currentColor" />
              {item.label}
              {item.id === 'datos' && hasSample && (
                <span style={{ marginLeft:'auto', fontSize:9, padding:'2px 6px', borderRadius:8, background:'rgba(232,150,58,0.2)', color:C.amber, fontWeight:700 }}>MUESTRA</span>
              )}
            </button>
          )
        })}
      </div>
      <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(255,255,255,0.08)', fontSize:10, color:'rgba(255,255,255,0.22)', lineHeight:1.6 }}>
        Encuestas VHD v1.1<br />Datos en dispositivo local
      </div>
    </nav>
  )
}

export const FilterBar = ({ responses, filters, onChange, waves = [] }) => {
  const regions   = useMemo(() => getUniqueValues(responses, 'region'),       [responses])
  const specs     = useMemo(() => getUniqueValues(responses, 'especialidad'), [responses])
  const hospitals = useMemo(() => getUniqueValues(responses, 'hospital'),     [responses])
  const sel = (f, v) => onChange({ ...filters, [f]: v })
  const ss = {
    padding:'8px 12px', borderRadius:8, border:`1px solid ${C.border}`,
    background:C.white, fontSize:12, color:C.textPri,
    fontFamily:'inherit', cursor:'pointer', outline:'none', minWidth:130,
    appearance:'none',
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238C9EAD'/%3E%3C/svg%3E")`,
    backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', paddingRight:28
  }
  const hasF = Object.values(filters).some(v => v && v !== 'all')
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center', padding:'12px 0' }}>
      <span style={{ fontSize:12, fontWeight:600, color:C.textSec }}>Filtrar:</span>
      <select style={ss} value={filters.wave||'all'} onChange={e=>sel('wave',e.target.value)}>
        <option value="all">Todas las oleadas</option>
        {waves.map(w=><option key={w.id} value={w.name}>{w.name}</option>)}
      </select>
      <select style={ss} value={filters.especialidad||'all'} onChange={e=>sel('especialidad',e.target.value)}>
        <option value="all">Todas las especialidades</option>
        {specs.map(s=><option key={s} value={s}>{s}</option>)}
      </select>
      <select style={ss} value={filters.region||'all'} onChange={e=>sel('region',e.target.value)}>
        <option value="all">Todas las regiones</option>
        {regions.map(r=><option key={r} value={r}>{r}</option>)}
      </select>
      {!hospitals.every(h => !h) && (
        <select style={ss} value={filters.hospital||'all'} onChange={e=>sel('hospital',e.target.value)}>
          <option value="all">Todos los hospitales</option>
          {hospitals.filter(Boolean).map(h=><option key={h} value={h}>{h}</option>)}
        </select>
      )}
      {hasF && (
        <button onClick={()=>onChange({region:'all',especialidad:'all',hospital:'all',wave:'all'})} style={{ padding:'8px 14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.white, fontSize:12, color:C.danger, cursor:'pointer', fontFamily:'inherit', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
          <Icon name="close" size={11} color={C.danger} /> Limpiar
        </button>
      )}
    </div>
  )
}

export const SampleBanner = ({ onGoToUpload }) => (
  <div style={{ background:'#FFF8ED', border:'1px solid #F4D49A', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#7A5100', marginBottom:18, flexWrap:'wrap' }}>
    <Icon name="info" size={16} color="#E8963A" />
    <span>Mostrando <strong>datos de muestra</strong>. Sube tu fichero Excel o realiza encuestas en </span>
    <button onClick={onGoToUpload} style={{ background:'none', border:'none', color:'#E8963A', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:13, padding:0, textDecoration:'underline' }}>Datos</button>.
  </div>
)
