import { normalizarClasificacion, normalizarPartidos } from './transformar-datos.js'

const RUTA_API = '/api/euroliga'
const CODIGO_COMPETICION = 'E'

async function solicitarJson(ruta) {
  let respuesta

  try {
    respuesta = await fetch(`${RUTA_API}${ruta}`)
  } catch (error) {
    throw new Error(`No se pudo conectar con la API de EuroLeague: ${error.message}`)
  }

  if (!respuesta.ok) {
    throw new Error(`La API de EuroLeague respondió con el error ${respuesta.status}.`)
  }

  const tipoContenido = respuesta.headers.get('content-type') ?? ''

  if (!tipoContenido.includes('application/json')) {
    throw new Error('La API de EuroLeague devolvió una respuesta que no es JSON.')
  }

  try {
    return await respuesta.json()
  } catch {
    throw new Error('La API de EuroLeague devolvió un JSON que no se puede leer.')
  }
}

function obtenerTemporadaActual(temporadas) {
  if (!Array.isArray(temporadas) || temporadas.length === 0) {
    throw new Error('La API no devolvió temporadas de EuroLeague.')
  }

  const fechaActual = new Date()
  const anioInicio = fechaActual.getMonth() >= 6
    ? fechaActual.getFullYear()
    : fechaActual.getFullYear() - 1
  const codigoTemporada = `${CODIGO_COMPETICION}${anioInicio}`
  const temporada = temporadas.find((elemento) => elemento?.code === codigoTemporada)

  if (!temporada) {
    throw new Error(`La API no dispone de la temporada ${anioInicio}-${anioInicio + 1}.`)
  }

  return temporada
}

export async function obtenerDatosEuroliga() {
  const respuestaTemporadas = await solicitarJson(`/v2/competitions/${CODIGO_COMPETICION}/seasons`)

  if (!Array.isArray(respuestaTemporadas?.data)) {
    throw new Error('La API devolvió las temporadas en un formato inesperado.')
  }

  const temporada = obtenerTemporadaActual(respuestaTemporadas.data)
  const respuestaPartidos = await solicitarJson(
    `/v2/competitions/${CODIGO_COMPETICION}/seasons/${temporada.code}/games`,
  )

  if (!Array.isArray(respuestaPartidos?.data)) {
    throw new Error('La API devolvió el calendario en un formato inesperado.')
  }

  const partidos = normalizarPartidos(respuestaPartidos.data)
  const partidosDisputados = partidos.filter((partido) => partido.disputado)

  if (partidosDisputados.length === 0) {
    throw new Error('Todavía no hay partidos disputados en esta temporada.')
  }

  const jornadaActual = Math.max(...partidosDisputados.map((partido) => partido.jornada))
  const respuestaClasificacion = await solicitarJson(
    `/v3/competitions/${CODIGO_COMPETICION}/seasons/${temporada.code}/rounds/${jornadaActual}/basicstandings`,
  )
  const clasificacion = normalizarClasificacion(respuestaClasificacion?.teams)

  if (!clasificacion.some((equipo) => equipo.codigo === 'MAD')) {
    throw new Error('La clasificación recibida no incluye al Real Madrid.')
  }

  return {
    temporada: temporada.alias,
    clasificacion,
    partidos,
  }
}
