
const express = require("express");
const Parser = require("rss-parser");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = 3000;
console.log("ESTE ES EL SERVER.JS QUE ESTOY EJECUTANDO");
app.use((req, res, next) => {
  console.log("Petición recibida:", req.method, req.url);
  next();
});

app.use(express.static(__dirname));

app.get("/api/curry-stats", async (req, res) => {
  try {
    const response = await fetch(
      "https://sportapi.ai/api/basketball/players/slug/stephen-curry",
      {
        headers: {
          "X-Api-Key": process.env.SPORTAPI_KEY
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "SportAPI respondió con un error."
      });
    }

    const resultado = await response.json();

    if (!resultado.success || !resultado.data) {
      return res.status(502).json({
        error: "No se pudieron obtener los datos de Curry."
      });
    }

    const jugador = resultado.data;
    const temporada = jugador.seasons?.find(
      s => s.league?.slug === "nba" &&
           s.season === "2026-27" &&
           s.stage === "regular"
    );

    if (!temporada) {
      return res.status(404).json({
        error: "No encontramos estadísticas de la temporada 2026-27."
      });
    }

    res.json({
      nombre: jugador.name,
      equipo: jugador.team?.name,
      temporada: temporada.season,
      partidos: temporada.games,
      puntos: temporada.pts,
      rebotes: temporada.reb,
      asistencias: temporada.ast
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "No se pudo conectar con SportAPI."
    });
  }
});

app.get("/api/lebron-stats", async (req, res) => {
  try {
    const response = await fetch(
      "https://sportapi.ai/api/basketball/players/slug/lebron-james",
      {
        headers: {
          "X-Api-Key": process.env.SPORTAPI_KEY
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "SportAPI respondió con un error."
      });
    }

    const resultado = await response.json();

    if (!resultado.success || !resultado.data) {
      return res.status(502).json({
        error: "No se pudieron obtener los datos de LeBron."
      });
    }

    const jugador = resultado.data;

    const temporada = jugador.seasons?.find(
      s => s.league?.slug === "nba" &&
           s.season === "2026-27" &&
           s.stage === "regular"
    );

    if (!temporada) {
      return res.status(404).json({
        error: "No encontramos estadísticas de LeBron para 2026-27."
      });
    }

    res.json({
      nombre: jugador.name,
      equipo: jugador.team?.name,
      temporada: temporada.season,
      partidos: temporada.games,
      puntos: temporada.pts,
      rebotes: temporada.reb,
      asistencias: temporada.ast
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "No se pudo conectar con SportAPI."
    });
  }
});

app.get("/api/nba-results", async (req, res) => {
  try {
    const response = await fetch(
      "https://sportapi.ai/api/basketball/leagues/nba/games?status=finished&season=2026-27&limit=15",
      {
        headers: {
          "X-Api-Key": process.env.SPORTAPI_KEY
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "SportAPI respondió con un error."
      });
    }

    const resultado = await response.json();

    if (!resultado.success || !Array.isArray(resultado.data)) {
      return res.status(502).json({
        error: "No se pudieron obtener los resultados de la NBA."
      });
    }

    res.json({
      partidos: resultado.data.map((partido) => ({
        id: partido.id,
        fecha: partido.start,
        estado: partido.status,
        local: partido.home?.name,
        puntosLocal: partido.home?.score,
        visitante: partido.away?.name,
        puntosVisitante: partido.away?.score,
        logoLocal: partido.home?.logo_url,
        logoVisitante: partido.away?.logo_url
      }))
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo conectar con SportAPI."
    });
  }
});


app.get("/api/nba-standings", async (req, res) => {
  try {
    const response = await fetch(
      "https://sportapi.ai/api/basketball/standings/nba?season=2026-27",
      {
        headers: {
          "X-Api-Key": process.env.SPORTAPI_KEY
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "SportAPI respondió con un error."
      });
    }

    const resultado = await response.json();

    if (!resultado.success || !Array.isArray(resultado.data)) {
      return res.status(502).json({
        error: "No se pudo obtener la clasificación NBA."
      });
    }

    res.json({
      temporada: resultado.season,
      actualizado: resultado.updated_at,
      conferencias: resultado.data.map((conferencia) => ({
        nombre: conferencia.group,
        equipos: (conferencia.table || []).map((fila) => ({
          posicion: fila.position,
          nombre: fila.team?.name,
          abreviatura: fila.team?.abbreviation,
          logo: fila.team?.logo_url,
          jugados: fila.played,
          victorias: fila.won,
          derrotas: fila.lost,
          porcentaje: fila.win_pct,
          diferencia: fila.games_behind
        }))
      }))
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo conectar con SportAPI."
    });
  }
});

// Noticias de básquet actualizadas automáticamente
const parser = new Parser();
async function buscarImagen(enlace) {
  try {
    const respuesta = await fetch(enlace);
    const html = await respuesta.text();

    const coincidencia = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );

    if (coincidencia) {
      return coincidencia[1];
    }

    const alternativa = html.match(
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
    );

    return alternativa ? alternativa[1] : "";
  } catch (error) {
    return "";
  }
}
app.get("/api/noticias", async (req, res) => {
  try {
    const feed = await parser.parseURL(
      "https://www.espn.com/espn/rss/nba/news"
    );
console.log("DATOS DE LA PRIMERA NOTICIA:");
console.log(JSON.stringify(feed.items[0], null, 2));
   
const noticias = await Promise.all(
  feed.items.slice(0, 10).map(async (item) => {
  const contenido = item["content:encoded"] || item.content || "";
console.log("NOTICIA:", item.title);
console.log("CONTENIDO:", item.content);
  const imagenEnHtml = contenido.match(
    /<img[^>]+src=["']([^"']+)["']/i
  );

  const imagen =
    item.enclosure?.url ||
    item.image ||
    item.itunes?.image ||
    item["media:content"]?.url ||
    item["media:thumbnail"]?.url ||
    imagenEnHtml?.[1] ||
    "";
const imagenArticulo = await buscarImagen(item.link);
  return {
    titulo: item.title,
    enlace: item.link,
    fecha: item.pubDate,
    descripcion: item.contentSnippet || "",
    imagen: imagenArticulo || imagen || "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png"
  };
  })
);


    res.json(noticias);
  } catch (error) {
    console.error("Error al cargar noticias:", error.message);
    res.status(500).json({
      error: "No se pudieron cargar las noticias en este momento."
    });
  }
});

app.get("/api/nba-game/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: "El identificador del partido no es válido."
      });
    }

    const opciones = {
      headers: {
        "X-Api-Key": process.env.SPORTAPI_KEY
      }
    };

    const base = "https://sportapi.ai/api/basketball/games";

    const [partidoResp, jugadoresResp, estadisticasResp] =
      await Promise.all([
        fetch(`${base}/${id}`, opciones),
        fetch(`${base}/${id}/players`, opciones),
        fetch(`${base}/${id}/stats`, opciones)
      ]);

    if (!partidoResp.ok) {
      return res.status(partidoResp.status).json({
        error: "No se pudo obtener el partido."
      });
    }

    const partido = await partidoResp.json();
    const jugadores = jugadoresResp.ok
      ? await jugadoresResp.json()
      : null;
    const estadisticas = estadisticasResp.ok
      ? await estadisticasResp.json()
      : null;

    res.json({
      partido: partido.data,
      jugadores: jugadores?.data ?? null,
      estadisticas: estadisticas?.data ?? null
    });
  } catch (error) {
    console.error("Error al consultar el partido:", error.message);

    res.status(500).json({
      error: "No se pudo cargar el detalle del partido."
    });
  }
});

app.get("/api/prueba", (req, res) => {
  res.json({ mensaje: "La ruta funciona correctamente" });
});
console.log("Ruta de prueba registrada");
app.get("/api/prueba2", (req, res) => {
  console.log("Entró a prueba2");
  res.send("Ruta de prueba funcionando");
});

console.log("Rutas registradas antes de iniciar el servidor");
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});