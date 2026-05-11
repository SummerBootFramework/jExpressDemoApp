$(document).ready(function () {
    UtilLayout.initAppMenu();
    UtilLayout.initTree();
//    UtilLayout.onWindowResize(10);
//    $(window).resize(function () {
//       UtilLayout.onWindowResize(10);
//    });
});

const UtilLayout = {
    onWindowResize: function (paddingBottom_of_layout_fixed_header) {
        var paddingTop = $(".layout-fixed-header").height() + paddingBottom_of_layout_fixed_header;
        $("body.layout-body-fixed-header-footer").css('padding-top', (paddingTop) + 'px');
    },

    initAppMenu: function () {
        //$(".navbar a.main-menu:not(.disabled)").click(function (e) {
        $(".navbar a.main-menu").click(function (e) {
            e.preventDefault();  //stop the browser from following
            if ($(this).hasClass("disabled")) {
                return;
            }
            var targetDivId = $(this).attr("data-divId");
            UtilLayout.changeMenu(targetDivId);
        });

        $(".pageRef").click(function (e) {
            e.preventDefault();  //stop the browser from following
            var targetDivId = $(this).attr("data-divId");
            UtilLayout.changeMenu(targetDivId);
        });
    },

    changeMenu: function (targetDivId) {
        var currentId = $(".navbar a.main-menu.active").attr("data-divId");
        Gui.log(currentId + " --> " + targetDivId);
        //1. show view
        //var targetDivId = $targetMenu.attr("data-divId");
        $(".appPage.active").removeClass("active");
        $("#" + targetDivId).addClass("active").fadeIn("slow");
        $(".layout-mainView").removeClass(currentId).addClass(targetDivId);

        //2. switch menu        
        var $targetMenu = $(".navbar a.main-menu[data-divId='" + targetDivId + "']");
        if ($targetMenu.attr("data-divId") === undefined) {
            // do NOT change menu when there target menu does not exist (same menu with multiple pages)
            return;
        }
        //$(".appPage.active").fadeOut("fast");
        $(".navbar .active").removeClass("active");
        $targetMenu.addClass("active");
        //$targetMenu.parent().prev(".navbar button.main-menu").addClass("active");
        var $subMenuRoot = $targetMenu.closest("div.subnav");
        Gui.log("parent=" + $subMenuRoot.length);
        if ($subMenuRoot.length > 0) {
            $subMenuRoot.find("button.main-menu").addClass("active");
        }
    },

    loading: function (isLoading) {
        if (isLoading) {
            //$("#loadingView").removeClass("loaded");
            $("body").addClass("loading");
            $("#contentView").css("cursor", "wait");
        } else {
            //$("#loadingView").addClass("loaded");
            $("body").removeClass("loading");
            $("#contentView").css("cursor", "default");
        }
    },

    splitWndDragElement: function (viewId, direction) {
        var md; // remember mouse down info
        const element = $("#" + viewId + " .separator")[0];
        const first = $("#" + viewId + " .leftPanel")[0];
        const second = $("#" + viewId + " .rightPanel")[0];

        element.onmousedown = onMouseDown;

        function onMouseDown(e) {
            //console.log("mouse down: " + e.clientX);
            md = {e,
                offsetLeft: element.offsetLeft,
                offsetTop: element.offsetTop,
                firstWidth: first.offsetWidth,
                secondWidth: second.offsetWidth};
            document.onmousemove = onMouseMove;
            document.onmouseup = () => {
                //console.log("mouse up");
                document.onmousemove = document.onmouseup = null;
            };
        }

        function onMouseMove(e) {
            //console.log("mouse move: " + e.clientX);
            var delta = {x: e.clientX - md.e.clientX,
                y: e.clientY - md.e.clientY};

            if (direction === "H") // Horizontal
            {
                // prevent negative-sized elements
                delta.x = Math.min(Math.max(delta.x, -md.firstWidth),
                        md.secondWidth);

                element.style.left = md.offsetLeft + delta.x + "px";
                first.style.width = (md.firstWidth + delta.x) + "px";
                second.style.width = (md.secondWidth - delta.x) + "px";
            }
        }
    },

    initTree: function () {
        var toggler = document.getElementsByClassName("treeParent");
        for (var i = 0; i < toggler.length; i++) {
            UtilLayout.initTreeParent(toggler[i]);
        }
        
        $(".treeRoot li").click(function (e) {
            e.preventDefault();  //stop the browser from following            
            var treeId = $(this).attr("data-id");
            Gui.log(treeId);
        });
    },
    initTreeParent: function (treeParent) {
        treeParent.addEventListener("click", function (e) {
            e.preventDefault();  //stop the browser from following
            var children = this.parentElement.querySelector(".treeNested");
            if (children !== null) {
                children.classList.toggle("active");
            }
            this.classList.toggle("treeParent-down");
        });
    }

};



