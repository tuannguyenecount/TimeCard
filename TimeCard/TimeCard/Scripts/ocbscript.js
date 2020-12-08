$(function () {
    $('[data-toggle="tooltip"]').tooltip({ boundary: 'window' });
    $(".logoff").click(function (e) {
        e.preventDefault();
        if (confirm('Anh/chị có muốn đăng xuất hệ thống không?')) {
            window.location = URL_LOGOFF;
        }
    });
    _active_menu_item();

    $(document).on('collapsed.lte.pushmenu', function (e) {
        $('#SmallIcon').show();
        setTimeout(function () {
            $('.select2bs4').select2({ theme: 'bootstrap4' });
        }, 300);
    });
    $(document).on('shown.lte.pushmenu', function (e) {
        $('#SmallIcon').hide();
        setTimeout(function () {
            $('.select2bs4').select2({ theme: 'bootstrap4' });
        }, 300);
    });

    _event_number_only($("body"));

    $(window).resize(function () {
        $('.select2bs4').select2({
            theme: 'bootstrap4'
        });
    });

    $('#frmSearchAll').submit(function (e) {
        var val = $('input[name="TaskSearch"]').val();
        val = _replace_all_tag(val);
        $('input[name="TaskSearch"]').val(val);
        if (val == null || val.length == 0) {
            _alert('Chưa nhập giá trị tìm kiếm','warning');
            return false;
        }    
    });

    _keep_alive();
});

function _event_number_only($frm) {
    $frm.find('input[d-t-data="number"]').on("blur input", function () {
        this.value = this.value.replace(/\D/gm, '');
    });
}

function _call(setting) {
    $.ajax(setting);
}

function _get(url, data, funcSuccess, funcError, async) {
    async = async !== null ? async : true;
    _call({
        url: url,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: data,
        method: 'get',
        async: async,
        success: function (ret) {
            if (typeof funcSuccess === 'function')
                funcSuccess(ret);
        },
        error: function (ret) {
            if (typeof funcError === 'function')
                funcError(ret);
        }
    });
}

function _post(url, data, funcSuccess, funcError, async) {
    async = async !== null ? async : true;
    _call({
        url: url,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        data: data,
        method: 'post',
        async: async,
        success: function (ret) {
            if (typeof funcSuccess === 'function')
                funcSuccess(ret);
        },
        error: function (ret) {
            if (typeof funcError === 'function')
                funcError(ret);
        }
    });
}

function _postJson(url, data, funcSuccess, funcError, async) {
    async = async !== null ? async : true;
    _call({
        url: url,
        contentType: 'application/json',
        data: JSON.stringify(data),
        method: 'post',
        async: async,
        success: function (ret) {
            if (typeof funcSuccess === 'function')
                funcSuccess(ret);
        },
        error: function (ret) {
            if (typeof funcError === 'function')
                funcError(ret);
        }
    });
}

function _toggle_menu_left() {
    $('a[data-toggle="push-menu"]').click();
}

function _sidebar_off() {
    $("body").addClass("sidebar-collapse");
}

/**
 * Toggle class, if r has value: [true --> set class, false: --> remove class] else toggle class
 * @param {string} elm Element name
 * @param {string} t error | warning | success
 * @param {boolean} r null | true | false
 */
function _toogle_class(elm, t, r) {
    var $it = $('[name="' + elm + '"],[id="' + elm + '"]');
    if ($it != null) {
        var clsx = 'has-' + t;
        var $p = $it.parent();
        if (r != null) {
            if (r)
                $p.addClass(clsx);
            else
                $p.removeClass(clsx);
        }
        else {
            $p.toggleClass(clsx);
        }
    }
    else {
        console.log('_toogle_class: invalid element');
    }
}

function _alert(msg, t) {
    switch (t) {
        case 'success':
            toastr.success(msg);
            break;
        case 'info':
            toastr.info(msg);
            break;
        case 'warning':
            toastr.warning(msg);
            break;
        case 'error':
            toastr.error(msg);
            break;
        default:
            alert(msg);
            break;
    }
}

function _render_datatable(t) {
    if (t !== null && t.$elm !== null) {
        t.language = {
            "sProcessing": "Đang xử lý...",
            "sLengthMenu": "Xem _MENU_ mục",
            "sZeroRecords": "Không tìm thấy dòng nào phù hợp",
            "sInfo": "Đang xem _START_ đến _END_ trong tổng số _TOTAL_ mục",
            "sInfoEmpty": "Đang xem 0 đến 0 trong tổng số 0 mục",
            "sInfoFiltered": "(được lọc từ _MAX_ mục)",
            "sInfoPostFix": "",
            "sSearch": "Tìm:",
            "sUrl": "",
            "oPaginate": {
                "sFirst": "Đầu",
                "sPrevious": "Trước",
                "sNext": "Tiếp",
                "sLast": "Cuối"
            }
        };

        var tbl = t.$elm.DataTable(t);
        t.$elm.on('page.dt', function (st) {
            if (t.onPageChange !== null && typeof t.onPageChange === 'function') {
                t.onPageChange(this);
            }
        });
        //var info = tbl.page.info();
        //tbl.context[0].nTableWrapper.querySelector('.dataTables_info').innerText = 'Showing page: ' + info.page + ' of ' + info.pages;
    }
    else {
        console.log('_render_datatable');
        console.log(t);
    }
}

function _submit_form(t) {
    if (t !== null && t.$elm !== null) {
        t.$elm.submit();
    }
}

/**
 * Get value of datepicker
 * @param {string} elm Element name
 * @returns {date} value of datepicker
 */
function _getDateValue(elm) {
    return $('[name="' + elm + '"]').datepicker('getDate');
}

/**
 * Get value of datepicker
 * @param {string} elm Element name
 * @returns {date} value of datepicker
 */
function _getDateValueById(elm) {
    return $('#' + elm).datetimepicker('getDate');
}

/**
 * Set value of datepicker
 * @param {string} elm Element name
 * @param {date} d Date
 */
function _setDateValue(elm, d) {
    $('[name="' + elm + '"]').datepicker('setDate', d);
}

function _addMonths(date, months) {
    var tmp = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    tmp.setMonth(date.getMonth() + months);
    return tmp;
}

function _format_table(t) {
    if (t !== null && t.$elm !== null) {
        var litx = t.$elm.find('td[dt-f="number"],td[dt-f="date"]');
        litx.css('text-align', 'right');
        litx.each(function (idx, itx) {
            //console.log(itx.innerText);            
            itx.innerText = itx.attributes['dt-f'].value === 'number' ? _format_number(itx.innerText) : itx.innerText;
        });
    }
}

function _format_number(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function _set_control_number() {
    $("input[dt-data='number']").keyup(function (e) {
        var key = e.charCode || e.keyCode || 0;
        // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
        // home, end, period, and numpad decimal

        if (/\D/g.test(this.value)) this.value = this.value.replace(/\D/g, '');

        return (
            key == 8 ||
            key == 9 ||
            key == 13 ||
            key == 46 ||
            key == 110 ||
            key == 190 ||
            (key >= 35 && key <= 40) ||
            (key >= 48 && key <= 57) ||
            (key >= 96 && key <= 105));
    });
}


function _validate_data($frm,excludeFields) {
    var ret = false;
    if ($frm !== null) {
        var lit = $frm.serializeArray();
        if (lit !== null) {
            ret = true;
            for (var i = 0; i < lit.length; i++) {
                var $ctrl = $("[name='" + lit[i].name + "']");
                $ctrl.removeClass('is-invalid');

                if ($ctrl.val() === '' && excludeFields.indexOf(lit[i].name) === -1) {
                    $ctrl.addClass('is-invalid');
                    ret = false;
                }
                else {
                    if ($ctrl.tagName != "TEXTAREA") {
                        $ctrl.val(_replace_all_tag($ctrl.val()));
                    }
                }
            }
            if (!ret) _alert('Dữ liệu không hợp lệ, anh/chị vui lòng nhập lại dữ liệu','warning');
        }
    }
    return ret;
}

function _replace_all_tag(str) {
    if (!Array.isArray(str)) {
        return str.replace(/<\/p>/gi, "\n")
            .replace(/<br\/?>/gi, "\n")
            .replace(/<\/?[^>]+(>|$)/g, "");
    }
    return str;
}

function _date_to_string1(d, f) {
    var ret = '';
    var today = new Date();
    var day = today.getDate() + "";
    var month = (today.getMonth() + 1) + "";
    var year = today.getFullYear() + "";
    var hour = today.getHours() + "";
    var minutes = today.getMinutes() + "";
    var seconds = today.getSeconds() + "";
    var checkZero = function (data) {
        if (data.length === 1) 
            data = "0" + data;        
        return data;
    };

    day = checkZero(day);
    month = checkZero(month);
    year = checkZero(year);
    hour = checkZero(hour);
    minutes = checkZero(minutes);
    seconds = checkZero(seconds);
    ret = day + "/" + month + "/" + year;
    if (f === 'HOUR') {
        ret += " " + hour + ":" + minutes + ":" + seconds;
    }

    return ret;
}

function _date_to_string(d, f) {
    var ret = '';
    var f = 'DD/MM/YYYY' + ('HOUR'==f ? ' HH:mm:ss' : '');    

    if (d != null) {
        ret = moment(d).format(f);
    }

    return ret;
}

function _string_to_date(str,h) {
    var ret = null;

    if (str != null && (str.length == 10 || str.length==19)) {
        var f = 'DD/MM/YYYY' + ('HOUR' == h ? ' HH:mm:ss' : '');
        ret = moment(str, f).toDate();
    }

    return ret;
}

function _bind_data_to_table($elm, lit) {
    if ($elm != null && lit != null && lit.length > 0) {
        var $tr = $elm.find('tbody tr');
        for (var i = 0; i < lit.length; i++) {
            $tr.eq(i).data('datax', lit[i]);
        }
    }
}

function _console(n, m, d, t) {
    console.log('--------> ' + n);
    console.log(m);
    console.log(d);
}

function _active_menu_item() {
    var $aside = $('aside.main-sidebar');
    var q = window.location.pathname + window.location.search;
    var $a = $aside.find('a.nav-link[href="' + q + '"]');
    $a.addClass('active');
    $a.parent().css('display', 'block');
    $a.parent().parent().parent().addClass('menu-open');
}

function _bind_datetimepicker($elm,isHour, defaultDate, minDate) {
    var defDate = defaultDate == null ? new Date() : defaultDate;
    var mDate = minDate == null ? new Date(1990, 0, 1) : minDate;
    isHour = isHour == null ? false : isHour;
    $elm.datetimepicker({
        format: 'L',
        defaultDate: defDate,
        minDate: mDate,
        //singleDatePicker: true,
        autoclose: true,
        todayBtn: false,
        timePicker: isHour
    });
}

function _export($btnExport, $form, exportUrl) {
    //debugger;
    var cond = $form.FormToObject();
    
    $btnExport.attr('disabled', 'disabled');
    var $frm = $('<form method="post"></form>)');
    $frm.attr('action', exportUrl);
    $frm.attr('id', 'tmpForm');
    $frm.css('display', 'none');

    for (var it in cond) {
        $frm.append(
            $('<input type="hidden" name="' + it + '" value="' + cond[it] + '" />')
        );
    }

    $('body').append($frm);
    $frm.submit();
    $frm.remove();
    $btnExport.removeAttr('disabled');
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

function _add_prefix_property(obj, prefix) {
    var objx = {};
    for (var n in obj) {
        //console.log('---> ' + n + ' : ' + obj[n]);
        var newProp = prefix + n;
        objx[newProp] = obj[n];
    }
    return objx;
}

function _select2_change(lit) {
    if (lit != null && lit.length > 0) {
        for (var i = 0; i < lit.length; i++) {
            $('[name="'+lit[i]+'"]').change();
        }
    }
}

function _nvl(val, def) {
    def = def == null ? '' : def;
    return val != null ? val : def;
}

function _redirect(url, t) {
    t = t == null ? 3000 : Number(t);
    setTimeout(function () {
        window.location.href = url;
    }, t);
}

function _keep_alive() {
    setInterval(
        function () {
            _get(
                '/Home/KeepAlive',
                null,
                function (ret) {
                    console.log(ret);
                },
                function (ret) {
                    console.log(ret);
                    _alert('Anh/chị đã hết phiên làm việc, vui lòng đăng nhập lại', 'warning');
                    _redirect('/Account/Logoff', 1500);
                },
                false
            );
        },
        300000
    );
}

// lock and unlock screen when call ajax
function _lockScreen() {
    var str = '<div id="loading" style="position:fixed;top:0px;width:100%;height:100%;opacity:0.5;z-index:9999;background:#000;"><img id="loading-image" src="/Images/loading.gif"/></div>';
    $('#loader-wrapper').html(str);
}
function _unlockScreen() {
    $('#loader-wrapper').empty();
}