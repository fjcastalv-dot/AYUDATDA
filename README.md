# 🛡️ TDAH Focus Shield (Time-Blindness & Yak Shaving Defense)

Aplicación web modular de alto rendimiento diseñada específicamente para personas con **TDAH (Trastorno por Déficit de Atención e Hiperactividad)**, enfocada en mitigar la **ceguera temporal (*time blindness*)**, el **efecto cascada de distracción (*yak shaving*)** y la **parálisis ejecutiva**.

Construida con **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, síntesis auditiva con **Web Audio API** e integración con **Google Identity Services & Google Calendar API**.

---

## 🧠 Arquitectura Neurodivergente: ¿Por qué funciona?

1. **Temporizador Semáforo (Cromático Descendente):**
   - El cerebro con TDAH no procesa el paso del tiempo como una magnitud abstracta ("me quedan 17 minutos"), sino como dos estados: *"ahora"* y *"no ahora"*.
   - **Verde (>25% y >5 min):** Sensación de calma y avance sin presión.
   - **Amarillo (≤25%):** Advertencia visual suave de aceleración ("empieza a cerrar").
   - **Rojo (≤5 min):** Urgencia visual inmediata ("ventana de aterrizaje: no abras nuevas subtareas").
   - **Sonido Zen:** Campanadas armónicas con Web Audio API que no provocan sobresaltos ni rechazo sensorial.

2. **Modo "Foco Único" (Anti-Parálisis):**
   - Oculta las listas interminables de tareas pendientes que saturan la memoria de trabajo.
   - Presenta una **"Definición de Terminado" (Definition of Done)** obligatoria: un criterio concreto e indiscutible que le dice al cerebro exactamente cuándo parar, frenando el perfeccionismo compulsivo.

3. **🧩 Subdivisión de Tareas con Presupuesto Temporal Específico:**
   - Permite dividir tareas grandes (ej. 60 minutos) en subtareas más pequeñas con su propio tiempo asignado (ej. 30 min, 20 min, 10 min o personalizado).
   - Barra visual de presupuesto que calcula en tiempo real los minutos asignados y los minutos restantes.
   - El temporizador semáforo se enfoca en el paso activo (`Paso 1/3: 30 min`) y salta automáticamente al siguiente paso al concluir.

4. **📌 Ventanita Flotante Siempre Visible (Picture-in-Picture / Always-on-Top):**
   - Basada en la API estándar de **Document Picture-in-Picture**.
   - Permite desacoplar el temporizador, el estado cromático semáforo y la Definición de Terminado en una **pequeña ventana flotante nativa que permanece fija por encima de cualquier otro programa en Windows** (Word, Excel, Visual Studio Code, videojuegos, etc.), exactamente igual a la vista compacta de la app de Reloj de Windows.
   - Si cambias de pestaña o minimizas el navegador, la ventanita sigue ahí mostrándote el tiempo restante y la tarea activa.

5. **Parking Lot / Bloc de Estacionamiento (`Ctrl + Espacio` / `Cmd + K`):**
   - Cuando surge una idea repentina o tentación de saltar a otra cosa (*"¿y si ordeno las pestañas?"*), presionar `Ctrl + Espacio` permite escribirla y aparcarla en 2 segundos, sacándola de la mente sin romper el hiperfoco.

6. **Búfer Automático en Google Calendar (5 a 15 min):**
   - Agendar reuniones o tareas consecutivas sin descanso provoca el colapso de la función ejecutiva. La aplicación inserta automáticamente un colchón de descompresión programado en tu calendario.

7. **Persistencia Local Fallback:**
   - Funciona de inmediato sin necesidad de crear cuentas ni configurar APIs mediante `localStorage`.

---

## 📁 Estructura del Proyecto

```text
tdah-focus-shield/
├── app/
│   ├── globals.css              # Estilos globales, scrollbars discretos y animaciones
│   ├── layout.tsx               # Carga de Google Identity Services y metadatos
│   └── page.tsx                 # Integración de estado reactivo, hotkeys y vistas
├── components/
│   ├── CalendarSyncPanel.tsx    # Modal de conexión OAuth, búfers y sync con Calendar
│   ├── HourglassTimer.tsx       # Temporizador visual con anillo SVG, arena y controles
│   ├── Navbar.tsx               # Barra superior con accesos directos y contador
│   ├── ParkingLotModal.tsx      # Captura ultra-rápida de ideas intrusivas
│   ├── SingleTaskView.tsx       # Vista túnel de foco con Definición de Terminado
│   └── TaskManagerModal.tsx     # Creación y organización de la cola de tareas
├── hooks/
│   ├── useGoogleCalendar.ts     # Integración GIS OAuth 2.0 y Google Calendar REST v3
│   ├── useHourglassTimer.ts     # Lógica matemática semáforo con prevención de drift
│   └── useLocalStorage.ts      # Persistencia en cliente segura contra errores de SSR
├── lib/
│   └── audio.ts                 # Sintetizador Web Audio API y notificaciones nativas
├── types/
│   └── task.ts                  # Tipos TypeScript estrictos
├── .env.example                 # Plantilla de variables de entorno
├── .env.local                   # Variables de entorno locales
├── next.config.mjs              # Configuración de Next.js
├── package.json                 # Dependencias y scripts de arranque
├── postcss.config.mjs           # Plugins de PostCSS
├── tailwind.config.ts           # Configuración de colores semáforo y animaciones
├── tsconfig.json                # Configuración estricta de TypeScript
└── README.md                    # Documentación y guía de despliegue
```

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: Versión 18.17 o superior instalada ([Descargar Node.js](https://nodejs.org/)).
- **npm**, **pnpm** o **yarn**.

### 1. Clonar el repositorio o situarse en la carpeta
```bash
git clone https://github.com/tu-usuario/tdah-focus-shield.git
cd tdah-focus-shield
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🔑 Configuración de Google Calendar API (Opcional pero Recomendado)

La app funciona al 100% en modo local sin credenciales. Para habilitar la sincronización en vivo con Google Calendar, sigue estos sencillos pasos:

### Paso 1: Crear proyecto en Google Cloud Console
1. Entra a [Google Cloud Console](https://console.cloud.google.com/).
2. Haz clic en el selector de proyectos en la barra superior y selecciona **"Nuevo proyecto"**.
3. Nómbralo `TDAH-Focus-Shield` y haz clic en **Crear**.

### Paso 2: Habilitar la Google Calendar API
1. En el menú lateral, ve a **APIs y servicios** > **Biblioteca**.
2. Busca `Google Calendar API`.
3. Haz clic en ella y presiona **Habilitar**.

### Paso 3: Configurar la Pantalla de Consentimiento OAuth
1. Ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**.
2. Selecciona **External** (Externo) y haz clic en **Crear**.
3. Rellena:
   - **Nombre de la aplicación**: `TDAH Focus Shield`
   - **Correo electrónico de soporte del usuario**: tu correo.
   - **Datos de contacto del desarrollador**: tu correo.
4. En **Permisos (Scopes)**, añade el scope:
   - `https://www.googleapis.com/auth/calendar.events` (Ver y editar eventos en tus calendarios).
5. En **Usuarios de prueba (Test users)**, agrega tu propia dirección de Gmail para poder iniciar sesión mientras la app esté en modo prueba.
6. Guarda y continúa.

### Paso 4: Crear credenciales OAuth 2.0 Client ID
1. Ve a **APIs y servicios** > **Credenciales**.
2. Haz clic en **+ Crear credenciales** y elige **ID de cliente de OAuth**.
3. En **Tipo de aplicación**, selecciona **Aplicación web**.
4. En **Orígenes autorizados de JavaScript**, haz clic en **+ Agregar URI** e ingresa:
   - `http://localhost:3000`
   - *(Si despliegas en producción, por ejemplo Vercel, agrega también tu dominio: `https://tu-app.vercel.app`)*.
5. Haz clic en **Crear**.
6. Copia el **ID de cliente** generado (tiene un formato similar a `123456789-abcdef.apps.googleusercontent.com`).

### Paso 5: Configurar `.env.local`
Abre el archivo `.env.local` en la raíz de tu proyecto y pega tu ID de cliente:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
```

Reinicia el servidor de desarrollo (`npm run dev`) y ya podrás iniciar sesión y exportar tus bloques de foco con búfer a Google Calendar.

---

## ⌨️ Atajos de Teclado Globales

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + Espacio` o `Cmd + Espacio` | Abre o cierra instantáneamente el **Parking Lot de Ideas**. |
| `Ctrl + K` o `Cmd + K` | Atajo secundario alternativo para el Parking Lot. |
| `Enter` (dentro del Parking Lot) | Guarda el pensamiento intrusivo y limpia el campo. |
| `Escape` | Cierra cualquier modal abierto y regresa al foco. |

---

## 📦 Despliegue en Producción (Vercel / Netlify)

1. Sube tu repositorio a GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: TDAH Focus Shield completo y listo para producción"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/tdah-focus-shield.git
   git push -u origin main
   ```
2. Entra a [Vercel](https://vercel.com/) e importa tu repositorio.
3. En la sección **Environment Variables**, añade:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Tu Client ID de Google Cloud.
4. Haz clic en **Deploy**.
5. ¡No olvides agregar la URL generada por Vercel a los **Orígenes autorizados de JavaScript** en Google Cloud Console!

---

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Diseñado con empatía neurodivergente para el máximo bienestar y productividad.
