var formdata = new FormData();
$(function () {
    $('#TaskContent, #TaskComment,#child_TaskContent').summernote({
        height: 150
    });
    $(document).ajaxStart(function () {
        $("#fileButton").prop('disabled', true);
    });

    $(document).ajaxStop(function () {
        $("#fileButton").prop('disabled', false);
        $("#fileInput").val("");
    });

    $('[name="BranchId"]').on("select2:select", function (e) {
        console.log("select2:select", e.params.data);
    });

    _set_control_number();
    
    //Initialize Select2 Elements
    $('.select2bs4').select2({ theme: 'bootstrap4'});   

    $('.date').datetimepicker({
        format: 'L',
        //minDate: new Date(),
        //singleDatePicker: true,
        autoclose: true,
        todayBtn: false,
        timePicker: true
    });
    //StartDate 

    $('#TaskContent, #TaskComment').summernote({
        height: 150
    });

    $('#btn_add-child-task').click(_add_child_form);


    $("button.btn-save").click(function (e) {
        var excludeLit = ['TaskId', 'ParentTaskId', 'Attorneys', 'Follower', 'Assigner', 'TaskContent'];
        _save_task(1, excludeLit); //1: tassk new
    });
    $("button.btn-assign").click(function (e) {
        var excludeLit = ['TaskId', 'ParentTaskId', 'Attorneys', 'Follower'];
        _save_task(2, excludeLit); //3: assign task
    });

    $("button.btn-cancel").click(function (e) {
        _cancel_task(taskId);
    });
    $("button.btn-complete").click(function (e) {
        _complete_task(taskId);
    });
    $("button.btn-spending").click(function (e) {
        _spending_task(taskId);
    });
    
    //$('i.cmd-add-child-task').click(_add_child_form);

    $('button.insertComment').click(function (e) {
        $('#CommentModal').find('#IndexComment').val('-1');
    });

    $('#btnSaveComment').click(_insert_comment);

    $("#fileUploads").on("change", function () {
        formdata = new FormData();
        formdata.append('TaskId', taskId);
        var fileInput = $(this).get(0);
        //Iterating through each files selected in fileInput
        for (i = 0; i < fileInput.files.length; i++) {

            var sfilename = fileInput.files[i].name;
            let srandomid = Math.random().toString(36).substring(7);

            formdata.append(sfilename, fileInput.files[i]);

            var markup = "<tr id='" + srandomid + "'><td>" + sfilename + "</td><td></td><td></td><td></td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + sfilename +
                "\"); return false;'><i class=\"fa fa-trash\" aria-hidden=\"true\" style=\"color:red\"></i></a></td></tr>"; // Binding the file name
            $("table.tblFiles tbody").append(markup);

        }

        //upload process
        $.ajax({
            type: "POST",
            url: "/Home/ProcessTaskUpload",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: formdata,
            success: function (result, status, xhr) {
                if (result.ErrorCode == 1) {
                    window.location.href = '/Home/AssignTaskEdit?taskId=' + taskId;
                }
            },
            error: function (xhr, status, error) {
                console.log('error', xhr, status, error);
            }
        });

        chkatchtbl();
        $('#fileUploads').val('');
    });

    $('.btn-chat').click(function (e) {
        $this = $(this);
        var n = $this.attr('chat-for');
        var val = $('[name="' + n + '"]').val();
        if (val != null && val.length > 1) {
            window.location.href = 'im:sip:' + val + '@ocb.com.vn';
        }
        else {
            _alert('Anh/chị chưa chọn nhân viên chat');
        }
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
            _remove_file(docId, taskId, $this);
    });

    $("#child_fileUploads").on("change", function () {
        var fileInput = $(this).get(0);
        var str = "";
        for (i = 0; i < fileInput.files.length; i++) {
            var sfilename = fileInput.files[i].name;
            formdata.append($('#child_UploadId').val() + "_" + sfilename, fileInput.files[i]);
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

});

function _save_task(statusId, excludeLit) {

    formdata.delete('Assigner');
    $('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
    
    var frmObj = new FormData();
    frmObj = formdata;

    var $frmTask = $('#frmTaskChild');
    var chk = _validate_data($frmTask, excludeLit);

    if (chk) {
        var $lstDiv = $('<div class="listcomment">');
        var $tblComment = $("table.tblComment");
        var cnt = $tblComment.find('body tr').length;
        var obj = $frmTask.FormToObject();
        obj.CommentList = _get_list_comment();
        obj.ChildTask = _get_list_child();
        for (var p in obj) {
            var i = 0;
            if (Array.isArray(obj[p])) {
                for (var prop in obj[p]) {
                    if (typeof obj[p][prop] == 'object')
                        for (var prop1 in obj[p][prop]) {
                            frmObj.append(`${p}[${prop}][${prop1}]`, obj[p][prop][prop1]);
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
        if (statusId == 3 && (obj.Assigner == null || (obj.Assigner!=null && obj.Assigner.length == 0))) {
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');

            return;
        }

        $.ajax({
            type: "POST",
            url: "/Home/ProjectTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            success: function (result, status, xhr) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                if (result.ErrorCode == 1) {
                    window.location = (statusId==1 ? '/Home/AssignTaskEdit?taskId=' + result.TaskId : "/Home/TaskList");
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

function _cancel_task(taskId) {
    if (confirm('Anh/chị có muốn hủy công việc ' + taskId + ' không?')) {
        if (taskId != null && taskId > 0) {
            _postJson(
                '/Home/ProjectTaskCommand',
                { taskId: taskId, command: 'TASKCANCEL' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        window.location.href = '/Home';
                    }
                    else {
                        _alert(ret.ErrorCode + ': ' + ret.ErrorMsg);
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
function _complete_task(taskId) {
    if (confirm('Anh/chị có muốn hoàn thành công việc ' + taskId + ' không?')) {
        if (taskId != null && taskId > 0) {
            _postJson(
                '/Home/ProjectTaskCommand',
                { taskId: taskId, command: 'TASKCOMPLETE' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        window.location.href = '/Home';
                    }
                    else {
                        _alert(ret.ErrorCode + ': ' + ret.ErrorMsg);
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

function _spending_task(taskId) {
    if (confirm('Anh/chị có muốn tạm dừng công việc ' + taskId + ' không?')) {
        if (taskId != null && taskId > 0) {
            _postJson(
                '/Home/ProjectTaskCommand',
                { taskId: taskId, command: 'TASKSPENDING' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        window.location.href = '/Home';
                    }
                    else {
                        _alert(ret.ErrorCode + ': ' + ret.ErrorMsg);
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
function _insert_comment() {
    var $modal = $('#CommentModal');
    var $content = $("#TaskComment");
    var indexComment = $modal.find('#IndexComment').val();

    var val = $content.val();
    var $tblComment = $("table.tblComment");
    var currentDate = new Date();
    if ('' === val || '<p><br></p>' === val) {
        _alert('Anh/chị chưa nhập nội dung ý kiến');
    }
    else {
        var t = _replace_all_tag($($content.summernote('code')).text()).trim();
        t = t.length > 200 ? t.substring(0, 200) + '...' : t;
        var $body = $tblComment.find("tbody");
        var $choiceBranch = $('select[name="BranchId"] option:selected');
        var taskId = Number($modal.find("#TaskIdComment").val());
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

        //insert new comment
        if (indexComment == '-1') {
            var cnt = $body.find('tr').length;
            var $removeRow = $("<i class=\"fa fa-trash remove-comment\" aria-hidden=\"true\" style=\"cursor: pointer; color: red\" /> ");
            var $editRow = $("<i class=\"fa fa-edit edit-comment\" aria-hidden=\"true\" style=\"cursor: pointer;color: green; margin-left:10px\" />");

            var $tr = $('<tr index-row="' + cnt + '">');
            $tr.data("datax", obj);

            $tr.append('<td>' + obj.CreatedUser + '</td>');
            $tr.append('<td>' + (obj.TitleName != null ? obj.TitleName : '') + '</td>');
            $tr.append('<td>' + obj.CreatedDateStr + '</td>');
            $tr.append('<td class="max-width-comment">' + obj.CommentContentShort + '</td>');

            var $cmd = $('<td>');
            $cmd.append($removeRow);
            $cmd.append($editRow);
            $tr.append($cmd);
            obj.command = "NEW";
            _postJson(
                '/Home/ProjectTaskCallComment',
                obj,
                function (ret) {
                    //success
                    _alert(ret.ErrorCode + ' : ' + ret.ErrorMsg);
                    window.location.href = '/Home/ProjectTaskEdit?taskId=' + taskId;
                },
                function (ret) {
                    //error
                    _alert('Lỗi thêm ý kiến');
                    console.log(ret);
                },
            );
        }
        else {
            //update comment in list
            var $tr = $body.find('tr').eq(indexComment);
            var oldData = $tr.data("datax");

            obj.CommentId = oldData.CommentId;

            $tr.data("datax", obj);

            obj.command = "UPDATE";
            _postJson(
                '/Home/ProjectTaskCallComment',
                obj,
                function (ret) {
                    //success
                    _alert(ret.ErrorCode + ' : ' + ret.ErrorMsg);
                    console.log(ret);
                    $tr.find('td').eq(2).text(obj.CreatedDateStr);
                    $tr.find('td').eq(3).text(obj.CommentContentShort);
                },
                function (ret) {
                    //error
                    _alert('Lỗi cập nhật ý kiến');
                    console.log(ret);
                },
            );
        }

        //reset data
        $content.summernote("code", "<p><br></p>");

        //close modal
        $modal.modal('hide');
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

function _get_list_child() {
    var ret = null;
    var $tblComment = $("table.tblChildTask");
    var $trlist = $tblComment.find('tbody tr');
    if ($trlist != null && $trlist.length > 0) {
        ret = [];
        $.each($trlist, function (idx, elm) {
            var obj = $(elm).FormToObject();
            var obj1 = {
                TaskId: obj.cTaskId,
                Assigner: obj.cAssigner,
                EndDateStr: obj.cEndDateStr,
                StartDateStr: obj.cStartDateStr,
                TaskContent: obj.cTaskContent,
                TaskName: obj.cTaskName,
                TaskPriority: obj.cTaskPriority
            };

            ret.push(obj1);
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
            _alert(ret.ErrorCode + ' : ' + ret.ErrorMsg);
            debugger
            if (ret.ErrorCode == 1) {
                $iconDelete.closest('.card').remove();
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

var rangeDate = 12; //1 year
function _check_time(t) { //dang error ko lay dc date cua datepicker
    let ret = true;
    let msg = '';

    if (t == 1) //Theo thời gian
    {
        let fd;
        let td;

        //check date for controls
        let litx = [
            ['StartDateStr', 'EndDateStr', 'Từ ngày phải nhỏ hơn đến ngày\n', 'Thời gian không quá ' + rangeDate + ' tháng\n'],
            ['EndDateStr', 'DueDateStr', 'Đến ngày phải nhỏ hơn đến ngày hết hạn\n', 'Thời gian không quá ' + rangeDate + ' tháng\n']
        ];

        for (let i = 0; i < litx.length; i++) {
            var it = litx[i];

            //clear error class of elements
            _toogle_class(it[0], 'error', false);
            _toogle_class(it[1], 'error', false);

            //tu ngay
            let fd = _getDateValueById(it[0]);
            //den ngay
            let td = _getDateValueById(it[1]);

            if (fd != null || td != null) {
                if (fd > td) {
                    msg += it[2];
                    //tu ngay
                    _toogle_class(it[0], 'error', true);
                    //den ngay
                    _toogle_class(it[1], 'error', true);
                    ret = false;
                }
                else {
                    var rm = moment(td).diff(fd, 'months', true);
                    if (rm > rangeDate) {
                        _toogle_class(it[0], 'error', true);
                        _toogle_class(it[1], 'error', true);
                        ret = false;
                        msg += it[3];
                    }
                }
            }
            else {
                msg = 'Anh/chị chưa chọn ngày xem báo cáo';
                ret = false;
                _toogle_class(it[0], 'error', true);
                _toogle_class(it[1], 'error', true);
            }
        }
    }

    if (!ret) _alert(msg);
    return ret;
}

function _add_child_form() {
    isAddNew = true;
    $('#ChildTaskModal').modal('show');
    var date = new Date();
    var id = ((date.getTime() * 10000) + 621355968000000000);
    $('#child_UploadId').val(id);
    $('#child_clientTaskId').val(id);
    resetFormAddChildTask();
    $('#child_ParentId').val($('input[id=TaskId]').val());
}
function _build_datetimepicker(id) {
    return $('<div class="input-group date" id="' + id + '" data-target-input="nearest">' +
        '<input name="' + id + '" type="text" class="form-control datetimepicker-input" data-target="#' + id + '" maxlength="10" />' +
        '<div class="input-group-append" data-target="#' + id + '" data-toggle="datetimepicker">' +
            '<div class="input-group-text"><i class="fa fa-calendar"></i></div>' +
        '</div>' +
    '</div>');
}

function _build_receiver_list(lit) {
    var $select = $('<select name="cAssigner" class="form-control select2bs4" placeholder="Chọn người nhận việc">');
    $select.append('<option value="">--Chọn người xử lý--</option>')

    if (lit != null && lit.length > 0) {
        $.each(lit,function (idx, it) {
            $select.append('<option value="' + it.UserName + '" title-code="' + it.TitleCode + '" title-name="' + it.TitleName + '">' + it.UserName + '-' + it.TitleName + '-' + it.BranchName + '</option>')
        });
    }

    return $select;
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


function resetFormAddChildTask() {
    var date = new Date();
    date = date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear();
    $('input[name=child_TaskName]').val('');
    $('input[name=child_EndDateStr]').val();
    $('#child_TaskContent').val('');
    $('#frmTaskChild').find('.note-editable.card-block').html('');
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
    var excludeLit = ['child_TaskId', 'ParentId', 'child_Attorneys', 'child_Follower', 'child_Assigner', 'child_TaskContent'];
    var chk = _validate_data($frmTask, excludeLit);

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
                            frmObj.append(`${p}[${prop}][${prop1}]`, objChild[p][prop][prop1]);
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
            url: "/Home/ProjectTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: true,
            success: function (result, status, xhr) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');

                if (result.ErrorCode == 1) {
                    location.reload();
                    //window.location = (0 == 1 ? '/Home/AssignTaskEdit?taskId=' + result[0].TaskId : "/Home/TaskList");
                }
                else {
                    _alert(result.ErrorCode + ': ' + result.ErrorMsg);
                }
            },
            error: function (xhr, status, error) {
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
    var excludeLit = ['child_clientTaskId'];
    var chk = _validate_data($frmTask, excludeLit);

    if (chk) {
        var $lstDiv = $('<div class="listcomment">');
        for (var p in objChild) {
            var i = 0;
            if (Array.isArray(objChild[p])) {
                for (var prop in objChild[p]) {
                    if (typeof objChild[p][prop] == 'object')
                        for (var prop1 in objChild[p][prop]) {
                            frmObj.append(`${p}[${prop}][${prop1}]`, objChild[p][prop][prop1]);
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
            url: "/Home/ProjectTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: true,
            success: function (result, status, xhr) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');

                if (result.ErrorCode == 1) {
                    location.reload();
                    //window.location = (0 == 1 ? '/Home/AssignTaskEdit?taskId=' + result[0].TaskId : "/Home/TaskList");
                }
                else {
                    _alert(result.ErrorCode + ': ' + result.ErrorMsg);
                }
            },
            error: function (xhr, status, error) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                console.log('error', xhr, status, error);
            },
        });
    }
    else {
        $('button.btn-save,button.btn-complete').removeAttr('disabled');
    }

}

function _rename_property(obj, prefix, newProName) {
    var objx = {};
    for (var n in obj) {
        //console.log('---> ' + n + ' : ' + obj[n]);
        var newProp = n.replace(prefix, newProName);
        objx[newProp] = obj[n];
    }
    return objx;
}
function deleteChild(id) {
    const indx = list_ChildTask.findIndex(v => v.clientTaskId.indexOf(id) > -1);
    list_ChildTask.splice(indx, indx >= 0 ? 1 : 0);
    $("#" + id).remove();
    for (let [name, value] of formdata) {
        if (`${name}`.indexOf(id) > -1) {
            formdata.delete(`${name}`);
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
    $('#frmTaskChild').DataToForm(data);
    $('#child_UploadId').val(id);
    $('#child_clientTaskId').val(id);
    if (listAttachFile != null) {
        for (var i = 0; i < listAttachFile.length; i++) {
            if (listAttachFile[i].bpmCode == data.child_TaskId) {
                let srandomid = Math.random().toString(36).substring(7);
                var markup = "<tr id='" + srandomid + "'><td>" + listAttachFile[i].DocumentTitle + "</td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + listAttachFile[i].DocumentTitle +
                    "\"); return false;'><i style=\"color:red\" class=\"fa fa-trash remove-ecm\" ecm-id='" + listAttachFile[i].Id + "' task-id='" + data.child_TaskId + "' ecm-file-name=\"" + listAttachFile[i].DocumentTitle+"\" aria-hidden=\"true\"></i></a></td></tr>";
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
    $('#frmTaskChild').find('.note-editable.card-block').html(data.child_TaskContent);
    $('.select2bs4').select2({ theme: 'bootstrap4' });


    $('#ChildTaskModal').modal('show');
}
function _add_prefix_property(obj, prefix) {
    var objx = {};
    for (var n in obj) {
        var newProp = prefix + n;
        objx[newProp] = obj[n];
    }
    return objx;
} 