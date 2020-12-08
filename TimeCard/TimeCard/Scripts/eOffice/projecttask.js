var formdata = new FormData();
var objTask = {};
var list_ChildTask = [];
var formdataChild = new FormData();
var isAddNew = true;
$(function () {
    var date = new Date();
    var id = ((date.getTime() * 10000) + 621355968000000000);
    $('#client_TaskId').val(id);
    $('#UploadId').val(id);
    $('[name="BranchId"]').on("select2:select", function (e) {
        console.log("select2:select", e.params.data);
    });

    _set_control_number();
    window.addEventListener("resize", function () { $('.select2bs4').select2({ theme: 'bootstrap4' }); });     
    //Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    });

    $(document).on('collapsed.lte.pushmenu', function (e) {
        setTimeout(function () {
            $('.select2bs4').select2({ theme: 'bootstrap4' });       
        }, 300);
        
    });
    $(document).on('shown.lte.pushmenu', function (e) {
        setTimeout(function () {
            $('.select2bs4').select2({ theme: 'bootstrap4' });
        }, 300);
    });
    
    var defaultDate = new Date();
    $('.date').datetimepicker({
        format: 'L',
        defaultDate: defaultDate,
        minDate: defaultDate,
        //singleDatePicker: true,
        autoclose: true,
        todayBtn: false,
        timePicker: false
    });
    $('#TaskContent, #TaskComment,#child_TaskContent').summernote({
        height: 150
    });

    $("button.btn-save").click(function (e) {
        var excludeLit = ['TaskId', 'ParentTaskId', 'Attorneys', 'Follower', 'Assigner', 'TaskContent'];
        _save_task_v2(1, excludeLit); //1: tassk new
    });
    $("button.btn-complete").click(function (e) {
        var excludeLit = ['TaskId', 'ParentTaskId', 'Attorneys', 'Follower'];
        _save_task_v2(2, excludeLit); //2: assign task
    });
    //$('i.cmd-add-child-task').click(_add_child_form);
    $('#btn_add-child-task').click(_add_child_form);
    $('#btnSaveComment').click(_insert_comment);

    $('button.insertComment').click(function (e) {
        $('#CommentModal').find('#IndexComment').val('-1');
    });

    $("#fileUploads").on("change", function () {
        var fileInput = $(this).get(0);
        var str = "";
        for (i = 0; i < fileInput.files.length; i++) {
            var sfilename = fileInput.files[i].name;
            let srandomid = Math.random().toString(36).substring(7);
            formdata.append($('#UploadId').val() + "_" + sfilename, fileInput.files[i]);
            if (i == 0) {
                str += sfilename;
            }
            else {
                str += ";" + sfilename;
            }
            var markup = "<tr id='" + srandomid + "'><td>" + sfilename + "</td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + sfilename +
                "\"); return false;'><i style=\"color:red\" class=\"fa fa-trash\" aria-hidden=\"true\"></i></a></td></tr>"; // Binding the file name  
            $("table.tblFiles tbody").append(markup);
        }
        if ($('table.tblFiles tr').length > 1) {
            $("table.tblFiles").css("visibility", "visible");
            $('#tblFiles').show();
        } else {
            $("table.tblFiles").css("visibility", "hidden");
            $('#tblFiles').hide();
        }
        $('label[name="lb_fileUploads"]').text(str == "" ? "Chọn files" : str);
    });
    $('lable[name="lb_fileUploads"]').on('click', function () {
        $('label[name="lb_fileUploads"]').text($('#fileUploads').val());
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
});
function _save_task_v2(statusId, excludeLit) {

    formdata.delete('Assigner');
    $('button.btn-save,button.btn-complete').attr('disabled', 'disabled');

    //var files = $("#fileUploads").get(0).files;
    var frmObj = new FormData();
    frmObj = formdata;



    var cp = $('#client_TaskId').val();
    var $frmTask = $('#frmTask');
    var chk = _validate_data($frmTask, excludeLit);

    if (chk) {
        var $lstDiv = $('<div class="listcomment">');
        var $tblComment = $("table.tblComment");
        var cnt = $tblComment.find('body tr').length;
        var obj = $frmTask.FormToObject();
        obj.CommentList = _get_list_comment();
        obj.ChildTask = list_ChildTask;
        
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
        frmObj.append("StatusId", statusId);
        //for (let [name, value] of formdata) {
        //    frmObj.append(`${name}`, `${value}`);
        //}
        

        //check if assign task to user, the assigner have the must
        if (statusId == 2 && (obj.Assigner == null || (obj.Assigner != null && obj.Assigner.length == 0))) {
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
                    _alert(result.ErrorCode + ': ' + result.ErrorMsg, 'success');
                    if (result.TaskList != null && result.TaskList.length > 0) {
                        for (var i = 0; i < result.TaskList.length;i++) {
                            if (result.TaskList[i].ParentId == 0) {
                                _redirect((statusId == 1 ? '/Home/ProjectTaskEdit?taskId=' + result.TaskList[i].TaskId : "/Home/TaskList"), 1000);
                            }
                        }
                    }
                }
                else {
                    _alert(result.ErrorCode + ': ' + result.ErrorMsg,'warning');
                }
            },
            error: function (xhr, status, error) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                _alert('Error: ' + xhr, 'error');
                console.log('error', xhr, status, error);
            },
        });
    }
    else {
        $('button.btn-save,button.btn-complete').removeAttr('disabled');
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
        _alert('Anh/chị chưa nhập nội dung ý kiến', 'warning');
    }
    else {
        var t = _replace_all_tag($($content.summernote('code')).text()).trim();
        t = t.length > 200 ? t.substring(0, 200) + '...' : t;

        var $body = $tblComment.find("tbody");
        var $choiceBranch = $('select[name="BranchId"] option:selected');
        var title = $choiceBranch.attr('title-name') != null ? $choiceBranch.attr('title-name') : null;
        var titleCode = $choiceBranch.attr('title-code') != null ? $choiceBranch.attr('title-code') : null;
        var obj = {
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
            var $removeRow = $("<i class=\"fa fa-trash\" aria-hidden=\"true\" style=\"cursor: pointer; color: red\" />");
            $removeRow.click(function (e) {
                if (confirm('Anh/chị có muốn xóa tập tin này?')) {
                    $(this).parent().parent().remove();
                }
            });
            var $editRow = $("<i class=\"fa fa-edit\" aria-hidden=\"true\" style=\"cursor: pointer;color: green; margin-left:8px\" />");
            $editRow.click(function (e) {
                var $pr = $(this).parent().parent();
                var itx = $pr.data("datax");
                var idx = $pr.attr("index-row");

                //console.log(itx);
                $modal.find('#IndexComment').val(idx);
                $content.summernote("code", itx.CommentContent);
                $modal.modal('show');
            });

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

            $body.append($tr);
        }
        else {
            //update comment in list
            var $tr = $body.find('tr').eq(indexComment);
            $tr.data("datax", obj);

            $tr.find('td').eq(2).text(obj.CreatedDateStr);
            $tr.find('td').eq(3).text(obj.CommentContentShort);
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
                TaskName: obj.cTaskName
                //TaskPriority: obj.cTaskPriority
            };

            ret.push(obj1);
        });
    }
    return ret;
}


function DeleteFile(Fileid, FileName) {
    formdata.delete(FileName);
    formdataChild.delete(FileName);
    $("#" + Fileid).remove();
    chkatchtbl();
}

function chkatchtbl() {
    if ($('table.tblFiles tr').length > 1) {
        $("table.tblFiles").css("visibility", "visible");
        $('#tblFiles').show();
    } else {
        $("table.tblFiles").css("visibility", "hidden");
        $('#tblFiles').hide();
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
    formdataChild = new FormData();
    $('#ChildTaskModal').modal('show');
    var date = new Date();
    var id = ((date.getTime() * 10000) + 621355968000000000);
    $('#child_UploadId').val(id);
    $('#child_clientTaskId').val(id);
    resetFormAddChildTask();
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

///================ toandv1 ==================///

function saveChildTask() {
    if (isAddNew) {
        doAddChildTask();
    } else {
        doEditChildTask();
    }
}


function doAddChildTask() {

    var objChild = $('#frmTaskChild').FormToObject();
    for (let [name, value] of formdataChild) {
        formdata.append(`${name}`, `${value}`);
    }
    //for (let [name, value] of formdata) {
    //    alert(`${name}`);
    //}
    var $frmTask = $('#frmTaskChild');
    //var excludeLit = ['child_Attorneys', 'child_Follower', 'child_Assigner', 'child_TaskContent'];
    //var chk = _validate_data($frmTask, excludeLit);
    //if (!chk) {
    //    alert('Dữ liệu không hợp lệ');
    //    return false;
    //}
    list_ChildTask.push(_rename_property(objChild, 'child_', ''));
    var listFollower = "";
    if (objChild.hasOwnProperty('child_Follower')) {
        for (var i = 0; i < objChild.child_Follower.length; i++) {
            listFollower += "<p>"+objChild.child_Follower[i]+"</p>";
        }
    }

    var tr = "<tr id=\"" + objChild.child_clientTaskId+"\" > " +
        "<td>" + objChild.child_TaskName + "</td>" +
        "<td>" + (objChild.hasOwnProperty('child_Assigner') ? objChild.child_Assigner : "") + "</td>" +
        "<td>" + listFollower + "</td>" +
        "<td>" + (objChild.hasOwnProperty('child_Attorneys') ? objChild.child_Attorneys : "") + "</td>" +
        "<td>" + objChild.child_EndDateStr + "</td>" +
        "<td>" +
        "<a onclick=\"deleteChild(" + objChild.child_clientTaskId +")\"><i style =\"cursor: pointer;color:red\" class=\"fa fa-trash\" aria-hidden=\"true\"></i></a> | " + 
        "<a onclick=\"editChild(" + objChild.child_clientTaskId +")\"><i style =\"cursor: pointer;color:green\" class=\"fa fa-edit\" aria-hidden=\"true\"></i></a></td>" +
        "</tr>";
    $("table.tblChildTask tbody").append(tr);
    $('#ChildTaskModal').modal('hide');
}

function doEditChildTask() {
    var objChild = $('#frmTaskChild').FormToObject();
    for (let [name, value] of formdataChild) {
        formdata.append(`${name}`, `${value}`);
    }
    const indx = list_ChildTask.findIndex(v => v.UploadId === objChild.child_UploadId);
    list_ChildTask.splice(indx, indx >= 0 ? 1 : 0);

    list_ChildTask.push(_rename_property(objChild, 'child_', ''));
    var listFollower = "";
    if (objChild.hasOwnProperty('child_Follower')) {
        for (var i = 0; i < objChild.child_Follower.length; i++) {
            listFollower += "<p>" + objChild.child_Follower[i] + "</p>";
        }
    }
    $('#' + objChild.child_UploadId).remove();

    var tr = "<tr id=\"" + objChild.child_clientTaskId + "\" > " +
        "<td>" + objChild.child_TaskName + "</td>" +
        "<td>" + objChild.child_Assigner + "</td>" +
        "<td>" + listFollower + "</td>" +
        "<td>" + (objChild.hasOwnProperty('child_Attorneys') ? objChild.child_Attorneys : "") + "</td>" +
        "<td>" + objChild.child_EndDateStr + "</td>" +
        "<td>" +
        "<a onclick=\"deleteChild(" + objChild.child_clientTaskId + ")\"><i style =\"cursor: pointer;color:red\" class=\"fa fa-trash\" aria-hidden=\"true\"></i></a> | " +
        "<a onclick=\"editChild(" + objChild.child_clientTaskId + ")\"><i style =\"cursor: pointer;color:green\" class=\"fa fa-edit\" aria-hidden=\"true\"></i></a></td>" +
        "</tr>";
    $("table.tblChildTask tbody").append(tr);
    $('#ChildTaskModal').modal('hide');
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
    const indx = list_ChildTask.findIndex(v => v.clientTaskId.indexOf(id)>-1);
    list_ChildTask.splice(indx, indx >= 0 ? 1 : 0);
    $("#" + id).remove();
    for (let [name, value] of formdata) {
        if (`${name}`.indexOf(id) > -1) {
            formdata.delete(`${name}`);
        }
    }
}
function editChild(id) {
    //var date = new Date();
    //var id = ((date.getTime() * 10000) + 621355968000000000);
    //$('#child_UploadId').val(id);
    //$('#child_clientTaskId').val(id);
    resetFormAddChildTask();
    var item = $.grep(list_ChildTask, function (e) {
        return e.clientTaskId == id;
    });
    item = _add_prefix_property(item[0], 'child_');
    $('#frmTaskChild').DataToForm(item);
    $('#frmTaskChild').find('.note-editable.card-block').html(item.child_TaskContent);
    for (let [name, value] of formdata) {
        if (`${name}`.indexOf(id) > -1) {
            let srandomid = Math.random().toString(36).substring(7);
            var markup = "<tr id='" + srandomid + "'><td>" + (`${name}`.replace((id + '_'), '')) + "</td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + `${name}` +
                "\"); return false;'><i style=\"color:red\" class=\"fa fa-trash\" aria-hidden=\"true\"></i></a></td></tr>"; // Binding the file name  
            $("table.child_tblFiles tbody").append(markup);
        }
    }
    if ($('table.child_tblFiles tr').length > 1) {
        $("table.child_tblFiles").css("visibility", "visible");
        $('#child_tblFiles').show();
    } else {
        $("table.child_tblFiles").css("visibility", "hidden");
        $('#child_tblFiles').hide();
    }
    if (item.hasOwnProperty('child_Follower')) {
        for (var i = 0; i < item.child_Follower.length; i++) {
            $('select[name=child_Follower] > option').each(function () {
                if (this.value === item[i]) {
                    this.attr('selected', 'selected');
                }
            });
        }
        $('.select2bs4').select2({ theme: 'bootstrap4' });
    }
    

    $('#ChildTaskModal').modal('show');
    isAddNew = false;
}
function _add_prefix_property(obj, prefix) {
    var objx = {};
    for (var n in obj) {
        var newProp = prefix + n;
        objx[newProp] = obj[n];
    }
    return objx;
} 

function resetFormAddChildTask() {
    var date = new Date();
    date = _date_to_string(date);
    $('input[name=child_TaskName]').val('');
    $('input[id=ParentId]').val('');
    $('input[name=child_EndDateStr]').val(date);
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