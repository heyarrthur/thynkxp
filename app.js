// ===== Navbar elevada ao rolar =====
const nav = document.querySelector('.glass-nav');
const elevateOnScroll = () => {
  if (!nav) return;
  const y = window.scrollY || document.documentElement.scrollTop;
  nav.classList.toggle('elevated', y > 8);
};
elevateOnScroll();
window.addEventListener('scroll', elevateOnScroll);

// ===== Dropdown Serviços: clique-only + ativo enquanto aberto (desktop) =====
const dropdownItem = document.querySelector('.dropdown-under');
if (dropdownItem) {
  const trigger = dropdownItem.querySelector('[data-bs-toggle="dropdown"]');
  if (trigger) {
    // garante instância do Bootstrap
    bootstrap.Dropdown.getOrCreateInstance(trigger, { autoClose: true });
    // Mantém "ativo" enquanto aberto
    trigger.addEventListener('show.bs.dropdown', () => trigger.classList.add('active'));
    trigger.addEventListener('hide.bs.dropdown', () => trigger.classList.remove('active'));
    // Evita salto de página no click do "#" (desktop)
    trigger.addEventListener('click', (e) => e.preventDefault());
  }
}

// ===== Efeito "shine" do botão Contato =====
document.querySelectorAll('.btn-contact').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    btn.style.setProperty('--x', `${e.clientX - r.left}px`);
    btn.style.setProperty('--y', `${e.clientY - r.top}px`);
  });
});

// ===== Tilt sutil no banner do hero =====
const banner = document.querySelector('.hero-banner');
const heroImg = document.querySelector('.hero-img');
if (banner && heroImg) {
  banner.addEventListener('mousemove', (e) => {
    const r = banner.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((x / r.width) - 0.5) * 6;
    const ry = ((y / r.height) - 0.5) * -6;
    heroImg.style.setProperty('--tiltX', `${rx}deg`);
    heroImg.style.setProperty('--tiltY', `${ry}deg`);
    banner.style.setProperty('--mx', `${(x / r.width) * 100}%`);
    banner.style.setProperty('--my', `${(y / r.height) * 100}%`);
  });
  banner.addEventListener('mouseleave', () => {
    heroImg.style.setProperty('--tiltX', `0deg`);
    heroImg.style.setProperty('--tiltY', `0deg`);
  });
}

// ===== Marcar link ativo por hash =====
const markActiveByHash = () => {
  const { hash } = window.location;
  if (!hash) return;
  document.querySelectorAll('.nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
};
window.addEventListener('hashchange', markActiveByHash);
markActiveByHash();

// ===== Reveal + Contadores =====
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
function animateCounter(el){
  const target = parseInt(el.getAttribute('data-target'), 10) || 0;
  const duration = parseInt(el.getAttribute('data-duration'), 10) || 2000;
  const start = 0;
  const startTime = performance.now();
  function tick(now){
    const p = Math.min((now - startTime) / duration, 1);
    const eased = easeOutCubic(p);
    const value = Math.floor(start + (target - start) * eased);
    el.textContent = value.toLocaleString('pt-BR');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Observer para elementos .reveal (fora de carrosséis)
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting){
      const el = entry.target;
      const delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
      setTimeout(() => el.classList.add('in'), delay);
      // Dispara contadores dentro do elemento revelado
      el.querySelectorAll?.('.counter')?.forEach(animateCounter);
      io.unobserve(el);
    }
  });
}, { threshold: 0.25 });

document.querySelectorAll('.reveal').forEach(el => {
  // Não observar itens que estão dentro dos carrosséis (tratados à parte)
  if (!el.closest('#depoimentosCarousel') && !el.closest('#logosCarousel')) io.observe(el);
});

// ===== Depoimentos — reveal por slide =====
(function(){
  const carousel = document.getElementById('depoimentosCarousel');
  if(!carousel) return;
  const activateVisible = () => {
    carousel.querySelectorAll('.carousel-item .reveal').forEach(el => el.classList.remove('in'));
    const active = carousel.querySelector('.carousel-item.active');
    if(!active) return;
    active.querySelectorAll('.reveal').forEach(el => {
      const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(() => el.classList.add('in'), delay);
    });
  };
  carousel.addEventListener('slid.bs.carousel', activateVisible);
  activateVisible();
})();

// ===== Logos — carrossel 4x auto 8s (pausa no hover) =====
(function(){
  const carousel = document.getElementById('logosCarousel');
  if(!carousel) return;
  const instance = new bootstrap.Carousel(carousel, { interval: 8000, ride: 'carousel' });
  const activateVisible = () => {
    carousel.querySelectorAll('.carousel-item .reveal').forEach(el => el.classList.remove('in'));
    const active = carousel.querySelector('.carousel-item.active');
    if(!active) return;
    active.querySelectorAll('.reveal').forEach(el => {
      const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
      setTimeout(() => el.classList.add('in'), delay);
    });
  };
  carousel.addEventListener('slid.bs.carousel', activateVisible);
  activateVisible();
  carousel.addEventListener('mouseenter', () => instance.pause());
  carousel.addEventListener('mouseleave', () => instance.cycle());
})();

// ===== CONTATO — abre WhatsApp com pré-mensagem =====
(function(){
  const form = document.getElementById('contactForm');
  if(!form) return;

  const feedback = document.getElementById('formFeedback');
  const btn = document.getElementById('btnEnviar');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedback.textContent = '';

    const nome = (form.nome?.value || '').trim();
    const telefone = (form.telefone?.value || '').trim(); // não usado na mensagem; mantém para você tratar se quiser
    const assunto = (form.assunto?.value || '').trim();
    const mensagem = (form.mensagem?.value || '').trim();
    const phoneDest = (form.dataset.whatsapp || '').replace(/\D/g, ''); // DDI+DDD+NÚMERO

    if (!nome || !assunto || !mensagem) {
      feedback.textContent = 'Por favor, preencha Nome, Assunto e Mensagem.';
      feedback.className = 'form-feedback small text-danger';
      return;
    }
    if (!phoneDest) {
      feedback.textContent = 'Configure o número do WhatsApp no atributo data-whatsapp do formulário (DDI+DDD+NÚMERO).';
      feedback.className = 'form-feedback small text-warning';
      return;
    }

    const texto = `olá, tudo bem? Me chamo ${nome}, ${assunto}.\nObservação: ${mensagem}`;
    const url = `https://wa.me/${phoneDest}?text=${encodeURIComponent(texto)}`;

    btn.disabled = true;
    btn.innerText = 'Abrindo WhatsApp...';
    window.open(url, '_blank', 'noopener,noreferrer');

    feedback.textContent = 'Abrindo o WhatsApp com sua mensagem...';
    feedback.className = 'form-feedback small text-success';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = 'Enviar pelo WhatsApp';
      // form.reset(); // descomente se quiser limpar os campos ao enviar
    }, 1200);
  });
})();

// ===== Footer — ano automático =====
(function(){
  const year = document.getElementById('yearCopy');
  if (year) year.textContent = new Date().getFullYear();
})();
