const filenameRegex = /filename\*?=(?:'[^']*')?([^;]*)/i;

export function parseContentDispositionFilename(value: string): string | undefined {


// Regular expression to extract filename from Content-Disposition
// This regex handles both quoted and unquoted filenames, and also filenames containing spaces and commas
    const matches = filenameRegex.exec(value);

    if (matches && matches[1]) {
        // The filename might be URL encoded, so decode it
        const filename = decodeURIComponent(matches[1].trim());

        // Remove quotes if present
        return filename.replace(/['"]/g, '');
    }

    return undefined;
}
