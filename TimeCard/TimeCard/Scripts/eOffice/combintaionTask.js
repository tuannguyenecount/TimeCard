var formdata = new FormData();
var objTask = {};
var list_ChildTask = [];
var formdataChild = new FormData();

var isAddNew = true;
$(function () {
    $(document).ajaxStart(function () {
        $("#fileButton").prop('disabled', true);
    });

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

    $('#btnSaveComment').click(_insert_comment);

    $('button.insertComment').click(function (e) {
        $('#CommentModal').find('#IndexComment').val('-1');
    });


    $('i.view-ecm').click(function (e) {
        var $this = $(this);
        var docId = $this.attr("ecm-id");
        var mimeType = $this.attr("ecm-mime-type");
        var fileName = $this.attr("ecm-file-name");

        _download_file(docId, fileName, mimeType);
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
                    _alert(ret.ErrorCode == 1 ? 'Xóa ý kiến thành công' : ret.ErrorMsg), ret.ErrorCode == 1? 'success' : 'warning';
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
        var n = $this.attr('chat-for');
        if (n != null && n.length > 1) {
            window.location.href = 'im:sip:' + n + '@ocb.com.vn';
        }
        else {
            _alert('Anh/chị chưa chọn nhân viên chat');
        }
    });

    $('#tree2').treed({ openedClass: 'fa-folder-open', closedClass: 'fa-folder' });
    $('.parent-tree').click();
    //$('#btnAssignChildTask').on('click', doProcessChildTaskSave(2));

    //$('#btnEvaluate').on("click", showFrmEvaluete);
    //$('#btnReport').on("click", showFrmEvalueteProcess);
    $('button.btn-handOver').click(function () {
        showfrmHandOver();
    });

    showEvaluetionCriteria();
    $('input[pro-name="CriteriaWorking"]').prop('disabled', 'disabled');
    $('input[name="fileUpload_evaluetion"]').parent().parent().hide();
});


function _insert_comment() {
    var $content = $("#TaskComment");

    var val = $content.val();
    var $tblComment = $("table.tblComment");
    var currentDate = new Date();
    if ('' === val || '<p><br></p>' === val) {
        _alert('Anh/chị chưa nhập nội dung ý kiến');
    }
    else if (val.length > 2000) {
        _alert('Nội dung ý kiến không vượt quá 2000 ký tự', 'warning');
        return false;
    }
    else {
        var t = _replace_all_tag($content.summernote('code')).trim();
        t = t.length > 200 ? t.substring(0, 200) + '...' : t;
        var $body = $tblComment.find("tbody");
        var $choiceBranch = $('select[name="BranchId"] option:selected');
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

        ////insert new comment
        //var cnt = $body.find('tr').length;
        //var $removeRow = $("<i class=\"fa fa-trash remove-comment\" aria-hidden=\"true\" style=\"cursor: pointer; color: red\" /> ");
        //var $editRow = $("<i class=\"fa fa-edit edit-comment\" aria-hidden=\"true\" style=\"cursor: pointer;color: green; margin-left:10px\" />");

        //var $tr = $('<tr index-row="' + cnt + '">');
        //$tr.data("datax", obj);
        //$tr.append('<td>' + obj.CreatedDateStr + '</td>');
        //$tr.append('<td>' + obj.CreatedUser + '</td>');
        ////$tr.append('<td>' + (obj.TitleName != null ? obj.TitleName : '') + '</td>');
        //$tr.append('<td class="max-width-comment">' + obj.CommentContentShort + '</td>');

        //var $cmd = $('<td>');
        //// $cmd.append($removeRow);
        ////$cmd.append($editRow);
        //$tr.append($cmd);

        var $tr = "";
        $tr += "<div class='media media_comment'>";
        $tr += "<img src='/Images/avatar-default.jpg' class='user-image rounded-circle mr-3' alt='...'>";
        $tr += "<div class='media-body'>";
        $tr += "<h6 class='mt-0 mb-0'>" + _owner + " <span class='date ml-4'>26/10/2020 11:40:18</span></h6> " + val + "";
        $tr += "</div></div>";

        obj.command = "NEW";
        _postJson(
            '/Home/AssignTaskCallComment',
            obj,
            function (ret) {
                //success
                //_alert(ret.ErrorCode == 1 ? 'Nhập ý kiến thành công' : ret.ErrorMsg, ret.ErrorCode == 1 ? 'success' : 'warning');
                //$body.prepend($tr);
                //_reindex_comment_table();

                if (ret.ErrorCode == 1) {
                    _alert('Gửi ý kiến phản hồi thành công', 'success');
                    isComment = 1;
                    if ($('#nav-comment').children().eq(3).length > 0) {
                        $('#nav-comment').children().eq(2).after($tr);
                    } else {
                        $('#nav-comment').append($tr);
                    }
                } else {
                    isComment = -1;
                    _alert('Gửi ý kiến phản hồi thất bại', 'warning');
                }
            },
            function (ret) {
                ////error
                //_alert('Lỗi thêm ý kiến');
                //console.log(ret);

                isComment = -1;
                _alert('Gửi ý kiến phản hồi thất bại', 'warning');
            },
        );

        //reset data
        $content.summernote("code", "<p><br></p>");

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


function showfrmHandOver() {
    $.ajax({
        type: "GET",
        url: "/Home/HandOverTask",
        data: { taskId: taskId },
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

function SaveHandOver() {
    var obj = {};
    obj.TaskId = $('#handOver_TaskId').val();
    //obj.TaskHandOverOwner = $('#TaskHandOverOwner').val();
    obj.TaskHandOverAssinger = $('select[name="toHandOver"] option:selected').val();
    obj.TaskHandOverOwner = $('select[name="toHandOverOwner"] option:selected').val();
    obj.TaskHandOverFollower = $('select[name="toHandOverFollower"] option:selected').val();
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
    if (obj.TaskHandOverOwner == "") {
        _alert("Vui lòng chọn người quản lý mới", 'warning');
        return false;
    }
    if (obj.TaskHandOverFollower == "") {
        _alert("Vui lòng chọn người phối hợp mới", 'warning');
        return false;
    }
    if (obj.ProcessRate == "") {
        _alert("Vui lòng nhập tỷ lệ hoàn thành", 'warning');
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
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _unlockScreen();
            if (result.success) {
                $('#handOverTaskModal').modal('hide');
            }
            _alert(result.message, result.success ? 'success' : 'warning');
            _redirect('/Home/Index?cate=0', 2000);
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
            console.log('error', xhr, status, error);
        }
    });
}
function showEvaluetionCriteria() {
    var authe = _statusId == 6 ? "ASSIGNER" : "";
    showFrmEvalueteCriteria(taskId, authe, $('#div_EvaluetionCriteria'), false, false);
}