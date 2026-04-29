function compareURL(url) {
    const parsedURL = new URL(url);
    const origin = parsedURL.origin;
    const pathname = parsedURL.pathname;
    return { origin, pathname };
}

// Example usage:
const result = compareURL('https://example.com/path/to/resource?query=param');
console.log(result); // { origin: 'https://example.com', pathname: '/path/to/resource' }