// =====================================================
// NAVEGACIÓN
// =====================================================

const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }
});


// =====================================================
// MENÚ MÓVIL
// =====================================================

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


// =====================================================
// ANIMACIONES AL HACER SCROLL
// =====================================================

const reveals = document.querySelectorAll('.reveal');

if (reveals.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);

        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  reveals.forEach(el => observer.observe(el));
}


// =====================================================
// CONFIGURACIÓN DE PRECIOS
// =====================================================

// Precio de una botella individual
const PRECIO_BOTELLA = 30000;

// Precio especial de una caja de 12 botellas
const PRECIO_CAJA = 300000;

// Cantidad de botellas por caja
const BOTELLAS_POR_CAJA = 12;


// =====================================================
// OBTENER TAMAÑO DE LA PRESENTACIÓN
// =====================================================

function getPackSizeFromCard(card) {

  const presActiva = card?.querySelector('.pres-btn.active');

  if (!presActiva) {
    return 1;
  }

  const label = presActiva
    .querySelector('.pres-label')
    ?.textContent
    ?.toLowerCase() || '';

  if (label.includes('media')) {
    return 6;
  }

  if (label.includes('caja')) {
    return BOTELLAS_POR_CAJA;
  }

  return 1;
}


// =====================================================
// OBTENER NOMBRE DE LA PRESENTACIÓN
// =====================================================

function getActivePresentation(card) {

  const presActiva = card?.querySelector('.pres-btn.active');

  if (!presActiva) {
    return 'botella';
  }

  return presActiva
    .querySelector('.pres-label')
    ?.textContent
    ?.trim() || 'botella';
}


// =====================================================
// PLURALIZAR
// =====================================================

function pluralizar(text, cantidad) {

  if (cantidad <= 1) {
    return text;
  }

  if (text.toLowerCase() === 'botella') {
    return 'botellas';
  }

  const parts = text.split(' ');
  const last = parts.pop();

  parts.push(
    last.endsWith('s') ? last : last + 's'
  );

  return parts.join(' ');
}


// =====================================================
// FORMATEAR PRECIOS
// =====================================================

function formatearPrecio(valor) {

  return valor.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}


// =====================================================
// OBTENER PRECIO SEGÚN PRESENTACIÓN
// =====================================================

function getPrecioPresentacion(card) {

  const presentacion =
    getActivePresentation(card).toLowerCase();


  // Caja de 12 botellas
  if (presentacion.includes('caja')) {
    return PRECIO_CAJA;
  }


  // Botella individual
  if (presentacion.includes('botella')) {
    return PRECIO_BOTELLA;
  }


  // Media caja todavía no tiene precio
  if (presentacion.includes('media')) {
    return 0;
  }


  return PRECIO_BOTELLA;
}


// =====================================================
// SELECCIONAR PRESENTACIÓN
// =====================================================

function selecPres(btn) {

  const card = btn.closest('.wine-card');

  if (!card) {
    return;
  }

  const qtyInput = card.querySelector('.qty-val');

  if (!qtyInput) {
    return;
  }


  // Si se vuelve a seleccionar la misma presentación,
  // se desactiva.
  if (btn.classList.contains('active')) {

    card
      .querySelectorAll('.pres-btn')
      .forEach(b => {
        b.classList.remove('active');
      });

    qtyInput.value = 0;

  } else {

    // Quitar selección anterior
    card
      .querySelectorAll('.pres-btn')
      .forEach(b => {
        b.classList.remove('active');
      });


    // Activar nueva presentación
    btn.classList.add('active');


    // Comenzar con una unidad
    if (parseInt(qtyInput.value || '0', 10) === 0) {
      qtyInput.value = 1;
    }
  }


  generarPedido();
}


// =====================================================
// CAMBIAR CANTIDAD
// =====================================================

function cambiarQty(btn, delta) {

  const card = btn.closest('.wine-card');

  if (!card) {
    return;
  }

  const input = card.querySelector('.qty-val');

  if (!input) {
    return;
  }


  let valor =
    parseInt(input.value || '0', 10);


  valor =
    Math.max(0, valor + delta);


  input.value = valor;


  // Si llega a cero, quitar presentación
  if (valor === 0) {

    card
      .querySelectorAll('.pres-btn')
      .forEach(b => {
        b.classList.remove('active');
      });
  }


  generarPedido();
}


// =====================================================
// GENERAR PEDIDO
// =====================================================

function generarPedido() {

  const cards =
    document.querySelectorAll('.wine-card');

  const lista =
    document.getElementById('listaPedido');


  if (!lista) {
    return;
  }


  // Limpiar pedido anterior
  lista.innerHTML = '';


  let totalPedido = 0;
  let cantidadProductos = 0;


  cards.forEach(card => {

    const nombre =
      card.dataset.nombre;


    const qtyInput =
      card.querySelector('.qty-val');


    let rawQty =
      parseInt(
        qtyInput?.value || '0',
        10
      );


    const presActiva =
      card.querySelector('.pres-btn.active');


    // No agregar productos sin selección
    if (!presActiva && rawQty <= 0) {
      return;
    }


    // Si hay presentación pero cantidad es 0,
    // utilizar 1.
    if (presActiva && rawQty === 0) {
      rawQty = 1;
    }


    const pack =
      getPackSizeFromCard(card);


    const totalBotellas =
      rawQty * pack;


    let presentacion =
      getActivePresentation(card);


    presentacion =
      pluralizar(
        presentacion,
        rawQty
      );


    // Precio de una presentación
    const precioPresentacion =
      getPrecioPresentacion(card);


    // Subtotal
    const subtotal =
      rawQty * precioPresentacion;


    totalPedido += subtotal;
    cantidadProductos++;


    // =================================================
    // NOMBRE VISIBLE DEL PRODUCTO
    // =================================================

    // El HTML mantiene "Cafe" internamente,
    // pero mostramos "Café" al cliente.
    const nombreVisible =
      nombre === 'Cafe'
        ? 'Café'
        : nombre;


    // =================================================
    // CREAR PRODUCTO
    // =================================================

    const li =
      document.createElement('li');


    // Guardar el nombre interno del producto
    // para que eliminarItem() sepa exactamente
    // qué tarjeta debe eliminar.
    li.dataset.nombre = nombre;


    li.innerHTML = `
      <div class="pedido-info">

        <span>
          ${rawQty} ${presentacion} ${nombreVisible}
          (${totalBotellas} ${pluralizar('botella', totalBotellas)})
        </span>

        <strong>
          ${formatearPrecio(subtotal)}
        </strong>

      </div>

      <button
        class="btn-remove"
        onclick="eliminarItem(this)"
        aria-label="Eliminar producto"
        type="button"
      >
        ✕
      </button>
    `;


    lista.appendChild(li);
  });


  // ===================================================
  // PEDIDO VACÍO
  // ===================================================

  if (cantidadProductos === 0) {

    const liVacio =
      document.createElement('li');


    liVacio.className =
      'pedido-vacio';


    liVacio.textContent =
      'Agrega vinos desde el catálogo ↑';


    lista.appendChild(liVacio);


    // Eliminar total si existe
    const totalExistente =
      document.getElementById('resumenTotal');


    if (totalExistente) {
      totalExistente.remove();
    }


    return;
  }


  // ===================================================
  // MOSTRAR TOTAL
  // ===================================================

  let totalExistente =
    document.getElementById('resumenTotal');


  if (!totalExistente) {

    totalExistente =
      document.createElement('div');


    totalExistente.id =
      'resumenTotal';


    totalExistente.className =
      'resumen-total';


    lista.parentElement.appendChild(
      totalExistente
    );
  }


  totalExistente.innerHTML = `
    <span>Total del pedido</span>
    <strong>
      ${formatearPrecio(totalPedido)}
    </strong>
  `;
}


// =====================================================
// ELIMINAR PRODUCTO
// =====================================================

function eliminarItem(btn) {

  const li =
    btn.closest('li');


  if (!li) {
    return;
  }


  // Obtener el nombre interno guardado
  // directamente en el elemento del pedido.
  const nombre =
    li.dataset.nombre;


  if (!nombre) {
    return;
  }


  // Buscar exactamente la tarjeta correspondiente.
  const card =
    document.querySelector(
      `.wine-card[data-nombre="${nombre}"]`
    );


  if (!card) {
    return;
  }


  // Poner la cantidad en cero.
  const qty =
    card.querySelector('.qty-val');


  if (qty) {
    qty.value = 0;
  }


  // Quitar la presentación seleccionada.
  card
    .querySelectorAll('.pres-btn')
    .forEach(b => {
      b.classList.remove('active');
    });


  // Regenerar el resumen completo.
  generarPedido();
}


// =====================================================
// ENVIAR PEDIDO POR WHATSAPP
// =====================================================

function enviarPedido() {

  const nombre =
    document
      .getElementById('nombre')
      ?.value
      .trim();


  const telefono =
    document
      .getElementById('telefono')
      ?.value
      .trim();


  const ciudad =
    document
      .getElementById('ciudad')
      ?.value
      .trim();


  const direccion =
    document
      .getElementById('direccion')
      ?.value
      .trim();


  const mensaje =
    document
      .getElementById('mensaje')
      ?.value
      .trim();


  // ===================================================
  // VALIDAR DATOS
  // ===================================================

  if (
    !nombre ||
    !telefono ||
    !ciudad ||
    !direccion
  ) {

    alert(
      'Completa todos los datos'
    );

    return;
  }


  // Actualizar pedido
  generarPedido();


  // ===================================================
  // OBTENER PRODUCTOS
  // ===================================================

  const items =
    document.querySelectorAll(
      '#listaPedido li:not(.pedido-vacio)'
    );


  if (items.length === 0) {

    alert(
      'Agrega productos'
    );

    return;
  }


  // ===================================================
  // CREAR DETALLE
  // ===================================================

  let detalle = '';


  items.forEach(item => {

    const info =
      item.querySelector('.pedido-info');


    if (!info) {
      return;
    }


    const span =
      info.querySelector('span');


    const precio =
      info.querySelector('strong');


    const producto =
      span
        ? span.textContent
            .trim()
            .replace(/\s+/g, ' ')
        : '';


    const valor =
      precio
        ? precio.textContent.trim()
        : '';


    detalle +=
      `• ${producto} — ${valor}\n`;
  });


  detalle =
    detalle.trim();


  // ===================================================
  // OBTENER TOTAL
  // ===================================================

  const totalElemento =
    document.querySelector(
      '#resumenTotal strong'
    );


  const total =
    totalElemento
      ? totalElemento.textContent.trim()
      : '$0';


  // ===================================================
  // MENSAJE PARA WHATSAPP
  // ===================================================

  const texto =
`Pedido - Vinos de la Montaña

Cliente: ${nombre}
Teléfono: ${telefono}
Ciudad: ${ciudad}
Dirección: ${direccion}

Productos:
${detalle}

TOTAL: ${total}${mensaje ? `

Descripción:
${mensaje}` : ''}`;


  // ===================================================
  // WHATSAPP
  // ===================================================

  const numeroWhatsApp =
    '573507840468';


  const url =
    `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;


  window.open(
    url,
    '_blank'
  );
}


// =====================================================
// INICIALIZACIÓN
// =====================================================

document.addEventListener(
  'DOMContentLoaded',
  () => {


    // -----------------------------------------------
    // Reiniciar tarjetas
    // -----------------------------------------------

    document
      .querySelectorAll('.wine-card')
      .forEach(card => {

        card
          .querySelectorAll('.pres-btn')
          .forEach(b => {
            b.classList.remove('active');
          });


        const qty =
          card.querySelector('.qty-val');


        if (qty) {
          qty.value = 0;
        }
      });


    // -----------------------------------------------
    // Cambios manuales de cantidad
    // -----------------------------------------------

    document
      .querySelectorAll('.qty-val')
      .forEach(inp => {

        inp.addEventListener(
          'input',
          () => {

            // Evitar números negativos
            if (inp.value < 0) {
              inp.value = 0;
            }


            const card =
              inp.closest('.wine-card');


            // Si llega a cero,
            // quitar presentación
            if (
              parseInt(
                inp.value || '0',
                10
              ) === 0
            ) {

              card
                ?.querySelectorAll('.pres-btn')
                .forEach(b => {
                  b.classList.remove('active');
                });
            }


            generarPedido();
          }
        );
      });


    // -----------------------------------------------
    // Botón enviar pedido
    // -----------------------------------------------

    const btnEnviar =
      document.getElementById(
        'btnEnviarPedido'
      );


    if (btnEnviar) {

      btnEnviar.addEventListener(
        'click',
        enviarPedido
      );
    }


    // -----------------------------------------------
    // Estado inicial
    // -----------------------------------------------

    generarPedido();

  }
);