// feed.js — Untilted con Likes y Follow
import { supabase } from './supabase.js';

export function mostrarFeed() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <h2>Untilted — Inicio</h2>

        <div id="composer" style="margin-bottom:20px">
            <textarea id="post-text" rows="3" placeholder="¿Qué estás pensando?" style="width:100%; padding:10px"></textarea>
            <button id="btn-publicar" style="margin-top:10px">Publicar</button>
        </div>

        <h3>Publicaciones</h3>
        <div id="posts"></div>
    `;

    document.getElementById('btn-publicar').addEventListener('click', crearPost);
    cargarPosts();
    suscribirPosts();
}

// Crear publicación
async function crearPost() {
    const textarea = document.getElementById('post-text');
    const content = textarea.value.trim();

    if (!content) return alert('Escribe algo antes de publicar');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Debes iniciar sesión');

    // Obtener username
    const { data: profile } = await supabase
        .from('perfiles')
        .select('username')
        .eq('user_id', user.id)
        .single();

    const username = profile?.username || user.email.split('@')[0];

    const { error } = await supabase
        .from('posts')
        .insert([{ user_id: user.id, username, content }]);

    if (error) return alert(error.message);

    textarea.value = '';
}

// Cargar publicaciones
async function cargarPosts() {
    const postsEl = document.getElementById('posts');
    postsEl.innerHTML = 'Cargando...';

    const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        postsEl.innerHTML = 'Error al cargar posts';
        return;
    }

    renderPosts(posts);
}

// Renderizar posts
async function renderPosts(posts) {
    const postsEl = document.getElementById('posts');
    postsEl.innerHTML = '';

    const { data: { user } } = await supabase.auth.getUser();

    for (const p of posts) {

        // Obtener número de likes
        const { count: likes } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', p.id);

        // ¿El usuario ya dio like?
        const { data: miLike } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', p.id)
            .eq('user_id', user?.id)
            .maybeSingle();

        // ¿Lo sigo?
        const { data: sigo } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user?.id)
            .eq('followed_id', p.user_id)
            .maybeSingle();

        const btnLikeTxt = miLike ? "💔 Quitar Like" : "❤️ Like";
        const btnFollowTxt = (p.user_id === user?.id) 
            ? "" 
            : sigo 
                ? "Dejar de seguir" 
                : "Seguir";

        const div = document.createElement('div');
        div.className = 'post-item';
        div.style = 'padding:10px; border-bottom:1px solid #ddd; margin-bottom:10px;';

        div.innerHTML = `
            <b>@${p.username}</b><br>
            <span>${escapeHTML(p.content)}</span><br>
            <small style="color:#888">${new Date(p.created_at).toLocaleString()}</small>

            <div style="margin-top:8px;">
                <button class="btn-like" data-id="${p.id}">
                    ${btnLikeTxt} (${likes})
                </button>

                ${btnFollowTxt 
                    ? `<button class="btn-follow" data-user="${p.user_id}">${btnFollowTxt}</button>`
                    : ""
                }
            </div>
        `;

        postsEl.appendChild(div);
    }

    // Activar botones dinámicos
    activarBotonesLike();
    activarBotonesFollow();
}

// LIKE — Agregar o quitar
function activarBotonesLike() {
    document.querySelectorAll(".btn-like").forEach(btn => {
        btn.addEventListener("click", async () => {
            const postId = btn.getAttribute("data-id");

            const { data: { user } } = await supabase.auth.getUser();

            // ¿Ya di like?
            const { data: existe } = await supabase
                .from('likes')
                .select('*')
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existe) {
                // Quitar like
                await supabase
                    .from('likes')
                    .delete()
                    .eq('id', existe.id);
            } else {
                // Dar like
                await supabase
                    .from('likes')
                    .insert([{ post_id: postId, user_id: user.id }]);
            }

            cargarPosts();
        });
    });
}

// FOLLOW — Seguir / Dejar de seguir
function activarBotonesFollow() {
    document.querySelectorAll(".btn-follow").forEach(btn => {
        btn.addEventListener("click", async () => {
            const followedId = btn.getAttribute("data-user");
            const { data: { user } } = await supabase.auth.getUser();

            const { data: existe } = await supabase
                .from('follows')
                .select('*')
                .eq('follower_id', user.id)
                .eq('followed_id', followedId)
                .maybeSingle();

            if (existe) {
                // Dejar de seguir
                await supabase
                    .from('follows')
                    .delete()
                    .eq('id', existe.id);
            } else {
                // Seguir
                await supabase
                    .from('follows')
                    .insert([{ follower_id: user.id, followed_id: followedId }]);
            }

            cargarPosts();
        });
    });
}

// Proteger HTML
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Suscripción en tiempo real
function suscribirPosts() {
    supabase
        .channel('posts-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
            cargarPosts();
        })
        .subscribe();
}
