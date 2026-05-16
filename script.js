document.addEventListener('DOMContentLoaded', () => {
    // Chargement de la page
    const pageLoader = document.getElementById('page-loader');
    if (pageLoader) {
        setTimeout(() => {
            pageLoader.style.opacity = '0';
            pageLoader.style.visibility = 'hidden';
            // Déclencher les animations initiales après la disparition du loader
            setTimeout(() => {
                document.querySelectorAll('.hero .fade-up').forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, index * 100); // Apparition en cascade
                });
            }, 300);
        }, 1500); // Laisser le temps à l'animation de se terminer
    }

    // Curseur personnalisé
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (cursor && follower && window.innerWidth >= 1024) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            // Ajouter un léger délai pour le point suiveur
            setTimeout(() => {
                follower.style.left = e.clientX + 'px';
                follower.style.top = e.clientY + 'px';
            }, 50);
        });

        // Effet de survol pour les éléments interactifs
        const interactives = document.querySelectorAll('a, button, .project-card, input, textarea');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                follower.style.opacity = '0';
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                follower.style.opacity = '1';
            });
        });
    }

    // Effet de scroll sur l'en-tête
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Menu mobile
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Fermer le menu au clic sur un lien
    document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            navLinks.classList.remove('active');
        }
    }));

    // Liens de navigation actifs au scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Adjust offset to trigger slightly earlier
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // Récupération et affichage des projets
    const projectGrid = document.getElementById('project-grid');
    const loader = document.getElementById('project-loader');
    const errorContainer = document.getElementById('project-error');
    const retryBtn = document.getElementById('retry-btn');
    let allProjects = [];

    async function fetchProjects() {
        if (!projectGrid || !loader) return;
        
        loader.classList.remove('hidden');
        projectGrid.classList.add('hidden');
        if(errorContainer) errorContainer.classList.add('hidden');

        try {
            const response = await fetch('./data/projects.json');
            
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }

            allProjects = await response.json();
            displayProjects(allProjects);
            
            loader.classList.add('hidden');
            projectGrid.classList.remove('hidden');
            
            // Re-initialize observer for new project cards
            observeElements();
            
        } catch (error) {
            console.error('Error fetching projects:', error);
            loader.classList.add('hidden');
            if(errorContainer) {
                errorContainer.innerHTML = `
                    <div class="error-state">
                        <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
                        <h2>Oups ! Une erreur est survenue</h2>
                        <p>Impossible de charger les projets pour le moment. Veuillez vérifier votre connexion ou réessayer plus tard.</p>
                        <div class="error-actions">
                            <button id="retry-btn" class="btn btn-primary">Réessayer</button>
                        </div>
                    </div>
                `;
                errorContainer.classList.remove('hidden');
                
                // Re-bind retry button because we just replaced the HTML
                const newRetryBtn = document.getElementById('retry-btn');
                if (newRetryBtn) {
                    newRetryBtn.addEventListener('click', fetchProjects);
                }
            }
        }
    }

    function displayProjects(projects) {
        if (!projectGrid) return;
        projectGrid.innerHTML = '';
        
        projects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card fade-up';
            projectCard.style.transitionDelay = `${index * 0.1}s`; // Animation en cascade
            
            projectCard.innerHTML = `
                <div class="project-img">
                    <img src="${project.image}" alt="${project.title}">
                    <div class="project-overlay">
                        <div class="project-links" style="display: flex; justify-content: center; width: 100%;">
                            <a href="project.html?id=${project.id}" style="width: auto; height: auto; padding: 12px 30px; border-radius: var(--radius-full); font-family: var(--font-body); font-size: 0.95rem; font-weight: 500; text-transform: none; transform: translateY(20px);">Voir les détails</a>
                        </div>
                    </div>
                </div>
                <div class="project-info">
                    <span class="project-cat">${project.category}</span>
                    <h3>${project.title}</h3>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-tech">
                        ${project.tech.map(t => `<span>${t}</span>`).join('')}
                    </div>
                </div>
            `;
            
            projectGrid.appendChild(projectCard);
        });
    }

    // Initial Fetch
    fetchProjects();

    // Retry Button
    if (retryBtn) {
        retryBtn.addEventListener('click', fetchProjects);
    }

    // Filtrage des projets
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            
            if (filter === 'all') {
                displayProjects(allProjects);
            } else {
                const filteredProjects = allProjects.filter(p => p.category === filter);
                displayProjects(filteredProjects);
            }
            
            // Re-trigger animations for filtered cards
            setTimeout(observeElements, 50);
        });
    });

    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validation basique
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }
            
            // Désactiver le bouton et afficher l'état de chargement
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="btn-text">Envoi en cours...</span><div class="spinner" style="width:20px;height:20px;margin:0;border-width:2px;"></div>';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Simuler un appel API
            try {
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
                
                formStatus.textContent = `Merci ${data.name.split(' ')[0] || 'beaucoup'}, votre message a été envoyé avec succès !`;
                formStatus.className = 'form-status success';
                contactForm.reset();
            } catch (error) {
                formStatus.textContent = "Désolé, une erreur est survenue. Veuillez réessayer.";
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Masquer le message après 5 secondes
                setTimeout(() => {
                    formStatus.style.display = 'none';
                    formStatus.className = 'form-status';
                }, 5000);
            }
        });
    }

    // Animations d'apparition (Intersection Observer)
    function observeElements() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Optional: Stop observing once revealed
                    // observer.unobserve(entry.target); 
                }
            });
        }, observerOptions);

        document.querySelectorAll('.fade-up').forEach(el => {
            // Don't re-observe elements that are already revealed to avoid animation jumps
            if(!el.classList.contains('revealed')){
                 observer.observe(el);
            }
        });
    }
    
    // Call initially for static elements (hero is handled in loader)
    observeElements();

    // Affichage des détails d'un projet (pour project.html)
    const projectDetailContainer = document.getElementById('project-detail-container');
    if (projectDetailContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');

        if (projectId) {
            fetch('./data/projects.json')
                .then(res => res.json())
                .then(projects => {
                    const project = projects.find(p => p.id == projectId);
                    if (project) {
                        displayProjectDetails(project);
                    } else {
                        projectDetailContainer.innerHTML = `
                            <div class="error-state">
                                <div class="error-icon"><i class="fas fa-search"></i></div>
                                <h2>Projet introuvable</h2>
                                <p>Le projet que vous recherchez semble ne pas exister ou a été déplacé.</p>
                                <div class="error-actions">
                                    <a href="index.html#projects" class="btn btn-primary">Retour aux projets</a>
                                </div>
                            </div>
                        `;
                    }
                })
                .catch(err => {
                    console.error(err);
                    projectDetailContainer.innerHTML = `
                        <div class="error-state">
                            <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                            <h2>Erreur de chargement</h2>
                            <p>Nous n'avons pas pu charger les détails de ce projet. Veuillez réessayer plus tard.</p>
                            <div class="error-actions">
                                <a href="index.html#projects" class="btn btn-primary">Retour aux projets</a>
                                <button onclick="location.reload()" class="btn btn-ghost">Actualiser</button>
                            </div>
                        </div>
                    `;
                });
        } else {
            projectDetailContainer.innerHTML = `
                <div class="error-state">
                    <div class="error-icon"><i class="fas fa-info-circle"></i></div>
                    <h2>Aucun projet sélectionné</h2>
                    <p>Veuillez choisir un projet depuis notre catalogue pour voir ses détails.</p>
                    <div class="error-actions">
                        <a href="index.html#projects" class="btn btn-primary">Voir les projets</a>
                    </div>
                </div>
            `;
        }
    }

    function displayProjectDetails(project) {
        document.title = `${project.title} — Chaimae Nouiti`;

        projectDetailContainer.innerHTML = `
            <div class="pd-container">
                <div class="pd-breadcrumb fade-up">
                    <a href="index.html#projects" class="pd-back-link">
                        <i class="fas fa-arrow-left" style="margin-right: 8px;"></i>
                        RETOUR AUX PROJETS
                    </a>
                </div>

                <div class="pd-split-hero">
                    <div class="pd-info-col">
                        <span class="pd-category">${project.category}</span>
                        <h1 class="pd-title">${project.title}</h1>
                        <p class="pd-brief">${project.description}</p>
                        <div class="pd-actions">
                            ${project.link && project.link !== '#' ? `
                            <a href="${project.link}" target="_blank" rel="noopener" class="btn btn-primary">
                                <i class="fas fa-external-link-alt" style="margin-right: 10px;"></i>
                                Voir le projet
                            </a>` : ''}
                            <a href="index.html#contact" class="btn btn-ghost">Me contacter</a>
                        </div>
                    </div>
                    <div class="pd-image-col">
                        <div class="pd-image-wrapper">
                            <img src="${project.image}" alt="${project.title}">
                        </div>
                    </div>
                </div>

                <div class="pd-details-grid fade-up">
                    <div class="pd-description-col">
                        <span class="pd-section-label">À PROPOS DU PROJET</span>
                        <div class="pd-full-description">
                            ${project.description}
                            <br><br>
                            Ce projet illustre une approche rigoureuse de l'ingénierie logicielle, mettant l'accent sur la performance, la sécurité et l'expérience utilisateur. Chaque composant a été conçu pour répondre à des exigences techniques spécifiques tout en maintenant une architecture propre et évolutive.
                        </div>
                    </div>

                    <aside class="pd-sidebar-col">
                        <div class="pd-sidebar-group">
                            <div class="pd-meta-item">
                                <span class="pd-meta-label">CATÉGORIE</span>
                                <span class="pd-meta-value">${project.category}</span>
                            </div>
                            <div class="pd-meta-item">
                                <span class="pd-meta-label">TECHNOLOGIES</span>
                                <div class="pd-tech-tags">
                                    ${project.tech.map(t => `<span class="pd-tech-tag">${t}</span>`).join('')}
                                </div>
                            </div>
                            <div class="pd-meta-item">
                                <span class="pd-meta-label">TYPE DE PROJET</span>
                                <span class="pd-meta-value">Ingénierie & Développement</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        `;
        
        // Re-trigger fade-up animations
        setTimeout(() => {
            document.querySelectorAll('.pd-container .fade-up').forEach(el => el.classList.add('revealed'));
        }, 100);
    }
});
