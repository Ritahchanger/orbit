// src/hooks/useDebounce.js
import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook to debounce a value
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} - The debounced value
 */
export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        // Set up timeout
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Clean up timeout on unmount or when value/delay changes
        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])

    return debouncedValue
}

/**
 * Alternative version with leading edge (immediate execution)
 */
export function useDebounceWithLeading(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    const timeoutRef = useRef(null)
    const isFirstRunRef = useRef(true)

    useEffect(() => {
        if (isFirstRunRef.current) {
            // First time - execute immediately
            setDebouncedValue(value)
            isFirstRunRef.current = false
            return
        }

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [value, delay])

    // Reset first run flag when delay changes (optional, depending on your needs)
    useEffect(() => {
        isFirstRunRef.current = true
    }, [delay])

    return debouncedValue
}

/**
 * Hook for debouncing callback functions
 */
export function useDebouncedCallback(callback, delay = 300) {
    const timeoutRef = useRef(null)
    const callbackRef = useRef(callback)

    // Update callback ref if callback changes
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const debouncedCallback = useCallback(
        (...args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args)
            }, delay)
        },
        [delay]
    )

    // Clear timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return debouncedCallback
}

/**
 * Advanced debounce hook with cancel and flush capabilities
 */
export function useAdvancedDebounce(value, delay = 300, options = {}) {
    const [debouncedValue, setDebouncedValue] = useState(value)
    const timeoutRef = useRef(null)
    const lastValueRef = useRef(value)
    const isMountedRef = useRef(true)

    const { leading = false, trailing = true, maxWait } = options
    const maxWaitTimeoutRef = useRef(null)

    useEffect(() => {
        isMountedRef.current = true
        lastValueRef.current = value

        return () => {
            isMountedRef.current = false
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (maxWaitTimeoutRef.current) {
                clearTimeout(maxWaitTimeoutRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (leading && timeoutRef.current === null) {
            // Leading edge execution
            setDebouncedValue(value)
        }

        lastValueRef.current = value

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set up the main timeout
        timeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && trailing && lastValueRef.current === value) {
                setDebouncedValue(value)
            }
            timeoutRef.current = null
        }, delay)

        // Set up maxWait timeout if specified
        if (maxWait && maxWait > delay && !maxWaitTimeoutRef.current) {
            maxWaitTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && lastValueRef.current === value) {
                    setDebouncedValue(value)
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current)
                        timeoutRef.current = null
                    }
                }
                maxWaitTimeoutRef.current = null
            }, maxWait)
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [value, delay, leading, trailing, maxWait])

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        if (maxWaitTimeoutRef.current) {
            clearTimeout(maxWaitTimeoutRef.current)
            maxWaitTimeoutRef.current = null
        }
    }, [])

    const flush = useCallback(() => {
        if (timeoutRef.current && isMountedRef.current) {
            clearTimeout(timeoutRef.current)
            setDebouncedValue(lastValueRef.current)
            timeoutRef.current = null
        }
        if (maxWaitTimeoutRef.current) {
            clearTimeout(maxWaitTimeoutRef.current)
            maxWaitTimeoutRef.current = null
        }
    }, [])

    return [debouncedValue, { cancel, flush }]
}

/**
 * Hook to debounce async functions with pending state
 */
export function useDebouncedAsyncCallback(asyncCallback, delay = 300) {
    const timeoutRef = useRef(null)
    const callbackRef = useRef(asyncCallback)
    const [isPending, setIsPending] = useState(false)
    const isMountedRef = useRef(true)

    // Update callback ref if callback changes
    useEffect(() => {
        callbackRef.current = asyncCallback
    }, [asyncCallback])

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }
    }, [])

    const debouncedCallback = useCallback(
        (...args) => {
            return new Promise((resolve, reject) => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                }

                if (!isMountedRef.current) {
                    reject(new Error('Component unmounted'))
                    return
                }

                setIsPending(true)

                timeoutRef.current = setTimeout(async () => {
                    if (!isMountedRef.current) {
                        reject(new Error('Component unmounted'))
                        return
                    }

                    try {
                        const result = await callbackRef.current(...args)
                        if (isMountedRef.current) {
                            resolve(result)
                        }
                    } catch (error) {
                        if (isMountedRef.current) {
                            reject(error)
                        }
                    } finally {
                        if (isMountedRef.current) {
                            setIsPending(false)
                        }
                    }
                }, delay)
            })
        },
        [delay]
    )

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
            if (isMountedRef.current) {
                setIsPending(false)
            }
        }
    }, [])

    return [debouncedCallback, { isPending, cancel }]
}

/**
 * Simple debounce callback with immediate cancel
 */
export function useDebounceFn(fn, delay = 300) {
    const timeoutRef = useRef(null)
    const fnRef = useRef(fn)

    useEffect(() => {
        fnRef.current = fn
    }, [fn])

    const debouncedFn = useCallback(
        (...args) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            timeoutRef.current = setTimeout(() => {
                fnRef.current(...args)
            }, delay)
        },
        [delay]
    )

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        return cancel
    }, [cancel])

    return [debouncedFn, cancel]
}