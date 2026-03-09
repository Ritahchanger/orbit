// hooks/useConsultationMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';

import consultationApi from '../services/consultation-types-api';

import { toast } from 'react-hot-toast';

export const useConsultationMutations = () => {
    const queryClient = useQueryClient();

    // 1. CREATE consultation type
    const createConsultationTypeMutation = useMutation({
        mutationFn: (typeData) => consultationApi.createConsultationType(typeData),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
                toast.success('Consultation type created successfully');
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to create consultation type';
            toast.error(message);
        }
    });

    // 2. UPDATE consultation type
    const updateConsultationTypeMutation = useMutation({
        mutationFn: ({ id, data }) => consultationApi.updateConsultationType(id, data),
        onSuccess: (data, variables) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
                queryClient.invalidateQueries({ queryKey: ['consultationType', variables.id] });
                queryClient.setQueryData(['consultationType', variables.id], data);
                toast.success('Consultation type updated successfully');
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to update consultation type';
            toast.error(message);
        }
    });

    // 3. DELETE consultation type
    const deleteConsultationTypeMutation = useMutation({
        mutationFn: (id) => consultationApi.deleteConsultationType(id),
        onSuccess: (data, id) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
                queryClient.removeQueries({ queryKey: ['consultationType', id] });
                toast.success('Consultation type deleted successfully');
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to delete consultation type';
            toast.error(message);
        }
    });

    // 4. TOGGLE consultation type status
    const toggleConsultationTypeStatusMutation = useMutation({
        mutationFn: (id) => consultationApi.toggleConsultationTypeStatus(id),
        onSuccess: (data, id) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
                queryClient.invalidateQueries({ queryKey: ['consultationType', id] });
                toast.success(`Consultation type ${data.data?.isActive ? 'activated' : 'deactivated'}`);
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to toggle consultation type status';
            toast.error(message);
        }
    });

    // 5. REORDER consultation types
    const reorderConsultationTypesMutation = useMutation({
        mutationFn: (orderMap) => consultationApi.reorderConsultationTypes(orderMap),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
                toast.success('Consultation types reordered successfully');
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to reorder consultation types';
            toast.error(message);
        }
    });

    // 6. BULK UPDATE consultation types (optional)
    const bulkUpdateConsultationTypesMutation = useMutation({
        mutationFn: (updates) => consultationApi.bulkUpdateConsultationTypes(updates),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['consultationTypes'] });
                toast.success('Consultation types updated in bulk');
            }
        },
        onError: (error) => {
            const message = error.response?.data?.message || error.message || 'Failed to bulk update consultation types';
            toast.error(message);
        }
    });

    // Return all mutations with their states
    return {
        // Create
        createConsultationType: createConsultationTypeMutation.mutate,
        createConsultationTypeAsync: createConsultationTypeMutation.mutateAsync,
        isCreatingConsultationType: createConsultationTypeMutation.isPending,
        createConsultationTypeError: createConsultationTypeMutation.error,

        // Update
        updateConsultationType: updateConsultationTypeMutation.mutate,
        updateConsultationTypeAsync: updateConsultationTypeMutation.mutateAsync,
        isUpdatingConsultationType: updateConsultationTypeMutation.isPending,
        updateConsultationTypeError: updateConsultationTypeMutation.error,

        // Delete
        deleteConsultationType: deleteConsultationTypeMutation.mutate,
        deleteConsultationTypeAsync: deleteConsultationTypeMutation.mutateAsync,
        isDeletingConsultationType: deleteConsultationTypeMutation.isPending,
        deleteConsultationTypeError: deleteConsultationTypeMutation.error,

        // Toggle Status
        toggleConsultationTypeStatus: toggleConsultationTypeStatusMutation.mutate,
        toggleConsultationTypeStatusAsync: toggleConsultationTypeStatusMutation.mutateAsync,
        isTogglingConsultationTypeStatus: toggleConsultationTypeStatusMutation.isPending,
        toggleConsultationTypeStatusError: toggleConsultationTypeStatusMutation.error,

        // Reorder
        reorderConsultationTypes: reorderConsultationTypesMutation.mutate,
        reorderConsultationTypesAsync: reorderConsultationTypesMutation.mutateAsync,
        isReorderingConsultationTypes: reorderConsultationTypesMutation.isPending,
        reorderConsultationTypesError: reorderConsultationTypesMutation.error,

        // Bulk Update
        bulkUpdateConsultationTypes: bulkUpdateConsultationTypesMutation.mutate,
        bulkUpdateConsultationTypesAsync: bulkUpdateConsultationTypesMutation.mutateAsync,
        isBulkUpdatingConsultationTypes: bulkUpdateConsultationTypesMutation.isPending,
        bulkUpdateConsultationTypesError: bulkUpdateConsultationTypesMutation.error,

        // Reset functions
        resetCreateConsultationType: createConsultationTypeMutation.reset,
        resetUpdateConsultationType: updateConsultationTypeMutation.reset,
        resetDeleteConsultationType: deleteConsultationTypeMutation.reset,
        resetToggleConsultationTypeStatus: toggleConsultationTypeStatusMutation.reset,
        resetReorderConsultationTypes: reorderConsultationTypesMutation.reset,
        resetBulkUpdateConsultationTypes: bulkUpdateConsultationTypesMutation.reset
    };
};