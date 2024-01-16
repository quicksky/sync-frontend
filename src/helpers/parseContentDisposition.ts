const filenameRegex = /filename\*?=(?:'[^']*')?([^;]*)/i;

export function parseContentDispositionFilename(value: string): string | undefined {

    console.log(value)

// Regular expression to extract filename from Content-Disposition
// This regex handles both quoted and unquoted filenames, and also filenames containing spaces and commas
    const matches = filenameRegex.exec(value);
    console.log(matches)

    if (matches && matches[1]) {
        // The filename might be URL encoded, so decode it
        const filename = decodeURIComponent(matches[1].trim());

        // Remove quotes if present
        return filename.replace(/['"]/g, '');
    }

    return undefined;
}
