document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('show');
  });
});

const track = document.querySelector('.carousel-track');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');

let index = 0;
const items = document.querySelectorAll('.carousel-item');
const totalItems = items.length;

function updateCarousel() {
  const width = items[0].offsetWidth;
  track.style.transform = `translateX(-${index * width}px)`;
}

nextBtn.addEventListener('click', () => {
  index = (index + 1) % totalItems;
  updateCarousel();
});

prevBtn.addEventListener('click', () => {
  index = (index - 1 + totalItems) % totalItems;
  updateCarousel();
});

window.addEventListener('resize', updateCarousel);


// Rotar automáticamente las tarjetas de promoción destacada
const promos = document.querySelectorAll('.promo-card');
let active = 0;

setInterval(() => {
  promos.forEach((card, index) => {
    card.classList.toggle('highlight', index === active);
  });
  active = (active + 1) % promos.length;
}, 4000);

function cerrarSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = "none"; // Oculta el menú
  }
