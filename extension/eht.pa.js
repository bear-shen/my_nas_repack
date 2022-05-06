/* jshint esversion: 9 */
// ==UserScript==
// @name         eht tag getter
// @namespace    https://exhentai.org/
// @version      0.0.0
// @description
// @author       neko
// @include        *://exhentai.org/g/*
// @include        *://e-hentai.org/g/*
// ==/UserScript==
//

document.querySelectorAll('.gl2e>div>a').forEach(a => {
  a.parentNode.innerHTML += a.innerHTML;
});
document.querySelectorAll('.gl2e>div>a').forEach(a => {
  a.parentNode.removeChild(a);
});

document.querySelectorAll('.gt').forEach(tag => {
  tag.addEventListener('click', (e) => {
    console.info(e.target);
    const text = new Blob([e.target.innerHTML], {type: 'text/plain'});
    const item = new ClipboardItem({
                                     'text/plain': text,
                                   });
    navigator.clipboard.write([item]);
  });
})