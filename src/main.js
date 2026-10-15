import { obtenerDatosEuroliga } from './servicio-euroliga.js'
import { obtenerPartidosDisputadosDelMadrid, ordenarClasificacion } from './transformar-datos.js'

const cuerpoClasificacion = document.querySelector('#cuerpo-clasificacion')
const listaPartidos = document.querySelector('#lista-partidos')
const mensajeDatos = document.querySelector('#mensaje-datos')
const botonReintentar = document.querySelector('#reintentar-carga')

const elementosNecesarios = [
  cuerpoClasificacion,
  listaPartidos,
  mensajeDatos,
  botonReintentar,
  document.querySelector('#temporada-actual'),
  document.querySelector('#balance-equipo'),
  document.querySelector('#derrotas-equipo'),
  document.querySelector('#posicion-equipo'),
  document.querySelector('#escudo-cabecera'),
  document.querySelector('#escudo-local-ultimo'),
  document.querySelector('#escudo-visitante-ultimo'),
  document.querySelector('#marcador-ultimo-partido'),
  document.querySelector('#detalle-ultimo-partido'),
  document.querySelector('#rival-siguiente'),
  document.querySelector('#detalle-siguiente'),
  document.querySelector('#jornada-siguiente'),
  document.querySelector('#jornada-clasificacion'),
]

if (elementosNecesarios.some((elemento) => !elemento)) {
  throw new Error('No se encontraron todos los espacios del dashboard para mostrar los datos.')
}

function crearCelda(texto) {
  const celda = document.createElement('td')
  celda.textContent = texto
  return celda
}

function formatearFecha(fecha, incluirHora = false) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    ...(incluirHora ? { hour: '2-digit', minute: '2-digit' } : {}),
    timeZone: 'Europe/Madrid',
  }).format(new Date(fecha))
}

function establecerTexto(selector, texto) {
  const elemento = document.querySelector(selector)
  elemento.textContent = texto
}

function establecerEscudo(selector, equipo) {
  const imagen = document.querySelector(selector)
  const url = equipo?.escudo

  if (!url) {
    imagen.removeAttribute('src')
    imagen.alt = ''
    imagen.hidden = true
    return
  }

  let direccion

  try {
    direccion = new URL(url)
  } catch {
    imagen.removeAttribute('src')
    imagen.alt = ''
    imagen.hidden = true
    return
  }

  if (direccion.protocol !== 'https:') {
    imagen.removeAttribute('src')
    imagen.alt = ''
    imagen.hidden = true
    return
  }

  imagen.alt = `Escudo de ${equipo.nombre}`
  imagen.hidden = false
  imagen.onerror = () => {
    imagen.removeAttribute('src')
    imagen.alt = ''
    imagen.hidden = true
  }
  imagen.src = direccion.href
}

function mostrarMarcador(local, visitante) {
  const marcador = document.querySelector('#marcador-ultimo-partido')
  const separador = document.createElement('span')

  separador.textContent = ':'
  marcador.replaceChildren(
    document.createTextNode(`${local} `),
    separador,
    document.createTextNode(` ${visitante}`),
  )
}

function mostrarClasificacion(equipos) {
  const filas = ordenarClasificacion(equipos).map((equipo) => {
    const fila = document.createElement('tr')

    if (equipo.codigo === 'MAD') {
      fila.classList.add('fila-real-madrid')
    }

    fila.append(
      crearCelda(equipo.posicion),
      crearCelda(equipo.nombre),
      crearCelda(equipo.jugados),
      crearCelda(equipo.victorias),
      crearCelda(equipo.derrotas),
      crearCelda(equipo.diferencia),
    )

    return fila
  })

  cuerpoClasificacion.replaceChildren(...filas)
}

function mostrarPartidosDisputados(partidos) {
  const partidosMadrid = obtenerPartidosDisputadosDelMadrid(partidos)

  if (partidosMadrid.length === 0) {
    const mensaje = document.createElement('p')
    mensaje.className = 'mensaje-vacio'
    mensaje.textContent = 'Todavía no hay partidos disputados del Real Madrid.'
    listaPartidos.replaceChildren(mensaje)
    return
  }

  const tarjetas = partidosMadrid.map((partido) => {
    const madridJuegaEnCasa = partido.local.codigo === 'MAD'
    const madrid = madridJuegaEnCasa ? partido.local : partido.visitante
    const rival = madridJuegaEnCasa ? partido.visitante : partido.local
    const victoria = madrid.puntos > rival.puntos
    const tarjeta = document.createElement('article')
    const detalles = document.createElement('div')
    const jornada = document.createElement('span')
    const sede = document.createElement('span')
    const rivalNombre = document.createElement('p')
    const fecha = document.createElement('span')
    const resultado = document.createElement('div')
    const marcador = document.createElement('span')
    const estado = document.createElement('span')

    tarjeta.className = 'fila-partido'
    detalles.className = 'detalles-partido'
    jornada.className = 'jornada-partido'
    jornada.textContent = `J${partido.jornada}`
    sede.className = 'sede-partido'
    sede.textContent = madridJuegaEnCasa ? 'LOCAL' : 'VISITANTE'
    rivalNombre.className = 'rival-partido'
    rivalNombre.textContent = rival.nombre
    fecha.className = 'fecha-partido'
    fecha.textContent = formatearFecha(partido.fecha)
    resultado.className = 'resultado-partido'
    marcador.className = 'marcador-lista'
    marcador.textContent = `${partido.local.puntos}–${partido.visitante.puntos}`
    estado.className = victoria ? 'estado-partido victoria' : 'estado-partido derrota'
    estado.textContent = victoria ? 'V' : 'D'

    detalles.append(jornada, sede, rivalNombre, fecha)
    resultado.append(marcador, estado)
    tarjeta.append(detalles, resultado)

    return tarjeta
  })

  listaPartidos.replaceChildren(...tarjetas)
}

function mostrarResumen({ temporada, clasificacion, partidos }) {
  const equipoMadrid = clasificacion.find((equipo) => equipo.codigo === 'MAD')

  if (!equipoMadrid) {
    throw new Error('No se encontraron datos del Real Madrid en la clasificación.')
  }

  const partidosMadridDisputados = obtenerPartidosDisputadosDelMadrid(partidos)
  const partidoConEscudoMadrid = partidos.find((partido) => (
    partido.local.codigo === 'MAD' || partido.visitante.codigo === 'MAD'
  ))
  const fechaActual = Date.now()
  const ultimoPartido = partidosMadridDisputados[0]
  const proximosPartidos = partidos
    .filter((partido) => (
      !partido.disputado
      && Date.parse(partido.fecha) >= fechaActual
      && (partido.local.codigo === 'MAD' || partido.visitante.codigo === 'MAD')
    ))
    .sort((partidoA, partidoB) => Date.parse(partidoA.fecha) - Date.parse(partidoB.fecha))
  const proximoPartido = proximosPartidos[0]

  establecerTexto('#temporada-actual', temporada || 'actual')
  establecerTexto('#balance-equipo', equipoMadrid.victorias)
  establecerTexto('#derrotas-equipo', equipoMadrid.derrotas)
  establecerTexto('#posicion-equipo', equipoMadrid.posicion)
  establecerEscudo(
    '#escudo-cabecera',
    partidoConEscudoMadrid?.local.codigo === 'MAD'
      ? partidoConEscudoMadrid.local
      : partidoConEscudoMadrid?.visitante,
  )

  if (ultimoPartido) {
    establecerEscudo('#escudo-local-ultimo', ultimoPartido.local)
    establecerEscudo('#escudo-visitante-ultimo', ultimoPartido.visitante)
    mostrarMarcador(ultimoPartido.local.puntos, ultimoPartido.visitante.puntos)
    establecerTexto(
      '#detalle-ultimo-partido',
      `${ultimoPartido.local.nombre} · ${ultimoPartido.visitante.nombre} · ${formatearFecha(ultimoPartido.fecha)}`,
    )
  } else {
    establecerEscudo('#escudo-local-ultimo', null)
    establecerEscudo('#escudo-visitante-ultimo', null)
    mostrarMarcador('—', '—')
    establecerTexto('#detalle-ultimo-partido', 'Todavía no hay partidos disputados')
  }

  if (proximoPartido) {
    const madridJuegaEnCasa = proximoPartido.local.codigo === 'MAD'
    const rival = madridJuegaEnCasa ? proximoPartido.visitante : proximoPartido.local
    const sede = proximoPartido.sede ? ` · ${proximoPartido.sede}` : ''

    establecerTexto('#rival-siguiente', rival.nombre)
    establecerTexto(
      '#detalle-siguiente',
      `${madridJuegaEnCasa ? 'LOCAL' : 'VISITANTE'} · ${formatearFecha(proximoPartido.fecha, true)}${sede}`,
    )
    establecerTexto('#jornada-siguiente', `JORNADA ${proximoPartido.jornada}`)
  } else {
    establecerTexto('#rival-siguiente', 'No hay partidos programados')
    establecerTexto('#detalle-siguiente', 'El calendario no muestra próximos encuentros')
    establecerTexto('#jornada-siguiente', 'JORNADA —')
  }

  const jornadaActual = Math.max(...partidosMadridDisputados.map((partido) => partido.jornada), 0)
  establecerTexto(
    '#jornada-clasificacion',
    jornadaActual ? `JORNADA ${jornadaActual} · EUROLIGA` : 'CLASIFICACIÓN ACTUAL',
  )
}

async function cargarDatos() {
  mensajeDatos.textContent = 'Cargando datos de EuroLeague...'
  mensajeDatos.classList.remove('mensaje-error')
  mensajeDatos.hidden = false
  botonReintentar.hidden = true
  botonReintentar.disabled = true

  try {
    const datos = await obtenerDatosEuroliga()

    mostrarResumen(datos)
    mostrarClasificacion(datos.clasificacion)
    mostrarPartidosDisputados(datos.partidos)
    mensajeDatos.hidden = true
  } catch (error) {
    mensajeDatos.textContent = `No se pudieron cargar los datos: ${error.message}`
    mensajeDatos.classList.add('mensaje-error')
    botonReintentar.hidden = false
  } finally {
    botonReintentar.disabled = false
  }
}

botonReintentar.addEventListener('click', cargarDatos)
cargarDatos()
