function Icon(props, path) {
  const { className = '', ...rest } = props || {};
  const attributes = Object.entries(rest)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');
    
  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="${className}"
      ${attributes}
    >
      ${path}
    </svg>
  `;
}

export const ChevronDownIcon = (props) => Icon(props, `<path d="m6 9 6 6 6-6" />`);
export const UploadIcon = (props) => Icon(props, `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />`);
export const GenerateIcon = (props) => Icon(props, `<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" />`);
export const UserIcon = (props) => Icon(props, `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />`);
export const SaveIcon = (props) => Icon(props, `<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />`);
export const LoadIcon = (props) => Icon(props, `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />`);
export const EyeIcon = (props) => Icon(props, `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />`);
export const EyeOffIcon = (props) => Icon(props, `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />`);
export const ArrowLeftIcon = (props) => Icon(props, `<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>`);
export const ArrowRightIcon = (props) => Icon(props, `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Icon>`);
export const InfoIcon = (props) => Icon(props, `<circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />`);
export const EnlargeIcon = (props) => Icon(props, `<path d="M14 10h6m-3-3v6M10 14H4m3 3v-6"/>`);
export const CloseIcon = (props) => Icon(props, `<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>`);
export const MenuIcon = (props) => Icon(props, `<line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line>`);
export const MoreVerticalIcon = (props) => Icon(props, `<circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle>`);
export const ZoomInIcon = (props) => Icon(props, `<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />`);
export const ZoomOutIcon = (props) => Icon(props, `<circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />`);
export const ResetIcon = (props) => Icon(props, `<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M21 21v-5h-5" />`);