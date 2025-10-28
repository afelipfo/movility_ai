# MovilityAI - Sistema Inteligente de Movilidad para Medellín

MovilityAI es una aplicación de movilidad inteligente que utiliza arquitectura multiagente con LangChain/LangGraph para optimizar rutas, predecir tráfico y proporcionar recomendaciones personalizadas para ciudadanos de Medellín.

## Características Principales

### 🤖 Sistema Multiagente con LangGraph
- **Supervisor Agent**: Coordina todos los agentes y toma decisiones estratégicas
- **Route Planner Agent**: Planifica rutas óptimas multimodales
- **Traffic Analyzer Agent**: Analiza patrones de tráfico y predice congestión
- **Alert Monitor Agent**: Monitorea alertas en tiempo real
- **Recommendation Engine**: Genera recomendaciones personalizadas basadas en IA

### 🗺️ Planificación de Rutas Inteligente
- Rutas multimodales (carro, metro, bicicleta, caminata)
- Integración con Google Maps y Metro de Medellín
- Predicción de tráfico con Machine Learning
- Cálculo de tiempo ahorrado y CO2 reducido

### 📊 Dashboard Analytics Personal
- Estadísticas de movilidad personal
- Visualización de impacto ambiental
- Historial de rutas con gráficos interactivos
- Métricas de tiempo ahorrado

### 🏆 Sistema de Gamificación
- Badges por logros (Primera Ruta, Eco Guerrero, Maestro de Rutas, etc.)
- Sistema de rareza (común, raro, épico, legendario)
- Progreso visual y motivación

### 🚨 Alertas en Tiempo Real
- Web scraping de Twitter, Waze, Metro de Medellín
- Notificaciones de accidentes, cierres viales, eventos
- Monitoreo continuo con cron jobs

### 🔐 Autenticación y Seguridad
- Autenticación con Supabase
- Row Level Security (RLS) en todas las tablas
- Protección de rutas con middleware

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js API Routes, Server Actions
- **Base de Datos**: Supabase (PostgreSQL)
- **IA/ML**: LangChain, LangGraph, OpenAI
- **Mapas**: Google Maps API
- **UI**: shadcn/ui, Recharts
- **Autenticación**: Supabase Auth

## Instalación

### Prerrequisitos

- Node.js 18+ 
- Cuenta de Supabase
- API Key de Google Maps
- API Key de OpenAI

### Pasos de Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd movilityai
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edita `.env.local` con tus credenciales:
- Supabase URL y Keys
- Google Maps API Key
- OpenAI API Key
- Cron Secret (genera uno aleatorio)

4. **Configurar la base de datos**

Ejecuta los scripts SQL en orden desde la carpeta `scripts/` en tu consola de Supabase:
\`\`\`
001_create_profiles.sql
002_create_routes.sql
003_create_route_history.sql
004_create_alerts.sql
005_create_badges.sql
006_create_notifications.sql
007_create_traffic_predictions.sql
008_create_events.sql
009_create_triggers.sql
010_seed_badges.sql
\`\`\`

5. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

\`\`\`
movilityai/
├── app/
│   ├── api/                    # API Routes
│   │   ├── route-planning/     # Planificación de rutas
│   │   ├── alerts/             # Sistema de alertas
│   │   ├── badges/             # Sistema de badges
│   │   ├── notifications/      # Notificaciones
│   │   ├── user/               # Perfil y estadísticas
│   │   └── cron/               # Cron jobs
│   ├── auth/                   # Páginas de autenticación
│   ├── dashboard/              # Dashboard de analytics
│   ├── badges/                 # Galería de badges
│   └── page.tsx                # Página principal
├── components/
│   ├── dashboard/              # Componentes del dashboard
│   ├── analytics/              # Componentes de analytics
│   ├── badges/                 # Componentes de badges
│   └── providers/              # Context providers
├── lib/
│   ├── agents/                 # Sistema multiagente LangGraph
│   │   ├── supervisor.ts       # Agente supervisor
│   │   ├── route-planner.ts    # Agente de rutas
│   │   ├── traffic-analyzer.ts # Agente de tráfico
│   │   ├── alert-monitor.ts    # Agente de alertas
│   │   ├── recommendation-engine.ts
│   │   └── graph.ts            # Grafo de LangGraph
│   ├── services/               # Servicios externos
│   │   ├── google-maps.ts      # Integración Google Maps
│   │   ├── metro-medellin.ts   # Integración Metro
│   │   └── traffic-ml.ts       # ML para predicciones
│   ├── scrapers/               # Web scrapers
│   │   ├── twitter-scraper.ts
│   │   ├── waze-scraper.ts
│   │   ├── metro-scraper.ts
│   │   └── orchestrator.ts
│   ├── supabase/               # Clientes de Supabase
│   └── utils/                  # Utilidades
└── scripts/                    # Scripts SQL
\`\`\`

## Uso

### 1. Crear una Cuenta
- Ve a `/auth/signup`
- Registra tu email y contraseña
- Inicia sesión en `/auth/login`

### 2. Planificar una Ruta
- En la página principal, ingresa origen y destino
- Selecciona modo de transporte
- Haz clic en "Buscar Rutas"
- El sistema multiagente analizará y generará recomendaciones

### 3. Ver Analytics
- Ve a `/dashboard` para ver tus estadísticas
- Revisa tiempo ahorrado, CO2 reducido, y rutas completadas
- Visualiza gráficos de tu actividad

### 4. Coleccionar Badges
- Ve a `/badges` para ver todos los badges disponibles
- Completa rutas para desbloquear badges automáticamente
- Badges se otorgan por logros como:
  - Primera Ruta (1 ruta)
  - Explorador Urbano (10 rutas)
  - Maestro de Rutas (50 rutas)
  - Eco Guerrero (10kg CO2 ahorrado)
  - Guardián del Planeta (100kg CO2 ahorrado)

### 5. Recibir Alertas
- Las alertas aparecen automáticamente en el panel lateral
- El sistema hace scraping cada 15 minutos
- Recibe notificaciones de accidentes, cierres, eventos

## Arquitectura del Sistema Multiagente

El sistema utiliza LangGraph para coordinar múltiples agentes de IA:

\`\`\`
Usuario → Supervisor Agent
            ↓
    ┌───────┴───────┐
    ↓               ↓
Route Planner   Traffic Analyzer
    ↓               ↓
Alert Monitor   Recommendation Engine
    ↓               ↓
Data Collector → Respuesta Final
\`\`\`

Cada agente tiene responsabilidades específicas y se comunica a través del grafo de estados de LangGraph.

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/signup` - Registrarse
- `POST /api/auth/logout` - Cerrar sesión

### Rutas
- `POST /api/route-planning` - Planificar ruta con IA
- `GET /api/routes/history` - Historial de rutas
- `POST /api/routes/save` - Guardar ruta favorita
- `DELETE /api/routes/save?id=` - Eliminar ruta guardada

### Usuario
- `GET /api/user/profile` - Obtener perfil
- `PATCH /api/user/profile` - Actualizar perfil
- `GET /api/user/stats` - Estadísticas del usuario

### Badges
- `GET /api/badges` - Obtener todos los badges
- `POST /api/badges/check` - Verificar nuevos badges

### Alertas
- `GET /api/alerts` - Obtener alertas activas
- `POST /api/scraping/run` - Ejecutar scraping manual

### Predicciones
- `GET /api/traffic-predictions` - Obtener predicciones
- `POST /api/predictions/generate` - Generar predicción ML

## Cron Jobs

El sistema ejecuta scraping automático cada 15 minutos:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/scrape",
      "schedule": "*/15 * * * *"
    }
  ]
}
\`\`\`

Para configurar en Vercel:
1. Agrega `vercel.json` al proyecto
2. Configura `CRON_SECRET` en variables de entorno
3. Los cron jobs se ejecutarán automáticamente

## Seguridad

- **Row Level Security (RLS)**: Todas las tablas tienen políticas RLS
- **Autenticación**: Middleware protege rutas privadas
- **Validación**: Input sanitization en todos los endpoints
- **Secrets**: Variables de entorno para API keys
- **HTTPS**: Forzado en producción

## Despliegue en Vercel

1. **Conectar repositorio**
\`\`\`bash
vercel
\`\`\`

2. **Configurar variables de entorno**
- Ve a Project Settings → Environment Variables
- Agrega todas las variables de `.env.example`

3. **Configurar Supabase**
- Asegúrate de que las URLs de redirect incluyan tu dominio de Vercel
- Actualiza `NEXT_PUBLIC_SITE_URL`

4. **Desplegar**
\`\`\`bash
vercel --prod
\`\`\`

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Soporte

Para soporte, abre un issue en GitHub o contacta al equipo de desarrollo.

## Roadmap

- [ ] Integración con más fuentes de datos (Uber, Didi, etc.)
- [ ] App móvil nativa (React Native)
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Compartir rutas con amigos
- [ ] Integración con calendario
- [ ] Predicciones más precisas con más datos históricos
- [ ] Soporte para más ciudades de Colombia

---

Desarrollado con ❤️ para mejorar la movilidad en Medellín
