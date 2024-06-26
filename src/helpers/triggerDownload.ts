export default function triggerDownload(data: Blob, name: string) {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name);
    link.click();
    window.URL.revokeObjectURL(url);
}