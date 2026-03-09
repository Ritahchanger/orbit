// src/hooks/useNewsletterMutations.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import NewsletterApi from '../services/newsletter-api';
import { toast } from 'react-hot-toast';

// Query keys constants (should be in a separate file)
export const NEWSLETTER_QUERY_KEYS = {
    subscribers: (params) => ['newsletter', 'subscribers', params],
    subscriber: (email) => ['newsletter', 'subscriber', email],
    history: () => ['newsletter', 'history'],
    stats: () => ['newsletter', 'stats']
};

// Messages config
const MESSAGES = {
    success: {
        subscribe: 'Subscribed successfully!',
        unsubscribe: 'Unsubscribed successfully!',
        preferences: 'Preferences updated!',
        send: 'Newsletter queued for sending!',
        quickSubscribe: 'Subscribed successfully!'
    },
    error: {
        subscribe: 'Failed to subscribe',
        unsubscribe: 'Failed to unsubscribe',
        preferences: 'Failed to update preferences',
        send: 'Failed to send newsletter',
        quickSubscribe: 'Failed to subscribe',
        default: 'An error occurred'
    }
};

// Helper function to extract error message
const getErrorMessage = (error, defaultMessage) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return defaultMessage;
};

export const useNewsletterMutations = () => {
    const queryClient = useQueryClient();

    // ============ SUBSCRIBER MUTATIONS ============

    const subscribeMutation = useMutation({
        mutationFn: NewsletterApi.subscribe,
        onMutate: async (newSubscriber) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.subscribers()
            });

            // Snapshot the previous value
            const previousSubscribers = queryClient.getQueryData(
                NEWSLETTER_QUERY_KEYS.subscribers()
            );

            // Optimistically update to the new value
            queryClient.setQueryData(
                NEWSLETTER_QUERY_KEYS.subscribers(),
                old => [...(old || []), { ...newSubscriber, _id: 'temp-id', subscribed: true }]
            );

            // Also update specific subscriber query if it exists
            queryClient.setQueryData(
                NEWSLETTER_QUERY_KEYS.subscriber(newSubscriber.email),
                { ...newSubscriber, subscribed: true }
            );

            return { previousSubscribers };
        },
        onSuccess: (data) => {
            toast.success(data.message || MESSAGES.success.subscribe);
            // Invalidate and refetch
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.subscribers()
            });
            // Also invalidate stats
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.stats()
            });
        },
        onError: (error, variables, context) => {
            toast.error(getErrorMessage(error, MESSAGES.error.subscribe));
            // Roll back optimistic update
            if (context?.previousSubscribers) {
                queryClient.setQueryData(
                    NEWSLETTER_QUERY_KEYS.subscribers(),
                    context.previousSubscribers
                );
            }
        }
    });

    const unsubscribeMutation = useMutation({
        mutationFn: NewsletterApi.unsubscribe,
        onMutate: async ({ email }) => {
            await queryClient.cancelQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.subscribers()
            });

            const previousSubscribers = queryClient.getQueryData(
                NEWSLETTER_QUERY_KEYS.subscribers()
            );

            // Optimistically update
            queryClient.setQueryData(
                NEWSLETTER_QUERY_KEYS.subscribers(),
                old => (old || []).map(sub =>
                    sub.email === email ? { ...sub, subscribed: false } : sub
                )
            );

            queryClient.setQueryData(
                NEWSLETTER_QUERY_KEYS.subscriber(email),
                old => ({ ...old, subscribed: false })
            );

            return { previousSubscribers };
        },
        onSuccess: (data) => {
            toast.success(data.message || MESSAGES.success.unsubscribe);
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.subscribers()
            });
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.stats()
            });
        },
        onError: (error, variables, context) => {
            toast.error(getErrorMessage(error, MESSAGES.error.unsubscribe));
            if (context?.previousSubscribers) {
                queryClient.setQueryData(
                    NEWSLETTER_QUERY_KEYS.subscribers(),
                    context.previousSubscribers
                );
            }
        }
    });

    const updatePreferencesMutation = useMutation({
        mutationFn: NewsletterApi.updatePreferences,
        onMutate: async ({ email, preferences }) => {
            await queryClient.cancelQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.subscriber(email)
            });

            const previousSubscriber = queryClient.getQueryData(
                NEWSLETTER_QUERY_KEYS.subscriber(email)
            );

            // Optimistically update
            queryClient.setQueryData(
                NEWSLETTER_QUERY_KEYS.subscriber(email),
                old => ({ ...old, preferences })
            );

            return { previousSubscriber };
        },
        onSuccess: (data) => {
            toast.success(data.message || MESSAGES.success.preferences);
            // Only invalidate specific subscriber
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.subscriber(data.email)
            });
        },
        onError: (error, variables, context) => {
            toast.error(getErrorMessage(error, MESSAGES.error.preferences));
            // Rollback if needed
            if (context?.previousSubscriber) {
                queryClient.setQueryData(
                    NEWSLETTER_QUERY_KEYS.subscriber(variables.email),
                    context.previousSubscriber
                );
            }
        }
    });

    // ============ NEWSLETTER SENDING MUTATION ============

    const sendNewsletterMutation = useMutation({
        mutationFn: NewsletterApi.sendNewsletter,
        onSuccess: (data) => {
            toast.success(data.message || MESSAGES.success.send);
            // Invalidate history queries
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.history()
            });
            // Also invalidate stats
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.stats()
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, MESSAGES.error.send));
        }
    });

    // ============ QUICK SUBSCRIBE MUTATION ============

    const quickSubscribeMutation = useMutation({
        mutationFn: NewsletterApi.quickSubscribe,
        onSuccess: (data) => {
            toast.success(data.message || MESSAGES.success.quickSubscribe);
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.subscribers()
            });
            queryClient.invalidateQueries({
                queryKey: NEWSLETTER_QUERY_KEYS.stats()
            });
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, MESSAGES.error.quickSubscribe));
        }
    });

    // ============ COMBINED MUTATIONS ============

    return {
        // Subscribe mutations
        subscribe: subscribeMutation.mutate,
        subscribeAsync: subscribeMutation.mutateAsync,
        isSubscribing: subscribeMutation.isPending,

        // Unsubscribe mutations
        unsubscribe: unsubscribeMutation.mutate,
        unsubscribeAsync: unsubscribeMutation.mutateAsync,
        isUnsubscribing: unsubscribeMutation.isPending,

        // Preferences mutations
        updatePreferences: updatePreferencesMutation.mutate,
        updatePreferencesAsync: updatePreferencesMutation.mutateAsync,
        isUpdatingPreferences: updatePreferencesMutation.isPending,

        // Send newsletter mutations
        sendNewsletter: sendNewsletterMutation.mutate,
        sendNewsletterAsync: sendNewsletterMutation.mutateAsync,
        isSendingNewsletter: sendNewsletterMutation.isPending,
        newsletterSendResult: sendNewsletterMutation.data,

        // Quick subscribe mutations
        quickSubscribe: quickSubscribeMutation.mutate,
        quickSubscribeAsync: quickSubscribeMutation.mutateAsync,
        isQuickSubscribing: quickSubscribeMutation.isPending,

        // Reset functions
        resetSendNewsletter: sendNewsletterMutation.reset,

        // Mutation status objects (for more control)
        subscribeMutation,
        unsubscribeMutation,
        updatePreferencesMutation,
        sendNewsletterMutation,
        quickSubscribeMutation
    };
};