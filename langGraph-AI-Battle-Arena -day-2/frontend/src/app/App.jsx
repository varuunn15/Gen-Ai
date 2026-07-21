import { useState, useEffect, useRef } from 'react'
import {
  Send,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Scale,
  MessageSquare,
  Sparkles,
  Code,
  Cpu,
  AlertCircle,
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import './App.css'

// Helper component to render code blocks and text segments beautifully
const RenderContent = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-300">
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          // extract language and code content
          const match = part.match(/```(\w*)\n([\s\S]*?)```/);
          const lang = match ? match[1] : '';
          const code = match ? match[2] : part.slice(3, -3);
          return (
            <div key={i} className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs shadow-inner">
              {lang && (
                <div className="bg-slate-900/80 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800/60 flex justify-between items-center">
                  <span>{lang}</span>
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-emerald-400 custom-scrollbar">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {part}
          </p>
        );
      })}
    </div>
  );
};

// Quick starter suggestions
const STARTER_PROMPTS = [
  "Write an code for Factorial function in js",
  "Implement Fibonacci sequence in JS",
  "Design a modern dark card layout with tailwind",
  "Compare useState vs useReducer in React"
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [backendChecking, setBackendChecking] = useState(true);
  const [copiedId, setCopiedId] = useState(null); // 'messageId-solutionA' or 'messageId-solutionB'
  const [expandedCards, setExpandedCards] = useState({}); // { 'messageId-solutionA': boolean }
  const [judgeFeedback, setJudgeFeedback] = useState({}); // { messageId: 'up' | 'down' }

  const chatEndRef = useRef(null);

  // Check connection to local backend
  const checkBackend = async () => {
    setBackendChecking(true);
    try {
      const response = await fetch('http://localhost:3000/');
      if (response.ok) {
        setBackendConnected(true);
      } else {
        setBackendConnected(false);
      }
    } catch (e) {
      setBackendConnected(false);
    } finally {
      setBackendChecking(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Simulate token-by-token text streaming in frontend
  const streamText = (fullText, onChunk, speed = 12) => {
    return new Promise((resolve) => {
      if (!fullText) {
        resolve();
        return;
      }
      let index = 0;
      const words = fullText.split(/(\s+)/); // split keeping spaces
      const interval = setInterval(() => {
        if (index >= words.length) {
          clearInterval(interval);
          resolve();
          return;
        }
        onChunk((prev) => prev + words[index]);
        index++;
      }, speed);
    });
  };

  // Fallback Mock Data Generator
  const getMockResponse = (problem) => {
    const query = problem.toLowerCase();
    if (query.includes('factorial')) {
      return {
        solution_1: `Here is the iterative solution for calculating the factorial of a number in JavaScript.

\`\`\`javascript
function factorialIterative(n) {
  if (n < 0) return undefined;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Example usage:
console.log(factorialIterative(5)); // 120
\`\`\`

### Complexity:
- **Time Complexity:** O(n) - simple single loop.
- **Space Complexity:** O(1) - uses constant memory.`,
        solution_2: `Here is a recursive solution for calculating the factorial of a number in JavaScript with a guard clause and tail recursion.

\`\`\`javascript
function factorialRecursive(n, accumulator = 1) {
  if (n < 0) return undefined;
  if (n === 0 || n === 1) return accumulator;
  return factorialRecursive(n - 1, n * accumulator);
}

// Example usage:
console.log(factorialRecursive(5)); // 120
\`\`\`

### Complexity:
- **Time Complexity:** O(n) - linear recursive depth.
- **Space Complexity:** O(n) due to the call stack depth, unless tail-call optimization is fully supported by the engine (not standard in V8/Node).`,
        judge: {
          solution_1_score: 9,
          solution_2_score: 8,
          solution_1_reasoning: "The iterative solution is highly robust and avoids call stack size limitations, making it safer for general-purpose execution in JavaScript. The implementation is clean and includes an edge-case guard.",
          solution_2_reasoning: "The recursive solution utilizes tail recursion, which is elegant. However, tail call optimization is not widely supported in modern JS runtimes, making recursion risky for large inputs. It scores slightly lower due to call stack risks."
        }
      };
    } else if (query.includes('fibonacci')) {
      return {
        solution_1: `Here is a recursive implementation of Fibonacci in JavaScript.

\`\`\`javascript
function fibonacciRecursive(n) {
  if (n <= 1) return n;
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// Example usage:
console.log(fibonacciRecursive(6)); // 8
\`\`\`

### Complexity:
- **Time Complexity:** O(2^n) - exponential branching.
- **Space Complexity:** O(n) due to call stack.`,
        solution_2: `Here is an iterative implementation of Fibonacci in JavaScript using dynamic programming (tabulation) to achieve linear time complexity and constant space.

\`\`\`javascript
function fibonacciIterative(n) {
  if (n <= 1) return n;
  let prev2 = 0;
  let prev1 = 1;
  let current = 0;
  
  for (let i = 2; i <= n; i++) {
    current = prev1 + prev2;
    prev2 = prev1;
    prev1 = current;
  }
  return current;
}

// Example usage:
console.log(fibonacciIterative(6)); // 8
\`\`\`

### Complexity:
- **Time Complexity:** O(n) - linear scan.
- **Space Complexity:** O(1) - only stores last two values.`,
        judge: {
          solution_1_score: 4,
          solution_2_score: 10,
          solution_1_reasoning: "The recursive implementation is highly inefficient. Its exponential time complexity O(2^n) makes it unusable for any index larger than 30-40, which will freeze the call stack.",
          solution_2_reasoning: "The iterative tabulation approach is highly optimized. It runs in linear O(n) time and uses O(1) space, avoiding stack overflow and storing only essential state. It is production ready."
        }
      };
    } else if (query.includes('tailwind') || query.includes('card') || query.includes('layout')) {
      return {
        solution_1: `Here is a clean, modern card layout in HTML and Tailwind CSS with custom shadow and glassmorphism styling.

\`\`\`html
<div class="max-w-md mx-auto rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl hover:shadow-teal-500/10 transition-all duration-300">
  <div class="relative h-48 bg-gradient-to-tr from-teal-500 to-indigo-600">
    <span class="absolute top-4 right-4 bg-slate-950/75 text-teal-400 text-xs px-2.5 py-1 rounded-full border border-teal-500/20 backdrop-blur-sm">Featured</span>
  </div>
  <div class="p-6">
    <h3 class="text-xl font-semibold text-white tracking-tight">Interactive UI Elements</h3>
    <p class="mt-2 text-sm text-slate-400 leading-relaxed">Leverage the power of Tailwind utility classes to construct beautiful interfaces in seconds.</p>
    <button class="mt-5 w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-medium py-2 rounded-lg transition-colors cursor-pointer">Learn More</button>
  </div>
</div>
\`\`\`

### Key Features:
- Smooth custom border hover effect
- Glassmorphism badge styling
- Dynamic gradient header`,
        solution_2: `Here is a minimal design card layout focusing on typography, whitespace, and soft subtle shadows using Tailwind CSS.

\`\`\`html
<div class="max-w-sm mx-auto rounded-lg bg-white border border-slate-100 shadow-md p-6 hover:-translate-y-1 transition-transform duration-300">
  <div class="flex items-center space-x-4">
    <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
      <svg class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </div>
    <div>
      <h4 class="text-md font-bold text-slate-900">Modular Architecture</h4>
      <p class="text-xs text-slate-500">Design Systems</p>
    </div>
  </div>
  <p class="mt-4 text-sm text-slate-600 leading-relaxed">Emphasize negative space and high contrast typography over loaded background patterns. This results in premium visual clarity.</p>
  <div class="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
    <span class="text-indigo-600 font-semibold cursor-pointer">Read guidelines</span>
    <span class="text-slate-400">5 min read</span>
  </div>
</div>
\`\`\`

### Key Features:
- Flex-based layout aligning icons and typography
- Clean border-t separator
- Modern interactive hover lift effect`,
        judge: {
          solution_1_score: 9,
          solution_2_score: 9,
          solution_1_reasoning: "Solution 1 is a brilliant representation of a dark-mode card, integrating complex gradient fills and modern shadow glows which look excellent on darker palettes.",
          solution_2_reasoning: "Solution 2 showcases clean layout hierarchy and soft shadows perfectly adapted for a light-themed interface. Since both designs excel at their intended style (dark vs light theme), this is a solid tie."
        }
      };
    } else {
      return {
        solution_1: `Here is Solution A for your request: "${problem}".

This option focuses on structured, deep analytical steps:
1. **Initial Assessment**: Breaking down the input requirements.
2. **Modular Design**: Formulating discrete logical blocks to ensure long-term stability.
3. **Execution**: Running validation checks at each stage.
4. **Conclusion**: Returning highly structured outputs.

This is recommended for complex architectures requiring maximum detail and step-by-step logic.`,
        solution_2: `Here is Solution B for your request: "${problem}".

This option prioritizes a concise, action-oriented approach:
- **Direct Answer**: Cut through technical overhead to deliver the answer quickly.
- **Simplicity**: Focus on standard, highly-readable paradigms.
- **Maintainability**: Reduced code paths mean easier debugging.

This is ideal for fast iterations and clean readability.`,
        judge: {
          solution_1_score: 8,
          solution_2_score: 9,
          solution_1_reasoning: "Solution A is comprehensive and structured, but is slightly verbose and includes general details that could be condensed.",
          solution_2_reasoning: "Solution B is highly concise, direct, and answers the query immediately. It presents information in bullet points, which greatly increases reading comprehension. Solution B is recommended."
        }
      };
    }
  };

  // Submit Prompt Handler
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userPrompt = input;
    setInput('');
    setIsGenerating(true);

    const messageId = Date.now().toString();

    // 1. Add User Message
    const newUserMsg = {
      id: messageId + '-user',
      role: 'user',
      content: userPrompt
    };

    // 2. Add Assistant Loading Message
    const newAssistantMsg = {
      id: messageId + '-assistant',
      role: 'assistant',
      problem: userPrompt,
      solution1: '',
      solution2: '',
      solution1Full: '',
      solution2Full: '',
      judge: null,
      judgeFull: null,
      status: 'loading_solutions',
      winner: null
    };

    setMessages((prev) => [...prev, newUserMsg, newAssistantMsg]);

    let finalSolution1 = '';
    let finalSolution2 = '';
    let finalJudge = null;
    let isMock = false;

    // 3. Request data
    try {
      if (backendConnected) {
        const response = await fetch('http://localhost:3000/invoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ input: userPrompt })
        });

        if (!response.ok) {
          throw new Error('Server returned error status');
        }

        const data = await response.json();
        if (data.success && data.result) {
          finalSolution1 = data.result.solution_1 || 'No solution generated.';
          finalSolution2 = data.result.solution_2 || 'No solution generated.';
          finalJudge = data.result.judge || {
            solution_1_score: 0,
            solution_2_score: 0,
            solution_1_reasoning: 'Error scoring solutions.',
            solution_2_reasoning: 'Error scoring solutions.'
          };
        } else {
          throw new Error('Invalid backend data format');
        }
      } else {
        // Run in mock demo mode
        isMock = true;
        await new Promise((r) => setTimeout(r, 1500)); // simulate network delay
        const mockResult = getMockResponse(userPrompt);
        finalSolution1 = mockResult.solution_1;
        finalSolution2 = mockResult.solution_2;
        finalJudge = mockResult.judge;
      }
    } catch (err) {
      console.error(err);
      // fallback to mock on error rather than breaking
      isMock = true;
      const mockResult = getMockResponse(userPrompt);
      finalSolution1 = mockResult.solution_1;
      finalSolution2 = mockResult.solution_2;
      finalJudge = mockResult.judge;
    }

    // 4. Update state to streaming solutions
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId + '-assistant'
          ? {
              ...msg,
              status: 'streaming_solutions',
              solution1Full: finalSolution1,
              solution2Full: finalSolution2,
              judgeFull: finalJudge,
              isDemoMode: isMock
            }
          : msg
      )
    );

    // 5. Stream Solution 1 and Solution 2 in parallel
    let stream1Completed = false;
    let stream2Completed = false;

    const runStream1 = streamText(finalSolution1, (chunkUpdate) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId + '-assistant'
            ? { ...msg, solution1: chunkUpdate(msg.solution1) }
            : msg
        )
      );
    });

    const runStream2 = streamText(finalSolution2, (chunkUpdate) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId + '-assistant'
            ? { ...msg, solution2: chunkUpdate(msg.solution2) }
            : msg
        )
      );
    });

    await Promise.all([runStream1, runStream2]);

    // 6. Update state to loading judge (thinking block)
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId + '-assistant'
          ? { ...msg, status: 'loading_judge' }
          : msg
      )
    );

    // Simulated short delay for Judge's evaluation processing
    await new Promise((r) => setTimeout(r, 1500));

    // 7. Update state to streaming judge
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId + '-assistant'
          ? {
              ...msg,
              status: 'streaming_judge',
              judge: {
                solution_1_score: finalJudge.solution_1_score,
                solution_2_score: finalJudge.solution_2_score,
                solution_1_reasoning: '',
                solution_2_reasoning: ''
              }
            }
          : msg
      )
    );

    // Stream Judge reasoning 1 & 2
    const runStreamJudge1 = streamText(finalJudge.solution_1_reasoning, (chunkUpdate) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId + '-assistant'
            ? {
                ...msg,
                judge: {
                  ...msg.judge,
                  solution_1_reasoning: chunkUpdate(msg.judge.solution_1_reasoning)
                }
              }
            : msg
        )
      );
    });

    const runStreamJudge2 = streamText(finalJudge.solution_2_reasoning, (chunkUpdate) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId + '-assistant'
            ? {
                ...msg,
                judge: {
                  ...msg.judge,
                  solution_2_reasoning: chunkUpdate(msg.judge.solution_2_reasoning)
                }
              }
            : msg
        )
      );
    });

    await Promise.all([runStreamJudge1, runStreamJudge2]);

    // 8. Decide Winner and set Status to Done
    let winner = 'tie';
    if (finalJudge.solution_1_score > finalJudge.solution_2_score) {
      winner = 'solution_1';
    } else if (finalJudge.solution_2_score > finalJudge.solution_1_score) {
      winner = 'solution_2';
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId + '-assistant'
          ? {
              ...msg,
              status: 'done',
              winner
            }
          : msg
      )
    );

    setIsGenerating(false);
  };

  // Click handler to select starter prompts
  const selectStarter = (prompt) => {
    if (isGenerating) return;
    setInput(prompt);
  };

  // Copy to Clipboard utility
  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle Collapse / Expand
  const toggleCollapse = (key) => {
    setExpandedCards((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Handle Feedback
  const handleFeedback = (messageId, rating) => {
    setJudgeFeedback((prev) => ({
      ...prev,
      [messageId]: rating
    }));
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Background Ambient Mesh Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none"></div>
      </div>

      {/* Header Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-teal-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-teal-500/10 flex items-center justify-center text-slate-950">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5">
              AI Battle Arena
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">DUAL-SOLUTION COMPARATOR & JUDGE</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection status indicator */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800/80 rounded-full px-3 py-1 text-xs">
            {backendChecking ? (
              <span className="flex items-center space-x-1.5 text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking server...</span>
              </span>
            ) : backendConnected ? (
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-medium text-[11px]">Server Connected</span>
              </span>
            ) : (
              <button 
                onClick={checkBackend}
                className="flex items-center space-x-1.5 text-amber-500 hover:text-amber-400 cursor-pointer"
                title="Click to retry connecting"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-medium text-[11px] flex items-center gap-1">
                  Demo Mode (Offline) <RefreshCw className="w-2.5 h-2.5" />
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col overflow-hidden z-10">
        
        {messages.length === 0 ? (
          /* Landing Screen */
          <div className="flex-1 flex flex-col justify-center items-center py-12 max-w-2xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 px-3 py-1.5 rounded-full text-xs text-teal-400">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-medium">Powered by LangGraph & Gemini</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Evaluate AI Solutions with an <br/>
                <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Automated Judge</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                Submit any question or task. We will generate two solutions concurrently using <strong className="text-slate-200">Mistral</strong> and <strong className="text-slate-200">Cohere</strong>, then invoke a <strong className="text-slate-200">Gemini Judge</strong> to score them and recommend the absolute best choice.
              </p>
            </div>

            {/* Quick Starters */}
            <div className="w-full space-y-3">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Select a starter prompt</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectStarter(prompt)}
                    className="text-left bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-teal-500/30 rounded-xl p-3.5 text-xs text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Cpu className="w-3.5 h-3.5 text-slate-600 group-hover:text-teal-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat History Feed */
          <div className="flex-1 space-y-8 overflow-y-auto pr-1 custom-scrollbar pb-24">
            {messages.map((message) => {
              if (message.role === 'user') {
                return (
                  /* User Message */
                  <div key={message.id} className="flex justify-end animate-fade-in">
                    <div className="max-w-[85%] bg-slate-900 border border-slate-800/80 rounded-2xl rounded-tr-none px-4 py-3 shadow-md">
                      <div className="text-xs font-semibold text-teal-400 mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>You</span>
                      </div>
                      <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                );
              }

              /* Assistant response block */
              const sol1Key = `${message.id}-sol1`;
              const sol2Key = `${message.id}-sol2`;
              const isSol1Expanded = expandedCards[sol1Key] !== false; // defaults to expanded
              const isSol2Expanded = expandedCards[sol2Key] !== false; // defaults to expanded

              return (
                <div key={message.id} className="space-y-6 animate-fade-in">
                  
                  {/* Status Banner */}
                  <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-900 pb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Arena Battle Session</span>
                      {message.isDemoMode && (
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px]">Demo Mode</span>
                      )}
                    </div>
                    <div>
                      {message.status === 'loading_solutions' && <span className="text-indigo-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Models generating...</span>}
                      {message.status === 'streaming_solutions' && <span className="text-indigo-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Solutions streaming...</span>}
                      {message.status === 'loading_judge' && <span className="text-purple-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Solutions ready. Judge reading...</span>}
                      {message.status === 'streaming_judge' && <span className="text-teal-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Judge verdict streaming...</span>}
                      {message.status === 'done' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Verdict Decided</span>}
                    </div>
                  </div>

                  {/* Solutions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Solution A Card */}
                    <div
                      aria-label="Solution A"
                      className={`relative flex flex-col rounded-2xl border bg-slate-900/40 backdrop-blur-sm transition-all duration-500 ${
                        message.winner === 'solution_1'
                          ? 'border-emerald-500/40 bg-emerald-950/5 winner-card-glow shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                          : message.winner === 'solution_2'
                          ? 'border-slate-800/60 opacity-60'
                          : 'border-slate-800/80 hover:border-slate-700/80 shadow-md'
                      }`}
                    >
                      {/* Badge / Header */}
                      <div className="px-4 py-3 flex justify-between items-center bg-slate-900/60 border-b border-slate-800/50 rounded-t-2xl">
                        <div className="flex items-center space-x-2">
                          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                            SOLUTION A
                          </span>
                          <span className="text-xs font-semibold text-slate-300">Mistral 7B</span>
                          {message.winner === 'solution_1' && (
                            <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              <Check className="w-2.5 h-2.5" /> SELECTED BEST
                            </span>
                          )}
                        </div>
                        {message.solution1 && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => copyToClipboard(message.solution1, `${message.id}-copyA`)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors cursor-pointer"
                              title="Copy code"
                            >
                              {copiedId === `${message.id}-copyA` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-4 flex-1 flex flex-col">
                        {message.status === 'loading_solutions' ? (
                          /* Skeleton loader */
                          <div className="space-y-3 animate-pulse py-2">
                            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                            <div className="h-20 bg-slate-800/50 rounded-lg w-full"></div>
                            <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                          </div>
                        ) : (
                          <div className={`flex-1 relative ${!isSol1Expanded ? 'max-h-[300px] overflow-hidden' : ''}`}>
                            <RenderContent text={message.solution1} />
                            
                            {/* Collapse Shadow Overlay */}
                            {!isSol1Expanded && message.solution1.length > 500 && (
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                            )}
                          </div>
                        )}

                        {/* Expand / Collapse Button */}
                        {message.status !== 'loading_solutions' && message.solution1.length > 500 && (
                          <button
                            onClick={() => toggleCollapse(sol1Key)}
                            className="mt-4 w-full py-1.5 flex items-center justify-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:bg-slate-800/40 rounded-lg border border-slate-800/80 transition-colors cursor-pointer"
                          >
                            {isSol1Expanded ? (
                              <>
                                <span>Show Less</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Show More</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Solution B Card */}
                    <div
                      aria-label="Solution B"
                      className={`relative flex flex-col rounded-2xl border bg-slate-900/40 backdrop-blur-sm transition-all duration-500 ${
                        message.winner === 'solution_2'
                          ? 'border-emerald-500/40 bg-emerald-950/5 winner-card-glow shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                          : message.winner === 'solution_1'
                          ? 'border-slate-800/60 opacity-60'
                          : 'border-slate-800/80 hover:border-slate-700/80 shadow-md'
                      }`}
                    >
                      {/* Badge / Header */}
                      <div className="px-4 py-3 flex justify-between items-center bg-slate-900/60 border-b border-slate-800/50 rounded-t-2xl">
                        <div className="flex items-center space-x-2">
                          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                            SOLUTION B
                          </span>
                          <span className="text-xs font-semibold text-slate-300">Cohere Command</span>
                          {message.winner === 'solution_2' && (
                            <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                              <Check className="w-2.5 h-2.5" /> SELECTED BEST
                            </span>
                          )}
                        </div>
                        {message.solution2 && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => copyToClipboard(message.solution2, `${message.id}-copyB`)}
                              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors cursor-pointer"
                              title="Copy code"
                            >
                              {copiedId === `${message.id}-copyB` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-4 flex-1 flex flex-col">
                        {message.status === 'loading_solutions' ? (
                          /* Skeleton loader */
                          <div className="space-y-3 animate-pulse py-2">
                            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                            <div className="h-20 bg-slate-800/50 rounded-lg w-full"></div>
                            <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                          </div>
                        ) : (
                          <div className={`flex-1 relative ${!isSol2Expanded ? 'max-h-[300px] overflow-hidden' : ''}`}>
                            <RenderContent text={message.solution2} />
                            
                            {/* Collapse Shadow Overlay */}
                            {!isSol2Expanded && message.solution2.length > 500 && (
                              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
                            )}
                          </div>
                        )}

                        {/* Expand / Collapse Button */}
                        {message.status !== 'loading_solutions' && message.solution2.length > 500 && (
                          <button
                            onClick={() => toggleCollapse(sol2Key)}
                            className="mt-4 w-full py-1.5 flex items-center justify-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:bg-slate-800/40 rounded-lg border border-slate-800/80 transition-colors cursor-pointer"
                          >
                            {isSol2Expanded ? (
                              <>
                                <span>Show Less</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Show More</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Judge Panel */}
                  <div
                    aria-label="Judge Verdict"
                    className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
                      message.status === 'loading_solutions' || message.status === 'streaming_solutions'
                        ? 'border-slate-900 bg-slate-950/20 text-slate-600'
                        : 'border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80 backdrop-blur-md shadow-lg shadow-black/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="px-5 py-3.5 flex justify-between items-center border-b border-slate-800/40 bg-slate-900/40">
                      <div className="flex items-center space-x-2.5">
                        <Scale className={`w-4 h-4 ${message.status === 'done' || message.status === 'streaming_judge' ? 'text-teal-400' : 'text-slate-600'}`} />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                          Judge Verdict
                        </span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Gemini 1.5</span>
                      </div>
                      
                      {message.winner && (
                        <div className="text-[11px] font-semibold flex items-center space-x-1 text-slate-300">
                          <span>Verdict:</span>
                          {message.winner === 'tie' ? (
                            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Draw / Tie</span>
                          ) : (
                            <span className="text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded">
                              {message.winner === 'solution_1' ? 'Solution A Wins' : 'Solution B Wins'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      {message.status === 'loading_solutions' || message.status === 'streaming_solutions' ? (
                        <div className="flex items-center justify-center py-6 text-xs font-medium space-x-2 text-slate-500">
                          <HelpCircle className="w-4 h-4 text-slate-600" />
                          <span>Waiting for models to output solutions...</span>
                        </div>
                      ) : message.status === 'loading_judge' ? (
                        /* Gavel Loading State */
                        <div className="flex flex-col items-center justify-center py-8 space-y-3">
                          <RefreshCw className="w-7 h-7 text-teal-400 animate-spin" />
                          <div className="text-center space-y-1">
                            <p className="text-xs font-semibold text-slate-200">Evaluating solutions...</p>
                            <p className="text-[10px] text-slate-500">Comparing logic, efficiency, and safety bounds</p>
                          </div>
                        </div>
                      ) : (
                        /* Judge Result Content */
                        <div className="space-y-5">
                          
                          {/* Score Comparisons */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            
                            {/* Score A */}
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40 flex items-start space-x-3">
                              <div className={`p-2 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                                message.winner === 'solution_1' 
                                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                                  : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                              }`}>
                                {message.judge?.solution_1_score}/10
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-300">Solution A (Mistral 7B)</h4>
                                <p className="text-[12px] text-slate-400 leading-relaxed font-sans">
                                  {message.judge?.solution_1_reasoning || <span className="animate-pulse">Thinking...</span>}
                                </p>
                              </div>
                            </div>

                            {/* Score B */}
                            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/40 flex items-start space-x-3">
                              <div className={`p-2 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                                message.winner === 'solution_2' 
                                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                                  : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                              }`}>
                                {message.judge?.solution_2_score}/10
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-300">Solution B (Cohere Command)</h4>
                                <p className="text-[12px] text-slate-400 leading-relaxed font-sans">
                                  {message.judge?.solution_2_reasoning || <span className="animate-pulse">Thinking...</span>}
                                </p>
                              </div>
                            </div>

                          </div>

                          {/* Confidence Meter */}
                          {message.judge && (
                            <div className="bg-slate-950/50 px-4 py-3 rounded-xl border border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="flex items-center space-x-2">
                                <Zap className="w-3.5 h-3.5 text-teal-400" />
                                <span className="text-slate-300 font-medium">Confidence Margin:</span>
                                <span className="text-slate-400">
                                  {message.judge.solution_1_score === message.judge.solution_2_score 
                                    ? 'Equally valid solutions' 
                                    : `${Math.abs(message.judge.solution_1_score - message.judge.solution_2_score) * 10}% margin`}
                                </span>
                              </div>
                              <div className="flex-1 max-w-[200px] h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-1000"
                                  style={{ 
                                    width: `${
                                      message.judge.solution_1_score === message.judge.solution_2_score 
                                        ? 50 
                                        : 50 + (message.judge.solution_1_score - message.judge.solution_2_score) * 5
                                    }%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Feedback Row */}
                          {message.status === 'done' && (
                            <div className="flex justify-between items-center pt-2 text-[11px] border-t border-slate-800/40 text-slate-500">
                              <span>Was this judge evaluation helpful?</span>
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleFeedback(message.id, 'up')}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                                    judgeFeedback[message.id] === 'up'
                                      ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                                      : 'border-slate-800 hover:bg-slate-900 text-slate-400'
                                  }`}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(message.id, 'down')}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-center ${
                                    judgeFeedback[message.id] === 'down'
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                      : 'border-slate-800 hover:bg-slate-900 text-slate-400'
                                  }`}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}

      </main>

      {/* Floating Chat Input Section */}
      <footer className="sticky bottom-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent p-4 md:p-6 z-30 border-t border-slate-900/60 backdrop-blur-sm">
        <div className="max-w-3xl w-full mx-auto">
          
          <form onSubmit={handleSend} className="relative rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl focus-within:border-teal-500/40 focus-within:shadow-teal-500/5 transition-all duration-300 p-2 flex items-center gap-2">
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isGenerating}
              placeholder={isGenerating ? "Evaluating in progress..." : "Ask the models code implementation, comparison..."}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 disabled:opacity-50"
              aria-label="Chat Input"
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className={`p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer ${
                input.trim() && !isGenerating
                  ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-teal-500/15'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed shadow-none'
              }`}
              aria-label="Submit message"
            >
              {isGenerating ? (
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Send className="w-4.5 h-4.5" />
              )}
            </button>
            
          </form>

          <div className="mt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <span>Press Enter to send</span>
            <span>•</span>
            <span>Mistral (Sol A) + Cohere (Sol B) evaluated by Gemini (Judge)</span>
          </div>

        </div>
      </footer>

    </div>
  )
}

export default App
