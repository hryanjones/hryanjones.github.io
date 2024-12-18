// ==UserScript==
// @name         Invert Colors on All Sites
// @description  Inverts colors on all sites to achieve a "dark" theme everywhere, and re-inverts most images you'd expect. Major downside is reversal of colors.
// @namespace    https://hryanjones.com
// @version      0.1
// @author       hryanjones@gmail.com
// @match        *://*/*
// @downloadURL  https://hryanjones.com/tampermonkey/invert-colors.user.js
// @updateURL    https://hryanjones.com/tampermonkey/invert-colors.user.js
// @run-at document-body
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    GM_addStyle(`
html, iframe {
  filter: invert(1);
  background-color: white;
}

img,
embed,
object,
video,
[style*="background-image: url(\'http"],
[style*='background-image: url(\"http'],
div[src],
#SLPlayer,
.swatchImageOverlay,
.fbStarGrid,
.fbPhotosGrid,
[aria-label*="photo"],
[src*="badgephotos.amazon.com"], /* specific to amazon internal badge photos */
.emoji /* Specific to hryanjones.com/emoji-picker */
{
  filter: invert(1);
}

img[role="button"],
[role="button"] > img,
img[role="menu"],
button img
{
  filter: invert(0);
};
`);
})();