// src/main.js - UNTILTED SPA
import { mostrarRegistro } from './register.js';
import { mostrarLogin } from './login.js';
import { mostrarFeed } from './feed.js';
import { mostrarPerfil } from './user.js';
import { mostrarAdmin } from './admin.js';
import { supabase } from './supabase.js';


// Rutas de navegación
const routes = {
  'registro': mostrarRegistro,
  'login': mostrarLogin,
  'feed': mostrarFeed,
  'perfil': mostrarPerfil,
  'admin': mostrarAdmin
};


// Cerrar sesión
async function CerrarSesion() {
  await supabase.auth.signOut();
  await cargarMenu();
  mostrarLogin();
}


// Cargar menú según sesión
export async function cargarMenu() {
  const menu = document.getElementById("menu");
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    menu.innerHTML = `
      <button data-action="registro">Crear cuenta</button>
      <button data-action="login">Iniciar sesión</button>
    `;
    mostrarRegistro();
  } else {
    menu.innerHTML = `
      <button data-action="feed">Inicio</button>
      <button data-action="perfil">Mi Perfil</button>
      <button data-action="logout">Cerrar sesión</button>
      ${user.email === "admin@mail.com" ? `<button data-action="admin">Admin</button>` : ""}
    `;
  }

  // Escuchar clics
  menu.querySelectorAll("button").forEach(btn => {
    const action = btn.getAttribute("data-action");

    if (action === "logout") {
      btn.addEventListener("click", CerrarSesion);
    } else if (routes[action]) {
      btn.addEventListener("click", routes[action]);
    }
  });
}


// Iniciar SPA
document.addEventListener("DOMContentLoaded", cargarMenu);
