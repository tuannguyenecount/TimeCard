var formdata = new FormData();
var objTask = {};
var list_ChildTask = [];
var formdataChild = new FormData();

var isAddNew = true;
$(function () {
    $(document).ajaxStart(function () {
        $("#fileButton").prop('disabled', true);
    });
    $('#showCheckbox').prop('checked', false);
    $('#showHistoryTask').on("click", function () {
        $('#historyTask').fadeIn("slow");
        $(this).hide();
        $("#hideHistoryTask").show();
    });
    $('#hideHistoryTask').on("click", function () {
        $('#historyTask').fadeOut("slow");
        $(this).hide();
        $("#showHistoryTask").show();
    });

    $(document).ajaxStop(function () {
        $("#fileButton").prop('disabled', false);
        $("#fileInput").val("");
    });

    window.addEventListener("resize", function () { $('.select2bs4').select2({ theme: 'bootstrap4' }); });

    $('[name="BranchId"]').on("select2:select", function (e) {
        console.log("select2:select", e.params.data);
    });
    _set_control_number();

    //$('.select2').select2();

    //Initialize Select2 Elements
    $('.select2bs4').select2({ theme: 'bootstrap4' });
    //$('.date').datetimepicker({ format: 'L' });
    $('.date').datetimepicker({
        format: 'L',
        autoclose: true,
        todayBtn: false,
        timePicker: true
    });

    $('#TaskContent, #TaskComment, #child_TaskContent').summernote({ height: 150 });

    _bind_data_to_table($('table.tblChildTask'), litChild);

    $("button.cmd").click(function (e) {
        var $this = $(this);
        var cmd = $this.attr('cmd');
        var processRate = Number($('#ProcessRate').val());

        if (cmd == 'TASKSPENDING') {
            var cfim = confirm('Bạn có muốn dừng công việc này?');
            if (!cfim) return;
        }
        if (cmd == 'TASKCLOSING') {
            var cfim = confirm('Bạn có muốn đóng công việc này?');
            if (!cfim) return;
        }
        if (cmd == "FEEDBACK") {
            if (isComment == 0) {
                _alert("Anh/Chị vui lòng gửi ý kiến trước khi phản hồi.",'warning');
                return false;
            }
            else {
                var obj = {
                    TaskId: taskId,
                    StatusId: _statusId,
                    TaskName: $('input[name="TaskName"]').val()
                };
                _postJson(
                    '/Home/ProcessFeedback',
                    obj,
                    function (ret) {
                        _alert((ret.ErrorCode==1?'Thực hiện thành công':'Thực hiện thất bại'), (ret.ErrorCode == 1 ? 'success' : 'warning'));
                        if (ret.ErrorCode == 1) {
                            if (cmd == 'TASKCLOSING') {
                                _redirect('/Home/Index?cate=0', 1000);
                            } else {
                                _redirect(window.location.href, 1000);
                            }
                        }
                    },
                    function (ret) {
                        console.log('ERROR feedbackProcessTask');
                        console.log(ret);
                    }, true
                );
            }
        }
        else if (cmd == "TASKSPENDINGPROCESS" && isComment == 0) {
            _alert("Anh/Chị vui lòng nhập nội dung ý kiến.",'warning');
            return false;
        } else {
            _save_process_task($this, taskId, processRate, cmd.toUpperCase());
        } 
    });

    $('#btnSaveComment').click(_insert_comment);

    $('button.insertComment').click(function (e) {
        $('#CommentModal').find('#IndexComment').val('-1');
    });


    var _branchId = $('select[name="child_BranchId"] option:selected').val();
    $('#ChildTaskModal').find('select[name="child_BranchId"]').change(function () {
        $('select[name="child_ProcessBranchId"]').empty();
        $('select[name="child_Assigner"]').empty();
        $('select[name="child_Follower"]').empty();
        GetProcessBranchTree_ChildTask();
        //GetUserFollowerByProcessBranchId_ChildTask();
    });
    $('#ChildTaskModal').find('select[name="child_ProcessBranchId"]').change(function () {
        $('select[name="child_Assigner"]').empty();
        $('select[name="child_Follower"]').empty();
        GetUserAssignerByProcessBranchId_ChildTask();
    });
    $('#btn_add-child-task').click(_add_child_form);

    $("#fileUploads").on("change", function () {
        _upload_files(
            $(this), 'TASK',
            function (ret) {
                if (ret.ErrorCode == 1) {
                    _alert('Thực hiện thành công', 'success');
                    _redirect(window.location.href, 1000);
                } else {
                    _alert('Thực hiện thất bại: ' + ret.ErrorMsg, 'warning');
                    return false;
                }
            }
        );
    });

    $('i.view-ecm').click(function (e) {
        var $this = $(this);
        var docId = $this.attr("ecm-id");
        var mimeType = $this.attr("ecm-mime-type");
        var fileName = $this.attr("ecm-file-name");

        _download_file(docId, fileName, mimeType);
    });

    $('i.remove-ecm').click(function (e) {
        var $this = $(this);
        var docId = $this.attr("ecm-id");
        var taskId = Number($this.attr("task-id"));
        var fileName = $this.attr("ecm-file-name");

        if (confirm('Anh/chị có muốn xóa file ' + fileName + ' không?'))
            _remove_file(docId, taskId);
    });

    $('i.remove-comment').on('click', function (e) {
        if (confirm('Anh/chị muốn xóa ý kiến này?')) {
            var $pr = $(this).parent().parent();
            var data = $pr.data('datax');
            var obj = {
                TaskId: data.TaskId,
                CommentId: data.CommentId,
                command: 'DELETE'
            };
            _postJson(
                '/Home/AssignTaskCallComment',
                obj,
                function (ret) {
                    //success
                    _alert((ret.ErrorCode == 1 ? 'Thực hiện thành công' : 'Thực hiện thất bại'), ret.ErrorCode==1? 'success':'warning');
                    $pr.remove();
                    console.log(ret);
                    _reindex_comment_table()
                },
                function (ret) {
                    //error
                    _alert('Lỗi thêm ý kiến');
                    console.log(ret);
                },
            );
        }
    });

    $('i.edit-comment').on('click', function (e) {
        var $modal = $('#CommentModal');
        var $content = $("#TaskComment");
        var $pr = $(this).parent().parent();
        var itx = $pr.data("datax");
        var idx = $pr.attr("index-row");

        //console.log(itx);
        $modal.find('#IndexComment').val(idx);
        $content.summernote("code", itx.CommentContent);
        $modal.modal('show');
    });
    _bind_data_comment_table();

    $('.btn-chat').click(function (e) {
        var $this = $(this);
        e.preventDefault();
        var n = $this.attr('chat-for');
        if (n != null && n.length > 1) {
            window.location.href = 'im:sip:' + n + '@ocb.com.vn';
        }
        else {
            _alert('Anh/chị chưa chọn nhân viên chat','warning');
        }
    });

    $('#tree2').treed({ openedClass: 'fa-folder-open', closedClass: 'fa-folder' });
    $('.parent-tree').click();
    $('.view-task-detail').click(function (e) {
        var urlx = $(this).attr('href');
        if (urlx != null) {
            _redirect(urlx, 100);
        }
    });
    //$('#btnAssignChildTask').on('click', doProcessChildTaskSave(2));

    //$('#btnEvaluate').on("click", showFrmEvaluete);
    $('#btnEvaluate').on("click", function () {
        //showFrmEvalueteCriteria(taskId, 'ASSIGNER', $('#evaluetionCriteria_content'), true);

        $('#btnEvaluate').attr('disabled', 'disabled');
        SaveEvalueteCriteria(taskId, 'ASSIGNER', 'TASKFINISH');
    });
    $('#btnReport').on("click", showFrmEvalueteProcess);

    $('select[name="priortyTask"]').change(function () {
        var priorty = $(this).val();
        if (priorty.toLowerCase() == "normal") {
            $('#normal').show();
            $('#medium').hide();
            $('#high').hide();
        }
        if (priorty.toLowerCase() == "medium") {
            $('#normal').hide();
            $('#medium').show();
            $('#high').hide();
        }
        if (priorty.toLowerCase() == "high") {
            $('#normal').hide();
            $('#medium').hide();
            $('#high').show();
        }
        savePriorty(taskId, priorty);
    });

    $('#btnHandOver').on('click', showfrmHandOver);

    //===============================
    //====
    //==== xử lý phần tiêu chí đánh giá
    //====
    //===============================
    showEvaluetionCriteria();

    //============= upload file tài liệu đánh giá công việc =========
    $('input[name="fileUpload_evaluetion"]').on('change', function () {
        uploadFileEvaluetionCritera();
    });
});

function _save_process_task($btn, taskId, processRate, command) {
    //$btn.attr('disabled', 'disabled');
    var obj = {
        TaskId: taskId,
        Command: command
    };

    if (['TASKCLOSING', 'TASKSPENDINGPROCESS'].indexOf(command)!=-1 && isComment == 0) {
        _alert('Anh/chị chưa nhập ý kiến trước khi thực hiện lệnh', 'warning');
        $btn.removeAttr('disabled');
        return;
    }

    //_postJson(
    //    '/Home/ProcessTaskSave',
    //    obj,
    //    function (ret) {
    //        if (ret.ErrorCode == 1) {
    //            _alert('Thực hiện thành công', 'success');
    //            var urlx = '';
    //            switch (command) {
    //                case 'TASKFINISH':
    //                case 'TASKDENY':
    //                case 'TASKSPENDINGPROCESS':
    //                    urlx = '/Home/Index?cate=0';
    //                    break;
    //                case 'TASKCLOSING':
    //                    urlx = '/Home/Index?cate=0';
    //                    break;
    //                default:
    //                    urlx = '/Home/ProcessTask?taskId=' + taskId;
    //                    break;
    //            }
    //            window.location.href = urlx;
    //        } else {
    //            if (command == 'TASKRECEIVE')
    //                _alert('Công việc đã đóng/hủy không thể thực hiện tiếp', 'warning');
    //            else
    //                _alert('Thực hiện thất bại', 'warning');
    //        }
    //    },
    //    function (ret) {
    //        console.log('ERROR _save_process_task');
    //        console.log(ret);
    //        $btn.removeAttr('disabled');
    //    }, false
    //);


    _call({
        type: "POST",
        url: "/Home/ProcessTaskSave",
        data: obj,
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (ret, status, xhr) {
            if (ret.ErrorCode == 1) {
                _alert('Thực hiện thành công', 'success');
                var urlx = '';
                switch (command) {
                    case 'TASKFINISH':
                    case 'TASKDENY':
                    case 'TASKSPENDINGPROCESS':
                        urlx = '/Home/Index?cate=0';
                        break;
                    case 'TASKCLOSING':
                        urlx = '/Home/Index?cate=0';
                        break;
                    default:
                        urlx = '/Home/ProcessTask?taskId=' + taskId;
                        break;
                }
                debugger;
                window.location.href = urlx;
            } else {
                if (command == 'TASKRECEIVE')
                    _alert('Công việc đã đóng/hủy không thể thực hiện tiếp', 'warning');
                else
                    _alert('Thực hiện thất bại: ' + ret.ErrorMsg, 'warning');
            }
            _unlockScreen();
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
        }
    });

    //$btn.removeAttr('disabled');
}
function _insert_comment() {
    //var $modal = $('#CommentModal');
    var $content = $("#TaskComment");
    //var indexComment = $modal.find('#IndexComment').val();

    var val = $content.val();
    //var $tblComment = $("table.tblComment");
    var currentDate = new Date();
    if ('' === val || '<p><br></p>' === val) {
        _alert('Anh/chị chưa nhập nội dung ý kiến','warning');
    }
    else if (val.length > 2000) {
        _alert('Nội dung ý kiến không vượt quá 2000 ký tự', 'warning');
        return false;
    }
    else {
        var t = _replace_all_tag($content.summernote('code')).trim();
        t = t.length > 200 ? t.substring(0, 200) + '...' : t;
        //var $body = $tblComment.find("tbody");
        var $choiceBranch = $('select[name="BranchId"] option:selected');
        //var taskId = Number($modal.find("#TaskIdComment").val());
        var title = $choiceBranch.attr('title-name') != null ? $choiceBranch.attr('title-name') : null;
        var titleCode = $choiceBranch.attr('title-code') != null ? $choiceBranch.attr('title-code') : null;
        var obj = {
            TaskId: taskId,
            CreatedUser: UserProfile.UserName,
            TitleName: title,
            TitleCode: titleCode,
            CreatedDate: currentDate,
            CreatedDateStr: _date_to_string(currentDate, 'HOUR'),
            CommentContentShort: t,
            CommentContent: val
        };
        var $tr = "";
        $tr += "<div class='media media_comment'>";
        $tr += "<img src='/Images/avatar-default.jpg' class='user-image rounded-circle mr-3' alt='...'>";
        $tr += "<div class='media-body'>";
        $tr += "<h6 class='mt-0 mb-0'>" + _owner + " <span class='date ml-4'>26/10/2020 11:40:18</span></h6> " + val + "";
        $tr += "</div></div>";
        obj.command = "NEW";
        _call({
            type: "POST",
            url: "/Home/AssignTaskCallComment",
            data: obj,
            async: false,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                _unlockScreen();
                if (result.ErrorCode == 1) {
                    _alert('Gửi ý kiến phản hồi thành công', 'success');
                    isComment = 1;
                    if ($('#nav-comment').children().eq(3).length > 0) {
                        $('#nav-comment').children().eq(2).after($tr);
                    } else {
                        $('#nav-comment').append($tr);
                    }
                } else {
                    _alert('Gửi ý kiến phản hồi thất bại: ' + result.ErrorMsg, 'warning');
                    isComment = -1;
                }
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                _alert(error, 'warning');
            }
        });

        //_postJson(
        //    '/Home/AssignTaskCallComment',
        //    obj,
        //    function (ret) {
        //        if (ret.ErrorCode == 1) {
        //            _alert('Gửi ý kiến phản hồi thành công', 'success');
        //            isComment = 1;
        //            if ($('#nav-comment').children().eq(3).length > 0) {
        //                $('#nav-comment').children().eq(2).after($tr);
        //            } else {
        //                $('#nav-comment').append($tr);
        //            }
        //        } else {
        //            _alert('Gửi ý kiến phản hồi thất bại', 'warning');
        //            isComment = -1;
        //        }
        //    },
        //    function (ret) {
        //        _alert('Lỗi thêm ý kiến', 'warning');
        //        console.log(ret);
        //    },
        //);

        //reset data
        $content.summernote("code", "<p><br></p>");

        //close modal
        //$modal.modal('hide');
    }
}

function _get_list_comment() {
    var ret = null;
    var $tblComment = $("table.tblComment");
    var $trlist = $tblComment.find('tbody tr');
    if ($trlist != null && $trlist.length > 0) {
        ret = [];
        $.each($trlist, function (idx, itx) {
            ret.push($(itx).data('datax'));
        });
    }
    return ret;
}

function DeleteFile(Fileid, FileName) {
    formdata.delete(FileName)
    $("#" + Fileid).remove();
    chkatchtbl();
}
//remove file ecm
function _remove_file(docId, taskId, $iconDelete) {
    //_alert(docId + ' ' + taskId);
    var obj = {
        TaskId: taskId,
        DocId: docId
    };
    _postJson(
        '/Home/RemoveTaskFile',
        obj,
        function (ret) {
            _console('Success: _remove_file', docId + ' ' + taskId, ret);
            if (ret.ErrorCode == 1) {
                _alert('Xóa file thành công', 'success');
                window.location.href = document.location.href;
                $iconDelete.closest('.card').remove();
            } else {
                _alert('Xóa file thất bại', 'warning');
                return false;
            }
        },
        function (ret) {
            _console('Error: _remove_file', docId + ' ' + taskId, ret);
        }
    );
}

function chkatchtbl() {
    if ($('table.tblFiles tr').length > 1) {
        $("table.tblFiles").css("visibility", "visible");
    } else {
        $("table.tblFiles").css("visibility", "hidden");
    }
}

function _download_file(docId, fileName, mimeType) {
    var $form = $("<form action=\"/Home/GetDocumentById\" method=\"post\" id=\"frmDownload\">");
    $form.append("<input name=\"docId\" type=\"hidden\" value=\"" + docId + "\" />");
    $form.append("<input name=\"fileName\" type=\"hidden\" value=\"" + fileName + "\" />");
    $form.append("<input name=\"mimeType\" type=\"hidden\" value=\"" + mimeType + "\" />");

    $("body").append($form);
    $form.submit();
    $form.remove();
}

function _bind_data_comment_table() {
    if (litComment != null && litComment.length > 0) {
        $('table.tblComment tbody tr').each(function (idx, elm) {
            $(elm).data('datax', litComment[idx]);
        });
    }
}

function _reindex_comment_table() {
    $('table.tblComment tbody tr').each(function (idx, elm) {
        $(elm).attr('index-row', idx);
    });
}

function _add_child_form() {
    isAddNew = true;
    formdataChild = new FormData();
    $('#ChildTaskModal').modal('show');
    var date = new Date();
    var id = ((date.getTime() * 10000) + 621355968000000000);
    resetFormAddChildTask();
    $('#child_UploadId').val(id);
    $('#child_TaskId').val('');
    $('#child_StatusId').val('');
    $('#child_clientTaskId').val(id);
    $('#child_TaskLevel').val(_taskLevel);
    $('#child_ParentId').val(taskId);
    $('#child_TaskType').val(_taskType);
    $('#btnSaveChildTask').show();
    $('#btncancelTaskChild').hide();
    $('#btncloseTaskChild').hide();
    $('#btnassignTaskChild').show();

    showFrmEvalueteCriteria_ChildTask(0, 'ASSIGNER', $('#div_child_EvaluetionCriteria'), false);
}

$("#child_fileUploads").on("change", function () {
    //formdataChild = new FormData();
    var fileInput = $(this).get(0);
    var str = "";
    for (i = 0; i < fileInput.files.length; i++) {
        var sfilename = fileInput.files[i].name;
        formdata.append($('#child_UploadId').val() + "_" + sfilename, fileInput.files[i]);
        formdataChild.append($('#child_UploadId').val() + "_" + sfilename, fileInput.files[i]);
        if (i == 0) {
            str += sfilename;
        }
        else {
            str += ";" + sfilename;
        }
        let srandomid = Math.random().toString(36).substring(7);
        var markup = "<tr id='" + srandomid + "'><td>" + sfilename + "</td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + sfilename +
            "\"); return false;'><i style=\"color:red\" class=\"fa fa-trash\" aria-hidden=\"true\"></i></a></td></tr>"; // Binding the file name  
        $("table.child_tblFiles tbody").append(markup);
    }
    if ($('table.child_tblFiles tr').length > 1) {
        $("table.child_tblFiles").css("visibility", "visible");
        $('#child_tblFiles').show();
    } else {
        $("table.child_tblFiles").css("visibility", "hidden");
        $('#child_tblFiles').hide();
    }
    $('label[name="child_lb_fileUploads"]').text(str == "" ? "Chọn files" : str);
});

function resetFormAddChildTask() {
    var date = new Date();
    date = String(date.getDate()).padStart(2, '0') + "/" + String(date.getMonth() + 1).padStart(2, '0') + "/" + date.getFullYear();
    $('input[name=child_TaskName]').val('');
    $('input[id=ParentId]').val('');
    $('input[name=child_EndDateStr]').val(date);
    $('#child_TaskContent').val('');
    $('#frmTaskChild').find('.note-editable.card-block').html('');
    $('select[name=child_ProcessBranchId]').val('');
    $('select[name=child_ProcessBranchId]').change();
    $('select[name=child_Assigner]').val('');
    $('select[name=child_Assigner]').change();
    $('select[name=child_Attorneys]').val('');
    $('select[name=child_Attorneys]').change();
    $('select[name=child_Follower]').val('');
    $('select[name=child_Follower]').change();
    $('input[name=child_fileUploads]').val('');
    $('label[name="child_lb_fileUploads"]').text('chọn files');
    $('table.child_tblFiles tbody').html('');
}

function doProcessChildTaskSave(statusId) {
    var excludeLit = ['child_TaskId', 'Attorneys', 'child_Status', 'child_Attorneys'];
    formdata.delete('Assigner');
    $('button.btn-save,button.btn-complete').attr('disabled', 'disabled');

    var frmObj = new FormData();
    frmObj = formdata;

    var $frmTask = $('#frmTaskChild');
    var chk = _validate_data($frmTask, excludeLit);

    if (chk) {
        var obj = $frmTask.FormToObject();
        obj = _rename_property(obj, 'child_', '');
        //obj.CommentList = _get_list_comment();
        for (var p in obj) {
            var i = 0;
            if (Array.isArray(obj[p])) {
                for (var prop in obj[p]) {
                    if (typeof obj[p][prop] == 'object')
                        for (var prop1 in obj[p][prop]) {
                            if (Array.isArray(obj[p][prop][prop1])) {
                                for (var _item in obj[p][prop][prop1]) {
                                    frmObj.append(`${p}[${prop}][${prop1}][${_item}]`, obj[p][prop][prop1][_item]);
                                }
                            } else {
                                frmObj.append(`${p}[${prop}][${prop1}]`, obj[p][prop][prop1]);
                            }
                        }
                    else {
                        frmObj.append(`${p}[${i}]`, obj[p][i]);
                        i++;
                    }
                }
            }
            else {
                frmObj.append(p, obj[p]);
            }
        }

        //trans status
        frmObj.append("StatusId", statusId);

        ////check if assign task to user, the assigner have the must
        if (statusId == 3 && (obj.Assigner == null || (obj.Assigner != null && obj.Assigner.length == 0))) {
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');

            return;
        }


        _call({
            type: "POST",
            url: "/Home/ProcessChildTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: true,
            success: function (result, status, xhr) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                if (result.ErrorCode == 1) {
                    location.reload();
                    //window.location = (statusId==1 ? '/Home/AssignTaskEdit?taskId=' + result.TaskId : "/Home/TaskList");
                }
            },
            error: function (xhr, status, error) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                console.log('error', xhr, status, error);
            }
        });
    }
    else {
        $('button.btn-save,button.btn-complete').removeAttr('disabled');
    }
}

function GetUserForAssign(isParent) {
    var type = "";
    var $frm = null;
    if (isParent) {
        type = $('select[name="TaskType"] option:selected').val();
        $frm = $('#frmTask');
    } else {
        type = $('input[name="child_TaskType"]').val();
        $frm = $('#frmTaskChild');
    }
    var token = $('input[name="__RequestVerificationToken"]', $frm).val();
    $.ajax({
        type: "POST",
        url: '/Home/GetUserForAssign',
        data: {
            __RequestVerificationToken: token,
            taskType: type
        },
        async: false,
        success: function (result) {
            if (result.Success) {
                if (result.Data.length > 0) {
                    var data = result.Data;
                    var str = "";
                    for (var i = 0; i < data.length; i++) {
                        str += "<option value='" + data[i].UserName + "' title-code='" + data[i].TitleCode + "' title-name='" + data[i].TitleName + "'>" + data[i].UserName + " - " + data[i].TitleName + " - " + data[i].BranchName + " </option>";
                    }
                    if (isParent) {
                        $('select[name="Assigner"]').empty();
                        $('select[name="Assigner"]').html("<option value=''>-- Chọn người nhận việc --</option>" + str);

                        $('select[name="Attorneys"]').empty();
                        $('select[name="Attorneys"]').html("<option value=''>-- Chọn người quản lý --</option>" + str);

                        $('select[name="Follower"]').empty();
                        $('select[name="Follower"]').html(str);
                    } else {
                        $('select[name="child_Assigner"]').empty();
                        $('select[name="child_Assigner"]').html("<option value=''>-- Chọn người nhận việc --</option>" + str);

                        $('select[name="child_Attorneys"]').empty();
                        $('select[name="child_Attorneys"]').html("<option value=''>-- Chọn người quản lý --</option>" + str);

                        $('select[name="child_Follower"]').empty();
                        $('select[name="child_Follower"]').html(str);
                    }

                }
            }
        },
        error: function (xhr, status, error) {
        },
    });
}

function saveChildTask() {
    if (isAddNew) {
        doAddChildTask();
    } else {
        doEditChildTask();
    }
}

function doAddChildTask() {

    var objChild = $('#frmTaskChild').FormToObject();
    //for (let [name, value] of formdataChild) {
    //    formdata.append(`${name}`, `${value}`);
    //}
    objChild = _rename_property(objChild, 'child_', '')
    formdata.delete('Assigner');
    $('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
    var frmObj = new FormData();
    frmObj = formdata;
    //var cp = $('#client_TaskId').val();
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_TaskId', 'ParentId', 'child_Attorneys', 'child_Follower', 'child_Assigner', 'child_Status','child_StatusId'];
    var chk = _validate_data($frmTask, excludeLit);
    //if (objChild.Assigner == objChild.Attorneys && objChild.Assigner != _owner) {
    //    _alert("Người xử lý phải khác với người quản lý công việc", "warning");
    //    return false;
    //}
    if (objChild.TaskName.trim().length == 0) {
        _alert("Tên công việc không hợp lệ", "warning");
        return false;
    }
    if (objChild.TaskContent.length > 3500) {
        _alert('Nội dung công việc không vượt quá 3000 ký tự', 'warning');
        return false;
    }
    if (objChild.TaskName.length > 200) {
        _alert('Tên công việc không vượt quá 200 ký tự', 'warning');
        return false;
    }
    if (_string_to_date(objChild.EndDateStr) > EndDate) {
        _alert("Ngày đến hạn của công việc con phải nhỏ hơn hoặc bằng ngày đến hạn của công việc cha", "warning");
        return false;
    }
    if (!validateAssignerAndFollowe(objChild.Assigner, objChild.Follower, UserProfile.UserName)) {
        _alert('Người phối hợp phải khác với người xử lý và người giao việc', 'warning');
        return false;
    }
    var _dateTemp = new Date();
    var dateAss = new Date(_dateTemp.getFullYear(), _dateTemp.getMonth(), _dateTemp.getDate());
    var dateCompare = _string_to_date(objChild.EndDateStr);
    if (dateAss > dateCompare) {
        _alert('Ngày đến hạn không hợp lệ', 'warning');
        return false;
    }
    var arrCriteria = getInputEvaluetionCriteria_ChildTask('OWNER');
    objChild.EvaluetionCriteriaList = arrCriteria;
    //validate input tiêu chí đánh giá
    var checkInputCriteria = true;
    if (objChild.EvaluetionCriteriaList != null) {
        $.each(objChild.EvaluetionCriteriaList, function (index, it) {
            if (index == 0) {
                if (it.CriteriaProportion == null || Number(it.CriteriaProportion) <= 0) {
                    _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                    checkInputCriteria = false;
                    return false;
                }
                else if (it.ChildCriteria != null && it.ChildCriteria.length > 0) {
                    var sumProportion = 50;
                    var count = 0;
                    $.each(it.ChildCriteria, function (key, _it) {
                        if (Number(_it.Status) == 0 && Number(_it.CriteriaId) > 0) {
                            count++;
                        }
                        if (_it.CriteriaProportion == null || Number(_it.CriteriaProportion) <= 0) {
                            _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                            checkInputCriteria = false;
                            return false;
                        }
                        if (Number(_it.Status) == 0 && Number(_it.CriteriaId) > 0) {

                        } else {
                            sumProportion = (sumProportion - Number(_it.CriteriaProportion));
                        }
                        if (_it.CriteriaName == null || _it.CriteriaName == "") {
                            _alert('Vui lòng nhập tiêu chí', 'warning');
                            checkInputCriteria = false;
                            return false;
                        }
                    });
                    if ((count == it.ChildCriteria.length && sumProportion != 50) || (count != it.ChildCriteria.length && sumProportion != 0)) {
                        checkInputCriteria = false;
                        _alert('Tổng tỷ trọng của các tiêu chí con của tiêu chí chất lượng công việc phải là 50', 'warning');
                        return false;
                    }
                    //if (sumProportion != 0) {
                    //    checkInputCriteria = false;
                    //    _alert('Tổng tỷ trọng của các tiêu chí con của tiêu chí chất lượng công việc phải là 50', 'warning');
                    //    return false;
                    //}
                }
            }
        });
    }
    if (!checkInputCriteria) {
        return false;
    }
    if (chk) {
        var $lstDiv = $('<div class="listcomment">');
        //var obj = $frmTask.FormToObject();
        //obj.CommentList = _get_list_comment();
        //obj.ChildTask = list_ChildTask;
        for (var p in objChild) {
            var i = 0;
            if (Array.isArray(objChild[p])) {
                for (var prop in objChild[p]) {
                    if (typeof objChild[p][prop] == 'object')
                        for (var prop1 in objChild[p][prop]) {
                            if (Array.isArray(objChild[p][prop][prop1])) {
                                for (var prop2 in objChild[p][prop][prop1]) {
                                    if (typeof (objChild[p][prop][prop1][prop2]) == 'object') {
                                        for (var prop3 in objChild[p][prop][prop1][prop2]) {
                                            frmObj.append(`${p}[${prop}][${prop1}][${prop2}][${prop3}]`, objChild[p][prop][prop1][prop2][prop3]);
                                        }
                                    } else {
                                        frmObj.append(`${p}[${prop}][${prop1}][${prop2}]`, objChild[p][prop][prop1][prop2]);
                                    }
                                }
                            } else {
                                frmObj.append(`${p}[${prop}][${prop1}]`, objChild[p][prop][prop1]);
                            }
                        }
                    else {
                        frmObj.append(`${p}[${i}]`, objChild[p][i]);
                        i++;
                    }
                }
            }
            else {
                frmObj.append(p, objChild[p]);
            }
        }
        frmObj.append("StatusId", 1);

        //check if assign task to user, the assigner have the must
        if (0 == 2 && (objChild.Assigner == null || (objChild.Assigner != null && objChild.Assigner.length == 0))) {
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');

            return;
        }
        $.ajax({
            type: "POST",
            url: "/Home/AssignTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: true,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                _unlockScreen();
                $('button.btn-save,button.btn-complete').removeAttr('disabled');

                if (result.ErrorCode == 1) {
                    location.reload();
                    //window.location = (0 == 1 ? '/Home/AssignTaskEdit?taskId=' + result[0].TaskId : "/Home/TaskList");
                }
                else {
                    _alert(result.ErrorDetail,'warning');
                }
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                console.log('error', xhr, status, error);
            },
        });
    }
    else {
        $('button.btn-save,button.btn-complete').removeAttr('disabled');
    }
}

function doEditChildTask() {
    var objChild = $('#frmTaskChild').FormToObject();
    objChild = _rename_property(objChild, 'child_', '')
    formdata.delete('Assigner');
    $('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
    var frmObj = new FormData();
    frmObj = formdata;
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_clientTaskId', 'child_Attorneys', 'child_Follower'];
    var chk = _validate_data($frmTask, excludeLit);
    //if (objChild.Assigner == objChild.Attorneys && objChild.Assigner != _owner) {
    //    _alert("Người xử lý phải khác với người quản lý công việc", "warning");
    //    return false;
    //}
    if (objChild.TaskName.trim().length == 0) {
        _alert("Tên công việc không hợp lệ", "warning");
        return false;
    }
    if (objChild.TaskContent.length > 3500) {
        _alert('Nội dung công việc không vượt quá 3000 ký tự', 'warning');
        return false;
    }
    if (objChild.TaskName.length > 200) {
        _alert('Tên công việc không vượt quá 200 ký tự', 'warning');
        return false;
    }
    if (_string_to_date(objChild.EndDateStr) > EndDate) {
        _alert("Ngày đến hạn của công việc con phải nhỏ hơn hoặc bằng ngày đến hạn của công việc cha", "warning");
        return false;
    }
    var _dateTemp = new Date();
    var dateAss = new Date(_dateTemp.getFullYear(), _dateTemp.getMonth(), _dateTemp.getDate());
    var dateCompare = _string_to_date(objChild.EndDateStr);
    if (dateAss > dateCompare) {
        _alert('Ngày đến hạn không hợp lệ', 'warning');
        return false;
    }
    if (!validateAssignerAndFollowe(objChild.Assigner, objChild.Follower, UserProfile.UserName)) {
        _alert('Người phối hợp phải khác với người xử lý và người giao việc', 'warning');
        return false;
    }
    var arrCriteria = getInputEvaluetionCriteria_ChildTask('OWNER');
    objChild.EvaluetionCriteriaList = arrCriteria;
    //validate input tiêu chí đánh giá
    var checkInputCriteria = true;
    if (objChild.EvaluetionCriteriaList != null) {
        $.each(objChild.EvaluetionCriteriaList, function (index, it) {
            if (index == 0) {
                if (it.CriteriaProportion == null || Number(it.CriteriaProportion) <= 0) {
                    _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                    checkInputCriteria = false;
                    return false;
                }
                else if (it.ChildCriteria != null && it.ChildCriteria.length > 0) {
                    var sumProportion = 50;
                    var _countCriteriaRemove = 0;
                    $.each(it.ChildCriteria, function (key, _it) {
                        debugger;
                        if (Number(_it.CriteriaId) > 0 && Number(_it.Status) == 0) {
                            _countCriteriaRemove++;
                        }
                        if (_it.CriteriaProportion == null || Number(_it.CriteriaProportion) <= 0) {
                            _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                            checkInputCriteria = false;
                            return false;
                        }
                        if (Number(_it.Status) == 0 && Number(_it.CriteriaId) > 0) {

                        } else {
                            sumProportion = (sumProportion - Number(_it.CriteriaProportion));
                        }
                        if (_it.CriteriaName == null || _it.CriteriaName == "") {
                            _alert('Vui lòng nhập tiêu chí', 'warning');
                            checkInputCriteria = false;
                            return false;
                        }
                    });
                    if ((_countCriteriaRemove == it.ChildCriteria.length && sumProportion != 50) || (_countCriteriaRemove != it.ChildCriteria.length && sumProportion != 0)) {
                        checkInputCriteria = false;
                        _alert('Tổng tỷ trọng của các tiêu chí con của tiêu chí chất lượng công việc phải là 50', 'warning');
                        return false;
                    }
                }
            }
        });
    }
    if (!checkInputCriteria) {
        return false;
    }
    if (chk) {
        var $lstDiv = $('<div class="listcomment">');
        for (var p in objChild) {
            var i = 0;
            if (Array.isArray(objChild[p])) {
                for (var prop in objChild[p]) {
                    if (typeof objChild[p][prop] == 'object')
                        for (var prop1 in objChild[p][prop]) {
                            if (Array.isArray(objChild[p][prop][prop1])) {
                                for (var prop2 in objChild[p][prop][prop1]) {
                                    if (typeof (objChild[p][prop][prop1][prop2]) == 'object') {
                                        for (var prop3 in objChild[p][prop][prop1][prop2]) {
                                            frmObj.append(`${p}[${prop}][${prop1}][${prop2}][${prop3}]`, objChild[p][prop][prop1][prop2][prop3]);
                                        }
                                    } else {
                                        frmObj.append(`${p}[${prop}][${prop1}][${prop2}]`, objChild[p][prop][prop1][prop2]);
                                    }
                                }
                            } else {
                                frmObj.append(`${p}[${prop}][${prop1}]`, objChild[p][prop][prop1]);
                            }
                        }
                    else {
                        frmObj.append(`${p}[${i}]`, objChild[p][i]);
                        i++;
                    }
                }
            }
            else {
                frmObj.append(p, objChild[p]);
            }
        }
        frmObj.append("StatusId", 1);

        //check if assign task to user, the assigner have the must
        if (0 == 2 && (objChild.Assigner == null || (objChild.Assigner != null && objChild.Assigner.length == 0))) {
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc','warning');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');

            return;
        }
        $.ajax({
            type: "POST",
            url: "/Home/AssignTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: true,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                _unlockScreen();
                $('button.btn-save,button.btn-complete').removeAttr('disabled');

                if (result.ErrorCode == 1) {
                    location.reload();
                    //window.location = (0 == 1 ? '/Home/AssignTaskEdit?taskId=' + result[0].TaskId : "/Home/TaskList");
                }
                else {
                    _alert('Thực hiện thất bại','warning');
                }
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                console.log('error', xhr, status, error);
            },
        });
    }
    else {
        $('button.btn-save,button.btn-complete').removeAttr('disabled');
    }

}

function deleteChild(id) {
    if (confirm('Anh/chị có muốn hủy công việc này không?')) {
        if (id != null && id > 0) {
            _postJson(
                '/Home/AssignTaskCommand',
                { taskId: id, command: 'TASKCANCEL' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        _alert("Hủy công việc thành công", "success");
                        _redirect(location.href, 2000);
                        //window.location.href = location.href;
                    }
                    else {
                        _alert('Thực hiện thất bại','warning');
                    }
                },
                function (ret) {
                    _alert('Error');
                    console.log(ret);
                },
                true
            );
        }
        else {
            _alert('Mã công việc không hợp lệ');
        }
    }
}

function editChild(elm) {
    var date = new Date();
    var id = ((date.getTime() * 10000) + 621355968000000000);
    isAddNew = false;
    var data = $(elm).closest('tr').data('datax');
    resetFormAddChildTask();
    data = _add_prefix_property(data, 'child_');
    if (data.child_FollowerStr != null) {
        var arrFollowe = data.child_FollowerStr.split(',');
        data.child_Follower = arrFollowe;
    }
    GetProcessBranchTree_ChildTask_frmedit(data.child_BranchId);
    GetUserAssignerByProcessBranchId_ChildTask_frmedit(data.child_ProcessBranchId);
    //GetUserForAssign(false, data.child_TaskType);
    $('#frmTaskChild').DataToForm(data);
    $('#child_UploadId').val(id);
    $('#child_clientTaskId').val(id);
    var arrStatus = [6, 5, 12, 13, 14];
    if (arrStatus.indexOf(data.child_StatusId)!=-1) {
        $('#btncloseTaskChild').show();
    } else {
        $('#btncloseTaskChild').hide();
    }
    if (data.child_StatusId == 1 || data.child_StatusId == 2) {
        if (data.child_StatusId == 1) {
            $('#btnassignTaskChild').show();
            $('#btncancelTaskChild').show();
        } else {
            $('#btnassignTaskChild').hide();
            $('#btncancelTaskChild').show();
        }
    } else {
        $('#btnassignTaskChild').hide();
        $('#btncancelTaskChild').hide();
    }
    if (listAttachFile !== null) {
        for (var i = 0; i < listAttachFile.length; i++) {
            if (listAttachFile[i].bpmCode == data.child_TaskId) {
                let srandomid = Math.random().toString(36).substring(7);
                var markup = "<tr id='" + srandomid + "'><td>" + listAttachFile[i].DocumentTitle + "</td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + listAttachFile[i].DocumentTitle +
                    "\"); return false;'><i style=\"color:red\" class=\"fa fa-trash remove-ecm\" ecm-id='" + listAttachFile[i].Id + "' task-id='" + data.child_TaskId + "' ecm-file-name=\"" + listAttachFile[i].DocumentTitle + "\" aria-hidden=\"true\"></i></a></td></tr>";
                $("table.child_tblFiles tbody").append(markup);
            }
        }
    }
    if ($('table.child_tblFiles tr').length > 1) {
        $("table.child_tblFiles").css("visibility", "visible");
        $('#child_tblFiles').show();
    } else {
        $("table.child_tblFiles").css("visibility", "hidden");
        $('#child_tblFiles').hide();
    }
    if (data.child_FollowerStr != null) {
        var arrFollowe = data.child_FollowerStr.split(',');
        for (var i = 0; i < arrFollowe.length; i++) {
            $('select[name=child_Follower] > option').each(function () {
                if (this.value === arrFollowe[i].trim()) {
                    $(this).attr('selected', 'selected');
                }
            });
        }
    }
    if (data.child_Owner != _owner) {
        $('#btnSaveChildTask').hide();
    }
    else {
        $('#btnSaveChildTask').show();
    }
    $('#frmTaskChild').find('.note-editable.card-block').html(data.child_TaskContent);
    $('.select2bs4').select2({ theme: 'bootstrap4' });
    $('#ChildTaskModal').modal('show');
    $('#ChildTaskModal').find('select[name="child_BranchId"]').change(function () {
        $('select[name="child_ProcessBranchId"]').empty();
        $('select[name="child_Assigner"]').empty();
        $('select[name="child_Follower"]').empty();
        GetProcessBranchTree_ChildTask();
    });
    $('#ChildTaskModal').find('select[name="child_ProcessBranchId"]').change(function () {
        $('select[name="child_Assigner"]').empty();
        $('select[name="child_Follower"]').empty();
        GetUserAssignerByProcessBranchId_ChildTask();
    });
    $('#ChildTaskModal').find('button[id="btncancelTaskChild"]').on('click', function () {
        var objChild = $('#frmTaskChild').FormToObject();
        if (objChild.child_TaskId > 0) {
            _cancel_task(objChild.child_TaskId);
        } else {
            _alert('Không tìm thấy mã công việc', 'warning');
            return false;
        }
    });
    $("#ChildTaskModal").find('button[id="btncloseTaskChild"]').on('click',function () {
        var objChild = $('#frmTaskChild').FormToObject();
        if (objChild.child_TaskId > 0) {
            _close_task(objChild.child_TaskId);
        } else {
            _alert('Không tìm thấy mã công việc', 'warning');
            return false;
        }
    });
    showFrmEvalueteCriteria_ChildTask(data.child_TaskId, "OWNER", $('#div_child_EvaluetionCriteria'), true);
}
function _close_task(taskId) {
    if (confirm('Anh/chị có muốn đóng công việc ' + taskId + ' không?')) {
        if (taskId != null && taskId > 0) {
            _postJson(
                '/Home/AssignTaskCommand',
                { taskId: taskId, command: 'TASKCLOSE' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        _alert('Thực hiện thành công', 'success');
                        _redirect('/Home/Index?cate=0', 1000);
                    }
                    else {
                        _alert('Thực hiện thất bại: ' + ret.ErrorMsg, 'warning');
                    }
                },
                function (ret) {
                    _alert('Error', 'warning');
                    console.log(ret);
                },
                true
            );
        }
        else {
            _alert('Mã công việc không hợp lệ', 'warning');
        }
    }
}

function showFrmEvaluete() {
    console.log('==========> showFrmEvaluete');
    var obj = {};
    obj.TaskId = taskId;
    var $frm = $('#frmEvaluate');
    _get(
        '/Home/ProcessAvaluateTask',
        obj,
        function (ret) {
            $frm.empty();
            $frm.html(ret);
            $('#evaluateTaskModal').modal('show');
            var date = new Date();
            $frm.find('.date').datetimepicker({
                format: 'L',
                minDate: date,
                autoclose: true,
                todayBtn: false,
                timePicker: false
            });
            $frm.find('#btnsaveEvaluate').on('click', saveEvaluate);
            $frm.find('input[name="my-checkbox"]').on("change", function () {
                if ($(this).is(':checked')) {
                    $("#divDuaDate").fadeIn("slow");
                } else {
                    $("#divDuaDate").fadeOut("slow");
                }
            });

            $frm.find('input[name="attachment"]').on("change", function () {
                _upload_files(
                    $(this), 'TASKASSIGNERAVALUATE',
                    function (ret) {
                        if (ret.ErrorCode == 1) {
                            _alert('Đính kèm tài liệu thành công', 'success');
                        } else {
                            _alert('Đính kèm tài liệu thất bại', 'warning');
                        }
                        //bind listAttachFile
                        if (ret.Data != null && ret.Data.length > 0) {
                            $.each(ret.Data, function (idx,itx) {
                                listAttachFile.push({ Id: itx.DocId, DocumentTitle: itx.FileName, MimeType: itx.Mime, ContentSize: itx.ContentLength, TenDanhMuc: 'TASKASSIGNERAVALUATE', LoaiTaiLieu: 'ASSIGNER' });
                                $frm.find('div.attachfile').append('<p style="margin-right:8px;">' + '<i class="fa fa-paperclip view-ecm" style="color:green;cursor:pointer;" ecm-id="' + itx.DocId + '" ecm-mime-type="' + itx.Mime + '" ecm-file-name="' + itx.FileName + '"> ' + itx.FileName + '</i>' + '</p>');
                            });
                        }
                        //if (ret.ErrorCode == 1)
                        //    _redirect(window.location.href, 1000);
                    }
                );
            });

            //file for task report
            var $files = $frm.find('div.attachfile');
            $.each(listAttachFile, function (idx, itx) {
                if (itx.TenDanhMuc == 'TASKASSIGNERAVALUATE')
                    $files.append('<p style="margin-right:8px;">' + '<i class="fa fa-paperclip view-ecm" style="color:green;cursor:pointer;" ecm-id="' + itx.Id + '" ecm-mime-type="' + itx.MimeType + '" ecm-file-name="' + itx.DocumentTitle + '"> ' + itx.DocumentTitle + '</i>' + '</p>');
            });

            $frm.find('i.view-ecm').click(function (e) {
                var $this = $(this);
                var docId = $this.attr("ecm-id");
                var mimeType = $this.attr("ecm-mime-type");
                var fileName = $this.attr("ecm-file-name");

                _download_file(docId, fileName, mimeType);
            });
        },
        function (ret) {
            _alert('Error','error');
            console.log(ret);
        },
        false
    );
}

function saveEvaluate() {
    var obj = $("#frmAvaluateTaskSave").FormToObject();
    var msg='';

    if (!obj.Option1 || obj.Option1<=0) {
        msg = "Vui lòng nhập tỷ lệ hoàn thành<br/>";
    }

    if (obj.AvaluateResult == null || obj.AvaluateResult.trim().length == 0 || obj.AvaluateResult.trim().length > 250) {
        msg = "Vui lòng nhập nội dung và độ dài tối đa là 250 ký tự<br/>";
    }
    

    if (msg.length > 0) {
        _alert(msg, 'warning');
        return false;
    }

    _call({
        url: '/Home/ProcessAvaluateTask',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: obj,
        beforeSend: function () {
            _lockScreen();
        },
        method: 'post',
        async: false,
        success: function (ret) {
            _unlockScreen();
            if (ret.ErrorCode == 1) {
                _alert('Thực hiện thành công', 'success');
                _redirect(window.location.href, 1000);
                //$('#evaluateTaskModal').modal('hide');

            } else {
                _alert('Thực hiện thất bại: ' + ret.ErrorMsg, 'warning');
                return false;
            }
        },
        error: function (ret) {
            _unlockScreen();
            _alert('Lỗi hết session, vui lòng bấm phím f5 để được reload page ','warning');
        }
    });
}

function showFrmEvalueteProcess() {
    console.log('==========> showFrmEvalueteProcess');
    var obj = {};
    obj.TaskId = taskId;
    obj.reqType = 'report';
    var $frm = $('#frmEvaluate');
    _get(
        '/Home/ProcessAvaluateTask',
        obj,
        function (ret) {
            $frm.empty();
            $frm.html(ret);
            $('#evaluateTaskModal').modal('show');
            var date = new Date();
            $frm.find('.date').datetimepicker({
                format: 'L',
                minDate: date,
                autoclose: true,
                todayBtn: false,
                timePicker: false
            });
            $frm.find('#btnsaveEvaluate').on('click', saveEvaluateProcess);
            $frm.find('legend.legend-lable').text('Người xử lý báo cáo');
            //$frm.find('input[name="my-checkbox"]').on("change", function () {
            //    if ($(this).is(':checked')) {
            //        $("#divDuaDate").fadeIn("slow");
            //    } else {
            //        $("#divDuaDate").fadeOut("slow");
            //    }
            //});

            $frm.find('input[name="attachment"]').on("change", function () {
                _upload_files(
                    $(this), 'TASKASSIGNERREPORT',
                    function (ret) {
                        if (ret.ErrorCode == 1) {
                            _alert('Đính kèm tài liệu thành công', 'success');
                        } else {
                            _alert('Đính kèm tài liệu thất bại', 'warning');
                        }
                        if (ret.Data != null && ret.Data.length > 0) {
                            $.each(ret.Data, function (idx, itx) {
                                listAttachFile.push({ Id: itx.DocId, DocumentTitle: itx.FileName, MimeType: itx.Mime, ContentSize: itx.ContentLength, TenDanhMuc: 'TASKASSIGNERREPORT', LoaiTaiLieu: 'ASSIGNER' });
                                $frm.find('div.attachfile').append('<p style="margin-right:8px;">' + '<i class="fa fa-paperclip view-ecm" style="color:green;cursor:pointer;" ecm-id="' + itx.DocId + '" ecm-mime-type="' + itx.Mime + '" ecm-file-name="' + itx.FileName + '"> ' + itx.FileName + '</i>' + '</p>');
                            });
                        }
                    }
                );
            });

            //file for task report
            var $files = $frm.find('div.attachfile');
            $.each(listAttachFile, function (idx, itx) {
                if (itx.TenDanhMuc == 'TASKASSIGNERREPORT')
                    $files.append('<p style="margin-right:8px;">' + '<i class="fa fa-paperclip view-ecm" style="color:green;cursor:pointer;" ecm-id="' + itx.Id + '" ecm-mime-type="' + itx.MimeType + '" ecm-file-name="' + itx.DocumentTitle + '"> ' + itx.DocumentTitle + '</i>' + '</p>');
            });

            $frm.find('i.view-ecm').click(function (e) {
                var $this = $(this);
                var docId = $this.attr("ecm-id");
                var mimeType = $this.attr("ecm-mime-type");
                var fileName = $this.attr("ecm-file-name");

                _download_file(docId, fileName, mimeType);
            });
        },
        function (ret) {
            _alert('Error', 'error');
            console.log(ret);
        },
        false
    );
}

function saveEvaluateProcess() {
    var obj = $("#frmAvaluateTaskSave").FormToObject();
    obj.reqType = 'report'
    var msg = '';

    if (!obj.Option1 || obj.Option1 <= 0) {
        msg = "Vui lòng nhập tỷ lệ hoàn thành<br/>";
    }

    if (obj.AvaluateResult == null || obj.AvaluateResult.length == 0 || obj.AvaluateResult.length > 250) {
        msg = "Vui lòng nhập nội dung và độ dài tối đa là 250 ký tự<br/>";
    }

    if (msg.length > 0) {
        _alert(msg, 'warning');
        return false;
    }

    _call({
        url: '/Home/ProcessAvaluateTask',
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: obj,
        method: 'post',
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (ret) {
            if (ret.ErrorCode == 1) {
                _alert('Thực hiện thành công', 'success');
                _redirect(window.location.href, 1500);
            } else {
                _alert('Thực hiện thất bại', 'warning');
                return false;
            }
        },
        error: function (ret) {
            _alert('Lỗi ' + ret);
        }
    });
}

function _upload_files($elmUpload, cate, onSuccess, onError) {
    console.log('-----------> _upload_files', cate);
    formdata = new FormData();
    formdata.append('TaskId', taskId);
    formdata.append('StatusId', _statusId);
    formdata.append('reqType', cate);
    var fileInput = $elmUpload.get(0);
    //Iterating through each files selected in fileInput
    for (i = 0; i < fileInput.files.length; i++) {
        if (fileInput.files[i].size > 20971520) {
            _alert('Dung lượng file vượt quá giới hạn cho phép (20MB)', 'warning');
            return false;
        }
        var sfilename = fileInput.files[i].name;
        let srandomid = Math.random().toString(36).substring(7);

        formdata.append(sfilename, fileInput.files[i]);

        var markup = "<tr id='" + srandomid + "'><td>" + sfilename + "</td><td></td><td></td><td></td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + sfilename +
            "\"); return false;'><i class=\"fa fa-trash\" aria-hidden=\"true\" style=\"color:red\"></i></a></td></tr>"; // Binding the file name
        $("table.tblFiles tbody").append(markup);

    }

    //upload process
    _call({
        type: "POST",
        url: "/Home/ProcessTaskUpload",
        dataType: "json",
        contentType: false, // Not to set any content header
        processData: false, // Not to process data
        data: formdata,
        success: function (result, status, xhr) {
            if (onSuccess!=null && typeof onSuccess == 'function')
                onSuccess(result);

            if (result.ErrorCode == 1) {
                console.log('Upload file success');
            }
        },
        error: function (xhr, status, error) {
            if (onError != null && typeof onError == 'function')
                onError(xhr, status, error);
            console.log('error', xhr, status, error);
        }
    });

    chkatchtbl();
    $elmUpload.val('');
}

function showHistoryTaskChile(taskId) {
    var $frm = $('#frmHistoryTaskChild');
    _postJson(
        '/Home/GetHistoryTaskChild',
        { taskId: taskId },
        function (ret) {
            $frm.empty();
            $frm.html(ret);
            $('#historyTaskModal').modal('show');
        },
        function (ret) {
            _alert('Error');
            console.log(ret);
        },
        false
    );
}


function assignTaskChild(type) {
    var objChild = $('#frmTaskChild').FormToObject();
    objChild = _rename_property(objChild, 'child_', '')
    formdata.delete('Assigner');
    objChild.StatusId = type;
    var frmObj = new FormData();
    frmObj = formdata;
    //var cp = $('#client_TaskId').val();
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_TaskId', 'ParentId', 'child_Attorneys', 'child_Follower', 'child_Assigner', 'child_Status', 'child_StatusId'];
    var chk = _validate_data($frmTask, excludeLit);
    if (objChild.Assigner == objChild.Attorneys && objChild.Assigner != _owner) {
        _alert("Người xử lý phải khác với người quản lý công việc", "warning");
        return false;
    }
    if (_string_to_date(objChild.EndDateStr) > EndDate) {
        _alert("Ngày đến hạn của công việc con phải nhỏ hơn hoặc bằng ngày đến hạn của công việc cha", "warning");
        return false;
    }
    var _dateTemp = new Date();
    var dateAss = new Date(_dateTemp.getFullYear(), _dateTemp.getMonth(), _dateTemp.getDate());
    var dateCompare = _string_to_date(objChild.EndDateStr);
    if (dateAss > dateCompare) {
        _alert('Ngày đến hạn không hợp lệ', 'warning');
        return false;
    }
    var arrCriteria = getInputEvaluetionCriteria_ChildTask('OWNER');
    objChild.EvaluetionCriteriaList = arrCriteria;
    //validate input tiêu chí đánh giá
    var checkInputCriteria = true;
    if (objChild.EvaluetionCriteriaList != null) {
        $.each(objChild.EvaluetionCriteriaList, function (index, it) {
            if (index == 0) {
                if (it.CriteriaProportion == null || Number(it.CriteriaProportion) <= 0) {
                    _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                    checkInputCriteria = false;
                    return false;
                }
                else if (it.ChildCriteria != null && it.ChildCriteria.length > 0) {
                    var sumProportion = 50;
                    $.each(it.ChildCriteria, function (key, _it) {
                        if (_it.CriteriaProportion == null || Number(_it.CriteriaProportion) <= 0) {
                            _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                            checkInputCriteria = false;
                            return false;
                        }
                        if (Number(_it.Status) == 0 && Number(_it.CriteriaId) > 0) {

                        } else {
                            sumProportion = (sumProportion - Number(_it.CriteriaProportion));
                        }
                        if (_it.CriteriaName == null || _it.CriteriaName == "") {
                            _alert('Vui lòng nhập tiêu chí', 'warning');
                            checkInputCriteria = false;
                            return false;
                        }
                    });
                    if (sumProportion != 0) {
                        checkInputCriteria = false;
                        _alert('Tổng tỷ trọng của các tiêu chí con của tiêu chí chất lượng công việc phải là 50', 'warning');
                        return false;
                    }
                }
            }
        });
    }
    if (!checkInputCriteria) {
        return false;
    }
    if (chk) {
        var $lstDiv = $('<div class="listcomment">');
        //var obj = $frmTask.FormToObject();
        //obj.CommentList = _get_list_comment();
        //obj.ChildTask = list_ChildTask;
        for (var p in objChild) {
            var i = 0;
            if (Array.isArray(objChild[p])) {
                for (var prop in objChild[p]) {
                    if (typeof objChild[p][prop] == 'object')
                        for (var prop1 in objChild[p][prop]) {
                            if (Array.isArray(objChild[p][prop][prop1])) {
                                for (var prop2 in objChild[p][prop][prop1]) {
                                    if (typeof (objChild[p][prop][prop1][prop2]) == 'object') {
                                        for (var prop3 in objChild[p][prop][prop1][prop2]) {
                                            frmObj.append(`${p}[${prop}][${prop1}][${prop2}][${prop3}]`, objChild[p][prop][prop1][prop2][prop3]);
                                        }
                                    } else {
                                        frmObj.append(`${p}[${prop}][${prop1}][${prop2}]`, objChild[p][prop][prop1][prop2]);
                                    }
                                }
                            } else {
                                frmObj.append(`${p}[${prop}][${prop1}]`, objChild[p][prop][prop1]);
                            }
                        }
                    else {
                        frmObj.append(`${p}[${i}]`, objChild[p][i]);
                        i++;
                    }
                }
            }
            else {
                frmObj.append(p, objChild[p]);
            }
        }
        //check if assign task to user, the assigner have the must
        if (type == 2 && (objChild.Assigner == null || (objChild.Assigner != null && objChild.Assigner.length == 0))) {
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc','warning');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');

            return;
        }
        $.ajax({
            type: "POST",
            url: "/Home/AssignTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: true,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                _unlockScreen();
                if (result.ErrorCode == 1) {
                    $('#ChildTaskModal').modal('hide');
                    _alert("Giao việc thành công", "success");
                    window.location.href = document.location.href;
                }
                else {
                    _alert('Thực hiện thất bại: ' + result.ErrorDetail, 'warning');
                }
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                console.log('error', xhr, status, error);
            },
        });
    }
    else {
        $('button.btn-save,button.btn-complete').removeAttr('disabled');
    }
}
function savePriorty(taskId, priorty) {
    var token = $('input[name="__RequestVerificationToken"]', $('#frmTask')).val();
    _call({
        type: "POST",
        url: "/Home/SavePriortyTask",
        data: {
            taskId: taskId,
            priorty: priorty,
            __RequestVerificationToken: token
        },
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _unlockScreen();
            _alert(result.message, result.success ? 'success' : 'warning');
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            console.log('error', xhr, status, error);
        }
    });
}
function showfrmHandOver() {
    $.ajax({
        type: "GET",
        url: "/Home/HandOverTask",
        data: { taskId: taskId},
        async: false,
        success: function (result, status, xhr) {
            $('#frmHandOver').html(result);
            $('#handOverTaskModal').modal('show');
        },
        error: function (xhr, status, error) {
            console.log('error', xhr, status, error);
        }
    });
}
function doHandOver() {
    toHandOver = $('select[name="toHandOver"] option:selected').val();
    if (toHandOver == "") {
        _alert('Vui lòng chọn người nhận việc', 'warning');
        return false;
    }

}


function _cancel_task(taskId) {
    if (confirm('Anh/chị có muốn hủy công việc ' + taskId + ' không?')) {
        if (taskId != null && taskId > 0) {
            _postJson(
                '/Home/AssignTaskCommand',
                { taskId: taskId, command: 'TASKCANCEL' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        _alert("Công việc đã được hủy hoàn thành", "success");
                        _redirect('/Home/Index?cate=0', 2000);
                        //window.location.href = '/Home/Index?cate=0';
                    }
                    else {
                        _alert('Thực hiện thất bại: ' + ret.ErrorMsg, 'warning');
                    }
                },
                function (ret) {
                    _alert('Error');
                    console.log(ret);
                },
                true
            );
        }
        else {
            _alert('Mã công việc không hợp lệ', 'warning');
        }
    }
}
function validateAssignerAndFollowe(assigner, follower, owner) {
    var check = false;
    if (follower != null) {
        if (follower.indexOf(assigner) == -1 && follower.indexOf(owner) == -1) {
            check = true
        }
    } else {
        check = true;
    }
    return check;
}

//========== get danh sách branch của người nhận việc => công việc cha
function GetProcessBranchTree() {
    var parentBranchId = $('select[name="BranchId"] option:selected').val();
    var token = $('input[name="__RequestVerificationToken"]').val();
    _call({
        type: "POST",
        url: "/Home/GetProcessBranchTree",
        data: {
            parentBranchId: parentBranchId,
            __RequestVerificationToken: token
        },
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _unlockScreen();
            if (result.success) {
                if (result.Data != null && result.Data.length > 0) {
                    var str = "<option value=''>------ chọn đơn vị nhận việc -------</option>";
                    $('select[name="ProcessBranchId"]').empty();
                    for (var i = 0; i < result.Data.length; i++) {
                        str += "<option value='" + result.Data[i].BranchId + "'>" + result.Data[i].BranchName + "</option>";
                    }
                    $('select[name="ProcessBranchId"]').append(str);
                }
            } else {
                _alert(result.message, 'warning');
            }

        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
        }
    });
}
//=========== get danh sách user xử lý theo branch  => công việc cha ===========
function GetUserAssignerByProcessBranchId() {
    var processBranchId = $('select[name="ProcessBranchId"] option:selected').val();
    var token = $('input[name="__RequestVerificationToken"]').val();
    _call({
        type: "POST",
        url: "/Home/GetUserByBranchId",
        data: {
            branchId: processBranchId,
            __RequestVerificationToken: token
        },
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _unlockScreen();
            if (result.success) {
                if (result.Data != null && result.Data.length > 0) {
                    //var str = "<option value=''>------ chọn người xử lý -------</option>";
                    $('select[name="Assigner"]').empty();
                    $('select[name="Follower"]').empty();
                    for (var i = 0; i < result.Data.length; i++) {
                        str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
                    }
                    $('select[name="Assigner"]').append(str);
                    $('select[name="Follower"]').append(str);
                }
            } else {
                _alert(result.message, 'warning');
            }

        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
        }
    });
}

// ============= get danh sách branch của người nhận việc => frm addnew công việc con
function GetProcessBranchTree_ChildTask() {
    var parentBranchId = $('select[name="child_BranchId"] option:selected').val();
    if (parentBranchId != null && Number(parentBranchId>0)) {
        var token = $('input[name="__RequestVerificationToken"]').val();
        _call({
            type: "POST",
            url: "/Home/GetProcessBranchTree",
            data: {
                parentBranchId: parentBranchId,
                __RequestVerificationToken: token
            },
            async: false,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                if (result.success) {
                    if (result.Data != null && result.Data.length > 0) {
                        var str = "<option value=''>------ chọn đơn vị nhận việc -------</option>";
                        $('select[name="child_ProcessBranchId"]').empty();
                        for (var i = 0; i < result.Data.length; i++) {
                            str += "<option value='" + result.Data[i].BranchId + "'>" + result.Data[i].BranchName + "</option>";
                        }
                        $('select[name="child_ProcessBranchId"]').append(str);
                    }
                } else {
                    _alert(result.message, 'warning');
                }
                _unlockScreen();
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                _alert(error, 'warning');
            }
        });
    }
}

//=========== get danh sách user xử lý theo branch  => frm addnew công việc con ===========
function GetUserAssignerByProcessBranchId_ChildTask() {
    var processBranchId = $('select[name="child_ProcessBranchId"] option:selected').val();
    if (processBranchId != null && Number(processBranchId >0)) {
        var token = $('input[name="__RequestVerificationToken"]').val();
        _call({
            type: "POST",
            url: "/Home/GetUserByBranchId",
            data: {
                branchId: processBranchId,
                __RequestVerificationToken: token
            },
            async: false,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                if (result.success) {
                    if (result.Data != null && result.Data.length > 0) {
                        var str = "";
                        $('select[name="child_Assigner"]').empty();
                        $('select[name="child_Follower"]').empty();
                        for (var i = 0; i < result.Data.length; i++) {
                            str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " -" + result.Data[i].BranchName + "</option>";
                        }
                        var tem = "<option value=''>------ chọn người xử lý -------</option>";
                        $('select[name="child_Assigner"]').append(tem + str);
                        $('select[name="child_Follower"]').append(str);
                    }
                } else {
                    _alert(result.message, 'warning');
                }
                _unlockScreen();

            },
            error: function (xhr, status, error) {
                _unlockScreen();
                _alert(error, 'warning');
            }
        });
    }

}

function GetUserFollowerByProcessBranchId_ChildTask() {
    var processBranchId = $('select[name="child_BranchId"] option:selected').val();
    if (processBranchId != "") {
        var token = $('input[name="__RequestVerificationToken"]').val();
        _call({
            type: "POST",
            url: "/Home/GetUserByBranchId",
            data: {
                branchId: processBranchId,
                __RequestVerificationToken: token
            },
            async: false,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                if (result.success) {
                    if (result.Data != null && result.Data.length > 0) {
                        var str = "";
                        $('select[name="child_Follower"]').empty();
                        for (var i = 0; i < result.Data.length; i++) {
                            str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " -" + result.Data[i].BranchName + "</option>";
                        }
                        $('select[name="child_Follower"]').append(str);
                    }
                } else {
                    _alert(result.message, 'warning');
                }
                _unlockScreen();

            },
            error: function (xhr, status, error) {
                _unlockScreen();
                _alert(error, 'warning');
            }
        });
    }

}



// ============= get danh sách branch của người nhận việc => frm edit công việc con
function GetProcessBranchTree_ChildTask_frmedit(parentBranchId) {
    //var parentBranchId = $('select[name="child_BranchId"] option:selected').val();
    if (parentBranchId != null && Number(parentBranchId>0)) {
        var token = $('input[name="__RequestVerificationToken"]').val();
        _call({
            type: "POST",
            url: "/Home/GetProcessBranchTree",
            data: {
                parentBranchId: parentBranchId,
                __RequestVerificationToken: token
            },
            async: false,
            beforeSend: function () {
                //_lockScreen();
            },
            success: function (result, status, xhr) {
                //_unlockScreen();
                if (result.success) {
                    if (result.Data != null && result.Data.length > 0) {
                        var str = "<option value=''>------ chọn đơn vị nhận việc -------</option>";
                        $('select[name="child_ProcessBranchId"]').empty();
                        for (var i = 0; i < result.Data.length; i++) {
                            //if (result.Data[i].BranchId == parentBranchId) {
                            //    str += "<option value='" + result.Data[i].BranchId + "' selected>" + result.Data[i].BranchName + "</option>";
                            //} else {
                            //    str += "<option value='" + result.Data[i].BranchId + "'>" + result.Data[i].BranchName + "</option>";
                            //}
                            str += "<option value='" + result.Data[i].BranchId + "'>" + result.Data[i].BranchName + "</option>";
                        }
                        $('select[name="child_ProcessBranchId"]').append(str);
                    }
                } else {
                    _alert(result.message, 'warning');
                }

            },
            error: function (xhr, status, error) {
                //_unlockScreen();
                _alert(error, 'warning');
            }
        });
    }
}

//=========== get danh sách user xử lý theo branch  => frm addnew công việc con ===========
function GetUserAssignerByProcessBranchId_ChildTask_frmedit(processBranchId) {
    //var processBranchId = $('select[name="child_ProcessBranchId"] option:selected').val();
    if (processBranchId != null && Number(processBranchId>0)) {
        var token = $('input[name="__RequestVerificationToken"]').val();
        _call({
            type: "POST",
            url: "/Home/GetUserByBranchId",
            data: {
                branchId: processBranchId,
                __RequestVerificationToken: token
            },
            async: false,
            beforeSend: function () {
                //_lockScreen();
            },
            success: function (result, status, xhr) {
                //_unlockScreen();
                if (result.success) {
                    if (result.Data != null && result.Data.length > 0) {
                        var str = "";
                        //var str = "<option value=''>------ chọn người xử lý -------</option>";

                        $('select[name="child_Assigner"]').empty();
                        $('select[name="child_Follower"]').empty();
                        for (var i = 0; i < result.Data.length; i++) {
                            str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " -" + result.Data[i].BranchName + "</option>";
                        }
                        var tem = "<option value=''>------ chọn người xử lý -------</option>";
                        $('select[name="child_Assigner"]').append(tem + str);
                        $('select[name="child_Follower"]').append(str);
                    }
                } else {
                    _alert(result.message, 'warning');
                }

            },
            error: function (xhr, status, error) {
                //_unlockScreen();
                _alert(error, 'warning');
            }
        });
    }

}

function SaveHandOver() {
    var obj = {};
    obj.TaskId = $('#handOver_TaskId').val();
    //obj.TaskHandOverOwner = $('#TaskHandOverOwner').val();
    obj.TaskHandOverAssinger = $('select[name="toHandOver"] option:selected').val();
    obj.TaskHandOverOwner = $('select[name="toHandOverOwner"] option:selected').val();
    //obj.TaskHandOverFollower = $('#TaskHandOverFollower').val();
    obj.TaskHandOverComment = $('#handOver_Comment').val();
    obj.ProcessRate = $('#handOver_ProcessRate').val();
    if (obj.taskId == "") {
        _alert("Không tìm thấy mã công việc", 'warning');
        return false;
    }
    if (obj.TaskHandOverAssinger == "") {
        _alert("Vui lòng chọn người xử lý mới", 'warning');
        return false;
    }
    if (obj.ProcessRate == "") {
        _alert("Vui lòng nhập tỷ lệ hoàn thành", 'warning');
        return false;
    } else if (Number(obj.ProcessRate) > 100 || Number(obj.ProcessRate) <= 0) {
        _alert("Tỷ lệ hoàn thành vượt giá trị cho phép, anh/chị vui long kiem tra lại.", 'warning');
        return false;
    }
    if (obj.TaskHandOverComment.trim().length == 0) {
        _alert("Vui lòng nhập nội dung", 'warning');
        return false;
    }
    if (obj.TaskHandOverComment.trim().length > 200) {
        _alert("Nội dung không quá 200 ký tự", 'warning');
        return false;
    }
    obj.TaskHandOverCommentShort = _replace_all_tag(obj.TaskHandOverComment);
    var token = $('input[name="__RequestVerificationToken"]').val();
    _call({
        type: "POST",
        url: "/Home/SaveHandOver_command",
        dataType: "json",
        data: { handOver: obj, __RequestVerificationToken: token },
        async: false,
        beforeSend: function(){
            _lockScreen();
        },
        success: function (result, status, xhr) {
            if (result.success) {
                $('#handOverTaskModal').modal('hide');
            }
            _alert(result.message, result.success ? 'success' : 'warning');
            _redirect('/Home/Index?cate=0', 2000);
            _unlockScreen();
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
            console.log('error', xhr, status, error);
        }
    });
}


// đánh giá công việc
function SaveEvalueteCriteria(taskId, userType, commentTask) {
    return doSaveEvalueteCriteria(taskId, userType, commentTask);
}

function showEvaluetionCriteria() {
    var authe = _statusId == 6 ? "ASSIGNER" : "";
    showFrmEvalueteCriteria(taskId, authe, $('#div_EvaluetionCriteria'), false,false);
}


function uploadFileEvaluetionCritera() {
    formdataAvaluate = new FormData();

    formdataAvaluate.append('TaskId', taskId);
    formdataAvaluate.append('StatusId', _statusId);
    formdataAvaluate.append('reqType', 'TASKOWNERAVALUATE');
    var fileInput = $('input[name="fileUpload_evaluetion"]').get(0);
    for (i = 0; i < fileInput.files.length; i++) {
        if (fileInput.files[i].size > 20971520) {
            _alert('Tổng dung lượng file upload vượt quá giới hạn (20MB)', 'warning');
            $('#upload-file-info').text('');
            return false;
        }
        var sfilename = fileInput.files[i].name;
        let srandomid = Math.random().toString(36).substring(7);

        formdataAvaluate.append(sfilename, fileInput.files[i]);
    }
    
    //upload process
    $.ajax({
        type: "POST",
        url: "/Home/AssignTaskUpload",
        dataType: "json",
        contentType: false, // Not to set any content header
        processData: false, // Not to process data
        data: formdataAvaluate,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            if (result.ErrorCode == 1) {
                _unlockScreen();
                //_alert('cập nhật tài liệu thành công', 'success');
                //_redirect('/Home/AssignTaskEdit?taskId=' + taskId, 2000);
                //window.location.href = '/Home/AssignTaskEdit?taskId=' + taskId;

                var upi = result.Data[0];
                var it = '<div class="card mb-1 shadow-none border p-2">' +
                    '<div class="row align-items-center">' +
                    '<div class="col pl-2">' +
                    '<p class="file_name">' + upi.FileName + '</p>' +
                    '<p class="mb-0 date_user">' + _owner + ' <span class="date ml-1">' + _date_to_string1(moment(), 'HOUR') + '</span></p>' +
                    '</div>' +
                    '<div class="col-auto pl-0">' +
                    '<a href="javascript:void(0);" class=" text-muted">' +
                    '<i class="fa fa-cloud-download-alt view-ecm" aria-hidden="true" ecm-id="' + upi.DocId + '" ecm-mime-type="' + upi.Mime + '" ecm-file-name="' + upi.FileName + '"> </i>' +
                    '</a>' +
                    '<a href="javascript:void(0);" class=" text-muted ml-2">' +
                    '<i class="fa fa-trash-alt remove-ecm" aria-hidden="true" ecm-id="' + upi.DocId + '" task-id="' + taskId + '" ecm-file-name="' + upi.FileName + '"> </i>' +
                    '</a>' +
                    '</div>' +
                    '</div>' +
                    '</div >';

                var $litupload = $('div.tblFiles');
                if ($litupload != null) {
                    var $avaluateDocument = $litupload.find('h6.avaluate-document');
                    if ($avaluateDocument == null || $avaluateDocument.length == 0) {
                        $litupload.append('<h6 class="avaluate-document">Tài liệu đánh giá</h6>');
                        $litupload.append(it);
                    }
                    else {

                        $(it).insertAfter($avaluateDocument.eq(0));
                    }
                    $litupload.find('i.view-ecm').click(function (e) {
                        var $this = $(this);
                        var docId = $this.attr("ecm-id");
                        var mimeType = $this.attr("ecm-mime-type");
                        var fileName = $this.attr("ecm-file-name");

                        _download_file(docId, fileName, mimeType);
                    });

                    $litupload.find('i.remove-ecm').click(function (e) {
                        var $this = $(this);
                        var docId = $this.attr("ecm-id");
                        var taskId = Number($this.attr("task-id"));
                        var fileName = $this.attr("ecm-file-name");

                        if (confirm('Anh/chị có muốn xóa file ' + fileName + ' không?'))
                            _remove_file(docId, taskId, $this);
                    });
                }
            } else {
                _alert('Cập nhật tài liệu đánh giá thất bại: ' + result.ErrorDetail, 'warning');
                _unlockScreen();
                return false;
            }
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            console.log('error', xhr, status, error);
        }
    });

    //chkatchtbl();
    $('input[name="fileUpload_evaluetion"]').val('');
}