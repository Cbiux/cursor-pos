import type { Locale } from "./types";

export type Translations = {
  language: { label: string; es: string; en: string };
  theme: { label: string; light: string; dark: string };
  creator: { by: string };
  docs: {
    title: string;
    pageTitle: string;
    pageSubtitle: string;
    openLink: string;
    backToApp: string;
    printerTitle: string;
    printerModel: string;
    printerSpecs: string;
    compatibilityTitle: string;
    compatibilityBody: string;
    connectTitle: string;
    connectSteps: string[];
    modesTitle: string;
    modesIntro: string;
    modes: string[];
    eventTicketTitle: string;
    eventTicketBody: string;
    eventTicketSteps: string[];
    lumaTitle: string;
    lumaBody: string;
    lumaSteps: string[];
    lumaBadgeTitle: string;
    lumaBadgeSteps: string[];
    lumaNote: string;
    creditsTitle: string;
    creditsBody: string;
    creditsSteps: string[];
    creditsCsvTitle: string;
    creditsCsvHint: string;
    creditsCsvColumns: string[];
    lumaSetupTitle: string;
    lumaSetupSteps: string[];
    lumaSetupNote: string;
    featuresTitle: string;
    features: string[];
    requirementsTitle: string;
    requirements: string[];
    repoTitle: string;
    repoBody: string;
    repoLinkLabel: string;
  };
  ticketMode: { label: string; event: string; photo: string; luma: string; credits: string };
  app: {
    brand: string;
    title: string;
    subtitle: string;
    preview: string;
    previewPhotoPlaceholder: string;
    namePlaceholder: string;
    wifi: string;
    wifiNetwork: string;
    wifiPassword: string;
  };
  browser: { unsupported: string };
  printer: {
    title: string;
    connecting: string;
    disconnected: string;
    connected: string;
    statusConnected: string;
    statusDisconnected: string;
    baud: string;
    connectSerial: string;
    connectUsb: string;
    usbUnavailable: string;
    usbWindowsHint: string;
    disconnect: string;
    footnote: string;
  };
  fields: {
    businessName: string;
    nombre: string;
    extra: string;
    qrContent: string;
    eventType: string;
    actionLabel: string;
    wifiSsid: string;
    wifiPassword: string;
    paperWidth: string;
    includeWifi: string;
    includeTimestamp: string;
    name: string;
    ticketSections: string;
    includeLogo: string;
    includeQr: string;
    includeEventType: string;
    includeActionLabel: string;
    includeName: string;
    includeExtra: string;
  };
  placeholders: {
    businessName: string;
    nombre: string;
    extra: string;
    qrContent: string;
    eventType: string;
    actionLabel: string;
    wifiSsid: string;
    wifiPassword: string;
  };
  actions: {
    printEvent: string;
    printPhoto: string;
    download: string;
    saveDefaults: string;
  };
  camera: {
    title: string;
    hintIdle: string;
    hintReview: string;
    hintReady: string;
    hintPan: string;
    change: string;
    cameraLabel: string;
    switchCamera: string;
    open: string;
    upload: string;
    capture: string;
    preparing: string;
    cancel: string;
    stop: string;
    retake: string;
    retakePhoto: string;
    usePhoto: string;
    cameraFallback: string;
    cameraPlayError: string;
    cameraLoadError: string;
    cameraWait: string;
    imageProcessError: string;
    cameraDefault: string;
    switchError: string;
  };
  status: {
    defaultsSaved: string;
    connectedSerial: string;
    connectedUsb: string;
    disconnected: string;
    printEvent: string;
    printPhoto: string;
    downloaded: string;
    connectCancelled: string;
    connectError: string;
    serialOpenFailed: string;
    printError: string;
    downloadError: string;
  };
  luma: {
    title: string;
    subtitle: string;
    eventLabel: string;
    loadingEvents: string;
    noEvents: string;
    eventsLoadError: string;
    selectEventFirst: string;
    printerRequired: string;
    scannerTitle: string;
    scannerIdleHint: string;
    scannerActiveHint: string;
    scannerWaitingHint: string;
    scannerPausedHint: string;
    scannerStoppedHint: string;
    startScan: string;
    stopScan: string;
    processing: string;
    invalidQr: string;
    eventMismatch: string;
    guestLoadError: string;
    checkinError: string;
    checkInApiUnavailable: string;
    scanProcessError: string;
    scannerStartError: string;
    scannedSuccess: string;
    scannedPrinted: string;
    printedCheckinFailed: string;
    reprinted: string;
    printError: string;
    logTitle: string;
    logHint: string;
    logEmpty: string;
    reprint: string;
    clearLog: string;
    statusPrinted: string;
    statusPrintFailed: string;
    statusCheckedIn: string;
    statusCheckinPending: string;
    statusAwaitingPrint: string;
    confirmTitle: string;
    confirmHint: string;
    confirmPrint: string;
    confirmDiscard: string;
    scannedReady: string;
    discardPendingFirst: string;
    alreadyCheckedIn: string;
    approvalLabel: string;
    previewAction: string;
    previewGuestPlaceholder: string;
    previewEventPlaceholder: string;
    connectTitle: string;
    connectSubtitle: string;
    connectKeyLabel: string;
    connectKeyPlaceholder: string;
    connectKeyRequired: string;
    connectAction: string;
    connectSaving: string;
    connectFailed: string;
    connectConnectedTitle: string;
    connectConnectedHint: string;
    connectDisconnect: string;
    connectStorageHint: string;
    connectSecurityTitle: string;
    connectSecurityBody: string;
    connectSecurityDeployHint: string;
    serverCalendarHint: string;
    connectSettingsTitle: string;
    connectServerActive: string;
    connectUseOwnKey: string;
    connectHideForm: string;
    badgeSettingsTitle: string;
    badgeSettingsHint: string;
    qrSourceCustom: string;
    qrSourceGuest: string;
    badgeQrLabel: string;
    includeTicketName: string;
  };
  credits: {
    title: string;
    subtitle: string;
    titleLabel: string;
    subtitleLabel: string;
    uploadCsv: string;
    csvHint: string;
    csvEmpty: string;
    csvError: string;
    csvLoaded: string;
    queueEmpty: string;
    progress: string;
    remainingLabel: string;
    includeSubtitle: string;
    printNext: string;
    resetQueue: string;
    clearQueue: string;
    printerRequired: string;
    printedNext: string;
    printedLast: string;
    printError: string;
    queueReset: string;
    queueCleared: string;
    previewEmpty: string;
  };
};

export const translations: Record<Locale, Translations> = {
  es: {
    language: { label: "Idioma", es: "Español", en: "English" },
    theme: { label: "Tema", light: "Claro", dark: "Oscuro" },
    creator: { by: "Creado por" },
    docs: {
      title: "Documentacion",
      pageTitle: "Impresora y conexion",
      pageSubtitle:
        "Guia para usar Cursor POS con la GOOJPRT PT-210 y otras impresoras termicas Bluetooth de 58 mm.",
      openLink: "Ver documentacion",
      backToApp: "Volver a Cursor POS",
      printerTitle: "Impresora recomendada",
      printerModel: "GOOJPRT PT-210 (portatil, Bluetooth, papel 58 mm)",
      printerSpecs:
        "Impresora termica inalambrica de 58 mm. Tamano aproximado: 88 x 110 x 41 mm. Compatible con tickets ESC/POS desde el navegador.",
      compatibilityTitle: "Otras impresoras compatibles",
      compatibilityBody:
        "Tambien funciona con otras impresoras termicas de 58 mm con Bluetooth y soporte ESC/POS, como MTP-2, GOOJPRT similares, y muchas portatiles de recibos. Usa papel de 58 mm y conexion Serial (puerto COM virtual) en Chrome o Edge.",
      connectTitle: "Como conectar",
      connectSteps: [
        "Enciende la impresora y carga papel termico de 58 mm.",
        "Emparejala por Bluetooth desde Windows (Configuracion > Bluetooth).",
        "Abre esta app en Chrome o Edge con HTTPS (o localhost).",
        "Pulsa Conectar Serial y elige el puerto de la impresora (ej. PT-210, MTP-2 vinculado o un COM de Bluetooth).",
        "Deja la velocidad en 9600 baud e imprime una prueba.",
        "En Windows, USB directo suele no funcionar en el navegador; prioriza Bluetooth + Serial.",
      ],
      modesTitle: "Modos de ticket",
      modesIntro:
        "Cursor POS tiene cuatro modos. Cada uno tiene vista previa en vivo y respeta el ancho de papel (58 mm o 80 mm).",
      modes: [
        "Ticket de evento: campos editables, secciones activables y valores predeterminados guardables.",
        "Ticket con foto: camara o subida, encuadre, cuenta regresiva y logo Cursor.",
        "Check-in Luma: escaneo de QR, confirmacion antes de imprimir gafete y registro en vivo.",
        "Cursor Credits: cola de links desde CSV; cada impresion avanza al siguiente QR.",
      ],
      eventTicketTitle: "Ticket de evento",
      eventTicketBody:
        "Personaliza el ticket y activa solo las secciones que necesitas. La vista previa se actualiza al instante.",
      eventTicketSteps: [
        "Completa nombre del negocio, QR, tipo de evento, accion, nombre, extra y WiFi.",
        "Usa Secciones del ticket para mostrar u ocultar logo, QR, tipo de evento, accion, nombre y extra.",
        "Activa Incluir WiFi solo si quieres la red y clave en el ticket impreso.",
        "Pulsa Guardar defaults para recordar los valores en este navegador.",
        "Imprime o descarga el archivo ESC/POS como respaldo.",
      ],
      lumaTitle: "Check-in Luma",
      lumaBody:
        "Imprime gafetes al escanear invitados. La app obtiene datos del invitado desde Luma, pero no marca check-in en Luma (su API publica ya no lo permite). Usa el escaner oficial de Luma para asistencia.",
      lumaSteps: [
        "Conecta tu calendario Luma (API key en el navegador o LUMA_API_KEY en el servidor).",
        "Selecciona el evento e inicia el escaneo con la camara.",
        "Al escanear un QR valido suena un beep y aparece el panel Invitado listo.",
        "Revisa la vista previa del gafete y pulsa Imprimir gafete o Descartar.",
        "El registro en vivo guarda los ultimos escaneos con opcion de reimprimir.",
      ],
      lumaBadgeTitle: "Configuracion del gafete",
      lumaBadgeSteps: [
        "QR del ticket de evento: usa el Contenido del QR del modo Ticket de evento (recomendado para links custom).",
        "URL de check-in del invitado: usa la URL original del QR escaneado de Luma.",
        "Activa o desactiva logo, QR, accion, tipo de entrada y fecha en Secciones del ticket.",
        "La accion y el contenido del QR se pueden editar antes de imprimir.",
      ],
      lumaNote:
        "El QR impreso por defecto NO es el check-in de Luma del invitado, sino el link que configures en Ticket de evento, salvo que elijas URL de check-in del invitado.",
      creditsTitle: "Cursor Credits",
      creditsBody:
        "Reparte tickets con links unicos para reclamar creditos. Cada fila del CSV es un ticket; al imprimir, la cola avanza sola al siguiente link.",
      creditsSteps: [
        "Abre el modo Cursor Credits y carga un CSV con columnas de nombre y URL.",
        "Opcional: edita titulo, subtitulo y secciones del ticket (logo, QR, etiqueta, etc.).",
        "Pulsa Imprimir siguiente: el QR del ticket es el link de la fila actual.",
        "Tras imprimir, la cola avanza. Usa Reiniciar cola o Vaciar cola si hace falta.",
        "El progreso y la cola se guardan en localStorage de este navegador.",
      ],
      creditsCsvTitle: "Formato del CSV",
      creditsCsvHint:
        "El parser detecta columnas url, link, claim o credit para el link, y name, label, email o guest para la etiqueta. Tambien acepta ; como separador.",
      creditsCsvColumns: [
        "Encabezados sugeridos: name, url",
        "Ejemplo: Ana Garcia, https://cursor.com/redeem/abc123",
        "Hay un CSV de prueba en examples/cursor-credits-test.csv del repositorio.",
      ],
      lumaSetupTitle: "Conectar Luma",
      lumaSetupSteps: [
        "Opcion A — Pega tu API key en la app (sessionStorage, solo esta pestana).",
        "Opcion B — Fork del repo, deploy en Vercel y variable LUMA_API_KEY en el servidor (recomendado para produccion).",
        "Requiere Luma Plus. Ticket, foto y credits funcionan sin Luma.",
      ],
      lumaSetupNote:
        "En un deploy compartido, la API key transita por el servidor en cada request si usas la opcion A.",
      featuresTitle: "Funciones de la app",
      features: [
        "Cuatro modos: ticket de evento, foto, check-in Luma y Cursor Credits.",
        "Vista previa grande en vivo con toggles de seccion por modo.",
        "Ticket de evento: logo, QR, WiFi, timestamp y defaults guardables.",
        "Luma: escaneo con confirmacion, gafete configurable y registro con reimpresion.",
        "Credits: cola secuencial desde CSV con QR = link de reclamo.",
        "Impresion directa Web Serial y descarga ESC/POS como respaldo.",
        "Interfaz en espanol e ingles y tema claro/oscuro.",
      ],
      requirementsTitle: "Requisitos",
      requirements: [
        "Navegador: Chrome o Edge (recomendado).",
        "Conexion segura HTTPS para camara e impresora.",
        "Impresora termica 58 mm (80 mm opcional en ajustes).",
        "Cada puesto usa su propia impresora conectada localmente.",
      ],
      repoTitle: "Codigo fuente",
      repoBody: "El proyecto es open source. Reporta bugs, deja feedback o contribuye en GitHub.",
      repoLinkLabel: "github.com/cursorcommunityled/cursor-pos",
    },
    ticketMode: {
      label: "Tipo de ticket",
      event: "Ticket de evento",
      photo: "Ticket con foto",
      luma: "Check-in Luma",
      credits: "Cursor Credits",
    },
    app: {
      brand: "Cursor POS",
      title: "Impresion de tickets",
      subtitle:
        "Conecta tu impresora termica desde el navegador e imprime directo, tambien en Vercel.",
      preview: "Vista previa",
      previewPhotoPlaceholder: "La foto aparecera aqui",
      namePlaceholder: "Nombre",
      wifi: "WiFi",
      wifiNetwork: "Red",
      wifiPassword: "Clave",
    },
    browser: {
      unsupported:
        "Este navegador no soporta impresion directa. Abre la app en Chrome o Edge con HTTPS.",
    },
    printer: {
      title: "Impresora",
      connecting: "Conectando...",
      disconnected: "Sin conectar",
      connected: "Conectada",
      statusConnected: "Conectada",
      statusDisconnected: "Desconectada",
      baud: "Velocidad serial (baud)",
      connectSerial: "Conectar Serial",
      connectUsb: "Conectar USB",
      usbUnavailable: "USB no disponible",
      usbWindowsHint: "En Windows el driver bloquea WebUSB. Usa Conectar Serial.",
      disconnect: "Desconectar",
      footnote:
        "PT-210 / MTP-2 por Bluetooth: Conectar Serial y elige el puerto vinculado. Velocidad recomendada: 9600 baud. El logo y las fotos se optimizan para papel termico.",
    },
    fields: {
      businessName: "Nombre del negocio",
      nombre: "Nombre",
      extra: "Extra",
      qrContent: "Contenido del QR",
      eventType: "Tipo de evento",
      actionLabel: "Accion",
      wifiSsid: "Red WiFi",
      wifiPassword: "Clave WiFi",
      paperWidth: "Ancho de papel",
      includeWifi: "Incluir WiFi",
      includeTimestamp: "Incluir fecha y hora",
      name: "Nombre",
      ticketSections: "Secciones del ticket",
      includeLogo: "Logo",
      includeQr: "Codigo QR",
      includeEventType: "Tipo de evento",
      includeActionLabel: "Accion",
      includeName: "Nombre",
      includeExtra: "Extra",
    },
    placeholders: {
      businessName: "Cursor Meetup - San Jose",
      nombre: "Juan Santamaria",
      extra: "VIP, mesa 3, empresa...",
      qrContent: "https://luma.com/...",
      eventType: "Drop-by slot",
      actionLabel: "Check-in",
      wifiSsid: "Taller.1",
      wifiPassword: "@Salvo20",
    },
    actions: {
      printEvent: "Imprimir ticket",
      printPhoto: "Imprimir foto",
      download: "Descargar ESC/POS",
      saveDefaults: "Guardar defaults",
    },
    camera: {
      title: "Foto",
      hintIdle: "Activa la camara o elige una imagen",
      hintReview: "Arrastra la foto para encuadrarla y confirma",
      hintReady: "Arrastra la foto para ajustar el encuadre",
      hintPan: "Arrastra para mover la foto",
      change: "Cambiar",
      cameraLabel: "Camara",
      switchCamera: "Cambiar camara",
      open: "Abrir camara",
      upload: "Subir foto",
      capture: "Capturar",
      preparing: "Preparando...",
      cancel: "Cancelar",
      stop: "Detener",
      retake: "Retomar",
      retakePhoto: "Retomar foto",
      usePhoto: "Usar esta foto",
      cameraFallback: "No se pudo abrir la camara. Prueba subir una foto desde galeria.",
      cameraPlayError: "No se pudo mostrar la camara. Prueba subir una foto desde galeria.",
      cameraLoadError: "No se pudo abrir la camara. Prueba subir una foto desde galeria.",
      cameraWait: "Espera un momento a que la camara cargue e intenta de nuevo.",
      imageProcessError: "No se pudo procesar la imagen.",
      cameraDefault: "Camara",
      switchError: "No se pudo cambiar de camara.",
    },
    status: {
      defaultsSaved: "Valores guardados como predeterminados.",
      connectedSerial: "Impresora conectada por puerto serial.",
      connectedUsb: "Impresora conectada por USB.",
      disconnected: "Impresora desconectada.",
      printEvent: "Ticket enviado a la impresora.",
      printPhoto: "Foto enviada a la impresora.",
      downloaded: "Archivo ESC/POS descargado.",
      connectCancelled:
        "Conexion cancelada. Vuelve a intentarlo y elige tu impresora en el dialogo del navegador.",
      connectError: "No se pudo conectar la impresora.",
      serialOpenFailed:
        "No se pudo abrir el puerto serial. Cierra otras pestañas con Cursor POS, reinicia la impresora, verifica que este encendida y emparejada, y que ningun otro programa use el puerto COM.",
      printError: "Error al imprimir.",
      downloadError: "Error al descargar.",
    },
    luma: {
      title: "Check-in con Luma",
      subtitle:
        "Escanea el QR, revisa los datos del invitado y confirma antes de imprimir el gafete.",
      eventLabel: "Evento",
      loadingEvents: "Cargando eventos...",
      noEvents: "No hay eventos disponibles",
      eventsLoadError: "No se pudieron cargar los eventos de Luma.",
      selectEventFirst: "Selecciona un evento antes de escanear.",
      printerRequired: "Conecta la impresora antes de imprimir.",
      scannerTitle: "Escaneo de QR",
      scannerIdleHint: "Activa la camara para recibir invitados.",
      scannerActiveHint: "Apunta al QR de Luma del invitado.",
      scannerWaitingHint: "Esperando escaneo...",
      scannerPausedHint: "Confirma o descarta al invitado actual para seguir escaneando.",
      scannerStoppedHint: "La camara se activa al iniciar el escaneo.",
      startScan: "Iniciar escaneo",
      stopScan: "Detener escaneo",
      processing: "Procesando...",
      invalidQr: "Ese codigo no parece un QR valido de Luma.",
      eventMismatch: "El QR pertenece a otro evento distinto al seleccionado.",
      guestLoadError: "No se pudo obtener la informacion del invitado.",
      checkinError: "No se pudo marcar el check-in en Luma.",
      checkInApiUnavailable:
        "Luma ya no expone check-in en su API publica. Imprime el gafete aqui y marca asistencia con el escaner oficial de Luma.",
      scanProcessError: "No se pudo procesar el escaneo.",
      scannerStartError: "No se pudo iniciar la camara para escanear.",
      scannedSuccess: "Gafete impreso y check-in registrado.",
      scannedPrinted: "Gafete impreso.",
      printedCheckinFailed: "Gafete impreso, pero el check-in en Luma fallo.",
      reprinted: "Gafete reimpreso.",
      printError: "Error al reimprimir.",
      logTitle: "Registro en vivo",
      logHint: "Ultimos escaneos de esta sesion.",
      logEmpty: "Todavia no hay escaneos.",
      reprint: "Reimprimir",
      clearLog: "Limpiar registro",
      statusPrinted: "Impreso",
      statusPrintFailed: "Sin imprimir",
      statusCheckedIn: "Check-in ok",
      statusCheckinPending: "Check-in pendiente",
      statusAwaitingPrint: "Pendiente de imprimir",
      confirmTitle: "Invitado listo",
      confirmHint: "Revisa la vista previa del gafete y confirma la impresion.",
      confirmPrint: "Imprimir gafete",
      confirmDiscard: "Descartar",
      scannedReady: "QR capturado. Revisa los datos e imprime cuando estes listo.",
      discardPendingFirst: "Descarta o imprime al invitado actual antes de escanear otro QR.",
      alreadyCheckedIn: "Ya tenia check-in en Luma.",
      approvalLabel: "Estado",
      previewAction: "Check-in",
      previewGuestPlaceholder: "Nombre del invitado",
      previewEventPlaceholder: "Nombre del evento",
      connectTitle: "Conectar tu calendario Luma",
      connectSubtitle:
        "Pega la API key de tu calendario para ver tus eventos. La key se guarda solo en este navegador.",
      connectKeyLabel: "API key de Luma",
      connectKeyPlaceholder: "secret-...",
      connectKeyRequired: "Ingresa tu API key de Luma.",
      connectAction: "Conectar calendario",
      connectSaving: "Conectando...",
      connectFailed: "No se pudo conectar con esa API key.",
      connectConnectedTitle: "Calendario conectado",
      connectConnectedHint:
        "Tu key vive solo en sessionStorage de este navegador. Se borra al cerrar la pestana.",
      connectDisconnect: "Desconectar",
      connectStorageHint:
        "La key no se guarda en el servidor de Vercel. Solo se envia en cada request mientras uses esta pestana.",
      connectSecurityTitle: "Seguridad",
      connectSecurityBody:
        "Al usar esta URL compartida, tu API key viaja por el navegador y el servidor de este despliegue en cada consulta. No la pegues en sitios en los que no confies.",
      connectSecurityDeployHint:
        "Para maxima seguridad, haz fork del repo y despliega tu propia instancia en Vercel con LUMA_API_KEY en variables de entorno. Asi la key nunca sale de tu proyecto.",
      serverCalendarHint:
        "Este despliegue usa una API key configurada en el servidor (ideal para la instancia oficial del organizador).",
      connectSettingsTitle: "Calendario Luma",
      connectServerActive:
        "Ahora mismo ves los eventos del calendario configurado en este despliegue.",
      connectUseOwnKey: "Usar mi propia API key",
      connectHideForm: "Ocultar",
      badgeSettingsTitle: "Gafete impreso",
      badgeSettingsHint:
        "Por defecto el QR usa el contenido del ticket de evento. Tambien puedes usar la URL de check-in del invitado escaneado.",
      qrSourceCustom: "QR del ticket de evento",
      qrSourceGuest: "URL de check-in del invitado",
      badgeQrLabel: "Contenido del QR en el gafete",
      includeTicketName: "Tipo de entrada",
    },
    credits: {
      title: "Cursor Credits",
      subtitle:
        "Carga un CSV con links para reclamar creditos. Cada impresion usa el siguiente link como QR.",
      titleLabel: "Titulo del ticket",
      subtitleLabel: "Subtitulo (opcional)",
      uploadCsv: "Cargar CSV",
      csvHint: "Columnas sugeridas: url/link y name/label. Tambien acepta una columna con URLs.",
      csvEmpty: "El CSV no tiene links validos.",
      csvError: "No se pudo leer el CSV.",
      csvLoaded: "{count} links cargados.",
      queueEmpty: "Cola vacia. Carga un CSV para empezar.",
      progress: "Siguiente: {current} de {total}",
      remainingLabel: "Restantes",
      includeSubtitle: "Subtitulo",
      printNext: "Imprimir siguiente",
      resetQueue: "Reiniciar cola",
      clearQueue: "Vaciar cola",
      printerRequired: "Conecta la impresora antes de imprimir.",
      printedNext: "Ticket impreso. Listo para el siguiente.",
      printedLast: "Ultimo ticket impreso. Cola completada.",
      printError: "Error al imprimir.",
      queueReset: "Cola reiniciada desde el inicio.",
      queueCleared: "Cola vaciada.",
      previewEmpty: "Carga un CSV para ver la vista previa.",
    },
  },
  en: {
    language: { label: "Language", es: "Español", en: "English" },
    theme: { label: "Theme", light: "Light", dark: "Dark" },
    creator: { by: "Created by" },
    docs: {
      title: "Documentation",
      pageTitle: "Printer and setup",
      pageSubtitle:
        "Guide for using Cursor POS with the GOOJPRT PT-210 and other 58 mm Bluetooth thermal printers.",
      openLink: "View documentation",
      backToApp: "Back to Cursor POS",
      printerTitle: "Recommended printer",
      printerModel: "GOOJPRT PT-210 (portable, Bluetooth, 58 mm paper)",
      printerSpecs:
        "Wireless 58 mm thermal printer. Approx. size: 88 x 110 x 41 mm. Works with ESC/POS tickets from the browser.",
      compatibilityTitle: "Other compatible printers",
      compatibilityBody:
        "Also works with other 58 mm Bluetooth thermal printers with ESC/POS support, such as MTP-2, similar GOOJPRT models, and many portable receipt printers. Use 58 mm paper and Serial connection (virtual COM port) in Chrome or Edge.",
      connectTitle: "How to connect",
      connectSteps: [
        "Turn on the printer and load 58 mm thermal paper.",
        "Pair it via Bluetooth in Windows (Settings > Bluetooth).",
        "Open this app in Chrome or Edge over HTTPS (or localhost).",
        "Click Connect Serial and pick the printer port (e.g. PT-210, paired MTP-2, or a Bluetooth COM port).",
        "Keep speed at 9600 baud and print a test ticket.",
        "On Windows, direct USB usually does not work in the browser; prefer Bluetooth + Serial.",
      ],
      modesTitle: "Ticket modes",
      modesIntro:
        "Cursor POS has four modes. Each includes a live preview and supports 58 mm or 80 mm paper.",
      modes: [
        "Event ticket: editable fields, toggleable sections, and savable defaults.",
        "Photo ticket: camera or upload, framing, countdown, and Cursor logo.",
        "Luma check-in: QR scanning, confirm-before-print badges, and a live session log.",
        "Cursor Credits: link queue from CSV; each print advances to the next QR.",
      ],
      eventTicketTitle: "Event ticket",
      eventTicketBody:
        "Customize the ticket and enable only the sections you need. The preview updates instantly.",
      eventTicketSteps: [
        "Fill in business name, QR, event type, action, name, extra, and WiFi.",
        "Use Ticket sections to show or hide logo, QR, event type, action, name, and extra.",
        "Enable Include WiFi only when you want network and password on the printed ticket.",
        "Click Save defaults to remember values in this browser.",
        "Print or download the ESC/POS file as backup.",
      ],
      lumaTitle: "Luma check-in",
      lumaBody:
        "Print badges when scanning guests. The app loads guest data from Luma but does not mark check-in in Luma (the public API no longer supports it). Use Luma's official scanner for attendance.",
      lumaSteps: [
        "Connect your Luma calendar (browser API key or LUMA_API_KEY on the server).",
        "Select the event and start scanning with the camera.",
        "On a valid QR scan you hear a beep and the Guest ready panel appears.",
        "Review the badge preview and click Print badge or Discard.",
        "The live log keeps recent scans with a reprint option.",
      ],
      lumaBadgeTitle: "Badge settings",
      lumaBadgeSteps: [
        "Event ticket QR: uses QR content from Event ticket mode (recommended for custom links).",
        "Guest check-in URL: uses the original Luma URL from the scanned QR.",
        "Toggle logo, QR, action, ticket type, and timestamp under Ticket sections.",
        "Action label and QR content can be edited before printing.",
      ],
      lumaNote:
        "By default the printed QR is NOT the guest's Luma check-in URL—it uses the Event ticket QR unless you choose Guest check-in URL.",
      creditsTitle: "Cursor Credits",
      creditsBody:
        "Hand out tickets with unique claim links. Each CSV row is one ticket; printing automatically advances the queue to the next link.",
      creditsSteps: [
        "Open Cursor Credits mode and upload a CSV with name and URL columns.",
        "Optional: edit title, subtitle, and ticket sections (logo, QR, label, etc.).",
        "Click Print next: the ticket QR is the current row's link.",
        "After printing, the queue advances. Use Reset queue or Clear queue if needed.",
        "Progress and queue state persist in this browser's localStorage.",
      ],
      creditsCsvTitle: "CSV format",
      creditsCsvHint:
        "The parser looks for url, link, claim, or credit columns for the link, and name, label, email, or guest for the label. Semicolon separators are also supported.",
      creditsCsvColumns: [
        "Suggested headers: name, url",
        "Example: Ana Garcia, https://cursor.com/redeem/abc123",
        "A sample file lives at examples/cursor-credits-test.csv in the repo.",
      ],
      lumaSetupTitle: "Connect Luma",
      lumaSetupSteps: [
        "Option A — Paste your API key in the app (sessionStorage, this tab only).",
        "Option B — Fork the repo, deploy to Vercel, and set LUMA_API_KEY on the server (recommended for production).",
        "Requires Luma Plus. Event ticket, photo, and credits work without Luma.",
      ],
      lumaSetupNote:
        "On a shared deployment, the API key still passes through the server on each request if you use Option A.",
      featuresTitle: "App features",
      features: [
        "Four modes: event ticket, photo, Luma check-in, and Cursor Credits.",
        "Large live preview with per-mode section toggles.",
        "Event ticket: logo, QR, WiFi, timestamp, and savable defaults.",
        "Luma: scan with confirmation, configurable badge, and reprint log.",
        "Credits: sequential CSV queue with QR = claim link.",
        "Direct Web Serial printing and ESC/POS download backup.",
        "Spanish and English UI with light/dark theme.",
      ],
      requirementsTitle: "Requirements",
      requirements: [
        "Browser: Chrome or Edge (recommended).",
        "HTTPS required for camera and printer access.",
        "58 mm thermal printer (80 mm optional in settings).",
        "Each station uses its own locally connected printer.",
      ],
      repoTitle: "Source code",
      repoBody: "The project is open source. Report bugs, share feedback, or contribute on GitHub.",
      repoLinkLabel: "github.com/cursorcommunityled/cursor-pos",
    },
    ticketMode: {
      label: "Ticket type",
      event: "Event ticket",
      photo: "Photo ticket",
      luma: "Luma check-in",
      credits: "Cursor Credits",
    },
    app: {
      brand: "Cursor POS",
      title: "Ticket printing",
      subtitle: "Connect your thermal printer from the browser and print directly, including on Vercel.",
      preview: "Preview",
      previewPhotoPlaceholder: "Photo will appear here",
      namePlaceholder: "Name",
      wifi: "WiFi",
      wifiNetwork: "Network",
      wifiPassword: "Password",
    },
    browser: {
      unsupported:
        "This browser does not support direct printing. Open the app in Chrome or Edge over HTTPS.",
    },
    printer: {
      title: "Printer",
      connecting: "Connecting...",
      disconnected: "Not connected",
      connected: "Connected",
      statusConnected: "Connected",
      statusDisconnected: "Disconnected",
      baud: "Serial speed (baud)",
      connectSerial: "Connect Serial",
      connectUsb: "Connect USB",
      usbUnavailable: "USB unavailable",
      usbWindowsHint: "On Windows the driver blocks WebUSB. Use Connect Serial.",
      disconnect: "Disconnect",
      footnote:
        "PT-210 / MTP-2 over Bluetooth: use Connect Serial and pick the paired port. Recommended speed: 9600 baud. Logo and photos are optimized for thermal paper.",
    },
    fields: {
      businessName: "Business name",
      nombre: "Name",
      extra: "Extra",
      qrContent: "QR content",
      eventType: "Event type",
      actionLabel: "Action",
      wifiSsid: "WiFi network",
      wifiPassword: "WiFi password",
      paperWidth: "Paper width",
      includeWifi: "Include WiFi",
      includeTimestamp: "Include date and time",
      name: "Name",
      ticketSections: "Ticket sections",
      includeLogo: "Logo",
      includeQr: "QR code",
      includeEventType: "Event type",
      includeActionLabel: "Action",
      includeName: "Name",
      includeExtra: "Extra",
    },
    placeholders: {
      businessName: "Cursor Meetup - San Jose",
      nombre: "Juan Santamaria",
      extra: "VIP, table 3, company...",
      qrContent: "https://luma.com/...",
      eventType: "Drop-by slot",
      actionLabel: "Check-in",
      wifiSsid: "Taller.1",
      wifiPassword: "@Salvo20",
    },
    actions: {
      printEvent: "Print ticket",
      printPhoto: "Print photo",
      download: "Download ESC/POS",
      saveDefaults: "Save defaults",
    },
    camera: {
      title: "Photo",
      hintIdle: "Turn on the camera or choose an image",
      hintReview: "Drag the photo to frame it, then confirm",
      hintReady: "Drag the photo to adjust the framing",
      hintPan: "Drag to reposition the photo",
      change: "Change",
      cameraLabel: "Camera",
      switchCamera: "Switch camera",
      open: "Open camera",
      upload: "Upload photo",
      capture: "Capture",
      preparing: "Preparing...",
      cancel: "Cancel",
      stop: "Stop",
      retake: "Retake",
      retakePhoto: "Retake photo",
      usePhoto: "Use this photo",
      cameraFallback: "Could not open the camera. Try uploading a photo from gallery.",
      cameraPlayError: "Could not show the camera. Try uploading a photo from gallery.",
      cameraLoadError: "Could not open the camera. Try uploading a photo from gallery.",
      cameraWait: "Wait for the camera to load and try again.",
      imageProcessError: "Could not process the image.",
      cameraDefault: "Camera",
      switchError: "Could not switch camera.",
    },
    status: {
      defaultsSaved: "Values saved as defaults.",
      connectedSerial: "Printer connected via serial port.",
      connectedUsb: "Printer connected via USB.",
      disconnected: "Printer disconnected.",
      printEvent: "Ticket sent to the printer.",
      printPhoto: "Photo sent to the printer.",
      downloaded: "ESC/POS file downloaded.",
      connectCancelled:
        "Connection cancelled. Try again and pick your printer in the browser dialog.",
      connectError: "Could not connect the printer.",
      serialOpenFailed:
        "Could not open the serial port. Close other Cursor POS tabs, restart the printer, make sure it is on and paired, and that no other app is using the COM port.",
      printError: "Print error.",
      downloadError: "Download error.",
    },
    luma: {
      title: "Luma check-in",
      subtitle: "Scan the QR, review guest details, and confirm before printing the badge.",
      eventLabel: "Event",
      loadingEvents: "Loading events...",
      noEvents: "No events available",
      eventsLoadError: "Could not load Luma events.",
      selectEventFirst: "Select an event before scanning.",
      printerRequired: "Connect the printer before printing.",
      scannerTitle: "QR scanner",
      scannerIdleHint: "Start the camera to receive guests.",
      scannerActiveHint: "Point at the guest Luma QR code.",
      scannerWaitingHint: "Waiting for scan...",
      scannerPausedHint: "Confirm or discard the current guest to keep scanning.",
      scannerStoppedHint: "The camera starts when scanning begins.",
      startScan: "Start scanning",
      stopScan: "Stop scanning",
      processing: "Processing...",
      invalidQr: "That code does not look like a valid Luma QR.",
      eventMismatch: "That QR belongs to a different event than the one selected.",
      guestLoadError: "Could not load guest information.",
      checkinError: "Could not mark check-in in Luma.",
      checkInApiUnavailable:
        "Luma no longer exposes check-in on its public API. Print the badge here and mark attendance with Luma's official scanner.",
      scanProcessError: "Could not process the scan.",
      scannerStartError: "Could not start the camera for scanning.",
      scannedSuccess: "Badge printed and check-in recorded.",
      scannedPrinted: "Badge printed.",
      printedCheckinFailed: "Badge printed, but Luma check-in failed.",
      reprinted: "Badge reprinted.",
      printError: "Reprint error.",
      logTitle: "Live log",
      logHint: "Latest scans from this session.",
      logEmpty: "No scans yet.",
      reprint: "Reprint",
      clearLog: "Clear log",
      statusPrinted: "Printed",
      statusPrintFailed: "Not printed",
      statusCheckedIn: "Checked in",
      statusCheckinPending: "Check-in pending",
      statusAwaitingPrint: "Awaiting print",
      confirmTitle: "Guest ready",
      confirmHint: "Review the badge preview and confirm printing.",
      confirmPrint: "Print badge",
      confirmDiscard: "Discard",
      scannedReady: "QR captured. Review the details and print when ready.",
      discardPendingFirst: "Discard or print the current guest before scanning another QR.",
      alreadyCheckedIn: "Already checked in on Luma.",
      approvalLabel: "Status",
      previewAction: "Check-in",
      previewGuestPlaceholder: "Guest name",
      previewEventPlaceholder: "Event name",
      connectTitle: "Connect your Luma calendar",
      connectSubtitle:
        "Paste your calendar API key to load your events. The key stays in this browser only.",
      connectKeyLabel: "Luma API key",
      connectKeyPlaceholder: "secret-...",
      connectKeyRequired: "Enter your Luma API key.",
      connectAction: "Connect calendar",
      connectSaving: "Connecting...",
      connectFailed: "Could not connect with that API key.",
      connectConnectedTitle: "Calendar connected",
      connectConnectedHint:
        "Your key lives only in this browser sessionStorage. It clears when you close the tab.",
      connectDisconnect: "Disconnect",
      connectStorageHint:
        "The key is not stored on the Vercel server. It is sent with each request only while this tab is open.",
      connectSecurityTitle: "Security",
      connectSecurityBody:
        "On this shared URL, your API key passes through the browser and this deployment server on every request. Do not paste it on sites you do not trust.",
      connectSecurityDeployHint:
        "For maximum security, fork the repo and deploy your own Vercel instance with LUMA_API_KEY in environment variables. That way the key never leaves your project.",
      serverCalendarHint:
        "This deployment uses a server-side API key (best for the official organizer instance).",
      connectSettingsTitle: "Luma calendar",
      connectServerActive:
        "You are currently seeing events from this deployment's configured calendar.",
      connectUseOwnKey: "Use my own API key",
      connectHideForm: "Hide",
      badgeSettingsTitle: "Printed badge",
      badgeSettingsHint:
        "By default the QR uses the event ticket content. You can also use the scanned guest's Luma check-in URL.",
      qrSourceCustom: "Event ticket QR",
      qrSourceGuest: "Guest check-in URL",
      badgeQrLabel: "QR content on the badge",
      includeTicketName: "Ticket type",
    },
    credits: {
      title: "Cursor Credits",
      subtitle:
        "Upload a CSV with claim links. Each print uses the next link as the QR code.",
      titleLabel: "Ticket title",
      subtitleLabel: "Subtitle (optional)",
      uploadCsv: "Upload CSV",
      csvHint: "Suggested columns: url/link and name/label. A single URL column also works.",
      csvEmpty: "The CSV has no valid links.",
      csvError: "Could not read the CSV.",
      csvLoaded: "{count} links loaded.",
      queueEmpty: "Queue empty. Upload a CSV to get started.",
      progress: "Next: {current} of {total}",
      remainingLabel: "Remaining",
      includeSubtitle: "Subtitle",
      printNext: "Print next",
      resetQueue: "Reset queue",
      clearQueue: "Clear queue",
      printerRequired: "Connect the printer before printing.",
      printedNext: "Ticket printed. Ready for the next one.",
      printedLast: "Last ticket printed. Queue complete.",
      printError: "Print error.",
      queueReset: "Queue reset to the beginning.",
      queueCleared: "Queue cleared.",
      previewEmpty: "Upload a CSV to see the preview.",
    },
  },
};
