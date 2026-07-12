/* =========================================================
   CONECTA PAZ — app.js
   Navegación por pestañas (patrón ARIA tabs) sin dependencias.
   Se ampliará en próximos commits con la lógica de cada
   sección (tarjetas, ruta de denuncia, quiz, FAQ, modal de ayuda).
   ========================================================= */

(function () {
  'use strict';

  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  /**
   * Activa una pestaña y su panel correspondiente.
   * @param {HTMLElement} tab - Botón de pestaña a activar.
   * @param {Object} options
   * @param {boolean} options.focusTab - Si se debe mover el foco a la pestaña.
   */
  function activateTab(tab, { focusTab = true } = {}) {
    if (!tab) return;
    const targetId = tab.getAttribute('data-tab');

    tabs.forEach((t) => {
      const isSelected = t === tab;
      t.setAttribute('aria-selected', String(isSelected));
      t.tabIndex = isSelected ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isTarget = panel.getAttribute('data-section') === targetId;

      if (isTarget) {
        panel.hidden = false;
        // requestAnimationFrame asegura que la transición CSS se dispare
        // después de quitar "hidden".
        requestAnimationFrame(() => panel.classList.add('panel--visible'));
      } else {
        panel.classList.remove('panel--visible');
        panel.hidden = true;
      }
    });

    if (focusTab) tab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab, { focusTab: false }));

    tab.addEventListener('keydown', (event) => {
      let newIndex = null;

      switch (event.key) {
        case 'ArrowRight':
          newIndex = (index + 1) % tabs.length;
          break;
        case 'ArrowLeft':
          newIndex = (index - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          newIndex = 0;
          break;
        case 'End':
          newIndex = tabs.length - 1;
          break;
        default:
          return; // No interceptar otras teclas
      }

      event.preventDefault();
      activateTab(tabs[newIndex]);
    });
  });

  /* ----- Botones de navegación rápida (data-goto) -----
     Los botones del hero y de cualquier otra sección pueden
     usar data-goto="nombre_seccion" para navegar por pestañas.  */
  document.addEventListener('click', function (event) {
    const gotoBtn = event.target.closest('[data-goto]');
    if (!gotoBtn) return;

    const targetSection = gotoBtn.getAttribute('data-goto');
    const targetTab = tabs.find(
      (t) => t.getAttribute('data-tab') === targetSection
    );
    if (targetTab) {
      activateTab(targetTab, { focusTab: false });
      // Lleva la vista al encabezado para que se vea la pestaña activa
      document.querySelector('.site-header').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });

  /* ----- Flip Cards — Tipos de violencia -----
     Voltea la tarjeta al hacer clic o presionar Enter/Space.
     Vuelve a su estado original al hacer clic en otra parte. */
  const flipCards = Array.from(document.querySelectorAll('.flip-card'));

  function toggleFlip(card) {
    // Si ya estaba volteada, la desvoltea; si no, cierra las demás y voltea esta
    const isFlipped = card.classList.contains('flip-card--flipped');
    flipCards.forEach((c) => c.classList.remove('flip-card--flipped'));
    if (!isFlipped) {
      card.classList.add('flip-card--flipped');
    }
  }

  flipCards.forEach(function (card) {
    card.addEventListener('click', function () {
      toggleFlip(card);
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFlip(card);
      }
    });
  });

  // Cerrar tarjetas volteadas al hacer clic fuera de ellas
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.flip-card')) {
      flipCards.forEach((c) => c.classList.remove('flip-card--flipped'));
    }
  });

  /* ----- Ruta de denuncia — pasos expandibles -----
     Cada paso se expande/colapsa al hacer clic en su botón toggle
     o al presionar Enter/Space sobre el paso completo. */
  const rutaPasos = Array.from(document.querySelectorAll('.ruta__paso'));

  function togglePaso(paso) {
    const toggle = paso.querySelector('.ruta__paso-toggle');
    const detail = paso.querySelector('.ruta__paso-detail');
    if (!toggle || !detail) return;

    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    // Colapsar todos los demás
    rutaPasos.forEach(function (p) {
      const t = p.querySelector('.ruta__paso-toggle');
      const d = p.querySelector('.ruta__paso-detail');
      if (t && d && p !== paso) {
        t.setAttribute('aria-expanded', 'false');
        d.hidden = true;
      }
    });

    // Alternar el seleccionado
    toggle.setAttribute('aria-expanded', String(!isExpanded));
    detail.hidden = isExpanded;
  }

  rutaPasos.forEach(function (paso) {
    const toggle = paso.querySelector('.ruta__paso-toggle');

    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePaso(paso);
      });
    }

    paso.addEventListener('click', function () {
      togglePaso(paso);
    });

    paso.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePaso(paso);
      }
    });
  });

  /* ----- Casos simulados — expandir/colapsar -----
     Funciona igual que los pasos de la ruta: clic o Enter/Space
     expande el caso; solo uno expandido a la vez. */
  const casos = Array.from(document.querySelectorAll('.caso'));

  function toggleCaso(caso) {
    const toggle = caso.querySelector('.caso__toggle');
    const body = caso.querySelector('.caso__body');
    if (!toggle || !body) return;

    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

    // Colapsar los demás
    casos.forEach(function (c) {
      const t = c.querySelector('.caso__toggle');
      const b = c.querySelector('.caso__body');
      if (t && b && c !== caso) {
        t.setAttribute('aria-expanded', 'false');
        b.hidden = true;
      }
    });

    toggle.setAttribute('aria-expanded', String(!isExpanded));
    body.hidden = isExpanded;
  }

  casos.forEach(function (caso) {
    const toggle = caso.querySelector('.caso__toggle');

    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleCaso(caso);
      });
    }

    caso.querySelector('.caso__header').addEventListener('click', function () {
      toggleCaso(caso);
    });

    caso.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCaso(caso);
      }
    });
  });

  /* ----- Quiz interactivo -----
     5 preguntas de opción múltiple. Al elegir una opción se muestra
     feedback inmediato. Cuando se responden las 5, se muestra el
     puntaje final y un mensaje de reflexión. Sin datos recopilados. */

  var quizPreguntas = Array.from(document.querySelectorAll('.quiz__pregunta'));
  var quizRespondidas = 0;
  var quizCorrectas = 0;

  var feedbackTextos = {
    '1-correcta': '¡Correcto! La violencia verbal es el uso repetido de palabras para humillar, insultar o amenazar.',
    '1-incorrecta': 'No es esa. La violencia verbal se refiere al uso de palabras para humillar, insultar o amenazar de forma repetida.',
    '2-correcta': '¡Correcto! El primer paso siempre es comunicar la situación en casa y con un docente de confianza.',
    '2-incorrecta': 'No es esa. El primer paso recomendado es comunicar la situación en casa y con un docente de confianza, no saltar a instancias externas.',
    '3-correcta': '¡Correcto! Solo se avanza al siguiente paso cuando el anterior no brindó una solución.',
    '3-incorrecta': 'No es esa. La ruta es escalonada: solo se avanza cuando el paso anterior no brindó una solución.',
    '4-correcta': '¡Correcto! Escuchar sin juzgar y acompañar a la persona es la mejor forma de apoyarla.',
    '4-incorrecta': 'No es esa. Lo mejor es escuchar sin juzgar y acompañar a la persona a hablar con un adulto de confianza.',
    '5-correcta': '¡Correcto! El silencio frente a la violencia la sostiene; hablar puede romper ese ciclo.',
    '5-incorrecta': 'No es esa. El silencio frente a la violencia la sostiene, y hablar o actuar puede romper ese ciclo.'
  };

  var mensajesFinales = [
    { min: 0, max: 2, texto: 'Puede mejorar. Le invitamos a repasar las secciones del sitio para reforzar lo aprendido.' },
    { min: 3, max: 4, texto: '¡Buen trabajo! Tiene una buena base. Repase los puntos que falló para completar su conocimiento.' },
    { min: 5, max: 5, texto: '¡Excelente! Demuestra un gran conocimiento sobre prevención de la violencia. ¡Siga siendo parte del cambio!' }
  ];

  function verificarQuizCompleto() {
    if (quizRespondidas < quizPreguntas.length) return;

    var resultado = document.getElementById('quiz-resultado');
    var puntaje = resultado.querySelector('.quiz__puntaje');
    var mensaje = resultado.querySelector('.quiz__mensaje');

    puntaje.textContent = quizCorrectas + ' de ' + quizPreguntas.length + ' respuestas correctas';

    var msgFinal = mensajesFinales.find(function (m) {
      return quizCorrectas >= m.min && quizCorrectas <= m.max;
    });
    mensaje.textContent = msgFinal ? msgFinal.texto : '';

    resultado.hidden = false;
    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  quizPreguntas.forEach(function (pregunta) {
    var correcta = pregunta.getAttribute('data-correcta');
    var numPregunta = pregunta.getAttribute('data-quiz');
    var opciones = Array.from(pregunta.querySelectorAll('.quiz__opcion'));
    var feedback = pregunta.querySelector('.quiz__feedback');

    opciones.forEach(function (opcion) {
      opcion.addEventListener('click', function () {
        // Solo permitir una respuesta por pregunta
        if (opciones[0].disabled) return;

        var valor = opcion.getAttribute('data-valor');
        var esCorrecta = valor === correcta;

        // Desactivar todas las opciones
        opciones.forEach(function (o) { o.disabled = true; });

        // Marcar la seleccionada
        if (esCorrecta) {
          opcion.classList.add('quiz__opcion--correcta');
          quizCorrectas++;
        } else {
          opcion.classList.add('quiz__opcion--incorrecta');
          // Resaltar la correcta
          opciones.forEach(function (o) {
            if (o.getAttribute('data-valor') === correcta) {
              o.classList.add('quiz__opcion--correcta');
            }
          });
        }

        // Mostrar feedback
        var key = numPregunta + (esCorrecta ? '-correcta' : '-incorrecta');
        feedback.textContent = feedbackTextos[key] || '';
        feedback.className = 'quiz__feedback ' + (esCorrecta ? 'quiz__feedback--correcta' : 'quiz__feedback--incorrecta');
        feedback.hidden = false;

        quizRespondidas++;
        verificarQuizCompleto();
      });
    });
  });

  // Botón de reiniciar quiz
  var reiniciarBtn = document.getElementById('quiz-reiniciar');
  if (reiniciarBtn) {
    reiniciarBtn.addEventListener('click', function () {
      quizRespondidas = 0;
      quizCorrectas = 0;

      quizPreguntas.forEach(function (pregunta) {
        var opciones = Array.from(pregunta.querySelectorAll('.quiz__opcion'));
        var feedback = pregunta.querySelector('.quiz__feedback');

        opciones.forEach(function (o) {
          o.disabled = false;
          o.classList.remove('quiz__opcion--correcta', 'quiz__opcion--incorrecta');
        });

        feedback.hidden = true;
        feedback.className = 'quiz__feedback';
        feedback.textContent = '';
      });

      document.getElementById('quiz-resultado').hidden = true;
      document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ----- Modal de ayuda -----
     Abre con el botón flotante; cierra con el botón X, clic en
     overlay, o tecla Escape. Trampa de foco mientras está abierto.
     El botón "Ir a la Ruta de denuncia" cierra el modal y navega. */

  var ayudaBtn = document.getElementById('ayuda-btn');
  var modal = document.getElementById('modal-ayuda');
  var modalCerrar = document.getElementById('modal-cerrar');
  var modalIrRuta = document.getElementById('modal-ir-ruta');

  function abrirModal() {
    modal.hidden = false;
    // Forzar reflow para que la transición se aplique
    void modal.offsetHeight;
    modal.classList.add('modal-overlay--visible');
    document.body.style.overflow = 'hidden';
    modalCerrar.focus();
  }

  function cerrarModal() {
    modal.classList.remove('modal-overlay--visible');
    document.body.style.overflow = '';
    // Esperar a que termine la transición para ocultar
    setTimeout(function () {
      modal.hidden = true;
    }, 250);
    ayudaBtn.focus();
  }

  if (ayudaBtn && modal) {
    ayudaBtn.addEventListener('click', abrirModal);

    modalCerrar.addEventListener('click', cerrarModal);

    // Cerrar al hacer clic en el overlay (fuera del modal)
    modal.addEventListener('click', function (e) {
      if (e.target === modal) cerrarModal();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) {
        cerrarModal();
      }
    });

    // Botón "Ir a la Ruta de denuncia" dentro del modal
    if (modalIrRuta) {
      modalIrRuta.addEventListener('click', function () {
        cerrarModal();
        // Pequeño delay para que el modal se cierre antes de navegar
        setTimeout(function () {
          var rutaTab = tabs.find(function (t) {
            return t.getAttribute('data-tab') === 'ruta';
          });
          if (rutaTab) {
            activateTab(rutaTab, { focusTab: false });
            document.querySelector('.site-header').scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 280);
      });
    }

    // Trampa de foco: Tab y Shift+Tab solo dentro del modal
    modal.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;

      var focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // Estado inicial: la pestaña "Inicio" ya está marcada como seleccionada
  // en el HTML; solo falta mostrar su panel con la animación de entrada.
  const initialPanel = document.querySelector('.panel[data-section="inicio"]');
  if (initialPanel) {
    requestAnimationFrame(() => initialPanel.classList.add('panel--visible'));
  }
})();