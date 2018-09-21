var XMLHttpRequest = (function(_XMLHttpRequest, proxy) {
    function __XMLHttpRequest() {
        var xhr = new _XMLHttpRequest();
        xhr.addEventListener('readystatechange', function() {
            proxy && proxy(xhr);
        });
        return xhr;
    }
    return __XMLHttpRequest;
})(XMLHttpRequest, function(xhr) {
    
});
