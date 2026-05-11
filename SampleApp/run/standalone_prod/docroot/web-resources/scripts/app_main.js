const ContextRoot = "/sampleapp/service/v1/";

$(document).ready(function () {
    $("#signupBtn").click(function (e) {
        e.preventDefault();  //stop the browser from following
        var allGood = UtilForm.validForm("signupForm");
        if (!allGood) {
            return;
        }
        var code = $("#invitationCode").val();
        var uid = $("#signup-email").val();
        var pwd = $("#signup-password").val();
        signup(code, uid, pwd);
    });
    $("#loginBtn").click(function (e) {
        e.preventDefault();  //stop the browser from following
        var allGood = UtilForm.validForm("loginForm");
        if (!allGood) {
            return;
        }
        var uid = $("#email").val();
        var pwd = $("#password").val();
        login(uid, pwd);
    });

    $("#logoutBtn").click(function (e) {
        e.preventDefault();  //stop the browser from following
        if ($(this).hasClass("disabled")) {
            return;
        }
        logout();
        UtilLayout.changeMenu("app-home");
    });

    // set uer login status
    var token = Util.getStorageItem(STORAGE_KEY_TOKEN);
    setUserLoginStatus(token !== null);

    UtilLayout.splitWndDragElement("app-filing", "H");
    UtilLayout.splitWndDragElement("app-serving", "H");
    UtilTree.initTree();


    //last step:
    $("body").removeClass("loading");
});


function signup(code, uid, pwd) {
    UtilLayout.loading(true);
    //biz
    var data = {
        code: code,
        j_username: uid,
        j_password: pwd
    };
    var $service = Server.api("POST", ContextRoot + "signup", data, "text");
    $service.done(function (jsonObj, textStatus, jqXHR) {
        Gui.errorDlg("done:" + jsonObj.uid + " - " + jqXHR.getResponseHeader("X-Requester-TOKEN"));
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
            Gui.errorDlg("Invalid account");
        } else {
            Gui.errorDlg("(" + jqXHR.status + " - " + errorThrown + "): error#" + jqXHR.responseText);
        }
    }).always(function (data_jqXHR, textStatus, jqXHR_errorThrown) {
        UtilLayout.loading(false);
    });
}

function login(uid, pwd) {
    login_formBased(uid, pwd);
    //login_jsonBased(uid, pwd);
}

function login_formBased(uid, pwd) {
    UtilLayout.loading(true);
    //biz
    var data = {
        j_username: uid,
        j_password: pwd
    };
    var $service = Server.api_noauth("POST", ContextRoot + "j_security_check", data, "json");
    $service.done(function (jsonObj, textStatus, jqXHR) {
        var token = jqXHR.getResponseHeader("X-AuthToken");
        Util.setStorageItem(STORAGE_KEY_TOKEN, token);
        var uid = jsonObj.uid;
        Util.setStorageItem("uid", uid);
        $("#email").val("");
        $("#password").val("");
        setUserLoginStatus(true);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
            Gui.errorDlg("Invalid account");
        } else {
            var json = JSON.parse(jqXHR.responseText);
            Gui.errorDlg("(" + jqXHR.status + " - " + errorThrown + "): error#" + json.errors[0].errorCode);
        }
    }).always(function (data_jqXHR, textStatus, jqXHR_errorThrown) {
        UtilLayout.loading(false);
    });
}

function login_jsonBased(uid, pwd) {
    UtilLayout.loading(true);
    //biz
    const obj = {username: uid, password: pwd};
    const json = JSON.stringify(obj);
    var $service = Server.api("POST", ContextRoot + "login", json, "json");
    $service.done(function (jsonObj, textStatus, jqXHR) {
        var token = jqXHR.getResponseHeader("X-AuthToken");
        Util.setStorageItem(STORAGE_KEY_TOKEN, token);
        var uid = jsonObj.uid;
        Util.setStorageItem("uid", uid);
        $("#email").val("");
        $("#password").val("");
        setUserLoginStatus(true);
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
            Gui.errorDlg("Invalid account");
        } else {
            var json = JSON.parse(jqXHR.responseText);
            Gui.errorDlg("(" + jqXHR.status + " - " + errorThrown + "): error#" + json.errors[0].errorCode);
        }
    }).always(function (data_jqXHR, textStatus, jqXHR_errorThrown) {
        UtilLayout.loading(false);
    });
}

function logout() {
    UtilLayout.loading(true);
    var $service = Server.api("GET", ContextRoot + "logout", null, "text");
    $service.always(function (data_jqXHR, textStatus, jqXHR_errorThrown) {
        Util.setStorageItem(STORAGE_KEY_TOKEN, null);
        Util.setStorageItem("uid", null);
        setUserLoginStatus(false);
        UtilLayout.loading(false);
    });
}

function setUserLoginStatus(isSuccess) {
    if (isSuccess) {
        $(".navbar .realmMenu").removeClass("disabled");
        $("#loginMenu").addClass("disabled");
        $("#getStartedBtn").hide();
        UtilLayout.changeMenu("app-filing");
    } else {
        $(".navbar .realmMenu").addClass("disabled");
        $("#loginMenu").removeClass("disabled");
        $("#getStartedBtn").show();
        UtilLayout.changeMenu("app-home");
    }
}