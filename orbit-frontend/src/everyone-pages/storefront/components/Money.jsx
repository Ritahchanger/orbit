// Money.jsx
export const formatCurrency = (amount, currency = "USD") => {
    const value = Number.isFinite(amount) ? amount : 0;

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency || "USD",
            currencyDisplay: "narrowSymbol",
        }).format(value);
    } catch {
        return `${currency || ""} ${value.toFixed(2)}`.trim();
    }
};

const Money = ({ amount, currency = "USD", className = "" }) => {
    return <span className={className}>{formatCurrency(amount, currency)}</span>;
};

export default Money;
