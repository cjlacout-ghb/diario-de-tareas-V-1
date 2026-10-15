# Tareas de Oficina — GIS y Estadísticas (Municipalidad de Paraná)

Aplicación web progresiva (PWA) minimalista y veloz diseñada como ayuda memoria diaria para las tareas cotidianas del **Departamento de GIS y Estadísticas de la Municipalidad de Paraná**.

---

## Características principales

- **Lista de actividades diaria**: Tildado manual de actividades con contador en tiempo real (`3 de 5 cumplidas`).
- **Enlaces rápidos**: Cada actividad puede tener su enlace directo a carpetas de Google Drive, portales de gestión o intranet municipal. Al hacer clic en "Abrir", se abre en una pestaña nueva sin tildar la tarea.
- **Reinicio automático por jornada**: Cada día nuevo calendario (al encender la computadora y abrir la app), todas las actividades aparecen automáticamente **destildadas**. Las actividades, los enlaces y el orden **nunca se borran**.
- **Gestión completa**: Agregar, editar en línea (Enter guarda, Esc cancela), reordenar con flechas arriba/abajo y borrar con confirmación.
- **Copia de seguridad**: Botones de **Exportar** e **Importar** (formato JSON) para resguardar o transferir la lista entre puestos de trabajo.
- **100% Privada y sin conexión (Offline)**: Los datos residen exclusivamente en el `localStorage` del navegador, sin servidores externos, sin login y sin dependencias pesadas.

---

## 1. Pasos para publicar en un Hosting Estático Gratuito

La aplicación se compila a archivos estáticos HTML/CSS/JS puros listos para cualquier servidor web gratuito:

### Compilación previa:
```bash
npm run build
```
Esto genera la carpeta `dist/` con todos los archivos optimizados y el service worker.

### Opción A: Netlify (Muy simple)
1. Creá una cuenta gratuita en [netlify.com](https://www.netlify.com).
2. Arrastrá y soltá la carpeta `dist/` generada en el panel de Netlify Drop, o vinculá tu repositorio de GitHub configurando:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Netlify te otorgará una URL HTTPS (por ejemplo `tareas-gis-parana.netlify.app`).

### Opción B: GitHub Pages
1. Subí el repositorio a GitHub.
2. Podés usar GitHub Actions con la acción oficial de Vite o compilar localmente y subir el contenido de `dist/` a la rama `gh-pages`.
3. En la configuración del repositorio en GitHub: **Settings > Pages > Build and deployment > Deploy from a branch** seleccioná la rama `gh-pages` (o root).

### Opción C: Firebase Hosting
1. Instalá las herramientas de Firebase:
   ```bash
   npm install -g firebase-tools
   ```
2. Iniciá sesión y vinculá el proyecto:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Indicá `dist` como public directory.
   - Configurá como single-page app (y/N): `y`.
3. Desplegá:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 2. Cómo instalar la App como Acceso Directo en el Escritorio (Windows)

Gracias a que es una **PWA (Progressive Web App)**:

1. Abrí la dirección web de la app en **Google Chrome** o **Microsoft Edge**.
2. Hacé clic en el botón **"Instalar app"** en la parte superior derecha de la aplicación.
3. También podés hacer clic en el ícono de instalación **⊕** en el extremo derecho de la barra de direcciones del navegador, o ir al menú (tres puntos `⋮`) → **"Instalar Tareas de Oficina..."** (o **"Aplicaciones" > "Instalar este sitio como aplicación"**).
4. Confirmá la instalación. Se creará automáticamente un acceso directo con el ícono oficial en tu **Escritorio de Windows**, abriéndose en una ventana limpia e independiente sin barras de navegación.

---

## 3. Cómo hacer que se abra automáticamente al encender la PC

Para tener las tareas listas apenas llegás a la oficina sin tener que abrirlas manualmente:

1. Instalá la app siguiendo el paso 2 para que tengas el acceso directo en el escritorio.
2. En el teclado de tu computadora con Windows, presioná la combinación de teclas:
   $$\text{Windows} + \text{R}$$
3. En la ventana "Ejecutar" que aparece, escribí exactamente:
   ```text
   shell:startup
   ```
   y hacé clic en **Aceptar**.
4. Se abrirá la carpeta de **Inicio de Windows** (`C:\Users\<Usuario>\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`).
5. **Copiá el acceso directo de "Tareas de Oficina"** de tu Escritorio y **pegálo dentro de esta carpeta**.
6. ¡Listo! A partir de ahora, cada mañana cuando inicies sesión en Windows, la app se abrirá en pantalla con todas las tildes reiniciadas para la nueva jornada.
