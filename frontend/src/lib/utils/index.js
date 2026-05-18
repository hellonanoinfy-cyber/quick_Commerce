// ===================================================
// UTILITY FUNCTIONS
// ===================================================

// ===================================================
// FORMAT CURRENCY
// ===================================================

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ===================================================
// FORMAT NUMBER
// ===================================================

export function formatNumber(num, options = {}) {
  return new Intl.NumberFormat('en-IN', options).format(num);
}

// ===================================================
// FORMAT DATE
// ===================================================

export function formatDate(date, format = 'short') {
  const dateObj = new Date(date);

  const formats = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
  };

  return new Intl.DateTimeFormat('en-IN', formats[format] || formats.short).format(dateObj);
}

// ===================================================
// FORMAT RELATIVE TIME
// ===================================================

export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  return formatDate(date);
}

// ===================================================
// TRUNCATE TEXT
// ===================================================

export function truncate(text, length = 100, suffix = '...') {
  if (!text || text.length <= length) return text;
  return text.slice(0, length).trim() + suffix;
}

// ===================================================
// SLUGIFY
// ===================================================

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ===================================================
// CAPITALIZE
// ===================================================

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ===================================================
// DEBOUNCE
// ===================================================

export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ===================================================
// THROTTLE
// ===================================================

export function throttle(fn, limit = 300) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ===================================================
// DEEP CLONE
// ===================================================

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// ===================================================
// IS EMPTY
// ===================================================

export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// ===================================================
// PICK PROPERTIES
// ===================================================

export function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj.hasOwnProperty(key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

// ===================================================
// OMIT PROPERTIES
// ===================================================

export function omit(obj, keys) {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

// ===================================================
// GET INITIALS
// ===================================================

export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ===================================================
// GENERATE RANDOM ID
// ===================================================

export function generateId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
}

// ===================================================
// VALIDATE EMAIL
// ===================================================

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===================================================
// VALIDATE PHONE
// ===================================================

export function isValidPhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  return phone && phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ===================================================
// PARSE URL PARAMS
// ===================================================

export function parseUrlParams(url) {
  const params = {};
  const urlParts = url.split('?');
  if (urlParts.length > 1) {
    const queryString = urlParts[1];
    const pairs = queryString.split('&');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }
  return params;
}

// ===================================================
// BUILD URL WITH PARAMS
// ===================================================

export function buildUrl(baseUrl, params = {}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const url = new URL(baseUrl, origin || 'http://localhost');
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
}

// ===================================================
// EXPORTS
// ===================================================

export default {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  truncate,
  slugify,
  capitalize,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  pick,
  omit,
  getInitials,
  generateId,
  isValidEmail,
  isValidPhone,
  parseUrlParams,
  buildUrl,
};
