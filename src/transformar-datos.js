const CODIGO_REAL_MADRID = 'MAD'

function obtenerObjeto(valor, descripcion) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
    throw new Error(`La respuesta de la API no contiene ${descripcion} con un formato válido.`)
  }

  return valor
}

function obtenerTexto(valor, descripcion) {
  if (typeof valor !== 'string' || valor.trim() === '') {
    throw new Error(`La respuesta de la API no contiene ${descripcion} con un formato válido.`)
  }

  return valor
}

function obtenerNumero(valor, descripcion) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) {
    throw new Error(`La respuesta de la API no contiene ${descripcion} con un formato válido.`)
  }

  return numero
}

export function normalizarClasificacion(equipos) {
  if (!Array.isArray(equipos) || equipos.length === 0) {
    throw new Error('La API no devolvió equipos para la clasificación.')
  }

  return equipos.map((equipo) => {
    const datosEquipo = obtenerObjeto(equipo, 'un equipo de la clasificación')
    const club = obtenerObjeto(datosEquipo.club, 'los datos del equipo')

    return {
      posicion: obtenerNumero(datosEquipo.position, 'la posición del equipo'),
      codigo: obtenerTexto(club.code, 'el código del equipo'),
      nombre: obtenerTexto(club.name, 'el nombre del equipo'),
      jugados: obtenerNumero(datosEquipo.gamesPlayed, 'los partidos jugados'),
      victorias: obtenerNumero(datosEquipo.gamesWon, 'las victorias del equipo'),
      derrotas: obtenerNumero(datosEquipo.gamesLost, 'las derrotas del equipo'),
      diferencia: obtenerTexto(String(datosEquipo.pointsDifference ?? ''), 'la diferencia de puntos'),
    }
  })
}

export function normalizarPartidos(partidos) {
  if (!Array.isArray(partidos) || partidos.length === 0) {
    throw new Error('La API no devolvió partidos para la temporada.')
  }

  return partidos.map((partido) => {
    const datosPartido = obtenerObjeto(partido, 'un partido')
    const equipoLocal = obtenerObjeto(datosPartido.local, 'el equipo local')
    const equipoVisitante = obtenerObjeto(datosPartido.road, 'el equipo visitante')
    const clubLocal = obtenerObjeto(equipoLocal.club, 'los datos del equipo local')
    const clubVisitante = obtenerObjeto(equipoVisitante.club, 'los datos del equipo visitante')
    const fecha = obtenerTexto(datosPartido.utcDate, 'la fecha del partido')

    if (!Number.isFinite(Date.parse(fecha))) {
      throw new Error('La API devolvió un partido con una fecha no válida.')
    }

    if (typeof datosPartido.played !== 'boolean') {
      throw new Error('La API devolvió un partido sin indicar si ya se ha disputado.')
    }

    return {
      codigo: obtenerNumero(datosPartido.gameCode, 'el código del partido'),
      jornada: obtenerNumero(datosPartido.round, 'la jornada del partido'),
      fecha,
      disputado: datosPartido.played,
      sede: typeof datosPartido.venue?.name === 'string' ? datosPartido.venue.name : '',
      local: {
        codigo: obtenerTexto(clubLocal.code, 'el código del equipo local'),
        nombre: obtenerTexto(clubLocal.name, 'el nombre del equipo local'),
        escudo: typeof clubLocal.images?.crest === 'string' ? clubLocal.images.crest : '',
        puntos: datosPartido.played ? obtenerNumero(equipoLocal.score, 'el resultado del equipo local') : null,
      },
      visitante: {
        codigo: obtenerTexto(clubVisitante.code, 'el código del equipo visitante'),
        nombre: obtenerTexto(clubVisitante.name, 'el nombre del equipo visitante'),
        escudo: typeof clubVisitante.images?.crest === 'string' ? clubVisitante.images.crest : '',
        puntos: datosPartido.played ? obtenerNumero(equipoVisitante.score, 'el resultado del equipo visitante') : null,
      },
    }
  })
}

export function ordenarClasificacion(equipos) {
  return [...equipos].sort((equipoA, equipoB) => equipoA.posicion - equipoB.posicion)
}

export function obtenerPartidosDisputadosDelMadrid(partidos) {
  return partidos
    .filter((partido) => (
      partido.disputado
      && (
        partido.local.codigo === CODIGO_REAL_MADRID
        || partido.visitante.codigo === CODIGO_REAL_MADRID
      )
    ))
    .sort((partidoA, partidoB) => Date.parse(partidoB.fecha) - Date.parse(partidoA.fecha))
}
