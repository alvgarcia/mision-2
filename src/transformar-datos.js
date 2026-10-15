const CODIGO_REAL_MADRID = 'MAD'

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
    .sort((partidoA, partidoB) => new Date(partidoB.fecha) - new Date(partidoA.fecha))
}
