import { clasificacionEjemplo, partidosEjemplo } from './datos-ejemplo.js'
import { obtenerPartidosDisputadosDelMadrid, ordenarClasificacion } from './transformar-datos.js'

const cuerpoClasificacion = document.querySelector('#cuerpo-clasificacion')
const listaPartidos = document.querySelector('#lista-partidos')

if (!cuerpoClasificacion || !listaPartidos) {
  throw new Error('No se encontraron los espacios del dashboard para mostrar los datos.')
}

function crearCelda(texto) {
  const celda = document.createElement('td')
  celda.textContent = texto
  return celda
}

function mostrarClasificacion() {
  const filas = ordenarClasificacion(clasificacionEjemplo).map((equipo) => {
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

function formatearFecha(fecha) {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(fecha))
}

function mostrarPartidosDisputados() {
  const partidos = obtenerPartidosDisputadosDelMadrid(partidosEjemplo)
  const tarjetas = partidos.map((partido) => {
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

mostrarClasificacion()
mostrarPartidosDisputados()