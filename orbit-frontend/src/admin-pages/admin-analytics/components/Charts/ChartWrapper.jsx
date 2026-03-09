// components/charts/ChartWrapper.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController, // Add this
  LineElement,
  LineController, // Add this
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  DoughnutController,
  PieController,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController, // Register BarController
  LineElement,
  LineController, // Register LineController
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  DoughnutController,
  PieController
);

// Default options for dark theme
const getDefaultOptions = (type) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart',
  },
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#9ca3af',
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
        padding: 15,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleColor: '#e5e7eb',
      bodyColor: '#d1d5db',
      borderColor: '#374151',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      displayColors: true,
      callbacks: {
        label: (context) => {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== undefined) {
            label += new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(context.parsed.y);
          } else if (context.parsed !== undefined) {
            label += context.parsed;
          }
          return label;
        },
      },
    },
  },
  scales: type !== 'pie' && type !== 'doughnut' ? {
    x: {
      grid: {
        color: 'rgba(55, 65, 81, 0.3)',
        drawBorder: false,
      },
      ticks: {
        color: '#9ca3af',
        font: {
          size: 10,
          family: "'Inter', sans-serif",
        },
        maxRotation: 45,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(55, 65, 81, 0.3)',
        drawBorder: false,
      },
      ticks: {
        color: '#9ca3af',
        font: {
          size: 10,
          family: "'Inter', sans-serif",
        },
        callback: (value) => {
          if (value >= 1000) {
            return `$${(value / 1000).toFixed(0)}k`;
          }
          return `$${value}`;
        },
      },
    },
  } : {},
});

const ChartWrapper = ({
  type,
  data,
  options = {},
  className = '',
  height = '100%',
  width = '100%',
  key // Added key prop to force re-mount
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const containerRef = useRef(null);
  const [canvasKey, setCanvasKey] = useState(() =>
    `chart-canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Function to safely destroy chart
  const destroyChart = useCallback(() => {
    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
        chartInstance.current = null;
      } catch (error) {
        console.debug('Chart already destroyed or in invalid state');
      }
    }
  }, []);

  // Reset canvas when key changes
  useEffect(() => {
    if (key) {
      destroyChart();
      setCanvasKey(`chart-canvas-${key}-${Date.now()}`);
    }
  }, [key, destroyChart]);

  useEffect(() => {
    // Destroy chart on unmount
    return () => {
      destroyChart();
    };
  }, [destroyChart]);

  useEffect(() => {
    // Early return if no canvas or no data
    if (!chartRef.current || !data || !data.labels || !data.datasets) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');

    // Clean up existing chart
    destroyChart();

    // Create gradient for line charts if needed
    const enhancedData = { ...data };
    if (type === 'line' || type === 'radar') {
      enhancedData.datasets = enhancedData.datasets.map(dataset => {
        if (dataset.fill) {
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, dataset.backgroundColor || 'rgba(59, 130, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
          return {
            ...dataset,
            backgroundColor: gradient,
          };
        }
        return dataset;
      });
    }

    // Merge default options with custom options
    const mergedOptions = {
      ...getDefaultOptions(type),
      ...options,
    };

    try {
      // Create new chart instance
      chartInstance.current = new ChartJS(ctx, {
        type,
        data: enhancedData,
        options: mergedOptions,
        plugins: [
          {
            id: 'customCanvasBackgroundColor',
            beforeDraw: (chart) => {
              const { ctx, width, height } = chart;
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'transparent';
              ctx.fillRect(0, 0, width, height);
              ctx.restore();
            },
          },
        ],
      });

    } catch (error) {
      console.error('Error creating chart:', error);
      // Clear the canvas if chart creation fails
      if (ctx) {
        ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
      }
    }

    // Handle window resize
    const handleResize = () => {
      if (chartInstance.current) {
        try {
          chartInstance.current.resize();
        } catch (error) {
          console.error('Error resizing chart:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      destroyChart();
    };
  }, [type, data, options, destroyChart, canvasKey]); // Add canvasKey as dependency

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height, width }}
    >
      <canvas
        key={canvasKey} // Force new canvas when key changes
        ref={chartRef}
        className="w-full h-full"
      />

      {/* Loading overlay */}
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-light/50 rounded-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-400 text-sm">Loading chart...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Export some useful chart helpers
export const createChartConfig = (type, data, customOptions = {}) => {
  return {
    type,
    data,
    options: customOptions,
  };
};

// Predefined color palettes
export const CHART_COLORS = {
  primary: [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#8884d8', '#82ca9d', '#ff6b6b', '#4ecdc4',
    '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
  ],
  pastel: [
    '#A8E6CF', '#DCEDC1', '#FFD3B6', '#FFAAA5',
    '#FF8B94', '#D4A5A5', '#9C89B8', '#F0A6CA',
    '#B8E1FF', '#A2C5FE', '#9BE8D8', '#92E1C0',
    '#C7F9CC', '#80ED99', '#57CC99', '#38A3A5'
  ],
  dark: [
    '#1A535C', '#4ECDC4', '#FFE66D', '#FF6B6B',
    '#95E1D3', '#F38181', '#A8D8EA', '#AA96DA',
    '#FCBAD3', '#FFFFD2', '#84A9AC', '#3B6978',
    '#204051', '#BBBFCA', '#F4F4F4', '#E4D1B9'
  ],
};

// Helper function to format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper function to format percentages
export const formatPercentage = (value) => {
  return `${parseFloat(value).toFixed(1)}%`;
};

export default ChartWrapper;