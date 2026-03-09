import { useDispatch, useSelector } from "react-redux";
import {
  openAiResults,
  setAiResultsLoading,
  setAiResults,
  setAiResultsError,
} from "./ai-slice";

// This is a placeholder - you'll implement the actual API call later
const useAiAnalysis = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.aiResults);
  const analyzeData = async (data, context) => {
    try {
      dispatch(openAiResults({ context }));
      dispatch(setAiResultsLoading(true));
      const mockResponse = generateMockAiResponse(data, context);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(setAiResults(mockResponse));
      return mockResponse;
    } catch (error) {
      dispatch(setAiResultsError(error));
      throw error;
    }
  };
  return {
    analyzeData,
    isLoading,
  };
};

// Helper function for mock data
const generateMockAiResponse = (data, context) => {
  return {
    summary:
      "Based on the analysis, your stores show strong performance with room for optimization in inventory management.",
    confidence: 0.85,
    keyMetrics: [
      {
        label: "Revenue",
        value: 4528900,
        trend: "up",
        change: 12.5,
        isCurrency: true,
      },
      {
        label: "Profit Margin",
        value: 0.28,
        trend: "up",
        change: 3.2,
        isCurrency: false,
      },
      {
        label: "Inventory Turnover",
        value: 4.2,
        trend: "down",
        change: -1.5,
        isCurrency: false,
      },
      {
        label: "Customer Satisfaction",
        value: 92,
        trend: "up",
        change: 2.1,
        isCurrency: false,
      },
    ],
    insights: [
      {
        type: "opportunity",
        title: "High-performing store identified",
        description:
          "Store #123 shows 25% higher profit margin than average. Consider replicating their strategy.",
        impact: "High",
      },
      {
        type: "risk",
        title: "Inventory aging detected",
        description:
          "15% of inventory is over 60 days old, tying up KES 1.2M in working capital.",
        impact: "Medium",
      },
      {
        type: "insight",
        title: "Seasonal trend detected",
        description:
          "Sales peak between 2-4 PM daily. Consider staffing adjustments.",
        impact: "Medium",
      },
    ],
    recommendations: [
      {
        title: "Optimize inventory levels",
        description:
          "Reduce slow-moving stock by 20% to free up KES 800K in working capital.",
        priority: "high",
        actions: [
          "Run promotion on items >60 days old",
          "Adjust reorder points for category B items",
          "Implement dynamic pricing for slow movers",
        ],
        estimatedImpact: "KES 800K capital release",
      },
    ],
  };
};

export default useAiAnalysis;
