// src/user.js - UNTILTED (MODIFICADO)
import { supabase } from './supabase.js';
import { cargarMenu } from './main.js';

export async function mostrarPerfil() {
    const app = document.getElementById("app");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        app.innerHTML = `<p>No has iniciado sesión.</p>`;
        return;
    }

    // Obtener perfil propio
    const { data: perfil } = await supabase
        .from("perfiles")
        .select("username, email, bio")
        .eq("user_id", user.id)
        .single();

    // Contar seguidores
    const { count: seguidores } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("followed_id", user.id);

    // Contar seguidos
    const { count: seguidos } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", user.id);

    app.innerHTML = `
        <div class="perfil-box">
            <h2>Mi Perfil</h2>
            <p><strong>Usuario:</strong> ${perfil?.username || "Sin nombre"}</p>
            <p><strong>Email:</strong> ${perfil?.email}</p>

            <div class="follow-counts">
                <p><strong>Seguidores:</strong> ${seguidores}</p>
                <p><strong>Siguiendo:</strong> ${seguidos}</p>
            </div>

            <h3>Biografía</h3>
            <textarea id="bioInput" placeholder="Escribe tu biografía...">${perfil?.bio || ""}</textarea>
            <button id="guardarBio">Guardar cambios</button>
        </div>

        <div class="perfil-posts">
            <h3>Mis publicaciones</h3>
            <div id="listaMisPosts">Cargando...</div>
        </div>
    `;

    document.getElementById("guardarBio").addEventListener("click", actualizarBio);
    cargarMisPosts(user.id);
}

// Guardar biografía
async function actualizarBio() {
    const bio = document.getElementById("bioInput").value.trim();

    const { data: { user } } = await supabase.auth.getUser();

    await supabase
        .from("perfiles")
        .update({ bio })
        .eq("user_id", user.id);

    alert("Biografía actualizada.");
}

// Cargar posts del usuario
async function cargarMisPosts(userId) {
    const cont = document.getElementById("listaMisPosts");

    const { data: posts, error } = await supabase
        .from("posts")
        .select("id, contenido, fecha")
        .eq("user_id", userId)
        .order("fecha", { ascending: false });

    if (error || !posts) {
        cont.innerHTML = "Error al cargar tus posts.";
        return;
    }

    if (posts.length === 0) {
        cont.innerHTML = "Aún no has publicado nada.";
        return;
    }

    // Obtener likes por cada post
    const postsHTML = await Promise.all(
        posts.map(async post => {
            const { count: likes } = await supabase
                .from("likes")
                .select("*", { count: "exact", head: true })
                .eq("post_id", post.id);

            return `
                <div class="post-item">
                    <p>${post.contenido}</p>
                    <span>${new Date(post.fecha).toLocaleString()}</span>
                    <div class="like-box">
                        ❤️ ${likes}
                    </div>
                </div>
            `;
        })
    );

    cont.innerHTML = postsHTML.join("");
}
