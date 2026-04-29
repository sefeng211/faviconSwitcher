function compareURL(url) {
    try {
        const parsedURL = new URL(url);
        const origin = parsedURL.origin;
        const pathname = parsedURL.pathname;
        // Use the origin and pathname for pattern matching
        // Existing pattern matching logic goes here
    } catch (error) {
        console.error('Error parsing URL:', error);
    }
}

// Other existing code...
