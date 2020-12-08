$(function () {
    $("#child_fa-chevron-down").on("click", function (e) {
        $("#child_task_exten").fadeIn("slow");
        $(this).hide();
        $("#child_fa-chevron-up").show();
    });
    $("#child_fa-chevron-up").on("click", function (e) {
        $("#child_task_exten").fadeOut("slow");
        $(this).hide();
        $("#child_fa-chevron-down").show();
    });

    $("#child_ck_schedule").on("change", function () {
        if ($(this).is(':checked')) {
            var $frm = $('#frmScheduleTask');
            var scheduleType = $(this).val();
            var param = {};
            param.IsUpdateNow = false;
            param.ScheduleType = scheduleType;
            var schedule = $('#frmScheduleTask').ScheduleTask($frm, param, null);
        } else {
            $('#child_TaskScheduleCaption').html('');
        }
    });
    $("#child_ck_scheduleNotify").on("change", function () {
        if ($(this).is(':checked')) {
            var $frm = $('#child_frmScheduleTask');
            var scheduleType = $(this).val();
            var param = {};
            param.IsUpdateNow = false;
            param.ScheduleType = scheduleType;
            var schedule = $('#child_frmScheduleTask').ScheduleTask($frm, param, null);
        } else {
            $('#child_NotifyScheduleCaption').html('');
        }
    });
    $("button.btn-cancel").click(function (e) {
        _cancel_task(taskId);
    });
})