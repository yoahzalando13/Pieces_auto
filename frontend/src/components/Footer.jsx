export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-black/45 border-t border-linear-border py-12 md:py-16 mt-20 relative z-10 select-none">
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                
                {/* Column 1: Brand Pitch */}
                <div className="flex flex-col gap-4 text-left">
                    <div className="flex items-center gap-2 text-linear-text-primary font-bold tracking-editorial">
                        <svg className="w-6 h-6 text-linear-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>PIÈCES AUTO</span>
                    </div>
                    <p className="text-xs text-linear-text-muted leading-relaxed">
                        Équipements automobiles de rechange certifiés et pièces de performance pour passionnés de mécanique exigeants.
                    </p>
                </div>

                {/* Column 2: Assistance & Support */}
                <div className="flex flex-col gap-4 text-left">
                    <span className="text-[10px] font-bold text-linear-text-primary tracking-wider uppercase">
                        Assistance Technique
                    </span>
                    <ul className="flex flex-col gap-2.5 text-xs text-linear-text-muted">
                        <li>
                            <a href="#support" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Support Technique en Ligne
                            </a>
                        </li>
                        <li>
                            <a href="#expert-advice" className="hover:text-linear-text-primary transition-colors cursor-pointer flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Conseil d'expert gratuit
                            </a>
                        </li>
                        <li>
                            <a href="#vin-lookup" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Aide à la recherche VIN
                            </a>
                        </li>
                        <li>
                            <a href="#contact" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Contacter l'atelier
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Column 3: Tutoriels & Montage */}
                <div className="flex flex-col gap-4 text-left">
                    <span className="text-[10px] font-bold text-linear-text-primary tracking-wider uppercase">
                        Atelier & Guides
                    </span>
                    <ul className="flex flex-col gap-2.5 text-xs text-linear-text-muted">
                        <li>
                            <a href="#faq" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                FAQ de montage mécanique
                            </a>
                        </li>
                        <li>
                            <a href="#guides" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Tutoriels d'installation
                            </a>
                        </li>
                        <li>
                            <a href="#partners" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Trouver un garage partenaire
                            </a>
                        </li>
                        <li>
                            <a href="#compatibility" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Charte de compatibilité
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Column 4: Commandes & Retours */}
                <div className="flex flex-col gap-4 text-left">
                    <span className="text-[10px] font-bold text-linear-text-primary tracking-wider uppercase">
                        Politiques & Commandes
                    </span>
                    <ul className="flex flex-col gap-2.5 text-xs text-linear-text-muted">
                        <li>
                            <a href="#returns" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Retour Simplifié (30 jours)
                            </a>
                        </li>
                        <li>
                            <a href="#shipping" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Modalités de livraison express
                            </a>
                        </li>
                        <li>
                            <a href="#warranty" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                Garantie OEM & Équipementiers
                            </a>
                        </li>
                        <li>
                            <a href="#terms" className="hover:text-linear-text-primary transition-colors cursor-pointer">
                                CGV & Mentions légales
                            </a>
                        </li>
                    </ul>
                </div>

            </div>

            {/* Bottom bar */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16 pt-6 border-t border-linear-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] text-linear-text-muted">
                    © {currentYear} Pièces Auto. Tous droits réservés.
                </span>
                
                <div className="flex items-center gap-6 text-[10px] text-linear-text-muted">
                    <span className="hover:text-linear-text-primary transition-colors cursor-pointer">Sécurisé SSL 256-bit</span>
                    <span className="hover:text-linear-text-primary transition-colors cursor-pointer">Paiement 3X/4X sans frais</span>
                </div>
            </div>
        </footer>
    );
}