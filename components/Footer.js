import { APP_VERSION } from '../version.js';

export function renderFooter(container) {
    const currentYear = new Date().getFullYear();
    const footerHtml = `
        <footer class="bg-gray-900 text-gray-500 text-xs text-center p-3 border-t border-gray-800 flex-shrink-0">
            <p>&copy; ${currentYear} SonicStencil. All Rights Reserved. | Version ${APP_VERSION}</p>
        </footer>
    `;
    container.innerHTML = footerHtml;
}
