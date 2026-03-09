// src/admin-pages/dashboard/modals/CalculatorModal.jsx
import {
    X,
    Calculator,
    History,
    Move,
    Maximize2,
    Minimize2,
    Save
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

import Draggable from "react-draggable";

import { buttons } from "./CalculatorData";

const CalculatorModal = ({ onClose }) => {
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [history, setHistory] = useState([]);
    const [calcMemory, setCalcMemory] = useState(0);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [dragDisabled, setDragDisabled] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const nodeRef = useRef(null);
    const modalRef = useRef(null);
    const inputRef = useRef(null);
    const memoryRef = useRef({
        input: "",
        result: "",
        history: [],
        lastResult: null
    });

    // Save current state to memory
    const saveToMemory = useCallback(() => {
        memoryRef.current = {
            input,
            result,
            history,
            lastResult: result !== "Error" && result !== "" ? parseFloat(result) : memoryRef.current.lastResult
        };
    }, [input, result, history]);

    // Restore from memory
    const restoreFromMemory = useCallback(() => {
        const { input: memInput, result: memResult, history: memHistory } = memoryRef.current;
        if (memInput !== "") setInput(memInput);
        if (memResult !== "") setResult(memResult);
        if (memHistory.length > 0) setHistory(memHistory);
    }, []);

    // Memory functions
    const handleMemoryOperation = useCallback((operation) => {
        const currentValue = result !== "Error" && result !== "" ? parseFloat(result) : 0;

        switch (operation) {
            case 'memoryClear':
                setCalcMemory(0);
                break;
            case 'memoryRecall':
                setInput(prev => prev + calcMemory.toString());
                break;
            case 'memoryAdd':
                setCalcMemory(prev => prev + currentValue);
                break;
            case 'memorySubtract':
                setCalcMemory(prev => prev - currentValue);
                break;
        }
    }, [calcMemory, result]);

    const handleButtonClick = useCallback((value) => {
        // Handle memory operations separately
        if (typeof value === 'string' && value.startsWith('memory')) {
            handleMemoryOperation(value);
            return;
        }

        setInput(prev => {
            // Prevent multiple decimal points in the same number
            const lastNumber = prev.split(/[+\-*/()%]/).pop();
            if (value === '.' && lastNumber?.includes('.')) return prev;

            // Prevent multiple operators in a row
            if (['+', '-', '*', '/', '%'].includes(value) && ['+', '-', '*', '/', '%'].includes(prev.slice(-1))) {
                return prev.slice(0, -1) + value;
            }
            return prev + value;
        });
    }, [handleMemoryOperation]);

    const handleClear = useCallback(() => {
        setInput("");
        setResult("");
    }, []);

    const handleDelete = useCallback(() => {
        setInput(prev => prev.slice(0, -1));
    }, []);

    const handleCalculate = useCallback(() => {
        try {
            if (!input.trim()) return;

            // Basic safety check
            const sanitizedInput = input
                .replace(/[^0-9+\-*/().%\s]/g, '')
                .replace(/(\d+)%/g, '($1/100)');

            // eslint-disable-next-line no-eval
            const calculationResult = eval(sanitizedInput);

            if (!isFinite(calculationResult)) {
                setResult("Error");
                return;
            }

            const calculation = `${input} = ${calculationResult}`;

            setResult(calculationResult.toString());
            setHistory(prev => {
                const newHistory = [calculation, ...prev];
                return newHistory.slice(0, 20);
            });

            saveToMemory();
        } catch (error) {
            setResult("Error");
        }
    }, [input, saveToMemory]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isMinimized) return;

            // Calculator shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'm':
                        e.preventDefault();
                        setIsMinimized(prev => !prev);
                        break;
                    case 'h':
                        e.preventDefault();
                        setShowHistory(prev => !prev);
                        break;
                    case 's':
                        e.preventDefault();
                        saveToMemory();
                        break;
                    case 'l':
                        e.preventDefault();
                        restoreFromMemory();
                        break;
                }
                return;
            }

            // Regular calculator keys
            switch (e.key) {
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                case '+': case '-': case '*': case '.':
                case '(': case ')': case '%':
                    e.preventDefault();
                    handleButtonClick(e.key);
                    break;
                case '/':
                    e.preventDefault();
                    handleButtonClick('/');
                    break;
                case '=':
                case 'Enter':
                    e.preventDefault();
                    handleCalculate();
                    break;
                case 'Backspace':
                    e.preventDefault();
                    handleDelete();
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (isMaximized) {
                        setIsMaximized(false);
                    } else {
                        onClose();
                    }
                    break;
                case 'Delete':
                    e.preventDefault();
                    handleClear();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isMinimized, isMaximized, handleButtonClick, handleCalculate, handleDelete, handleClear, saveToMemory, restoreFromMemory, onClose]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Focus input on open
    useEffect(() => {
        if (!isMinimized) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isMinimized]);

    // Auto-save to memory before minimize
    useEffect(() => {
        if (isMinimized) {
            saveToMemory();
        }
    }, [isMinimized, saveToMemory]);

    const handleHistoryClick = (calc) => {
        const [expression] = calc.split(" = ");
        setInput(expression);
        setResult("");
    };

    const handleClearHistory = () => {
        setHistory([]);
    };

    const handleMinimize = () => {
        setIsMinimized(true);
        saveToMemory();
    };

    const handleRestore = () => {
        setIsMinimized(false);
        restoreFromMemory();
    };

    const toggleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    const getButtonClass = (button) => {
        const baseClasses = "p-3 rounded-sm text-base font-medium transition active:scale-95 ";

        if (button.type === 'clear' || button.type === 'delete') {
            return baseClasses + "bg-red-500/20 hover:bg-red-500/30 text-red-500 dark:text-red-400";
        } else if (button.type === 'operator') {
            return baseClasses + "bg-blue-500/20 dark:bg-primary/20 hover:bg-blue-500/30 dark:hover:bg-primary/30 text-blue-600 dark:text-primary";
        } else if (button.type === 'memory') {
            return baseClasses + "bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-400 text-sm";
        } else if (button.value === '=') {
            return baseClasses + "col-span-2 bg-blue-600 dark:bg-primary hover:bg-blue-700 dark:hover:bg-blue-600 text-white";
        } else {
            return baseClasses + "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700";
        }
    };

    // If minimized, show only the minimized view
    if (isMinimized) {
        return (
            <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
                <Draggable nodeRef={nodeRef} handle=".drag-handle">
                    <div
                        ref={nodeRef}
                        className="absolute pointer-events-auto"
                        style={{
                            transform: 'none',
                            left: '1rem',
                            bottom: '5rem'
                        }}
                    >
                        <div className="bg-white dark:bg-dark-light border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl w-64">
                            <div className="drag-handle p-3 border-b border-gray-200 dark:border-gray-800 cursor-move select-none hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calculator className="h-4 w-4 text-blue-600 dark:text-primary" />
                                        <span className="text-sm text-gray-900 dark:text-white font-medium">Calculator (Minimized)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={handleRestore}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                            title="Restore"
                                        >
                                            <Maximize2 className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                        </button>
                                        <button
                                            onClick={onClose}
                                            className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded"
                                            title="Close"
                                        >
                                            <X className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {memoryRef.current.input || "No input"}
                                </div>
                                <div className="text-sm text-blue-600 dark:text-primary font-medium truncate">
                                    {memoryRef.current.result || "0"}
                                </div>
                            </div>
                            <div className="p-2">
                                <div className="text-xs text-gray-500 mb-1">
                                    Memory preserved • Press Ctrl+M or click Restore
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={handleRestore}
                                        className="flex-1 px-3 py-1.5 bg-blue-100 dark:bg-primary/20 hover:bg-blue-200 dark:hover:bg-primary/30 text-blue-700 dark:text-primary text-xs rounded-sm transition"
                                    >
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => {
                                            saveToMemory();
                                            onClose();
                                        }}
                                        className="px-3 py-1.5 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-700 dark:text-red-400 text-xs rounded-sm transition"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Draggable>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 dark:bg-black/10" />

            {/* Draggable Modal Container */}
            <Draggable
                nodeRef={nodeRef}
                handle=".drag-handle"
                bounds="parent"
                disabled={dragDisabled || isMaximized}
                defaultPosition={{ x: window.innerWidth / 2 - 425, y: window.innerHeight / 2 - 300 }}
                onStart={() => setDragDisabled(false)}
            >
                <div
                    ref={nodeRef}
                    className="absolute"
                    style={{ transform: 'none' }}
                >
                    <div
                        ref={modalRef}
                        className="bg-white dark:bg-dark-light border w-[850px] border-gray-300 dark:border-gray-800 rounded-sm shadow-2xl transition-all duration-200"
                    >
                        {/* Header with drag handle */}
                        <div className="drag-handle border-b border-gray-200 dark:border-gray-800 p-3 cursor-move select-none hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors active:cursor-grabbing">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-primary/20 rounded-sm flex items-center justify-center">
                                        <Calculator className="h-5 w-5 text-blue-600 dark:text-primary" />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Drag indicator */}
                                    <Move className="h-4 w-4 text-gray-400" />

                                    <button
                                        onClick={() => saveToMemory()}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                                        title="Save to memory (Ctrl+S)"
                                    >
                                        <Save className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </button>

                                    <button
                                        onClick={() => setShowHistory(!showHistory)}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                                        title="History (Ctrl+H)"
                                    >
                                        <History className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    </button>

                                    <button
                                        onClick={handleMinimize}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm transition-colors"
                                        title="Minimize (Ctrl+M)"
                                    >
                                        <Minimize2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </button>

                                    {/* Close button */}
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-red-100 dark:hover:bg-red-500/20 rounded-sm transition-colors"
                                        title="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-3">
                            <div className="flex gap-3">
                                {/* Main Calculator */}
                                <div className={`${showHistory ? 'w-2/3' : 'w-full'}`}>
                                    {/* Memory Display - Compact */}
                                    <div className="mb-2 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-sm border border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-400 font-medium">Memory:</span>
                                            <span className="text-purple-600 dark:text-purple-400 font-mono text-sm font-semibold">
                                                {calcMemory}
                                            </span>
                                            <span className="text-gray-500">| Last: {memoryRef.current.lastResult || 'None'}</span>
                                        </div>
                                    </div>

                                    {/* Display - Reduced size */}
                                    <div className="mb-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 border border-gray-300 dark:border-gray-800 rounded-sm p-4 shadow-inner">
                                        <div
                                            ref={inputRef}
                                            tabIndex={0}
                                            className="text-right outline-none"
                                        >
                                            <div className="text-gray-600 dark:text-gray-400 text-lg mb-1 min-h-[24px] break-all font-mono">
                                                {input || "0"}
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white min-h-[40px] break-all font-mono">
                                                {result || "0"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Buttons Grid - Reduced gap */}
                                    <div className="grid grid-cols-4 gap-1.5">
                                        {buttons.map((row, rowIndex) => (
                                            row.map((button, colIndex) => (
                                                <button
                                                    key={`${rowIndex}-${colIndex}`}
                                                    onClick={() => {
                                                        if (button.type === 'clear') handleClear();
                                                        else if (button.type === 'delete') handleDelete();
                                                        else if (button.value === '=') handleCalculate();
                                                        else handleButtonClick(button.value);
                                                    }}
                                                    className={getButtonClass(button)}
                                                >
                                                    {button.icon || button.label}
                                                </button>
                                            ))
                                        ))}
                                        {/* Equals button */}
                                        <button
                                            onClick={handleCalculate}
                                            className="col-span-2 bg-blue-600 dark:bg-primary hover:bg-blue-700 dark:hover:bg-blue-600 text-white p-3 rounded-sm text-base font-medium transition active:scale-95 shadow-md"
                                        >
                                            =
                                        </button>
                                    </div>

                                    {/* Keyboard Shortcuts Help - Compact */}
                                    <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                                        <div className="grid grid-cols-4 gap-1 text-xs">
                                            <div className="text-gray-600 dark:text-gray-500">
                                                <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-[10px] border border-gray-300 dark:border-gray-700">Esc</kbd> Close
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-500">
                                                <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-[10px] border border-gray-300 dark:border-gray-700">Ctrl+M</kbd> Min
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-500">
                                                <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-[10px] border border-gray-300 dark:border-gray-700">Ctrl+S</kbd> Save
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-500">
                                                <kbd className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-[10px] border border-gray-300 dark:border-gray-700">Ctrl+H</kbd> Hist
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* History Panel - With its own scroll */}
                                {showHistory && (
                                    <div className="w-1/3 border-l border-gray-200 dark:border-gray-800 pl-3 flex flex-col max-h-[600px]">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <History className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                                <h4 className="text-gray-900 dark:text-white font-medium text-sm">History</h4>
                                            </div>
                                            <button
                                                onClick={handleClearHistory}
                                                className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                                            >
                                                Clear
                                            </button>
                                        </div>

                                        <div className="overflow-y-auto flex-1">
                                            {history.length > 0 ? (
                                                <div className="space-y-2">
                                                    {history.map((calc, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handleHistoryClick(calc)}
                                                            className="p-2 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-sm cursor-pointer transition group"
                                                        >
                                                            <div className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white break-all">
                                                                {calc.split(' = ')[0]}
                                                            </div>
                                                            <div className="text-sm text-blue-600 dark:text-primary font-medium break-all">
                                                                = {calc.split(' = ')[1]}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-6 text-gray-500 text-sm">
                                                    No history yet
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                <div>• Click to reuse</div>
                                                <div className="text-gray-500">Resets on refresh</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Draggable>
        </div>
    );
};

export default CalculatorModal;