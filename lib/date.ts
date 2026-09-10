const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format any date input (timestamp integer, ISO string, YYYY-MM-DD string) into '20 Aug 2026' format.
 */
export function formatDate(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '-';

    let d: Date;

    if (typeof val === 'number') {
        // If seconds timestamp (e.g. 10 digits around 1.7e9), convert to ms
        const ms = val < 10000000000 ? val * 1000 : val;
        d = new Date(ms);
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return '-';

        // Check if string contains only digits (Unix timestamp)
        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            const ms = num < 10000000000 ? num * 1000 : num;
            d = new Date(ms);
        } else {
            d = new Date(trimmed);
        }
    } else {
        d = new Date(val);
    }

    if (isNaN(d.getTime())) {
        return String(val);
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTHS[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${month} ${year}`;
}

/**
 * Convert any date input (HTML date picker 'YYYY-MM-DD', Date object, string) to Unix timestamp code in seconds (e.g. 1787210341).
 */
export function toTimestamp(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';

    if (typeof val === 'number') {
        return val < 10000000000 ? String(Math.floor(val)) : String(Math.floor(val / 1000));
    }

    const trimmed = String(val).trim();
    if (!trimmed) return '';

    if (/^\d+$/.test(trimmed)) {
        const num = Number(trimmed);
        return num < 10000000000 ? String(num) : String(Math.floor(num / 1000));
    }

    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return trimmed;

    return String(Math.floor(d.getTime() / 1000));
}

/**
 * Convert date value or timestamp to 'YYYY-MM-DD' for binding to HTML <input type="date">
 */
export function toInputDateString(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';

    let d: Date;
    if (typeof val === 'number') {
        const ms = val < 10000000000 ? val * 1000 : val;
        d = new Date(ms);
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return '';
        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            const ms = num < 10000000000 ? num * 1000 : num;
            d = new Date(ms);
        } else {
            d = new Date(trimmed);
        }
    } else {
        d = new Date(val);
    }

    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Derive Month Name string (e.g. 'August-2026') from date value or timestamp
 */
export function toMonthName(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';

    let d: Date;
    if (typeof val === 'number') {
        const ms = val < 10000000000 ? val * 1000 : val;
        d = new Date(ms);
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return '';
        if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            const ms = num < 10000000000 ? num * 1000 : num;
            d = new Date(ms);
        } else {
            d = new Date(trimmed);
        }
    } else {
        d = new Date(val);
    }

    if (isNaN(d.getTime())) return '';

    const month = FULL_MONTHS[d.getMonth()];
    const year = d.getFullYear();

    return `${month}-${year}`;
}

