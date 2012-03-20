$(function () {
    "use strict";

    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var myName = false;
    var author = null;
    var logged = false;
    var callback = function callback(response) {

        if (response.transport != 'polling') {
            switch (response.state) {
                case "messageReceived" :
                    var message = response.responseBody;
                    try {
                        var json = JSON.parse(message);
                    } catch (e) {
                        console.log('This doesn\'t look like a valid JSON: ', message.data);
                        return;
                    }

                    if (!logged) {
                        logged = true;
                        status.text(myName + ': ').css('color', 'blue');
                        input.removeAttr('disabled').focus();
                    } else {
                        input.removeAttr('disabled');

                        var me = json.author == author;
                        addMessage(json.author, json.text, me ? 'blue' : 'black', new Date(eval(json.time)));
                    }

                    break;
                case "opening" :
                    input.removeAttr('disabled').focus();
                    status.text('Choose name:');
                    break;
                case "error" :
                    content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                        + 'connection or the server is down' }));
                    break;
                case "closed" :
                    console.log('Connection Closed');
                    break;
            }
        }

    }

    var connection = $.atmosphere.subscribe(document.location.toString() + 'chat',
        callback,
        $.atmosphere.request = { contentType : "application/json", transport : 'websocket' , fallbackTransport: 'long-polling'})

    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();

            // First message is always the author's name
            if (author == null) {
                author = msg;
            }

            connection.push(JSON.stringify({ author: author, message: msg }));
            $(this).val('');

            input.attr('disabled', 'disabled');
            if (myName === false) {
                myName = msg;
            }
        }
    });

    function addMessage(author, message, color, datetime) {
        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) + ':'
            + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes())
            + ': ' + message + '</p>');
    }
});

