/* ═══════════════════════════════════════════════════════
   NAV Y MENÚ
══════════════════════════════════════════════════════════════ */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}

function closeMobile() {
  hamburger?.classList.remove('open');
  mobileMenu?.classList.remove('open');
}

/* ═══════════════════════════════════════════════════════
   ANIMACIONES
══════════════════════════════════════════════════════════════ */
const reveals = document.querySelectorAll('.reveal');
if (reveals.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════════════ */
function getPackSizeFromCard(card) {
  const presActiva = card?.querySelector('.pres-btn.active');
  if (!presActiva) return 1; // botella

  const label = presActiva.querySelector('.pres-label')?.textContent?.toLowerCase() || '';
  if (label.includes('media')) return 6;
  if (label.includes('caja')) return 12;
  return 1;
}

function getActivePresentation(card) {
  const presActiva = card?.querySelector('.pres-btn.active');
  if (!presActiva) return 'botella';
  return presActiva.querySelector('.pres-label')?.textContent?.trim() || 'botella';
}

function pluralizar(text, cantidad) {
  if (cantidad <= 1) return text;
  if (text === 'botella') return 'botellas';
  const parts = text.split(' ');
  const last = parts.pop();
  parts.push(last.endsWith('s') ? last : last + 's');
  return parts.join(' ');
}

/* ═══════════════════════════════════════════════════════
   PRESENTACIÓN (FIX TIEMPO REAL)
══════════════════════════════════════════════════════════════ */
function selecPres(btn) {
  const card = btn.closest('.wine-card');
  const qtyInput = card.querySelector('.qty-val');

  if (btn.classList.contains('active')) {
    // Deseleccionar
    card.querySelectorAll('.pres-btn').forEach(b => b.classList.remove('active'));
    qtyInput.value = 0;
  } else {
    // Seleccionar
    card.querySelectorAll('.pres-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (parseInt(qtyInput.value || '0', 10) === 0) {
      qtyInput.value = 1;
    }
  }

  generarPedido(); // 🔥 sync UI
}

/* ═══════════════════════════════════════════════════════
   CONTADOR (FIX TIEMPO REAL)
══════════════════════════════════════════════════════════════ */
function cambiarQty(btn, delta) {
  const card = btn.closest('.wine-card');
  const input = card.querySelector('.qty-val');

  let valor = parseInt(input.value || '0', 10);
  valor = Math.max(0, valor + delta);
  input.value = valor;

  // Si llega a 0 → quitar presentación
  if (valor === 0) {
    card.querySelectorAll('.pres-btn').forEach(b => b.classList.remove('active'));
  }

  generarPedido(); // 🔥 sync UI
}

/* ═══════════════════════════════════════════════════════
   GENERAR PEDIDO
══════════════════════════════════════════════════════════════ */
function generarPedido() {
  const cards = document.querySelectorAll('.wine-card');
  const lista = document.getElementById('listaPedido');
  if (!lista) return;

  lista.innerHTML = '';

  cards.forEach(card => {
    const nombre = card.dataset.nombre;
    const qtyInput = card.querySelector('.qty-val');

    let rawQty = parseInt(qtyInput?.value || '0', 10);
    const presActiva = card.querySelector('.pres-btn.active');

    // Si hay presentación y qty=0 → tomar 1
    if (presActiva && rawQty === 0) rawQty = 1;

    // Si no hay nada → no agregar
    if (!presActiva && rawQty <= 0) return;

    const pack = getPackSizeFromCard(card);
    const totalBotellas = rawQty * pack;

    let presentacion = getActivePresentation(card);
    presentacion = pluralizar(presentacion, rawQty);

    const li = document.createElement('li');
    li.innerHTML = `
      <span>${rawQty} ${presentacion} ${nombre} (${totalBotellas} botellas)</span>
      <button class="btn-remove" onclick="eliminarItem(this)">✕</button>
    `;
    lista.appendChild(li);
  });
}

/* ═══════════════════════════════════════════════════════
   ELIMINAR ITEM
══════════════════════════════════════════════════════════════ */
function eliminarItem(btn) {
  const li = btn.closest('li');
  const texto = li.querySelector('span').textContent;

  document.querySelectorAll('.wine-card').forEach(card => {
    const nombre = card.dataset.nombre;
    if (texto.includes(nombre)) {
      const qty = card.querySelector('.qty-val');
      if (qty) qty.value = 0;
      card.querySelectorAll('.pres-btn').forEach(b => b.classList.remove('active'));
    }
  });

  li.remove();
  generarPedido();
}

/* ═══════════════════════════════════════════════════════
   WHATSAPP
══════════════════════════════════════════════════════════════ */
function enviarPedido() {
  const nombre = document.getElementById('nombre')?.value.trim();
  const telefono = document.getElementById('telefono')?.value.trim();
  const ciudad = document.getElementById('ciudad')?.value.trim();
  const direccion = document.getElementById('direccion')?.value.trim();
  const mensaje = document.getElementById('mensaje')?.value.trim();

  if (!nombre || !telefono || !ciudad || !direccion) {
    alert('Completa todos los datos');
    return;
  }

  generarPedido();

  const items = document.querySelectorAll('#listaPedido li');
  if (items.length === 0) {
    alert('Agrega productos');
    return;
  }

  let detalle = '';
  items.forEach(i => {
  detalle += `• ${i.querySelector('span').textContent}\n`;
});

  const texto = `Pedido 🍷
Nombre: ${nombre}
Teléfono: ${telefono}
Ciudad: ${ciudad}
Dirección: ${direccion}

${detalle}

${mensaje || ''}`;

  const url = `https://wa.me/573134131758?text=${encodeURIComponent(texto)}`;
  window.open(url, '_blank');
}

/* ═══════════════════════════════════════════════════════
   INIT (FIX INPUT MANUAL)
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Limpiar estado inicial
  document.querySelectorAll('.wine-card').forEach(card => {
    card.querySelectorAll('.pres-btn').forEach(b => b.classList.remove('active'));
    const qty = card.querySelector('.qty-val');
    if (qty) qty.value = 0;
  });

  // Input manual
  document.querySelectorAll('.qty-val').forEach(inp => {
    inp.addEventListener('input', () => {
      if (inp.value < 0) inp.value = 0;

      const card = inp.closest('.wine-card');

      // Si ponen 0 manual → quitar presentación
      if (parseInt(inp.value || '0', 10) === 0) {
        card.querySelectorAll('.pres-btn').forEach(b => b.classList.remove('active'));
      }

      generarPedido(); // 🔥 sync UI
    });
  });

  const btnEnviar = document.getElementById('btnEnviarPedido');
  if (btnEnviar) btnEnviar.addEventListener('click', enviarPedido);
});