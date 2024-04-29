export default (function () {
  "use strict";
  if (typeof window === "undefined") return;
  var CONSTANTS = {
    VERSION: "11.0",
    ENVIRONMENTS: {
      STAGE: "stage",
      SANDBOX: "sandbox",
      PRODUCTION: "production",
    },
    MAX_TIMEOUT: 15000,
    MIN_TIMEOUT: 1000,
    DEFAULT_TIMEOUT: 2800,
    SIGN_METHODS: {
      OTP: "otp",
      BIOMETRIC: "biometric",
    },
    URLS: {
      STAGE: "http://localhost:8083",
      // STAGE : "https://ext.digio.in",
      SANDBOX: "https://ext.digio.in",
      PRODUCTION: "https://app.digio.in",
      API_MANDATE_SUFFIX: "/#/enach-mandate-direct",
      ESIGN_SUFFIX: "/#/gateway/login",
      FIU_SUFFIX: "/#/fiu",
    },
    EXCEPTIONS: {
      MISSING_CONSTRUCTOR_CONFIG: {
        message:
          "Digio constructor requires configuration options for initialization.",
      },
      INVALID_ENVIRONMENT: {
        message: "Provided environment value is invalid.",
      },
      INVALID_EVENT_FILTER: {
        message: "Provided Event filter is not an array or is invalid.",
      },
      INVALID_EVENT_LISTENER: {
        message: "Provided callback method is not a function or is invalid.",
      },
      INVALID_METHOD: {
        message: "Provided signing method value is invalid.",
      },
      INVALID_DOCUMENT_ID: {
        message: "Provided document id is invalid.",
      },
      INVALID_IDENTIFIER: {
        message: "Provided email id or mobile number is invalid.",
      },
      INVALID_REDIRECT_URL: {
        message: "Provided redirect url string is invalid.",
      },
      INVALID_ERROR_URL: {
        message: "Provided error url string is invalid.",
      },
      INVALID_LOGO_URL: {
        message: "Provided logo url is invalid.",
      },
      INVALID_CALLBACK_METHOD: {
        message: "Provided callback method is not a function or is invalid.",
      },
      INVALID_IFRAME_INVOCATION: {
        message:
          "Provided iframe invocation value is invalid or not a boolean.",
      },
      INVALID_REDIRECTION_APPROACH_INVOCATION: {
        message:
          "Provided redirection approach value is invalid or not a boolean.",
      },
      INVALID_AUTH_TYPE: {
        message: "Provided auth type is invalid.",
      },
    },
    THEME: {
      PRIMARY_COLOR: "#2979BF",
      FONT_FAMILY: "",
      FONT_URL: "",
      FONT_FORMAT: "",
      // SECONDARY_COLOR: '#FFFFFF',
    },
    CLOSE_BTN_BASE64:
      "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAA60lEQVR42tXUPQqEMBAFYO+kYGFhYeFaWAm2qYyFlxBsraxELCzF1ip4Br2CR5klCyuLyeRni4UNTPf4ILxhHOfv3jzPMAwD6HJd1wFjTJ2r6xpc131NWZZoOMuyKzeOozzXtu0VUqGf2HuWZRHRKIqE4B2VYXwIISI4TZM0zIdSChjmeR5s2yb/dt/3KIph67qqizFFjTBT1ArTlcQnz3M7DCtAt1JfY8aoDaZFi6JQFqAqqmkaEU3TVNsmhlZVJYLHcUAQBNrVuKNxHMN5nvJv7/sOYRiC7/vKPePnjWNJkuCY7QOAx08O9BNR9VtE5qAr5wAAAABJRU5ErkJggg==",
  };

  var DigioException = function (err) {
    this.message = err.message;
    this.name = "DigioException";
  };

  DigioException.prototype.toString = function () {
    return this.name + ': "' + this.message + '"';
  };

  var digioService = {
    validateIdentifier: function (identifier) {
      if (!identifier) {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_IDENTIFIER);
      }
    },
    validateDocumentId: function (docId) {
      if (!docId) {
        throw new DigioException(
          CONSTANTS.EXCEPTIONS.INVALID_DOCUMENT_ID + " : Id Missing"
        );
      }
      if (Array.isArray(docId)) {
        if (docId.length === 0) {
          throw new DigioException(
            CONSTANTS.EXCEPTIONS.INVALID_DOCUMENT_ID + " : Array Is Empty"
          );
        } else {
          for (var i = 0; i < docId.length; i++) {
            if (!docId[i]) {
              throw new DigioException(
                CONSTANTS.EXCEPTIONS.INVALID_DOCUMENT_ID +
                  " : At Array Index = " +
                  i
              );
            }
          }
        }
      }
    },
    generateUrl: function (
      base_url,
      base_suffix,
      doc_id,
      txn_id,
      identifier,
      token_id,
      extendedConfig
    ) {
      var url = base_url + base_suffix;
      url += "/" + doc_id;
      url += "/" + txn_id;
      url += "/" + identifier;

      var params = [];
      var dlmtr = "&";

      if (token_id) {
        params.push("token_id=" + token_id);
      }
      if (extendedConfig.ver) {
        params.push("sdkver=" + extendedConfig.ver);
      }
      if (extendedConfig.logo) {
        params.push("logo=" + encodeURIComponent(extendedConfig.logo));
      }
      if (extendedConfig.redirectUrl) {
        params.push(
          "redirect_url=" + encodeURIComponent(extendedConfig.redirectUrl)
        );
      }
      if (extendedConfig.errorUrl) {
        params.push("error_url=" + encodeURIComponent(extendedConfig.errorUrl));
      }
      if (extendedConfig.method) {
        params.push("method=" + encodeURIComponent(extendedConfig.method));
      }
      if (extendedConfig.isIframe) {
        params.push("is_iframe=" + encodeURIComponent(extendedConfig.isIframe));
      }
      if (extendedConfig.docs) {
        params.push("docs=" + encodeURIComponent(extendedConfig.docs));
      }
      if (extendedConfig.timeout) {
        params.push(
          "redirect_timeout=" + encodeURIComponent(extendedConfig.timeout)
        );
      }
      if (extendedConfig.theme) {
        params.push(
          "theme=" + encodeURIComponent(JSON.stringify(extendedConfig.theme))
        );
      }

      if (extendedConfig.otherParams) {
        for (var param in extendedConfig.otherParams) {
          params.push(param + "=" + extendedConfig.otherParams[param]);
        }
      }

      if (params.length) {
        url += "?" + params.join(dlmtr);
      }

      return url;
    },
    detectIE: function () {
      var ua = window.navigator.userAgent,
        msie = ua.indexOf("MSIE ");
      if (msie > 0)
        return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
      var trident = ua.indexOf("Trident/");
      if (trident > 0) {
        var rv = ua.indexOf("rv:");
        return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
      }
      var edge = ua.indexOf("Edge/");
      return (
        edge > 0 && parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10)
      );
    },
  };

  var digioHandle = (window.Digio = function (t) {
    if (!t) {
      throw new DigioException(CONSTANTS.EXCEPTIONS.MISSING_CONSTRUCTOR_CONFIG);
    }
    if (t.callback) {
      if (typeof t.callback !== "function") {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_CALLBACK_METHOD);
      }
      this.callback = t.callback;
    }
    if (t.event_filter) {
      if (t.event_filter.constructor.name !== "Array") {
        throw new DigioException(CONSTANTS.EXCEPTIONS);
      }
      this.event_filter = t.event_filter;
    }
    if (t.event_listener) {
      if (typeof t.callback !== "function") {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_CALLBACK_METHOD);
      }
      this.event_listener = t.event_listener;
    }
    if (t.environment) {
      if (
        t.environment.toLowerCase() ===
          CONSTANTS.ENVIRONMENTS.STAGE.toLowerCase() ||
        t.environment.toLowerCase() ===
          CONSTANTS.ENVIRONMENTS.SANDBOX.toLowerCase() ||
        t.environment.toLowerCase() ===
          CONSTANTS.ENVIRONMENTS.PRODUCTION.toLowerCase()
      ) {
        this.environment = t.environment;
      } else {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_ENVIRONMENT);
      }
    }
    if (t.logo) {
      if (typeof t.logo !== "string") {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_LOGO_URL);
      }
      this.logo = t.logo;
    }
    if (t.redirect_timeout) {
      this.redirectTimeout =
        t.redirectTimeout > CONSTANTS.MAX_TIMEOUT
          ? CONSTANTS.MAX_TIMEOUT
          : t.redirectTimeout < CONSTANTS.MIN_TIMEOUT
          ? CONSTANTS.MIN_TIMEOUT
          : t.redirect_timeout;
    } else {
      this.redirectTimeout = CONSTANTS.DEFAULT_TIMEOUT;
    }
    if (t.method) {
      if (
        t.method === CONSTANTS.SIGN_METHODS.OTP ||
        t.method === CONSTANTS.SIGN_METHODS.BIOMETRIC
      ) {
        this.method = t.method;
      } else {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_METHOD);
      }
    }
    if (t.redirect_url) {
      if (typeof t.redirect_url !== "string") {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_REDIRECT_URL);
      }
      this.redirectUrl = t.redirect_url;
    }
    if (t.error_url) {
      if (typeof t.error_url !== "string") {
        throw new DigioException(CONSTANTS.EXCEPTIONS.INVALID_ERROR_URL);
      }
      this.errorUrl = t.error_url;
    }
    if (t.is_iframe) {
      if (typeof t.is_iframe !== "boolean") {
        throw new DigioException(
          CONSTANTS.EXCEPTIONS.INVALID_IFRAME_INVOCATION
        );
      }
      this.isIframe = t.is_iframe;
    }
    if (t.is_redirection_approach) {
      if (typeof t.is_redirection_approach !== "boolean") {
        throw new DigioException(
          CONSTANTS.EXCEPTIONS.INVALID_REDIRECTION_APPROACH_INVOCATION
        );
      }
      this.isRedirectionApproach = t.is_redirection_approach;
    }
    if (t.theme) {
      this.theme = {};
      if (t.theme.primaryColor) {
        this.theme.PRIMARY_COLOR = t.theme.primaryColor;
      } else {
        this.theme.PRIMARY_COLOR = CONSTANTS.THEME.PRIMARY_COLOR;
      }
      if (t.theme.secondaryColor) {
        this.theme.SECONDARY_COLOR = t.theme.secondaryColor;
      } else {
        this.theme.SECONDARY_COLOR = CONSTANTS.THEME.SECONDARY_COLOR;
      }
      if (t.theme.fontFamily) {
        this.theme.FONT_FAMILY = t.theme.fontFamily;
      }
      if (t.theme.fontUrl) {
        this.theme.FONT_URL = t.theme.fontUrl;
      }
      if (t.theme.fontFormat) {
        this.theme.FONT_FORMAT = t.theme.fontFormat;
      }
    } else {
      this.theme = CONSTANTS.THEME;
    }
    for (var env in CONSTANTS.ENVIRONMENTS) {
      digioHandle.prototype.URL[CONSTANTS.ENVIRONMENTS[env]] =
        CONSTANTS.URLS[env];
    }
    this.otherParams = {};
    for (var param in t) {
      if (!this.otherParams[param] && param.startsWith("dg_")) {
        this.otherParams[param.substring(3, param.length)] = t[param];
      }
    }
  });

  digioHandle.prototype = {
    version: CONSTANTS.VERSION,
    environment: CONSTANTS.ENVIRONMENTS.STAGE,
    method: CONSTANTS.SIGN_METHODS.OTP,
    URL: {},
    logo: null,
    redirectUrl: null,
    errorUrl: null,
    isIframe: false,
    isRedirectionApproach: false,
    documentId: null,
    txnId: null,
    popup: null,
    lastState: null,
    resultCaptured: false,
    result: null,
    iFrameId: null,
    iFrameObj: null,
    theme: {},

    callback: function (msg) {},

    getLoadingHtml: function (themecolor) {
      var theme = this.theme;
      var style =
        "<style>@-webkit-keyframes placeHolderShimmer{0%{background-position: -1000px 0}100%{background-position: 1000px 0}}@keyframes placeHolderShimmer{0%{background-position: -1000px 0}100%{background-position: 1000px 0}}.animated-background{z-index: 999;-webkit-animation-duration: 20s; animation-duration: 20s; -webkit-animation-fill-mode: forwards; animation-fill-mode: forwards; -webkit-animation-iteration-count: infinite; animation-iteration-count: infinite; -webkit-animation-name: placeHolderShimmer; animation-name: placeHolderShimmer; -webkit-animation-timing-function: linear; animation-timing-function: linear; background: transparent; background: -webkit-gradient(linear, left top, right top, color-stop(28%, transparent), color-stop(68%, " +
        theme.SECONDARY_COLOR +
        "14), color-stop(92%, transparent)); background: -webkit-linear-gradient(left, transparent 28%, #" +
        theme.SECONDARY_COLOR +
        "14 68%, transparent 92%); background: linear-gradient(to right, transparent 28%, #" +
        theme.SECONDARY_COLOR +
        "14 68%, transparent 92%); -webkit-background-size: 100% 100%; background-size: 100% 100%; height: 100%; width : 100%; top : 0; position: absolute;}</style>";

      var html =
        style +
        "<div class='animated-background'></div><div style=\"background: " +
        theme.PRIMARY_COLOR +
        ';position: relative; height: 100%; width: 100%;"><div style="position: absolute;width: 100%;height: 20px;top: 20%;text-align: center;color: ' +
        theme.SECONDARY_COLOR +
        ';font-weight: 300;font-family: Helvetica;"> Live paperless with Digio </div><div style="position: absolute;width: 100%;height: 20px;top: calc(50% - 20px);text-align: center;font-weight: 300;color: ' +
        theme.SECONDARY_COLOR +
        ';font-family: Helvetica;font-size: 85%;"> Please wait... </div><div style="position: absolute;width: 100%;height: 20px;top: calc(50%);text-align: center;color: ' +
        theme.SECONDARY_COLOR +
        ';font-weight: 300;font-family: Helvetica;font-size: 85%;"> Preparing your document </div><div style="position: absolute;bottom: 7px;width: 100%;font-family: Helvetica;color: ' +
        theme.SECONDARY_COLOR +
        ';font-size: 65%; text-align: center; font-weight : 300;"> Licensed application for <br/> Aadhaar eSign and Digital Signature Certificates </div></div>';
      return html;
    },

    reset: function () {
      this.result = null;
      this.popup = null;
      this.interval = null;
      this.resultCaptured = false;
      this.lastState = null;
      this.iFrameId = null;
      this.iFrameObj = null;
    },

    _handleFunnelEvent: function (event) {
      if (this.event_filter) {
        if (this.event_filter.includes(event.data.event)) {
          this.event_listener(event.data);
        }
        return;
      }
      this.event_listener(event.data);
    },

    receiveMessage: function (event) {
      var data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        data = event.data;
      }
      if (typeof data !== "object") {
        return;
      }
      if (data && data.entity) {
        if (this.popup && this.popup === event.source) {
          this._handleFunnelEvent(event);
        }
        return;
      }
      if (
        data !== undefined &&
        data.action !== undefined &&
        data.action === "close" &&
        data.popup !== undefined &&
        data.popup === "iframe"
      ) {
        this.cancel();
      }
      if (
        data !== undefined &&
        data.txn_id !== undefined &&
        data.txn_id === this.txnId + "-state" &&
        event.origin === this.URL[this.environment]
      ) {
        if (data.hasOwnProperty("current_state")) {
          var current_state = data.current_state;
          this.lastState = current_state;
          if (
            current_state.hasOwnProperty("success") &&
            current_state.hasOwnProperty("result") &&
            current_state.success === true
          ) {
            this.resultCaptured = true;
            this.result = current_state.result;
          }
        }
      } else if (
        data !== undefined &&
        data.txn_id !== undefined &&
        data.txn_id === this.txnId &&
        event.origin === this.URL[this.environment]
      ) {
        if (data.hasOwnProperty("message")) {
          this.result = data;
          this.resultCaptured = true;
          if (this.isIframe) {
            this.popup.close();
            this.iFrameObj.closed = true;
            document.body.removeChild(
              document.getElementById("parent" + this.iFrameId)
            );
          } else {
            this.popup.close();
          }
          return this;
        }
      }
    },

    init: function () {
      this.reset();
      var isIE = digioService.detectIE(),
        newWidth = Math.max(
          isIE ? 0.4 * window.innerWidth : 0.35 * screen.width,
          450
        ),
        newHeight = Math.max(
          isIE ? 0.9 * window.innerHeight : 0.7 * screen.height,
          630
        ),
        left = isIE ? 0.25 * window.innerWidth : 0.33 * screen.width,
        top = 0.15 * (isIE ? window.innerHeight : screen.height);
      top = (isIE ? window.innerHeight : screen.height) * 0.03;
      var that = this;
      if (this.isRedirectionApproach) {
        if (this.redirectUrl) {
          this.isRedirectionApproach = true;
        } else {
          this.isRedirectionApproach = false;
        }
      } else if (this.isIframe) {
        this.iFrameId = "digio-ifm-" + Date.now();
        var iframeContainer = document.createElement("div");
        iframeContainer.setAttribute("id", "parent" + this.iFrameId);
        iframeContainer.style.cssText =
          "position: fixed; overflow: auto; z-index : 999999; width : 100%; height : 100%; " +
          "background : rgba(0,0,0,0.6); left: 0; top : 0; " +
          "text-align:center;";
        document.body.appendChild(iframeContainer);

        var iframeWrapper = document.createElement("div");
        iframeWrapper.setAttribute("id", "wrapper" + this.iFrameId);

        iframeWrapper.style.cssText =
          "position: absolute; overflow: auto; z-index : 999999; width : " +
          newWidth +
          "px; height : " +
          newHeight +
          "px; background : white; left: calc(50% - " +
          newWidth / 2 +
          "px); top : " +
          top +
          "px; " +
          "text-align:center; border-radius: 5px;";

        iframeContainer.appendChild(iframeWrapper);

        var closeIframeBtn = document.createElement("img");
        closeIframeBtn.style.cssText =
          "position: absolute;right: 5px;height: 14px;width: 14px;top: 7px;cursor: pointer;";
        closeIframeBtn.setAttribute(
          "src",
          "data:image/gif;base64," + CONSTANTS.CLOSE_BTN_BASE64
        );
        closeIframeBtn.onclick = function () {
          var iframe = window.document.getElementById("parent" + that.iFrameId);
          iframe.parentNode.removeChild(iframe);
          that.popup = null;
        };
        iframeWrapper.appendChild(closeIframeBtn);

        var centreTextEl = document.createElement("span");
        centreTextEl.style.cssText =
          "position: absolute; left: calc(50% - 50px); width : 100px; top: 8px; font-size: 12px; color: gray; text-decoration: underline;";
        // centreTextEl.innerHTML =
        //   "<span>Powered By <a href='https://www.digio.in' target='_blank' style='color: #0261b0'>Digio</a></span>";
        iframeWrapper.appendChild(centreTextEl);

        var contentLoader = document.createElement("div");
        contentLoader.style.cssText =
          "position: absolute; height: calc(100% - 20px) ;width: 100%; top : 20px; left : 0; margin : 0;z-index: 9999999;";
        contentLoader.innerHTML = that.getLoadingHtml(that.logo, true);
        contentLoader.setAttribute("id", "dgo-ldr-" + this.iFrameId);
        iframeWrapper.appendChild(contentLoader);

        var iframe = document.createElement("iframe");
        iframe.style.cssText =
          "position: absolute; overflow: auto; z-index : 999999; width : 100%; height : calc(100% - 20px); background : white; left: 0; top : 20px; " +
          "border: 0; text-align:center;";
        iframe.setAttribute("id", this.iFrameId);
        iframe.setAttribute("src", "");
        iframe.setAttribute("allow", "geolocation *; microphone *; camera *;");
        iframeWrapper.appendChild(iframe);
        this.iFrameObj = iframe;
        this.popup =
          iframe.contentWindow || window.frames[window.frames.length - 1];
        this.isIframe = true;

        if (window.ResizeObserver) {
          let resizeObserver = new ResizeObserver((entries) => {
            let width = 450;
            let height = 630;
            for (let entry of entries) {
              if (entry.contentBoxSize) {
                let contentBoxSize = entry.contentBoxSize[0];
                width = contentBoxSize.inlineSize;
                height = contentBoxSize.blockSize;
              } else {
                width = entry.contentRect.width;
                height = entry.contentRect.height;
              }
            }
            iframeWrapper.style.width = width < 450 ? width : 450;
            iframeWrapper.style.left =
              width < 450 ? 0 : (width - iframeWrapper.offsetWidth) / 2;
            iframeWrapper.style.height = height < 630 ? height : 630;
            iframeWrapper.style.top = height < 657 ? 0 : 27;
          });
          resizeObserver.observe(iframeContainer);
        } else {
          let width = iframeContainer.offsetWidth;
          let height = iframeContainer.offsetHeight;
          iframeWrapper.style.width = width < 450 ? width : 450;
          iframeWrapper.style.left =
            width < 450 ? 0 : (width - iframeWrapper.offsetWidth) / 2;
          iframeWrapper.style.height = height < 630 ? height : 630;
          iframeWrapper.style.top = height < 657 ? 0 : 27;
        }
      } else {
        this.popup = window.open(
          "",
          "",
          "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=1,width=" +
            newWidth +
            ",height=" +
            newHeight +
            ",top=" +
            top +
            ", left=" +
            left
        );
        this.popup.document.body.style.margin = 0;
        this.popup.document.body.style.padding = 0;
        this.popup.document.body.innerHTML = that.getLoadingHtml(
          that.logo,
          false
        );
      }
      try {
        window.addEventListener(
          "message",
          this.receiveMessage.bind(this),
          false
        );
      } catch (e) {
        window.attachEvent("onmessage", this.receiveMessage.bind(this));
      }
      var interval = window.setInterval(function () {
        var resObj = {};
        try {
          if (that.isIframe && that.iFrameObj.closed) {
            if (interval !== undefined) {
              window.clearInterval(interval);
            }
            if (that.resultCaptured) {
              if (self.lastState !== undefined) {
                if (self.lastState.hasOwnProperty("result")) {
                  delete self.lastState.result;
                }
                self.result.last_state = self.lastState;
              }
              that.callback(that.result);
            } else {
              resObj = {
                digio_doc_id: that.documentId,
                error_code: "CANCELLED",
                message: that.getErrorMessage(that.documentId),
              };
              if (that.lastState !== undefined) {
                resObj.last_state = that.lastState;
              }
              that.callback(resObj);
            }
          } else if (that.popup == null || that.popup.closed) {
            if (interval !== undefined) {
              window.clearInterval(interval);
            }
            if (that.resultCaptured) {
              if (self.lastState !== undefined) {
                if (self.lastState.hasOwnProperty("result")) {
                  delete self.lastState.result;
                }
                self.result.last_state = self.lastState;
              }
              that.callback(that.result);
            } else {
              resObj = {
                digio_doc_id: that.documentId,
                error_code: "CANCELLED",
                message: that.getErrorMessage(that.documentId),
              };
              if (that.lastState !== undefined) {
                resObj.last_state = that.lastState;
              }
              that.callback(resObj);
            }
          }
        } catch (e) {
          throw e;
        }
      }, 1000);
    },

    getErrorMessage: function (docId) {
      const docIdPrefix = docId?.startsWith("EN")
        ? docId?.substring(0, 2).toUpperCase()
        : docId?.substring(0, 3).toUpperCase();
      switch (docIdPrefix) {
        case "EN": // Enach
          const suffix = docId?.slice(docId?.length - 2, docId?.length);
          if (suffix === "AP") {
            return "Mandate Authentication Cancelled.";
          } else if (suffix === "UP") {
            return "UPI Authentication Cancelled";
          } else if (suffix === "ES") {
            return "Mandate Signing Authentication Cancelled";
          }
          return "Physical Mandate Authentication Cancelled";
        case "RID": // Digilocker
          return "Digilocker Process Cancelled";
        case "KID": // KYC
          return "KYC Process Cancelled";
        case "FID":
          return "Form Process Cancelled";
        case "CRD":
          return "Consent Signing Cancelled";
        default:
          return "Signing Cancelled";
      }
    },

    getOptionValues: function (option) {
      option = option.toUpperCase();
      if (CONSTANTS.hasOwnProperty(option)) {
        return Object.values(CONSTANTS[option]);
      }
    },

    submit: function (ids, identifier, token_id) {
      try {
        digioService.validateDocumentId(ids);
        digioService.validateIdentifier(identifier);

        if (Array.isArray(ids)) {
          return this.esign(ids, identifier, token_id);
        } else if (
          typeof ids === "string" &&
          ids.slice(0, 3) === "ENA" &&
          ids.slice(ids.length - 2, ids.length) === "AP"
        ) {
          return this.enachApiSign(ids, identifier, token_id);
        } else {
          return this.esign(ids, identifier, token_id);
        }
      } catch (err) {
        console.error(err);
      }
    },
    enachApiSign: function (id, identifier, token_id) {
      this.documentId = id;
      this.txnId = Math.random().toString(36).slice(2);

      var extendedConfig = {
        ver: this.version,
        logo: this.logo,
        redirectUrl: this.redirectUrl,
        errorUrl: this.errorUrl,
        method: this.method,
        isIframe: this.isIframe,
        theme: this.theme,
        timeout: this.redirectTimeout,
      };

      if (this.otherParams && Object.keys(this.otherParams).length > 0) {
        extendedConfig.otherParams = this.otherParams;
      }

      var url = CONSTANTS.URLS.API_MANDATE_SUFFIX;
      if (token_id) {
        url = CONSTANTS.URLS.ESIGN_SUFFIX;
      }

      var assign_url = digioService.generateUrl(
        this.URL[this.environment],
        url,
        this.documentId,
        this.txnId,
        identifier,
        token_id,
        extendedConfig
      );

      if (this.isRedirectionApproach) {
        return window.location.assign(assign_url);
      }

      if (this.isIframe) {
        var ldr = document.getElementById("dgo-ldr-" + this.iFrameId);
        ldr.parentNode.removeChild(ldr);
      }
      if (this.popup === undefined) {
        this.init();
      }

      this.popup.location = assign_url;
    },
    esign: function (ids, identifier, token_id) {
      digioService.validateDocumentId(ids);
      digioService.validateIdentifier(identifier);
      if (
        typeof ids === "string" &&
        ids.slice(0, 3) === "ENA" &&
        ids.slice(ids.length - 2, ids.length) === "AP"
      ) {
        return this.enachApiSign(ids, identifier);
      }

      var primaryId = null;
      if (Array.isArray(ids)) {
        ids.map(function (id) {
          return id.toString();
        });
        primaryId = ids.shift();
      } else {
        primaryId = ids.toString();
      }

      this.documentId = primaryId;
      this.txnId = Math.random().toString(36).slice(2);

      var extendedConfig = {
        ver: this.version,
        logo: this.logo,
        redirectUrl: this.redirectUrl,
        errorUrl: this.errorUrl,
        method: this.method,
        isIframe: this.isIframe,
        theme: this.theme,
        timeout: this.redirectTimeout,
      };

      if (this.otherParams && Object.keys(this.otherParams).length > 0) {
        extendedConfig.otherParams = this.otherParams;
      }

      if (Array.isArray(ids)) {
        extendedConfig.docs = ids;
      }

      var url = digioService.generateUrl(
        this.URL[this.environment],
        CONSTANTS.URLS.ESIGN_SUFFIX,
        this.documentId,
        this.txnId,
        identifier,
        token_id,
        extendedConfig
      );

      if (this.isRedirectionApproach) {
        return window.location.assign(url);
      }

      if (this.isIframe) {
        var ldr = document.getElementById("dgo-ldr-" + this.iFrameId);
        ldr.parentNode.removeChild(ldr);
      }
      if (this.popup === undefined) {
        this.init();
      }

      this.popup.location = url;
    },
    cancel: function () {
      var that = this;
      if (that.popup) {
        try {
          if (!that.isIframe) {
            that.popup.close();
          } else {
            var iframe = window.document.getElementById(
              "parent" + that.iFrameId
            );
            iframe.parentNode.removeChild(iframe);
            that.popup = null;
          }
        } catch (e) {
          that.popup = null;
        }
      }
    },
  };

  String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function (item) {
      var intVal = parseInt(item.substring(1, item.length - 1));
      var replace;
      if (intVal >= 0) {
        replace = args[intVal];
      } else if (intVal === -1) {
        replace = "{";
      } else if (intVal === -2) {
        replace = "}";
      } else {
        replace = "";
      }
      return replace;
    });
  };

  String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");
})();
