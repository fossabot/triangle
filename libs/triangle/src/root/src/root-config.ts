import { InjectionToken } from '@angular/core';

export interface RootConfig {
  extraFontName: string;
  extraFontUrl: string;
}

export const ROOT_CONFIG = new InjectionToken<RootConfig>('NzRootConfig');

export function createNzRootInitializer(document: Document, options?: RootConfig) {
  return function rootInitializer() {
    if (options) {
      const style = document.createElement('style');
      style.innerHTML = `
        @font-face {
          font-family: '${options.extraFontName}';
          src: url('${options.extraFontUrl}.eot'); /* IE9*/
          src:
            /* IE6-IE8 */
            url('${options.extraFontUrl}.eot?#iefix') format('embedded-opentype'),
            /* chrome、firefox */
            url('${options.extraFontUrl}.woff') format('woff'),
            /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
            url('${options.extraFontUrl}.ttf') format('truetype'),
            /* iOS 4.1- */
            url('${options.extraFontUrl}.svg#iconfont') format('svg');
        }
      `;
      document.head.appendChild(style);
    }
  };
}
