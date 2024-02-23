export function getAWSPresignedFileExtension(url: string): string {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    const dotIndex = pathname.lastIndexOf('.');
    if (dotIndex > 0) {
        return pathname.substring(dotIndex + 1);
    } else {
        return '';
    }
}