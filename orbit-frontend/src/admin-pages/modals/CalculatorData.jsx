// src/admin-pages/dashboard/modals/CalculatorModal.jsx
import {
    Delete,
    Minus as MinusIcon,
    Plus as PlusIcon,
    Divide,
    X as MultiplyIcon,
    Percent,
} from "lucide-react";
const buttons = [
    [
        { label: 'MC', value: 'memoryClear', type: 'memory', icon: null },
        { label: 'MR', value: 'memoryRecall', type: 'memory', icon: null },
        { label: 'M+', value: 'memoryAdd', type: 'memory', icon: null },
        { label: 'M-', value: 'memorySubtract', type: 'memory', icon: null }
    ],
    [
        { label: 'C', value: 'clear', type: 'clear', icon: null },
        { label: 'DEL', value: 'delete', type: 'delete', icon: <Delete className="h-4 w-4" /> },
        { label: '%', value: '%', type: 'operator', icon: <Percent className="h-4 w-4" /> },
        { label: '÷', value: '/', type: 'operator', icon: <Divide className="h-4 w-4" /> }
    ],
    [
        { label: '7', value: '7', type: 'number', icon: null },
        { label: '8', value: '8', type: 'number', icon: null },
        { label: '9', value: '9', type: 'number', icon: null },
        { label: '×', value: '*', type: 'operator', icon: <MultiplyIcon className="h-4 w-4" /> }
    ],
    [
        { label: '4', value: '4', type: 'number', icon: null },
        { label: '5', value: '5', type: 'number', icon: null },
        { label: '6', value: '6', type: 'number', icon: null },
        { label: '−', value: '-', type: 'operator', icon: <MinusIcon className="h-4 w-4" /> }
    ],
    [
        { label: '1', value: '1', type: 'number', icon: null },
        { label: '2', value: '2', type: 'number', icon: null },
        { label: '3', value: '3', type: 'number', icon: null },
        { label: '+', value: '+', type: 'operator', icon: <PlusIcon className="h-4 w-4" /> }
    ],
    [
        { label: '0', value: '0', type: 'number', icon: null },
        { label: '.', value: '.', type: 'decimal', icon: null },
        { label: '(', value: '(', type: 'parenthesis', icon: null },
        { label: ')', value: ')', type: 'parenthesis', icon: null }
    ]
];

export { buttons }