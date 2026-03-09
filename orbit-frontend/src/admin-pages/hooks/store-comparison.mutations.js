// hooks/useStoreComparison.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import storeComparisonApi from '../services/store-comparison';
import { toast } from 'react-hot-toast';
export const storeComparisonKeys = {
    all: ['storeComparison'],
    compare: (filters) => [...storeComparisonKeys.all, 'compare', filters],
    drillDown: (storeId, filters) => [...storeComparisonKeys.all, 'drillDown', storeId, filters],
    quick: (storeIds) => [...storeComparisonKeys.all, 'quick', storeIds],
    benchmarks: (filters) => [...storeComparisonKeys.all, 'benchmarks', filters],
    trends: (storeId, params) => [...storeComparisonKeys.all, 'trends', storeId, params],
    metric: (metric, params) => [...storeComparisonKeys.all, 'metric', metric, params],
    storeRankings: (storeIds) => [...storeComparisonKeys.all, 'rankings', storeIds],
    storeInsights: (storeId) => [...storeComparisonKeys.all, 'insights', storeId],
};

// Main comparison hook
export const useStoreComparison = (filters = {}) => {
    return useQuery({
        queryKey: storeComparisonKeys.compare(filters),
        queryFn: () => storeComparisonApi.compareStores(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });
};
// Store drill-down hook
export const useStoreDrillDown = (storeId, filters = {}) => {
    return useQuery({
        queryKey: storeComparisonKeys.drillDown(storeId, filters),
        queryFn: () => storeComparisonApi.getStoreDrillDown(storeId, filters),
        enabled: !!storeId,
        staleTime: 1000 * 60 * 5,
    });
};
// Quick comparison hook
export const useQuickComparison = (storeIds) => {
    return useQuery({
        queryKey: storeComparisonKeys.quick(storeIds),
        queryFn: () => storeComparisonApi.getQuickComparison(storeIds),
        enabled: !!storeIds && storeIds.length >= 2,
        staleTime: 1000 * 60 * 3,
    });
};
// Export mutation hook
export const useExportComparison = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params) => storeComparisonApi.exportComparison(params),
        onSuccess: (data) => {
            if (data.filename && data.data) {
                storeComparisonApi.downloadFile(data.data, data.filename);
                toast.success(`Report exported as ${data.filename}`);
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Export failed');
        },
    });
};
// Convenience hooks
export const useStoreRankings = (storeIds = []) => {
    return useQuery({
        queryKey: storeComparisonKeys.storeRankings(storeIds),
        queryFn: () => storeComparisonApi.getStoreRankings(storeIds),
        staleTime: 1000 * 60 * 5,
    });
};
export const useStoreInsights = (storeId) => {
    return useQuery({
        queryKey: storeComparisonKeys.storeInsights(storeId),
        queryFn: () => storeComparisonApi.getStoreInsights(storeId),
        enabled: !!storeId,
        staleTime: 1000 * 60 * 10,
    });
};