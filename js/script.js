document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Ano automático no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  const closeMenu = () => {
    navMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------- Rolagem suave para links internos ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- Sombra no header ao rolar ---------- */
  const header = document.querySelector('header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);

    const backToTop = document.getElementById('backToTop');
    if (backToTop) backToTop.classList.toggle('is-visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Botão voltar ao topo ---------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Revelar elementos ao rolar ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Select customizado de Serviço (dropdown verde claro) ---------- */
  const servicoSelect = document.getElementById('servico');
  const customSelect = document.getElementById('servicoCustom');
  const trigger = document.getElementById('servicoTrigger');
  const triggerValue = trigger ? trigger.querySelector('.custom-select-value') : null;
  const optionsList = document.getElementById('servicoOptions');
  const options = optionsList ? [...optionsList.querySelectorAll('li[role="option"]')] : [];
  let activeIndex = -1;

  const closeCustomSelect = () => {
    if (!customSelect) return;
    customSelect.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  };

  const openCustomSelect = () => {
    if (!customSelect) return;
    customSelect.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    const selected = options.findIndex(li => li.getAttribute('aria-selected') === 'true');
    setActive(selected >= 0 ? selected : 0);
  };

  const setActive = (index) => {
    if (!options.length) return;
    options.forEach(li => li.classList.remove('is-active'));
    activeIndex = (index + options.length) % options.length;
    options[activeIndex].classList.add('is-active');
    options[activeIndex].scrollIntoView({ block: 'nearest' });
  };

  const selectOption = (li) => {
    if (!li || !servicoSelect) return;
    const value = li.dataset.value;
    options.forEach(opt => opt.setAttribute('aria-selected', 'false'));
    li.setAttribute('aria-selected', 'true');
    if (triggerValue) {
      triggerValue.textContent = value;
      triggerValue.removeAttribute('data-empty');
    }
    servicoSelect.value = value;
    servicoSelect.dispatchEvent(new Event('change', { bubbles: true }));
    closeCustomSelect();
    trigger.focus();
  };

  if (customSelect && trigger && optionsList) {
    trigger.addEventListener('click', () => {
      customSelect.classList.contains('is-open') ? closeCustomSelect() : openCustomSelect();
    });

    options.forEach((li, index) => {
      li.addEventListener('mouseenter', () => setActive(index));
      li.addEventListener('click', () => selectOption(li));
    });

    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) e.preventDefault();
      if (!customSelect.classList.contains('is-open') && ['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        openCustomSelect();
        return;
      }
      if (e.key === 'ArrowDown') setActive(activeIndex + 1);
      else if (e.key === 'ArrowUp') setActive(activeIndex - 1);
      else if (e.key === 'Enter' || e.key === ' ') selectOption(options[activeIndex]);
      else if (e.key === 'Escape') closeCustomSelect();
    });

    document.addEventListener('click', (e) => {
      if (!customSelect.contains(e.target)) closeCustomSelect();
    });
  }

  /* sincroniza o dropdown customizado quando o valor do select nativo muda por script */
  const syncCustomFromSelect = () => {
    if (!servicoSelect || !triggerValue) return;
    const value = servicoSelect.value;
    const match = options.find(li => li.dataset.value === value);
    options.forEach(opt => opt.setAttribute('aria-selected', String(opt === match)));
    if (match) {
      triggerValue.textContent = value;
      triggerValue.removeAttribute('data-empty');
    }
  };

  /* ---------- "Agendar este serviço" pré-seleciona o formulário ---------- */
  document.querySelectorAll('.agenda-servico').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.service-card');
      const servico = card ? card.dataset.service : null;
      if (servico && servicoSelect) {
        [...servicoSelect.options].forEach(opt => {
          if (opt.value === servico || opt.textContent.trim() === servico) {
            servicoSelect.value = opt.value || opt.textContent.trim();
          }
        });
        syncCustomFromSelect();
      }
      const agendamento = document.getElementById('agendamento');
      if (agendamento) agendamento.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const nomeInput = document.getElementById('nome');
      if (nomeInput) setTimeout(() => nomeInput.focus(), 500);
    });
  });

  /* ---------- Formulário de agendamento ---------- */
  const form = document.getElementById('appointmentForm');
  const formContainer = document.getElementById('formContainer');
  const formSuccess = document.getElementById('formSuccess');
  const newRequestBtn = document.getElementById('newRequestBtn');
  const dataInput = document.getElementById('data');

  // Impede agendamento em datas passadas
  if (dataInput) {
    const today = new Date().toISOString().split('T')[0];
    dataInput.setAttribute('min', today);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Sem backend conectado: aqui é onde uma integração real
      // (API, e-mail transacional, planilha, CRM) enviaria os dados.
      formContainer.classList.add('is-submitted');
      formSuccess.setAttribute('tabindex', '-1');
      formSuccess.focus();
    });
  }

  if (newRequestBtn) {
    newRequestBtn.addEventListener('click', () => {
      form.reset();
      formContainer.classList.remove('is-submitted');
    });
  }

});
