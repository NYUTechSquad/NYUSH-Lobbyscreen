define(
    {
//////////
        months_en : ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
        weekdays_en : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday'],
        weekdays_zh : ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        // Code for format borrowed from stackoverflow's formatUnicorn.
        // Useage: "Hello, {name}, I'm {adj} that you can't {verb}.".format({"name":"Dave", 
        //                  "adj":"glad", "verb":"talk"})
        format : function(str) {
                if (arguments.length==1)
                    return str;
                var args = typeof arguments[1],
                    args = (("string" == args || "number" == args) ? arguments : arguments[1]);
                for (arg in args)
                    str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
                return str;
            }
//////////
    }
);