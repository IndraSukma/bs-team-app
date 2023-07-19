/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!********************************!*\
  !*** ./src/assets/js/index.js ***!
  \********************************/
// import '../scss/index.scss'

const swiper = new Swiper(".swiper", {
  slidesPerView: 1,
  spaceBetween: 32,
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    992: {
      slidesPerView: 3,
    },
  },
  navigation: {
    nextEl: ".btn.swiper-next",
    prevEl: ".btn.swiper-prev",
  },
})

/******/ })()
;
//# sourceMappingURL=index.js.map