var _isUpdateNow = false;
var _taskId;
(function () {
    $.fn.ScheduleTask = function ($frm,param, option) {
        var $schedule = null;
        _postJson(
            '/Home/ScheduleTask',
            { scheduleType: param.ScheduleType },
            function (ret) {
                $frm.html(ret);
                $('#scheduleTaskModal').modal('show');
                if (typeof option === 'function') {
                    option(ret);
                }
                objSchedule = {};
                var _date = new Date();
                var defaultDate = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate(),23);
                $frm.find('.date').datetimepicker({
                    format: 'L',
                    autoclose: true,
                    todayBtn: false,
                    timePicker: false,
                    //defaultDate: defaultDate,
                    minDate: defaultDate,
                    enableOnReadonly: false
                });
                _isUpdateNow = param.IsUpdateNow;
                _taskId = param.TaskId;
                $('input[name="TaskId"]').val(_taskId);
                if (old_objScheduleTask != null && param.ScheduleType == "SCHEDULE") {
                    $('#remiderFor').hide();
                    setDataToForm($('#scheduleTaskModal'), old_objScheduleTask);
                }
                if (old_objScheduleNotify != null && param.ScheduleType == "NOTIFICATION") {
                    $('#remiderFor').show();
                    setDataToForm($('#scheduleTaskModal'), old_objScheduleNotify);
                }
                $frm.find('input:radio[name=rdSchedule]').change(function () {
                    var $divDaily = $('#divDaily');
                    var $divWeekly = $('#divWeekly');
                    var $divMonthly = $('#divMonthly');
                    var $divYearly = $('#divYearly');
                    switch (this.value) {
                        case "rdSchedule_daily":
                            $divDaily.show();
                            $divWeekly.hide();
                            $divMonthly.hide();
                            $divYearly.hide();
                            break;
                        case "rdSchedule_Weekly":
                            $divDaily.hide();
                            $divWeekly.show();
                            $divMonthly.hide();
                            $divYearly.hide();
                            break;
                        case "rdSchedule_Monthly":
                            $divDaily.hide();
                            $divWeekly.hide();
                            $divMonthly.show();
                            $divYearly.hide();
                            break;
                        case "rdSchedule_Yearly":
                            $divDaily.hide();
                            $divWeekly.hide();
                            $divMonthly.hide();
                            $divYearly.show();
                            break;
                    }
                });

                $frm.find('#btnsaveSchedule').click(saveSchedule);
                $frm.find('#scheduleTaskModal').on('hidden.bs.modal', function (e) {
                    if (objScheduleTask === null || Object.keys(objScheduleTask).length === 0) {
                        $('input[name="ck_schedule"]').prop('checked', false);
                        $('#TaskScheduleCaption').html('');
                    } else {
                        $('#TaskScheduleCaption').html('<a href=\"#\" onclick=\"showPreviewTaskSchedule(\'SCHEDULE\')\" >' + objScheduleTask.ScheduleCaption+'</a>');
                    }
                    if (objScheduleNotify === null || Object.keys(objScheduleNotify).length === 0) {
                        $('input[name="ck_scheduleNotify"]').prop('checked', false);
                        $('#NotifyScheduleCaption').html('');
                    } else {
                        $('#NotifyScheduleCaption').html('<a href=\"#\" onclick=\"showPreviewNotifySchedule(\'NOTIFICATION\',' + _isUpdateNow + ',' + _taskId+')\">' + objScheduleNotify.ScheduleCaption + '</a>');
                    }
                });
                if (objScheduleTask !== null && param.ScheduleType == "SCHEDULE") {
                        setDataToForm($('#scheduleTaskModal'), objScheduleTask);
                    }
                    else if (objScheduleTask !== null && param.ScheduleType == "NOTIFICATION") {
                        setDataToForm($('#scheduleTaskModal'), objScheduleNotify);
                }
                $frm.find('#monthly_txtVaoNgay').on('input', function (e) {
                    if (this.value == "") {
                        this.value = "";
                    } else {
                        if (!Number.isInteger(Number(this.value)) || Number(this.value) <= 0 || Number(this.value) > 31) {
                            this.value = "";
                        }
                    }
                });
                $frm.find('#daily_txtHours').on('input', function (e) {
                    if (this.value == "") {
                        this.value = "";
                    } else {
                        if (Number(this.value) > 24 || !Number.isInteger(Number(this.value))) {
                            this.value = "";
                        }
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

    function saveSchedule() {
        var $frmActive = $('#frmScheduleData');
        var obj = $frmActive.FormToObject();
        objSchedule.TaskId = $('#TaskId').val();
        objSchedule.ScheduleType = $('#ScheduleType').val();
        objSchedule.ScheduleId = $('#ScheduleId').val();
        objSchedule.Status = 1;
        //objSchedule.Status = $('#Status').val();
        if (objSchedule.ScheduleType == "NOTIFICATION") {
            objSchedule.ScheduleCaption = "Nhắc nhở ";
        } else {
            objSchedule.ScheduleCaption = "Công việc ";
        }
        var scheduleOption = $("input[name='rdSchedule']:checked").val();
        switch (scheduleOption) {
            case "rdSchedule_daily":
                setDataChooseDaily();
                break;
            case "rdSchedule_Weekly":
                setDataChooseWeekly();
                break;
            case "rdSchedule_Monthly":
                setDataChooseMonthly();
                break;
        }
        getRangeRecur();
        if (validateInputFrm(objSchedule)) {
            $('#scheduleTaskModal').modal('hide');
            objScheduleNotify = objSchedule;
            if (_isUpdateNow) {
                var token = $('input[name="__RequestVerificationToken"]', $('#frmScheduleData')).val();
                doSaveSchedule(objSchedule, token);
            } else {
                return objSchedule;
            }
        } else {
            objSchedule = {};
            return objSchedule;
        }
    }

    function setDataChooseDaily() {
        objSchedule.ScheduleOption = "DAY";
        objSchedule.ScheduleCaption += "định kỳ hàng ngày ";
        objSchedule.Option1 = Number($('input[name="daily_txtHours"]').val());
        objSchedule.ScheduleCaption += ", vào lúc " + objSchedule.Option1 +" giờ";
    }

    function setDataChooseWeekly() {
        objSchedule.ScheduleOption = "WEEK";
        objSchedule.ScheduleCaption += "định kỳ hàng tuần";
        var arrDayOfWeek = [];
        var arrCaption = [];
        if ($('input[id="cbMonday"]:checked').length > 0) {
            //arrDayOfWeek.push("T2");
            arrDayOfWeek.push("MON");
            arrCaption.push("Thứ hai");
        }
        if ($('input[id="cbTuesday"]:checked').length > 0) {
            //arrDayOfWeek.push("T3");
            arrDayOfWeek.push("TUE");
            arrCaption.push("Thứ ba");
        }
        if ($('input[id="cbWednesday"]:checked').length > 0) {
            //arrDayOfWeek.push("T4");
            arrDayOfWeek.push("WED");
            arrCaption.push("Thứ tư");
        }
        if ($('input[id="cbThursday"]:checked').length > 0) {
            //arrDayOfWeek.push("T5");
            arrDayOfWeek.push("THU");
            arrCaption.push("Thứ năm");
        }
        if ($('input[id="cbFriday"]:checked').length > 0) {
            //arrDayOfWeek.push("T6");
            arrDayOfWeek.push("FRI");
            arrCaption.push("Thứ sáu");
        }
        if ($('input[id="cbSaturday"]:checked').length > 0) {
            //arrDayOfWeek.push("T7");
            arrDayOfWeek.push("SAT");
            arrCaption.push("Thứ bảy");
        }
        objSchedule.Option1 = arrDayOfWeek.join("|");
        objSchedule.ScheduleCaption += ", thực hiện vào ngày " + arrCaption.join("|");
    }

    function setDataChooseMonthly() {
        objSchedule.ScheduleOption = "MONTH";
        objSchedule.ScheduleCaption += "định kỳ hàng tháng";
        objSchedule.Option1 = Number($('input[name="monthly_txtVaoNgay"]').val());
        objSchedule.ScheduleCaption += ", vào ngày " + objSchedule.Option1;
    }


    function setDataChooseYearly() {
        objSchedule.ScheduleOption = "YEAR";
        objSchedule.ScheduleCaption += "định kỳ hàng năm";
        var yearlyChoose = $("input[name='Yearly_rdChoose']:checked").val();
        switch (yearlyChoose) {
            case "Yearly_rdNewTask":
                objSchedule.Option3 = $('input[name="Yearly_txtSoNamLapNewTask"]').val();
                objSchedule.ScheduleCaption += ", phát sinh việc mới có hạn xử lý sau " + objSchedule.Option3 +" năm kể từ khi việc hoàn tất";
                break;
            default: 
                objSchedule.Option1 = $("#Yearly_ddlMonth option:selected").val() + "|" + $('input[name="Yearly_txtSoNgay"]').val();
                objSchedule.ScheduleCaption += ", vào mỗi " + $("#Yearly_ddlMonth option:selected").val() + " vào " + $('input[name="Yearly_txtSoNgay"]').val();
                break;
        }
    }

    function getRangeRecur() {
        var startDate = new Date();
        objSchedule.ScheduleFromDateStr = _date_to_string(startDate);
        objSchedule.ScheduleCaption += " bắt đầu ngày " + objSchedule.ScheduleFromDateStr;
        objSchedule.ScheduleToDateStr = $('input[name="ranEndDateStr"]').val();
        //objSchedule.ScheduleCaption += " và kết thúc vào ngày " + objSchedule.ScheduleToDateStr;
    }

    function validateInputFrm(obj) {
        switch (obj.ScheduleOption) {
            case "DAY":
                if (obj.hasOwnProperty("Option1") && obj.Option1 !== null && Number(obj.Option1) <= 0) {
                    _alert("Dữ liệu mỗi ngày ko hợp lệ", "warning");
                    return false;
                }
                break;
            case "WEEK":
                if (obj.hasOwnProperty("Option1") && obj.Option1 !== null && Number(obj.Option1) <= 0) {
                    _alert("Chưa chọn ngày thực hiện trong tuần", "warning");
                    return false;
                }
                break;
            case "MONTH":
                if (obj.hasOwnProperty("Option1") && obj.Option1 !== null && Number(obj.Option1) <= 0) {
                    _alert("Chưa nhập vào ngày trong tháng", "warning");
                    return false;
                }
                break;
        }
        if (obj.ScheduleFromDateStr == "") {
            _alert("Chưa chọn thời gian bắt đầu", "warning");
            return false;
        }
        if (obj.ScheduleToDateStr == "") {
            _alert("Chưa chọn thời gian kết thúc", "warning");
            return false;
        }
        return true;
    }

    function setDataReminder() {
        objReminder = {};
        if (objSchedule.ScheduleType == "NOTIFICATION") {
            if ($('input[id="cbReminderForAssigner"]:checked').length > 0) {
                objReminder.Assigner = '';
            }
            if ($('input[id="cbReminderForOwner"]:checked').length > 0) {
                objReminder.Owner = '';
            }
            if ($('input[id="cbReminderForFollower"]:checked').length > 0) {
                objReminder.Follower = [];
            }
            if ($('input[id="cbReminderForAttorneys"]:checked').length > 0) {
                objReminder.Attorneys = '';
            }
        }
        objSchedule.Reminder = objReminder;
    }
    
}(jQuery));
function setDataToForm($frm, obj) {
    $('#ScheduleId').val(obj.ScheduleId);
    $('#Status').val(obj.Status);
    switch (obj.ScheduleOption) {
        case "DAY":
            bindingDataTypeDaily(obj);
            break;
        case "WEEK":
            bindingDataTypeWeekly(obj);
            break;
        case "MONTH":
            bindingDataTypeMonthly(obj);
            break;
    }
    bindingDataRangeRecur(obj);
    //bindingDataReminder(obj);
}

function bindingDataTypeDaily(obj) {
    showChooseDetail(true, false, false, false);
    $('input[name="daily_txtHours"]').val(obj.Option1);
}

function bindingDataTypeWeekly(obj) {
    $('input[id="rdSchedule_Weekly"]').prop("checked", "checked");
    showChooseDetail(false, true, false, false);
    if (obj.hasOwnProperty("Option1") && obj.Option1 !== null) {
        var arr = obj.Option1.split('|');
        for (var i = 0; i < arr.length; i++) {
            switch (arr[i]) {
                case "MON":
                    $('#cbMonday').prop("checked", true);
                    break;
                case "TUE":
                    $('#cbTuesday').prop("checked", true);
                    break;
                case "WED":
                    $('#cbWednesday').prop("checked", true);
                    break;
                case "THU":
                    $('#cbThursday').prop("checked", true);
                    break;
                case "FRI":
                    $('#cbFriday').prop("checked", true);
                    break;
                case "SAT":
                    $('#cbSaturday').prop("checked", true);
                    break;
            }
        }
    }
}

function bindingDataTypeMonthly(obj) {
    $('input[id="rdSchedule_Monthly"]').prop("checked", true);
    showChooseDetail(false, false, true, false);
    if (obj.hasOwnProperty("Option1") && obj.Option1 !== null) {
        $('input[name="monthly_txtVaoNgay"]').val(obj.Option1);
    }
}
function bindingDataTypeYearly(obj) {
    $('input[id="rdSchedule_Yearly"]').prop("checked", true);
    showChooseDetail(false, false, false, true);
    if (obj.hasOwnProperty("Option1") && obj.Option1 !== null) {
        var arr = obj.Option1.split('|');
        $('input[id="Yearly_rdEveryMonth"]').prop("checked", true);
        $('select[name=Monthly_txtSoNgay]').val(arr[0]);
        $('input[name="Yearly_txtSoNgay"]').val(arr[1]);
    }
    if (obj.hasOwnProperty("Option3") && obj.Option3 !== null) {
        $('input[id="Yearly_rdNewTask"]').prop("checked", true);
        $('input[name="Yearly_txtSoNamLapNewTask"]').val(obj.Option3);
    }
}

function bindingDataRangeRecur(obj) {
    $('input[name="ranStartDateStr"]').val(obj.ScheduleFromDateStr);
    if (obj.hasOwnProperty("FinishTime") && obj.FinishTime !== null && obj.FinishTime > 0) {
        $('#rdEndAfter').prop("checked", true);
        $('input[id="txtSoLanLap_panRangeRecur"]').val(obj.FinishTime);
    } else {
        $('#rdEndBy').prop("checked", true);
        if (obj.ScheduleToDateStr != null) {
            $('input[name="ranEndDateStr"]').val(obj.ScheduleToDateStr);
        } else {
            $('input[name="ranEndDateStr"]').val($('input[name="EndDateStr"]').val());
        }
    }
}
function bindingDataReminder(obj) {
    if (Object.keys(obj).length !==0 && obj.Reminder !== null) {
        var _objReminder = obj.Reminder;
        if (_objReminder.hasOwnProperty("Owner") && _objReminder.Owner !== null) {
            $('#cbReminderForOwner').prop("checked", true);
        }
        if (_objReminder.hasOwnProperty("Follower") && _objReminder.Follower !== null) {
            $('#cbReminderForFollower').prop("checked", true);
        }
        if (_objReminder.hasOwnProperty("Attorneys") && _objReminder.Attorneys !== null) {
            $('#cbReminderForAttorneys').prop("checked", true);
        }
        
        if (_objReminder.hasOwnProperty("Assigner") && _objReminder.Assigner !== null) {
            $('#cbReminderForAssigner').prop("checked", true);
        } else {
            $('#cbReminderForAssigner').prop("checked", false);
        }
    }
    
}

function showChooseDetail(show_divDaily, show_divWeekly, show_divMonthly, show_divYearly) {
    var $divDaily = $('#divDaily');
    var $divWeekly = $('#divWeekly');
    var $divMonthly = $('#divMonthly');
    var $divYearly = $('#divYearly');
    if (show_divDaily) { $divDaily.show(); } else { $divDaily.hide(); }
    if (show_divWeekly) { $divWeekly.show(); } else { $divWeekly.hide(); }
    if (show_divMonthly) { $divMonthly.show(); } else { $divMonthly.hide(); }
    if (show_divYearly) { $divYearly.show(); } else { $divYearly.hide(); }
}

function showPreviewTaskSchedule(scheduleType) {
    var $frm = $('#frmScheduleTask');
    var param = {};
    param.IsUpdateNow = false;
    param.ScheduleType = scheduleType;
    var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, null);
}

function showPreviewNotifySchedule(scheduleType, isUpdate, taskId) {
    var $frm = $('#frmScheduleTask');
    var param = {};
    param.IsUpdateNow = isUpdate;
    param.ScheduleType = scheduleType;
    param.TaskId = taskId;
    var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, null);
}


function doSaveSchedule(data,token) {
    $.ajax({
        type: "POST",
        url: '/Home/AjaxScheduleTaskSave',
        data: {
            __RequestVerificationToken: token,
            scheduleTask: data
        },
        async: false,
        success: function (result) {
            if (result.ErrorCode == 1) {
                _alert((data.Status==1?'Tạo lịch thành công':'Hủy lịch thành công'), 'success');
                old_objScheduleNotify = data;
                //_redirect(window.location.href, 2000);
            }
        },
        error: function (xhr, status, error) {
        },
    });
}