// ==UserScript==
// @name         Adobe Firefly 下载
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Adobe Firefly 直接提供下载按钮, 无水印
// @license      AGPL-3.0-or-later
// @author       Y.V
// @match        *://firefly.adobe.com/*
// @icon         https://firefly.adobe.com/adobe_favicon.ico
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// ==/UserScript==
class AdobeFireflyDownloader {
    constructor() {
        this.init = false;
        this.initCanvas = false;
        this.initSpBtn = false;
        this.intervalId = null;
    }

    initialize() {
        this.intervalId = setInterval(this.main.bind(this), 1000);
    }

    createButton(text, clickHandler) {
        const buttonEl = $("<button class='test'>");
        buttonEl.text(text);
        buttonEl.css({
            display: "inline-block",
            position: "absolute",
            bottom: "10px",
            right: "10px",
            padding: "10px",
            "z-index": "9999",
            backgroundColor: "#4A90E2",
            color: "#FFF",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: "bold",
            textTransform: "uppercase",
            cursor: "pointer",
            outline: "none",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            transition: "background-color 0.3s ease",
        });

        buttonEl.hover(
            () => {
                buttonEl.css({
                    backgroundColor: "#357ACD",
                });
            },
            () => {
                buttonEl.css({
                    backgroundColor: "#4A90E2",
                });
            }
        );

        buttonEl.on("click", clickHandler);

        return buttonEl;
    }



    main() {
        const textToImages = $(".clio-thumbnail-wrapper img");
        const textEffectsCanvas = $("canvas")[0];
        const testEl = $(".test")[0];

        let generativeFill = $('sp-theme clio-inpaint')[0];

        let self = this;

        if (textToImages.length === 4) {
            if (!this.init) {
                textToImages.each(function () {
                    const buttonEl = self.createButton("下载图片", () => {
                        const linkEl = $("<a>");
                        const timestamp = Date.now();
                        const fileName = "image" + timestamp + ".jpg";
                        linkEl.attr("href", $(this).attr("src"));
                        linkEl.attr("download", fileName);
                        linkEl.css("display", "none");
                        $("body").append(linkEl);
                        linkEl[0].click();
                        linkEl.remove();
                    });

                    $(this).parent().parent().parent().parent().append(buttonEl);
                });

                this.init = true;
            }
        }

        if (!testEl) {

            const buttonEl = this.createButton("下载图片", () => {
                const dataURL = textEffectsCanvas.toDataURL("image/png");
                const link = $("<a>").attr({
                    "href": dataURL,
                    "download": "image" + Date.now() + ".png",
                }).appendTo("body");
                link[0].click();
                link.remove();
            });

            if (textEffectsCanvas) {
                textEffectsCanvas.parentElement.appendChild(buttonEl.get(0));
            }
        }

        if (generativeFill) {
            generativeFill = generativeFill.shadowRoot;
            const b = $(generativeFill).find('main clio-md-stage')[0].shadowRoot;
            const c = $(b).find('#container clio-md-compositor-canvas')[0].shadowRoot;
            const gfCanvas = $(c).find('canvas')[0];

            const buttonEl = this.createButton("下载图片", () => {
                const dataURL = gfCanvas.toDataURL("image/png");
                const link = $("<a>").attr({
                    "href": dataURL,
                    "download": "image" + Date.now() + ".png",
                }).appendTo("body");
                link[0].click();
                link.remove();
            });

            if (gfCanvas) {
                $(generativeFill)[0].appendChild(buttonEl.get(0));
            }
        }
    }

    initializeSpBtnListener() {
        setInterval(() => {
            const sp = $('sp-button');
            if (sp) {
                if (!this.initSpBtn) {
                    sp.click(() => {
                        this.init = false;
                        $('.test').remove();
                    });
                } else {
                    this.initSpBtn = true;
                }
            }
        }, 1000);
    }

    start() {
        this.initialize();
        this.initializeSpBtnListener();
    }

    stop() {
        clearInterval(this.intervalId);
    }
}

const downloader = new AdobeFireflyDownloader();
downloader.start();
