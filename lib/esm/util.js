export function silentDeleteSearchParams(items) {
    // remove url parameters without refresh
    var searchParams = new URLSearchParams(window.location.search);
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        searchParams.delete(item);
    }
    var paramstring = searchParams.toString();
    var url = window.location.pathname;
    if (paramstring)
        url += "?" + paramstring;
    window.history.replaceState(null, "", url);
}
export function safeURL(url) {
    var u = new URL(url);
    var valid = ["http:", "https:"].includes(u.protocol);
    if (!valid)
        return "";
    return url.replace(/\/$/, "");
}
