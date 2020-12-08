var formdata = new FormData();
var objTask = {};
var list_ChildTask = [];
var formdataChild = new FormData();
var frmUploadFile_AssignTaskList = new FormData();
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

    var _dateTemp = new Date();
    var defaultDate = new Date(_dateTemp.getFullYear(), _dateTemp.getMonth(), _dateTemp.getDate());
    $('.date').datetimepicker({
        format: 'L',
        defaultDate: defaultDate,
        minDate: defaultDate,
        //singleDatePicker: true,
        autoclose: true,
        todayBtn: false,
        timePicker: false,
        enableOnReadonly: false
    });
    $('#TaskContent, #TaskComment,#child_TaskContent').summernote({
        height: 150
    });

    $("button.btn-save").click(function (e) {
        var excludeLit = ['TaskId', 'ParentId', 'Follower', 'Attorneys'];
        _save_task_v2(1, excludeLit); //1: tassk new
    });
    $("button.btn-complete").click(function (e) {
        var excludeLit = ['TaskId', 'ParentId', 'Attorneys', 'Follower'];
        _save_task_v2(2, excludeLit); //2: assign task
    });
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
            var uploadFileId = $('#UploadId').val() + "_" + sfilename;
            formdata.append(uploadFileId, fileInput.files[i]);
            if (i == 0) {
                str += sfilename;
            }
            else {
                str += ";" + sfilename;
            }
            var markup = "<tr id='" + srandomid + "'><td>" + sfilename + "</td><td class='text-right'><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + uploadFileId +
                "\"); return false;'><i class=\"fa fa-trash\" aria-hidden=\"true\"></i></a></td></tr>"; // Binding the file name  
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
            _alert('Anh/chị chưa chọn nhân viên chat','warning');
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


    $("#fa-chevron-down").on("click", function (e) {
        $("#task_exten").fadeIn("slow");
        $(this).hide();
        $("#fa-chevron-up").show();
    });
    $("#fa-chevron-up").on("click", function (e) {
        $("#task_exten").fadeOut("slow");
        $(this).hide();
        $("#fa-chevron-down").show();
    });

    $("#ck_schedule").on("change", function () {
        if ($(this).is(':checked')) {
            var $frm = $('#frmScheduleTask');
            var scheduleType = $(this).val();
            var param = {};
            param.IsUpdateNow = false;
            param.ScheduleType = scheduleType;
            var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, null);
        } else {
            $('#TaskScheduleCaption').html('');
        }
    });
    $("#ck_scheduleNotify").on("change", function () {
        if ($(this).is(':checked')) {
            var $frm = $('#frmScheduleTask');
            var scheduleType = $(this).val();
            var param = {};
            param.IsUpdateNow = false;
            param.ScheduleType = scheduleType;
            var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, function () { $('input[name="ranEndDateStr"]').val($('input[name="EndDateStr"]').val()); });
            
        } else {
            $('#NotifyScheduleCaption').html('');
        }
    });
    $('select[name="BranchId"]').on("change", function () {
        var ismanager = $(this).find('option:selected').attr('ismanager');
        var opt = "<option value='TASK'>Task</option>";
        //tạm thời đóng lại không được xóa
        //if (ismanager == "1") {
        //    opt += "<option value='PROJECTTASK'>Project</option>";
        //}
        $('select[name="TaskType"]').empty();
        $('select[name="TaskType"]').html(opt);
    });
    $('.btn-close').on("click", function () {
        window.location.href = '/Home/AssignTask';
    });
    //========= xử lý phần người liên quan ===============
    $('select[name="Assigner"]').on("change", function () {
        var str = "<div class='col-9 mb-2'>{data}</div>";
        str += "<div class='col-3 mb-2 text-right'><a class='btn-chat' onclick='chatBusiness(this)' href='#' chat-for='{data}' data-toggle='tooltip' data-placement='right' data-original-title='chat với {data}'><i class='fas fa-comment-alt text-green'></i></a></div>";
        str = str.replace(/{data}/g, $(this).val());
        $('#chatForAssigner').empty();
        $('#chatForAssigner').html(str);
    });
    $('select[name="Attorneys"]').on("change", function () {
        var str = "<div class='col-9 mb-2'> {data}</div>";
        str += "<div class='col-3 mb-2 text-right'><a class='btn-chat' onclick='chatBusiness(this)' href='#' chat-for='{data}' data-toggle='tooltip' data-placement='right' data-original-title='chat với {data}'><i class='fas fa-comment-alt text-green'></i></a></div>";
        str = str.replace(/{data}/g, $(this).val());
        $('#chatForAttorneys').empty();
        $('#chatForAttorneys').html(str);
    });
    $('select[name="Follower"]').on("change", function () {
        var str = "<div class='col-9 mb-2'>{data}</div>";
        str += "<div class='col-3 mb-2 text-right'><a class='btn-chat' onclick='chatBusiness(this)' href='#' chat-for='{data}' data-toggle='tooltip' data-placement='right' data-original-title='chat với {data}'><i class='fas fa-comment-alt text-green'></i></a></div>";
        var tem = "";
        if ($(this).val().length > 0) {
            for (var i = 0; i < $(this).val().length; i++) {
                tem += str.replace(/{data}/g, $(this).val()[i]);
            }
        }
        //str = str.replace(/{data}/g, $(this).val());
        $('#chatForFollower').empty();
        $('#chatForFollower').html(tem);
    })

    // ============= tiêu chí đánh giá ===============
    //$('#btn_AddEvaluetionCriteria').on('click', function () {
    //    addEvaluetionCriteria();
    //})


    $('select[name="BranchId"]').on('change', function () {
        $('select[name="ProcessBranchId"]').empty();
        $('select[name="ProcessBranchId"]').append("<option value=''>--- chọn đơn vị nhận việc ---</option>");
        $('select[name="Assigner"]').empty();
        $('select[name="Assigner"]').append("<option value=''>--- chọn người xử lý ---</option>");
        $('select[name="Follower"]').empty();
        
        GetProcessBranchTree();
        //GetUserFollowerByBranchId();
    });
    $('select[name="ProcessBranchId"]').on('change', function () {
        $('select[name="Assigner"]').empty();
        $('select[name="Assigner"]').append("<option value=''>--- chọn người xử lý ---</option>");
        $('select[name="Follower"]').empty();
        GetUserAssignerByProcessBranchId();
    });

    $('select[name="BranchId"] option:eq(1)').prop('selected', true);
    $('select[name="BranchId"]').change();

    // assign task theo danh sách import

    $('input[name="uploadFile_assignTaskList"]').on("change", function () {
        frmUploadFile_AssignTaskList = new FormData();
        var fileInput = $(this).get(0);
        for (i = 0; i < fileInput.files.length; i++) {
            var sfilename = fileInput.files[i].name;
            frmUploadFile_AssignTaskList.append(sfilename, fileInput.files[i]);
        }
    });
    $('#btn_uploadFile_batchTask').on('click', function () {
        UploadFileExcel_batchAssignTask();
    });
    $('#btn_assignTaskList_save').on('click', function () {
        saveAssigntaskList();
    });
    $('#btn_assignTaskList_Assign').on('click', function () {
        doAssigntaskList();
    });
    $('#btn_assignTaskList_Cancel').on('click', function () {
        window.location.href = document.location.href;
    });


    //===============================
    //====
    //==== xử lý phần tiêu chí đánh giá
    //====
    //===============================
    evaluetionCriteria();
    var $uploadEvaluetion = $('#div_EvaluetionCriteria').find('[name="fileUpload_evaluetion"]');
    if ($uploadEvaluetion != null) {
        $uploadEvaluetion.eq(0).parent().parent().remove();
    }
    //hide upload evaluetion

    $("#assignTaskList_checkAll").on("change", function () {
        assigntaskList_checkAll(this);
    });
    $("#checkAll_dataAssign").on("change", function () {
        dataAssign_checkAll(this);
    });
});

// ===================== end  document.ready() =========================
function _save_task_v2(statusId, excludeLit) {
    formdata.forEach(function (val, key, fD) {
        if (!(val instanceof File))
            formdata.delete(key)
    });

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
        obj.TaskContent = $('#TaskContent').val();
        debugger;
        if (obj.TaskContent == "") {
            _alert("Vui lòng nhập nội dung công việc", "warning");
            return false;
        }
        //check người giao việc, người nhận việc và người quản lý
        if (obj.Assigner != null && obj.Assigner == obj.Attorneys && obj.Assigner != _owner) {
            _alert("Người xử lý phải khác với người quản lý công việc", "warning");
            return false;
        }
        if (!validateAssignerAndFollowe(obj.Assigner, obj.Follower, UserProfile.UserName)) {
            _alert('Người phối hợp phải khác với người xử lý và người giao việc', 'warning');
            return false;
        }
        obj.CommentList = _get_list_comment();
        obj.ChildTask = list_ChildTask;

        // xử lý công việc định kỳ
        if ($("#ck_schedule").prop('checked') == true) {
            obj.ScheduleTask = objScheduleTask;
        }
        if ($("#ck_scheduleNotify").prop('checked') == true) {
            obj.NotifyTask = objScheduleNotify;
        }

        // xử lý tiêu chí đánh giá
        obj.EvaluetionCriteriaList = getInputEvaluetionCriteria("OWNER");
        //validate input tiêu chí đánh giá
        var checkInputCriteria = true;
        if (obj.EvaluetionCriteriaList != null) {
            $.each(obj.EvaluetionCriteriaList, function (index, it) {
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
                            sumProportion = (sumProportion - Number(_it.CriteriaProportion));
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


        for (var p in obj) {
            var i = 0;
            if (Array.isArray(obj[p])) {
                for (var prop in obj[p]) {
                    if (typeof obj[p][prop] == 'object')
                        for (var prop1 in obj[p][prop]) {
                            if (Array.isArray(obj[p][prop][prop1])){
                                for (var _item in obj[p][prop][prop1]) {
                                    if (typeof (obj[p][prop][prop1][_item]) == 'object') {
                                        for (var _it in obj[p][prop][prop1][_item]) {
                                            if (typeof (obj[p][prop][prop1][_item][_it]) == 'object') {
                                                for (var _t in obj[p][prop][prop1][_item][_it]) {
                                                    if (typeof (obj[p][prop][prop1][_item][_it][_t]) == 'object') {
                                                        for (var k in obj[p][prop][prop1][_item][_it][_t]) {
                                                            frmObj.append(`${p}[${prop}][${prop1}][${_item}][${_it}][${_t}][${k}]`, obj[p][prop][prop1][_item][_it][_t][k]);
                                                        }
                                                    } else {
                                                        frmObj.append(`${p}[${prop}][${prop1}][${_item}][${_it}][${_t}]`, obj[p][prop][prop1][_item][_it][_t]);
                                                    }
                                                }
                                            } else {
                                                frmObj.append(`${p}[${prop}][${prop1}][${_item}][${_it}]`, obj[p][prop][prop1][_item][_it]);
                                            }
                                        }
                                    } else {
                                        frmObj.append(`${p}[${prop}][${prop1}][${_item}]`, obj[p][prop][prop1][_item]);
                                    }
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
            else if (typeof obj[p] == 'object')
                for (var prop2 in obj[p]) {
                    if (typeof obj[p][prop2] == 'object')
                        for (var prop3 in obj[p][prop2]) {
                            if (Array.isArray(obj[p][prop2][prop3])) {
                                for (var _item1 in obj[p][prop2][prop3]) {
                                    frmObj.append(`${p}[${prop2}][${prop3}][${_item1}]`, obj[p][prop2][prop3][_item1]);
                                }
                            } else {
                                frmObj.append(`${p}[${prop2}][${prop3}]`, obj[p][prop2][prop3]);
                            }
                        } else {
                        frmObj.append(`${p}[${prop2}]`, obj[p][prop2]);
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
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc','warning');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');
            return false;
        }
        var chk2 = validateInputData(obj);
        if (!chk2) {
            return false;
        }
        $('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
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
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                
                if (result.ErrorCode == 1) {
                    if (result.TaskList != null && result.TaskList.length > 0) {
                        var parentIdOnScreen = Number(_nvl(obj.ParentId, '0'));
                        var taskIdReturn = 0;
                        for (var i = 0; i < result.TaskList.length; i++) {

                            //get task suiable with ParentId from screen
                            if (result.TaskList[i].ParentId == parentIdOnScreen) {
                                taskIdReturn = result.TaskList[i].TaskId;
                                break;
                            }
                        }

                        if (taskIdReturn > 0) {
                            _redirect(statusId == 1 ? '/Home/AssignTaskEdit?taskId=' + taskIdReturn : '/Home/AssignTask', 500);
                        }
                    }
                    _unlockScreen();
                } else {
                    _alert(result.ErrorDetail, result.ErrorCode == 1 ? 'success' : 'warning');
                    _unlockScreen();
                    return false;
                }
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                _alert('Error', 'error');
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
        _alert('Anh/chị chưa nhập nội dung ý kiến','warning');
    }
    else {
        var t = _replace_all_tag($content.summernote('code')).trim();
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
    $('input[name="child_TaskType"]').val($('select[name="TaskType"] option:selected').val());
    var _branchId = $('select[name="BranchId"] option:selected').val();
    $('select[name=child_BranchId]').val(_branchId);
    $('select[name=child_BranchId]').change();

    
    showFrmEvalueteCriteria_ChildTask(0, 'ASSIGNER', $('#div_child_EvaluetionCriteria'), false);
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
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_TaskId', 'child_ParentId', 'child_Attorneys', 'child_Status', 'child_TaskLevel','child_StatusId'];
    var chk = _validate_data($frmTask, excludeLit);
    if (!chk) {
        //alert('Dữ liệu không hợp lệ');
        return false;
    }
    //if (objChild.child_Assigner == objChild.child_Attorneys && objChild.child_Assigner != _owner) {
    //    _alert("Người xử lý phải khác với người quản lý công việc","warning");
    //    return false;
    //}
    if (!validateAssignerAndFollowe(objChild.child_Assigner, objChild.child_Follower, UserProfile.UserName)) {
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
                    $.each(it.ChildCriteria, function (key, _it) {
                        if (_it.CriteriaProportion == null || Number(_it.CriteriaProportion) <= 0) {
                            _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                            checkInputCriteria = false;
                            return false;
                        }
                        sumProportion = (sumProportion - Number(_it.CriteriaProportion));
                        if (_it.CriteriaName == null || _it.CriteriaName.trim() == "") {
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
        //"<td>" + (objChild.hasOwnProperty('child_Attorneys') ? objChild.child_Attorneys : "") + "</td>" +
        "<td>" + objChild.child_EndDateStr + "</td>" +
        "<td>" +
        "<a class='text-muted cursor-pointer' onclick=\"deleteChild(" + objChild.child_clientTaskId +")\"><i class=\"fa fa-trash\" aria-hidden=\"true\"></i></a> | " + 
        "<a class='text-muted cursor-pointer' onclick=\"editChild(" + objChild.child_clientTaskId +")\"><i  class=\"fa fa-edit\" aria-hidden=\"true\"></i></a></td>" +
        "</tr>";
    $("table.tblChildTask tbody").append(tr);
    $('#ChildTaskModal').modal('hide'); 
}

function doEditChildTask() {
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_TaskId', 'child_ParentId', 'child_Attorneys', 'child_TaskLevel', 'child_Status', 'child_StatusId'];
    var chk = _validate_data($frmTask, excludeLit);
    if (!chk) {
        return false;
    }
    var objChild = $('#frmTaskChild').FormToObject();
    //if (objChild.child_Assigner == objChild.child_Attorneys && objChild.child_Assigner != _owner) {
    //    _alert("Người xử lý phải khác với người quản lý công việc", "warning");
    //    return false;
    //}
    if (!validateAssignerAndFollowe(objChild.child_Assigner, objChild.child_Follower, UserProfile.UserName)) {
        _alert('Người phối hợp phải khác với người xử lý và người giao việc', 'warning');
        return false;
    }
    for (let [name, value] of formdataChild) {
        formdata.append(`${name}`, `${value}`);
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
                        sumProportion = (sumProportion - Number(_it.CriteriaProportion));
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
        //"<td>" + (objChild.hasOwnProperty('child_Attorneys') ? objChild.child_Attorneys : "") + "</td>" +
        "<td>" + objChild.child_EndDateStr + "</td>" +
        "<td>" +
        "<a onclick=\"deleteChild(" + objChild.child_clientTaskId + ")\"><i style =\"cursor: pointer;color:red\" class=\"fa fa-trash\" aria-hidden=\"true\"></i></a> | " +
        "<a onclick=\"editChild(" + objChild.child_clientTaskId + ")\"><i style =\"cursor: pointer;color:green\" class=\"fa fa-edit\" aria-hidden=\"true\"></i></a></td>" +
        "</tr>";
    $("table.tblChildTask tbody").append(tr);
    $('#ChildTaskModal').modal('hide'); 
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
    resetFormAddChildTask();
    var item = $.grep(list_ChildTask, function (e) {
        return e.clientTaskId == id;
    });
    
    item = _add_prefix_property(item[0], 'child_');
    GetProcessBranchTree_ChildTask_frmedit(item.child_BranchId);
    $('select[name=child_BranchId]').val(item.child_BranchId);
    $('select[name=child_BranchId]').change();
    $('select[name=child_ProcessBranchId]').val(item.ProcessBranchId);
    $('select[name=child_ProcessBranchId]').change();
    GetUserAssignerByProcessBranchId_ChildTask_frmedit(item.child_ProcessBranchId);
    if (item.child_FollowerStr != null) {
        var arrFollowe = item.child_FollowerStr.split(',');
        item.child_Follower = arrFollowe;
    }
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
        //$('.select2bs4').select2({ theme: 'bootstrap4' });
    }
    $('.select2bs4').select2({ theme: 'bootstrap4' });
    

    $('#ChildTaskModal').modal('show');
    isAddNew = false;
    

    SetData_EvalueteCriteria_ChildTask(item.child_EvaluetionCriteriaList, "OWNER", $('#div_child_EvaluetionCriteria'), true);
} 

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
        success: function (result) {
            if (result.Success) {
                if (result.Data.length > 0) {
                    var data = result.Data;
                    var str = "";
                    for (var i = 0; i < data.length; i++) {
                        str += "<option value='" + data[i].UserName + "' title-code='" + data[i].TitleCode + "' title-name='" + data[i].TitleName + "'>" + data[i].UserName + " - " + data[i].TitleName + " - " + data[i].BranchName +" </option>";
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

    //_post(
    //    url,
    //    it,
    //    function (ret) {
    //        _alert(ret.ErrorCode + ' ' + ret.ErrorMsg, ret.ErrorCode == 1 ? 'success' : 'warning');
    //        if (ret.ErrorCode == 1)
    //            $('button.backscreen').click();
    //    },
    //    function (ret) {
    //        _alert('Error', 'error');
    //    },
    //    false
    //);
}

function validateInputData(obj) {
    var _endDate = _string_to_date(obj.EndDateStr);
    var maxlength_taskContent = 3000; 
    var maxlength_taskName = 200; 

    if (obj.TaskName.length > maxlength_taskName) {
        _alert("Tên công việc không được vượt quá" + maxlength_taskName+ " ký tự.", "warning");
        return false;
    }
    if (obj.TaskContent.length > maxlength_taskContent) {
        _alert("Nội dung công việc không được vượt quá " + maxlength_taskContent+ " ký tự.", "warning");
        return false;
    }
    if (obj.ChildTask.length > 0) {
        for (var it in obj.ChildTask) {
            var _endDateChild = _string_to_date(obj.ChildTask[it].EndDateStr);
            if (_endDateChild > _endDate) {
                _alert("Ngày đến hạn của công việc con phải nhỏ hơn hoặc bằng ngày đến hạn của công việc cha", "warning");
                return false;
            }
            if (obj.ChildTask[it].TaskName.length > maxlength_taskName) {
                _alert("Tên công việc con không được vượt quá" + maxlength_taskName + " ký tự.", "warning");
                return false;
            }
            if (obj.ChildTask[it].TaskContent.length > maxlength_taskContent) {
                _alert("Nội dung công việc con không được vượt quá " + maxlength_taskContent + " ký tự.", "warning");
                return false;
            }
        }
    }

    return true;
}

function chatBusiness(obj) {
    var val = obj.getAttribute("chat-for");
    if (val != null && val.length > 1) {
        window.location.href = 'im:sip:' + val + '@ocb.com.vn';
    }
    else {
        _alert('Anh/chị chưa chọn nhân viên chat','warning');
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
//========== get danh sách branch của người nhận việc
function GetProcessBranchTree() {
    var parentBranchId = $('select[name="BranchId"] option:selected').val();
    if (parentBranchId != "") {
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
    
}

//=========== get danh sách user nguoi phoi hop theo branch giao viec ===========
function GetUserFollowerByBranchId() {
    var processBranchId = $('select[name="BranchId"] option:selected').val();
    if (processBranchId != null && Number(processBranchId > 0)) {
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
                        var tem = "";
                        //$('select[name="Assigner"]').empty();
                        $('select[name="Follower"]').empty();
                        for (var i = 0; i < result.Data.length; i++) {
                            tem += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
                        }
                        //$('select[name="Assigner"]').append(str + tem);
                        $('select[name="Follower"]').append(tem);
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
}

//=========== get danh sách user xử lý theo branch ===========
function GetUserAssignerByProcessBranchId() {
    var processBranchId = $('select[name="ProcessBranchId"] option:selected').val();
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
                _lockScreen();
            },
            success: function (result, status, xhr) {
                _unlockScreen();
                if (result.success) {
                    if (result.Data != null && result.Data.length > 0) {
                        var str = "<option value=''>------ chọn người xử lý -------</option>";
                        var tem = "";
                        $('select[name="Assigner"]').empty();
                        $('select[name="Follower"]').empty();
                        for (var i = 0; i < result.Data.length; i++) {
                            tem += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
                        }
                        $('select[name="Assigner"]').append(str + tem);
                        $('select[name="Follower"]').append(tem);
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
    
}

// ============= get danh sách branch của người nhận việc => frm addnew công việc con
function GetProcessBranchTree_ChildTask() {
    var parentBranchId = $('select[name="child_BranchId"] option:selected').val();
    if (parentBranchId != null && Number(parentBranchId)>0) {
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
    if (processBranchId != null && Number(processBranchId)>0) {
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
                            str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
                        }
                        var tem = "<option value=''>------ chọn người xử lý -------</option>";
                        $('select[name="child_Assigner"]').append(tem+str);
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
    if (processBranchId != null && Number(processBranchId)>0) {
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
                            str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
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
    if (parentBranchId != "") {
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
    if (processBranchId != null && Number(processBranchId) > 0) {
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
                            str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
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
                            str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
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

// upload file assign task
function UploadFileExcel_batchAssignTask() {
    var token = $('input[name="__RequestVerificationToken"]').val();
    var branchId = $('select[name="assignTaskList_BranchId"] option:selected').val();
    if (branchId == null || branchId == "") {
        _alert('Vui lòng chọn đơn vị giao việc', 'warning');
        return false;
    }
    var branchName = $('select[name="assignTaskList_BranchId"] option:selected').text();
    frmUploadFile_AssignTaskList.append('__RequestVerificationToken',token);
    frmUploadFile_AssignTaskList.append('branchId', branchId);
    frmUploadFile_AssignTaskList.append('branchName', branchName);
    _call({
        type: "POST",
        dataType: "json",
        url: "/Home/AssignTaskList_CheckDataInput",
        data: frmUploadFile_AssignTaskList,
        processData: false,
        contentType: false,
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            if (result.Success) {
                $('#btn_assignTaskList_save').show();
                $('#btn_uploadFile_batchTask').hide();
                $('#btn_assignTaskList_Cancel').show();
                $('#btn_assignTaskList_Assign').hide();
                if (result.Data != null && result.Data.length > 0) {
                    var str = "";
                    for (var i = 0; i < result.Data.length; i++) {
                        str += "<tr>";
                        str += "<td>" + (i + 1) + "</td>";
                        str += "<td>" + result.Data[i].TaskName + "</td>";
                        str += "<td>" + result.Data[i].EndDateStr + "</td>";
                        str += "<td>" + result.Data[i].ProcessBranchName + "</td>";
                        str += "<td>" + result.Data[i].ProcessBranchId + "</td>";
                        str += "<td>" + result.Data[i].Assigner_FullName + "</td>";
                        str += "<td>" + result.Data[i].Assigner + "</td>";
                        str += "<td>" + (result.Data[i].Follower_FullName != null ? result.Data[i].Follower_FullName : '') + "</td>";
                        str += "<td>" + (result.Data[i].FollowerStr != null ? result.Data[i].FollowerStr : '') + "</td>";
                        str += "<td>" + result.Data[i].TaskContent + "</td>";
                        str += "<td>" + ((result.Data[i].ErrorMsg == null || result.Data[i].ErrorMsg == "") ? "<i class='fa fa-check' style='color:green'/>" : ("<span style='color:red'>" + result.Data[i].ErrorMsg + "</span>")) + "</td>";
                        str += "<td><input name='chk_isSave' type='checkbox'" + ((result.Data[i].ErrorMsg == null || result.Data[i].ErrorMsg == "") ? "checked" : "disabled") + "/></td>";
                        str += "</tr>";
                    }
                    if (str != "") {
                        $('#tbl_DataImport tbody').append(str);
                        _bind_data_to_table($('#tbl_DataImport'), result.Data);
                    }
                }
            } else {
                _alert(result.Message, 'warning');
            }
            _unlockScreen();
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
        }
    });
};

function GetTaskListSave() {
    var ret = null;
    var $tblDataImport= $("#tbl_DataImport");
    var $trlist = $tblDataImport.find('tbody tr');
    if ($trlist != null && $trlist.length > 0) {
        ret = [];
        $.each($trlist, function (idx, elm) {
            var chk = $(elm).find("td input[type='checkbox']:checked");
            if (chk.length > 0) {
                var date = new Date();
                var _id = ((date.getTime() * 10000) + 621355968000000000);
                var obj = $(elm).data('datax');
                obj.UploadId = _id;
                obj.StatusId = 1;
                obj.DueDateStr = obj.EndDateStr;
                //var obj1 = {
                //    Assigner: obj.Assigner,
                //    FollowerStr: obj.FollowerStr,
                //    EndDateStr: obj.EndDateStr,
                //    StartDateStr: obj.StartDateStr,
                //    TaskContent: obj.TaskContent,
                //    TaskName: obj.TaskName,
                //    UploadId: _id,
                //    StatusId: 1,
                //    TaskType: obj.TaskType,
                //    Owner: obj.Owner,
                //    ProcessBranchId: obj.ProcessBranchId,
                //    BranchId: obj.BranchId
                //};
                //ret.push(obj1);
                ret.push(obj);
            }
        });
    }
    return ret;

}

function saveAssigntaskList() {
    var arrData = GetTaskListSave();
    if (arrData.length > 0) {
        var token = $('input[name="__RequestVerificationToken"]').val();
        _call({
            type: "POST",
            url: "/Home/AssignTaskList_Save",
            data: {
                listTask: arrData,
                __RequestVerificationToken: token
            },
            async: false,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                if (result.Success) {
                    $('#tbl_DataAssign').show();
                    $('#tbl_DataImport').hide();
                    $('#btn_assignTaskList_save').hide();
                    $('#btn_uploadFile_batchTask').hide();
                    $('#btn_assignTaskList_Cancel').show();
                    $('#btn_assignTaskList_Assign').show();

                    if (result.Data != null && result.Data.length > 0) {
                        var str = "";
                        for (var i = 0; i < result.Data.length; i++) {
                            str += "<tr>";
                            str += "<td>" + (i + 1) + "</td>";
                            str += "<td>" + result.Data[i].TaskId + "</td>";
                            str += "<td>" + result.Data[i].TaskName + "</td>";
                            str += "<td>" + result.Data[i].EndDateStr + "</td>";
                            str += "<td>" + result.Data[i].ProcessBranchName + "</td>";
                            str += "<td>" + result.Data[i].ProcessBranchId + "</td>";
                            str += "<td>" + result.Data[i].Assigner_FullName + "</td>";
                            str += "<td>" + result.Data[i].Assigner + "</td>";
                            str += "<td>" + (result.Data[i].Follower_FullName != null ? result.Data[i].Follower_FullName : '') + "</td>";
                            str += "<td>" + (result.Data[i].FollowerStr != null ? result.Data[i].FollowerStr : '') + "</td>";
                            str += "<td>" + result.Data[i].TaskContent + "</td>";
                            str += "<td>" + ((result.Data[i].ErrorMsg == null || result.Data[i].ErrorMsg == "") ? "<i class='fa fa-check' style='color:green'/>" : ("<span style='color:red'>" + result.Data[i].ErrorMsg + "</span>")) + "</td>";
                            str += "<td><input name='chk_isSave' type='checkbox'" + ((result.Data[i].ErrorMsg == null || result.Data[i].ErrorMsg == "") ? "checked" : "disabled") + "/></td>";
                            str += "</tr>";
                        }
                        if (str != "") {
                            $('#tbl_DataAssign tbody').append(str);
                            _bind_data_to_table($('#tbl_DataAssign'), result.Data);
                        }
                    }
                } else {
                    _alert(result.Message, 'warning');
                }
                _unlockScreen();
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                _alert(error, 'warning');
            }
        });
    } else {
        _alert('Không có dữ liệu, anh/chị vui lòng kiểm tra lại', 'warning');
        return false;
    }
}

function doAssigntaskList() {
    var ret = null;
    var $tblDataImport = $("#tbl_DataAssign");
    var $trlist = $tblDataImport.find('tbody tr');
    if ($trlist != null && $trlist.length > 0) {
        ret = [];
        $.each($trlist, function (idx, elm) {
            var chk = $(elm).find("td input[type='checkbox']:checked");
            if (chk.length > 0) {
                var date = new Date();
                var _id = ((date.getTime() * 10000) + 621355968000000000);
                var obj = $(elm).data('datax');
                obj.UploadId = _id;
                obj.StatusId = 2;
                obj.DueDateStr = obj.EndDateStr;
                ret.push(obj);
            }
        });
    }
    if (ret.length > 0) {
        var token = $('input[name="__RequestVerificationToken"]').val();
        _call({
            type: "POST",
            url: "/Home/AssignTaskList_Save",
            data: {
                listTask: ret,
                __RequestVerificationToken: token
            },
            async: false,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                if (result.Success) {
                    _alert('Giao việc thành công', 'success');
                    _redirect(location.href, 2000);
                } else {
                    _alert(result.Message, 'warning');
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


//==============================
//====
//==== xử lý tiêu chí đánh giá
//====
//==============================
function evaluetionCriteria() {
    _call({
        type: "GET",
        url: "/Home/EvaluetionCriteria",
        data: {
            taskId: 0,
            allowsEdit:false
        },
        async: false,
        beforeSend: function () {
            //_lockScreen();
        },
        success: function (result, status, xhr) {
            $('#div_EvaluetionCriteria').empty();
            $('#div_EvaluetionCriteria').html(result);
        },
        error: function (xhr, status, error) {
            _alert(error, 'warning');
        }
    });
}

function getInputEvaluetionCriteria() {
    var listEvaluetionCriteria = [];
    var obj = {};
    var arrChild = [];

    obj.CriteriaType = "OWNER";
    obj.CriteriaNo = 1;
    obj.CriteriaName = 'Tiêu chí chất lượng công việc';
    obj.CriteriaProportion = $('input[name="EvaluetionCriteria_quanlity_Proportion"]').val();

    $('#btn_AddEvaluetionCriteria_child > tbody  > tr').each(function (index, tr) {
        var objChild = {};
        var $lit = $(this).find('input');

        if ($lit != null) {
            for (var i = 0; i < $lit.length; i++) {
                var $it = $lit.eq(i);
                var propName = $it.attr('pro-name');
                if (_nvl($it.val())!='')
                    objChild[propName] = $it.val();
            }
        }

        objChild.CriteriaType = "OWNER";    
        objChild.CriteriaNo = (index + 1);
        arrChild.push(objChild);
    });
    obj.ChildCriteria = arrChild;
    listEvaluetionCriteria.push(obj);

    var obj1 = {};
    obj1.CriteriaNo = 2;
    obj1.CriteriaType = "OWNER";
    obj1.CriteriaName = 'Tiêu chí tiến độ';
    obj1.CriteriaProportion = $('input[name="EvaluetionCriteria_progress_Proportion"]').val();
    listEvaluetionCriteria.push(obj1);
    return listEvaluetionCriteria;
}


function assigntaskList_checkAll(el) {
    $('#tbl_DataImport > tbody > tr').each(function (index, tr) {
        var $litp = $(this).find('input[name="chk_isSave"]');
        if ($litp != null) {
            for (var i = 0; i < $litp.length; i++) {
                var $it = $litp.eq(i);
                if (!$it.is(':disabled')) {
                    if ($(el).is(':checked')) {
                        if (!$it.is(':checked')) {
                            $it.prop("checked", true);
                        }
                    } else {
                        if ($it.is(':checked')) {
                            $it.prop("checked", false);
                        }
                    }
                }
            }
        }
    });
}
function dataAssign_checkAll(el) {
    $('#tbl_DataAssign > tbody > tr').each(function (index, tr) {
        var $litp = $(this).find('input[name="chk_isSave"]');
        if ($litp != null) {
            for (var i = 0; i < $litp.length; i++) {
                var $it = $litp.eq(i);
                if (!$it.is(':disabled')) {
                    if ($(el).is(':checked')) {
                        if (!$it.is(':checked')) {
                            $it.prop("checked", true);
                        }
                    } else {
                        if ($it.is(':checked')) {
                            $it.prop("checked", false);
                        }
                    }
                }
            }
        }
    });
}
