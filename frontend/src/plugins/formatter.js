Date.prototype.dateFormat = function(f) {
    if (!this.valueOf()) return "";
    if (!f) return this;

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"],
        shortWeekName = ["일", "월", "화", "수", "목", "금", "토"],
        d = this;

    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        let h = 0;

        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "e": return shortWeekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return (((h = d.getHours() % 12)) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
};

String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };
String.prototype.dateFormat = function(f) {
    var d = new Date(this);
    return ( d == 'Invalid Date') ? '' : d.dateFormat(f);
}

/**********************************************************************************************************************
 * 숫자에 컴마를 붙여서 리턴한다
 * @returns {*}
 *********************************************************************************************************************/
Number.prototype.numberFormat = function(){
    if (this == 0) return 0;

    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');

    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');

    return n;
};
String.prototype.numberFormat = function() { return isNaN( parseFloat(this) ) ? "0" :  (parseFloat(this)).numberFormat(); };