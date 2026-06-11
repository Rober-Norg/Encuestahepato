# Encuestas Hepatitis D — Norgine

Web app para analizar encuestas a médicos sobre Hepatitis D. Construida con React + Vite.

## 🚀 Deploy en Vercel

### Opción A — Desde GitHub (recomendado)
1. Sube la carpeta `react-app/` a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) → New Project → importa el repo
3. Vercel detecta automáticamente Vite. Ajustes:
   - **Framework**: Vite
   - **Root Directory**: `.` (raíz del repo, que es `react-app/`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy ✓

### Opción B — Vercel CLI
```bash
cd react-app
npm install
npm run build
npx vercel --prod
```

## 💻 Desarrollo local
```bash
cd react-app
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

## 📁 Estructura
```
react-app/
├── public/
│   └── norgine-logo.png        # Logo Norgine
├── src/
│   ├── main.jsx                # Punto de entrada React
│   ├── App.jsx                 # App principal + routing
│   ├── data.js                 # Bloques de preguntas + datos muestra
│   ├── utils.js                # Clasificación, sentimiento, Excel parser
│   ├── components/
│   │   └── Shared.jsx          # Todos los componentes UI compartidos
│   └── views/
│       ├── Dashboard.jsx       # Vista de overview
│       ├── Upload.jsx          # Subida y gestión de oleadas
│       ├── Analysis.jsx        # Diagramas de araña + análisis texto
│       └── Comparativas.jsx    # Comparación por grupo
├── index.html
├── vite.config.js
└── package.json
```

## 📊 Funcionalidades
- **Dashboard**: KPIs, radar global 9 bloques, distribución por especialidad, sentimiento por bloque
- **Datos**: Sube Excel (.xlsx) exportado de Google Forms, gestión de oleadas, datos acumulativos
- **Análisis**: Diagrama de araña por bloque, nube de palabras, sentimiento, verbatims
- **Comparativas**: Filtros por especialidad/región/hospital, radares side-by-side
- **Exportar PDF**: Captura de pantalla completa en PDF

## 🔧 Tecnologías
- React 18 + Vite
- Chart.js 4 (radar, bar, donut)
- xlsx (parser de Excel)
- html2canvas + jsPDF (exportación PDF)
