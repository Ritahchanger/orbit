// hooks/useBookingMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';

import bookingApi from '../services/booking-api';

export const useBookingMutations = () => {
    const queryClient = useQueryClient();

    // Create booking mutation
    const createBookingMutation = useMutation({
        mutationFn: (bookingData) => bookingApi.createBooking(bookingData),
        onSuccess: (data) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });

            // Optional: Update cache with new booking
            if (data.success && data.data?.referenceNumber) {
                queryClient.setQueryData(
                    ['booking', data.data.referenceNumber],
                    data.data
                );
            }
        }
        // No onError here - let component handle errors
    });

    // Cancel booking mutation
    const cancelBookingMutation = useMutation({
        mutationFn: ({ referenceNumber, reason = '' }) =>
            bookingApi.cancelBooking(referenceNumber, reason),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['booking', variables.referenceNumber] });
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
            queryClient.invalidateQueries({ queryKey: ['myBookings'] });
        }
        // No onError here - let component handle errors
    });

    // Admin: Update availability mutation
    const updateAvailabilityMutation = useMutation({
        mutationFn: (availabilityData) =>
            bookingApi.updateAvailability(availabilityData),
        onSuccess: () => {
            // Invalidate availability queries
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
        }
        // No onError here - let component handle errors
    });

    // Comprehensive booking creation with validation - FIXED VERSION
    const createBookingWithValidation = useMutation({
        mutationFn: async (bookingData) => {
            console.log('🔄 Starting booking validation for:', bookingData);

            // Step 1: Validate date
            const dateCheck = await bookingApi.checkDateValidity(bookingData.date);
            console.log('📅 Date check result:', dateCheck);

            if (!dateCheck.success || !dateCheck.isValid) {
                throw new Error(dateCheck.message || 'Cannot book on this date');
            }

            // Step 2: Check time slot availability
            const timeSlots = await bookingApi.getTimeSlots(bookingData.date);
            console.log('⏰ Time slots result:', timeSlots);

            // Handle both API response formats (data property or direct)
            const timeSlotsData = timeSlots.data || timeSlots;
            const selectedSlot = timeSlotsData?.timeSlots?.find(
                slot => slot.value === bookingData.timeSlot
            );

            if (!selectedSlot || !selectedSlot.available) {
                throw new Error('Selected time slot is no longer available');
            }

            // Step 3: Create booking
            console.log('📝 Creating booking with data:', bookingData);
            const result = await bookingApi.createBooking(bookingData);
            console.log('✅ Booking creation result:', result);

            // Check if booking was successful from API response
            if (!result.success) {
                throw new Error(result.message || 'Booking creation failed');
            }

            return result;
        },
        onSuccess: (data) => {
            console.log('🎉 Booking successful!', data);
            queryClient.invalidateQueries({ queryKey: ['availability'] });
            queryClient.invalidateQueries({ queryKey: ['timeSlots'] });
            queryClient.invalidateQueries({ queryKey: ['adminBookings'] });

            // Set booking data in cache
            if (data.success && data.data?.referenceNumber) {
                queryClient.setQueryData(
                    ['booking', data.data.referenceNumber],
                    data.data
                );
            }
        }
        // No onError here - let component handle errors
    });

    return {
        // Basic booking mutations
        createBooking: createBookingMutation.mutate,
        createBookingAsync: createBookingMutation.mutateAsync,
        isCreatingBooking: createBookingMutation.isPending,
        createBookingError: createBookingMutation.error,
        createBookingStatus: createBookingMutation.status,

        // Cancel booking mutations
        cancelBooking: cancelBookingMutation.mutate,
        cancelBookingAsync: cancelBookingMutation.mutateAsync,
        isCancellingBooking: cancelBookingMutation.isPending,
        cancelBookingError: cancelBookingMutation.error,
        cancelBookingStatus: cancelBookingMutation.status,

        // Availability mutations
        updateAvailability: updateAvailabilityMutation.mutate,
        updateAvailabilityAsync: updateAvailabilityMutation.mutateAsync,
        isUpdatingAvailability: updateAvailabilityMutation.isPending,
        updateAvailabilityError: updateAvailabilityMutation.error,
        updateAvailabilityStatus: updateAvailabilityMutation.status,

        // Validation-based booking mutations
        createBookingWithValidation: createBookingWithValidation.mutate,
        createBookingWithValidationAsync: createBookingWithValidation.mutateAsync,
        isCreatingBookingWithValidation: createBookingWithValidation.isPending,
        createBookingWithValidationError: createBookingWithValidation.error,
        createBookingWithValidationStatus: createBookingWithValidation.status,

        // Reset functions
        resetCreateBooking: createBookingMutation.reset,
        resetCancelBooking: cancelBookingMutation.reset,
        resetUpdateAvailability: updateAvailabilityMutation.reset,
        resetCreateBookingWithValidation: createBookingWithValidation.reset
    };
};

// Optional: Custom hook for booking with better error handling
export const useBookingWithErrorHandling = () => {
    const {
        createBookingWithValidationAsync,
        isCreatingBookingWithValidation,
        createBookingWithValidationError,
        resetCreateBookingWithValidation
    } = useBookingMutations();

    const createBooking = async (bookingData) => {
        try {
            const result = await createBookingWithValidationAsync(bookingData);
            return { success: true, data: result };
        } catch (error) {
            // Extract error message from various error formats
            let errorMessage = 'Failed to create booking';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            return {
                success: false,
                error: errorMessage,
                originalError: error
            };
        }
    };

    return {
        createBooking,
        isCreatingBooking: isCreatingBookingWithValidation,
        error: createBookingWithValidationError,
        reset: resetCreateBookingWithValidation
    };
};