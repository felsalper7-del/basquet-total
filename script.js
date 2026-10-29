
function verPerfil() {
  const perfil = document.getElementById("perfil-completo");

  if (perfil.style.display === "none") {
    perfil.style.display = "block";
  } else {
    perfil.style.display = "none";
  }
}


function cambiarJugador() {
  const nombre = document.querySelector(".jugador h3");
  const posicion = document.querySelector(".jugador p");
  const titulo = document.querySelector(".jugador h2");
  const foto = document.querySelector(".foto-jugador");

  if (nombre.textContent === "Felipe Saldivar") {
    titulo.textContent = "Jugador 2";
    nombre.textContent = "Stephen Curry";
    posicion.textContent = "Posición: Base";
    foto.src = "./imagenes/foto.avif";
    foto.alt = "Foto de Stephen Curry";
  document.getElementById("puntos").textContent = "30";
document.getElementById("asistencias").textContent = "6";
document.getElementById("rebotes").textContent = "5";
} 
  else {
    titulo.textContent = "Mi jugador";
    nombre.textContent = "Felipe Saldivar";
    posicion.textContent = "Posición: Base";
    foto.src = "./imagenes/foto.png.jpeg";
    foto.alt = "Foto de Felipe Saldivar";
 document.getElementById("puntos").textContent = "25";
document.getElementById("asistencias").textContent = "9";
document.getElementById("rebotes").textContent = "8";
}
}


function seleccionarJugador() {
  const selector = document.getElementById("elegir-jugador");

  if (selector.value === "curry") {
    mostrarJugador(
      "Jugador 2",
      "Stephen Curry",
      "Posición: Base",
      "./imagenes/foto.avif",
      30, 6, 5
    );
  } else if (selector.value === "lebron") {
    mostrarJugador(
      "Jugador 3",
      "LeBron James",
      "Posición: Alero",
      "./imagenes/lebron.jpg",
      27, 7, 8
    );
  } else {
    mostrarJugador(
      "Mi jugador",
      "Felipe Saldivar",
      "Posición: Base",
      "./imagenes/foto.png.jpeg",
      25, 9, 8
    );
  }
}



function mostrarJugador(titulo, nombre, posicion, imagen, puntos, asistencias, rebotes) {
  document.querySelector(".jugador h2").textContent = titulo;
  document.querySelector(".jugador h3").textContent = nombre;
  document.querySelector(".jugador p").textContent = posicion;

  const foto = document.querySelector(".foto-jugador");
  foto.src = imagen;
  foto.alt = "Foto de " + nombre;

  document.getElementById("puntos").textContent = puntos;
  document.getElementById("asistencias").textContent = asistencias;
  document.getElementById("rebotes").textContent = rebotes;
}

function abrirPerfil() {
  const selector = document.getElementById("elegir-jugador");

  if (!selector) {
    alert("No encuentro el selector de jugadores");
    return;
  }

  if (selector.value === "curry") {
    window.location.href = "curry.html";
  } else if (selector.value === "lebron") {
    window.location.href = "lebron.html";
  } else {
    window.location.href = "felipe.html";
  }
}



