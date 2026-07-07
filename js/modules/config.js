/* ============================================
   Tooark — Configurações e constantes globais
   ============================================ */

export const ORG = 'Tooark';
export const GITHUB_API = 'https://api.github.com';
export const REPO_HIDE = ['tooark.github.io', '.github'];
export const NUGET_API = 'https://azuresearch-usnc.nuget.org/query';
export const NPM_API = 'https://registry.npmjs.org/-/v1/search';
export const TOOARK_API = 'https://api.tooark.com/api/projects';
export const OPENVSX_API = 'https://open-vsx.org/api';
export const OPENVSX_NAMESPACE = 'tooark';
export const MARKETPLACE_API =
  'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery';

export const MAX_TAG_FILTERS = 5;
export const MAX_CARD_TAGS = 4;
export const INITIAL_PROJECTS = 9;
export const PROJECTS_STEP = 9;
export const INITIAL_PACKAGES = 9;
export const PACKAGES_STEP = 9;
export const INITIAL_NPM_PACKAGES = 9;
export const NPM_PACKAGES_STEP = 9;
export const STORAGE_LOCALE_KEY = 'tooark.locale';

// Language colors (GitHub style)
export const LANG_COLORS = {
  'C#': '#6C1579',
  JavaScript: '#F7DF1E',
  TypeScript: '#3178C6',
  Shell: '#243850',
  HCL: '#7B42BC',
  Dockerfile: '#2496ED',
  HTML: '#FF4E1D',
  CSS: '#3C9CD7',
  Python: '#FECF40',
  Go: '#00ACD7',
  PowerShell: '#131e27',
};

// Topics ocultados dos filtros e chips por estarem presentes em quase todos os repositórios
export const TOPIC_HIDE = ['tooark'];
