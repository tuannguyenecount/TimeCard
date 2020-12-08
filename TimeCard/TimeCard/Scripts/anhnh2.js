(function ($) {
    $.fn.BindValidateForm = function (isHighlight, onError, onStart, onEnd) {
        return this.each(function () {
            $(this).ValidateForm(isHighlight, onError, onStart, onEnd);
        });
    }

    $.fn.ValidateForm = function (isHighlight, onError, onStart, onEnd) {
        var $this = this;

        if (typeof onStart == 'function') onStart($this);

        var $lit = $(this).find('input[d-t="required"],select[d-t="required"],textarea[d-t="required"]');
        for (var i = 0; i < $lit.length; i++) {
            var $it = $($lit[i]);
            $it.blur(function () {
                var $itx = $(this);
                var val = $itx.val();
                var msg = $itx.attr('d-t-msg') != null ? $itx.attr('d-t-msg') : $itx[0].name + ' is required';

                if (val == null || val == '') {
                    if (typeof onError == 'function') {
                        onError($itx);
                    } else if (null != onError) {
                        _alert(msg);
                    }
                    if (true == isHighlight) {
                        $itx.css('border', 'red 1px solid');
                    }
                } else if (true == isHighlight) {
                    $itx.css('border', '');
                }
            });
        }

        if (typeof onEnd == 'function') onEnd($this);

        return this;
    }

    $.fn.FormToObject = function () {
        var obj = {};

        var $this = this;

        $this.find('input[name],select[name],textarea[name]').each(function (idx, itx) {
            var $itx = $(itx);
            var type = itx.type;
            var val = $itx.val();
            var dtp = $itx.attr('d-t-data');
            dtp = dtp == null ? 'text' : dtp;
            if (itx.name != '' && val != null && val != '' && type != 'radio') {
                switch (dtp.toLowerCase()) {
                    case 'number':
                        obj[itx.name] = Number(val);
                        break;
                    default:
                        obj[itx.name] = val;
                        break;
                }
            } else {
                if (itx.checked) {
                    switch (dtp.toLowerCase()) {
                        case 'number':
                            obj[itx.name] = Number(val);
                            break;
                        default:
                            obj[itx.name] = val;
                            break;
                    }
                }
            }
        });

        return obj;
    }

    $.fn.DataToForm = function (obj) {
        var $this = this;
        $this.data('datax', obj);
        if (obj != null) {
            for (var it in obj) {
                var $ctrl = $this.find('[name="' + it + '"]');
                if ($ctrl.length > 0) {
                    var litControls = ['input', 'select', 'textarea','radio'];
                    var t = $($ctrl[0]).prop('nodeName').toLowerCase();
                    if (litControls.indexOf(t) == -1) {
                        var format = $ctrl.attr('f-t');
                        if (format!=null && format.toLowerCase() == 'html')
                            $ctrl.html([obj[it]]);
                        else
                            $ctrl.text([obj[it]]);
                    }
                    else {
                        switch ($ctrl[0].type) {
                            case 'radio':
                                $ctrl.val([obj[it]]); //set value for radio
                                break;
                            case 'file':
                                break;
                            default:
                                $ctrl.val(obj[it]);
                                break;
                        }
                    }
                }
            }
        }
        return this;
    }
}(jQuery));