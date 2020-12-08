var formdata = new FormData();
var formdataAvaluate = new FormData();
$(function () {
    $('#TaskContent, #TaskComment,#child_TaskContent').summernote({
        height: 150
    });
    if (_statusId != 1 && _statusId != 2) {
        $('#TaskContent').attr('readonly', 'readonly');
    } 
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

    //$('#TaskContent, #TaskComment').summernote({
    //    height: 150
    //});

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
    //GetUserForAssign(false, $('select[name="TaskType"] option:selected').val());
    $('#btn_add-child-task').click(_add_child_form);


    $("button.btn-save").click(function (e) {
        var newAssigner = $('select[name="Assigner"] option:selected').val();
        if (_statusId !=1 && (old_Assigner != null && newAssigner != "") && newAssigner != old_Assigner) {
            //showConfirmModal('Xác nhận thông tin', 'Anh/chị đang thay đổi người xử lý mới của công việc, vui lòng xác nhận nếu muốn tiếp tục thực hiện');
            if (confirm('Anh/chị đang thay đổi người xử lý mới của công việc, vui lòng xác nhận nếu muốn tiếp tục thực hiện')) {
                var excludeLit = ['TaskId', 'ParentId', 'Attorneys', 'Follower', 'StartDateStr', 'Assigner', 'TaskContent', 'StartDateStr'];
                _save_task(15, excludeLit); //1: tassk new,15: thay đổi người xử lý và chờ xác nhận công việc
            }
        } else {
            var excludeLit = ['TaskId', 'ParentId', 'Attorneys', 'Follower', 'StartDateStr', 'Assigner', 'TaskContent', 'StartDateStr'];
            _save_task(_statusId, excludeLit); //1: tassk new
        }
    });
    $("button.btn-assign").click(function (e) {
        var excludeLit = ['TaskId', 'ParentId', 'Attorneys', 'Follower','StartDateStr'];
        _save_task(2, excludeLit); //3: assign task
    });

    $("button.btn-cancel").click(function (e) {
        //if (isComment == 1)
            _cancel_task(taskId);
        //else
            //_alert('Anh/chị vui lòng nhập ý kiến trước khi thực hiện lệnh này', 'warning');
    });
    $("button.btn-close").click(function (e) {
        if (isComment == 1)
            _close_task(taskId);
        else
            _alert('Anh/chị vui lòng nhập ý kiến trước khi thực hiện lệnh này', 'warning');
    });

    $("button.btn-complete").click(function (e) {
        _complete_task(taskId);
    });
    $("button.btn-spending").click(function (e) {
        if (isComment == 1)
            _spending_task(taskId);
        else
            _alert('Anh/chị vui lòng nhập ý kiến trước khi thực hiện lệnh này', 'warning');
        
    });
    $("button.btn-resume").click(function (e) {
        _resume_task(taskId);
    });
    $("button.btn-handOver").click(function (e) {
        showfrmHandOver();
    });
    
    //$('i.cmd-add-child-task').click(_add_child_form);

    $('button.insertComment').click(function (e) {
        $('#CommentModal').find('#IndexComment').val('-1');
    });

    $('#btnSaveComment').click(_insert_comment);

    $("#fileUploads").on("change", function () {
        formdata = new FormData();
        formdata.append('TaskId', taskId);
        formdata.append('StatusId', _statusId);
        formdata.append('reqType', 'TASK');
        var fileInput = $(this).get(0);
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
            url: "/Home/AssignTaskUpload",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: formdata,
            async: false,
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

    //$("#AvaluateUploadFile").on("change", function () {

    //    formdataAvaluate = new FormData();

    //    //formdata = new FormData();
    //    //formdata.append('TaskId', taskId);
    //    //formdata.append('StatusId', _statusId);
    //    formdataAvaluate.append('reqType', 'TASKOWNERAVALUATE');
    //    var fileInput = $(this).get(0);
    //    ////Iterating through each files selected in fileInput
    //    for (i = 0; i < fileInput.files.length; i++) {

    //        var sfilename = fileInput.files[i].name;
    //        let srandomid = Math.random().toString(36).substring(7);

    //        formdataAvaluate.append(sfilename, fileInput.files[i]);

    //        var markup = "<tr id='" + srandomid + "'><td>" + sfilename + "</td><td></td><td></td><td></td><td><a href='#' onclick='DeleteFile(\"" + srandomid + "\",\"" + sfilename +
    //            "\"); return false;'><i class=\"fa fa-trash\" aria-hidden=\"true\" style=\"color:red\"></i></a></td></tr>"; // Binding the file name
    //        $("table.tblFiles tbody").append(markup);

    //    }

    //    ////upload process
    //    //$.ajax({
    //    //    type: "POST",
    //    //    url: "/Home/AssignTaskUpload",
    //    //    dataType: "json",
    //    //    contentType: false, // Not to set any content header
    //    //    processData: false, // Not to process data
    //    //    data: formdata,
    //    //    success: function (result, status, xhr) {
    //    //        if (result.ErrorCode == 1) {
    //    //            window.location.href = '/Home/AssignTaskEdit?taskId=' + taskId;
    //    //        }
    //    //    },
    //    //    error: function (xhr, status, error) {
    //    //        console.log('error', xhr, status, error);
    //    //    }
    //    //});

    //    //chkatchtbl();
    //    //$('#AvaluateUploadFile').val('');
    //});

    $('.btn-chat').click(function (e) {
        $this = $(this);
        e.preventDefault();
        //var n = $this.attr('chat-for');
        //var val = $('[name="' + n + '"]').val();
        var val = $this.attr('chat-for');

        if (val != null && val.length > 1) {
            window.location.href = 'im:sip:' + val + '@ocb.com.vn';
        }
        else {
            _alert('Anh/chị chưa chọn nhân viên chat','warning');
        }
    });

    //$('.btn-chat-group').click(function (e) {
    //    //var g = client.personsAndGroupsManager.createGroup();
    //    renderConversation('#container', {
    //        participants: ['sip:remote1@contoso.com', 'sip:remote2@contoso.com'],
    //        modalities: ['Chat']
    //    });
    //});

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
            param.ScheduleType = scheduleType;
            param.IsUpdateNow = true;
            param.TaskId = taskId;
            var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, null);
        } else {
            if (old_objScheduleTask !== null) {
                old_objScheduleTask.Status = 0;
                var token = $('input[name="__RequestVerificationToken"]', $('#frmTask')).val();
                doSaveSchedule(old_objScheduleTask, token);
                objScheduleTask = {};
            }
            $('#TaskScheduleCaption').html('');
        }
    });
    $("#ck_scheduleNotify").on("change", function () {
        if ($(this).is(':checked')) {
            var $frm = $('#frmScheduleTask');
            var scheduleType = $(this).val();
            var param = {};
            param.ScheduleType = scheduleType;
            param.IsUpdateNow = true;
            param.TaskId = taskId;
            var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, function () { $('input[name="ranEndDateStr"]').val($('input[name="EndDateStr"]').val()); });
        } else {
            if (old_objScheduleNotify !== null) {
                old_objScheduleNotify.Status = 0;
                var token = $('input[name="__RequestVerificationToken"]', $('#frmTask')).val();
                doSaveSchedule(old_objScheduleNotify, token);
                objScheduleNotify = {};
            }
            $('#NotifyScheduleCaption').html('');
        }
    });

    $('#btnEvaluate').on("click", showFrmEvaluete);

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

    $('#btnTaskReport').on("click", function () {
        showTaskReport();
    });

    $('select[name="BranchId"]').on('change', function () {
        $('select[name="ProcessBranchId"]').empty();
        $('select[name="ProcessBranchId"]').append("<option value=''>--- chọn đơn vị nhận việc ---</option>");
        $('select[name="Assigner"]').empty();
        $('select[name="Assigner"]').append("<option value=''>--- chọn người xử lý ---</option>");
        $('select[name="Follower"]').empty();
        //$('select[name="Follower"]').append("<option value=''>--- chọn người phối hợp ---</option>");
        GetProcessBranchTree();
        GetUserFollowerByBranchId();
    });
    $('select[name="ProcessBranchId"]').on('change', function () {
        $('select[name="Assigner"]').empty();
        $('select[name="Assigner"]').append("<option value=''>--- chọn người xử lý ---</option>");
        //$('select[name="Follower"]').empty();
        //$('select[name="Follower"]').append("<option value=''>--- chọn người phối hợp ---</option>");
        GetUserAssignerByProcessBranchId();
    });


    


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

    $('#ChildTaskModal').find('button[id="btncancelTaskChild"]').on('click', function () {
        var objChild = $('#frmTaskChild').FormToObject();
        if (objChild.child_TaskId > 0) {
            _cancel_task(objChild.child_TaskId);
        }
    });
});

function _resume_task(taskId) {
    if (taskId != null && taskId > 0) {
        _postJson(
            '/Home/AssignTaskCommand',
            { taskId: taskId, command: 'TASKSRESUMEPROCESS' },
            function (ret) {
                if (ret.ErrorCode == 1) {
                    _alert("Mở lại công việc thành công", "success");
                    _redirect('/Home', 2000);
                    //window.location.href = '/Home';
                }
                else {
                    _alert('Thực hiện thất bại','warning');
                }
            },
            function (ret) {
                _alert('Error','warning');
                console.log(ret);
            },
            true
        );
    }
    else {
        _alert('Mã công việc không hợp lệ','warning');
    }
}
function _save_task(statusId, excludeLit) {

    formdata.delete('Assigner');
    //$('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
    formdata.forEach(function (val, key, fD) {
        formdata.delete(key)
    });
    var frmObj = new FormData();
    frmObj = formdata;

    var $frmTask = $('#frmTask');
    var chk = _validate_data($frmTask, excludeLit);

    if (chk) {
        var $lstDiv = $('<div class="listcomment">');
        var $tblComment = $("table.tblComment");
        var cnt = $tblComment.find('body tr').length;
        var obj = $frmTask.FormToObject();
        obj.TaskContent = $('#TaskContent').val();
        if (obj.TaskContent == "") {
            _alert("Vui lòng nhập nội dung công việc", "warning");
            return false;
        }
        obj.CommentList = _get_list_comment();
        obj.ChildTask = _get_list_child();
        // xử lý công việc định kỳ
        if ($("#ck_schedule").prop('checked') == true) {
            obj.ScheduleTask = objScheduleTask;
        }
        if ($("#ck_scheduleNotify").prop('checked') == true) {
            obj.NotifyTask = objScheduleNotify;
        }
        if (obj.TaskName.trim().length == 0) {
            _alert("Tên công việc không hợp lệ", "warning");
            return false;
        }
        if (obj.Assigner != null && (obj.Assigner == obj.Attorneys && obj.Assigner == _owner)) {
            _alert("Người xử lý, người quản lý và người tạo việc giống nhau công việc", "warning");
        }
        if (!validateAssignerAndFollowe(obj.Assigner, obj.Follower, UserProfile.UserName)) {
            _alert('Người phối hợp phải khác với người xử lý và người giao việc', 'warning');
            return false;
        }
        if (obj.ChildTask != null) {
            $.each(obj.ChildTask, function (idx, itx) {
                if (EndDate < _string_to_date(itx.EndDateStr)) {
                    _alert("Ngày đến hạn của công việc cha phải lớn ngày đến hạn của con", "warning");
                    return false;
                }
            });
        }
        if (statusId == 2) {
            var _dateTemp = new Date();
            var dateAss = new Date(_dateTemp.getFullYear(), _dateTemp.getMonth(), _dateTemp.getDate());
            var dateCompare = _string_to_date(obj.EndDateStr);
            if (dateAss > dateCompare) {
                _alert('Ngày đến hạn không hợp lệ', 'warning');
                return false;
            }
        }
        //=========================
        // xử lý tiêu chí đánh giá
        //========================
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
                        if ((count == it.ChildCriteria.length && sumProportion != 50) || (count != it.ChildCriteria.length && sumProportion!=0)) {
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
                            if (Array.isArray(obj[p][prop][prop1])) {
                                for (var _item in obj[p][prop][prop1]) {
                                    if (typeof (obj[p][prop][prop1][_item]) == 'object') {
                                        for (var _it in obj[p][prop][prop1][_item]) {
                                            //frmObj.append(`${p}[${prop}][${prop1}][${_item}][${_it}]`, obj[p][prop][prop1][_item][_it]);
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
                                if (obj[p][prop][prop1] !== null) {
                                    frmObj.append(`${p}[${prop}][${prop1}]`, obj[p][prop][prop1]);
                                }
                                
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
                    frmObj.append(`${p}[${prop2}]`, obj[p][prop2]);
                }
            else {
                frmObj.append(p, obj[p]);
            }
        }

        //trans status
        frmObj.append("StatusId", statusId);

        ////check if assign task to user, the assigner have the must
        if (statusId == 3 && (obj.Assigner == null || (obj.Assigner!=null && obj.Assigner.length == 0))) {
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc','warning');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');
            return false;
        }
        $('button.btn-save,button.btn-complete').prop('disabled', true);

        _call({
            type: "POST",
            url: "/Home/AssignTaskSave",
            contentType: "application/json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            //async: false,
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result) {
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                if (result.ErrorCode == 1) {
                    window.location.href = document.location.href;
                    _unlockScreen();
                }
                else {
                    _alert(result.ErrorDetail, 'warning');
                    _unlockScreen();
                    return false;
                }
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                $('button.btn-save,button.btn-complete').removeAttr('disabled');
                console.log('error', xhr, status, error);
            }
        });
    }
    else {
        $('button.btn-save,button.btn-complete').removeAttr('disabled');
    }
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
                        _alert('Thực hiện thất bại: ' + ret.ErrorMsg,'warning');
                    }
                },
                function (ret) {
                    _alert('Error','warning');
                    console.log(ret);
                },
                true
            );
        }
        else {
            _alert('Mã công việc không hợp lệ','warning');
        }
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
                        _alert('Thực hiện thất bại: ' + ret.ErrorMsg,'warning');
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
            _alert('Mã công việc không hợp lệ','warning');
        }
    }
}
function _complete_task(taskId) {
    if (confirm('Anh/chị có muốn hoàn thành công việc ' + taskId + ' không?')) {
        if (taskId != null && taskId > 0) {
            _postJson(
                '/Home/AssignTaskCommand',
                { taskId: taskId, command: 'TASKCOMPLETE' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        _alert("Công việc đã được hoàn thành", "success");
                        _redirect('/Home/Index?cate=0', 2000);
                        //window.location.href = '/Home/Index?cate=0';
                    }
                    else {
                        _alert('Thực hiện thất bại: ' + ret.ErrorMsg,'warning');
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
            _alert('Mã công việc không hợp lệ','warning');
        }
    }
}

function _spending_task(taskId) {
    if (confirm('Anh/chị có muốn tạm dừng công việc ' + taskId + ' không?')) {
        if (taskId != null && taskId > 0) {
            _postJson(
                '/Home/AssignTaskCommand',
                { taskId: taskId, command: 'TASKSPENDING' },
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        _alert("Công việc đã được tạm dừng", "success");
                        _redirect('/Home/Index?cate=0', 2000);
                        //window.location.href = '/Home/Index?cate=0';
                    }
                    else {
                        _alert('Thực hiện thất bại: '+ ret.ErrorMsg,'warning');
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
            _alert('Mã công việc không hợp lệ','warning');
        }
    }
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
    } else if (val.length > 2000) {
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
            $tr += "<h6 class='mt-0 mb-0'>" + _owner + " <span class='date ml-4'>26/10/2020 11:40:18</span></h6> " + val+"";
            $tr += "</div></div>";
            obj.command = "NEW";
            _postJson(
                '/Home/AssignTaskCallComment',
                obj,
                function (ret) {
                    if (ret.ErrorCode == 1) {
                        _alert('Gửi ý kiến phản hồi thành công','success');
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
                    _alert('Lỗi thêm ý kiến','warning');
                    console.log(ret);
                },
            );

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

function _get_list_child() {
    var ret = null;
    var $tblComment = $("table.tblChildTask");
    var $trlist = $tblComment.find('tbody tr');
    if ($trlist != null && $trlist.length > 0) {
        ret = [];
        $.each($trlist, function (idx, elm) {
            //var obj = $(elm).FormToObject();
            var obj = $(elm).data('datax');
            var obj1 = {
                TaskId: obj.TaskId,
                Assigner: obj.Assigner,
                Attorneys: obj.Attorneys,
                Follower: obj.Follower,
                EndDateStr: obj.EndDateStr,
                StartDateStr: obj.StartDateStr,
                TaskContent: obj.TaskContent,
                TaskName: obj.TaskName,
                TaskPriority: obj.TaskPriority,
                StatusId: obj.StatusId
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
            if (ret.ErrorCode == 1) {
                _alert('Thực hiện thành công', 'success');
                $iconDelete.closest('.card').remove();
            } else {
                _alert('Thực hiện thất bại: ' + ret.ErrorMsg,'warning');
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
    resetFormAddChildTask();
    $('#child_UploadId').val(id);
    $('#child_clientTaskId').val(id);
    $('#child_ParentId').val($('input[id="TaskId"]').val());
    $('#child_TaskLevel').val(_taskLevel);
    $('input[name="child_TaskType"]').val($('select[name="TaskType"] option:selected').val());
    $('#child_TaskType').val(_taskType);
    if (![1, 7, 8, 9, 10, 11].indexOf(_statusId) != -1) {
        $('#btnSaveChildTask').show();
        $('#btnassignTaskChild').show();
    } else {
        $('#btnassignTaskChild').hide();
    }
    $('#btncancelTaskChild').hide();
    $('#btncloseTaskChild').hide();
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
    date = String(date.getDate()).padStart(2, '0') + "/" + String(date.getMonth() + 1).padStart(2, '0') + "/" + date.getFullYear();
    $('input[name=child_TaskName]').val('');
    $('input[name=child_EndDateStr]').val(date);
    $('#child_TaskContent').val('');
    $('#frmTaskChild').find('.note-editable.card-block').html('');

    var litx = ["child_ProcessBranchId", "child_Assigner", "child_Attorneys", "child_Follower"];

    $.each(litx, function (idx, itx) {
        $('select[name=' + itx + ']').val('');
        $('select[name=' + itx + ']').change();
    });
    /*
    $('select[name=child_ProcessBranchId]').val('');
    $('select[name=child_ProcessBranchId]').change();
    $('select[name=child_Assigner]').val('');
    $('select[name=child_Assigner]').change();
    $('select[name=child_Attorneys]').val('');
    $('select[name=child_Attorneys]').change();
    $('select[name=child_Follower]').val('');
    $('select[name=child_Follower]').change();
    */

    $('input[name=child_fileUploads]').val('');
    $('label[name="child_lb_fileUploads"]').text('chọn files');
    $('table.child_tblFiles tbody').html('');
    $('#child_Status').val('');
    $('#child_StatusId').val('');
    $('#child_TaskId').val('');
}

function saveChildTask() {
    if (isAddNew) {
        doAddChildTask();
    } else {
        doEditChildTask();
    }
}

function assignTaskChild(type) {
    var objChild = $('#frmTaskChild').FormToObject();
    objChild = _rename_property(objChild, 'child_', '')
    formdata.delete('Assigner');
    objChild.StatusId = type;
    formdata.forEach(function (val, key, fD) {
        formdata.delete(key)
    });
    var frmObj = new FormData();
    frmObj = formdata;
    //var cp = $('#client_TaskId').val();
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_TaskId', 'ParentId', 'child_Attorneys', 'child_Follower', 'child_Assigner', 'child_Status','child_StatusId'];
    var chk = _validate_data($frmTask, excludeLit);
    if (objChild.TaskName.trim().length == 0) {
        _alert("Tên công việc không hợp lệ", "warning");
        return false;
    }
    //if (objChild.Assigner == objChild.Attorneys && objChild.Assigner != _owner) {
    //    _alert("Người xử lý phải khác với người quản lý công việc", "warning");
    //    return false;
    //}
    if (_string_to_date(objChild.EndDateStr) > EndDate) {
        _alert("Ngày đến hạn của công việc con phải nhỏ hơn hoặc bằng ngày đến hạn của công việc cha", "warning");
        return false;
    }
    if (type == 2) {
        var _dateTemp = new Date();
        var dateAss = new Date(_dateTemp.getFullYear(), _dateTemp.getMonth(), _dateTemp.getDate());
        var dateCompare = _string_to_date(objChild.EndDateStr);
        if (dateAss > dateCompare) {
            _alert('Ngày đến hạn không hợp lệ', 'warning');
            return false;
        }
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
                    //if (count < it.ChildCriteria.length && sumProportion != 0) {
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
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: true,
            beforeSend: function () {
                _lockScreen();
                //$('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
            },
            success: function (result, status, xhr) {
                //$('button.btn-save,button.btn-complete').removeAttr('disabled');
                if (result.ErrorCode == 1) {
                    $('#ChildTaskModal').modal('hide');
                    _alert("Giao việc thành công", "success");
                    window.location.href = document.location.href;
                }
                else {
                    _alert('Thực hiện thất bại: ' + result.ErrorMsg,'warning');
                }
                _unlockScreen();
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
function doAddChildTask() {

    var objChild = $('#frmTaskChild').FormToObject();
    //for (let [name, value] of formdataChild) {
    //    formdata.append(`${name}`, `${value}`);
    //}
    objChild = _rename_property(objChild, 'child_', '')
    formdata.forEach(function (val, key, fD) {
        formdata.delete(key)
    });
    //$('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
    var frmObj = new FormData();
    frmObj = formdata;
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_TaskId', 'ParentId', 'child_Attorneys', 'child_Follower', 'child_Assigner', 'child_Status','child_StatusId'];
    var chk = _validate_data($frmTask, excludeLit);
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
    //if (objChild.Assigner == objChild.Attorneys && objChild.Assigner != _owner) {
    //    _alert("Người xử lý phải khác với người quản lý công việc", "warning");
    //    return false;
    //}
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
        _call({
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
                    $('#ChildTaskModal').modal('hide');
                    _alert("Thêm mới công việc thành công", "success");
                    window.location.href = document.location.href;
                }
                else {
                    _alert('Thực hiện thất bại: ' + result.ErrorMsg,'warning');
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
        //$('button.btn-save,button.btn-complete').removeAttr('disabled');
    }
}
function doEditChildTask() {
    var objChild = $('#frmTaskChild').FormToObject();
    objChild = _rename_property(objChild, 'child_', '')
    formdata.delete('Assigner');
    //$('button.btn-save,button.btn-complete').attr('disabled', 'disabled');
    formdata.forEach(function (val, key, fD) {
        formdata.delete(key)
    });
    var frmObj = new FormData();
    frmObj = formdata;
    var $frmTask = $('#frmTaskChild');
    var excludeLit = ['child_clientTaskId', 'child_Attorneys','child_Follower'];
    var chk = _validate_data($frmTask, excludeLit);
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
    //if (objChild.Assigner == objChild.Attorneys && objChild.Assigner != _owner) {
    //    _alert("Người xử lý phải khác với người quản lý công việc", "warning");
    //    return false;
    //}
    var a = moment('14/09/2020', 'DD/MM/YYYY').toDate();
    if (_string_to_date(objChild.EndDateStr) > EndDate) {
        _alert("Ngày đến hạn của công việc con phải nhỏ hơn hoặc bằng ngày đến hạn của công việc cha", "warning");
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
                    if ((_countCriteriaRemove == it.ChildCriteria.length && sumProportion != 50) || (_countCriteriaRemove != it.ChildCriteria.length && sumProportion!=0)) {
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
        frmObj.append("StatusId", objChild.child_StatusId);

        //check if assign task to user, the assigner have the must
        if (objChild.child_StatusId == 2 && (objChild.Assigner == null || (objChild.Assigner != null && objChild.Assigner.length == 0))) {
            _alert('Để giao việc anh/chị vui lòng chọn Người nhận việc','warning');
            $('button.btn-save,button.btn-complete').removeAttr('disabled');
            return false;
        }
        _call({
            type: "POST",
            url: "/Home/AssignTaskSave",
            dataType: "json",
            contentType: false, // Not to set any content header
            processData: false, // Not to process data
            data: frmObj,
            async: false,
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
function editChild(elm) {
    var date = new Date();
    var id = ((date.getTime() * 10000) + 621355968000000000);
    isAddNew = false;
    var data = $(elm).closest('tr').data('datax');
    resetFormAddChildTask();
    data = _add_prefix_property(data, 'child_');

    GetProcessBranchTree_ChildTask_frmedit(data.child_BranchId);
    GetUserAssignerByProcessBranchId_ChildTask_frmedit(data.child_ProcessBranchId);
    if (data.child_FollowerStr != null) {
        var arrFollowe = data.child_FollowerStr.split(',');
        data.child_Follower = arrFollowe;
    }
    //GetUserForAssign(false, data.child_TaskType);
    $('#frmTaskChild').DataToForm(data);
    $('#child_UploadId').val(id);
    $('#child_clientTaskId').val(id);
    var arrStatus = [6, 5, 12, 13, 14];
    if (arrStatus.indexOf(data.child_StatusId) != -1) {
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
    $('#frmTaskChild').find('.note-editable.card-block').html(data.child_TaskContent);
    $('.select2bs4').select2({ theme: 'bootstrap4' });
    $('#ChildTaskModal').modal('show');
    //$('#ChildTaskModal').find('select[name="child_BranchId"]').change(function () {
    //    $('select[name="child_ProcessBranchId"]').empty();
    //    $('select[name="child_Assigner"]').empty();
    //    $('select[name="child_Follower"]').empty();
    //    GetProcessBranchTree_ChildTask();
    //});
    //$('#ChildTaskModal').find('select[name="child_ProcessBranchId"]').change(function () {
    //    $('select[name="child_Assigner"]').empty();
    //    $('select[name="child_Follower"]').empty();
    //    GetUserAssignerByProcessBranchId_ChildTask();
    //});
    //$('#ChildTaskModal').find('button[id="btncancelTaskChild"]').on('click', function () {
    //    var objChild = $('#frmTaskChild').FormToObject();
    //    if (objChild.child_TaskId > 0) {
    //        _cancel_task(objChild.child_TaskId);
    //    }
    //});
    $("#ChildTaskModal").find('button[id="btncloseTaskChild"]').on('click', function () {
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
function frmEditScheduleTask(scheduleType,taskId) {
    var $frm = $('#frmScheduleTask');
    var param = {};
    param.ScheduleType = scheduleType;
    param.IsUpdateNow = true;
    param.TaskId = taskId;
    //var schedule = $('#frmScheduleTask').ScheduleTask($frm, scheduleType, null);
    var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, null);
    if (scheduleType == "SCHEDULE") {
        setDataToForm($('#scheduleTaskModal'), objScheduleTask);
    }
}

function showFrmEvaluete() {
    var obj = {};
    obj.TaskId = taskId;
    var $frm = $('#frmEvaluate');
    _postJson(
        '/Home/OwnerAvaluateTask',
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
            $frm.find('#btnsaveEvaluate').on('click', function () {
                saveEvaluate(11);
            });
            $frm.find('#btncontinueEvaluate').on('click', function () {
                saveEvaluate(13);
            });
            $frm.find('input[name="my-checkbox"]').on("change", function () {
                if ($(this).is(':checked')) {
                    $("#divDuaDate").fadeIn("slow");
                } else {
                    $("#divDuaDate").fadeOut("slow");
                }
            });
        },
        function (ret) {
            _alert('Error');
            console.log(ret);
        },
        false
    );
}

function saveEvaluate(StatusTask) {

    var obj = {};
    obj.Option1 = $('#Avaluete_Option1').val();
    if (obj.Option1 == "") {
        _alert("Vui lòng nhập tỷ lệ hoàn thành", "warning");
        return false;
    }
    obj.AvaluateResult = $('#Avaluete_AvaluateResult').val();
    if (obj.AvaluateResult == "") {
        _alert("Vui lòng nhập nội dung ", "warning");
        return false;
    }
    obj.TaskId = taskId;
    obj.TaskName = taskName;
    obj.AvaluateType = "OWNER";
    obj.TaskStatusId = StatusTask;
    //formdataAvaluate.append('avaluate', obj);
    formdataAvaluate.append('reqType', 'TASKOWNERAVALUATE');
    formdataAvaluate.append('avaluate', JSON.stringify(obj));
    var token = $('input[name="__RequestVerificationToken"]').val();
    formdataAvaluate.append('__RequestVerificationToken', token);
    $.ajax({
        type: "POST",
        url: '/Home/AssignTask_AvaluateTaskSave',
        dataType: "json",
        //data: { avaluate: obj, __RequestVerificationToken: token },
        data: formdataAvaluate,
        contentType: false, // Not to set any content header
        processData: false, // Not to process data
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result) {
            if (result.ErrorCode == 1) {
                if (StatusTask == 11) {
                    _alert("Công việc đã hoàn thành", "success");
                    _redirect('/Home/Index?cate=0', 2000);
                } else {
                    window.location.href = location.href;
                }
            } else {
                _alert(result.ErrorMsg, "warning");
            }
            _unlockScreen();
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            alert('Lỗi '+ error);
        },
    });
}

function GetUserForAssign(isParent,taskType) {
    var type = taskType;
    var $frm = null;
    if (isParent) {
        //type = $('select[name="TaskType"] option:selected').val();
        $frm = $('#frmTask');
    } else {
        //type = $('input[name="child_TaskType"]').val();
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

function showTaskReport() {
    var obj = {};
    obj.TaskId = taskId;
    var $frm = $('#frmTaskReport');
    _postJson(
        '/Home/AssignTaskReport',
        obj,
        function (ret) {
            $frm.empty();
            $frm.html(ret);
            $('#taskReportModal').modal('show');
        },
        function (ret) {
            _alert('Error');
            console.log(ret);
        },
        false
    );
}

function showHistoryTaskChile(taskId) {
    var $frm = $('#frmHistoryTaskChild');
    _postJson(
        '/Home/GetHistoryTaskChild',
        { taskId: taskId},
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

function showConfirmModal(title, content,func) {
    var _strTemplate = "";
    _strTemplate += "<div class='modal fade' id='modal-confirm'>";
    _strTemplate += "<div class='modal-dialog modal-sm'>";
    _strTemplate += "<div class='modal-content'>";
    _strTemplate += "<div class='modal-header'>";
    _strTemplate += "<h6 class='modal-title'>" + title +"</h6> ";
    _strTemplate += "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>";
    _strTemplate += "<span aria-hidden='true'>&times;</span>";
    _strTemplate += "</button>";
    _strTemplate += "</div>";
    _strTemplate += "<div class='modal-body'>";
    _strTemplate += "<p style='text-align: center'><i class='fa fa-question-circle' aria-hidden='true' style='font-size:25px;'></i> </p><p>" + content +"</p> ";
    _strTemplate += "</div>";
    _strTemplate += "<div class='modal-footer justify-content-between'>";
    _strTemplate += "<button type='button' class='btn btn-primary' onclick='confirmUpdateAssigner()'>Thực hiện</button>";
    _strTemplate += "<button type='button' class='btn btn-default' data-dismiss='modal'>Hủy</button>";
    _strTemplate += "</div>";
    _strTemplate += "</div>";
    _strTemplate += "</div>";
    $("#div_Modalconfirm").remove();
    document.body.innerHTML += "<div id='div_Modalconfirm'>" + _strTemplate + "</div>";
    $('#modal-confirm').modal('show');
}

function confirmUpdateAssigner() {
    var excludeLit = ['TaskId', 'ParentId', 'Attorneys', 'Follower', 'StartDateStr', 'Assigner', 'TaskContent', 'StartDateStr'];
    _save_task(_statusId, excludeLit); //1: tassk new
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
                    var str = "<option value=''>-- chọn đơn vị nhận việc --</option>";
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
                    var str = "";
                    $('select[name="Assigner"]').empty();
                    $('select[name="Follower"]').empty();
                    for (var i = 0; i < result.Data.length; i++) {
                        str += "<option value='" + result.Data[i].UserName + "' title-code='" + result.Data[i].TitleCode + "' title-name='" + result.Data[i].TitleName + "' >" + result.Data[i].UserName + " - " + result.Data[i].TitleName + " - " + result.Data[i].BranchName + "</option>";
                    }
                    var tem = "<option value=''>------ chọn người xử lý -------</option>";
                    $('select[name="Assigner"]').append(tem + str);
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
    if (processBranchId!=null && Number(processBranchId) >0) {
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
                        $('select[name="child_Assigner"]').append(tem+ str);
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
                        $('select[name="child_Assigner"]').append(tem+str);
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
        data: { handOver: obj, __RequestVerificationToken: token},
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _alert(result.message, result.success ? 'success' : 'warning');
            if (result.success) {
                $('#handOverTaskModal').modal('hide');
                _redirect('/Home/Index?cate=0', 2000);
                _unlockScreen();
            } else {
                _unlockScreen();
                return false;
            }

        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
            console.log('error', xhr, status, error);
        }
    });
}


//==============================
//====
//==== xử lý tiêu chí đánh giá
//====
//==============================
function showEvaluetionCriteria() {
    var authe = _statusId == 7 ? "OWNER" : "";
    var allowsEdit = _statusId == 7 ? false : true
    showFrmEvalueteCriteria(taskId, "OWNER", $('#div_EvaluetionCriteria'), false, allowsEdit);
    //_call({
    //    type: "GET",
    //    url: "/Home/EvaluetionCriteria",
    //    data: {
    //        taskId: taskId,
    //    },
    //    async: false,
    //    beforeSend: function () {
    //        //_lockScreen();
    //    },
    //    success: function (result, status, xhr) {
    //        $('#div_EvaluetionCriteria').empty();
    //        $('#div_EvaluetionCriteria').html(result);

    //    },
    //    error: function (xhr, status, error) {
    //        _alert(error, 'warning');
    //    }
    //});
}

function SaveEvalueteCriteria(commentType) {
    return doSaveEvalueteCriteria(taskId, 'OWNER', commentType);
}

function uploadFileEvaluetionCritera() {
    formdataAvaluate = new FormData();

    formdataAvaluate.append('TaskId', taskId);
    formdataAvaluate.append('StatusId', _statusId);
    formdataAvaluate.append('reqType', 'TASKOWNERAVALUATE');
    var fileInput = $('input[name="fileUpload_evaluetion"]').get(0);
    for (i = 0; i < fileInput.files.length; i++) {
        if (fileInput.files[i].size > 20971520) {
            _alert('Dung lượng file vượt quá giới hạn cho phép (20MB)', 'warning');
            $('#upload-file-info').text('');
            return false;
        }
        var sfilename = fileInput.files[i].name;
        let srandomid = Math.random().toString(36).substring(7);

        formdataAvaluate.append(sfilename, fileInput.files[i]);
    }

    //upload process
    _call({
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
                _unlockScreen();
                if (result.ErrorCode == 1) {
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
                        '</a>'+
                            '</div>' +
                        '</div>' +
                    '</div >';

                    var $litupload = $('div.tblFiles')
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
                    _alert('Cập nhật tài liệu đánh giá thất bại', 'warning');
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