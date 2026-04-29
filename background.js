function compareURL(url, pattern) {
    const urlObj = new URL(url);
    try {
        return pattern.test(urlObj.origin + urlObj.pathname);
    } catch (error) {
        console.error('Error in regex test:', error);
        return false;
    }
}