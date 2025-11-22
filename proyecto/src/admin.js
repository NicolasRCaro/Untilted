// admin.js — Panel de administración para Untilted
// Este panel es sencillo: lista usuarios y posts, con opciones básicas.

import { supabase } from './supabase.js'
import { mostrarFeed } from './feed.js'

// Vista principal de admin\
export function mostrarAdmin() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <h2>Panel de Administrador</h2>

        <div style="display:flex; gap:20px; flex-wrap:wrap;">
            <button id="ver-usuarios">Ver usuarios</button>
            <button id="ver-posts">Ver posts</button>
            <button id="volver">Volver</button>
        </div>

        <div id="admin-contenido" style="margin-top:20px"></div>
    `;

    document.getElementById('volver').addEventListener('click', mostrarFeed);
    document.getElementById('ver-usuarios').addEventListener('click', cargarUsuarios);
    document.getElementById('ver-posts').addEventListener('click', cargarPosts);
}

// Lista los usuarios de auth y/o tabla profiles
async function cargarUsuarios(){
    const cont = document.getElementById('admin-contenido');
    cont.innerHTML = 'Cargando usuarios...';

    // Si tienes tabla profiles:
    const { data, error } = await supabase.from('profiles').select('*');

    if(error){
        cont.innerHTML = 'Error cargando usuarios';
        return;
    }

    if(!data.length){
        cont.innerHTML = '<p>No hay usuarios registrados.</p>';
        return;
    }

    cont.innerHTML = `
        <h3>Usuarios registrados</h3>
        <ul>
            ${data.map(u => `<li><b>@${u.username || 'sin-username'}</b> — ${u.id}</li>`).join('')}
        </ul>
    `;
}

// Lista los posts recientes
async function cargarPosts(){
    const cont = document.getElementById('admin-contenido');
    cont.innerHTML = 'Cargando posts...';

    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if(error){
        cont.innerHTML = 'Error cargando posts';
        return;
    }

    if(!data.length){
        cont.innerHTML = '<p>No hay publicaciones.</p>';
        return;
    }

    cont.innerHTML = `
        <h3>Posts recientes</h3>
        <ul>
            ${data.map(p => `
                <li>
                    <b>@${p.username}</b>: ${p.content}<br>
                    <small>${p.created_at}</small>
                </li>
            `).join('')}
        </ul>
    `;
}