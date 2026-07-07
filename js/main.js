/* ============================================
   Tooark — Entry point (ES modules)
   Cada seção do site vive em js/modules/ e se
   re-renderiza sozinha quando o idioma muda.
   ============================================ */

import { initLocale } from './modules/locale.js';
import { initLayout } from './modules/layout.js';
import { initProjects } from './modules/projects.js';
import { initNuget } from './modules/nuget.js';
import { initNpm } from './modules/npm.js';
import { initExtensions } from './modules/extensions.js';
import { initGithubPackages } from './modules/ghpkg.js';

initLocale();
initLayout();
initProjects();
initNuget();
initNpm();
initExtensions();
initGithubPackages();
