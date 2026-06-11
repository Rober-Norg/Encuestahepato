// src/App.jsx — Estado global, routing, layout, responsive
import React, { useState, useMemo, useCallback, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { C, Icon, Sidebar, useIsMobile } from './components/Shared.jsx'
import Dashboard    from './views/Dashboard.jsx'
import Upload       from './views/Upload.jsx'
import Analysis     from './views/Analysis.jsx'
import Comparativas from './views/Comparativas.jsx'
import Survey, { buildResponseFromSurvey, downloadSurveyPDF, hasMeaningfulDraft } from './views/Survey.jsx'
import { getInitialData, saveAppData, SAMPLE_RESPONSES } from './data.js'
import { filterResponses } from './utils.js'

const FALLBACK_WAVE = {
  id:'w_sample', name:'Oleada 1 - Ene 2026', date:'2026-01-24',
  source:'Datos de muestra', isSample:true, responses:SAMPLE_RESPONSES
}

export default function App() {
  const [data,        setData]       = useState(() => getInitialData())
  const [activeView,  setView]       = useState('dashboard')
  const [filters,     setFilters]    = useState({ region:'all', especialidad:'all', hospital:'all', wave:'all' })
  const [exporting,   setExporting]  = useState(false)
  const [toast,       setToast]      = useState(null)
  const [sidebarOpen, setSidebar]    = useState(false)
  const [hasDraft,    setHasDraft]   = useState(hasMeaningfulDraft)
  const isMobile = useIsMobile()

  // Re-check draft whenever we leave the survey screen
  useEffect(() => {
    if (activeView !== 'encuesta') setHasDraft(hasMeaningfulDraft())
  }, [activeView])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const allResponses    = useMemo(() => data.waves.flatMap(w => w.responses || []), [data.waves])
  const activeResponses = useMemo(() => filterResponses(allResponses, filters), [allResponses, filters])
  const hasSample       = data.waves.some(w => w.isSample)

  // ─── Handlers de waves ───────────────────────────────────────────────────
  const addWave = useCallback((wave) => {
    setData(prev => {
      const next = { waves: [...prev.waves.filter(w => !w.isSample), wave] }
      saveAppData(next); return next
    })
    showToast(`Oleada "${wave.name}" importada — ${wave.responses.length} respuestas`)
    setView('dashboard')
  }, [])

  const deleteWave = useCallback((waveId) => {
    setData(prev => {
      const filtered = prev.waves.filter(w => w.id !== waveId)
      const next = { waves: filtered.length ? filtered : [FALLBACK_WAVE] }
      saveAppData(next); return next
    })
    showToast('Oleada eliminada', 'info')
  }, [])

  const deleteResponse = useCallback((waveId, responseId) => {
    setData(prev => {
      const next = {
        waves: prev.waves.map(w =>
          w.id === waveId
            ? { ...w, responses: (w.responses || []).filter(r => r.id !== responseId) }
            : w
        ).filter(w => (w.responses?.length > 0) || w.isSample)
      }
      if (!next.waves.length) next.waves = [FALLBACK_WAVE]
      saveAppData(next); return next
    })
    showToast('Respuesta eliminada', 'info')
  }, [])

  // ─── Handler encuesta ────────────────────────────────────────────────────
  const handleSurveySubmit = useCallback((response) => {
    setData(prev => {
      const month = new Date().toLocaleDateString('es-ES', { month:'long', year:'numeric' })
      const waveName = `Encuestas — ${month.charAt(0).toUpperCase() + month.slice(1)}`
      const existing = prev.waves.find(w => !w.isSample && w.name === waveName)
      let newWaves
      if (existing) {
        newWaves = prev.waves.map(w =>
          w.id === existing.id
            ? { ...w, responses: [...(w.responses||[]), { ...response, wave: waveName }] }
            : w
        )
      } else {
        const newWave = {
          id: `w_${Date.now()}`, name: waveName,
          date: new Date().toISOString().split('T')[0],
          source:'Encuesta en app', isSample:false,
          responses: [{ ...response, wave: waveName }]
        }
        newWaves = [...prev.waves.filter(w => !w.isSample), newWave]
      }
      const next = { waves: newWaves }
      saveAppData(next); return next
    })
  }, [])

  // ─── Exportar PDF del dashboard ──────────────────────────────────────────
  const exportPDF = useCallback(async () => {
    setExporting(true)
    try {
      const el = document.getElementById('main-content')
      if (!el) { showToast('Error al capturar contenido', 'error'); setExporting(false); return }
      const canvas  = await html2canvas(el, { scale:1.5, useCORS:true, backgroundColor:'#F4F7FA', logging:false })
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      const pdf     = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
      const pw  = pdf.internal.pageSize.getWidth()
      const ph  = pdf.internal.pageSize.getHeight()
      const imgW = pw - 20, imgH = (canvas.height / canvas.width) * imgW
      const ratio = canvas.width / imgW
      let remaining = imgH, sourceY = 0
      while (remaining > 0) {
        const sliceH = Math.min(ph - 20, remaining)
        const sc = document.createElement('canvas')
        sc.width = canvas.width; sc.height = sliceH * ratio
        sc.getContext('2d').drawImage(canvas, 0, sourceY, canvas.width, sliceH * ratio, 0, 0, canvas.width, sliceH * ratio)
        pdf.addImage(sc.toDataURL('image/jpeg', 0.92), 'JPEG', 10, 10, imgW, sliceH)
        sourceY += sliceH * ratio; remaining -= sliceH
        if (remaining > 0) pdf.addPage()
      }
      pdf.save(`Dashboard-VHD-${new Date().toLocaleDateString('es-ES').replace(/\//g,'-')}.pdf`)
      showToast('PDF exportado correctamente')
    } catch(e) { showToast('Error al exportar PDF', 'error') }
    setExporting(false)
  }, [])

  // ─── Vista survey (pantalla completa sin layout) ─────────────────────────
  if (activeView === 'encuesta') {
    return (
      <Survey
        onSubmit={handleSurveySubmit}
        onCancel={() => setView('dashboard')}
      />
    )
  }

  const viewLabel = {
    dashboard:'Dashboard', datos:'Repositorio de Datos',
    analisis:'Análisis por Bloque', comparativas:'Comparativas'
  }
  const toastColors = { success:C.success, error:C.danger, info:C.blue }
  const commonProps = { responses:activeResponses, waves:data.waves, filters, onChangeFilters:setFilters }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" }}>

      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebar(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:30 }} />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'sticky',
        top:0, left:0, zIndex:40, height:'100vh',
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: isMobile ? 'transform 0.25s ease' : 'none',
        flexShrink:0
      }}>
        <Sidebar
          activeView={activeView}
          onNavigate={(v) => { setView(v); if(isMobile) setSidebar(false) }}
          hasSample={hasSample}
        />
      </div>

      {/* Contenido */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        {/* Top bar */}
        <header style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 16px 0 ' + (isMobile ? '16px' : '32px'),
          height:60, background:C.white,
          borderBottom:`1px solid ${C.border}`,
          position:'sticky', top:0, zIndex:10, gap:12
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0 }}>
            {isMobile && (
              <button onClick={() => setSidebar(true)} style={{
                background:'none', border:'none', cursor:'pointer', padding:6,
                color:C.navy, display:'flex', alignItems:'center', flexShrink:0
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            )}
            <div style={{ minWidth:0 }}>
              <span style={{ fontSize:14, fontWeight:700, color:C.textPri, display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {viewLabel[activeView] || 'Dashboard'}
              </span>
              {!isMobile && (
                <span style={{ fontSize:11, color:C.gray }}>
                  {activeResponses.length} respuestas
                  {Object.values(filters).some(v => v && v !== 'all') ? ' (filtradas)' : ' totales'}
                </span>
              )}
            </div>
          </div>

          <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
            {/* Botón retomar encuesta — solo cuando hay borrador */}
            {hasDraft && (
              <button onClick={() => setView('encuesta')} style={{
                display:'flex', alignItems:'center', gap:6,
                padding: isMobile ? '8px 12px' : '8px 16px',
                borderRadius:8, border:`1.5px solid ${C.amber}`,
                background:C.amber, color:C.white,
                fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {!isMobile && 'Continúa la encuesta'}
              </button>
            )}
            {/* Botón encuesta — siempre visible */}
            <button onClick={() => setView('encuesta')} style={{
              display:'flex', alignItems:'center', gap:6,
              padding: isMobile ? '8px 12px' : '8px 16px',
              borderRadius:8, border:`1.5px solid ${C.blue}`,
              background:C.blue, color:C.white,
              fontFamily:'inherit', fontSize:12, fontWeight:700, cursor:'pointer'
            }}>
              <Icon name="check" size={14} color={C.white} />
              {!isMobile && 'Realizar encuesta'}
              {isMobile && '+'}
            </button>

            {!isMobile && (
              <button onClick={exportPDF} disabled={exporting || !activeResponses.length} style={{
                display:'flex', alignItems:'center', gap:6,
                padding:'8px 16px', borderRadius:8,
                background:(exporting||!activeResponses.length)?C.border:C.navy,
                color:(exporting||!activeResponses.length)?C.gray:C.white,
                border:'none', cursor:(exporting||!activeResponses.length)?'not-allowed':'pointer',
                fontFamily:'inherit', fontSize:12, fontWeight:600
              }}>
                <Icon name="export" size={14} color="currentColor" />
                {exporting ? 'Exportando…' : 'Exportar PDF'}
              </button>
            )}
          </div>
        </header>

        {/* Main */}
        <main id="main-content" style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
          {activeView === 'dashboard'    && <Dashboard    {...commonProps} onNavigate={setView} />}
          {activeView === 'datos'        && <Upload        waves={data.waves} onAddWave={addWave} onDeleteWave={deleteWave} onDeleteResponse={deleteResponse} onDownloadPDF={downloadSurveyPDF} />}
          {activeView === 'analisis'     && <Analysis     {...commonProps} />}
          {activeView === 'comparativas' && <Comparativas {...commonProps} />}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, right:16, zIndex:9999,
          background:toastColors[toast.type]||C.success, color:C.white,
          padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:600,
          boxShadow:'0 4px 20px rgba(0,0,0,0.18)', animation:'fadeIn 0.2s ease',
          maxWidth:'calc(100vw - 32px)'
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:3px; }
      `}</style>
    </div>
  )
}
