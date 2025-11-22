// src/login.js - UNTILTED
import { supabase } from './supabase.js';
import { mostrarFeed } from './feed.js';
import { cargarMenu } from './main.js';

export function mostrarLogin() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="auth-box">
            <h2>Iniciar sesión</h2>

            <input id="emailLogin" type="email" placeholder="Correo" />
            <input id="passwordLogin" type="password" placeholder="Contraseña" />

            <button id="btnLogin">Entrar</button>

            <p class="link">¿No tienes cuenta? <span id="goRegister">Regístrate</span></p>
        </div>
    `;

    document.getElementById("btnLogin").addEventListener("click", iniciarSesion);
    document.getElementById("goRegister").addEventListener("click", () => {
        import('./register.js').then(m => m.mostrarRegistro());
    });
}

async function iniciarSesion() {
    const email = document.getElementById("emailLogin").value.trim();
    const password = document.getElementById("passwordLogin").value.trim();

    if (!email || !password) {
        alert("Completa todos los campos.");
        return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Error: " + error.message);
        return;
    }

    await cargarMenu();
    mostrarFeed();
}
