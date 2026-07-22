export function downloadTextFile(filename: string, content: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export function escapeCsvValue(value: string | number | boolean | null | undefined) {
    if (value === null || value === undefined) {
        return "";
    }

    const normalized = String(value).replaceAll('"', '""');
    return `"${normalized}"`;
}

