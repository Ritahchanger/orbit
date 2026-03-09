// hooks/useConsultationQueries.js
import { useQuery } from '@tanstack/react-query';

import consultationApi from '../services/consultation-types-api';

export const useConsultationTypes = (options = {}) => {
    const { activeOnly = true, ...queryOptions } = options;

    return useQuery({
        queryKey: ['consultationTypes', { activeOnly }],
        queryFn: () => consultationApi.getConsultationTypes(activeOnly),
        ...queryOptions
    });
};