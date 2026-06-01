import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Technical data for vehicles
const VEHICLES_DATA = {
  "Peugeot": {
    models: ["208", "308", "3008", "508", "2008"],
    engines: {
      "208": ["1.2 PureTech 75ch", "1.2 PureTech 100ch", "1.5 BlueHDi 100ch", "e-208 136ch"],
      "308": ["1.2 PureTech 130ch", "1.5 BlueHDi 130ch", "1.6 Hybrid 180ch", "1.6 Hybrid 225ch"],
      "3008": ["1.2 PureTech 130ch", "1.5 BlueHDi 130ch", "1.6 Hybrid 225ch", "1.6 Hybrid 300ch 4x4"],
      "508": ["1.5 BlueHDi 130ch", "1.6 PureTech 180ch", "1.6 Hybrid 225ch", "PSE 360ch 4x4"],
      "2008": ["1.2 PureTech 100ch", "1.2 PureTech 130ch", "1.5 BlueHDi 110ch", "e-2008 136ch"]
    }
  },
  "Renault": {
    models: ["Clio V", "Megane IV", "Captur II", "Austral", "Alpine A110"],
    engines: {
      "Clio V": ["1.0 TCe 90ch", "1.6 E-Tech Hybrid 140ch", "1.5 dCi 85ch"],
      "Megane IV": ["1.3 TCe 140ch", "1.5 dCi 115ch", "1.8 R.S. 300ch", "1.6 E-Tech Plug-in 160ch"],
      "Captur II": ["1.0 TCe 90ch", "1.3 TCe 140ch", "1.6 E-Tech Hybrid 145ch"],
      "Austral": ["1.2 Mild Hybrid 130ch", "1.3 Mild Hybrid 160ch", "1.2 E-Tech Full Hybrid 200ch"],
      "Alpine A110": ["1.8 Turbo 252ch", "1.8 Turbo 300ch S/R"]
    }
  },
  "BMW": {
    models: ["Série 1 (F40)", "Série 3 (G20)", "Série 5 (G30)", "M4 (G82)", "X3 (G01)"],
    engines: {
      "Série 1 (F40)": ["116d 116ch", "118i 136ch", "120i 178ch", "M135i 306ch"],
      "Série 3 (G20)": ["320d 190ch", "320i 184ch", "330e Hybrid 292ch", "M340i 374ch"],
      "Série 5 (G30)": ["520d 190ch", "530e Hybrid 292ch", "540i 333ch", "M550i 530ch"],
      "M4 (G82)": ["3.0 TwinTurbo 480ch", "Competition 510ch M xDrive"],
      "X3 (G01)": ["xDrive20d 190ch", "xDrive30e Hybrid 292ch", "M40i 360ch", "X3 M Competition 510ch"]
    }
  },
  "Audi": {
    models: ["A3 (8Y)", "A4 (B9)", "A6 (C8)", "RS6 Avant (C8)", "Q5 (FY)"],
    engines: {
      "A3 (8Y)": ["30 TFSI 110ch", "35 TDI 150ch", "40 TFSIe 204ch", "S3 310ch", "RS3 400ch"],
      "A4 (B9)": ["35 TFSI 150ch", "40 TDI 204ch", "S4 341ch MHEV"],
      "A6 (C8)": ["40 TDI 204ch", "50 TFSIe 299ch", "55 TFSI 340ch"],
      "RS6 Avant (C8)": ["4.0 TFSI V8 600ch", "Performance 630ch"],
      "Q5 (FY)": ["35 TDI 163ch", "40 TDI 204ch", "50 TFSIe Hybrid 299ch"]
    }
  },
  "Porsche": {
    models: ["911 (992)", "718 Cayman", "Taycan", "Panamera"],
    engines: {
      "911 (992)": ["Carrera 385ch", "Carrera S 450ch", "GT3 510ch", "Turbo S 650ch"],
      "718 Cayman": ["2.0 Turbo 300ch", "S 2.5 Turbo 350ch", "GTS 4.0 400ch", "GT4 RS 500ch"],
      "Taycan": ["Base 408ch", "4S 530ch", "Turbo S 761ch", "Turbo GT 1034ch"],
      "Panamera": ["4 E-Hybrid 470ch", "GTS 500ch", "Turbo E-Hybrid 680ch"]
    }
  }
};

export default function HomePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("plaque"); // "plaque" or "modele"
  
  // Plate Search States
  const [plateNumber, setPlateNumber] = useState("");
  const [plateError, setPlateError] = useState("");
  const [isSearchingPlate, setIsSearchingPlate] = useState(false);

  // Model Search States
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("");
  const [modelError, setModelError] = useState("");

  // VIN Checker States
  const [vinNumber, setVinNumber] = useState("");
  const [vinStatus, setVinStatus] = useState({ type: "idle", message: "" });

  // Format Plate input to French standard (AA-123-AA)
  const formatPlate = (val) => {
    // Keep letters and digits
    const clean = val.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    
    if (clean.length <= 2) {
      return clean;
    } else if (clean.length <= 5) {
      return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    } else {
      return `${clean.slice(0, 2)}-${clean.slice(2, 5)}-${clean.slice(5, 7)}`;
    }
  };

  const handlePlateChange = (e) => {
    const formatted = formatPlate(e.target.value);
    setPlateNumber(formatted);
    setPlateError("");
  };

  const validatePlate = () => {
    // Regular expression for modern SIV French plate (XX-123-XX)
    const sivRegex = /^[A-Z]{2}-[0-9]{3}-[A-Z]{2}$/;
    
    // Also accept old French format (e.g. 1234 AB 75 or similar) for flexibility but SIV is priority
    if (!plateNumber) {
      setPlateError("Veuillez saisir votre plaque d'immatriculation.");
      return false;
    }

    if (!sivRegex.test(plateNumber)) {
      setPlateError("Format attendu : AA-123-AA (avec tirets)");
      return false;
    }

    return true;
  };

  const handlePlateSubmit = (e) => {
    e.preventDefault();
    if (!validatePlate()) return;

    setIsSearchingPlate(true);
    // Simulate lookup
    setTimeout(() => {
      setIsSearchingPlate(false);
      // Redirect to catalog page with state
      navigate("/products", { 
        state: { 
          searchType: "plate", 
          query: plateNumber,
          vehicleInfo: "Peugeot 208 II 1.2 PureTech 100ch (Simulé via plaque)"
        } 
      });
    }, 1200);
  };

  const handleModelSubmit = (e) => {
    e.preventDefault();
    if (!selectedBrand || !selectedModel || !selectedEngine) {
      setModelError("Veuillez renseigner tous les champs pour identifier votre véhicule.");
      return;
    }

    setModelError("");
    navigate("/products", {
      state: {
        searchType: "model",
        brand: selectedBrand,
        model: selectedModel,
        engine: selectedEngine,
        vehicleInfo: `${selectedBrand} ${selectedModel} - ${selectedEngine}`
      }
    });
  };

  // Live VIN Validator (17 Alphanumeric characters except I, O, Q)
  const handleVinChange = (e) => {
    const val = e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    setVinNumber(val);

    if (val.length === 0) {
      setVinStatus({ type: "idle", message: "" });
      return;
    }

    if (val.includes("I") || val.includes("O") || val.includes("Q")) {
      setVinStatus({
        type: "error",
        message: "Un VIN ne peut pas contenir les lettres I, O, ou Q."
      });
      return;
    }

    if (val.length < 17) {
      setVinStatus({
        type: "warning",
        message: `Format incomplet : ${val.length}/17 caractères saisis.`
      });
    } else if (val.length === 17) {
      setVinStatus({
        type: "success",
        message: "Format VIN valide. Prêt pour vérification d'expert lors de l'achat."
      });
    } else {
      setVinStatus({
        type: "error",
        message: "Trop de caractères. Un VIN comporte exactement 17 caractères."
      });
    }
  };

  return (
    <div className="w-full flex flex-col gap-16 md:gap-24 relative z-10">
      
      {/* SECTION B: Zone Hero (Accroche + Recherche) */}
      <section className="flex flex-col items-center text-center pt-4 md:pt-10 max-w-4xl mx-auto w-full">
        {/* Sub-badge indicating premium quality */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-linear-border bg-white/[0.02] mb-6 animate-card-enter">
          <span className="w-1.5 h-1.5 rounded-full bg-linear-accent shadow-[0_0_8px_rgba(94,106,210,0.8)]" />
          <span className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
            Ingénierie & Performance Premium
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-editorial leading-[1.1] text-linear-gradient animate-card-enter mb-6">
          Trouvez la pièce exacte pour votre véhicule, sans risque d'erreur.
        </h1>
        
        <p className="text-sm md:text-base text-linear-text-secondary max-w-2xl leading-relaxed mb-10 animate-card-enter">
          Plus de 500 000 références de qualité constructeur certifiée. Renseignez votre véhicule et roulez l'esprit tranquille.
        </p>

        {/* WIDGET RECHERCHE (Glassmorphic) */}
        <div className="w-full max-w-xl linear-glass rounded-2xl p-6 md:p-8 animate-card-enter border border-linear-border/80 relative">
          {/* Tab Selector */}
          <div className="flex bg-black/40 rounded-lg p-1 border border-linear-border mb-6 relative">
            <button
              onClick={() => { setActiveTab("plaque"); setPlateError(""); setModelError(""); }}
              className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-md transition-all cursor-pointer z-10 ${
                activeTab === "plaque" ? "text-linear-text-primary bg-linear-accent shadow-sm" : "text-linear-text-muted hover:text-linear-text-secondary"
              }`}
            >
              Par Plaque
            </button>
            <button
              onClick={() => { setActiveTab("modele"); setPlateError(""); setModelError(""); }}
              className={`flex-1 py-2 text-xs md:text-sm font-medium rounded-md transition-all cursor-pointer z-10 ${
                activeTab === "modele" ? "text-linear-text-primary bg-linear-accent shadow-sm" : "text-linear-text-muted hover:text-linear-text-secondary"
              }`}
            >
              Par Modèle
            </button>
          </div>

          {/* TAB 1: PAR PLAQUE */}
          {activeTab === "plaque" && (
            <form onSubmit={handlePlateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col items-center">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase mb-3 text-center w-full">
                  Saisissez l'immatriculation française
                </label>
                
                {/* French License Plate Widget Design */}
                <div className="bg-white rounded-lg border border-neutral-300 shadow-lg p-0.5 flex items-center h-14 w-full max-w-[320px] overflow-hidden focus-within:ring-2 focus-within:ring-linear-accent/60 transition-all select-none">
                  {/* Left Blue Bar (EU & F) */}
                  <div className="bg-[#003399] w-7 h-full flex flex-col items-center justify-between py-1.5 rounded-l-[5px] shrink-0">
                    {/* EU Stars */}
                    <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l1.1 3.4h3.6l-2.9 2.1 1.1 3.4-2.9-2.1-2.9 2.1 1.1-3.4-2.9-2.1h3.6z"/>
                      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1, 1.5" />
                    </svg>
                    <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">F</span>
                  </div>

                  {/* License Input */}
                  <input
                    type="text"
                    placeholder="AA-123-AA"
                    value={plateNumber}
                    onChange={handlePlateChange}
                    className="flex-grow text-center text-xl md:text-2xl font-bold tracking-widest text-neutral-900 placeholder-neutral-300 bg-transparent focus:outline-none uppercase font-mono h-full px-2"
                    maxLength={9}
                  />

                  {/* Right Blue Bar (Region 13 & Logo) */}
                  <div className="bg-[#003399] w-7 h-full flex flex-col items-center justify-between py-1.5 rounded-r-[5px] shrink-0 border-l border-white/10">
                    {/* Stylized Regional Symbol */}
                    <svg className="w-3.5 h-3.5 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="8" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    <span className="text-[10px] font-extrabold text-white leading-none tracking-tight">13</span>
                  </div>
                </div>
              </div>

              {plateError && (
                <p className="text-red-400 text-xs mt-1 text-center font-medium">{plateError}</p>
              )}

              <button
                type="submit"
                disabled={isSearchingPlate}
                className="w-full bg-linear-accent hover:bg-linear-accent-hover text-white text-sm font-semibold py-3 rounded-lg border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(94,106,210,0.25)] flex items-center justify-center gap-2 mt-2 h-12"
              >
                {isSearchingPlate ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Recherche en cours...
                  </>
                ) : (
                  "Valider mon véhicule"
                )}
              </button>
            </form>
          )}

          {/* TAB 2: PAR MODÈLE */}
          {activeTab === "modele" && (
            <form onSubmit={handleModelSubmit} className="flex flex-col gap-4 text-left">
              {/* Marque Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                  Marque
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedModel("");
                    setSelectedEngine("");
                    setModelError("");
                  }}
                  className="w-full bg-black/40 border border-linear-border rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary placeholder-linear-text-muted/65 focus:outline-none focus:border-linear-border-focus focus:ring-1 focus:ring-linear-accent/30 transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="" className="bg-neutral-900 text-linear-text-muted">Sélectionnez la marque</option>
                  {Object.keys(VEHICLES_DATA).map((brand) => (
                    <option key={brand} value={brand} className="bg-neutral-900 text-linear-text-primary">{brand}</option>
                  ))}
                </select>
              </div>

              {/* Modèle Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                  Modèle
                </label>
                <select
                  value={selectedModel}
                  disabled={!selectedBrand}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedEngine("");
                    setModelError("");
                  }}
                  className={`w-full bg-black/40 border border-linear-border rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary focus:outline-none focus:border-linear-border-focus focus:ring-1 focus:ring-linear-accent/30 transition-all font-medium appearance-none cursor-pointer ${
                    !selectedBrand ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="" className="bg-neutral-900 text-linear-text-muted">Sélectionnez le modèle</option>
                  {selectedBrand &&
                    VEHICLES_DATA[selectedBrand].models.map((model) => (
                      <option key={model} value={model} className="bg-neutral-900 text-linear-text-primary">{model}</option>
                    ))}
                </select>
              </div>

              {/* Motorisation Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-linear-text-muted tracking-wider uppercase">
                  Motorisation
                </label>
                <select
                  value={selectedEngine}
                  disabled={!selectedModel}
                  onChange={(e) => {
                    setSelectedEngine(e.target.value);
                    setModelError("");
                  }}
                  className={`w-full bg-black/40 border border-linear-border rounded-lg py-2.5 px-3.5 text-sm text-linear-text-primary focus:outline-none focus:border-linear-border-focus focus:ring-1 focus:ring-linear-accent/30 transition-all font-medium appearance-none cursor-pointer ${
                    !selectedModel ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="" className="bg-neutral-900 text-linear-text-muted">Sélectionnez la motorisation</option>
                  {selectedBrand && selectedModel &&
                    VEHICLES_DATA[selectedBrand].engines[selectedModel].map((eng) => (
                      <option key={eng} value={eng} className="bg-neutral-900 text-linear-text-primary">{eng}</option>
                    ))}
                </select>
              </div>

              {modelError && (
                <p className="text-red-400 text-xs font-medium text-center">{modelError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-linear-accent hover:bg-linear-accent-hover text-white text-sm font-semibold py-3 rounded-lg border border-white/10 hover:border-white/20 active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_12px_rgba(94,106,210,0.25)] flex items-center justify-center gap-2 mt-2 h-12"
              >
                Rechercher les pièces compatibles
              </button>
            </form>
          )}
        </div>
      </section>

      {/* SECTION C: Bannière de Confiance (3 Arguments Forts) */}
      <section className="w-full py-4 border-t border-b border-linear-border bg-linear-card/15 backdrop-blur-xs select-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 px-4 text-center md:text-left">
          {/* Argument 1 */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 text-sm">
              🟢
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs md:text-sm font-semibold text-linear-text-primary leading-tight">
                Compatibilité 100% Garantie
              </span>
              <span className="text-[10px] md:text-xs text-linear-text-muted mt-0.5">
                Retour gratuit sous 30j sans justification
              </span>
            </div>
          </div>

          {/* Vertical Separator for wide screens */}
          <div className="hidden md:block w-px h-6 bg-linear-border" />

          {/* Argument 2 */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 text-sm">
              🛡️
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs md:text-sm font-semibold text-linear-text-primary leading-tight">
                Qualité Équipementier d'Origine
              </span>
              <span className="text-[10px] md:text-xs text-linear-text-muted mt-0.5">
                Pièces certifiées conformes aux normes OEM
              </span>
            </div>
          </div>

          {/* Vertical Separator for wide screens */}
          <div className="hidden md:block w-px h-6 bg-linear-border" />

          {/* Argument 3 */}
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 text-sm">
              ⚡
            </span>
            <div className="flex flex-col text-left">
              <span className="text-xs md:text-sm font-semibold text-linear-text-primary leading-tight">
                Livraison Express 24/48h
              </span>
              <span className="text-[10px] md:text-xs text-linear-text-muted mt-0.5">
                À domicile ou en atelier partenaire de montage
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION D: Bento Grid des Catégories */}
      <section className="flex flex-col gap-8">
        <div className="text-center md:text-left max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-editorial text-linear-gradient">
            Explorez nos catégories de performance
          </h2>
          <p className="text-xs md:text-sm text-linear-text-muted mt-2">
            Des composants de précision conçus pour restaurer ou transcender les capacités de votre véhicule.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          
          {/* Bloc 1 (Double largeur) : Freinage & Sécurité */}
          <div 
            onClick={() => navigate("/products?category=freinage")}
            className="linear-glass rounded-2xl p-6 md:p-8 hover:border-[#5E6AD2] hover:shadow-[0_0_30px_rgba(94,106,210,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative min-h-[240px] md:col-span-2"
          >
            {/* Ambient inner card glow */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-linear-accent/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-linear-accent/10 transition-colors duration-300" />
            
            <div className="max-w-md relative z-10">
              <span className="text-[10px] font-bold text-linear-accent uppercase tracking-widest bg-linear-accent/10 px-2 py-0.5 rounded-full border border-linear-accent/20">
                Sécurité active
              </span>
              <h3 className="text-lg md:text-xl font-bold text-linear-text-primary tracking-editorial mt-3 mb-2">
                Freinage & Sécurité
              </h3>
              <p className="text-xs text-linear-text-muted leading-relaxed">
                Plaquettes en céramique haute friction, disques ventilés, percés et rainurés pour dissiper la chaleur. Conçus pour résister au fading dans les conditions les plus exigeantes.
              </p>
            </div>

            {/* Premium detailed wired SVG brake disc icon */}
            <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 w-24 h-24 md:w-32 md:h-32 text-linear-text-muted/15 group-hover:text-linear-accent/35 transition-all duration-700 pointer-events-none">
              <svg className="w-full h-full group-hover:rotate-45 transition-transform duration-1000 ease-out" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                {/* Outer Rotors */}
                <circle cx="50" cy="50" r="42" strokeDasharray="3 2" />
                <circle cx="50" cy="50" r="41" />
                <circle cx="50" cy="50" r="35" strokeDasharray="6 3" />
                
                {/* Inner hub */}
                <circle cx="50" cy="50" r="16" />
                <circle cx="50" cy="50" r="8" strokeWidth="1.5" />
                
                {/* Lug nut holes */}
                <circle cx="50" cy="40" r="2" fill="currentColor" />
                <circle cx="50" cy="60" r="2" fill="currentColor" />
                <circle cx="40" cy="50" r="2" fill="currentColor" />
                <circle cx="60" cy="50" r="2" fill="currentColor" />

                {/* Brake venting slot lines */}
                <path d="M 50 18 A 32 32 0 0 1 72 28" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 50 82 A 32 32 0 0 1 28 72" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 18 50 A 32 32 0 0 1 28 28" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M 82 50 A 32 32 0 0 1 72 72" strokeWidth="0.8" strokeLinecap="round" />
                
                {/* Brake Caliper (Étrier) */}
                <path d="M 15 25 C 10 35 10 65 15 75 C 22 75 24 72 20 62 C 18 53 18 47 20 38 C 24 28 22 25 15 25 Z" fill="currentColor" fillOpacity="0.05" strokeWidth="1.5" stroke="currentColor" />
              </svg>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] font-semibold text-linear-text-muted group-hover:text-linear-text-primary transition-colors mt-4">
              <span>Voir les plaquettes et disques</span>
              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Bloc 2 (Standard) : Filtration & Vidange */}
          <div 
            onClick={() => navigate("/products?category=filtration")}
            className="linear-glass rounded-2xl p-6 md:p-8 hover:border-[#5E6AD2] hover:shadow-[0_0_30px_rgba(94,106,210,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative min-h-[240px]"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/2 rounded-full blur-[30px] pointer-events-none group-hover:bg-amber-500/5 transition-colors duration-300" />
            
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Entretien moteur
              </span>
              <h3 className="text-lg font-bold text-linear-text-primary tracking-editorial mt-3 mb-2">
                Filtration & Vidange
              </h3>
              <p className="text-xs text-linear-text-muted leading-relaxed">
                Huiles synthétiques de grade compétition et filtres à haute efficacité pour préserver la mécanique des frictions.
              </p>
            </div>

            {/* Wired Oil Drop Icon */}
            <div className="absolute right-4 bottom-4 w-20 h-20 text-linear-text-muted/15 group-hover:text-amber-400/30 transition-all duration-700 pointer-events-none">
              <svg className="w-full h-full transform group-hover:-translate-y-1 group-hover:scale-105 transition-all duration-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                {/* Oil canister outline */}
                <path d="M30 40 L30 80 A 10 10 0 0 0 40 90 L60 90 A 10 10 0 0 0 70 80 L70 40 L65 40 L62 25 L38 25 L35 40 Z" />
                <path d="M40 25 L40 18 L60 18 L60 25" />
                {/* Decorative fluid lines inside */}
                <path d="M35 55 Q 50 65 65 55" strokeDasharray="3 2" />
                <path d="M35 65 Q 50 75 65 65" />
                {/* Glowing drop */}
                <path d="M50 35 C50 35 55 43 55 46 C55 49 52 51 50 51 C48 51 45 49 45 46 C45 43 50 35 50 35 Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1" />
              </svg>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-linear-text-muted group-hover:text-linear-text-primary transition-colors mt-4">
              <span>Découvrir l'entretien</span>
              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Bloc 3 (Standard) : Liaison au Sol */}
          <div 
            onClick={() => navigate("/products?category=liaison-sol")}
            className="linear-glass rounded-2xl p-6 md:p-8 hover:border-[#5E6AD2] hover:shadow-[0_0_30px_rgba(94,106,210,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative min-h-[240px]"
          >
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/2 rounded-full blur-[30px] pointer-events-none group-hover:bg-blue-500/5 transition-colors duration-300" />

            <div className="relative z-10">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                Dynamique & Châssis
              </span>
              <h3 className="text-lg font-bold text-linear-text-primary tracking-editorial mt-3 mb-2">
                Liaison au Sol
              </h3>
              <p className="text-xs text-linear-text-muted leading-relaxed">
                Amortisseurs à gaz, ressorts courts et triangles renforcés pour une précision directionnelle ultime et une tenue de route irréprochable.
              </p>
            </div>

            {/* Wired Shock Absorber Icon */}
            <div className="absolute right-4 bottom-4 w-20 h-20 text-linear-text-muted/15 group-hover:text-blue-400/35 transition-all duration-700 pointer-events-none">
              <svg className="w-full h-full origin-bottom group-hover:scale-y-90 transition-transform duration-500" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                {/* Shock absorber body */}
                <rect x="47" y="10" width="6" height="30" rx="2" />
                <rect x="44" y="40" width="12" height="38" rx="2" fill="currentColor" fillOpacity="0.05" />
                <line x1="50" y1="78" x2="50" y2="88" strokeWidth="2" />
                {/* Top and bottom mounts */}
                <circle cx="50" cy="8" r="4" strokeWidth="1.5" />
                <circle cx="50" cy="92" r="4" strokeWidth="1.5" />
                {/* Springs winding */}
                <path d="M40 20 Q50 25 60 20 Q50 15 40 20" />
                <path d="M40 28 Q50 33 60 28 Q50 23 40 28" />
                <path d="M40 36 Q50 41 60 36 Q50 31 40 36" />
                <path d="M40 44 Q50 49 60 44 Q50 39 40 44" />
                <path d="M40 52 Q50 57 60 52 Q50 47 40 52" />
                <path d="M40 60 Q50 65 60 60" />
              </svg>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-linear-text-muted group-hover:text-linear-text-primary transition-colors mt-4">
              <span>Explorer la suspension</span>
              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Bloc 4 (Double largeur) : Électricité */}
          <div 
            onClick={() => navigate("/products?category=electricite")}
            className="linear-glass rounded-2xl p-6 md:p-8 hover:border-[#5E6AD2] hover:shadow-[0_0_30px_rgba(94,106,210,0.12)] transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden relative min-h-[240px] md:col-span-2"
          >
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors duration-300" />
            
            <div className="max-w-md relative z-10">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Énergie & Démarrage
              </span>
              <h3 className="text-lg md:text-xl font-bold text-linear-text-primary tracking-editorial mt-3 mb-2">
                Électricité & Allumage
              </h3>
              <p className="text-xs text-linear-text-muted leading-relaxed">
                Alternateurs à haut rendement, batteries AGM durables de dernière génération et bougies d'allumage haute performance (iridium/platine) pour un allumage instantané et une charge stabilisée.
              </p>
            </div>

            {/* Wired Battery / Electric Bolt Icon */}
            <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 w-24 h-24 md:w-32 md:h-32 text-linear-text-muted/15 group-hover:text-indigo-400/35 transition-all duration-700 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
                {/* Battery outer block */}
                <rect x="25" y="32" width="50" height="42" rx="4" fill="currentColor" fillOpacity="0.03" />
                {/* Battery terminals */}
                <rect x="32" y="24" width="8" height="8" rx="1" />
                <rect x="60" y="24" width="8" height="8" rx="1" />
                {/* Battery markings */}
                <path d="M 36 18 L 36 22" strokeWidth="1.5" />
                <path d="M 62 18 L 66 18" strokeWidth="1.5" />
                <path d="M 64 16 L 64 20" strokeWidth="1.5" />
                {/* Electric Shock Bolt */}
                <path d="M52 38 L42 52 L49 52 L45 68 L57 50 L50 50 Z" fill="currentColor" fillOpacity="0.15" strokeWidth="1.5" className="group-hover:scale-110 origin-center transition-transform duration-500" />
                {/* Electric rays */}
                <circle cx="50" cy="52" r="28" strokeDasharray="3 4" strokeWidth="0.8" />
              </svg>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-linear-text-muted group-hover:text-linear-text-primary transition-colors mt-4">
              <span>Voir les batteries et allumage</span>
              <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          
        </div>
      </section>

      {/* SECTION E: Le Service de Rassurance Technique (Aide au choix) */}
      <section className="linear-glass rounded-2xl p-8 border border-linear-border/80 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 md:gap-14">
        {/* Soft background purple glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-linear-accent/6 rounded-full blur-[80px] pointer-events-none z-0" />
        
        {/* Text Area */}
        <div className="flex-1 text-left relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-linear-accent/20 bg-linear-accent/5 mb-5">
            <span className="text-[10px] font-bold text-linear-accent uppercase tracking-wider">
              Contrôle Expert Garanti
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-editorial text-linear-text-primary mb-4">
            Un doute ? Nos experts contrôlent votre commande.
          </h2>
          <p className="text-xs md:text-sm text-linear-text-secondary leading-relaxed mb-6">
            Entrez votre numéro de châssis (VIN) lors de la commande. Notre équipe technique vérifie manuellement la compatibilité de chaque pièce avec votre véhicule avant l'expédition pour éliminer tout risque d'erreur de montage.
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 text-xs text-linear-text-muted">
              <span className="text-emerald-400 mt-0.5">✔</span>
              <span><strong>Où trouver le VIN ?</strong> Il figure à la ligne <strong>(E)</strong> de votre carte grise ou au bas de votre pare-brise côté conducteur.</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-linear-text-muted">
              <span className="text-emerald-400 mt-0.5">✔</span>
              <span><strong>Sécurité constructeur :</strong> Base de données OEM actualisée quotidiennement.</span>
            </div>
          </div>
        </div>

        {/* Live Simulator Widget Area */}
        <div className="w-full max-w-md bg-black/45 rounded-xl border border-linear-border/60 p-6 relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-linear-text-muted tracking-wider uppercase">
              Simulateur de contrôle de VIN
            </span>
            <span className="flex items-center justify-center w-2 h-2 rounded-full bg-linear-accent animate-pulse" />
          </div>
          
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-semibold text-linear-text-muted tracking-wider uppercase">
              Saisir un VIN (17 Caractères)
            </label>
            
            <div className="relative">
              <input
                type="text"
                placeholder="VF33H9HZC..."
                value={vinNumber}
                onChange={handleVinChange}
                maxLength={20}
                className="w-full bg-black/40 border border-linear-border rounded-lg py-2.5 pl-3.5 pr-10 text-sm font-mono text-linear-text-primary placeholder-linear-text-muted/50 focus:outline-none focus:border-linear-border-focus focus:ring-1 focus:ring-linear-accent/30 transition-all uppercase"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {vinStatus.type === "success" && (
                  <span className="text-emerald-400 font-bold">✔</span>
                )}
                {vinStatus.type === "error" && (
                  <span className="text-red-400 font-bold">✘</span>
                )}
                {vinStatus.type === "warning" && (
                  <span className="text-amber-400 font-bold">!</span>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Area */}
          {vinStatus.type !== "idle" && (
            <div className={`p-3 rounded-lg border text-xs leading-normal transition-all ${
              vinStatus.type === "success" ? "bg-emerald-500/5 text-emerald-300 border-emerald-500/15" :
              vinStatus.type === "error" ? "bg-red-500/5 text-red-300 border-red-500/15" :
              "bg-amber-500/5 text-amber-300 border-amber-500/15"
            }`}>
              {vinStatus.message}
            </div>
          )}
          
          <div className="bg-white/[0.01] border border-linear-border/30 rounded-lg p-3 text-[11px] text-linear-text-muted leading-relaxed">
            💡 Saisissez un numéro de châssis fictif à 17 chiffres et lettres (ex: <code className="font-mono text-linear-text-primary select-all">VF33A9HZCSIMULE12</code>) pour tester la validation en temps réel.
          </div>
        </div>
      </section>

    </div>
  );
}
