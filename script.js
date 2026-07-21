/* ==========================================================================
   DESKIFY — SCRIPT PRINCIPAL DE LÓGICA E INTERATIVIDADE (script.js)
   Organização limpa, comentada e modular em ES6 Module.
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ==========================================================================
   1. INTERATIVIDADE DO SISTEMA E COMPONENTES DE SCROLL
   ========================================================================== */

// Observador de Rolagem (Scroll Reveal): ativa animações suaves ao rolar até as seções
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { 
    root: null,
    rootMargin: '0px 0px -20px 0px',
    threshold: 0.01 
});
revealElements.forEach(el => revealObserver.observe(el));

// Rolagem suave (Smooth Scroll) ao clicar nos links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Menu Mobile (Hamburger & Gaveta de Navegação)
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerIcon = document.getElementById('hamburger-icon');
const closeIcon = document.getElementById('close-icon');

if (mobileMenuBtn && mobileMenu) {
    function toggleMobileMenu(open) {
        const isOpen = open !== undefined ? open : mobileMenu.classList.contains('hidden');
        if (isOpen) {
            mobileMenu.classList.remove('hidden');
            requestAnimationFrame(() => {
                mobileMenu.classList.remove('max-h-0', 'opacity-0');
                mobileMenu.classList.add('max-h-[85vh]', 'opacity-100', 'overflow-y-auto');
            });
            if (hamburgerIcon) hamburgerIcon.classList.add('hidden');
            if (closeIcon) closeIcon.classList.remove('hidden');
        } else {
            mobileMenu.classList.remove('max-h-[85vh]', 'opacity-100', 'overflow-y-auto');
            mobileMenu.classList.add('max-h-0', 'opacity-0');
            if (hamburgerIcon) hamburgerIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
            setTimeout(() => {
                if (mobileMenu.classList.contains('opacity-0')) {
                    mobileMenu.classList.add('hidden');
                }
            }, 300);
        }
    }

    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());

    document.querySelectorAll('.mobile-nav-link, #mobile-menu a').forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            toggleMobileMenu(false);
        }
    });
}

// Animação de Contagem (Counters nas métricas de impacto) com GPU/requestAnimationFrame
const counterElements = document.querySelectorAll('.counter-value');
const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            if (target && !el.dataset.animated) {
                el.dataset.animated = 'true';
                observer.unobserve(el);
                const numSpan = el.querySelector('.counter-num');
                if (!numSpan) return;
                
                const duration = 1500; // 1.5 segundos
                const startTime = performance.now();
                
                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Easing easeOutQuad para transição fluida
                    const easeProgress = 1 - (1 - progress) * (1 - progress);
                    const currentVal = Math.floor(easeProgress * target);
                    
                    numSpan.textContent = currentVal;
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        numSpan.textContent = target;
                    }
                };
                requestAnimationFrame(updateCounter);
            }
        }
    });
}, { threshold: 0.3 });
counterElements.forEach(el => {
    if (el.getAttribute('data-target')) counterObserver.observe(el);
});

// Manipulação do Formulário de Contato no rodapé
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button[type="submit"]');
        const original = btn.innerHTML;
        btn.innerHTML = '✓ Enviado com sucesso!';
        setTimeout(() => { btn.innerHTML = original; contactForm.reset(); }, 3000);
    });
}

// Efeito Spotlight nos Cards (.glass-card) seguindo a posição do mouse
const spotlightCards = document.querySelectorAll('.glass-card');
spotlightCards.forEach(card => {
    let isHovered = false;
    let cardRect = null;
    let rafId = null;
    let mouseX = 0, mouseY = 0;

    card.addEventListener('mouseenter', () => {
        isHovered = true;
        cardRect = card.getBoundingClientRect();
    });

    card.addEventListener('mouseleave', () => {
        isHovered = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
    });

    card.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        if (!cardRect) cardRect = card.getBoundingClientRect();
        mouseX = e.clientX - cardRect.left;
        mouseY = e.clientY - cardRect.top;

        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', `${mouseX}px`);
                card.style.setProperty('--mouse-y', `${mouseY}px`);
                rafId = null;
            });
        }
    });
});

// Lanterna / Efeito Scanlight Interativo na seção de Estatísticas (#estatisticas)
const statsSection = document.getElementById('estatisticas');
const statsLayer = document.getElementById('stats-interactive-layer');
if (statsSection && statsLayer) {
    let statsHovered = false;
    let statsRect = null;
    let targetX = 0, targetY = 0;
    let currentX = -1000, currentY = -1000;
    let lerpRaf = null;

    const updateLerp = () => {
        if (!statsHovered && Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5) {
            lerpRaf = null;
            return;
        }
        
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        statsLayer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        
        if (Math.abs(targetX - currentX) >= 0.5 || Math.abs(targetY - currentY) >= 0.5) {
            lerpRaf = requestAnimationFrame(updateLerp);
        } else {
            currentX = targetX;
            currentY = targetY;
            statsLayer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            lerpRaf = null;
        }
    };

    statsSection.addEventListener('mouseenter', (e) => {
        statsHovered = true;
        statsRect = statsSection.getBoundingClientRect();
        targetX = e.clientX - statsRect.left;
        targetY = e.clientY - statsRect.top;
        if (currentX === -1000) {
            currentX = targetX;
            currentY = targetY;
            statsLayer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        }
        statsLayer.style.opacity = '1';
        if (!lerpRaf) lerpRaf = requestAnimationFrame(updateLerp);
    });

    statsSection.addEventListener('mouseleave', () => {
        statsHovered = false;
        statsLayer.style.opacity = '0';
    });

    statsSection.addEventListener('mousemove', (e) => {
        if (!statsHovered) return;
        if (!statsRect) statsRect = statsSection.getBoundingClientRect();
        targetX = e.clientX - statsRect.left;
        targetY = e.clientY - statsRect.top;
        if (!lerpRaf) lerpRaf = requestAnimationFrame(updateLerp);
    });
    
    window.addEventListener('resize', () => { statsRect = null; }, { passive: true });
    window.addEventListener('scroll', () => { statsRect = null; }, { passive: true });
}

// Carrossel do Sistema e Pré-visualização de Telas (#showcase-carousel)
const slides = document.querySelectorAll('.showcase-slide');
const dots = document.querySelectorAll('.showcase-dot');
const titleEl = document.getElementById('showcase-slide-title');
const prevBtn = document.getElementById('showcase-prev');
const nextBtn = document.getElementById('showcase-next');
const carouselEl = document.getElementById('showcase-carousel');

if (slides.length > 0) {
    let currentSlide = 0;
    let slideInterval = null;

    const updateSlide = (index) => {
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

        currentSlide = (index + slides.length) % slides.length;

        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');

        const title = slides[currentSlide].getAttribute('data-title');
        if (titleEl && title) titleEl.textContent = title;
    };

    const nextSlide = () => updateSlide(currentSlide + 1);
    const prevSlide = () => updateSlide(currentSlide - 1);

    const startAutoPlay = () => {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000);
    };

    const stopAutoPlay = () => {
        if (slideInterval) clearInterval(slideInterval);
    };

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            updateSlide(idx);
            startAutoPlay();
        });
    });

    if (carouselEl) {
        carouselEl.addEventListener('mouseenter', stopAutoPlay);
        carouselEl.addEventListener('mouseleave', startAutoPlay);
    }

    startAutoPlay();
}


/* ==========================================================================
   2. SISTEMA DE TRADUÇÃO MULTI-IDIOMA (PORTUGUÊS <-> INGLÊS)
   ========================================================================== */

const translations = {
    pt: {
        nav_login: 'Login',
        nav_cta: 'Pedir Demonstração',
        nav_plataforma: 'Plataforma',
        nav_impacto: 'Impacto',
        nav_integracoes: 'Integrações',
        nav_infraestrutura: 'Infraestrutura',
        nav_planos: 'Planos',
        nav_testemunhos: 'Testemunhos',
    },
    en: {
        nav_login: 'Login',
        nav_cta: 'Request a Demo',
        nav_plataforma: 'Platform',
        nav_impacto: 'Impact',
        nav_integracoes: 'Integrations',
        nav_infraestrutura: 'Infrastructure',
        nav_planos: 'Plans',
        nav_testemunhos: 'Testimonials',
    }
};

const pageTexts = [
    // HERO
    ['[data-t="hero-badge"]', 'A plataforma definitiva para TI e Operações', 'The definitive platform for IT and Operations'],
    ['[data-t="hero-h1"]', 'O controle total <br>do seu <span class="hero-title-highlight">chamados e ativos. ', 'Total control <br>of your <span class="hero-title-highlight">tickets and assets. '],
    ['[data-t="hero-sub"]', 'Pare de usar planilhas dispersas e sistemas isolados. Abra chamados, rastreie equipamentos e controle os custos operacionais da sua empresa em uma única plataforma inteligente e unificada.', 'Stop using scattered spreadsheets and isolated systems. Open tickets, track equipment and control your company\'s operational costs in a single intelligent, unified platform.'],
    ['[data-t="hero-cta1"]', 'Começar agora', 'Get Started'],
    ['[data-t="hero-cta2"]', 'Explorar recursos', 'Explore features'],
    ['[data-t="hero-stat1"]', 'Maior Controle Operacional', 'Greater Operational Control'],
    ['[data-t="hero-stat2"]', 'Visibilidade de Ativos e Licenças', 'Asset & License Visibility'],
    ['[data-t="hero-stat3"]', 'Planilhas Necessárias', 'Spreadsheets Needed'],
    ['[data-t="hero-stat4"]', 'Aprovação de Despesas no Prazo', 'Expense Approvals on Time'],
    
    // Seção 2 - Plataforma
    ['[data-t="sec2-badge"]', 'Plataforma All-in-One', 'All-in-One Platform'],
    ['[data-t="sec2-h2"]', 'EXPLORE OS <span class="platform-title-highlight">MÓDULOS UNIFICADOS</span>', 'EXPLORE THE <span class="platform-title-highlight">UNIFIED MODULES</span>'],
    ['[data-t="sec2-desc"]', 'A sinergia perfeita entre suporte técnico, rastreamento de equipamentos e controle financeiro.', 'The perfect synergy between technical support, asset tracking and financial control.'],
    ['[data-t="c1-badge"]', 'Core', 'Core'],
    ['[data-t="c1-h3"]', 'Central de Chamados Inteligente', 'Intelligent Help Desk Center'],
    ['[data-t="c1-desc"]', 'Transforme a experiência de suporte com SLAs automáticos, portal self-service intuitivo para o colaborador e roteamento automático via Inteligência Artificial que envia o chamado diretamente ao especialista certo.', 'Transform the support experience with automated SLAs, an intuitive employee self-service portal, and AI-powered ticket routing straight to the right specialist.'],
    ['[data-t="c1-li1"]', 'Roteamento automático de tickets via IA', 'AI-powered automatic ticket routing'],
    ['[data-t="c1-li2"]', 'Portal self-service intuitivo 24/7', '24/7 intuitive self-service portal'],
    ['[data-t="c1-li3"]', 'SLAs automáticos com escalonamento em tempo real', 'Automated SLAs with real-time escalation'],
    ['[data-t="c1-li4"]', 'Histórico omnicanal completo por colaborador', 'Complete omnichannel history per employee'],
    ['[data-t="c1-btn"]', 'Conheça o módulo Core', 'Explore Core module'],
    
    ['[data-t="c2-badge"]', 'Engine', 'Engine'],
    ['[data-t="c2-h3"]', 'Rastreamento de Ativos (ITAM)', 'IT Asset Tracking (ITAM)'],
    ['[data-t="c2-desc"]', 'Saiba exatamente quem usa qual notebook, monitor, smartphone ou licença de software. Controle todo o ciclo de vida com emissão e assinatura digital de termos de responsabilidade.', 'Know exactly who uses which laptop, monitor, smartphone or software license. Manage the full lifecycle with digital liability terms issuance and signing.'],
    ['[data-t="c2-ind-1"]', 'Ativo #MBP-2026-04', 'Asset #MBP-2026-04'],
    ['[data-t="c2-ind-2"]', 'Alocado e Ativo', 'Allocated & Active'],
    ['[data-t="c2-ind-3"]', 'MacBook Pro M3 / Licença Figma Pro', 'MacBook Pro M3 / Figma Pro License'],
    ['[data-t="c2-ind-4"]', 'Engenharia', 'Engineering'],
    ['[data-t="c2-ind-5"]', 'Usuário:', 'User:'],
    ['[data-t="c2-ind-6"]', 'Termo Assinado ✓', 'Term Signed ✓'],
    
    ['[data-t="c3-badge"]', 'Analytics', 'Analytics'],
    ['[data-t="c3-h3"]', 'Gestão de Despesas e Custos', 'Expense & Cost Management'],
    ['[data-t="c3-desc"]', 'Vincule custos operacionais e compras diretamente aos chamados de suporte. Gerencie reembolsos de colaboradores e orçamentos de TI através de fluxos de aprovação multinível ágeis e transparentes.', 'Link operational costs and purchases directly to support tickets. Manage employee reimbursements and IT budgets through agile and transparent multi-level approval workflows.'],
    
    // Seção 3 - Estatísticas de Impacto
    ['[data-t="sec3-badge"]', 'Métricas de Impacto', 'Impact Metrics'],
    ['[data-t="sec3-h2"]', 'RESULTADOS COMPROVADOS NA<br><span class="gradient-text">SUA OPERAÇÃO</span>', 'PROVEN RESULTS IN<br><span class="gradient-text">YOUR OPERATION</span>'],
    ['[data-t="sec3-desc"]', 'O poder de gerenciar chamados, ativos e financeiro na mesma plataforma unificada.', 'The power to manage tickets, assets and financials in the same unified platform.'],
    ['[data-t="stat1-h4"]', 'Chamados & SLA', 'Tickets & SLA'],
    ['[data-t="stat1-desc"]', 'Taxa de resolução de tickets e suporte dentro do prazo SLA', 'Ticket resolution rate and support within SLA timeframe'],
    ['[data-t="stat2-h4"]', 'Ativos & ITAM', 'Assets & ITAM'],
    ['[data-t="stat2-desc"]', 'Visibilidade e rastreio em tempo real de equipamentos e licenças', 'Real-time visibility and tracking of hardware and licenses'],
    ['[data-t="stat3-h4"]', 'Despesas de TI', 'IT Expenses'],
    ['[data-t="stat3-desc"]', 'Aprovação de reembolsos e custos operacionais dentro do prazo', 'Reimbursement and operational cost approvals within deadline'],
    ['[data-t="stat4-h4"]', 'Ecossistema', 'Ecosystem'],
    ['[data-t="stat4-desc"]', 'Conexões nativas com ERPs, financeiro e ferramentas de TI', 'Native connections with ERPs, financials and IT tools'],
    ['[data-t="stat5-h4"]', 'Satisfação Geral', 'Overall Satisfaction'],
    ['[data-t="stat5-desc"]', 'Índice de aprovação dos colaboradores em suporte e reembolsos', 'Employee approval index for support and reimbursements'],

    // Seção 4 - Integrações
    ['[data-t="sec4-badge"]', 'Integrações', 'Integrations'],
    ['[data-t="sec4-h2"]', 'INTEGRAÇÕES INTELIGENTES.<br>SIMPLIFIQUE O SEU <span class="gradient-text-teal">WORKFLOW</span>', 'INTELLIGENT INTEGRATIONS.<br>SIMPLIFY YOUR <span class="gradient-text-teal">WORKFLOW</span>'],
    ['[data-t="sec4-desc"]', 'Conecte o Deskify ao seu ERP, sistemas contábeis, WhatsApp, Slack e muito mais.', 'Connect Deskify to your ERP, accounting systems, WhatsApp, Slack and much more.'],

    // Seção 4.5 - Showcase
    ['[data-t="showcase-badge"]', 'Interface do Sistema', 'System Interface'],
    ['[data-t="showcase-h2"]', 'EXPERIÊNCIA <span class="gradient-text">VISUAL PREMIUM</span>', 'PREMIUM <span class="gradient-text">VISUAL EXPERIENCE</span>'],
    ['[data-t="showcase-desc"]', 'Conheça a nossa interface intuitiva e poderosa em ação. Troque de tela automaticamente a cada 3 segundos ou explore manualmente.', 'Discover our intuitive and powerful interface in action. Automatically switch screens every 3 seconds or explore manually.'],
    ['[data-t="showcase-slide-1"]', 'Dashboard Unificado: Visão Geral de Chamados e Custos', 'Unified Dashboard: Tickets & Costs Overview'],

    // Seção 4.8 - Infraestrutura
    ['[data-t="infra-badge"]', 'Infraestrutura Global', 'Global Infrastructure'],
    ['[data-t="infra-h2"]', 'Global por <br><span class="infra-title-light">padrão.</span>', 'Global by <br><span class="infra-title-light">default.</span>'],
    ['[data-t="infra-desc"]', 'Seus agentes, chamados e inventário rodam em infraestrutura distribuída por 29 regiões globais. Latência inferior a 50ms com altíssima disponibilidade.', 'Your agents, tickets and inventory run on distributed infrastructure across 29 global regions. Latency under 50ms with extremely high availability.'],
    ['[data-t="infra-c1-badge"]', 'Rede Edge Distribuída', 'Distributed Edge Network'],
    ['[data-t="infra-c1-title"]', '29 Regiões Globais', '29 Global Regions'],
    ['[data-t="infra-c1-desc"]', 'Roteamento inteligente de chamados e replicação de dados em tempo real em servidores dedicados nas Américas, Europa e Ásia.', 'Intelligent ticket routing and real-time data replication on dedicated servers in the Americas, Europe and Asia.'],
    ['[data-t="infra-c2-badge"]', 'Confiabilidade Enterprise', 'Enterprise Reliability'],
    ['[data-t="infra-c2-title"]', '99.99% Uptime SLA', '99.99% Uptime SLA'],
    ['[data-t="infra-c2-s1"]', 'Latência Média', 'Average Latency'],
    ['[data-t="infra-c2-s2-val"]', 'Zero', 'Zero'],
    ['[data-t="infra-c2-s2"]', 'Perda de Dados', 'Data Loss'],
    ['[data-t="infra-c2-desc"]', 'Arquitetura redundante com failover automático e conformidade SOC2 e LGPD.', 'Redundant architecture with automatic failover and SOC2 & LGPD/GDPR compliance.'],
    ['[data-t="infra-op-1"]', 'OPERACIONAL', 'OPERATIONAL'],
    ['[data-t="infra-op-2"]', 'OPERACIONAL', 'OPERATIONAL'],
    ['[data-t="infra-op-3"]', 'OPERACIONAL', 'OPERATIONAL'],
    ['[data-t="infra-op-4"]', 'OPERACIONAL', 'OPERATIONAL'],
    ['[data-t="infra-r1-title"]', 'América do Norte', 'North America'],
    ['[data-t="infra-r1-desc"]', '12 nós ativos', '12 active nodes'],
    ['[data-t="infra-r2-title"]', 'Europa', 'Europe'],
    ['[data-t="infra-r2-desc"]', '8 nós ativos', '8 active nodes'],
    ['[data-t="infra-r3-title"]', 'Ásia-Pacífico', 'Asia-Pacific'],
    ['[data-t="infra-r3-desc"]', '6 nós ativos', '6 active nodes'],
    ['[data-t="infra-r4-title"]', 'América do Sul', 'South America'],
    ['[data-t="infra-r4-desc"]', '3 nós ativos', '3 active nodes'],

    // Seção 4.9 - Planos
    ['[data-t="plan-badge"]', 'Planos e Preços', 'Plans & Pricing'],
    ['[data-t="plan-h2"]', '<span class="planos-title-block">Pague por</span><span class="planos-title-highlight">resultados.</span>', '<span class="planos-title-block">Pay for</span><span class="planos-title-highlight">results.</span>'],
    ['[data-t="plan-desc"]', 'Escolha o plano ideal para a sua operação de TI e suporte. Sem taxas ocultas, cancele ou mude de plano quando quiser.', 'Choose the ideal plan for your IT and support operation. No hidden fees, cancel or change plans anytime.'],
    ['[data-t="p1-title"]', 'Starter', 'Starter'],
    ['[data-t="p1-desc"]', 'Para pequenas equipes de TI iniciando a organização de suporte e inventário', 'For small IT teams starting to organize support and inventory'],
    ['[data-t="p1-per"]', '/ mês', '/ month'],
    ['[data-t="p1-li1"]', 'Até <strong>3 agentes de suporte</strong>', 'Up to <strong>3 support agents</strong>'],
    ['[data-t="p1-li2"]', 'Gestão de até <strong>150 ativos e licenças</strong>', 'Management of up to <strong>150 assets & licenses</strong>'],
    ['[data-t="p1-li3"]', 'Portal de autoatendimento (Colaboradores)', 'Self-service portal (Employees)'],
    ['[data-t="p1-li4"]', 'Aprovação de despesas básica (1 nível)', 'Basic expense approval (1 level)'],
    ['[data-t="p1-li5"]', 'Suporte em horário comercial (E-mail)', 'Business hours support (Email)'],
    ['[data-t="p1-btn"]', 'Começar 14 dias grátis', 'Start 14-day free trial'],
    ['[data-t="p2-pop"]', 'MAIS POPULAR', 'MOST POPULAR'],
    ['[data-t="p2-title"]', 'Professional', 'Professional'],
    ['[data-t="p2-desc"]', 'Para empresas em crescimento que precisam de governança, IA e automação total', 'For growing companies needing governance, AI and complete automation'],
    ['[data-t="p2-per"]', '/ mês', '/ month'],
    ['[data-t="p2-bill"]', 'Faturado anualmente ou R$ 1.499 mensal', 'Billed annually or R$ 1,499 monthly'],
    ['[data-t="p2-li1"]', 'Até <strong>15 agentes de suporte</strong>', 'Up to <strong>15 support agents</strong>'],
    ['[data-t="p2-li2"]', 'Gestão de até <strong>1.000 ativos e licenças</strong>', 'Management of up to <strong>1,000 assets & licenses</strong>'],
    ['[data-t="p2-li3"]', '<strong>Roteamento por IA</strong> e automação de SLAs', '<strong>AI routing</strong> & SLA automation'],
    ['[data-t="p2-li4"]', 'Relatórios avançados de custos por ticket', 'Advanced ticket cost reports'],
    ['[data-t="p2-li5"]', 'Integrações privadas (WhatsApp, Slack)', 'Private integrations (WhatsApp, Slack)'],
    ['[data-t="p2-li6"]', 'Suporte prioritário 24/7', 'Priority 24/7 support'],
    ['[data-t="p2-btn"]', 'Começar teste grátis', 'Start free trial'],
    ['[data-t="p3-title"]', 'Escala', 'Enterprise'],
    ['[data-t="p3-desc"]', 'Operações complexas com alta escalabilidade e governança', 'Complex operations with high scalability and governance'],
    ['[data-t="p3-li1"]', 'Agentes, chamados e ativos <strong>ilimitados</strong>', '<strong>Unlimited</strong> agents, tickets and assets'],
    ['[data-t="p3-li2"]', 'Integração com <strong>ERPs (SAP, TOTVS, Oracle)</strong>', 'Integration with <strong>ERPs (SAP, TOTVS, Oracle)</strong>'],
    ['[data-t="p3-li3"]', '<strong>Aprovação multinível</strong> e orçamento avançado', '<strong>Multi-level approval</strong> & advanced budgeting'],
    ['[data-t="p3-li4"]', 'Roteamento e automação de IA customizada', 'Custom AI routing and automation'],
    ['[data-t="p3-li5"]', 'Deploy On-premise ou Nuvem Privada', 'On-premise or Private Cloud deploy'],
    ['[data-t="p3-li6"]', 'Garantia de SLA contratual (99.99%)', 'Contractual SLA guarantee (99.99%)'],
    ['[data-t="p3-li7"]', 'Gerente de conta dedicado VIP 24/7', 'Dedicated 24/7 VIP account manager'],
    ['[data-t="p3-btn"]', 'Falar com vendas', 'Talk to sales'],

    // Seção 5 - Testemunhos
    ['[data-t="test-badge"]', 'Depoimentos Reais', 'Real Testimonials'],
    ['[data-t="test-h2"]', 'O QUE OS NOSSOS <span class="gradient-text">CLIENTES DIZEM</span>', 'WHAT OUR <span class="gradient-text">CLIENTS SAY</span>'],
    ['[data-t="test-q1"]', '"Antes usávamos Trello, e-mails soltos e planilhas intermináveis para gerenciar o suporte. Com o Deskify, centralizamos todos os chamados em uma única plataforma. A produtividade da equipe disparou e acabamos com a desorganização."', '"Before we used Trello, loose emails and endless spreadsheets to manage support. With Deskify, we centralized all tickets on a single platform. Team productivity skyrocketed and we eliminated disorganization."'],
    ['[data-t="test-r1"]', 'Diretor de Operações', 'Operations Director'],
    ['[data-t="test-q2"]', '"O maior diferencial para a nossa TI é a segurança de rastrear todas as licenças de software e equipamentos na mesma tela onde atendemos os chamados. Saber exatamente quem está com qual notebook e licença evitou desperdícios enormes."', '"The biggest game changer for our IT is the safety of tracking all software licenses and equipment on the same screen where we handle tickets. Knowing exactly who has which laptop and license prevented huge waste."'],
    ['[data-t="test-r2"]', 'Coord. de TI', 'IT Coordinator'],
    ['[data-t="test-q3"]', '"Como CFO, ter a gestão de despesas e compras de TI no mesmo ecossistema é um divisor de águas. Agora aprovo reembolsos, compras de mouses, teclados e licenças com total visibilidade do orçamento e vínculo direto aos chamados."', '"As a CFO, having expense and IT purchase management in the same ecosystem is a game changer. Now I approve reimbursements, mice, keyboards and license purchases with full budget visibility directly linked to tickets."'],
    ['[data-t="test-r3"]', 'CFO', 'CFO'],

    // Seção 6 - Rodapé (Contact Footer)
    ['[data-t="foot-h3-1"]', 'Fale Conosco', 'Contact Us'],
    ['[data-t="foot-btn"]', 'ENVIAR MENSAGEM', 'SEND MESSAGE'],
    ['[data-t="foot-h3-2"]', 'Informações de Contato', 'Contact Information'],
    ['[data-t="foot-desc"]', 'Estamos prontos para demonstrar como o Deskify pode transformar a gestão de suporte, ativos e despesas da sua empresa.', 'We are ready to demonstrate how Deskify can transform your company\'s support, asset and expense management.'],
    ['[data-t="foot-copy"]', '© 2026 Deskify. Todos os direitos reservados.', '© 2026 Deskify. All rights reserved.'],
    ['[data-t="foot-top"]', 'Voltar ao topo ↑', 'Back to top ↑']
];

let currentLang = 'pt';

export function toggleLanguage() {
    currentLang = currentLang === 'pt' ? 'en' : 'pt';
    applyLanguage(currentLang);
}

function applyLanguage(lang) {
    const isEn = lang === 'en';
    const flag = isEn ? '🇺🇸' : '🇧🇷';
    const label = isEn ? 'EN' : 'PT';

    const flagEl = document.getElementById('lang-flag');
    const labelEl = document.getElementById('lang-label');
    const flagMob = document.getElementById('lang-flag-mobile');
    const labelMob = document.getElementById('lang-label-mobile');

    if (flagEl) flagEl.textContent = flag;
    if (labelEl) labelEl.textContent = label;
    if (flagMob) flagMob.textContent = flag;
    if (labelMob) labelMob.textContent = label;

    const t = translations[lang];
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t && t[key]) el.textContent = t[key];
    });

    const placeholders = {
        pt: {
            name: 'Insira o seu nome completo',
            email: 'Insira o seu e-mail',
            msg: 'Mensagem'
        },
        en: {
            name: 'Enter your full name',
            email: 'Enter your email address',
            msg: 'Message'
        }
    };
    const p = placeholders[lang];
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (p && p[key]) el.placeholder = p[key];
    });

    pageTexts.forEach(([selector, ptText, enText]) => {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = isEn ? enText : ptText;
    });

    document.documentElement.lang = isEn ? 'en' : 'pt-BR';
}

// Disponibiliza toggleLanguage no escopo global para acionamento via onclick ou eventos
window.toggleLanguage = toggleLanguage;


/* ==========================================================================
   3. ANIMAÇÕES E GRÁFICOS 3D (THREE.JS / WEBGL VIA SHADERS NA GPU)
   ========================================================================== */

// --- 3.1 Esfera de Partículas do Hero (#sphere-container) ---
const container = document.getElementById('sphere-container');
if (container) {
    container.style.cursor = 'grab';

    let isVisible1 = true;
    const obs1 = new IntersectionObserver((entries) => {
        entries.forEach(e => { isVisible1 = e.isIntersecting; });
    }, { threshold: 0.05 });
    obs1.observe(container);

    const PARTICLE_COUNT = 2400;
    const SPHERE_RADIUS = 3.5;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x020617, 0); 
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    function resize() {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight * 0.5;
        if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            if (mat.uniforms && mat.uniforms.uScale) {
                mat.uniforms.uScale.value = h * 0.5;
            }
        }
    }

    const texCanvas = document.createElement('canvas');
    texCanvas.width = texCanvas.height = 64;
    const ctx = texCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(249, 115, 22, 0.8)');
    grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(texCanvas);

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const basePos = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT * 3);
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / PARTICLE_COUNT);
        basePos[i*3]   = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
        basePos[i*3+1] = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
        basePos[i*3+2] = SPHERE_RADIUS * Math.cos(phi);
        seeds[i*3]   = Math.random() * Math.PI * 2;
        seeds[i*3+1] = Math.random() * Math.PI * 2;
        seeds[i*3+2] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(basePos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));

    const colors = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const isBlue = Math.random() > 0.5;
        colors[i*3]   = isBlue ? 0.23 : 0.98;
        colors[i*3+1] = isBlue ? 0.51 : 0.45;
        colors[i*3+2] = isBlue ? 0.96 : 0.09;
    }
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 0.16 },
            uScale: { value: container.clientHeight * 0.5 },
            uTexture: { value: pTex }
        },
        vertexShader: `
            attribute vec3 aColor;
            attribute vec3 aSeed;
            varying vec3 vColor;
            uniform float uTime;
            uniform float uSize;
            uniform float uScale;

            void main() {
                vColor = aColor;
                float FLOAT_SPEED = 0.4;
                vec3 displaced = position;
                displaced.x += sin(uTime * FLOAT_SPEED * 0.7 + aSeed.x) * 0.15;
                displaced.y += cos(uTime * FLOAT_SPEED * 0.9 + aSeed.y) * 0.15;
                displaced.z += sin(uTime * FLOAT_SPEED * 1.1 + aSeed.z) * 0.15;

                vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
                gl_PointSize = uSize * (uScale / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            varying vec3 vColor;
            void main() {
                vec4 texColor = texture2D(uTexture, gl_PointCoord);
                if (texColor.a < 0.01) discard;
                gl_FragColor = vec4(vColor, 0.9) * texColor;
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending
    });
    const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_RADIUS * 0.4, 24, 24), glowMat);
    scene.add(glowMesh);
    
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        if (!isVisible1) return;

        const t = clock.getElapsedTime();
        mat.uniforms.uTime.value = t;

        controls.update();
        renderer.render(scene, camera);
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('load', resize);
    setTimeout(resize, 100);
    setTimeout(resize, 500);
    setTimeout(resize, 1500);
    animate();
}

// --- 3.2 Esfera e Nós da Infraestrutura Global (#infra-sphere-container) ---
const infraContainer = document.getElementById('infra-sphere-container');
if (infraContainer) {
    infraContainer.style.cursor = 'grab';

    let isVisible2 = false;
    const obs2 = new IntersectionObserver((entries) => {
        entries.forEach(e => { isVisible2 = e.isIntersecting; });
    }, { threshold: 0.05 });
    obs2.observe(infraContainer);

    const scene2 = new THREE.Scene();
    const camera2 = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera2.position.set(0, 0, 7.5);

    const renderer2 = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer2.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer2.setClearColor(0x020617, 0);
    infraContainer.appendChild(renderer2.domElement);

    const controls2 = new OrbitControls(camera2, renderer2.domElement);
    controls2.enableDamping = true;
    controls2.dampingFactor = 0.05;
    controls2.enablePan = false;
    controls2.enableZoom = false;
    controls2.autoRotate = true;
    controls2.autoRotateSpeed = 1.2;

    function resize2() {
        const w = infraContainer.clientWidth || window.innerWidth;
        const h = infraContainer.clientHeight || window.innerHeight * 0.5;
        if (w > 0 && h > 0) {
            renderer2.setSize(w, h);
            camera2.aspect = w / h;
            camera2.updateProjectionMatrix();
            if (nodeMat.uniforms && nodeMat.uniforms.uScale) {
                nodeMat.uniforms.uScale.value = h * 0.5;
            }
        }
    }

    const texCanvas2 = document.createElement('canvas');
    texCanvas2.width = texCanvas2.height = 64;
    const ctx2 = texCanvas2.getContext('2d');
    const grad2 = ctx2.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad2.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad2.addColorStop(0.3, 'rgba(236, 72, 153, 0.9)');
    grad2.addColorStop(0.6, 'rgba(168, 85, 247, 0.5)');
    grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx2.fillStyle = grad2;
    ctx2.fillRect(0, 0, 64, 64);
    const pTex2 = new THREE.CanvasTexture(texCanvas2);

    const NODE_COUNT = 130;
    const RADIUS = 2.6;
    const nodePos = [];
    const nodeVectors = [];

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < NODE_COUNT; i++) {
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
        const x = RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = RADIUS * Math.cos(phi);
        nodePos.push(x, y, z);
        nodeVectors.push(new THREE.Vector3(x, y, z));
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));

    const nodeMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 0.18 },
            uScale: { value: infraContainer.clientHeight * 0.5 },
            uTexture: { value: pTex2 },
            uColor: { value: new THREE.Color(0xd946ef) }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uSize;
            uniform float uScale;

            void main() {
                float currentSize = uSize + cos(uTime * 2.0) * 0.03;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = currentSize * (uScale / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            uniform vec3 uColor;
            void main() {
                vec4 texColor = texture2D(uTexture, gl_PointCoord);
                if (texColor.a < 0.01) discard;
                gl_FragColor = vec4(uColor, 0.95) * texColor;
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    scene2.add(nodePoints);

    const linePositions = [];
    const lineColors = [];
    const color1 = new THREE.Color(0xec4899);
    const color2 = new THREE.Color(0xa855f7);
    const color3 = new THREE.Color(0xf97316);

    for (let i = 0; i < NODE_COUNT; i++) {
        const v1 = nodeVectors[i];
        let connections = 0;
        for (let j = i + 1; j < NODE_COUNT; j++) {
            const v2 = nodeVectors[j];
            const dist = v1.distanceTo(v2);
            if (dist < 1.35 && connections < 3) {
                linePositions.push(v1.x, v1.y, v1.z);
                linePositions.push(v2.x, v2.y, v2.z);
                
                const c = Math.random() > 0.6 ? color3 : (Math.random() > 0.5 ? color1 : color2);
                lineColors.push(c.r, c.g, c.b);
                lineColors.push(c.r, c.g, c.b);
                connections++;
            }
        }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene2.add(lineSegments);

    const innerGeo = new THREE.SphereGeometry(RADIUS * 0.85, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
        color: 0x581c87,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        wireframe: true
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene2.add(innerMesh);

    const clock2 = new THREE.Clock();
    function animate2() {
        requestAnimationFrame(animate2);
        if (!isVisible2) return;

        const t = clock2.getElapsedTime();
        nodeMat.uniforms.uTime.value = t;
        lineMat.opacity = 0.25 + Math.sin(t * 1.5) * 0.1;
        innerMesh.rotation.y -= 0.002;
        innerMesh.rotation.x += 0.001;

        controls2.update();
        renderer2.render(scene2, camera2);
    }

    resize2();
    window.addEventListener('resize', resize2);
    window.addEventListener('load', resize2);
    setTimeout(resize2, 100);
    setTimeout(resize2, 500);
    setTimeout(resize2, 1500);
    animate2();
}

// --- 3.3 Escultura Torus Knot de Partículas dos Planos (#pricing-sphere-container) ---
const pricingContainer = document.getElementById('pricing-sphere-container');
if (pricingContainer) {
    pricingContainer.style.cursor = 'default';

    let isVisible3 = false;
    const obs3 = new IntersectionObserver((entries) => {
        entries.forEach(e => { isVisible3 = e.isIntersecting; });
    }, { threshold: 0.05 });
    obs3.observe(pricingContainer);

    const scene3 = new THREE.Scene();
    const camera3 = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera3.position.set(0, 0, 9.8);

    const renderer3 = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer3.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer3.setClearColor(0x020617, 0);
    pricingContainer.appendChild(renderer3.domElement);

    const controls3 = new OrbitControls(camera3, renderer3.domElement);
    controls3.enableDamping = true;
    controls3.dampingFactor = 0.05;
    controls3.enablePan = false;
    controls3.enableZoom = false;
    controls3.enableRotate = false;
    controls3.autoRotate = true;
    controls3.autoRotateSpeed = 1.0;

    function resize3() {
        const w = pricingContainer.clientWidth || window.innerWidth;
        const h = pricingContainer.clientHeight || window.innerHeight * 0.5;
        if (w > 0 && h > 0) {
            renderer3.setSize(w, h);
            camera3.aspect = w / h;
            camera3.position.z = camera3.aspect < 1.0 ? Math.min(13.5, 9.8 / camera3.aspect) : 9.8;
            camera3.updateProjectionMatrix();
            if (pointsMat3.uniforms && pointsMat3.uniforms.uScale) {
                pointsMat3.uniforms.uScale.value = h * 0.5;
            }
        }
    }

    const texCanvas3 = document.createElement('canvas');
    texCanvas3.width = texCanvas3.height = 64;
    const ctx3 = texCanvas3.getContext('2d');
    const grad3 = ctx3.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad3.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad3.addColorStop(0.2, 'rgba(244, 63, 94, 0.9)');
    grad3.addColorStop(0.5, 'rgba(249, 115, 22, 0.6)');
    grad3.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx3.fillStyle = grad3;
    ctx3.fillRect(0, 0, 64, 64);
    const pTex3 = new THREE.CanvasTexture(texCanvas3);

    const knotGeo = new THREE.TorusKnotGeometry(2.2, 0.65, 140, 20, 2, 3);
    const posAttr = knotGeo.attributes.position;
    const particleCount3 = posAttr.count;

    const basePos3 = new Float32Array(particleCount3 * 3);
    const colors3 = new Float32Array(particleCount3 * 3);

    const cRose = new THREE.Color(0xf43f5e);
    const cOrange = new THREE.Color(0xf97316);
    const cPurple = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount3; i++) {
        const ix = i * 3;
        basePos3[ix] = posAttr.getX(i);
        basePos3[ix+1] = posAttr.getY(i);
        basePos3[ix+2] = posAttr.getZ(i);

        const ratio = (i % 300) / 300;
        let col = cRose.clone().lerp(cOrange, ratio);
        if (i % 2 === 0) col = col.lerp(cPurple, 0.4);

        colors3[ix] = col.r;
        colors3[ix+1] = col.g;
        colors3[ix+2] = col.b;
    }

    const pointsGeo3 = new THREE.BufferGeometry();
    pointsGeo3.setAttribute('position', new THREE.BufferAttribute(basePos3, 3));
    pointsGeo3.setAttribute('aColor', new THREE.BufferAttribute(colors3, 3));

    const pointsMat3 = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 0.15 },
            uScale: { value: pricingContainer.clientHeight * 0.5 },
            uTexture: { value: pTex3 }
        },
        vertexShader: `
            attribute vec3 aColor;
            varying vec3 vColor;
            uniform float uTime;
            uniform float uSize;
            uniform float uScale;

            void main() {
                vColor = aColor;
                float wTime = uTime * 1.5;
                vec3 bx = position;
                
                float wave = sin(wTime + bx.x * 0.7 + bx.y * 0.7) * 0.12;
                vec3 displaced = bx + wave * (bx / 2.2);

                vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
                gl_PointSize = uSize * (uScale / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            varying vec3 vColor;
            void main() {
                vec4 texColor = texture2D(uTexture, gl_PointCoord);
                if (texColor.a < 0.01) discard;
                gl_FragColor = vec4(vColor, 0.9) * texColor;
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const knotPoints = new THREE.Points(pointsGeo3, pointsMat3);
    scene3.add(knotPoints);

    const clock3 = new THREE.Clock();
    function animate3() {
        requestAnimationFrame(animate3);
        if (!isVisible3) return;

        const t = clock3.getElapsedTime();
        pointsMat3.uniforms.uTime.value = t;

        knotPoints.rotation.x = Math.sin(t * 0.3) * 0.3;
        knotPoints.rotation.y += 0.004;

        controls3.update();
        renderer3.render(scene3, camera3);
    }

    resize3();
    window.addEventListener('resize', resize3);
    window.addEventListener('load', resize3);
    setTimeout(resize3, 100);
    setTimeout(resize3, 500);
    setTimeout(resize3, 1500);
    animate3();
}
