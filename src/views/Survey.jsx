// src/views/Survey.jsx — Formulario multi-paso, responsive, con PDF individual
import React, { useState, useCallback, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import { C, Icon, Badge } from '../components/Shared.jsx'
import { REGIONS } from '../data.js'

// ─── Persistencia de borrador ─────────────────────────────────────────────────
const DRAFT_KEY = 'survey_vhd_draft'
const loadDraft  = () => { try { const s = localStorage.getItem(DRAFT_KEY); return s ? JSON.parse(s) : null } catch { return null } }
const saveDraft  = (step, answers) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, answers })) } catch {} }
const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY) } catch {} }
export const hasMeaningfulDraft = () => { const d = loadDraft(); return !!(d && (d.step > 0 || Object.keys(d.answers || {}).length > 0)) }

// ─── Definición de secciones ─────────────────────────────────────────────────
const SURVEY_SECTIONS = [
  {
    step: 0, id: 'perfil', title: 'Perfil del médico',
    subtitle: 'Datos completamente anónimos — sin nombre ni apellidos',
    questions: [
      { id:'p00h', type:'text', required:false, label:'¿A qué hospital perteneces?',
        placeholder:'Nombre del hospital' },
      { id:'p00a', type:'radio', required:false, label:'¿Cuál es su especialidad?',
        options:['Hepatólogo/a','Gastroenterólogo/a','Internista','Infectólogo/a','Otro'] },
      { id:'p00b', type:'select', required:false, label:'¿En qué comunidad autónoma ejerce actualmente?',
        options: REGIONS },
      { id:'p00c', type:'radio', required:false, label:'¿Cuál es el tipo de centro donde trabaja?',
        options:['Hospital terciario / universitario','Hospital de segundo nivel','Hospital comarcal','Centro privado o clínica'] },
      { id:'p00d', type:'radio', required:false, label:'¿Cuántos pacientes con VHD tiene actualmente en seguimiento activo?',
        options:['Ninguno','1 – 5 pacientes','6 – 15 pacientes','Más de 15 pacientes'] },
      { id:'p00e', type:'radio', required:false, label:'¿Cuántos años lleva atendiendo pacientes con hepatitis viral?',
        options:['Menos de 5 años','Entre 5 y 10 años','Más de 10 años'] }
    ]
  },
  {
    step: 1, id: 'identificacion', title: 'Identificación de Pacientes', blockNum: 1,
    questions: [
      { id:'p01a', type:'scale', required:false, min:1, max:5,
        label:'En mi centro, el testing sistemático de VHD en pacientes VHB+ está...',
        minLabel:'Nada implementado', maxLabel:'Completamente implementado' },
      { id:'p01b', type:'checkbox', required:false, hint:'Puede seleccionar varias opciones',
        label:'¿Dónde cree que se pierden más pacientes con VHD?',
        options:['Atención Primaria (no se solicita anti-VHD)','Urgencias (no se deriva ni se testa)','Digestivo general (no especializado en VHD)','Hospitales sin hepatólogo dedicado','Falta de protocolo institucional','Centros de atención a toxicomanos','No existen pérdidas relevantes en mi entorno'] },
      { id:'p01c', type:'textarea', required:false,
        label:'¿Cree que todos los pacientes con VHB se están testando sistemáticamente para VHD? ¿Dónde se están escapando más del sistema?',
        placeholder:'Cuéntenos con sus palabras... (opcional)' }
    ]
  },
  {
    step: 2, id: 'diagnostico', title: 'Diagnóstico y Testing', blockNum: 2,
    questions: [
      { id:'p02a', type:'radio', required:false,
        label:'En su hospital, ¿el test de VHD está protocolizado?',
        options:['Sí, completamente protocolizado y con buena adherencia','Sí, existe protocolo pero la adherencia es baja','No, depende del criterio de cada clínico','No existe ningún protocolo','En proceso de implementación'] },
      { id:'p02b', type:'radio', required:false,
        label:'¿Se utiliza reflex testing o double reflex en su centro?',
        options:['Sí, double reflex completo (HBsAg+ → anti-VHD → RNA automático)','Sí, reflex parcial (solo HBsAg+ → anti-VHD)','No, cada médico solicita manualmente','En proceso de implementación'] },
      { id:'p02c', type:'radio', required:false,
        label:'En la práctica, ¿qué falla más en el proceso diagnóstico?',
        options:['Que no se solicita el anti-VHD al paciente VHB+','Que el anti-VHD positivo no se confirma con RNA','Ambas cosas fallan de forma similar','El proceso diagnóstico funciona bien'] },
      { id:'p02d', type:'textarea', required:false,
        label:'¿Quiere añadir algún matiz sobre el diagnóstico y testing en su centro?',
        placeholder:'Opcional...' }
    ]
  },
  {
    step: 3, id: 'funnel', title: 'Funnel Diagnóstico y Pérdidas', blockNum: 3,
    questions: [
      { id:'p03a', type:'radio', required:false,
        label:'Desde que un paciente es HBsAg positivo, ¿en qué punto se pierden más pacientes hasta confirmar VHD?',
        options:['Al solicitar el anti-VHD (no se pide)','Al confirmar con RNA (se queda en el anticuerpo)','En la derivación al especialista','En el seguimiento posterior al diagnóstico','No hay pérdidas significativas en mi entorno'] },
      { id:'p03b', type:'radio', required:false,
        label:'¿Qué porcentaje aproximado de sus pacientes VHB+ activos tiene el test de VHD realizado?',
        options:['Menos del 25%','Entre el 25% y el 50%','Entre el 50% y el 75%','Más del 75%','No tengo datos precisos'] },
      { id:'p03c', type:'textarea', required:false,
        label:'¿Quiere añadir alguna observación sobre dónde se rompe el funnel diagnóstico en su entorno?',
        placeholder:'Opcional...' }
    ]
  },
  {
    step: 4, id: 'derivacion', title: 'Derivación y Organización Asistencial', blockNum: 4,
    questions: [
      { id:'p04a', type:'checkbox', required:false, hint:'Puede seleccionar varias opciones',
        label:'¿Cómo suelen llegarle los pacientes con VHD?',
        options:['Derivados por otro especialista (digestivo, internista...)','Derivados desde Atención Primaria','Detectados por cribado activo en mi consulta','Por iniciativa propia del paciente','Desde urgencias'] },
      { id:'p04b', type:'radio', required:false,
        label:'¿Existe un circuito claro de derivación para pacientes con VHD en su área?',
        options:['Sí, un circuito formal bien establecido','Sí, existe pero es mejorable','No, funciona principalmente por relaciones personales','No existe ningún circuito definido','En proceso de desarrollo'] },
      { id:'p04c', type:'textarea', required:false,
        label:'¿Quiere añadir algún comentario sobre la derivación?',
        placeholder:'Opcional...' }
    ]
  },
  {
    step: 5, id: 'estadio', title: 'Estadio de la Enfermedad', blockNum: 5,
    questions: [
      { id:'p05a', type:'checkbox', required:false, hint:'Puede seleccionar varias opciones',
        label:'¿En qué estadio llegan habitualmente sus pacientes con VHD confirmado?',
        options:['Principalmente estadio temprano (F0–F1, sin fibrosis significativa)','Principalmente estadio intermedio (F2–F3, fibrosis moderada-grave)','Principalmente cirrosis compensada (F4)','Principalmente cirrosis descompensada o complicada','Mezcla de estadios, sin predominio claro'] },
      { id:'p05b', type:'textarea', required:false,
        label:'¿Quiere añadir algún comentario sobre el estadio de presentación?',
        placeholder:'Opcional...' }
    ]
  },
  {
    step: 6, id: 'decision', title: 'Decisión de Tratamiento', blockNum: 6,
    questions: [
      { id:'p06a', type:'checkbox', required:false, hint:'Puede seleccionar varias opciones',
        label:'En su hospital, ¿quién toma realmente la decisión de iniciar tratamiento para VHD?',
        options:['El hepatólogo referente del caso','Consenso del equipo de hepatología','Comité multidisciplinar formal','El especialista que lleva el caso (no hepatólogo)','Se deriva a otro centro de referencia para la decisión'] },
      { id:'p06b', type:'scale', required:false, min:1, max:5,
        label:'¿En qué medida se siente seguro/a tomando la decisión de iniciar tratamiento para VHD?',
        minLabel:'Nada seguro/a', maxLabel:'Muy seguro/a' },
      { id:'p06c', type:'textarea', required:false,
        label:'¿Quiere añadir algún comentario sobre la toma de decisión?',
        placeholder:'Opcional...' }
    ]
  },
  {
    step: 7, id: 'acceso', title: 'Acceso al Tratamiento', blockNum: 7,
    questions: [
      { id:'p07a', type:'radio', required:false,
        label:'¿Cómo calificaría el nivel de dificultad para acceder al tratamiento para VHD en su centro?',
        options:['Acceso fluido, sin dificultades relevantes','Dificultades leves y puntuales','Dificultades moderadas y frecuentes','Dificultades graves que impiden tratar a algunos pacientes','No he intentado prescribir este tratamiento todavía'] },
      { id:'p07b', type:'checkbox', required:false, hint:'Puede seleccionar varias opciones',
        label:'¿Qué barreras encuentra para iniciar tratamiento?',
        options:['Visado de inspección (proceso largo o incierto)','Farmacia hospitalaria (criterios restrictivos o demoras)','Criterios de uso restringido demasiado estrictos','Desconocimiento del proceso de solicitud','Barreras clínicas (identificar al candidato ideal)','No encuentro barreras significativas'] },
      { id:'p07c', type:'radio', required:false,
        label:'¿Cuánto tiempo pasa habitualmente desde que decide tratar hasta que el paciente recibe el tratamiento?',
        options:['Menos de 2 semanas','Entre 2 y 4 semanas','Entre 1 y 3 meses','Más de 3 meses','No tengo datos precisos'] },
      { id:'p07d', type:'textarea', required:false,
        label:'¿Quiere describir con más detalle las barreras de acceso al tratamiento?',
        placeholder:'Opcional...' }
    ]
  },
  {
    step: 8, id: 'seleccion', title: 'Selección de Pacientes', blockNum: 8,
    questions: [
      { id:'p08a', type:'checkbox', required:false, hint:'Puede seleccionar varias opciones',
        label:'¿En qué tipo de pacientes considera más clara la indicación de tratamiento hoy?',
        options:['Cualquier paciente con RNA-VHD detectable','RNA+ con fibrosis F2 o superior','RNA+ con cirrosis establecida (F4)','Pacientes jóvenes aunque la fibrosis sea leve','Solo en el contexto de ensayos clínicos','Todos los pacientes con VHD activo, independientemente del estadio','Paciente sin cirrosis F1','Paciente sin cirrosis F2'] },
      { id:'p08b', type:'textarea', required:false,
        label:'¿Quiere añadir algún criterio de selección adicional?',
        placeholder:'Opcional...' }
    ]
  },
  {
    step: 9, id: 'necesidades', title: 'Necesidades No Cubiertas', blockNum: 9,
    questions: [
      { id:'p09a', type:'radio', required:false,
        label:'¿Cuál es la principal necesidad no cubierta actualmente en hepatitis D?',
        options:['Mejorar el diagnóstico y el testing sistemático','Facilitar el acceso al tratamiento','Más formación para médicos no especialistas','Guías clínicas más claras y actualizadas','Registro nacional de pacientes con VHD','Red de centros de referencia estructurada'] },
      { id:'p09b', type:'radio', required:false,
        label:'¿Qué medida ayudaría más a mejorar el manejo de los pacientes con VHD en su centro?',
        options:['Implementar reflex testing automático en el laboratorio','Protocolo unificado de testing y derivación','Vía rápida de acceso al tratamiento (sin visado)','Programa de formación para AP y urgencias','Consulta de referencia de VHD en mi hospital','Formación a cirugía'] },
      { id:'p09c', type:'textarea', required:false,
        label:'¿Cuál diría que es la principal necesidad no cubierta en hepatitis D? ¿Qué cambiaría primero si tuviera los recursos?',
        placeholder:'Su opinión aquí es muy valiosa para el proyecto...' }
    ]
  }
]

// ─── Generación de PDF individual ────────────────────────────────────────────
function downloadSurveyPDF(response) {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })
  const pw  = doc.internal.pageSize.getWidth()
  const ph  = doc.internal.pageSize.getHeight()
  const ml  = 18, mr = 18, maxW = pw - ml - mr
  let y = 0

  const newPage = () => { doc.addPage(); y = 18 }
  const checkY  = (need = 12) => { if (y + need > ph - 14) newPage() }

  // Header
  doc.setFillColor(29, 50, 82)
  doc.rect(0, 0, pw, 22, 'F')
  doc.setFillColor(27, 117, 188)
  doc.rect(0, 20, pw, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Encuesta Hepatitis D', ml, 13)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(`Norgine · Respuesta anónima · ${response.date}`, pw - mr, 13, { align:'right' })
  y = 32

  // Profile box
  doc.setFillColor(232, 242, 250)
  doc.roundedRect(ml, y - 4, pw - ml - mr, 40, 2, 2, 'F')
  doc.setTextColor(29, 50, 82)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Perfil del médico', ml + 4, y + 2)
  y += 7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(58, 74, 90)
  const profile = [
    ['Hospital', response.doctor.hospital],
    ['Especialidad', response.doctor.especialidad],
    ['Comunidad Autónoma', response.doctor.region],
    ['Tipo de centro', response.doctor.tipocentro],
    ['Pacientes VHD seguimiento', response.doctor.numPacientes],
    ['Experiencia hepatitis viral', response.doctor.experiencia],
  ]
  const half = Math.ceil(profile.length / 2)
  profile.forEach(([lbl, val], i) => {
    const col = i < half ? ml + 4 : pw / 2 + 4
    const row = i < half ? i : i - half
    const yy  = y + row * 5.5
    doc.setFont('helvetica', 'bold')
    doc.text(lbl + ': ', col, yy)
    doc.setFont('helvetica', 'normal')
    doc.text(val || '—', col + doc.getTextWidth(lbl + ': '), yy)
  })
  y += half * 5.5 + 8

  // Sections
  for (const section of SURVEY_SECTIONS.slice(1)) {
    checkY(16)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(29, 50, 82)
    doc.text(section.title, ml, y)
    y += 1.5
    doc.setDrawColor(27, 117, 188)
    doc.setLineWidth(0.4)
    doc.line(ml, y, pw - mr, y)
    y += 6

    for (const q of section.questions) {
      const raw = response.structuredAnswers?.[q.id]
      if (!raw && !q.required) continue
      const answerText = Array.isArray(raw) ? (raw.length ? raw.join(' · ') : '—') : (raw || '—')

      checkY(14)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.5)
      doc.setTextColor(90, 106, 122)
      const qLines = doc.splitTextToSize(q.label, maxW)
      checkY(qLines.length * 4 + 8)
      doc.text(qLines, ml, y)
      y += qLines.length * 4 + 2

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(29, 50, 82)
      const aLines = doc.splitTextToSize(answerText, maxW - 4)
      checkY(aLines.length * 4.5 + 6)
      doc.text(aLines, ml + 3, y)
      y += aLines.length * 4.5 + 7
    }
    y += 3
  }

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(140, 158, 173)
    doc.text(`Encuesta anónima · Hepatitis D · Norgine ${new Date().getFullYear()} · ${p}/${totalPages}`, pw / 2, ph - 7, { align:'center' })
  }

  doc.save(`Encuesta-VHD-${response.date}-${response.id.slice(-6)}.pdf`)
}

// ─── Mapear respuestas del formulario a formato del dashboard ────────────────
export function buildResponseFromSurvey(answers) {
  const arr = (v) => Array.isArray(v) ? v.join('; ') : (v || '')
  return {
    id: `survey_${Date.now()}`,
    wave: '',
    date: new Date().toISOString().split('T')[0],
    fromSurvey: true,
    doctor: {
      nombre:       'Anónimo',
      hospital:     answers.p00h || '',
      region:       answers.p00b || '',
      especialidad: answers.p00a || '',
      tipocentro:   answers.p00c || '',
      numPacientes: answers.p00d || '',
      experiencia:  answers.p00e || '',
    },
    // Backward-compat text answers (for NLP analysis)
    answers: {
      b1_q1: answers.p01c || arr(answers.p01b),
      b1_q2: arr(answers.p01b),
      b2_q3: answers.p02a || '',
      b2_q4: answers.p02b || '',
      b2_q5: answers.p02c || answers.p02d || '',
      b3_q6: answers.p03a || answers.p03c || '',
      b4_q7: arr(answers.p04a),
      b4_q8: answers.p04b || answers.p04c || '',
      b5_q9: answers.p05a || answers.p05b || '',
      b6_q10: answers.p06a || answers.p06c || '',
      b7_q11: answers.p07a || '',
      b7_q12: arr(answers.p07b) + ' ' + (answers.p07d || ''),
      b8_q13: arr(answers.p08a) + ' ' + (answers.p08b || ''),
      b9_q14: answers.p09a || answers.p09c || '',
      b9_q15: answers.p09b || answers.p09c || '',
    },
    // Structured answers for future direct analysis
    structuredAnswers: { ...answers },
  }
}

// ─── Componentes de preguntas ─────────────────────────────────────────────────
const RadioQ = ({ q, value, onChange }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
    {q.options.map(opt => {
      const sel = value === opt
      return (
        <label key={opt} style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'12px 16px', borderRadius:10, cursor:'pointer',
          border:`1.5px solid ${sel ? C.blue : C.border}`,
          background: sel ? C.lightBg : C.white,
          transition:'all 0.12s', minHeight:48
        }}>
          <div style={{
            width:20, height:20, borderRadius:'50%', flexShrink:0,
            border:`2px solid ${sel ? C.blue : C.border}`,
            background: sel ? C.blue : 'transparent',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.12s'
          }}>
            {sel && <div style={{ width:8, height:8, borderRadius:'50%', background:C.white }} />}
          </div>
          <input type="radio" name={q.id} value={opt} checked={sel} onChange={() => onChange(opt)}
            style={{ position:'absolute', opacity:0, pointerEvents:'none' }} />
          <span style={{ fontSize:14, color: sel ? C.navy : C.textPri, fontWeight: sel ? 600 : 400, lineHeight:1.4 }}>{opt}</span>
        </label>
      )
    })}
  </div>
)

const CheckboxQ = ({ q, value = [], onChange }) => {
  const toggle = (opt) => {
    const next = value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]
    onChange(next)
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {q.hint && <div style={{ fontSize:12, color:C.gray, marginBottom:2 }}>{q.hint}</div>}
      {q.options.map(opt => {
        const sel = value.includes(opt)
        return (
          <label key={opt} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'12px 16px', borderRadius:10, cursor:'pointer',
            border:`1.5px solid ${sel ? C.blue : C.border}`,
            background: sel ? C.lightBg : C.white,
            transition:'all 0.12s', minHeight:48
          }}>
            <div style={{
              width:20, height:20, borderRadius:5, flexShrink:0,
              border:`2px solid ${sel ? C.blue : C.border}`,
              background: sel ? C.blue : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.12s'
            }}>
              {sel && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <input type="checkbox" checked={sel} onChange={() => toggle(opt)}
              style={{ position:'absolute', opacity:0, pointerEvents:'none' }} />
            <span style={{ fontSize:14, color: sel ? C.navy : C.textPri, fontWeight: sel ? 600 : 400, lineHeight:1.4 }}>{opt}</span>
          </label>
        )
      })}
    </div>
  )
}

const ScaleQ = ({ q, value, onChange }) => (
  <div>
    <div style={{ display:'flex', gap:10, justifyContent:'center', margin:'8px 0' }}>
      {Array.from({ length: q.max - q.min + 1 }, (_, i) => i + q.min).map(n => {
        const sel = value === n
        return (
          <button key={n} type="button" onClick={() => onChange(n)} style={{
            width:52, height:52, borderRadius:12, border:`2px solid ${sel ? C.blue : C.border}`,
            background: sel ? C.blue : C.white, cursor:'pointer',
            fontSize:18, fontWeight:800, color: sel ? C.white : C.textSec,
            transition:'all 0.12s', flexShrink:0
          }}>{n}</button>
        )
      })}
    </div>
    <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
      <span style={{ fontSize:11, color:C.gray }}>{q.minLabel}</span>
      <span style={{ fontSize:11, color:C.gray }}>{q.maxLabel}</span>
    </div>
  </div>
)

const SelectQ = ({ q, value, onChange }) => (
  <select value={value || ''} onChange={e => onChange(e.target.value)} style={{
    width:'100%', padding:'14px 16px', borderRadius:10, fontSize:15,
    border:`1.5px solid ${value ? C.blue : C.border}`,
    background:C.white, color: value ? C.textPri : C.gray,
    fontFamily:'inherit', outline:'none', appearance:'none',
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M0 0l6 8 6-8z' fill='%238C9EAD'/%3E%3C/svg%3E")`,
    backgroundRepeat:'no-repeat', backgroundPosition:'right 14px center', paddingRight:38,
    minHeight:48
  }}>
    <option value="">Seleccionar...</option>
    {q.options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
)

const TextQ = ({ q, value, onChange }) => (
  <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={q.placeholder || ''}
    style={{
      width:'100%', padding:'14px 16px', borderRadius:10, fontSize:15,
      border:`1.5px solid ${value ? C.blue : C.border}`,
      background:C.white, color:C.textPri, fontFamily:'inherit',
      outline:'none', minHeight:48
    }} />
)

const TextareaQ = ({ q, value, onChange }) => (
  <textarea value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={q.placeholder || ''}
    rows={4} style={{
      width:'100%', padding:'14px 16px', borderRadius:10, fontSize:15,
      border:`1.5px solid ${value ? C.blue : C.border}`,
      background:C.white, color:C.textPri, fontFamily:'inherit',
      outline:'none', resize:'vertical', lineHeight:1.6, minHeight:100
    }} />
)

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Survey({ onSubmit, onCancel }) {
  const [initialDraft]  = useState(loadDraft)
  const hasDraft = !!(initialDraft && (initialDraft.step > 0 || Object.keys(initialDraft.answers || {}).length > 0))
  const [showResume, setShowResume] = useState(hasDraft)

  const [step, setStep]         = useState(0)
  const [answers, setAnswers]   = useState({})
  const [errors, setErrors]     = useState({})
  const [completed, setCompleted] = useState(false)
  const [savedResponse, setSavedResponse] = useState(null)
  const scrollRef = React.useRef(null)

  // Auto-save en cada cambio; limpiar al completar
  useEffect(() => {
    if (completed) {
      clearDraft()
    } else if (step > 0 || Object.keys(answers).length > 0) {
      saveDraft(step, answers)
    }
  }, [step, answers, completed])

  const totalSteps = SURVEY_SECTIONS.length
  const section    = SURVEY_SECTIONS[step]
  const isLast     = step === totalSteps - 1

  const set = (id, val) => {
    setAnswers(prev => ({ ...prev, [id]: val }))
    setErrors(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const validate = () => {
    const errs = {}
    for (const q of section.questions) {
      if (!q.required) continue
      const v = answers[q.id]
      if (!v || (Array.isArray(v) && v.length === 0)) errs[q.id] = true
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validate()) return
    if (isLast) {
      const resp = buildResponseFromSurvey(answers)
      setSavedResponse(resp)
      onSubmit(resp)
      setCompleted(true)
    } else {
      setStep(s => s + 1)
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const back = () => { setStep(s => s - 1); scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }) }

  const renderQuestion = (q) => {
    const val  = answers[q.id]
    const err  = errors[q.id]
    const change = (v) => set(q.id, v)
    return (
      <div key={q.id} style={{ marginBottom:28 }}>
        <div style={{ marginBottom:10 }}>
          <span style={{ fontSize:15, fontWeight:600, color:C.textPri, lineHeight:1.45, display:'block' }}>
            {q.label}
            {q.required && <span style={{ color:C.danger, marginLeft:4 }}>*</span>}
            {!q.required && <span style={{ color:C.gray, fontSize:12, marginLeft:6 }}>(Opcional)</span>}
          </span>
          {err && <span style={{ fontSize:12, color:C.danger, marginTop:4, display:'block' }}>Por favor, responda esta pregunta</span>}
        </div>
        {q.type === 'radio'    && <RadioQ    q={q} value={val}      onChange={change} />}
        {q.type === 'checkbox' && <CheckboxQ q={q} value={val||[]}  onChange={change} />}
        {q.type === 'scale'    && <ScaleQ    q={q} value={val}      onChange={change} />}
        {q.type === 'select'   && <SelectQ   q={q} value={val}      onChange={change} />}
        {q.type === 'text'     && <TextQ     q={q} value={val}      onChange={change} />}
        {q.type === 'textarea' && <TextareaQ q={q} value={val}      onChange={change} />}
        {err && <div style={{ marginTop:6, padding:'8px 12px', background:'#FEF2F2', borderRadius:8, fontSize:12, color:C.danger }}>
          Este campo es obligatorio
        </div>}
      </div>
    )
  }

  // Pantalla de retomar encuesta
  if (showResume && hasDraft) {
    const draftSection = SURVEY_SECTIONS[initialDraft.step] || SURVEY_SECTIONS[0]
    const pctDraft = Math.round((initialDraft.step / SURVEY_SECTIONS.length) * 100)
    return (
      <div style={{ height:'100vh', overflowY:'auto', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ maxWidth:460, width:'100%', background:C.white, borderRadius:20, padding:'36px 28px', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', position:'relative' }}>
          <button onClick={onCancel} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', cursor:'pointer', padding:4, color:C.gray, display:'flex', alignItems:'center' }}>
            <Icon name="close" size={18} color={C.gray} />
          </button>
          <div style={{ width:64, height:64, borderRadius:'50%', background:C.blue+'15', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 style={{ fontSize:20, fontWeight:800, color:C.navy, marginBottom:8 }}>Tienes una encuesta en curso</h2>
          <p style={{ fontSize:14, color:C.textSec, lineHeight:1.6, marginBottom:16 }}>
            Te quedaste en la sección <strong>{initialDraft.step + 1} de {SURVEY_SECTIONS.length}</strong>
          </p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.lightBg, borderRadius:10, padding:'8px 14px', marginBottom:8 }}>
            {draftSection.blockNum && (
              <div style={{ width:20, height:20, borderRadius:5, background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:C.white, flexShrink:0 }}>
                {draftSection.blockNum}
              </div>
            )}
            <span style={{ fontSize:13, fontWeight:600, color:C.navy }}>{draftSection.title}</span>
          </div>
          <div style={{ margin:'12px 0 24px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:11, color:C.gray }}>Progreso guardado</span>
              <span style={{ fontSize:11, fontWeight:700, color:C.blue }}>{pctDraft}%</span>
            </div>
            <div style={{ height:6, background:C.border, borderRadius:6, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pctDraft}%`, background:C.blue, borderRadius:6 }} />
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <button onClick={() => {
              setStep(initialDraft.step)
              setAnswers(initialDraft.answers || {})
              setShowResume(false)
            }} style={{
              padding:'14px 24px', borderRadius:12, border:'none',
              background:C.blue, color:C.white, fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit', minHeight:52
            }}>
              Continúa con la encuesta →
            </button>
            <button onClick={() => {
              clearDraft()
              setShowResume(false)
            }} style={{
              padding:'14px 24px', borderRadius:12,
              border:`1.5px solid ${C.border}`, background:C.white,
              color:C.textSec, fontSize:14, fontWeight:600,
              cursor:'pointer', fontFamily:'inherit', minHeight:52
            }}>
              Realizar nueva encuesta
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de finalización
  if (completed && savedResponse) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div style={{ maxWidth:480, width:'100%', background:C.white, borderRadius:20, padding:'40px 32px', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:C.success+'18', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <Icon name="check" size={36} color={C.success} />
          </div>
          <h2 style={{ fontSize:22, fontWeight:800, color:C.navy, marginBottom:8 }}>¡Encuesta completada!</h2>
          <p style={{ fontSize:14, color:C.textSec, lineHeight:1.6, marginBottom:28 }}>
            Sus respuestas han sido registradas de forma anónima y ya están disponibles en Plantillas y gráficos.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <button onClick={() => downloadSurveyPDF(savedResponse)} style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              padding:'14px 24px', borderRadius:12, border:`1.5px solid ${C.blue}`,
              background:C.white, color:C.blue, fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit', minHeight:52
            }}>
              <Icon name="export" size={18} color={C.blue} />
              Descargar PDF de esta encuesta
            </button>
            <button onClick={onCancel} style={{
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
              padding:'14px 24px', borderRadius:12, border:'none',
              background:C.navy, color:C.white, fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit', minHeight:52
            }}>
              <Icon name="dashboard" size={18} color={C.white} />
              Ver Plantillas y gráficos
            </button>
            <button onClick={() => { setStep(0); setAnswers({}); setErrors({}); setCompleted(false); setSavedResponse(null) }} style={{
              background:'none', border:'none', color:C.gray, fontSize:13,
              cursor:'pointer', fontFamily:'inherit', padding:'8px', marginTop:4
            }}>
              Realizar otra encuesta
            </button>
          </div>
        </div>
      </div>
    )
  }

  const pct = Math.round((step / totalSteps) * 100)

  return (
    <div ref={scrollRef} style={{ height:'100vh', overflowY:'auto', background:C.bg, paddingBottom:100 }}>
      {/* Header fijo */}
      <div style={{ position:'sticky', top:0, zIndex:20, background:C.white, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:680, margin:'0 auto', padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, height:56 }}>
            <button onClick={onCancel} style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:C.gray, display:'flex', alignItems:'center' }}>
              <Icon name="close" size={20} color={C.gray} />
            </button>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <span style={{ fontSize:12, fontWeight:700, color:C.textSec, textTransform:'uppercase', letterSpacing:'0.06em' }}>
                  Sección {step + 1} de {totalSteps}
                </span>
                <span style={{ fontSize:12, color:C.gray }}>{pct}%</span>
              </div>
              <div style={{ height:4, background:C.border, borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:C.blue, borderRadius:4, transition:'width 0.3s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth:680, margin:'0 auto', padding:'28px 20px 20px' }}>
        {/* Cabecera de sección */}
        <div style={{ marginBottom:28 }}>
          {section.blockNum && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:8 }}>
              <div style={{ width:24, height:24, borderRadius:6, background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:C.white }}>
                {section.blockNum}
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:C.blue, textTransform:'uppercase', letterSpacing:'0.06em' }}>Bloque {section.blockNum}</span>
            </div>
          )}
          <h1 style={{ fontSize:22, fontWeight:800, color:C.navy, lineHeight:1.2, margin:'0 0 6px' }}>{section.title}</h1>
          {section.subtitle && <p style={{ fontSize:13, color:C.gray, margin:0 }}>{section.subtitle}</p>}
        </div>

        {/* Preguntas */}
        {section.questions.map(renderQuestion)}
      </div>

      {/* Navegación sticky en mobile */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, zIndex:20,
        background:C.white, borderTop:`1px solid ${C.border}`,
        padding:'14px 20px', display:'flex', gap:12, justifyContent:'space-between',
        maxWidth:680, margin:'0 auto'
      }}>
        <button onClick={back} disabled={step === 0} style={{
          flex: step === 0 ? 0 : 1, padding:'14px 20px', borderRadius:12,
          border:`1.5px solid ${C.border}`, background:C.white,
          color:C.textSec, fontSize:14, fontWeight:600, cursor: step===0 ? 'not-allowed' : 'pointer',
          fontFamily:'inherit', opacity: step === 0 ? 0 : 1, minHeight:52,
          transition:'opacity 0.2s'
        }}>
          ← Anterior
        </button>
        <button onClick={next} style={{
          flex:1, padding:'14px 20px', borderRadius:12, border:'none',
          background: C.blue, color:C.white, fontSize:14, fontWeight:700,
          cursor:'pointer', fontFamily:'inherit', minHeight:52
        }}>
          {isLast ? 'Enviar encuesta ✓' : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}

export { downloadSurveyPDF }
