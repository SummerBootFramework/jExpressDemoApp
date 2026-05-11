$(document).ready(function () {
    UtilForm.init();
});
const UtilForm = {
    init: function () {
        $("form input").keyup(function (e) {
            //e.preventDefault();  //stop the browser from following);
            UtilForm.onInputChange(e, $(this), e.target.value);
        });
        $("form input").bind("paste", function (e) {
            //e.preventDefault();  //stop the browser from following);
            var pastedData = $(this).val() + e.originalEvent.clipboardData.getData('text');
            UtilForm.onInputChange(e, $(this), pastedData);
        });
    },

    getLabelOfInput: function ($this) {
        return $label = $('label[for="' + $this.attr("id") + '"]');
    },

    onInputChange: function (e, $this, newValue) {
        var lenth = newValue.length;
        var $label = UtilForm.getLabelOfInput($this);
        if (lenth > 0) {
            $label.addClass("inputed").fadeIn("slow");
        } else {
            $label.removeClass("inputed").fadeOut("slow");
        }
    },

    validForm: function (formId) {
        var allGood = true;
        var requiredWidgets = $("#" + formId + " input,textarea,select").filter('[required]:visible');
        requiredWidgets.each(function () {
            if ($(this).val() === '') {
                $(this).parent().addClass("missing");
                allGood = false;
            } else {
                $(this).parent().removeClass("missing");
            }
        });

        var doubleConfirmedWidgets = $("#" + formId + " input,textarea,select").filter('[data-confirm]:visible');
        doubleConfirmedWidgets.each(function () {
            var confirmWithId = $(this).attr("data-confirm");
            var $parent = $(this).parent();
            if ($(this).val() !== $("#" + confirmWithId).val()) {
                $parent.addClass("notmatch");
                allGood = false;
            } else {
                $parent.removeClass("notmatch");
            }
        });

        var emailWidgets = $("#" + formId + " div:not(.missing) input").filter('[type=\'email\']');
        emailWidgets.each(function () {
            var $parent = $(this).parent();
            if (!$parent.hasClass("missing") && !$parent.hasClass("notmatch")) {
                if (!UtilForm.isValidEmail($(this).val())) {
                    $parent.addClass("invalidEmail");
                    allGood = false;
                } else {
                    $parent.removeClass("invalidEmail");
                }
            }
        });

        var passwordWidgets = $("#" + formId + " div:not(.missing) input").filter('[type=\'password\']');
        passwordWidgets.each(function () {
            var $parent = $(this).parent();
            if (!$parent.hasClass("missing") && !$parent.hasClass("notmatch")) {
                if (!UtilForm.isValidPassword($(this).val())) {
                    $parent.addClass("invalidPassword");
                    allGood = false;
                } else {
                    $parent.removeClass("invalidPassword");
                }
            }
        });
        return allGood;
    },

    isValidEmail: function (email) {
        return /\S+@\S+\.\S+/.test(email) && !(/\s/.test(email));
    },
    isValidPassword: function (pwd) {
        return true;
        //password can't contain \ / : * ? " < > |
        // only the a-zA-Z0-9 characters and .!@#$%^&()_+-=, minimum length i.e. 6 characters
        var regex = /^[a-zA-Z0-9!@#\$%\^\&\)\(+=._-]{6,}$/g;
        return pwd.match(regex);
    },
    isStringPassword: function (pwd) {
        /*
         At least 1 uppercase character.
         At least 1 lowercase character.
         At least 1 digit.
         At least 1 special character.
         Minimum 8 characters.*/
        return pwd.match(/[a-z]/g) && pwd.match(
                /[A-Z]/g) && pwd.match(
                /[0-9]/g) && pwd.match(
                /[^a-zA-Z\d]/g) && pwd.length >= 8;
    }
};

const UtilTree = {
    initTree: function () {
        //1. jsTree search
        var to = false;
        $(".jsTreeSearch").keyup(function () {
            var jstreeId = $(this).attr("data-jstreeId");
            if (to) {
                clearTimeout(to);
            }
            to = setTimeout(function () {
                var v = $('#demo_q').val();
                $('#' + jstreeId).jstree(true).search(v);
            }, 250);
        });
        //2. jsTree
        $(".jsTree").jstree({
            "core": {
                'data': function (node, cb) {
                    //var path = this.get_path(node, '/');
                    var paths = this.get_path(node);
                    var path = "";
                    for (var i = 1; i < paths.length; i++) {
                        path += paths[i] + "/";
                    }
                    Gui.log("initTree.path=" + path);
                    var vars = {
                        parent: path
                    }
                    var $service = Server.api("POST", "/service/v1/folders", vars, "json");
                    $service.done(function (jsonData) {
                        //alert(JSON.stringify(jsonData));
                        cb(jsonData);
                    })
                },
//                'data': {
//                    'url': function (node) {
//                        if (node == -1) {
//                            return "/service/v1/folders";
//                        } else {
//                            return "/service/v1/folders?parentkey=" + node.data("key");
//                        }
//                    },
//                    'data': function (node) {
//                        return {'id': node.id};
//                    }
//                },
                'multiple': false,
                "animation": 0,
                "check_callback": true,
                'force_text': true,
                "themes": {"stripes": true}
            },
            'themes': {
                'responsive': false,
                'variant': 'small',
                'stripes': true
            },
            "types": {
                "#": {"max_children": 1, "max_depth": 4, "valid_children": ["root"]},
                "root": {"icon": "/web-resources/image/user-folder.png", "valid_children": ["default"]},
                "default": {"valid_children": ["default", "file"]},
                "file": {"icon": "glyphicon glyphicon-file", "valid_children": []}
            },
            "plugins": ["sort", "unique", "wholerow", "contextmenu", "dnd", "search", "types"]//, "state"
        }).on('delete_node.jstree', function (e, data) {
            UtilTree.onDelete(e, data);
        }).on('create_node.jstree', function (e, data) {
            UtilTree.onCreate(e, data);
        }).on('rename_node.jstree', function (e, data) {
            UtilTree.onRename(e, data);
        }).on('move_node.jstree', function (e, data) {
            UtilTree.onMove(e, data);
        }).on('copy_node.jstree', function (e, data) {
            UtilTree.onCopy(e, data);
        }).on('changed.jstree', function (e, data) {
            UtilTree.onChanged(e, data);
        });
        //$jsTree.show_dots();

        //3. interaction
        $(".jsTreeCreateNodeBtn").click(function (e) {
            e.preventDefault();  //stop the browser from following
            var jstreeId = $(this).attr("data-jstreeId");
            UtilTree.createNode(jstreeId, null);
        });
        $(".jsTreeRenameNodeBtn").click(function (e) {
            e.preventDefault();  //stop the browser from following
            var jstreeId = $(this).attr("data-jstreeId");
            UtilTree.renameNode(jstreeId, null);
        });
        $(".jsTreeDelNodeBtn").click(function (e) {
            e.preventDefault();  //stop the browser from following
            var jstreeId = $(this).attr("data-jstreeId");
            UtilTree.deleteNode(jstreeId);
        });
    },
    createNode: function (jstreeId, text) {
        var $jsTree = $("#" + jstreeId).jstree(true),
                sel = $jsTree.get_selected();

        if (!sel.length) {
            return false;
        }
        sel = sel[0];
        if (text === null) {
            sel = $jsTree.create_node(sel, {"type": "default"});
            if (sel) {
                $jsTree.edit(sel);
            }
        } else {
            var path = $jsTree.get_path(sel, '/');
            Gui.log("createNode=" + path + "/" + text);
            var newNode = $jsTree.create_node(sel, {"type": "default", "text": text});
            if (newNode) {
                $jsTree.open_node(sel);
            }
        }
    },
    renameNode: function (jstreeId, text) {
        var $jsTree = $("#" + jstreeId).jstree(true),
                sel = $jsTree.get_selected();
        if (!sel.length) {
            //$jsTree.refresh();
            return false;
        }
        sel = sel[0];
        var path = $jsTree.get_path(sel, '/');
        Gui.log("renameNode=" + path + " -> " + text);
        if (text === null) {
            $jsTree.edit(sel);
        } else {
            $jsTree.rename_node(sel, text);
        }
    },
    deleteNode: function (jstreeId) {
        var $jsTree = $("#" + jstreeId).jstree(true),
                sel = $jsTree.get_selected();
        if (!sel.length) {
            return false;
        }
        var path = $jsTree.get_path(sel, '/');
        Gui.log("deleteNode=" + path);
        $jsTree.delete_node(sel);
    },
    onDelete: function (e, data) {
        Gui.log("onDelete=" + data);
        if (data && data.selected && data.selected.length > 0) {
            if (data.selected.length === 1) {// single select
                var path = data.instance.get_path(data.node, '/');
                Gui.log("onDelete=" + path);
            } else {// multiple select

            }
        }
    },
    onCreate: function (e, data) {
        var path = data.instance.get_path(data.node, '/');
        var _new = data.parent;
        Gui.log("onCreate=" + path + ", new=" + _new);
    },
    onRename: function (e, data) {
        var selId = data.instance.get_selected()[0];
        var currentId = data.node.id;
        var isSame = selId === currentId;
        Gui.log(JSON.stringify(selId) + " -> " + JSON.stringify(currentId) + " = " + isSame);
        UtilTree.getpath(data, isSame);
        var old = data.old;
        var _new = data.text;

        var path = data.instance.get_path(data.node);
        Gui.log("e=" + e + ", onRename=" + path[0] + ", old=" + old + ", new=" + _new);
    },
    onMove: function (e, data) {
        data.instance.open_node(data.parent);
        //data.instance.select_node(data.node);
        var selId = data.instance.get_selected()[0];
        var currentId = data.node.id;
        var isSame = selId === currentId;
        UtilTree.getpath(data, isSame);
        var path = data.instance.get_path(data.node, '/');
        var old = data.old_parent;
        var _new = data.parent;
        Gui.log("onMove=" + path + ", old=" + old + ", new=" + _new);
    },
    onCopy: function (e, data) {
        var path = data.instance.get_path(data.node, '/');
        var old = data.old_parent;
        var _new = data.parent;
        Gui.log("onCopy=" + path + ", old=" + old + ", new=" + _new);
    },
    onChanged: function (e, data) {
        if (data && data.selected && data.selected.length > 0) {
            if (data.selected.length === 1) {// single select
                UtilTree.getpath(data, true);
                var p = data.instance.get_parent(data.node);

                var isRoot = p === "#";

            } else {// multiple select
                for (var i = 0; i < data.selected.length; i++) {
                    var data_i = data.selected[i];
                }
            }
        }
    },
    getpath: function (data, updatePath) {
        var paths = data.instance.get_path(data.node);
        var parent = "";
        for (var i = 0; i < paths.length - 1; i++) {
            parent += paths[i] + " > ";
        }
        if (updatePath) {
            $("#path .parentFolder").html(parent);
            $("#path .currentFolder").html(paths[paths.length - 1]);
            listFiles(paths);
        }
        return paths;
    }
};


const FILE_TEMPLATE = "<div class=\"tr\"><img src=\"/web-resources/image/pdf32.png\" alt=\"PDF\"><span class=\"index\"></span><span class=\"downloadable\">${fileName}</span></div>";
function listFiles(paths) {    
    //loading(true);
    var parent = "";
        for (var i = 1; i < paths.length; i++) {
            parent += paths[i] + "/";
        }
    //biz
    var data = {
        parent: parent
    };
    var $service = Server.api("POST", "/service/v1/files", data, "json");
    $service.done(function (jsonObj, textStatus, jqXHR) {
        $("#titleCaseName").html(jsonObj[0]);
        var $filelistDiv = $("#filelistDiv");
        $filelistDiv.empty();
        for (var i = 1; i < jsonObj.length; i++) {
            var fileName = jsonObj[i];
            Gui.log(fileName);
            var _html = FILE_TEMPLATE.replace("${fileName}", fileName);
            var $html = $(_html);
            Gui.log($html.html());
            $filelistDiv.append(_html);
        }
        bindDownloadable();
    }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401) {
            Gui.errorDlg("Wrong password");
        } else {
            var json = JSON.parse(jqXHR.responseText);
            Gui.errorDlg("(" + jqXHR.status + " - " + errorThrown + "): error#" + json.errors[0].errorCode);
        }
    }).always(function (data_jqXHR, textStatus, jqXHR_errorThrown) {
        //loading(false);
    });
}