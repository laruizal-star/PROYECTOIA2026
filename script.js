'use strict';

// Inicializar los iconos de Lucide si el CDN está disponible.
if (window.lucide) window.lucide.createIcons();

const $ = (id) => document.getElementById(id);

const outcomes = [
  {
    title: 'Verde / Inmadura',
    value: 20,
    color: '#34d399',
    advice:
      'Ejemplo: mantener en la planta y observar la evolución del color antes de considerar la cosecha.'
  },
  {
    title: 'Pintona / Maduración Media',
    value: 60,
    color: '#fbbf24',
    advice:
      'Ejemplo: continuar el monitoreo y revisar nuevamente el estado de maduración antes de cosechar.'
  },
  {
    title: 'Óptima / Madura',
    value: 100,
    color: '#fb7185',
    advice:
      'Ejemplo: evaluar la cosecha, verificando también firmeza, sanidad y requisitos del destino comercial.'
  }
];

let imageURL = null;
let timer = null;
let version = 0;
let hasImage = false;

function clearAnalysis() {
  clearTimeout(timer);
  version += 1; // Invalida callbacks de selecciones anteriores.

  $('analysis').setAttribute('aria-busy', 'false');
  $('loading').classList.add('hidden');
  $('result').classList.add('hidden');
  $('idle').classList.remove('hidden');
  $('status').textContent = '';
  $('bar').style.width = '0%';
  $('progress').setAttribute('aria-valuenow', '0');
}

function simulate() {
  if (!hasImage) return;

  clearAnalysis();
  const current = version;

  $('idle').classList.add('hidden');
  $('loading').classList.remove('hidden');
  $('analysis').setAttribute('aria-busy', 'true');
  $('status').textContent =
    'Simulando el análisis. Espera dos segundos.';

  timer = setTimeout(() => {
    if (current !== version) return;

    const outcome =
      outcomes[Math.floor(Math.random() * outcomes.length)];

    $('result-title').textContent =
      `${outcome.title} (${outcome.value}%)`;
    $('result-title').style.color = outcome.color;
    $('percentage').textContent = `${outcome.value}%`;
    $('recommendation').textContent = outcome.advice;
    $('bar').style.backgroundColor = outcome.color;

    $('loading').classList.add('hidden');
    $('result').classList.remove('hidden');
    $('analysis').setAttribute('aria-busy', 'false');
    $('progress').setAttribute(
      'aria-valuenow',
      String(outcome.value)
    );

    // Permite pintar primero la barra vacía para animar su crecimiento.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (current === version) {
        $('bar').style.width = `${outcome.value}%`;
      }
    }));

    $('status').textContent =
      `Resultado simulado: ${outcome.title}, ` +
      `${outcome.value} por ciento. ${outcome.advice}`;
  }, 2000);
}

$('photo').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  clearAnalysis();
  hasImage = false;
  $('error').textContent = '';
  $('preview').classList.add('hidden');
  $('preview').removeAttribute('src');

  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = null;

  const allowed = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ];

  if (
    !allowed.includes(file.type) ||
    file.size > 10 * 1024 * 1024
  ) {
    $('error').textContent =
      'Selecciona una imagen JPG, PNG, WebP o GIF de hasta 10 MB.';
    event.target.value = '';
    return;
  }

  const current = version;
  const image = new Image();

  // La imagen se procesa localmente, sin enviarla a un servidor.
  imageURL = URL.createObjectURL(file);
  const selectedURL = imageURL;

  image.onload = () => {
    if (current !== version) return;

    $('preview').src = selectedURL;
    $('preview').classList.remove('hidden');
    hasImage = true;
    simulate();
  };

  image.onerror = () => {
    if (current !== version) return;

    $('error').textContent =
      'No se pudo abrir la imagen. Prueba con otro archivo.';
    URL.revokeObjectURL(selectedURL);
    imageURL = null;
    $('photo').value = '';
  };

  image.src = selectedURL;
});

$('retry').addEventListener('click', simulate);

$('year').textContent = new Date().getFullYear();

// Enlaces ficticios con respuesta visible.
document.querySelectorAll('[data-placeholder]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    $('footer-note').textContent =
      `${link.textContent}: enlace ficticio para esta demostración.`;
  });
});

window.addEventListener('pagehide', () => {
  clearTimeout(timer);
  if (imageURL) URL.revokeObjectURL(imageURL);
});
