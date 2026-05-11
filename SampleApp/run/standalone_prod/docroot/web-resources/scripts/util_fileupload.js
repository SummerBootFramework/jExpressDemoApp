const aMultiples = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
const imageType = /^image\//;
const videoType = /^video\//;
const TEMP_PROGRESSBAR_ID = "tempProgressBar_";// template = <div class="progress-wrapper"><div id="tempProgressBar_1" class="progress"></div></div>
window.URL = window.URL || window.webkitURL;

$(document).ready(function () {
    UtilFile.init();
});


const UtilFile = {
    init: function () {
        UtilFile.initDragAndDrop("fileSelectInput", "fileDropzoneDiv", "priviewSelectedFileListDiv", "uploadFileBtn");

    },

    // file size formater
    formatNumberWithCommas: function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatFileSize: function (totalBytes) {
        var sOutput = totalBytes + " bytes";
        for (nMultiple = 0, nApprox = totalBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
            sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + UtilFile.formatNumberWithCommas(totalBytes) + " bytes)";
        }
        return sOutput;
    },

    // D&D
    initDragAndDrop: function (fileInputId, fileDropZoneId, fileListPreviewDivPreviewDivId, uploadBtnId) {
        var dropbox;
        dropbox = document.getElementById(fileDropZoneId);
        dropbox.p1 = fileInputId;
        dropbox.p2 = fileListPreviewDivPreviewDivId;
        dropbox.p3 = uploadBtnId;
        dropbox.addEventListener("dragenter", UtilFile.onDragEnter, false);
        dropbox.addEventListener("dragover", UtilFile.onDragOver, false);
        dropbox.addEventListener("dragleave", UtilFile.onDragExit, false);
        dropbox.addEventListener("drop", UtilFile.onDragDrop, false);
        $("#" + fileInputId).change(function () {
            onFileSelected(this.id, fileListPreviewDivPreviewDivId, uploadBtnId);
        });
        $("#" + uploadBtnId).click(function (e) {
            e.preventDefault();  //stop the browser from following
            UtilFile.upload();
        });
    },
    onDragEnter: function (e) {
        e.stopPropagation();
        e.preventDefault();
        Gui.log("enter");
        var dropbox = e.currentTarget;
        dropbox.classList.add("dragHover");
    },
    onDragOver: function (e) {
        e.stopPropagation();
        e.preventDefault();
        //Gui.log("over");
    },
    onDragExit: function (e) {
        e.stopPropagation();
        e.preventDefault();
        Gui.log("exit");
        var dropbox = e.currentTarget;
        dropbox.classList.remove("dragHover");
    },
    onDragDrop: function (e) {
        e.stopPropagation();
        e.preventDefault();
        var dropbox = e.currentTarget;
        dropbox.classList.remove("dragHover");
        var dt = e.dataTransfer;
        var oFiles = dt.files;
        for (var i = 0; i < oFiles.length; i++) {
            if (oFiles[i].size < 1) {
                Gui.errorDlg("Cannot upload folder");
                return;
            }
        }
        var fileInputId = e.currentTarget.p1;
        var fileListPreviewDivPreviewDivId = e.currentTarget.p2;
        var uploadBtnId = e.currentTarget.p3;

        var fileInputElement = document.getElementById(fileInputId);
        fileInputElement.files = oFiles;
        onFileSelectedEx(fileInputElement, fileListPreviewDivPreviewDivId, uploadBtnId);
    },

    upload: function () {
        let uri = ContextRoot + "upload";
        UtilFile.uploadFiles(uri, "fileSelectInput", 300);
    },
    // Upload file
    uploadFiles: function (serviceApiURL, fileInputId, timeoutSec) {
        var fileInputElement = document.getElementById(fileInputId);
        var oFiles = currentFiles;//fileInputElement.files;
        for (var i = 0; i < oFiles.length; i++) {
            var oFile = oFiles[i];
            UtilFile.uploadFile(i, serviceApiURL, oFile, timeoutSec);
        }
    },
    uploadFile: function (index, serviceApiURL, oFile, timeoutSec) {
        $(".progress-wrapper .progress").removeClass("error").removeClass("success");
        var formData = new FormData();
        //var oFile = $('#' + fileInputId)[0].files[0];
        formData.append('file', oFile);
        formData.append('name', "my name");
        var progressbar = UtilFile.getProgressbar(index);
        $.ajax({
            crossDomain: true,
            headers: {
                //"i18n": "test",
                "Authorization": "Bearer " + Util.getStorageItem(STORAGE_KEY_TOKEN)
            },
            url: serviceApiURL, //Server script to process data
            type: 'POST',
            async: true,
            xhr: function () {  // Custom XMLHttpRequest
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) { // Check if upload property exists
                    myXhr.upload.p1 = index;
                    myXhr.upload.addEventListener('progress', UtilFile.onProgressHandling, false); // For handling the progress of the upload
                    myXhr.upload.addEventListener('load', UtilFile.onLoadHandling, false); // For handling the progress of the upload
                }
                return myXhr;
            },
            //Ajax events
            beforeSend: UtilFile.onBeforeSendHandler,
            //success: onSuccessHandler,
            //error: onErrorHandler,
            //complete: onCompleteHandler,
            // Form data
            data: formData,
            dataType: "html",
            //Options to tell jQuery not to process data or worry about content-type.
            timeout: timeoutSec * 1000,
            cache: false,
            contentType: false,
            processData: false
        }).done(function (data, textStatus, jqXHR) {
            progressbar.addClass("success");
            progressbar.find(".info").html("uploaded");
            Gui.log("done#" + index + ": " + data.slice(0, 100));
        }).fail(function (jqXHR, textStatus, errorThrown) {
            progressbar.addClass("error");
            Gui.log("fail#" + index + ": " + errorThrown);
        }).always(function (data_or_jqXHR, textStatus, jqXHR_or_errorThrown) {
            Gui.log("always#" + index + ": " + textStatus);
        });
    },
    onProgressHandling: function (e) {
        var index = e.currentTarget.p1;
        if (e.lengthComputable) {
            if (e.loaded <= e.total) {
                var percent = Math.round(e.loaded / e.total * 100);
                Gui.log(index + "#" + percent + "%");
                var progressbar = UtilFile.getProgressbar(index);
                progressbar.width(percent + '%').find(".info").html(percent + '%');
            }
        }
    },
    onLoadHandling: function (e) {
        var index = e.currentTarget.p1;
        var progressbar = UtilFile.getProgressbar(index);
        progressbar.find(".info").width(100 + '%').html("saving...");
    },

    onBeforeSendHandler: function (jqXHR, settings) {
        //jqXHR.abort();
        Gui.log("onBeforeSendHandlerCB.xhr=" + jqXHR.toString());
        Gui.log("onBeforeSendHandlerCB.settings=" + settings);
    },
    getProgressbar: function (index) {
        return $("#" + TEMP_PROGRESSBAR_ID + index);
    }
};


function onFileSelected(fileInputId, fileListPreviewDivPreviewDivId, uploadBtnId) {
    onFileSelectedEx(document.getElementById(fileInputId), fileListPreviewDivPreviewDivId, uploadBtnId);
}
var currentFiles;
function onFileSelectedEx(fileInputElement, fileListPreviewDivPreviewDivId, uploadBtnId) {
    $("#" + uploadBtnId).removeClass("enabled");
    //var fileInputElement = document.getElementById(fileInputId);
    var fileListPreviewDiv = document.getElementById(fileListPreviewDivPreviewDivId);
    if ('files' in fileInputElement) {
        var oFiles = fileInputElement.files;
        if (!oFiles.length) {
            //fileListPreviewDiv.innerHTML = "";// "<p>No files selected!</p>";
            Gui.log("No files selected");
        } else {
            currentFiles = oFiles;
            fileListPreviewDiv.innerHTML = "";
            var report = document.createElement("div");
            report.className = "summary";
            fileListPreviewDiv.appendChild(report);
            // list files
            var list = document.createElement("ol");
            fileListPreviewDiv.appendChild(list);
            for (var i = 0; i < oFiles.length; i++) {
                var oFile = oFiles[i];
                var li = document.createElement("li");
                list.appendChild(li);
                // thumbnail
                var img = document.createElement("img");
                if (imageType.test(oFile.type)) {
                    img.src = window.URL.createObjectURL(oFile);
                } else {
                    //img = document.createElement("iframe");
                    //img.src = window.URL.createObjectURL(oFile);
                    img.src = "/web-resources/image/defaultfile.jpg";
                }
                img.height = 24;
                img.onload = function () {
                    window.URL.revokeObjectURL(this.src);
                };
                li.appendChild(img);
                // text info
                var info = document.createElement("span");
                info.innerHTML = oFile.name + " <br>size: " + UtilFile.formatFileSize(oFile.size) + " bytes";
                li.appendChild(info);

                // progress bar
                var div = document.createElement("div");
                div.className = "progress-wrapper";
                div.innerHTML = "<div id=\"" + TEMP_PROGRESSBAR_ID + i + "\" class=\"progress\"><span class=\"info\"></div>";
                li.appendChild(div);
            }
            // summary
            var totalBytes = 0, totalFiles = oFiles.length;
            for (var i = 0; i < totalFiles; i++) {
                totalBytes += oFiles[i].size;
            }

            if (totalFiles > 1) {
                report.innerHTML = totalFiles + " files; total size:" + UtilFile.formatFileSize(totalBytes) + "<br>";
            } else {
                report.innerHTML = totalFiles + " file; total size:" + UtilFile.formatFileSize(totalBytes) + "<br>";
            }
        }
        Gui.log("fileListPreviewDiv.innerHTML.length=" + fileListPreviewDiv.innerHTML.length);
        if (fileListPreviewDiv.innerHTML.length > 0) {
            $("#" + uploadBtnId).addClass("enabled");
        }
    } else {
        if (fileInputElement.value === "") {
            Gui.log("No files selected!");
            fileListPreviewDiv.innerHTML = "<p>No files selected!</p>";
        } else {
            Gui.log("The files property is not supported by your browser");
            var txt = "The files property is not supported by your browser!";
            txt += "<br>The path of the selected file: " + fileInputElement.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
            fileListPreviewDiv.innerHTML = txt;
        }
    }

}
