import re

def refactor_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()

    css_rules = []
    
    # Define replacements
    # (Old string, New string, New CSS)
    replacements = [
        # Navbar base
        (
            '<nav id="navbar" class="nav-glass fixed top-0 left-0 right-0 z-50 transition-all duration-300">',
            '<nav id="navbar" class="header-navbar nav-glass">',
            """
/* ===== NAVBAR SEMANTICS ===== */
.header-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    transition: all 0.3s;
}
"""
        ),
        (
            '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">',
            '<div class="container-base">',
            """
/* ===== LAYOUT CONTAINERS ===== */
.container-base {
    max-width: 80rem;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
}
@media (min-width: 640px) { .container-base { padding-left: 1.5rem; padding-right: 1.5rem; } }
@media (min-width: 1024px) { .container-base { padding-left: 2rem; padding-right: 2rem; } }
"""
        ),
        (
            '<div class="flex items-center justify-between h-16 lg:h-20">',
            '<div class="navbar-inner">',
            """
.navbar-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
}
@media (min-width: 1024px) { .navbar-inner { height: 5rem; } }
"""
        ),
        (
            '<a href="#" class="flex items-center gap-2 group py-1">',
            '<a href="#" class="logo-link group">',
            """
.logo-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
}
"""
        ),
        (
            '<img src="assets/logos/logo-sem-fundo-removebg-fav.png" alt="Deskify Logo" class="h-[4rem] w-auto object-contain transition-transform duration-300 group-hover:scale-105">',
            '<img src="assets/logos/logo-sem-fundo-removebg-fav.png" alt="Deskify Logo" class="logo-img">',
            """
.logo-img {
    height: 4rem;
    width: auto;
    object-fit: contain;
    transition: transform 0.3s;
}
.logo-link:hover .logo-img {
    transform: scale(1.05);
}
"""
        ),
        (
            '<div class="hidden lg:flex items-center gap-8">',
            '<div class="navbar-links-desktop">',
            """
.navbar-links-desktop {
    display: none;
    align-items: center;
    gap: 2rem;
}
@media (min-width: 1024px) {
    .navbar-links-desktop { display: flex; }
}
"""
        ),
        # Desktop links
        (
            'class="text-sm font-medium text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"',
            'class="nav-item-link"',
            """
.nav-item-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: #cbd5e1;
    transition: all 0.3s;
}
.nav-item-link:hover {
    color: #ffffff;
    filter: drop-shadow(0 0 8px rgba(255,255,255,0.5));
}
"""
        ),
        (
            '<div class="hidden lg:flex items-center gap-4">',
            '<div class="navbar-actions-desktop">',
            """
.navbar-actions-desktop {
    display: none;
    align-items: center;
    gap: 1rem;
}
@media (min-width: 1024px) {
    .navbar-actions-desktop { display: flex; }
}
"""
        ),
        (
            'class="text-sm font-medium text-slate-300 hover:text-white transition-colors"',
            'class="nav-login-link"',
            """
.nav-login-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: #cbd5e1;
    transition: color 0.3s;
}
.nav-login-link:hover {
    color: #ffffff;
}
"""
        ),
        (
            'class="btn-glow text-sm font-semibold text-white px-6 py-2.5 rounded-full"',
            'class="btn-glow nav-cta-btn"',
            """
.nav-cta-btn {
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
    padding: 0.625rem 1.5rem;
    border-radius: 9999px;
}
"""
        )
    ]

    for old_str, new_str, css in replacements:
        if old_str in content:
            content = content.replace(old_str, new_str)
            if css.strip() not in "\n".join(css_rules):
                css_rules.append(css.strip())
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)

    with open('style.css', 'a', encoding='utf-8') as f:
        f.write("\n\n" + "\n\n".join(css_rules))

if __name__ == "__main__":
    refactor_html()
    print("Refactoring done.")
