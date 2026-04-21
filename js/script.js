
    /* ── NAV scroll ── */
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    });

    /* ── Hamburger móvil ── */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    function closeMobile() {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    }

    /* ── Reveal on scroll ── */
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(el => observer.observe(el));

    /* ── Selector de presentación en cada card ── */
    function selecPres(btn) {
      const grupo = btn.closest('.wine-presentacion');
      grupo.querySelectorAll('.pres-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }

    /* ── Contador +/- en cada card ── */
    function cambiarQty(btn, delta) {
      const input = btn.closest('.qty-control').querySelector('.qty-val');
      const nuevo = Math.max(1, parseInt(input.value || 1) + delta);
      input.value = nuevo;
    }

    /* ── Al hacer clic en "Pedir →" desde una card ── */
    function seleccionarDesdeCard(btnPedir, nombreVino) {
      const card = btnPedir.closest('.wine-card');

      // Presentación activa
      const presActiva = card.querySelector('.pres-btn.active');
      const presLabel  = presActiva ? presActiva.querySelector('.pres-label').textContent : 'Botella';
      const presUnidad = presActiva ? presActiva.querySelector('.pres-unidades').textContent : '1 unidad';

      // Cantidad
      const qty = card.querySelector('.qty-val').value || '1';

      // Llenar formulario
      setTimeout(() => {
        // Vino
        const sel = document.getElementById('vino');
        for (let i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === nombreVino) { sel.selectedIndex = i; break; }
        }
        // Presentación
        const selPres = document.getElementById('presentacion');
        const textosPres = {
          'Botella':    'Botella suelta (1 unidad)',
          'Media caja': 'Media caja (6 botellas)',
          'Caja':       'Caja (12 botellas)',
        };
        const target = textosPres[presLabel] || 'Botella suelta (1 unidad)';
        for (let i = 0; i < selPres.options.length; i++) {
          if (selPres.options[i].value === target) { selPres.selectedIndex = i; break; }
        }
        // Cantidad
        document.getElementById('cantidad').value = qty;
      }, 350);
    }

    /* ── Enviar pedido por WhatsApp ── */
    function enviarPedido() {
      const nombre       = document.getElementById('nombre').value.trim();
      const telefono     = document.getElementById('telefono').value.trim();
      const ciudad       = document.getElementById('ciudad').value.trim();
      const vino         = document.getElementById('vino').value;
      const presentacion = document.getElementById('presentacion').value;
      const cantidad     = document.getElementById('cantidad').value;
      const mensaje      = document.getElementById('mensaje').value.trim();

      if (!nombre || !telefono || !ciudad || !vino) {
        alert('Por favor completa los campos obligatorios: nombre, teléfono, ciudad y vino.');
        return;
      }

      const texto = `¡Hola! Quiero hacer un pedido 🍷

*Nombre:* ${nombre}
*Teléfono:* ${telefono}
*Ciudad:* ${ciudad}
*Vino:* ${vino}
*Presentación:* ${presentacion}
*Cantidad:* ${cantidad}${mensaje ? `\n*Notas:* ${mensaje}` : ''}

_Enviado desde vinosdelamontana.com_`;

      // 👉 CAMBIA este número por el tuyo (sin + ni espacios)
      const numero = '573000000000';
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
      window.open(url, '_blank');
    }
