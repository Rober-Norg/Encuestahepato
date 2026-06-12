// src/supabase.js — Cliente Supabase y funciones de base de datos
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Carga todas las oleadas con sus respuestas
export async function dbLoadWaves() {
  const [{ data: wavesRaw, error: wErr }, { data: respRaw, error: rErr }] = await Promise.all([
    supabase.from('waves').select('*').order('created_at'),
    supabase.from('responses').select('*').order('created_at'),
  ])
  if (wErr) throw wErr
  if (rErr) throw rErr

  return (wavesRaw || []).map(w => ({
    id:        w.id,
    name:      w.name,
    date:      w.date,
    source:    w.source,
    isSample:  w.is_sample,
    responses: (respRaw || [])
      .filter(r => r.wave_id === w.id)
      .map(r => ({
        id:               r.id,
        wave:             r.wave_name,
        date:             r.date,
        fromSurvey:       r.from_survey,
        doctor:           r.doctor   || {},
        answers:          r.answers  || {},
        structuredAnswers: r.structured_answers || undefined,
      })),
  }))
}

// Inserta una oleada completa con todas sus respuestas (importación Excel)
export async function dbInsertWave(wave) {
  const { error: wErr } = await supabase.from('waves').insert({
    id:        wave.id,
    name:      wave.name,
    date:      wave.date,
    source:    wave.source || '',
    is_sample: false,
  })
  if (wErr) throw wErr

  if (wave.responses?.length) {
    const rows = wave.responses.map(r => ({
      id:                 r.id,
      wave_id:            wave.id,
      wave_name:          wave.name,
      date:               r.date,
      from_survey:        r.fromSurvey || false,
      doctor:             r.doctor     || {},
      answers:            r.answers    || {},
      structured_answers: r.structuredAnswers || null,
    }))
    const { error: rErr } = await supabase.from('responses').insert(rows)
    if (rErr) throw rErr
  }
}

// Crea la oleada mensual si no existe y añade una respuesta (encuesta en app)
export async function dbUpsertSurveyResponse(wave, response) {
  // ignoreDuplicates: true → no falla si la oleada ya existe este mes
  const { error: wErr } = await supabase.from('waves').upsert(
    { id: wave.id, name: wave.name, date: wave.date, source: wave.source, is_sample: false },
    { onConflict: 'id', ignoreDuplicates: true }
  )
  if (wErr) throw wErr

  const { error: rErr } = await supabase.from('responses').insert({
    id:                 response.id,
    wave_id:            wave.id,
    wave_name:          wave.name,
    date:               response.date,
    from_survey:        true,
    doctor:             response.doctor     || {},
    answers:            response.answers    || {},
    structured_answers: response.structuredAnswers || null,
  })
  if (rErr) throw rErr
}

// Elimina una oleada (las respuestas se borran en cascada)
export async function dbDeleteWave(waveId) {
  const { error } = await supabase.from('waves').delete().eq('id', waveId)
  if (error) throw error
}

// Elimina una respuesta individual
export async function dbDeleteResponse(responseId) {
  const { error } = await supabase.from('responses').delete().eq('id', responseId)
  if (error) throw error
}
