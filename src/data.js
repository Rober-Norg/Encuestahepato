// src/data.js — Bloques de preguntas, regiones, especialidades, datos de muestra

export const QUESTION_BLOCKS = [
  {
    id: 'identificacion', num: 1, title: 'Identificación de Pacientes', short: 'Identificación',
    questions: [
      { id: 'b1_q1', text: '¿Cree que hoy todos los pacientes con VHB se están testando sistemáticamente para VHD?' },
      { id: 'b1_q2', text: '¿Dónde cree que más pacientes con VHD se están escapando del sistema actualmente?' }
    ],
    categories: [
      { id: 'testing_si', label: 'Testing sistemático' },
      { id: 'testing_parcial', label: 'Testing parcial' },
      { id: 'escape_ap', label: 'Escapes en AP' },
      { id: 'escape_hospital', label: 'Escapes en hospital' },
      { id: 'falta_awareness', label: 'Falta de awareness' }
    ]
  },
  {
    id: 'diagnostico', num: 2, title: 'Diagnóstico y Testing', short: 'Diagnóstico',
    questions: [
      { id: 'b2_q3', text: 'En su hospital, ¿el test de VHD está protocolizado o depende del clínico?' },
      { id: 'b2_q4', text: '¿Se utiliza reflex testing o double reflex en su centro?' },
      { id: 'b2_q5', text: 'En la práctica, ¿qué falla más: que no se pida el test o que no se confirme con RNA?' }
    ],
    categories: [
      { id: 'protocolizado', label: 'Protocolizado' },
      { id: 'clinico_dep', label: 'Dep. del clínico' },
      { id: 'reflex_si', label: 'Con reflex testing' },
      { id: 'reflex_no', label: 'Sin reflex testing' },
      { id: 'fallo_rna', label: 'Fallo confirmación RNA' }
    ]
  },
  {
    id: 'funnel', num: 3, title: 'Funnel Diagnóstico', short: 'Funnel',
    questions: [
      { id: 'b3_q6', text: 'Desde que un paciente es HBsAg positivo, ¿en qué punto se pierden más pacientes hasta confirmar VHD?' }
    ],
    categories: [
      { id: 'perdida_solicitud', label: 'No se solicita anti-VHD' },
      { id: 'perdida_rna', label: 'No se confirma RNA' },
      { id: 'perdida_derivacion', label: 'Pérdida en derivación' },
      { id: 'perdida_seguimiento', label: 'Pérdida de seguimiento' },
      { id: 'perdida_ap', label: 'Filtro en AP' }
    ]
  },
  {
    id: 'derivacion', num: 4, title: 'Derivación y Organización', short: 'Derivación',
    questions: [
      { id: 'b4_q7', text: '¿Cómo suelen llegarle los pacientes con VHD: derivados, cribados o por iniciativa propia?' },
      { id: 'b4_q8', text: '¿Existe un circuito claro de derivación o depende más de relaciones entre profesionales?' }
    ],
    categories: [
      { id: 'llegan_derivados', label: 'Llegan derivados' },
      { id: 'llegan_cribados', label: 'Por cribado activo' },
      { id: 'circuito_claro', label: 'Circuito claro' },
      { id: 'relaciones_personales', label: 'Vía relaciones personales' },
      { id: 'sin_circuito', label: 'Sin circuito definido' }
    ]
  },
  {
    id: 'estadio', num: 5, title: 'Estadio de la Enfermedad', short: 'Estadio',
    questions: [
      { id: 'b5_q9', text: '¿En qué estadio suelen llegarle los pacientes con VHD: temprano o ya avanzado?' }
    ],
    categories: [
      { id: 'temprano', label: 'Estadio temprano' },
      { id: 'avanzado', label: 'Estadio avanzado' },
      { id: 'muy_avanzado', label: 'Muy avanzado / cirrosis' },
      { id: 'mixto', label: 'Estadio mixto' }
    ]
  },
  {
    id: 'decision', num: 6, title: 'Decisión de Tratamiento', short: 'Decisión',
    questions: [
      { id: 'b6_q10', text: 'En su hospital, ¿quién decide realmente iniciar tratamiento en estos pacientes?' }
    ],
    categories: [
      { id: 'hepatologo', label: 'Hepatólogo' },
      { id: 'comite', label: 'Comité multidisciplinar' },
      { id: 'consenso', label: 'Consenso equipo' },
      { id: 'especialista_ref', label: 'Especialista referente' }
    ]
  },
  {
    id: 'acceso', num: 7, title: 'Acceso al Tratamiento', short: 'Acceso',
    questions: [
      { id: 'b7_q11', text: '¿Tiene dificultades para tratar a todos los pacientes que considera candidatos?' },
      { id: 'b7_q12', text: '¿Qué barreras encuentra para iniciar tratamiento: clínicas, administrativas o de farmacia?' }
    ],
    categories: [
      { id: 'acceso_fluido', label: 'Acceso fluido' },
      { id: 'barrera_admin', label: 'Barreras administrativas' },
      { id: 'barrera_farmacia', label: 'Barreras de farmacia' },
      { id: 'barrera_clinica', label: 'Barreras clínicas' },
      { id: 'multiples_barreras', label: 'Múltiples barreras' }
    ]
  },
  {
    id: 'seleccion', num: 8, title: 'Selección de Pacientes', short: 'Selección',
    questions: [
      { id: 'b8_q13', text: '¿En qué tipo de pacientes consideraría más claro iniciar tratamiento hoy?' }
    ],
    categories: [
      { id: 'fibrosis', label: 'Fibrosis / cirrosis' },
      { id: 'rna_pos', label: 'RNA+ detectable' },
      { id: 'viremia_activa', label: 'Con viremia activa' },
      { id: 'todos_candidatos', label: 'Todos los RNA+' },
      { id: 'individualizado', label: 'Casos individualizados' }
    ]
  },
  {
    id: 'necesidades', num: 9, title: 'Necesidades No Cubiertas', short: 'Necesidades',
    questions: [
      { id: 'b9_q14', text: '¿Cuál diría que es la principal necesidad no cubierta actualmente en hepatitis D?' },
      { id: 'b9_q15', text: '¿Qué cree que ayudaría más a mejorar el manejo de estos pacientes en su centro?' }
    ],
    categories: [
      { id: 'mas_diagnostico', label: 'Más diagnóstico' },
      { id: 'acceso_tto', label: 'Acceso al tratamiento' },
      { id: 'formacion', label: 'Formación médica' },
      { id: 'guias', label: 'Guías clínicas' },
      { id: 'protocolo_unif', label: 'Protocolo unificado' }
    ]
  }
]

export const REGIONS = [
  'Andalucía','Aragón','Asturias','Baleares','Canarias','Cantabria',
  'Castilla-La Mancha','Castilla y León','Cataluña','Comunidad Valenciana',
  'Extremadura','Galicia','La Rioja','Madrid','Murcia','Navarra','País Vasco'
]

export const SPECIALTIES = ['Hepatólogo', 'Gastroenterólogo', 'Internista', 'Infectólogo', 'Otro']

export const SAMPLE_RESPONSES = [
  {
    id:'s001', wave:'Oleada 1 - Ene 2026', date:'2026-01-15',
    doctor:{ nombre:'Dr. García Martínez', hospital:'Hospital La Paz', region:'Madrid', especialidad:'Hepatólogo' },
    answers:{
      b1_q1:'No. El testing no es sistemático. Hay una falta de awareness importante en todos los niveles asistenciales.',
      b1_q2:'Principalmente en atención primaria. Los médicos de familia no siempre derivan ni solicitan anti-VHD.',
      b2_q3:'Tenemos protocolo escrito pero la adherencia es baja. Depende mucho del clínico en la práctica.',
      b2_q4:'No utilizamos reflex testing. Cada médico decide individualmente qué solicitar.',
      b2_q5:'Ambas cosas fallan, pero sobre todo la confirmación con RNA tras anti-VHD positivo.',
      b3_q6:'El mayor problema es que no se solicita el anti-VHD al diagnosticar VHB. Ahí se pierde la mayoría.',
      b4_q7:'La mayoría llegan derivados desde digestivo o hepatología de otros centros.',
      b4_q8:'No hay circuito formal. Funciona por relaciones personales entre especialistas.',
      b5_q9:'La mayoría llegan en estadio avanzado, ya con fibrosis significativa o cirrosis establecida.',
      b6_q10:'El hepatólogo de referencia toma la decisión. Casos complejos los consensuamos con el equipo.',
      b7_q11:'Sí, hay dificultades. El visado de inspección es el cuello de botella principal.',
      b7_q12:'Las barreras administrativas y de farmacia son las principales. El visado tarda semanas.',
      b8_q13:'Pacientes con RNA+ y fibrosis avanzada son los candidatos más claros actualmente.',
      b9_q14:'Aumentar el diagnóstico. Muchos pacientes con VHD no saben que tienen la infección.',
      b9_q15:'Un protocolo unificado de derivación y reflex testing automático desde atención primaria.'
    }
  },
  {
    id:'s002', wave:'Oleada 1 - Ene 2026', date:'2026-01-16',
    doctor:{ nombre:'Dra. López Fernández', hospital:'Hospital Clínic', region:'Cataluña', especialidad:'Hepatólogo' },
    answers:{
      b1_q1:'En nuestro centro sí, tenemos protocolo sistemático. Todos los VHB+ se testan para VHD automáticamente.',
      b1_q2:'Los escapes son en hospitales sin protocolo, especialmente centros comarcales sin hepatólogo.',
      b2_q3:'Está protocolizado y funciona bien. Tenemos reflex testing implementado con el laboratorio.',
      b2_q4:'Sí, utilizamos doble reflex. HBsAg+ → anti-VHD → si positivo, RNA automáticamente.',
      b2_q5:'Con nuestro sistema de reflex esto está controlado. El fallo está en la derivación posterior.',
      b3_q6:'En nuestro caso el problema está en la derivación para tratamiento, no en el diagnóstico.',
      b4_q7:'Llegan principalmente por cribado sistemático o derivados de centros sin hepatólogo.',
      b4_q8:'Tenemos circuito formal bien establecido con los centros de referencia del área.',
      b5_q9:'Mixto. Gracias al cribado detectamos algunos en estadio temprano, pero muchos siguen llegando avanzados.',
      b6_q10:'Comité de hepatología, decisión multidisciplinar con todos los especialistas.',
      b7_q11:'El acceso es fluido en nuestro centro. Buena relación con farmacia hospitalaria.',
      b7_q12:'Las barreras clínicas son las principales: identificar bien al candidato ideal.',
      b8_q13:'Todos los pacientes con RNA detectable y actividad de enfermedad deberían ser candidatos.',
      b9_q14:'El diagnóstico es la gran necesidad. Estamos viendo solo la punta del iceberg.',
      b9_q15:'Extender el modelo de reflex testing a todos los centros. Es coste-efectivo y salva vidas.'
    }
  },
  {
    id:'s003', wave:'Oleada 1 - Ene 2026', date:'2026-01-17',
    doctor:{ nombre:'Dr. Martínez Ruiz', hospital:'H. Gregorio Marañón', region:'Madrid', especialidad:'Gastroenterólogo' },
    answers:{
      b1_q1:'No. La mayoría de pacientes con VHB crónico en seguimiento por digestivo no tienen test de VHD.',
      b1_q2:'En digestivo general. Los hepatólogos son más conscientes pero los gastros no siempre lo pedimos.',
      b2_q3:'Depende totalmente del clínico. No tenemos protocolo formal en el servicio de digestivo.',
      b2_q4:'No, no tenemos reflex testing implementado en nuestro hospital.',
      b2_q5:'Lo primero: que no se pide el test. Es el problema más común y más evitable.',
      b3_q6:'El primer paso: que el médico que sigue al VHB piense en solicitar el anti-VHD.',
      b4_q7:'Llegan derivados por hepatología cuando se detecta casualmente en revisiones.',
      b4_q8:'Depende de relaciones personales. No hay circuito estructurado ni formalizado.',
      b5_q9:'Los pocos casos que veo llegan avanzados. No existe diagnóstico precoz en mi consulta.',
      b6_q10:'Derivo todo a hepatología para la decisión de tratamiento.',
      b7_q11:'No trato directamente. Mis compañeros de hepatología me comentan dificultades frecuentes.',
      b7_q12:'Según compañeros, las barreras son principalmente administrativas y de farmacia.',
      b8_q13:'Tendría que consultar a hepatología. No es mi área de mayor expertise en VHD.',
      b9_q14:'Formación de los gastroenterólogos generales. No siempre pensamos en VHD como diagnóstico.',
      b9_q15:'Formación continuada y protocolos simples de testing en los servicios de digestivo general.'
    }
  },
  {
    id:'s004', wave:'Oleada 1 - Ene 2026', date:'2026-01-18',
    doctor:{ nombre:'Dr. Rodríguez Silva', hospital:'H. Virgen del Rocío', region:'Andalucía', especialidad:'Hepatólogo' },
    answers:{
      b1_q1:'No de forma sistemática. Hay mucha variabilidad entre centros y entre profesionales.',
      b1_q2:'En toda la cadena asistencial: AP, urgencias, digestivo general. No hay un único punto de fuga.',
      b2_q3:'Estamos trabajando para protocolizarlo pero aún no está completamente implementado en el centro.',
      b2_q4:'No, el reflex testing requiere coordinación con laboratorio que aún no hemos logrado establecer.',
      b2_q5:'En nuestra área lo que más falla es la confirmación con RNA. Queda en el anticuerpo sin seguir.',
      b3_q6:'La pérdida ocurre en la confirmación viral: anti-VHD positivo sin RNA posterior.',
      b4_q7:'Mixto: algunos derivados, alguno de cribado, muy pocos por iniciativa propia del paciente.',
      b4_q8:'Hay un circuito en desarrollo pero no está formalizado todavía ni comunicado a todos.',
      b5_q9:'Mayoritariamente avanzado. La cirrosis ya establecida es el estadio más frecuente en mi consulta.',
      b6_q10:'El hepatólogo con apoyo del equipo. Decido yo pero consulto con los colegas del servicio.',
      b7_q11:'Sí, hay dificultades. La aprobación de farmacia hospitalaria puede tomar semanas.',
      b7_q12:'El visado de inspección es la barrera principal. Proceso largo, incierto y frustrante.',
      b8_q13:'Pacientes con RNA+ detectable, especialmente los que tienen fibrosis F2 o superior.',
      b9_q14:'Acceso al tratamiento más ágil. Las barreras administrativas son frustrantes para todos.',
      b9_q15:'Simplificar el proceso de acceso al tratamiento y crear un registro nacional de pacientes con VHD.'
    }
  },
  {
    id:'s005', wave:'Oleada 1 - Ene 2026', date:'2026-01-19',
    doctor:{ nombre:'Dr. Sánchez Torres', hospital:'H. 12 de Octubre', region:'Madrid', especialidad:'Internista' },
    answers:{
      b1_q1:'Definitivamente no. La mayoría de los infectados por VHD están sin diagnosticar en toda España.',
      b1_q2:'Los pacientes inmigrantes y PWID son los que más se pierden. Tienen dificultades de acceso al sistema.',
      b2_q3:'En medicina interna no tenemos protocolo específico de VHD. Criterio clínico individual.',
      b2_q4:'No, no aplicamos reflex testing en nuestra unidad de medicina interna.',
      b2_q5:'Ambas cosas, pero sobre todo que no se pide el test inicial ante el diagnóstico de VHB.',
      b3_q6:'El paso inicial: que alguien piense en solicitar el anti-VHD al VHB positivo.',
      b4_q7:'En mi caso llegan derivados de AP o de urgencias, raramente cribados de forma activa.',
      b4_q8:'No hay circuito formal. Es puro oportunismo clínico y relaciones personales entre médicos.',
      b5_q9:'Siempre en estadio avanzado. Nunca veo casos en estadio temprano desde medicina interna.',
      b6_q10:'Yo decido pero con apoyo de hepatología. Para los casos complejos siempre consulto.',
      b7_q11:'Sí, bastantes dificultades. El acceso no es equitativo ni homogéneo entre centros.',
      b7_q12:'La barrera principal es el desconocimiento del proceso de solicitud del tratamiento.',
      b8_q13:'Cualquier paciente con viremia detectable y afectación hepática significativa.',
      b9_q14:'Formación de médicos no especialistas en VHD. Hay mucho desconocimiento generalizado.',
      b9_q15:'Protocolo simple para medicina interna que facilite diagnóstico y acceso al tratamiento.'
    }
  },
  {
    id:'s006', wave:'Oleada 1 - Ene 2026', date:'2026-01-20',
    doctor:{ nombre:"Dra. González Pérez", hospital:"H. Vall d'Hebron", region:'Cataluña', especialidad:'Hepatólogo' },
    answers:{
      b1_q1:'En nuestro centro buen nivel de testing, pero a nivel nacional el gap es enorme.',
      b1_q2:'Los centros sin hepatólogo dedicado son la mayor fuente de escapes en el sistema.',
      b2_q3:'Completamente protocolizado en nuestro servicio. Todos los VHB+ tienen estudio completo de VHD.',
      b2_q4:'Sí, doble reflex testing implementado y funciona correctamente con el laboratorio.',
      b2_q5:'Con nuestro sistema de reflex esto no es un problema. El fallo está en derivación a centros referencia.',
      b3_q6:'El problema es la derivación desde centros comarcales que no tienen protocolo de VHD.',
      b4_q7:'Principalmente derivados de otros centros o detectados en nuestro cribado activo.',
      b4_q8:'Tenemos circuito formal con algunos centros del área, pero no con todos todavía.',
      b5_q9:'Mixto, con tendencia a más diagnósticos precoces gracias al cribado sistemático.',
      b6_q10:'Hepatólogo con revisión por el equipo multidisciplinar en sesión clínica semanal.',
      b7_q11:'Pocas dificultades en nuestro centro. Buena coordinación con farmacia hospitalaria.',
      b7_q12:'Las barreras son mínimas en nuestro caso, más coordinación que obstáculos administrativos.',
      b8_q13:'RNA positivo como criterio central, luego valorar grado de fibrosis y actividad clínica.',
      b9_q14:'Testing universal en todos los VHB+ independientemente del centro donde se sigan.',
      b9_q15:'Red de derivación formalizada y formación a nivel de AP y urgencias en toda España.'
    }
  },
  {
    id:'s007', wave:'Oleada 1 - Ene 2026', date:'2026-01-21',
    doctor:{ nombre:'Dr. Hernández Castro', hospital:'H. Reina Sofía', region:'Andalucía', especialidad:'Hepatólogo' },
    answers:{
      b1_q1:'No en absoluto. Diría que menos del 50% de los VHB en España tienen test de VHD.',
      b1_q2:'La mayor fuga está en atención primaria. Los médicos de familia no tienen la VHD en el radar.',
      b2_q3:'Dependiente del clínico. Tenemos recomendaciones internas pero no protocolo vinculante.',
      b2_q4:'No. El reflex testing sería ideal pero requiere cambios en los sistemas de laboratorio del hospital.',
      b2_q5:'Que no se pide el test anti-VHD. Eso es lo que más falla en nuestra zona geográfica.',
      b3_q6:'Que el VHB positivo nunca llega a especialista. Queda en AP sin derivación al hospital.',
      b4_q7:'Derivados principalmente. Casi nunca por iniciativa propia del paciente con VHD.',
      b4_q8:'Sin circuito formal. Todo depende de si el médico derivante conoce al hepatólogo.',
      b5_q9:'Siempre avanzados. Cirrosis compensada en el mejor caso, descompensada en los peores.',
      b6_q10:'El hepatólogo referente. Somos dos hepatólogos y decidimos conjuntamente los casos.',
      b7_q11:'Sí, hay barreras importantes. La farmacia hospitalaria pone pegas y el visado es complicado.',
      b7_q12:'Farmacia y administrativas. El visado de inspección es kafkiano y consume tiempo.',
      b8_q13:'Cirrosis activa y pacientes jóvenes con RNA+ aunque la fibrosis no sea muy avanzada.',
      b9_q14:'El diagnóstico es el gran problema no resuelto. Luego vendrá el acceso al tratamiento.',
      b9_q15:'Campaña de formación a nivel nacional para médicos de AP y urgencias sobre VHD.'
    }
  },
  {
    id:'s008', wave:'Oleada 1 - Ene 2026', date:'2026-01-22',
    doctor:{ nombre:'Dra. Jiménez Moreno', hospital:'H. Virgen Arrixaca', region:'Murcia', especialidad:'Gastroenterólogo' },
    answers:{
      b1_q1:'No. En nuestra región hay una importante falta de testing sistemático en todos los niveles.',
      b1_q2:'En nuestra región principalmente en atención primaria y hospitales comarcales sin hepatología.',
      b2_q3:'No tenemos protocolo formal. Depende completamente del criterio del clínico responsable.',
      b2_q4:'No, nada de reflex testing en nuestro hospital actualmente.',
      b2_q5:'Que no se pide el anti-VHD. No está en la mente de muchos médicos del área.',
      b3_q6:'Que el VHB positivo no se deriva a digestivo o hepatología en muchos casos de AP.',
      b4_q7:'Principalmente derivados, casi nunca llegan cribados de forma proactiva.',
      b4_q8:'Sin circuito claro. Las derivaciones funcionan por conocidos y relaciones personales.',
      b5_q9:'Avanzados. Normalmente ya con cirrosis o fibrosis severa cuando llegan a mi consulta.',
      b6_q10:'Yo decido con apoyo de hepatología de referencia para los casos más complejos.',
      b7_q11:'Bastantes dificultades. Somos un hospital sin hepatología de referencia propia.',
      b7_q12:'Barreras administrativas y desconocimiento del proceso. No sabemos bien cómo solicitar el tratamiento.',
      b8_q13:'Pacientes con RNA+ y con enfermedad hepática activa en cualquier estadio.',
      b9_q14:'Formación médica en todos los niveles. VHD es una enfermedad olvidada y abandonada.',
      b9_q15:'Formación, protocolos simples y una red de referencia clara y accesible para todos.'
    }
  },
  {
    id:'s009', wave:'Oleada 1 - Ene 2026', date:'2026-01-23',
    doctor:{ nombre:'Dr. Fernández López', hospital:'H. Miguel Servet', region:'Aragón', especialidad:'Hepatólogo' },
    answers:{
      b1_q1:'No de manera sistemática. Mucha dependencia del médico concreto que lleva el caso.',
      b1_q2:'En urgencias y en medicina interna. También en AP por desconocimiento del proceso.',
      b2_q3:'Estamos en proceso de protocolizarlo con el servicio de laboratorio.',
      b2_q4:'En proceso de implementación del reflex testing con el laboratorio del hospital.',
      b2_q5:'Los dos fallan, pero el no confirmar con RNA es especialmente problemático en nuestra área.',
      b3_q6:'La solicitud del RNA tras anti-VHD positivo. Se queda en la serología sin confirmar.',
      b4_q7:'Mixto. Algunos derivados desde otros centros, algunos detectados en seguimiento de VHB.',
      b4_q8:'Trabajando en establecer circuitos formales con los centros del área. Aún incipiente.',
      b5_q9:'Mayoritariamente estadio intermedio-avanzado. Algunos tempranos por cribado activo.',
      b6_q10:'El hepatólogo responsable del caso toma la decisión final con el equipo.',
      b7_q11:'Dificultades moderadas. El proceso ha mejorado últimamente pero sigue siendo lento.',
      b7_q12:'Las barreras administrativas son las principales. El visado de farmacia hospitalaria.',
      b8_q13:'RNA positivo con viremia detectable. La fibrosis no debería ser el único criterio.',
      b9_q14:'Acceso al tratamiento más ágil y protocolos diagnósticos en todos los centros.',
      b9_q15:'Sistema de reflex testing generalizado y vías rápidas de acceso al tratamiento.'
    }
  },
  {
    id:'s010', wave:'Oleada 1 - Ene 2026', date:'2026-01-24',
    doctor:{ nombre:'Dra. Díaz Ramírez', hospital:'H. Ramón y Cajal', region:'Madrid', especialidad:'Hepatólogo' },
    answers:{
      b1_q1:'No completamente. Hay gaps importantes especialmente en hospitales de segundo nivel.',
      b1_q2:'En hospitales sin hepatología especializada y en AP donde no se deriva el VHB positivo.',
      b2_q3:'Protocolizado en nuestro servicio desde hace dos años. Funciona razonablemente bien.',
      b2_q4:'Tenemos reflex testing implementado aunque no el double reflex completo todavía.',
      b2_q5:'En nuestro protocolo está bien cubierto. El fallo está fuera de nuestro centro.',
      b3_q6:'El primer nivel: que se solicite el anti-VHD al VHB positivo. Muchos VHB nunca lo tienen.',
      b4_q7:'La mayoría derivados desde otros centros. Algunos detectados en nuestro programa de cribado.',
      b4_q8:'Circuito establecido con algunos centros del área. Falta extenderlo a todos.',
      b5_q9:'Variado. Con el cribado detectamos algunos precoces. Pero muchos siguen llegando avanzados.',
      b6_q10:'El hepatólogo referente con revisión del equipo en casos especiales o dudosos.',
      b7_q11:'Pocas dificultades actualmente. Tenemos buena relación con el servicio de farmacia.',
      b7_q12:'A veces retrasos por el visado de inspección, pero la coordinación con farmacia es buena.',
      b8_q13:'RNA positivo con enfermedad activa. No esperar a cirrosis establecida para tratar.',
      b9_q14:'El diagnóstico precoz sigue siendo el gran reto. Seguimos llegando tarde en muchos casos.',
      b9_q15:'Reflex testing universal en toda España y guía clínica actualizada y de fácil acceso.'
    }
  }
]

export function saveAppData(data) {
  try { localStorage.setItem('encuestas_vhd_v1', JSON.stringify(data)); return true }
  catch(e) { return false }
}

export function loadAppData() {
  try { const s = localStorage.getItem('encuestas_vhd_v1'); return s ? JSON.parse(s) : null }
  catch(e) { return null }
}

export function getInitialData() {
  const stored = loadAppData()
  if (stored && stored.waves && stored.waves.length > 0) return stored
  return {
    waves: [{
      id: 'w_sample', name: 'Oleada 1 - Ene 2026', date: '2026-01-24',
      source: 'Datos de muestra', isSample: true, responses: SAMPLE_RESPONSES
    }]
  }
}
