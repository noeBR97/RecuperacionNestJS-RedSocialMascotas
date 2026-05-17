import './style.css';

const API_BASE = 'http://localhost:3000/api';
const STORAGE_KEYS = {
  token: 'pet_social_token',
  user: 'pet_social_user',
};

const state = {
  token: localStorage.getItem(STORAGE_KEYS.token),
  user: readJson(STORAGE_KEYS.user),
  profile: null,
  view: 'home',
  feedPets: [],
  myPets: [],
  adminPets: [],
  ranking: [],
  users: [],
  selectedPet: null,
  selectedUser: null,
  selectedCommentPet: null,
  commentsByPet: {},
  carouselIndex: {},
  loading: false,
};

const app = document.querySelector('#app');

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getId(entity) {
  return entity?._id || entity?.id || '';
}

function getOwnerId(pet) {
  if (!pet?.dueno) return pet?.duenoID || '';
  return typeof pet.dueno === 'string' ? pet.dueno : getId(pet.dueno);
}

function isAdmin() {
  return state.user?.rol === 'admin' || state.profile?.rol === 'admin';
}

function canEditPet(pet) {
  return isAdmin() || getOwnerId(pet) === getId(state.profile);
}

function normalizeError(error) {
  if (Array.isArray(error?.message)) return error.message.join(', ');
  return error?.message || 'No se ha podido completar la operacion';
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const hasBody = options.body !== undefined;
  const isFormData = options.body instanceof FormData;

  if (hasBody && !isFormData) headers['Content-Type'] = 'application/json';
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(normalizeError(data));
  }

  return data;
}

async function boot() {
  render();
  if (state.token) {
    await loadApp();
  }
}

async function loadApp() {
  state.loading = true;
  render();

  try {
    state.profile = await request('/usuarios/perfil');
    state.user = { ...state.user, ...state.profile };
    saveJson(STORAGE_KEYS.user, state.user);
    await refreshData();
  } catch (error) {
    toast(error.message, 'error');
    logout(false);
  } finally {
    state.loading = false;
    render();
  }
}

async function refreshData() {
  const tasks = [loadFeed(), loadMine(), loadRanking()];
  if (isAdmin()) tasks.push(loadAdminPets(), loadUsers());
  await Promise.allSettled(tasks);
  normalizePetOwnership();
}

async function loadFeed() {
  state.feedPets = await request('/mascotas/feed');
}

async function loadMine() {
  state.myPets = await request('/mascotas/mis-mascotas');
}

async function loadRanking() {
  state.ranking = await request('/mascotas/ranking/global');
}

async function loadAdminPets() {
  state.adminPets = await request('/mascotas');
}

async function loadUsers() {
  state.users = await request('/usuarios');
}

function normalizePetOwnership() {
  const myId = getId(state.profile);
  if (!myId) return;

  const allKnownPets = [...state.myPets, ...state.feedPets, ...state.adminPets];
  const byId = new Map();

  allKnownPets.forEach((pet) => {
    const id = getId(pet);
    if (id) byId.set(id, pet);
  });

  const knownPets = [...byId.values()];
  state.myPets = knownPets.filter((pet) => getOwnerId(pet) === myId);
  state.feedPets = state.feedPets.filter((pet) => getOwnerId(pet) !== myId);
}

function logout(showMessage = true) {
  state.token = null;
  state.user = null;
  state.profile = null;
  state.view = 'home';
  state.feedPets = [];
  state.myPets = [];
  state.adminPets = [];
  state.ranking = [];
  state.users = [];
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  if (showMessage) toast('Sesion cerrada');
  render();
}

function render() {
  app.innerHTML = state.token ? appTemplate() : authTemplate();
  bindEvents();
}

function authTemplate() {
  return `
    <main class="auth-shell">
      <section class="auth-panel">
        <div class="brand-mark">P</div>
        <h1>Pawly</h1>
        <p>Accede para ver mascotas de otros usuarios, dar likes, consultar el ranking y gestionar tu perfil.</p>
      </section>

      <section class="auth-forms" aria-label="Autenticacion">
        <div class="tabs" role="tablist">
          <button class="tab is-active" data-auth-tab="login" type="button">Entrar</button>
          <button class="tab" data-auth-tab="register" type="button">Registro</button>
        </div>

        <form id="loginForm" class="form-stack">
          <label>Email<input name="email" type="email" required autocomplete="email"></label>
          <label>Clave<input name="clave" type="password" required autocomplete="current-password"></label>
          <button class="primary-button" type="submit">Iniciar sesion</button>
        </form>

        <form id="registerForm" class="form-stack hidden">
          <div class="split">
            <label>Nombre<input name="nombre" required></label>
            <label>Primer apellido<input name="apellido1" required></label>
          </div>
          <div class="split">
            <label>Segundo apellido<input name="apellido2"></label>
            <label>Edad<input name="edad" type="number" min="0" max="120"></label>
          </div>
          <label>Usuario<input name="nombreUsuario" required minlength="4"></label>
          <label>Email<input name="email" type="email" required></label>
          <label>Clave<input name="clave" type="password" required minlength="6"></label>
          <button class="primary-button" type="submit">Crear cuenta</button>
        </form>
      </section>
    </main>
  `;
}

function appTemplate() {
  return `
    <header class="topbar">
      <div>
        <h1>Pawly</h1>
      </div>
      <div class="account">
        <span>${escapeHtml(getFullName(state.profile || state.user))}</span>
        <button class="danger-button" data-action="logout" type="button">Cerrar Sesión</button>
      </div>
    </header>

    <nav class="main-nav" aria-label="Menu principal">
      ${navButton('home', 'Inicio')}
      ${navButton('ranking', 'Ranking')}
      ${navButton('profile', 'Mi perfil')}
      ${isAdmin() ? navButton('admin', 'Administrador') : ''}
    </nav>

    ${state.loading ? '<div class="notice">Cargando datos del backend...</div>' : ''}

    <main class="workspace ${state.view}">
      ${viewTemplate()}
    </main>

    ${state.selectedPet ? editModalTemplate(state.selectedPet) : ''}
    ${state.selectedUser ? userModalTemplate(state.selectedUser) : ''}
  `;
}

function navButton(view, label) {
  return `<button class="nav-button ${state.view === view ? 'is-active' : ''}" data-view="${view}" type="button">${label}</button>`;
}

function getFullName(user) {
  return [user?.nombre, user?.apellido1, user?.apellido2].filter(Boolean).join(' ') || 'Usuario';
}

function viewTitle() {
  const titles = {
    home: 'Mascotas de otros usuarios',
    ranking: 'Ranking global',
    profile: 'Mi perfil',
    admin: 'Panel de administrador',
  };
  return titles[state.view] || titles.home;
}

function viewTemplate() {
  if (state.view === 'ranking') return rankingPageTemplate();
  if (state.view === 'profile') return profilePageTemplate();
  if (state.view === 'admin' && isAdmin()) return adminPageTemplate();
  return homePageTemplate();
}

function homePageTemplate() {
  return `
    <section class="panel page-panel">
      <div class="panel-title">
        <h2>Inicio</h2>
        <span>${state.feedPets.length} mascotas disponibles</span>
      </div>
      ${petsTemplate(state.feedPets, 'No hay mascotas de otros usuarios para mostrar.')}
    </section>
  `;
}

function rankingPageTemplate() {
  return `
    <section class="panel page-panel">
      <div class="panel-title">
        <h2>Ranking global</h2>
        <span>Top 10 por likes</span>
      </div>
      ${rankingTemplate()}
    </section>
  `;
}

function profilePageTemplate() {
  return `
    <section class="panel profile-panel">
      <h2>Mis datos</h2>
      ${profileTemplate()}
    </section>

    <section class="panel pet-form-panel">
      <h2>Registrar mascota</h2>
      ${petFormTemplate(null, false, 'petForm')}
    </section>

    <section class="panel my-pets-panel">
      <div class="panel-title">
        <h2>Mis mascotas</h2>
        <span>${state.myPets.length} registradas</span>
      </div>
      ${petsTemplate(state.myPets, 'Todavia no has registrado mascotas.')}
    </section>
  `;
}

function adminPageTemplate() {
  return `
    <div class="admin-forms-row">
      <section class="panel pet-form-panel">
        <h2>Registrar mascota como admin</h2>
        ${petFormTemplate(null, true, 'petForm')}
      </section>

      <section class="panel admin-create-user-panel">
        <h2>Registrar usuario</h2>
        ${createUserFormTemplate()}
      </section>
    </div>

    <section class="panel admin-pets-panel">
      <div class="panel-title">
        <h2>Todas las mascotas</h2>
        <span>${state.adminPets.length} en total</span>
      </div>
      ${petsTemplate(state.adminPets, 'No hay mascotas registradas.')}
    </section>

    <section class="panel admin-users-panel">
      <div class="panel-title">
        <h2>Usuarios</h2>
        <span>${state.users.length} registrados</span>
      </div>
      ${usersTableTemplate()}
    </section>
  `;
}

function createUserFormTemplate() {
  return `
    <form id="createUserForm" class="form-stack">
      <div class="split">
        <label>Nombre<input name="nombre" required></label>
        <label>Primer apellido<input name="apellido1" required></label>
      </div>
      <div class="split">
        <label>Segundo apellido<input name="apellido2"></label>
        <label>Edad<input name="edad" type="number" min="0" max="120"></label>
      </div>
      <div class="split">
        <label>Usuario<input name="nombreUsuario" required minlength="4"></label>
        <label>Email<input name="email" type="email" required></label>
      </div>
      <div class="split">
        <label>Clave<input name="clave" type="password" required minlength="6"></label>
        <label>Rol
          <select name="rol">
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
      </div>
      <button class="primary-button" type="submit">Crear usuario</button>
    </form>
  `;
}

function profileTemplate() {
  if (!state.profile) return '<p class="muted">Sin perfil cargado.</p>';
  return `
    <dl class="profile-list">
      <div><dt>Nombre</dt><dd>${escapeHtml(state.profile.nombre)} ${escapeHtml(state.profile.apellido1 || '')}</dd></div>
      <div><dt>Usuario</dt><dd>${escapeHtml(state.profile.nombreUsuario || '-')}</dd></div>
      <div><dt>Email</dt><dd>${escapeHtml(state.profile.email)}</dd></div>
      <div><dt>Rol</dt><dd><span class="role-pill">${escapeHtml(state.profile.rol)}</span></dd></div>
    </dl>
  `;
}

function editModalTemplate(pet) {
  return `
    <div class="modal-backdrop" data-action="close-edit-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="editPetTitle">
        <div class="modal-title">
          <h2 id="editPetTitle">Editar mascota</h2>
          <button class="icon-button close-button" data-action="close-edit-modal" type="button" aria-label="Cerrar">x</button>
        </div>
        ${petFormTemplate(pet, isAdmin(), 'editPetForm')}
      </section>
    </div>
  `;
}

function userModalTemplate(user) {
  return `
    <div class="modal-backdrop" data-action="close-user-modal">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="editUserTitle">
        <div class="modal-title">
          <h2 id="editUserTitle">Editar usuario</h2>
          <button class="icon-button close-button" data-action="close-user-modal" type="button" aria-label="Cerrar">x</button>
        </div>
        <form id="userForm" class="form-stack">
          <input type="hidden" name="id" value="${getId(user)}">
          <div class="split">
            <label>Nombre<input name="nombre" value="${escapeAttr(user?.nombre)}" required></label>
            <label>Primer apellido<input name="apellido1" value="${escapeAttr(user?.apellido1)}" required></label>
          </div>
          <div class="split">
            <label>Segundo apellido<input name="apellido2" value="${escapeAttr(user?.apellido2)}"></label>
            <label>Edad<input name="edad" type="number" min="0" max="120" value="${user?.edad || ''}"></label>
          </div>
          <label>Usuario<input name="nombreUsuario" value="${escapeAttr(user?.nombreUsuario)}" required minlength="4"></label>
          <label>Email<input name="email" type="email" value="${escapeAttr(user?.email)}" required></label>
          <label>Nueva clave<input name="clave" type="password" minlength="6" placeholder="Dejar vacio para no cambiar"></label>
          <label>Rol
            <select name="rol">
              <option value="usuario" ${user?.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
              <option value="admin" ${user?.rol === 'admin' ? 'selected' : ''}>Administrador</option>
            </select>
          </label>
          <div class="button-row">
            <button class="primary-button" type="submit">Guardar usuario</button>
            <button class="ghost-button" data-action="close-user-modal" type="button">Cancelar</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function petFormTemplate(pet, allowOwnerSelection, formId) {
  const ownerSelector = allowOwnerSelection
    ? `<label>Dueño
        <select name="duenoID" required>
          ${state.users.map((user) => `<option value="${getId(user)}" ${getOwnerId(pet) === getId(user) ? 'selected' : ''}>${escapeHtml(user.email)}</option>`).join('')}
        </select>
      </label>`
    : '';

  return `
    <form id="${formId}" class="form-stack">
      <input type="hidden" name="id" value="${getId(pet)}">
      <div class="split">
        <label>Nombre<input name="nombre" value="${escapeAttr(pet?.nombre)}" required minlength="3"></label>
        <label>Edad<input name="edad" type="number" min="1" value="${pet?.edad || ''}"></label>
      </div>
      <div class="split">
        <label>Especie
          <select name="especie" required>
            ${['Perro', 'Gato', 'Conejo', 'Reptil', 'Ave', 'Otro'].map((item) => `<option value="${item}" ${pet?.especie === item ? 'selected' : ''}>${item}</option>`).join('')}
          </select>
        </label>
        <label>Raza<input name="raza" value="${escapeAttr(pet?.raza)}"></label>
      </div>
      <label>Foto<input name="fotoFile" type="file" accept="image/*"></label>
      ${ownerSelector}
      <div class="button-row">
        <button class="primary-button" type="submit">${pet ? 'Guardar cambios' : 'Crear mascota'}</button>
        ${pet ? '<button class="ghost-button" data-action="cancel-edit" type="button">Cancelar</button>' : ''}
      </div>
    </form>
  `;
}

function rankingTemplate() {
  if (!state.ranking.length) return '<p class="muted">Todavia no hay ranking disponible.</p>';
  return `
    <ol class="ranking-list">
      ${state.ranking.map((pet, index) => `
        <li>
          <span class="rank">${index + 1}</span>
          <div>
            <strong>${escapeHtml(pet.nombre)}</strong>
            <small>${escapeHtml(pet.especie)}${pet.raza ? ` · ${escapeHtml(pet.raza)}` : ''}</small>
          </div>
          <span class="likes">${pet.totalLikes || 0} likes</span>
          <button class="icon-button" data-action="like" data-id="${getId(pet)}" title="Dar like" type="button">+</button>
        </li>
      `).join('')}
    </ol>
  `;
}

function petsTemplate(pets, emptyText) {
  if (!pets.length) return `<p class="muted">${emptyText}</p>`;
  return `<div class="pet-grid">${pets.map((pet) => petCardTemplate(pet)).join('')}</div>`;
}

function petCardTemplate(pet) {
  const id = getId(pet);
  const owner = typeof pet.dueno === 'object' ? pet.dueno?.nombreUsuario || pet.dueno?.email : '';
  const likes = Array.isArray(pet.likes) ? pet.likes.length : pet.totalLikes || 0;
  const editable = canEditPet(pet);
  const isMine = getOwnerId(pet) === getId(state.profile);

  return `
    <article class="pet-card">
      ${petCarouselTemplate(pet)}
      <div class="pet-body">
        <div>
          <h3>${escapeHtml(pet.nombre)}</h3>
          <p>${escapeHtml(pet.especie)}${pet.raza ? ` · ${escapeHtml(pet.raza)}` : ''}${pet.edad ? ` · ${pet.edad} años` : ''}</p>
          ${owner ? `<small>Dueño: ${escapeHtml(owner)}</small>` : ''}
        </div>
        <div class="pet-actions">
          ${!isMine ? `<button class="ghost-button" data-action="like" data-id="${id}" type="button">${likes} likes</button>` : `<span class="like-label">${likes} likes</span>`}
          <button class="ghost-button" data-action="comments" data-id="${id}" type="button">Ver comentarios</button>
          ${editable ? `<button class="ghost-button" data-action="edit-pet" data-id="${id}" type="button">Editar</button>` : ''}
        ${editable ? `<button class="danger-button" data-action="delete-pet" data-id="${id}" type="button">Eliminar</button>` : ''}
        </div>
        ${editable ? uploadTemplate(id) : ''}
        ${state.selectedCommentPet === id ? commentsPanelTemplate(id) : ''}
      </div>
    </article>
  `;
}

function petCarouselTemplate(pet) {
  const id = getId(pet);
  const photos = (pet.fotos || []).filter(Boolean);
  const currentIndex = Math.min(state.carouselIndex[id] || 0, Math.max(photos.length - 1, 0));
  const image = photos[currentIndex];

  if (!image) {
    return '<div class="pet-media empty"><span>Sin foto</span></div>';
  }

  return `
    <div class="pet-media carousel">
      <img src="${escapeAttr(image)}" alt="${escapeAttr(pet.nombre)}">
      ${photos.length > 1 ? `
        <button class="carousel-button prev" data-action="carousel-prev" data-id="${id}" type="button" aria-label="Foto anterior">&lt;</button>
        <button class="carousel-button next" data-action="carousel-next" data-id="${id}" type="button" aria-label="Foto siguiente">&gt;</button>
        <span class="carousel-count">${currentIndex + 1}/${photos.length}</span>
      ` : ''}
    </div>
  `;
}

function uploadTemplate(id) {
  return `
    <form class="upload-form" data-upload-id="${id}">
      <input name="file" type="file" accept="image/*">
      <button class="ghost-button" type="submit">Subir foto</button>
    </form>
  `;
}

function commentsPanelTemplate(id) {
  const comments = state.commentsByPet[id] || [];
  const emotes = ['😀', '😍', '😂', '🥰', '👏', '❤️', '🐾', '⭐'];

  return `
    <div class="comments-panel">
      <div class="comments-list">
        ${comments.length ? comments.map((comment) => commentItemTemplate(comment, id)).join('') : '<p class="muted">Todavia no hay comentarios.</p>'}
      </div>
      <form class="comment-form" data-comment-id="${id}">
        <input name="texto" maxlength="500" placeholder="Nuevo comentario">
        <button class="ghost-button emote-toggle" data-action="toggle-emotes" data-id="${id}" type="button">Emotes</button>
        <button class="primary-button" type="submit">Enviar</button>
        <div class="emote-picker" data-emote-picker="${id}">
          ${emotes.map((emote) => `<button class="emote-button" data-action="insert-emote" data-id="${id}" data-emote="${emote}" type="button">${emote}</button>`).join('')}
        </div>
      </form>
    </div>
  `;
}

function commentItemTemplate(comment, petId) {
  const user = comment.usuarioID;
  const author = typeof user === 'object' ? user?.nombre || user?.email || 'Usuario' : 'Usuario';
  const date = comment.fecha ? new Date(comment.fecha).toLocaleString('es-ES') : '';
  const commentId = getId(comment);

  return `
    <article class="comment-item">
      <div>
        <strong>${escapeHtml(author)}</strong>
        ${date ? `<time>${escapeHtml(date)}</time>` : ''}
      </div>
      <p>${escapeHtml(comment.texto || '')}</p>
      ${isAdmin() ? `<button class="danger-button small-button" data-action="delete-comment" data-id="${petId}" data-comment-id="${commentId}" type="button">Eliminar comentario</button>` : ''}
    </article>
  `;
}

function usersTableTemplate() {
  if (!state.users.length) return '<p class="muted">No hay usuarios para mostrar.</p>';
  return `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nombre</th><th>Usuario</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
        <tbody>
          ${state.users.map((user) => `
            <tr>
              <td>${escapeHtml(user.nombre)} ${escapeHtml(user.apellido1 || '')}</td>
              <td>${escapeHtml(user.nombreUsuario || '-')}</td>
              <td>${escapeHtml(user.email)}</td>
              <td><span class="role-pill">${escapeHtml(user.rol)}</span></td>
              <td>
                <div class="table-actions">
                  <button class="ghost-button" data-action="edit-user" data-id="${getId(user)}" type="button">Editar</button>
                  <button class="danger-button" data-action="delete-user" data-id="${getId(user)}" type="button">Eliminar</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll('[data-auth-tab]').forEach((button) => {
    button.addEventListener('click', () => switchAuthTab(button.dataset.authTab));
  });

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = button.dataset.view;
      state.selectedPet = null;
      state.selectedUser = null;
      render();
    });
  });

  document.querySelector('#loginForm')?.addEventListener('submit', onLogin);
  document.querySelector('#registerForm')?.addEventListener('submit', onRegister);
  document.querySelector('#petForm')?.addEventListener('submit', onSavePet);
  document.querySelector('#editPetForm')?.addEventListener('submit', onSavePet);
  document.querySelector('#createUserForm')?.addEventListener('submit', onCreateUser);
  document.querySelector('#userForm')?.addEventListener('submit', onSaveUser);

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', onAction);
  });

  document.querySelectorAll('.upload-form').forEach((form) => {
    form.addEventListener('submit', onUpload);
  });

  document.querySelectorAll('.comment-form').forEach((form) => {
    form.addEventListener('submit', onComment);
  });
}

function switchAuthTab(tab) {
  document.querySelectorAll('[data-auth-tab]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.authTab === tab);
  });
  document.querySelector('#loginForm').classList.toggle('hidden', tab !== 'login');
  document.querySelector('#registerForm').classList.toggle('hidden', tab !== 'register');
}

async function onLogin(event) {
  event.preventDefault();
  const form = new FormData(event.target);

  try {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: form.get('email'),
        clave: form.get('clave'),
      }),
    });

    state.token = data.token;
    state.user = data.usuario;
    localStorage.setItem(STORAGE_KEYS.token, data.token);
    saveJson(STORAGE_KEYS.user, data.usuario);
    toast('Sesion iniciada');
    await loadApp();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function onRegister(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const payload = objectFromForm(form);
  payload.edad = numberOrUndefined(payload.edad);
  payload.rol = 'usuario';

  try {
    await request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    toast('Cuenta creada. Ya puedes iniciar sesion.');
    switchAuthTab('login');
    event.target.reset();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function onCreateUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = objectFromForm(new FormData(form));
  payload.edad = numberOrUndefined(payload.edad);

  try {
    await request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    toast('Usuario creado');
    form.reset();
    await refreshAndRender();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function onSavePet(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const id = form.get('id');
  const payload = objectFromForm(form);
  const fotoFile = form.get('fotoFile');
  delete payload.id;
  delete payload.fotoFile;

  payload.edad = numberOrUndefined(payload.edad);
  delete payload.fotos;
  if (!payload.duenoID) delete payload.duenoID;

  try {
    let pet = await request(id ? `/mascotas/${id}` : '/mascotas', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });

    if (fotoFile?.size) {
      try {
        const data = new FormData();
        data.append('file', fotoFile);
        pet = await request(`/mascotas/${getId(pet)}/upload`, {
          method: 'PUT',
          body: data,
        });
      } catch (error) {
        toast(`Mascota guardada, pero la foto no se pudo subir: ${error.message}`, 'error');
      }
    }

    mergePetIntoState(pet, payload.duenoID);
    state.selectedPet = null;
    if (fotoFile?.size) {
      toast('Mascota guardada con foto');
    } else {
      toast(id ? 'Mascota actualizada' : 'Mascota registrada');
    }
    await refreshAndRender();
  } catch (error) {
    toast(error.message, 'error');
  }
}

function mergePetIntoState(pet, ownerIdFromForm) {
  const ownerId = getOwnerId(pet) || ownerIdFromForm || getId(state.profile);
  const petId = getId(pet);
  const replace = (items) => [pet, ...items.filter((item) => getId(item) !== petId)];

  if (ownerId === getId(state.profile)) {
    state.myPets = replace(state.myPets);
    state.feedPets = state.feedPets.filter((item) => getId(item) !== petId);
  }

  if (isAdmin()) {
    state.adminPets = replace(state.adminPets);
  }
}

async function onSaveUser(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const id = form.get('id');
  const payload = objectFromForm(form);
  delete payload.id;

  payload.edad = numberOrUndefined(payload.edad);
  if (!payload.clave) delete payload.clave;

  try {
    await request(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    state.selectedUser = null;
    toast('Usuario actualizado');
    await refreshAndRender();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function onAction(event) {
  const { action, id, commentId } = event.currentTarget.dataset;

  if (action === 'logout') return logout();
  if (action === 'refresh') return refreshAndRender();
  if (action === 'cancel-edit') {
    state.selectedPet = null;
    render();
    return;
  }
  if (action === 'close-edit-modal') {
    if (event.target !== event.currentTarget && !event.currentTarget.classList.contains('close-button')) return;
    state.selectedPet = null;
    render();
    return;
  }
  if (action === 'close-user-modal') {
    if (event.target !== event.currentTarget && !event.currentTarget.classList.contains('close-button')) return;
    state.selectedUser = null;
    render();
    return;
  }
  if (action === 'carousel-prev' || action === 'carousel-next') {
    moveCarousel(id, action === 'carousel-next' ? 1 : -1);
    return;
  }
  if (action === 'toggle-emotes') {
    toggleEmotes(id);
    return;
  }
  if (action === 'insert-emote') {
    insertEmote(id, event.currentTarget.dataset.emote);
    return;
  }
  if (action === 'edit-pet') {
    state.selectedPet = [...state.myPets, ...state.adminPets, ...state.feedPets].find((pet) => getId(pet) === id);
    render();
    return;
  }
  if (action === 'comments') {
    if (state.selectedCommentPet === id) {
      state.selectedCommentPet = null;
      render();
      return;
    }

    state.selectedCommentPet = id;
    await loadComments(id);
    render();
    return;
  }
  if (action === 'like') return likePet(id);
  if (action === 'delete-pet') return deletePet(id);
  if (action === 'edit-user') {
    state.selectedUser = state.users.find((user) => getId(user) === id);
    render();
    return;
  }
  if (action === 'delete-user') return deleteUser(id);
  if (action === 'delete-comment') return deleteComment(id, commentId);
}

function toggleEmotes(id) {
  const picker = document.querySelector(`[data-emote-picker="${id}"]`);
  picker?.classList.toggle('is-open');
}

function insertEmote(id, emote) {
  const form = document.querySelector(`.comment-form[data-comment-id="${id}"]`);
  const input = form?.elements.texto;
  if (!input || !emote) return;

  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  input.value = `${input.value.slice(0, start)}${emote}${input.value.slice(end)}`;
  input.focus();
  input.setSelectionRange(start + emote.length, start + emote.length);
}

async function loadComments(id) {
  try {
    state.commentsByPet[id] = await request(`/mascotas/${id}/comentarios`);
  } catch (error) {
    state.commentsByPet[id] = [];
    toast(error.message, 'error');
  }
}

function moveCarousel(id, direction) {
  const pet = [...state.feedPets, ...state.myPets, ...state.adminPets].find((item) => getId(item) === id);
  const total = pet?.fotos?.filter(Boolean).length || 0;
  if (total < 2) return;

  const current = state.carouselIndex[id] || 0;
  state.carouselIndex[id] = (current + direction + total) % total;
  render();
}

async function likePet(id) {
  try {
    await request(`/mascotas/${id}/like`, { method: 'PUT' });
    toast('Like registrado');
    await refreshAndRender();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function deletePet(id) {
  if (!confirm('Eliminar esta mascota?')) return;
  try {
    await request(`/mascotas/${id}`, { method: 'DELETE' });
    state.selectedPet = null;
    toast('Mascota eliminada');
    await refreshAndRender();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function deleteUser(id) {
  if (id === getId(state.profile)) {
    toast('No puedes eliminar tu propio usuario desde aqui', 'error');
    return;
  }

  if (!confirm('Eliminar este usuario?')) return;

  try {
    await request(`/usuarios/${id}`, { method: 'DELETE' });
    state.selectedUser = null;
    toast('Usuario eliminado');
    await refreshAndRender();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function deleteComment(petId, commentId) {
  if (!commentId) return;
  if (!confirm('Eliminar este comentario?')) return;

  try {
    await request(`/mascotas/${petId}/comentarios/${commentId}`, { method: 'DELETE' });
    await loadComments(petId);
    toast('Comentario eliminado');
    render();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function onUpload(event) {
  event.preventDefault();
  const id = event.currentTarget.dataset.uploadId;
  const input = event.currentTarget.elements.file;
  if (!input.files.length) {
    toast('Selecciona una imagen', 'error');
    return;
  }

  const data = new FormData();
  data.append('file', input.files[0]);

  try {
    await request(`/mascotas/${id}/upload`, { method: 'PUT', body: data });
    toast('Foto subida');
    await refreshAndRender();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function onComment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const id = form.dataset.commentId;
  const texto = form.elements.texto.value.trim();
  if (!texto) return;

  try {
    await request(`/mascotas/${id}/comentarios`, {
      method: 'POST',
      body: JSON.stringify({ texto }),
    });
    await loadComments(id);
    toast('Comentario publicado');
    form.reset();
    render();
  } catch (error) {
    toast(error.message, 'error');
  }
}

async function refreshAndRender() {
  await refreshData();
  render();
}

function objectFromForm(form) {
  return Object.fromEntries([...form.entries()].filter(([, value]) => value !== ''));
}

function numberOrUndefined(value) {
  if (value === undefined || value === '') return undefined;
  return Number(value);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value = '') {
  return escapeHtml(value);
}

function toast(message, type = 'ok') {
  const existing = document.querySelector('.toast');
  existing?.remove();

  const element = document.createElement('div');
  element.className = `toast ${type}`;
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 3600);
}

boot();
