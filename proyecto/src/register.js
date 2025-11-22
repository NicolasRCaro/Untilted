// src/register.js - UNTILTED
import { supabase } from './supabase.js';
import { mostrarLogin } from './login.js';
import { cargarMenu } from './main.js';
import { mostrarFeed } from './feed.js';

export function mostrarRegistro() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="auth-box">
            <h2>Crear cuenta</h2>

            <input id="nombreReg" type="text" placeholder="Nombre de usuario" />
            <input id="emailReg" type="email" placeholder="Correo" />
            <input id="passwordReg" type="password" placeholder="Contraseña" />

            <button id="btnRegistrar">Registrarme</button>

            <p class="link">¿Ya tienes cuenta? <span id="goLogin">Inicia sesión</span></p>
        </div>
    `;

    document.getElementById("btnRegistrar").addEventListener("click", registrarUsuario);
    document.getElementById("goLogin").addEventListener("click", mostrarLogin);
}

async function registrarUsuario() {
    const username = document.getElementById("nombreReg").value.trim();
    const email = document.getElementById("emailReg").value.trim();
    const password = document.getElementById("passwordReg").value.trim();

    if (!username || !email || !password) {
        alert("Completa todos los campos.");
        return;
    }

    // Crear cuenta en Supabase
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        alert("Error al registrar: " + error.message);
        return;
    }

    // Guardar nombre de usuario en tabla de perfiles
    await supabase.from("perfiles").insert({
        user_id: data.user.id,
        username: username,
        email: email
    });

    alert("Cuenta creada correctamente.");

    await cargarMenu();
    mostrarFeed();
}