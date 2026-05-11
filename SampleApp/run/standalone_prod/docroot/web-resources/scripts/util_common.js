/* 
 Created on : 31-Jan-2018, 6:39:55 PM
 Author     : Changski Tie Zheng Zhang
 JS Compress: https://jscompress.com/
 */

var $ = jQuery.noConflict();

const STORAGE_KEY_TOKEN = 'authtoken';
const STORAGE_KEY_LAT = 'lat';
const CONTENT_TYPE_FORM = "application/x-www-form-urlencoded; charset=UTF-8";
const CONTENT_TYPE_JSON = "application/json; charset=UTF-8";

const Util = {
    getStorage: function (isKeepMySignin) {
        var $sessionStorage = null;
        var $localStorage = null;
        var error = "";
        try {
            sessionStorage.getItem("test");
            $sessionStorage = sessionStorage;
        } catch (ex) {
            error += "\n sessionStorage is NOT supported by your browser: " + ex;
        }
        try {
            localStorage.getItem("test");
            $localStorage = localStorage;
        } catch (ex) {
            error += "\n localStorage is NOT supported by your browser: " + ex;
        }
        var ret = isKeepMySignin ? $localStorage : $sessionStorage;
        if (ret === null) {
            alert(error);
        }
        return ret;
    },
    getStorageItem: function (key) {
        var $storage = Util.getStorage(true);
        if ($storage !== null) {
            return $storage.getItem(key);
        } else {
            return null;
        }
    },
    setStorageItem: function (key, value) {
        var $storage = Util.getStorage(true);
        if ($storage !== null) {
            if (value === null) {
                $storage.removeItem(key, value);
            } else {
                $storage.setItem(key, value);
            }
        }
    },
    pdfAsDataUri: function (base64String) {
        return "data:application/pdf;base64," + escape(base64String);
    },
    imageAsDataUri: function (base64String) {
        return "data:image/png;base64," + escape(base64String);
    },
    buildImageBlock: function (uri, alt) {
        return $("<img></img>").attr('src', uri).attr('alt', alt);
    },
    buildPdfBlock: function (uri) {
        //var $embed = $("<embed/>").attr('type', 'application/pdf').attr('src', uri);
        return $("<object/>").attr('type', 'application/pdf').attr('data', uri);//.append($embed);
    },
    download: function (uri, filename, type) {
//        var a = document.createElement('a');
//        a.href = uri;
//        if (typeof filename !== 'undefined') {
//            alert("filename="+filename);
//            a.download = filename; //'my.pdf';
//        }
//        if (typeof type !== 'undefined') {
//            a.type = type; //'application/pdf';
//        }
//        a.click();
        window.location.href = uri;
    },

    messageDlg: function (_type, _title, message, _onDlgClose) {
        modal({
            type: _type, //Type of Modal Box (alert | confirm | prompt | success | warning | error | info | inverted | primary)
            title: _title,
            text: message,
            center: true,
            closeClick: false,
            callback: _onDlgClose,
            buttons: [{
                    text: 'Close',
                    val: true,
                    onClick: function (e) {
                        return true;
                    }
                }]
        });
    },

    showProcessing: function () {
        $(".mdlg").remove();
        return $('<div class="mdlg"></div>').appendTo('body')
                .html("<div class='img-container processingDiv' style='text-align:center;margin-left: auto;margin-right: auto;'></div>")
                .dialog({
                    modal: true,
                    title: 'Processing...',
                    zIndex: 1050,
                    autoOpen: true,
                    width: 280,
                    resizable: false,
                    closeOnEscape: false,
                    open: function (event, ui) {
                        $(".ui-dialog-titlebar-close", ui.dialog | ui).hide();
                        //$(".ui-button-text").remove();
                    }
                });
    }
};

const Server = {
    preCheck: function () {
        var now = new Date().getTime();
        var lastAccessedTime = Util.getStorageItem(STORAGE_KEY_LAT);
        Util.setStorageItem(STORAGE_KEY_LAT, now);
        var diff = now - lastAccessedTime;
        if (isNaN(diff) || diff > 600000) {//10 minutes
            // TODO: logoutServerRequest();
            Util.setStorageItem(STORAGE_KEY_TOKEN, null);
        }
    },

    // responseDataType = json, xml, html, script, jsonp, or text
    api_noauth: function (method, endpoint, _data, responseDataType) {
        Server.preCheck();
        //let uri = "https://" + $("#j_host").val() + "/" + contextRoot + "/" + endpoint;
        let uri = endpoint;
        Gui.log(uri);
        return $.ajax({
            cache: false,
            crossDomain: true,
            headers: {
                //"i18n": "test",
                "Content-Type": CONTENT_TYPE_JSON
            },
            type: method,
            url: uri,
            data: _data,
            dataType: responseDataType === null ? "json" : responseDataType,
            statusCode: {
                201: this.done
            }
        }).done(function (jsonObj, textStatus, jqXHR) {
            //alert("done: " + jqXHR.status);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            //alert("fail: " + jqXHR.status);
        }).always(function (data_jqXHR, textStatus, jqXHR_errorThrown) {
            //alert("finished: " + textStatus);
        });
    },

    // responseDataType = json, xml, html, script, jsonp, or text
    api: function (method, endpoint, _data, responseDataType) {
            Server.preCheck();
            //let uri = "https://" + $("#j_host").val() + "/" + contextRoot + "/" + endpoint;
            let uri = endpoint;
            Gui.log(uri);
            return $.ajax({
                cache: false,
                crossDomain: true,
                headers: {
                    //"i18n": "test",
                    "Content-Type": CONTENT_TYPE_JSON,
                    "Authorization": "Bearer " + Util.getStorageItem(STORAGE_KEY_TOKEN)
                },
                type: method,
                url: uri,
                data: _data,
                dataType: responseDataType === null ? "json" : responseDataType,
                statusCode: {
                    201: this.done
                }
            }).done(function (jsonObj, textStatus, jqXHR) {
                //alert("done: " + jqXHR.status);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                //alert("fail: " + jqXHR.status);
            }).always(function (data_jqXHR, textStatus, jqXHR_errorThrown) {
                //alert("finished: " + textStatus);
            });
        },

    onAjaxFail: function (title, jqXHR, textStatus, errorThrown) {
        log(' (status#' + +jqXHR.status + ' - ' + errorThrown + '): ' + textStatus);
        var error = "<summary style='color: red;'>HTTP Status: " + jqXHR.status + "</summary>" +
                "<summary style='color: red;'>HTTP Message: " + jqXHR.responseText + "</summary>" +
                "<summary style='color: red;'>Error textStatus: " + textStatus + "</summary>" +
                "<summary style='color: red;'>Error thrown: " + errorThrown + "</summary>";
        errorDlg(error);
    }
};

const Gui = {
    log: function (msg) {
        if (console && console.log) {
            console.log(msg);
        }
    },

    errorDlg: function (msg) {
        alert(msg);
    }
};