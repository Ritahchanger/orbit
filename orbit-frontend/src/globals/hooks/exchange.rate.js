// hooks/useExchangeRate.js
import { useState, useEffect } from 'react';

export const useExchangeRate = (fromCurrency, toCurrency) => {
    const [rate, setRate] = useState(143);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let intervalId;

        const fetchExchangeRate = async () => {
            try {
                setIsLoading(true);

                // Option 1: Use ExchangeRate-API (free, no API key needed for limited use)
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.rates && data.rates[toCurrency]) {
                    setRate(data.rates[toCurrency]);
                    setError(null);
                    console.log(`Exchange rate updated: 1 ${fromCurrency} = ${data.rates[toCurrency]} ${toCurrency}`);
                } else {
                    throw new Error(`Rate for ${toCurrency} not found in response`);
                }

            } catch (err) {
                console.warn('Failed to fetch live exchange rate, using fallback:', err.message);
                setError('Using cached exchange rate');
                // Don't change rate - keep existing value as fallback
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchExchangeRate();

        // Update every 5 minutes (300000 ms)
        intervalId = setInterval(fetchExchangeRate, 300000);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [fromCurrency, toCurrency]);

    return { rate, isLoading, error };
};