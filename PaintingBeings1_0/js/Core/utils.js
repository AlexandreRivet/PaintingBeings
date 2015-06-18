function check(element)
{
    return ((element != null) && (element != undefined));
}

function log(msg, className)
{
    var element = '<div>';
    element += '<div class="' + className + ' console_date">' + formatDate() + '</div>';
    element += '<div class="' + className + ' console_log">' + msg + '</div>';
    element += '</div>';
    
    $('#console_area').append(element);
    
}

function formatDate()
{
    var date = new Date();
    
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    
    return ((day < 10) ? '0' + day : day) + '-' + ((month < 10) ? '0' + month : month) + '-' + year + ' ' +
            ((hours < 10) ? '0' + hours : hours) + ':' + ((minutes < 10) ? '0' + minutes : minutes) + ':' +
            ((seconds < 10) ? '0' + seconds : seconds) + '.' + 
            ((milliseconds < 100) ? ((milliseconds < 10) ? '00' + milliseconds : '0' + milliseconds) : milliseconds); 
}