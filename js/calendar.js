$(function () {
    initializeCalendar();
    createCalendarVars();
    initializeCalendarWithMoreOptions();
    disableEnter();
});

/* --------------------------initialize calendar-------------------------- */
var initializeCalendar = function () {
    $('.calendar').fullCalendar({
        editable: true,
        eventLimit: true,
        events: function (start, end, timezone, callback) {
            $.ajax({
                type: "GET",
                url: "https://jsonplaceholder.typicode.com/posts",
                success: function (doc) {
                    var events = [];
                    // Some fake data since the API does not return the correct data
                    var obj = [{
                        id: 1,
                        title: "Latest event, this had to be fake as possible.",
                        description: "Some description...",
                        start: "2019-04-13T14:30:00.000Z",
                        end: "2019-04-13T17:30:00.000Z",
                        background: '#00a65a'
                    },
                        {
                            id: 2,
                            title: "You'll find I'm full of surprises!",
                            description: "Some description...",
                            start: "2019-04-27T10:00:00.000Z",
                            end: "2019-04-27T15:00:00.000Z",
                            fixed: false
                        }];
                    $(obj).each(function () {
                        events.push({
                            id: $(this).attr('id'),
                            title: $(this).attr('title'),
                            description: $(this).attr('description'),
                            start: $(this).attr('start'),
                            end: $(this).attr('end'),
                            className: ['nice-event'],
                            backgroundColor: $(this).attr('background'),
                            editable: $(this).attr('fixed')
                        });
                    });
                    if (callback) callback(events);
                }
            });
        },
        eventRender: function (event, element) {
            if (event.editable !== null && event.editable === false) {
                element.find(".fc-time").prepend("<i class='fas fa-lock'></i>");
            }
            element.find('.fc-title').append("<br/>" + "<span class='description'>" + event.description + "</span>");
        },
        defaultTimedEventDuration: '00:30:00',
        forceEventDuration: true,
        height: screen.height - 160
    });
};

/*--------------------------calendar variables--------------------------*/
var createCalendarVars = function () {
    $cal = $('.calendar');
    $calDiv = $('#calendar');
};

/* -------------------manage calendar------------------- */
var initializeCalendarWithMoreOptions = function () {
    $calDiv.fullCalendar('option', {
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        selectable: true,
        eventLimit: true,
        // On click date slot
        select: function (start, end) {
            newEvent(start, end);
        },
        // On click even
        eventClick: function (calEvent) {
            editEvent(calEvent);
        },
        // After drag & drop event
        eventDrop: function (calEvent) {
            updateEventTime(calEvent)
        }
    });
};

var newEvent = function (start, end) {
    $('input#title').val("");
    $('#newEvent').modal('show');
    var submit = $('#submit');
    submit.unbind();
    submit.on('click', function () {
        var title = $('input#title').val();
        if (title) {
            var eventData = {
                title,
                start,
                end
            };
            $cal.fullCalendar('renderEvent', eventData, true);
            $('#newEvent').modal('hide');
        } else {
            alert("Title can't be blank. Please try again.")
        }
    });
};

var editEvent = function (calEvent) {
    $('input#editTitle').val(calEvent.title);
    $('#editEvent').modal('show');
    $('#update').unbind();
    $('#update').on('click', function () {
        var title = $('input#editTitle').val();
        $('#editEvent').modal('hide');

        if (title) {
            calEvent.title = title;
            $.ajax({
                type: "POST",
                data: {},
                url: "https://jsonplaceholder.typicode.com/posts",
                success: function (doc) {
                    $cal.fullCalendar('updateEvent', calEvent);
                }
            });
        } else {
            alert("Title can't be blank. Please try again.")
        }
    });
    $('#delete').on('click', function () {
        $('#delete').unbind();
        $.ajax({
            type: "DELETE",
            data: {},
            url: "https://jsonplaceholder.typicode.com/posts/" + calEvent.id,
            success: function (doc) {
                $calDiv.fullCalendar('removeEvents', calEvent._id);
                $('#editEvent').modal('hide');
            }
        });
    });
};

var updateEventTime = function ({_id, start, end, id}) {
    $.ajax({
        type: "PUT",
        data: {},
        url: "https://jsonplaceholder.typicode.com/posts/" + id,
        success: function (doc) {
            $('#editEvent').modal('hide');
        }
    });
};

var disableEnter = function () {
    $('body').bind("keypress", function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            return false;
        }
    });
};
