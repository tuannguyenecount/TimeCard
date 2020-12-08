var countChild = 0;
var child_countChild = 0;
var arrObjRemove = [];
var arrObjChildRemove = [];
$(function () {
    //$('#btn_AddEvaluetionCriteria').on('click', function () {
    //    addEvaluetionCriteria();
    //})
    //evaluetionCriteria();
});
function evaluetionCriteria() {
    _call({
        type: "GET",
        url: "/Home/EvaluetionCriteria",
        data: {
            taskId: 0,
            allowsEdit: false
        },
        async: false,
        beforeSend: function () {
            //_lockScreen();
        },
        success: function (result, status, xhr) {
            $('#div_EvaluetionCriteria').empty();
            $('#div_EvaluetionCriteria').html(result);
            $('#div_EvaluetionCriteria').find('[data-toggle="tooltip"]').tooltip();
        },
        error: function (xhr, status, error) {
            _alert(error, 'warning');
        }
    });
}

function getInputEvaluetionCriteria(type) {
    var listEvaluetionCriteria = [];
    var arrChild = [];

    $('#tb_AddEvaluetionCriteria > tbody  > tr').each(function (index, tr) {
        if (index != 1) {
            var obj = {};
            var $litp = $(this).find('input');

            if ($litp != null) {
                for (var i = 0; i < $litp.length; i++) {
                    var $itp = $litp.eq(i);
                    var propName = $itp.attr('pro-name');
                    if (_nvl($itp.val()) != '')
                        obj[propName] = $itp.val();
                }
            }
            if (obj.CriteriaNo == 1) { // lấy danh sách con
                var count = $('#btn_AddEvaluetionCriteria_child > tbody  > tr').length;
                $('#btn_AddEvaluetionCriteria_child > tbody > tr').each(function (index, tr) {
                    if ($(this).is(":visible")) {
                        var objChild = {};
                        var $lit = $(this).find('input');

                        if ($lit != null) {
                            for (var i = 0; i < $lit.length; i++) {
                                var $it = $lit.eq(i);
                                var propName = $it.attr('pro-name'); 
                                if (propName == "EvaluetionCriteria_quanlity_Working" || propName == "EvaluetionCriteria_quanlity_Plan") {
                                    if (Number(_nvl($it.val().trim())) > 5) {
                                        _alert('Số liệu đánh giá không hợp lệ', 'warning');
                                        return false;
                                    }
                                }
                                if (_nvl($it.val().trim()) != '')
                                    objChild[propName] = $it.val().trim();
                            }
                        }
                        objChild.CriteriaType = type;
                        objChild.CriteriaNo = (index + 1);
                        arrChild.push(objChild);
                    } else {
                        if ($(this).find('input[pro-name="CriteriaId"]').val()>0) {
                            var objChild = {};
                            var $lit = $(this).find('input');

                            if ($lit != null) {
                                for (var i = 0; i < $lit.length; i++) {
                                    var $it = $lit.eq(i);
                                    var propName = $it.attr('pro-name');
                                    //debugger;
                                    if (propName == "CriteriaWorking" || propName == "CriteriaPlan") {
                                        if (Number(_nvl($it.val().trim())) > 5) {
                                            _alert('Số liệu đánh giá không hợp lệ', 'warning');
                                            return false;
                                        }
                                    }
                                    if (_nvl($it.val().trim()) != '')
                                        objChild[propName] = $it.val().trim();
                                }
                            }
                            objChild.CriteriaType = type;
                            objChild.CriteriaNo = (index + 1);
                            arrChild.push(objChild);
                        }
                    }
                });
                obj.ChildCriteria = arrChild;
                //xử lý thêm phần xóa tiêu chí con ở đây

            }
            obj.CriteriaType = type;
            listEvaluetionCriteria.push(obj);
        }
    });
    return listEvaluetionCriteria;
}


function addEvaluetionCriteria() {
    //countChild++;
    var next = 0;
    $("#btn_AddEvaluetionCriteria_child tbody tr").each(function (index, tr) {
        if ($(this).is(":visible")) {
            next++;
        }
    });
    countChild = next + 1;
    if (next < 5) {
        if (countChild == 1) {
            var t = document.getElementById('btn_AddEvaluetionCriteria_child');

            var r = t.querySelectorAll('tbody tr')[0];
            if ($(r).find('input:hidden[pro-name="CriteriaId"]').val() != "") {
                var c = r.cloneNode(true);
                $(c).find('input:text').val('');
                $(c).find('input:hidden[pro-name="CriteriaId"]').val('');
                $(c).find('input:hidden[pro-name="Status"]').val('0');
                $('#btn_AddEvaluetionCriteria_child tbody').append(c);
                $('#rowCriteriaTemplate').show();
                $(c).show();
            } else {
                $(r).find('input:text').val('');
                $(r).find('input:hidden[pro-name="CriteriaId"]').val('');
                $(r).find('input:hidden[pro-name="Status"]').val('0');
                $('#rowCriteriaTemplate').show();
                $(r).show();
            }
            
        } else { 
            var t = document.getElementById('btn_AddEvaluetionCriteria_child');

            var r = t.querySelectorAll('tbody tr')[0];
            var c = r.cloneNode(true);
            $(c).find('input:text').val('');
            $(c).find('input:hidden[pro-name="CriteriaId"]').val('');
            $(c).find('input:hidden[pro-name="Status"]').val('0');
            $('#btn_AddEvaluetionCriteria_child tbody').append(c);
            $(c).show();
        }
        $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' });
    }
}
function showFrmEvalueteCriteria(taskId, type, $frm, isModal, allowsEdit) {
    _call({
        type: "GET",
        url: "/Home/EvaluetionCriteria",
        data: {
            taskId: taskId,
            allowsEdit: allowsEdit
        },
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _unlockScreen();
            $frm.empty();
            $frm.html(result);
            $frm.find('[data-toggle="tooltip"]').tooltip();
            if (isModal) {
                $('#EvaluetionCriteria_modal').modal('show');
                $('#btn_AddEvaluetionCriteria').hide();
                $('button[name="btn_RemoveEvaluetionCriteria"]').hide();
            }
            var countRow = $('#tb_AddEvaluetionCriteria > tbody > tr').length;
            var _countchild = document.getElementById("rowCriteriaTemplate").hasAttribute("style")?0 : $('#btn_AddEvaluetionCriteria_child > tbody > tr').length;
            //console.log(_countchild);
            $('#tb_AddEvaluetionCriteria > tbody > tr').each(function (index, tr) {
                //console.log(_countchild);
                if (index == 0 && _countchild > 0) {
                    return true;
                }
                var objChild = {};
                var $lit = $(this).find('input');

                if ($lit != null) {
                    for (var i = 0; i < $lit.length; i++) {
                        var $it = $lit.eq(i);
                        var propName = $it.attr('pro-name');
                        if (type == "ASSIGNER") {
                            if (index != (countRow-1)) {
                                if (propName != 'CriteriaWorking') {
                                    $it.attr('disabled', 'disabled');
                                } else {
                                    $it.removeAttr('disabled');
                                    $it.removeAttr('readonly');
                                }
                            }
                            objChild[propName] = $it.val();
                        }
                        else if (type == "OWNER") {
                            if (!allowsEdit) {
                                if (index != (countRow - 1)) {
                                    if (propName != 'CriteriaPlan') {
                                        $it.attr('disabled', 'disabled');
                                    } else {
                                        $it.removeAttr('disabled');
                                        $it.removeAttr('readonly');
                                    }
                                }
                            }
                            else {
                                if (index != (countRow - 1)) {
                                    var arrAtt = ["CriteriaName", "CriteriaProportion"];
                                    if (arrAtt.indexOf(propName) !== -1 && index != 0) {
                                        $it.removeAttr('disabled');
                                        $it.removeAttr('readonly');
                                    }else{
                                        $it.attr('disabled', 'disabled');
                                        $it.attr('readonly', 'readonly');
                                    }
                                }
                            }
                            objChild[propName] = $it.val();
                        } else {
                            $it.attr('disabled', 'disabled');
                        }
                    }
                }
            });
            var tem = Number($('input[name="EvaluetionCriteria_quanlity_Rate"]').val()) + Number($('input[name="EvaluetionCriteria_progress_Rate"]').val());
            if (tem > 0) {
                $('input[name="sumCriteria"]').val(tem);
            }
        },
        error: function (xhr, status, error) {
            _unlockScreen();
            _alert(error, 'warning');
        }
    });
}

// đánh giá công việc + update trạng thái task
function doSaveEvalueteCriteria(taskId,userType,commentType) {
    var objTask = {};
    var listEvaluetionCriteria = getInputEvaluetionCriteria(userType);
    objTask.EvaluetionCriteriaList = listEvaluetionCriteria;
    objTask.TaskId = taskId;
    //validate input
    var checkInput = true;
    if (userType == "OWNER") {
        $.each(listEvaluetionCriteria, function (index, it) {
            if (index != listEvaluetionCriteria.length - 1) {
                if (it.ChildCriteria != null && it.ChildCriteria.length > 0) {
                    $.each(it.ChildCriteria, function (key, _it) {
                        if (_it.CriteriaPlan == null) {
                            _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                            checkInput = false;
                            return false;
                        }
                        else if (Number(_it.CriteriaPlan) <= 0 || Number(_it.CriteriaPlan) > 5) {
                            _alert('Số liệu đánh giá không hợp lệ', 'warning');
                            checkInput = false;
                            return false;
                        }
                    });
                } else {
                    if (it.CriteriaPlan == null) {
                        _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                        checkInput = false;
                        return false;
                    }
                    else if (Number(it.CriteriaPlan) <= 0 || Number(it.CriteriaPlan) > 5) {
                        _alert('Số liệu đánh giá không hợp lệ', 'warning');
                        checkInput = false;
                        return false;
                    }
                    else if (it.ChildCriteria != null && it.ChildCriteria.length > 0) {
                        $.each(it.ChildCriteria, function (key, _it) {
                            if (_it.CriteriaPlan == null) {
                                _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                                checkInput = false;
                                return false;
                            }
                            else if (Number(_it.CriteriaPlan) <= 0 || Number(_it.CriteriaPlan) > 5) {
                                _alert('Số liệu đánh giá không hợp lệ', 'warning');
                                checkInput = false;
                                return false;
                            }
                        });
                    }
                }
            }
        });
    }
    if (userType == "ASSIGNER") {
        $.each(listEvaluetionCriteria, function (index, it) {
            if (index != listEvaluetionCriteria.length - 1) {
                if (it.ChildCriteria != null && it.ChildCriteria.length > 0) {
                    $.each(it.ChildCriteria, function (key, _it) {
                        if (_it.CriteriaWorking == null) {
                            _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                            checkInput = false;
                            return false;
                        }
                        else if (Number(_it.CriteriaWorking) <= 0 || Number(_it.CriteriaWorking) > 5) {
                            _alert('Số liệu đánh giá không hợp lệ', 'warning');
                            checkInput = false;
                            return false;
                        }
                    });
                } else {
                    if (it.CriteriaWorking == null) {
                        _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                        checkInput = false;
                        return false;
                    }
                    else if (Number(it.CriteriaWorking) <= 0 || Number(it.CriteriaWorking) > 5) {
                        _alert('Số liệu đánh giá không hợp lệ', 'warning');
                        checkInput = false;
                        return false;
                    }
                    else if (it.ChildCriteria != null && it.ChildCriteria.length > 0) {
                        $.each(it.ChildCriteria, function (key, _it) {
                            if (_it.CriteriaWorking == null) {
                                _alert('Vui lòng nhập số liệu đánh giá', 'warning');
                                checkInput = false;
                                return false;
                            }
                            else if (Number(_it.CriteriaWorking) <= 0 || Number(_it.CriteriaWorking) > 5) {
                                _alert('Số liệu đánh giá không hợp lệ', 'warning');
                                checkInput = false;
                                return false;
                            }
                        });
                    }
                }
            }
        });
    }
    if (checkInput) {
        _call({
            type: "POST",
            url: "/Home/ProcessEvaluetionCriteriaTask",
            dataType: "json",
            commentType: 'application/json',
            data: {
                objTask: objTask,
                commentType: commentType,
                userType: userType,
                __RequestVerificationToken: $('input[name="__RequestVerificationToken"]').val()
            },
            beforeSend: function () {
                _lockScreen();
            },
            success: function (result, status, xhr) {
                if (result.success) {
                    _alert('Thực hiện thành công', 'success');
                    if (commentType == "TASKCOMPLETE") {
                        _redirect('/Home/Index?cate=1', 2000);
                    } else {
                        _redirect(location.href, 2000);
                    }
                    
                }
                else {
                    _alert(result.message, 'warning');
                }
                _unlockScreen();
            },
            error: function (xhr, status, error) {
                _unlockScreen();
                if (onError != null && typeof onError == 'function')
                    onError(xhr, status, error);
                console.log('error', xhr, status, error);
            }
        });
    }
}

function changeCriteriaPlan(e) {
    var $itRate = $(e.parentNode.parentNode).find('input[pro-name="SuccessRate"]');
    var $itProportion = $(e.parentNode.parentNode).find('input[pro-name="CriteriaProportion"]');
    var _countchild = document.getElementById("rowCriteriaTemplate").hasAttribute("style") ? 0 : $('#btn_AddEvaluetionCriteria_child > tbody > tr').length;
    if (Number.isInteger(Number(e.value)) && (Number(e.value) > 0 && Number(e.value) <= 5)) {
        if (Number(_nvl($itProportion.val()), '0') == 0) {
            var temp = (Number(_nvl(e.value), '0') * 0);
            $itRate.val(Math.round((temp + Number.EPSILON) * 100) / 100);
            if (_countchild > 0) {
                //var sumf = Number($('input[name="EvaluetionCriteria_quanlity_Proportion"]').val());
                //var temp = mathSuccessRateChild() * (sumf / 100);
                var temp = mathSuccessRateChild();
                $('input[name="EvaluetionCriteria_quanlity_Rate"]').val(Math.round((temp + Number.EPSILON) * 100) / 100);
                sumFinal();
            }
        } else {
            var temp = (Number(_nvl(e.value), '0') * (Number(_nvl($itProportion.val()), '0') / 100));
            $itRate.val(Math.round((temp + Number.EPSILON) * 100) / 100);
            if (_countchild > 0) {
                //var sumf = Number($('input[name="EvaluetionCriteria_quanlity_Proportion"]').val());
                //var temp = mathSuccessRateChild() * (sumf / 100);
                var temp = mathSuccessRateChild();
                $('input[name="EvaluetionCriteria_quanlity_Rate"]').val(Math.round((temp + Number.EPSILON) * 100) / 100);
                sumFinal();
            }
        }
    } else {
        $(e).val('');
    }
}
function changeCriteriaWorking(e) {
    if (Number.isInteger(Number(e.value)) && (Number(e.value) > 0 && Number(e.value) <= 5)) {
        
    } else {
        $(e).val('');
    }
}
function removeRow(e) {
    //if ($(e).attr('data-remove') != null) { 
    //    _call({
    //        type: "POST",
    //        url: "/Home/UpdateStatusCriteria",
    //        data: { criteriaid: $(e).attr('data-remove') },
    //        async: false,
    //        success: function (result, status, xhr) {
    //            if (result.ErrorCode != 1) {
    //                _alert(result.ErrorMsg, 'warning');
    //                return false;
    //            }
    //        },
    //        error: function (xhr, status, error) {
    //            _alert('xóa tiêu chí đánh giá lỗi', 'warning');
    //            return false;
    //        }
    //    });
    //}
    if ($('#btn_AddEvaluetionCriteria_child > tbody  > tr').length > 1) {
        if ($(e).parent().parent().parent().find('input[pro-name="CriteriaId"]').val() > 0) {
            $(e).parent().parent().find('input[pro-name="Status"]').val('0');
            $(e).parent().parent().hide();
        } else {
            $(e.parentNode.parentNode).remove();
        }
        countChild--;
    } else {
        countChild = 0;
        if ($(e).parent().parent().find('input[pro-name="CriteriaId"]').val() > 0) {
            $(e).parent().parent().find('input[pro-name="Status"]').val('0');
        }
        $(e).parent().parent().hide();
        $('#rowCriteriaTemplate').hide();
    }
}

// tính tỷ lệ hoàn thành của tiêu chí chất lượng
function mathSuccessRateChild() {
    var sumSuccessRate = 0;
    $('#btn_AddEvaluetionCriteria_child > tbody > tr').each(function (index, tr) {
        var $lit = $(this).find('input[pro-name="SuccessRate"]');

        if ($lit != null) {
            for (var i = 0; i < $lit.length; i++) {
                var $it = $lit.eq(i);
                sumSuccessRate += Number(_nvl($it.val()), '0');
            }
        }
    });
    return (Math.round((sumSuccessRate + Number.EPSILON) * 100) / 100);
}

function countRowChild() {
    if ($('#rowCriteriaTemplate').is(':hidden')) {
        return 0;
    } else {
        return ($('#btn_AddEvaluetionCriteria_child > tbody > tr').length);
    }
}

function sumFinal() {
    var _num1 = Number($('input[name="EvaluetionCriteria_quanlity_Rate"]').val());
    var _num2 = Number($('input[name="EvaluetionCriteria_progress_Rate"]').val());
    var _sum = Math.round(((_num1 + _num2) + Number.EPSILON) * 100) / 100;
    $('input[name="sumCriteria"]').val(_sum);
}

function changCrireriaPlan_quanlity(e) {
    var $itRate = $(e.parentNode.parentNode).find('input[pro-name="SuccessRate"]');
    var $itProportion = $(e.parentNode.parentNode).find('input[pro-name="CriteriaProportion"]');
    if (Number.isInteger(Number(e.value)) && (Number(e.value) > 0 && Number(e.value) <= 5)) {
        if (Number(_nvl($itProportion.val()), '0') == 0) {
            var temp = (Number(_nvl(e.value), '0') * 0);
            $itRate.val(Math.round((temp + Number.EPSILON) * 100) / 100);
            var sumf = Number($('input[name="EvaluetionCriteria_quanlity_Proportion"]').val());
            //$('input[name="EvaluetionCriteria_quanlity_Rate"]').val((sumf / 100));
            sumFinal();
        } else {
            var temp = (Number(_nvl(e.value), '0') * (Number(_nvl($itProportion.val()), '0') / 100));
            $itRate.val(Math.round((temp + Number.EPSILON) * 100) / 100);
            var sumf = Number($('input[name="EvaluetionCriteria_quanlity_Proportion"]').val());
            //$('input[name="EvaluetionCriteria_quanlity_Rate"]').val((sumf / 100));
            sumFinal();
        }
    } else {
        $(e).val('');
    }
}

//=======================================================
//======= PHẦN TIÊU CHÍ ĐÁNH GIÁ CỦA CÔNG VIỆC CON 
//=======================================================
function showFrmEvalueteCriteria_ChildTask(taskId, type, $frm, allowsEdit) {
    _call({
        type: "GET",
        url: "/Home/EvaluetionCriteria_TaskChild",
        data: {
            taskId: taskId,
            allowsEdit: allowsEdit
        },
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _unlockScreen();
            $frm.empty();
            $frm.html(result);
        },
        error: function (xhr, status, error) {
            _alert(error, 'warning');
            _unlockScreen();
        }
    });
}

function getInputEvaluetionCriteria_ChildTask(type) {
    var listEvaluetionCriteria = [];
    var arrChild = [];

    $('#child_tb_AddEvaluetionCriteria > tbody > tr').each(function (index, tr) {
        if (index != 1) {
            var obj = {};
            var $litp = $(this).find('input');

            if ($litp != null) {
                for (var i = 0; i < $litp.length; i++) {
                    var $itp = $litp.eq(i);
                    var propName = $itp.attr('pro-name').replace('child_', '');
                    if (_nvl($itp.val()) != '')
                        obj[propName] = $itp.val();
                }
            }
            if (obj.CriteriaNo == 1) { // lấy danh sách con
                $('#child_btn_AddEvaluetionCriteria_child > tbody > tr').each(function (index, tr) {
                    if ($(this).is(":visible")) {
                        var objChild = {};
                        var $lit = $(this).find('input');

                        if ($lit != null) {
                            for (var i = 0; i < $lit.length; i++) {
                                var $it = $lit.eq(i);
                                var propName = $it.attr('pro-name').replace('child_', '');
                                if (_nvl($it.val()) != '')
                                    objChild[propName] = $it.val();
                            }
                        }
                        objChild.CriteriaType = type;
                        objChild.CriteriaNo = (index + 1);
                        arrChild.push(objChild);
                    }
                    else {
                        if ($(this).find('input[pro-name="child_CriteriaId"]').val() > 0) {
                            var objChild = {};
                            var $lit = $(this).find('input');

                            if ($lit != null) {
                                for (var i = 0; i < $lit.length; i++) {
                                    var $it = $lit.eq(i);
                                    var propName = $it.attr('pro-name').replace('child_', '');
                                    if (propName == "CriteriaWorking" || propName == "CriteriaPlan") {
                                        if (Number(_nvl($it.val().trim())) > 5) {
                                            _alert('Số liệu đánh giá không hợp lệ', 'warning');
                                            return false;
                                        }
                                    }
                                    if (_nvl($it.val().trim()) != '')
                                        objChild[propName] = $it.val().trim();
                                }
                            }
                            objChild.CriteriaType = type;
                            objChild.CriteriaNo = (index + 1);
                            arrChild.push(objChild);
                        }
                    }
                });
                if (arrChild.length == 0) {
                    //obj.ChildCriteria = null;
                } else {
                    obj.ChildCriteria = arrChild;
                }
            }

            obj.CriteriaType = type;
            listEvaluetionCriteria.push(obj);
        }
    });
    return listEvaluetionCriteria;
}

function SetData_EvalueteCriteria_ChildTask(data, type, $frm, allowsEdit) {
    _call({
        type: "POST",
        url: "/Home/SetEvaluetionCriteria_TaskChild_ToForm",
        data: {
            listData: data,
            allowsEdit: allowsEdit,
        },
        async: false,
        beforeSend: function () {
            _lockScreen();
        },
        success: function (result, status, xhr) {
            _unlockScreen();
            $frm.empty();
            $frm.html(result);
        },
        error: function (xhr, status, error) {
            _alert(error, 'warning');
            _unlockScreen();
        }
    });
}

function child_addEvaluetionCriteria() {
    //child_countChild = $("#child_rowCriteriaTemplate").attr("style").length >0 ? 0 : $('#child_btn_AddEvaluetionCriteria_child > tbody > tr').length;
    //child_countChild++;
    //var next = $("#child_btn_AddEvaluetionCriteria_child tbody tr").length;
    var next = 0;
    $("#child_btn_AddEvaluetionCriteria_child tbody tr").each(function (index, tr) {
        if ($(this).is(":visible")) {
            next++;
        }
    });
    child_countChild = next + 1;
    if (next < 5) {
        if (child_countChild == 1) {
            var t = document.getElementById('child_btn_AddEvaluetionCriteria_child');

            var r = t.querySelectorAll('tbody tr')[0];
            if ($(r).find('input:hidden[pro-name="child_CriteriaId"]').val() != "") {
                var c = r.cloneNode(true);
                $(c).find('input:text').val('');
                $(c).find('input:hidden[pro-name="child_CriteriaId"]').val('');
                $(c).find('input:hidden[pro-name="child_Status"]').val('0');
                $('#child_btn_AddEvaluetionCriteria_child tbody').append(c);
                $('#child_rowCriteriaTemplate').show();
                $(c).show();
            } else {
                $(r).find('input:text').val('');
                $(r).find('input:hidden[pro-name="child_CriteriaId"]').val('');
                $(r).find('input:hidden[pro-name="child_Status"]').val('0');
                $('#child_rowCriteriaTemplate').show();
                $(r).show();
            }
        } else {
            var t = document.getElementById('child_btn_AddEvaluetionCriteria_child');

            var r = t.querySelectorAll('tbody tr')[0];
            var c = r.cloneNode(true);
            $(c).find('input:text').val('');
            $(c).find('input:hidden[pro-name="child_CriteriaId"]').val('');
            $(c).find('input:hidden[pro-name="child_Status"]').val('');
            $('#child_btn_AddEvaluetionCriteria_child tbody').append(c);
            $(c).show();
        }

    }



}

function child_removeRow(e) {
    //if ($(e).attr('data-remove') != null) {
    //    _call({
    //        type: "POST",
    //        url: "/Home/UpdateStatusCriteria",
    //        data: { criteriaid: $(e).attr('data-remove') },
    //        async: false,
    //        success: function (result, status, xhr) {
    //            if (result.ErrorCode != 1) {
    //                _alert(result.ErrorMsg, 'warning');
    //                return false;
    //            }
    //        },
    //        error: function (xhr, status, error) {
    //            _alert('xóa tiêu chí đánh giá lỗi', 'warning');
    //            return false;
    //        }
    //    });
    //}

    //if ($('#btn_AddEvaluetionCriteria_child > tbody  > tr').length > 1) {
    //    if ($(e).parent().parent().parent().find('input[pro-name="CriteriaId"]').val() > 0) {
    //        $(e).parent().parent().find('input[pro-name="Status"]').val('0');
    //        $(e).parent().parent().hide();
    //    } else {
    //        $(e.parentNode.parentNode).remove();
    //    }
    //    countChild--;
    //} else {
    //    countChild = 0;
    //    if ($(e).find('input[pro-name="CriteriaId"]').val() > 0) {
    //        $(this).find('input[pro-name="Status"]').val('0');
    //    }
    //    $('#rowCriteriaTemplate').hide();
    //}


    if ($('#child_btn_AddEvaluetionCriteria_child > tbody  > tr').length > 1) {
        debugger;
        if ($(e).parent().parent().parent().find('input[pro-name="child_CriteriaId"]').val() > 0) {
            $(e).parent().parent().find('input[pro-name="child_Status"]').val('0');
            $(e).parent().parent().hide();
        } else {
            $(e.parentNode.parentNode).remove();
        }
        //$(e.parentNode.parentNode).remove();
        child_countChild--;
    } else {
        child_countChild = 0;
        if ($(e).parent().parent().parent().find('input[pro-name="child_CriteriaId"]').val() > 0) {
            $(e).parent().parent().find('input[pro-name="child_Status"]').val('0');
        }
        $(e).parent().parent().hide();
        $('#child_rowCriteriaTemplate').hide();
    }
}