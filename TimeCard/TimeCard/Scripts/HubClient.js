$(function () {
    GetNotification();
    _init_singalR();
})

function _init_singalR() {
    var hubNotify = $.connection.dashboardHub;
    hubNotify.client.receiveMessage = function (user, message,url, icon, type) {
        AddNotification(user, message, url, icon, type);
        //_alert('user: ' + user + ', message: ' + message + ', type=' + type);
    };

    //IMPORTANT: This code must be end of line
    $.connection.hub.start()
        .done(function () {
            //getAll('$.connection.hub.start().done');
            console.log("Hub Connected!");
        })
        .fail(function () {
            console.log("Could not Connect!");
        });
    ;

    setInterval(
        function () {
            var $ul = $('ul.nav-notification');
            $ul.find("span.date-reveive").each(function (idx, elm) {
                var $this = $(this);
                var d = $this.attr('date-reveive');
                $this.text(moment(d, "DD/MM/YYYY hh:mm:ss").fromNow());
            });
        }, 60000
    );    
}

function AddNotification(user, message, url, icon, type) {
    var currDate = _date_to_string(new Date(), 'HOUR');
    var al = {
        Icon: icon,
        Title: message,
        PublishDateStr: currDate,
        Url: url
    };

    FireAlert(al);

    var $ul = $('ul.nav-notification');
    var $li = $ul.find('li.nav-notification-list');
    var $div = $li.find('div.dropdown-menu');
    var $header = $div.find('span').first();

    var $badge = $li.find('span.badge');

    if ($badge == null || $badge.length == 0) {
        $li.find('a').append('<span class="badge badge-warning navbar-badge"></span>');
        $badge = $li.find('span.badge');
    } else {
        $badge = $badge.first();
    }
    var numBage = $badge.text() != null && $badge.text() != '' ? Number($badge.text()) : 0;
    $badge.text(numBage+1);

    
    var $it = '<a href="' + url + '" class="dropdown-item new-message">' +
        '<i class="fas ' + icon + ' mr-2"></i> ' + message +
        '<span class="float-right text-muted text-sm date-reveive" date-reveive="' + currDate + '">' + moment(currDate, "dd/mm/yyyy hh:mm:ss").fromNow() + '</span></a>';

    $header.after($it);
    $header.after('<div class="dropdown-divider"></div>');

    var $childrent = $div.children();
    var cnt = $div.find('div').length;
    if (cnt > 11) {
        //remove last item
        $childrent[$childrent.length - 2].remove();
        $childrent[$childrent.length - 3].remove();
    }
}

function GetNotification() {
    _postJson(
        '/Home/UserNotification',
        { limit: 20 },
        function (ret) {
            BuildNotification(ret);
            if (typeof _build_extra_notify == 'function')
                _build_extra_notify(ret);
        },
        function (ret) {
            console.log('---> get notification error', ret);
        }
    );
}

function BuildNotification(it) {
    var $ul = $('ul.nav-notification');
    var $li = $ul.find('li.nav-notification-list');
    
    var $div = $li.find('div.dropdown-menu');
    var $header = $div.find('span').first();

    if (it.NewNotifyNum > 0) {
        $li.find('span.badge').text(it.NewNotifyNum);
        $header.text(it.NewNotifyNum + ' tin mới');
    }
    else {
        $li.find('a span').remove();
    }

    if (it.Data != null && it.Data.length > 0) {
        for (var idx in it.Data) {
            var itx = it.Data[idx];
            var _title = itx.Title;
            // cắt lấy 5 khoản trắng đầu tiên
            _title = _title.substr(0, _title.split(' ', 5).join(' ').length) + '...';
            var $it = '<a href="' + itx.Url + '" data-toggle="tooltip" data-placement="top" data-original-title="' + (itx.Title.replace(/<b>/g, '').replace(/<\/b>/g, '')) + '" class="text-sm dropdown-item ' + (itx.IsRead == 1 ? '' : 'new-message') + '" title="' + (itx.Title.replace(/<b>/g, '').replace(/<\/b>/g, '')) + '">' +
                '<i class="fas ' + (itx.IsRead == 0 ? itx.Icon : 'fa-envelope-open') + ' mr-2"></i> ' + _title +
                '<span class="float-right text-muted text-sm date-reveive" date-reveive="' + itx.PublishDateStr + '">' + moment(itx.PublishDateStr, "dd/mm/yyyy hh:mm:ss").fromNow() + '</span></a>';
            var $lastItem = $div.find('div.dropdown-divider').last();
            $lastItem.after($it);
            $lastItem.next().after('<div class="dropdown-divider"></div>');
        }
    }
    $ul.find('[data-toggle="tooltip"]').tooltip();
}


function FireAlert(itx) {
    toastr.success('<i class="fas ' + itx.Icon + ' mr-2"></i> ' + itx.Title + ' ' + moment(itx.PublishDateStr, "dd/mm/yyyy hh:mm:ss").fromNow() + '<a href="' + itx.Url + '" class="dropdown-item">click here</a>');
}

function FireAlert1(itx) {
    if (itx != null) {
        var $msg = $('<div class="w-25 callout callout-success msg-notify pull-right">' +
            '<h5>I am a success callout!</h5>' +
            '<i class="fas ' + itx.Icon + ' mr-2"></i> ' + itx.Title + ' ' + moment(itx.PublishDateStr, "dd/mm/yyyy hh:mm:ss").fromNow() +
            '<p>This is a green callout.</p>' +
            '<a href="' + itx.Url + '" class="dropdown-item">click here</a>' +
            '</div>');

        $('body').append($msg);
        setTimeout(function () {
            $msg.remove();
        },30000);
    }
}

function initOneSignal(t) {
    var e = t.id.replace("test_card_", "")
        , i = previewCards[e]
        , s = i.content.pop()
        , o = s.Headline
        , n = s.Sub;
    previewCards[e].content.unshift(s),
        ga("gtm1.send", "event", "Push Example", "Clicked Example", i.title),
        localStorage["onesignal-notification-prompt"] = null,
        OneSignal.push(function () {
            "granted" === Notification.permission ? OneSignal.getUserId().then(function (t) {
                t ? "/in-app" == window.location.pathname ? OneSignal.sendSelfNotification("Thanks!", "We'll let you know when in-app is live.") : OneSignal.sendSelfNotification(o, n) : OneSignal.registerForPushNotifications()
            }) : "denied" == Notification.permission ? alert("You have blocked web push notification permissions. Click the lock icon to the left of the address bar to unblock notification permissions.") : OneSignal.showHttpPrompt()
        })
}