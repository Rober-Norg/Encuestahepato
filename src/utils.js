// src/utils.js — Procesamiento de texto, clasificación, radar, Excel parser
import { QUESTION_BLOCKS } from './data.js'

const STOP_WORDS = new Set([
  'de','la','el','en','y','a','que','es','se','no','un','una','con','los','las',
  'del','al','por','lo','su','son','más','pero','hay','para','como','si','sus',
  'esto','también','me','le','mi','nos','muy','ya','todo','todos','cada','o','u',
  'e','ni','sin','he','han','ha','ser','este','esta','estos','estas','estar',
  'qué','cómo','cuál','dónde','cuándo','cuando','donde','porque','bien','así',
  'ahí','aquí','son','han','les','algo','sobre','desde','hasta','entre','fue',
  'era','tiene','tienen','nuestro','nuestros','nuestra','nuestras','caso','casos',
  'muchos','muchas','algunos','algunas','solo','siempre','nunca','tampoco','tan','tanto'
])

export function extractWordFrequency(texts, maxWords = 40) {
  const freq = {}
  const combined = (Array.isArray(texts) ? texts : [texts]).join(' ').toLowerCase()
  const words = combined.match(/[a-záéíóúüñ]{4,}/g) || []
  for (const w of words) {
    if (!STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxWords)
    .map(([word, count]) => ({ word, count }))
}

const POS_WORDS = new Set([
  'bueno','buena','buenos','buenas','correcto','correcta','adecuado','adecuada',
  'sistemático','sistemática','protocolizado','protocolizada','fluido','fluida',
  'mejora','mejorar','mejorado','progreso','avance','funciona','funcional',
  'óptimo','óptima','excelente','apropiado','apropiada','accesible','fácil',
  'rápido','rápida','eficiente','coordinado','coordinada','implementado',
  'establecido','establecida','formal','formalizado','estructurado','claro','clara'
])

const NEG_WORDS = new Set([
  'mal','mala','malo','malos','difícil','dificultad','dificultades','problema',
  'problemas','barrera','barreras','falta','carencia','tardío','tardía','tarde',
  'retraso','retrasos','escapa','escapan','olvidada','olvidado','inadecuado',
  'inadecuada','incompleto','incompleta','kafkiano','frustrante','complicado',
  'complicada','obstáculo','obstáculos','brecha','gap','fallo','fallos',
  'incierto','incierta','inequitativo','perdida','pérdida','pierde','nunca',
  'imposible','desconocimiento','abandono'
])

export function computeSentiment(text) {
  if (!text) return { score: 0, label: 'Neutral', pos: 0, neg: 0 }
  const words = text.toLowerCase().match(/[a-záéíóúüñ]{3,}/g) || []
  let pos = 0, neg = 0
  for (const w of words) {
    if (POS_WORDS.has(w)) pos++
    if (NEG_WORDS.has(w)) neg++
  }
  const total = pos + neg
  if (total === 0) return { score: 0, label: 'Neutral', pos, neg }
  const score = (pos - neg) / total
  const label = score > 0.25 ? 'Positivo' : score < -0.25 ? 'Negativo' : 'Neutral'
  return { score, label, pos, neg }
}

const KEYWORD_MAP = {
  identificacion: {
    testing_si:       ['sistemático','sistemática','protocolizado','todos se testan','automáticamente','bien cubierto','completamente implementado'],
    testing_parcial:  ['parcialmente','depende','variabilidad','no siempre','algunos centros','mixto'],
    escape_ap:        ['atención primaria','primaria','médico de familia','médicos de familia','ap ','cabecera'],
    escape_hospital:  ['hospital comarcal','sin hepatólogo','centros sin','digestivo general','segundo nivel','hospitales sin'],
    falta_awareness:  ['desconocimiento','no tienen en el radar','olvidada','no saben','awareness','no piensa','falta de protocolo']
  },
  diagnostico: {
    protocolizado:  ['protocolizado','protocolo','está protocolizado','tenemos protocolo','completamente','sí, completamente','buena adherencia'],
    clinico_dep:    ['depende del clínico','criterio individual','sin protocolo','cada médico','clínico responsable','criterio de cada','no existe ningún'],
    reflex_si:      ['reflex testing','doble reflex','double reflex','automáticamente se solicita','reflex implementado','reflex completo','reflex parcial'],
    reflex_no:      ['no reflex','no utilizamos reflex','no tenemos reflex','sin reflex','nada de reflex','cada médico solicita','manualmente'],
    fallo_rna:      ['rna','confirmación','no se confirma','queda en el anticuerpo','queda en la serología','sin confirmar','anti-vhd positivo no se confirma']
  },
  funnel: {
    perdida_solicitud: ['no se solicita','no se pide','no solicitan','no piden','no piensa en solicitar','nunca lo tienen','al solicitar'],
    perdida_rna:       ['rna','confirmación','anti-vhd positivo sin','queda en la serología','sin confirmar rna','al confirmar con rna'],
    perdida_derivacion:['derivación','no deriva','no se deriva','derivación tardía','no llega a especialista','en la derivación'],
    perdida_seguimiento:['seguimiento','pérdida de seguimiento','pierde de vista','no vuelve','en el seguimiento'],
    perdida_ap:        ['primaria','ap ','médico de familia','queda en ap','sin derivar']
  },
  derivacion: {
    llegan_derivados:     ['derivados','derivación','derivan','llegan derivados','son derivados','derivados por otro'],
    llegan_cribados:      ['cribado','cribados','screening','detección sistemática','por cribado','cribado activo'],
    circuito_claro:       ['circuito formal','circuito claro','circuito bien','circuito establecido','circuito formalizado','sí, un circuito formal'],
    relaciones_personales:['relaciones personales','conocidos','por conocer','informal','oportunismo','conoce al hepatólogo','no, funciona principalmente'],
    sin_circuito:         ['sin circuito','no hay circuito','no existe circuito','sin circuito formal','no existe ningún circuito']
  },
  estadio: {
    temprano:    ['temprano','temprana','precoz','inicial','estadio precoz','estadio temprano','precoces','f0','f1','sin fibrosis'],
    avanzado:    ['avanzado','avanzada','fibrosis','f2','f3','estadio avanzado','intermedio-avanzado','fibrosis moderada'],
    muy_avanzado:['cirrosis','descompensada','terminal','trasplante','hepatocarcinoma','cirrosis establecida','cirrosis compensada','f4'],
    mixto:       ['mixto','variado','variable','algunos precoces','tendencia','algunos en estadio','mezcla de estadios']
  },
  decision: {
    hepatologo:      ['hepatólogo','hepatólogo referente','hepatólogo responsable','decido yo','tomo la decisión','hepatólogo del caso'],
    comite:          ['comité','multidisciplinar','comisión','sesión clínica','equipo multidisciplinar','comité multidisciplinar'],
    consenso:        ['consenso','conjuntamente','colegas','compañeros del servicio','con el equipo','consenso del equipo'],
    especialista_ref:['referente','especialista referente','jefe de sección','de referencia','especialista que lleva']
  },
  acceso: {
    acceso_fluido:     ['fluido','buena relación','pocas dificultades','acceso fluido','razonablemente','buena coordinación','acceso fluido, sin'],
    barrera_admin:     ['administrativas','administrativo','visado de inspección','visado tarda','proceso largo','kafkiano','proceso de implementación'],
    barrera_farmacia:  ['farmacia','farmacia hospitalaria','visado de farmacia','farmacéutico','pone pegas','criterios restrictivos'],
    barrera_clinica:   ['clínicas','selección','criterios clínicos','identificar al candidato','barreras clínicas'],
    multiples_barreras:['múltiples','varios','muchas barreras','todas las barreras','dificultades moderadas','dificultades graves']
  },
  seleccion: {
    fibrosis:         ['cirrosis','fibrosis avanzada','f3','f4','cirrosis activa','fibrosis f2','cirrosis establecida','rna+ con fibrosis'],
    rna_pos:          ['rna+','rna positivo','rna detectable','viremia detectable','viremia positiva','cualquier paciente con rna'],
    viremia_activa:   ['viremia activa','actividad de enfermedad','enfermedad activa','actividad clínica','vhd activo'],
    todos_candidatos: ['todos','cualquier','todo rna+','todos los candidatos','cualquier paciente','todos los pacientes con vhd'],
    individualizado:  ['individualizar','caso a caso','casos individualizados','valorar','individualizado','independientemente del estadio']
  },
  necesidades: {
    mas_diagnostico:['diagnóstico','diagnosticar','testing','test','detección','diagnóstico precoz','más diagnóstico','mejorar el diagnóstico'],
    acceso_tto:     ['tratamiento','acceso al tratamiento','acceso a terapia','visado','fármaco','tto','facilitar el acceso'],
    formacion:      ['formación','educación','educar','formar','awareness','conocimiento','formación médica','más formación'],
    guias:          ['guía','guías','protocolo','recomendaciones','consenso','guía clínica','guías clínicas'],
    protocolo_unif: ['protocolo unificado','protocolo nacional','estandarizar','uniformizar','protocolo simple','protocolo unificado de testing']
  }
}

export function classifyResponse(text, blockId) {
  if (!text || !KEYWORD_MAP[blockId]) return []
  const lower = text.toLowerCase()
  const matched = []
  for (const [catId, keywords] of Object.entries(KEYWORD_MAP[blockId])) {
    for (const kw of keywords) {
      if (lower.includes(kw)) { matched.push(catId); break }
    }
  }
  return matched
}

export function computeRadarData(responses, blockId) {
  const block = QUESTION_BLOCKS.find(b => b.id === blockId)
  if (!block || !responses.length) return null
  const counts = {}
  block.categories.forEach(c => { counts[c.id] = 0 })
  const qids = block.questions.map(q => q.id)
  for (const resp of responses) {
    const allText = qids.map(qid => resp.answers[qid] || '').join(' ')
    const cats = classifyResponse(allText, blockId)
    for (const cid of cats) { if (cid in counts) counts[cid]++ }
  }
  const n = responses.length
  return {
    labels: block.categories.map(c => c.label),
    data:   block.categories.map(c => n > 0 ? Math.round((counts[c.id] / n) * 100) : 0),
    raw: counts, total: n
  }
}

export function computeBlockScore(responses, blockId) {
  const qids = (QUESTION_BLOCKS.find(b => b.id === blockId)?.questions || []).map(q => q.id)
  if (!responses.length) return 5
  let total = 0
  for (const r of responses) {
    const text = qids.map(qid => r.answers[qid] || '').join(' ')
    total += computeSentiment(text).score
  }
  const avg = total / responses.length
  return Math.max(0, Math.min(10, Math.round(((avg + 1) * 5) * 10) / 10))
}

export function computeOverviewRadar(responses) {
  return {
    labels: QUESTION_BLOCKS.map(b => b.short),
    data:   QUESTION_BLOCKS.map(b => computeBlockScore(responses, b.id))
  }
}

export function parseExcelFile(arrayBuffer) {
  try {
    const XLSX = window.__XLSX || (typeof require !== 'undefined' ? require('xlsx') : null)
    // Use dynamic import via the xlsx npm package
    const XLSXmod = window._xlsxModule
    const wb = XLSXmod.read(arrayBuffer, { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSXmod.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    if (rows.length < 2) return []
    const headers = rows[0].map(h => String(h).toLowerCase().trim())
    const idx = (terms) => headers.findIndex(h => terms.some(t => h.includes(t)))
    const nombreIdx     = idx(['nombre','name','doctor','médico','medico'])
    const hospitalIdx   = idx(['hospital','centro'])
    const regionIdx     = idx(['comunidad','región','region','provincia'])
    const especialidadIdx = idx(['especialidad','perfil','especialista'])
    const metaSet = new Set([0, nombreIdx, hospitalIdx, regionIdx, especialidadIdx].filter(i => i >= 0))
    const answerCols = headers.map((_, i) => i).filter(i => !metaSet.has(i))
    const allQids = QUESTION_BLOCKS.flatMap(b => b.questions.map(q => q.id))
    const responses = []
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r]
      if (!row.some(v => String(v).trim())) continue
      const answers = {}
      answerCols.forEach((colIdx, ai) => {
        const qid = allQids[ai]
        if (qid) answers[qid] = String(row[colIdx] || '').trim()
      })
      responses.push({
        id: `imp_${Date.now()}_${r}`,
        wave: 'Importado',
        date: new Date().toISOString().split('T')[0],
        doctor: {
          nombre:       nombreIdx >= 0 ? String(row[nombreIdx] || `Doctor ${r}`).trim() : `Doctor ${r}`,
          hospital:     hospitalIdx >= 0 ? String(row[hospitalIdx] || '').trim() : '',
          region:       regionIdx >= 0 ? String(row[regionIdx] || '').trim() : '',
          especialidad: especialidadIdx >= 0 ? String(row[especialidadIdx] || '').trim() : ''
        },
        answers
      })
    }
    return responses
  } catch(e) {
    console.error('Error parsing Excel:', e)
    return []
  }
}

export function filterResponses(responses, filters = {}) {
  return responses.filter(r => {
    if (filters.region && filters.region !== 'all' && r.doctor.region !== filters.region) return false
    if (filters.especialidad && filters.especialidad !== 'all' && r.doctor.especialidad !== filters.especialidad) return false
    if (filters.hospital && filters.hospital !== 'all' && r.doctor.hospital !== filters.hospital) return false
    if (filters.wave && filters.wave !== 'all' && r.wave !== filters.wave) return false
    return true
  })
}

export function getUniqueValues(responses, field) {
  return [...new Set(responses.map(r => r.doctor[field]).filter(Boolean))].sort()
}

export function getSpecialtyDistribution(responses) {
  const counts = {}
  for (const r of responses) {
    const s = r.doctor.especialidad || 'Otro'
    counts[s] = (counts[s] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export function getRegionDistribution(responses) {
  const counts = {}
  for (const r of responses) {
    const reg = r.doctor.region || 'Sin región'
    counts[reg] = (counts[reg] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
}

export function getSentimentByBlock(responses) {
  return QUESTION_BLOCKS.map(block => {
    const qids = block.questions.map(q => q.id)
    if (!responses.length) return { block: block.short, fullTitle: block.title, score: 0, label: 'Neutral' }
    let total = 0
    for (const r of responses) {
      const text = qids.map(qid => r.answers[qid] || '').join(' ')
      total += computeSentiment(text).score
    }
    const avg = total / responses.length
    return {
      block: block.short, fullTitle: block.title,
      score: Math.round(avg * 100) / 100,
      label: avg > 0.15 ? 'Positivo' : avg < -0.15 ? 'Negativo' : 'Neutral'
    }
  })
}
