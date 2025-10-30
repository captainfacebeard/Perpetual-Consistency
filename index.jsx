import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, Zap, Compass, BarChart3, Rocket } from 'lucide-react';

// --- CONFIGURATION AND GLOBAL PHRASES ---
const PHRASES = [
    "The Universe is not random. It's actively consistent.",
    "Consistency is the conservation law of information.",
    "Order is the ultimate state of low informational entropy.",
    "The only true constant is the constancy of constants."
];

// --- AUTH, FIREBASE, AND LLM ACCESS (STATIC PLACEHOLDER) ---
const useStaticSystems = () => {
    // isDynamicReady is hardcoded to true so the UI never waits.
    return { userId: 'STATIC-USER-ID', isDynamicReady: true };
};

// --- CONTENT VIEW COMPONENTS ---

const DerivationsContent = ({ isDynamicReady }) => (
    <>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 border-b pb-2 font-[Inter]">
            Core Principles & Mathematical Derivations
        </h2>
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 font-[Inter]">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4">
                1. The Consistency Metric
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                The **Perpetual Consistency Framework (PCF)** introduces the **Consistency Metric ($\mathcal{C}$)**, which quantifies the informational order of a system. A system's consistency is inversely proportional to its informational entropy ($\mathcal{V}$).
            </p>
            {/* Display Math for Consistency Metric */}
            <div className="text-center bg-gray-100 p-4 rounded-lg font-mono text-xl text-gray-800 mb-4">
                {'$$\\mathcal{C} \\equiv 1 - k \\cdot \\mathcal{V}$$'}
            </div>
            <p className="text-sm text-gray-500 mt-2">
                Where $k$ is the system-specific coupling constant, and $\mathcal{V}$ is the measure of informational variance.
            </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 font-[Inter]">
            <h3 className="text-2xl font-semibold text-indigo-700 mb-4">
                2. The Fundamental Consistency Constant
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
                The **Fundamental Consistency Constant (Lambda-C)** defines the universal, non-random pressure towards informational order, conceptually linking the **Friction Density** to the **Vacuum Energy Density**. This is the source of "active consistency."
            </p>
            {/* Display Math for Fundamental Consistency Constant */}
            <div className="text-center bg-gray-100 p-4 rounded-lg font-mono text-xl text-gray-800">
                {'$$\\Lambda_{\\mathcal{C}} = \\frac{\\rho_{\\text{Friction}}}{\\rho_{\\Lambda}}$$'}
            </div>
        </div>

        {/* Placeholder for the Cross-Disciplinary Analyst Tool */}
        <CrossDisciplinaryAnalyst isDynamicReady={isDynamicReady} />
    </>
);

const CrossDisciplinaryAnalyst = ({ isDynamicReady }) => {
    const [comparison, setComparison] = useState('');
    const [result, setResult] = useState('Select a field and a PCF concept to generate a cross-disciplinary analytic comparison.');
    const [isLoading, setIsLoading] = useState(false);

    // This is the core logic for the analytical tool
    const analyze = () => {
        setResult('Analyst is compiling data... (Simulated LLM Call)');
    };

    return (
        <div className="mt-10 p-8 bg-indigo-50 border-2 border-indigo-200 rounded-xl shadow-inner font-[Inter]">
            <h3 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3"/> Cross-Disciplinary Analyst
            </h3>
            <p className="text-gray-700 mb-4">
                Generate an analytical bridge between a PCF concept and a concept from another field of physics or mathematics. (e.g., Comparing $\mathcal{C}$ to String Theory's T-duality).
            </p>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    value={comparison}
                    onChange={(e) => setComparison(e.target.value)}
                    placeholder="E.g., Compare V to Shannon Entropy"
                    className="flex-grow p-3 border border-indigo-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                    onClick={analyze}
                    disabled={!isDynamicReady || isLoading}
                    className={`px-6 py-3 rounded-lg text-white font-semibold transition duration-300 shadow-md ${
                        !isDynamicReady || isLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                    }`}
                >
                    {isLoading ? 'Analyzing...' : 'Run Analysis'}
                </button>
            </div>

            <div className="bg-white p-4 border border-gray-200 rounded-lg min-h-[100px] whitespace-pre-wrap">
                <p className="text-gray-800 italic">{result}</p>
            </div>
        </div>
    );
};

const ImplicationsContent = () => (
    <div className="p-8 bg-white rounded-xl shadow-2xl font-[Inter]">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 font-[Inter]">
            Cosmological Implications (WIP)
        </h2>
        <p className="text-lg text-gray-700">
            This page is ready for content! (Placeholder)
        </p>
    </div>
);

const ToolsContent = () => (
    <>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 font-[Inter]">
            PCF Research Tools
        </h2>
        <div className="p-8 bg-white rounded-xl shadow-lg border border-indigo-100">
            <p className="text-lg text-gray-700">
                This section is reserved for interactive demonstratives and analysis tools.
            </p>
        </div>
    </>
);

const IntroductionContent = () => (
    <div className="p-8 bg-white rounded-xl shadow-2xl font-[Inter]">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-6 border-b pb-2">
            The Perpetual Consistency Framework
        </h2>
        <p className="text-xl text-indigo-700 font-medium mb-4">
            A proposal for a unified field theory based on informational order.
        </p>
        <p className="text-gray-700 leading-relaxed mb-6">
            The PCF posits that the fundamental nature of reality is not random but governed by a pressure towards **informational consistency**. This consistency is the deepest conservation law, driving structures from quantum particles to cosmological expansion. It reinterprets Dark Energy as the universal 'friction' against inconsistency and provides new models for Dark Matter as high-consistency informational singularities.
        </p>
        <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 italic text-gray-600 bg-indigo-50 p-4 rounded-lg">
            "{PHRASES[0]}"
        </blockquote>
    </div>
);


// --- MAIN LAYOUT AND ROUTING ---

const ContentView = ({ page, isDynamicReady }) => {
    switch (page) {
        case 'principles':
            return <DerivationsContent isDynamicReady={isDynamicReady} />;
        case 'implications':
            return <ImplicationsContent />;
        case 'tools':
            return <ToolsContent />;
        case 'resources':
            return <IntroductionContent />;
        case 'intro':
        default:
            return <IntroductionContent />;
    }
};

const NavLink = ({ icon: Icon, label, page, currentPage, onClick }) => (
    <a
        href="#"
        onClick={() => onClick(page)}
        className={`flex items-center p-3 rounded-lg transition duration-200 ${
            currentPage === page
                ? 'bg-indigo-700 text-white font-bold shadow-md'
                : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'
        }`}
    >
        <Icon className="w-5 h-5 mr-3" />
        {label}
    </a>
);


const Header = ({ title, status }) => (
    <header className="bg-indigo-800 p-4 flex justify-between items-center shadow-lg w-full">
        <div className="flex items-center">
            <Rocket className="w-8 h-8 text-white mr-3" />
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-wide">{title}</h1>
        </div>
    </header>
);

const App = () => {
    const [currentPage, setCurrentPage] = useState('intro');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Use static systems hook
    const { userId, isDynamicReady } = useStaticSystems();
    const [currentPhrase, setCurrentPhrase] = useState(PHRASES[0]);

    // Update quote on load
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * PHRASES.length);
        setCurrentPhrase(PHRASES[randomIndex]);
    }, []);

    // Function to close sidebar on link click
    const handleNavClick = (page) => {
        setCurrentPage(page);
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Mobile Sidebar Toggle Button */}
            <div className="md:hidden p-4 fixed top-0 left-0 z-50">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-indigo-800 focus:outline-none bg-white p-2 rounded-lg shadow-lg">
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar (Navigation) */}
            <aside className={`fixed z-40 md:static md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out w-64 bg-indigo-800 h-screen shadow-2xl`}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-8 border-b border-indigo-700 pb-3">PCF Hub</h2>
                    <nav className="space-y-2">
                        <NavLink icon={Globe} label="Introduction" page="intro" currentPage={currentPage} onClick={handleNavClick} />
                        <NavLink icon={Zap} label="Core Principles & Derivations" page="principles" currentPage={currentPage} onClick={handleNavClick} />
                        <NavLink icon={Compass} label="Cosmological Implications (WIP)" page="implications" currentPage={currentPage} onClick={handleNavClick} />
                        <NavLink icon={BarChart3} label="Research Tools" page="tools" currentPage={currentPage} onClick={handleNavClick} />
                    </nav>
                </div>
                
                <div className="absolute bottom-0 p-6 w-full text-xs text-indigo-400">
                    <p className="mb-1">Logged In: {userId}</p>
                    <p className="mb-1">Status: Ready</p>
                    <p className="text-indigo-300 mt-2 font-mono italic">
                         "{currentPhrase}"
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header title="Perpetual Consistency Framework Learning Hub" status={userId} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    <ContentView page={currentPage} isDynamicReady={isDynamicReady} />
                </main>
            </div>
        </div>
    );
};

export default App;