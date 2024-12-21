export const VERSION = "4.10";
export const CDN = `https://cdn.jsdelivr.net/gh/SteamDatabase/BrowserExtension@${VERSION}`;

export function getCdn(path: string) {
    return `${CDN}/${path}`;
}

declare global{
    interface Window {
        steamDBBrowser: any;
    }
}