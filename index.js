import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, setLogLevel } from 'firebase/firestore';
import { Loader2, Send, Wand2, User, Info, AlertTriangle, Search } from 'lucide-react';

// --- Global Variable Handling ---
// IMPORTANT: These variables are injected by the execution environment (like Vercel).
// We set up fallbacks, but Vercel requires them to be declared in the ENV settings.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'pcf-analyst-default-id';
const firebaseConfigString = typeof __firebase_config !== 'undefined' ? __firebase_config : '{}';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let firebaseApp, db, auth;

// --- Utility Functions ---

// 1. Exponential Backoff for API Retries
const callApiWithBackoff = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                // If it's a 4xx or 5xx error, throw to potentially trigger retry
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response;
        } catch (error) {
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000;
                console.warn(`API call failed. Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("API call failed after all retries:", error);
                throw new Error("Failed to connect to the Gemini API service.");
            }
        }
    }
};

// 2. Main API Interaction Function
const generateAnalysis = async (userPrompt, systemInstruction) => {
    const apiKey = ""; // API key is provided by the execution environment.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
    };

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    };

    try {
        const response = await callApiWithBackoff(apiUrl, options);
        const result = await response.json();
        
        const candidate = result.candidates?.[0];

        if (candidate && candidate.content?.parts?.[0]?.text) {
            const text = candidate.content.parts[0].text;
            
            // Extract grounding sources (citations)
            let sources = [];
            const groundingMetadata = candidate.groundingMetadata;
            if (groundingMetadata && groundingMetadata.groundingAttributions) {
                sources = groundingMetadata.groundingAttributions
                    .map(attribution => ({
                        uri: attribution.web?.uri,
                        title: attribution.web?.title,
                    }))
                    .filter(source => source.uri && source.title);
            }

            return { text, sources, error: null };
        } else if (result.error) {
             return { text: null, sources: [], error: result.error.message || "An unknown API error occurred." };
        } else {
            return { text: null, sources: [], error: "The response was empty or malformed." };
        }

    } catch (e) {
        return { text: null, sources: [], error: e.message || "An unrecoverable error occurred during the API call." };
    }
};


// --- React Components ---

const Message = React.memo(({ message, isUser, userId }) => {
    const icon = isUser ? <User className="w-4 h-4 text-white" /> : <Wand2 className="w-4 h-4 text-emerald-500" />;
    const bgColor = isUser ? 'bg-indigo-500 text-white' : 'bg-white shadow-md border border-gray-100 text-gray-800';
    const align = isUser ? 'self-end rounded-br-none' : 'self-start rounded-tl-none';
    
    // Convert text to Markdown for rendering
    const renderContent = (content) => {
        // Simple markdown for basic formatting (bold, links, lists)
        let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n\s*-\s/g, '<ul><li>').replace(/(\*\*|`[^`]*`)/g, '');
        // Basic link detection
        html = html.replace(/(https?:\/\/[^\s]+)/g, (url) => `<a href="${url}" target="_blank" class="text-indigo-400 hover:text-indigo-300 underline">${url.split('/')[2]}</a>`);
        
        // Simple List Cleanup
        html = html.replace(/<\/li><ul>/g, '</li></ul><ul>');
        while(html.includes('<ul><li>')) {
            html = html.replace('<ul><li>', '<li>');
            html = html.replace('<ul>', '<li>');
        }
        return html.replace(/<br>\s*<li>/g, '<li>').replace(/<ul>(.*?)<\/ul>/gs, (match) => {
            if (match.includes('<li>')) {
                return `<ul>${match}</ul>`;
            }
            return match;
        }).replace(/\n/g, '<br>');
    };
    
    return (
        <div className={`flex items-start max-w-3xl ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
            <div className={`p-3 my-2 rounded-xl text-sm transition-all duration-300 ${bgColor} ${align}`} style={{ width: 'fit-content' }}>
                <div className="flex items-center mb-1 font-semibold text-xs opacity-70">
                    <span className="mr-2 p-1 rounded-full bg-gray-900 flex items-center justify-center">
                        {icon}
                    </span>
                    {isUser ? `You (${userId})` : 'Analyst AI'}
                </div>
                <div 
                    className="prose prose-sm max-w-none break-words"
                    dangerouslySetInnerHTML={{ __html: renderContent(message.text) }}
                />
                
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs font-semibold mb-1 flex items-center"><Search className="w-3 h-3 mr-1" /> Sources:</p>
                        <ul className="list-disc list-inside text-xs space-y-0.5 ml-2">
                            {message.sources.map((source, index) => (
                                <li key={index}>
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                                        {source.title || new URL(source.uri).hostname}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {message.error && (
                    <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md text-xs flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Error: {message.error}
                    </div>
                )}
            </div>
        </div>
    );
});

const App = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [dbInstance, setDbInstance] = useState(null);
    const [error, setError] = useState(null);

    // SYSTEM INSTRUCTION for the AI Model
    const systemInstruction = "You are a 'Cross-Disciplinary Analyst AI'. Your role is to provide highly focused, actionable, and grounded analysis by synthesizing information from multiple domains (e.g., technology, finance, sociology, engineering). You MUST use the Google Search tool to ensure your data is current. Your response should be structured as a concise analysis summary, immediately followed by numbered or bulleted key findings or recommendations. ALWAYS provide your analysis based on the latest available data. Do not include introductory phrases like 'As an AI, I...' or 'I have searched for...'.";

    // --- Firebase Initialization and Authentication ---
    useEffect(() => {
        try {
            const firebaseConfig = JSON.parse(firebaseConfigString);
            if (!firebaseApp) {
                firebaseApp = initializeApp(firebaseConfig);
                db = getFirestore(firebaseApp);
                auth = getAuth(firebaseApp);
                setLogLevel('debug');
                setDbInstance(db);
            }

            const setupAuth = async () => {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (e) {
                    console.error("Firebase Auth Error:", e);
                    setError("Failed to authenticate with Firebase.");
                }
            };
            
            setupAuth();

            const unsubscribe = onAuthStateChanged(auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    console.log("Authenticated User ID:", user.uid);
                } else {
                    setUserId('anonymous'); // Fallback if sign-in fails unexpectedly
                }
            });

            return () => unsubscribe();
        } catch (e) {
            console.error("Initialization Error:", e);
            setError("Firebase Initialization Failed. Check __firebase_config.");
        }
    }, [firebaseConfigString, initialAuthToken]);

    // --- Firestore Real-Time Data Listener ---
    useEffect(() => {
        if (dbInstance && userId) {
            const path = `/artifacts/${appId}/public/data/analysis_messages`;
            const messagesRef = collection(dbInstance, path);
            const q = query(messagesRef, orderBy('timestamp', 'asc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const loadedMessages = [];
                snapshot.forEach((doc) => {
                    loadedMessages.push({ id: doc.id, ...doc.data() });
                });
                setMessages(loadedMessages);
            }, (err) => {
                console.error("Firestore Snapshot Error:", err);
                setError("Failed to load messages from Firestore.");
            });

            return () => unsubscribe();
        }
    }, [dbInstance, userId, appId]);

    // --- Message Submission and AI Generation ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || loading || !userId || !dbInstance) return;

        setLoading(true);
        setPrompt('');

        const userMessage = {
            userId: userId,
            text: trimmedPrompt,
            isUser: true,
            timestamp: serverTimestamp(),
            sources: [],
            error: null
        };

        let analystMessage = {
            userId: 'AnalystAI',
            text: 'Analyzing the request...',
            isUser: false,
            timestamp: serverTimestamp(),
            sources: [],
            error: null
        };
        
        let analystDocRef;

        try {
            // 1. Save User Message
            await addDoc(collection(dbInstance, `/artifacts/${appId}/public/data/analysis_messages`), userMessage);
            
            // 2. Create Placeholder AI Message
            analystDocRef = await addDoc(collection(dbInstance, `/artifacts/${appId}/public/data/analysis_messages`), analystMessage);

            // 3. Generate Content from Gemini API
            const { text, sources, error: apiError } = await generateAnalysis(trimmedPrompt, systemInstruction);

            // 4. Update AI Message
            if (apiError) {
                analystMessage.text = `Analysis Failed. ${apiError}`;
                analystMessage.error = apiError;
            } else {
                analystMessage.text = text;
                analystMessage.sources = sources;
            }

            // Must use setDoc with merge:true or updateDoc to replace the placeholder
            await updateDoc(analystDocRef, analystMessage);

        } catch (e) {
            console.error("Firestore or API operation failed:", e);
            // Attempt to update the AI message with the error, if possible
            if (analystDocRef) {
                 await updateDoc(analystDocRef, { 
                    text: `A system error occurred. Details: ${e.message}`,
                    error: e.message
                });
            } else {
                setError(`Failed to save messages. Error: ${e.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <header className="bg-indigo-600 text-white p-4 shadow-lg flex items-center justify-between sticky top-0 z-10">
                <h1 className="text-xl font-bold flex items-center">
                    <Wand2 className="w-5 h-5 mr-2" /> Cross-Disciplinary Analyst
                </h1>
                <div className="text-xs opacity-80 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    User ID: <span className="font-mono ml-1">{userId || 'Loading...'}</span>
                </div>
            </header>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 text-sm flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <strong>System Error:</strong> {error}
                </div>
            )}

            <main className="flex-grow overflow-y-auto p-4 space-y-4 flex flex-col items-center">
                <div className="w-full max-w-4xl flex flex-col space-y-4">
                    {messages.length === 0 && !loading ? (
                        <div className="text-center p-10 bg-white rounded-xl shadow-inner border border-dashed border-gray-200 mt-10">
                            <Info className="w-8 h-8 mx-auto text-indigo-400 mb-3" />
                            <h2 className="text-xl font-semibold text-gray-700">Start Your Analysis</h2>
                            <p className="text-gray-500">Ask the Analyst AI to synthesize information across fields. Try asking for a "market summary of renewable energy vs. traditional oil" or "a breakdown of quantum computing's social impact."</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <Message key={msg.id} message={msg} isUser={msg.isUser} userId={msg.userId} />
                        ))
                    )}
                </div>
            </main>

            <footer className="bg-white p-4 shadow-2xl sticky bottom-0 z-10">
                <form onSubmit={handleSubmit} className="flex items-center w-full max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Enter your cross-disciplinary question here..."
                        disabled={loading || !userId}
                        className="flex-grow p-3 border border-gray-300 rounded-l-xl focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={loading || !userId || prompt.trim() === ''}
                        className="bg-indigo-600 text-white p-3 rounded-r-xl hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-300 flex items-center justify-center w-24"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </form>
                <p className="text-xs text-center text-gray-400 mt-2">
                    Data saved publicly to Firestore: `/artifacts/{appId}/public/data/analysis_messages`
                </p>
            </footer>
        </div>
    );
};

export default App;
