angular.module('ionic-datepicker.service', [])

  .service('IonicDatepickerService', function (dateConverterFactory) {

    this.monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    this.getYearsList = function (from, to,lanq) {
     var minYear = 1390;
     var maxYear = 1420; 
     if(!lanq){
       minYear = 2010;
       maxYear = 2050; 
     }
      var yearsList = [];
      if(!isNaN( from.getTime() ))
      {
        if(lanq){
            var b = dateConverterFactory.toJalaali(from.getFullYear(), from.getMonth() + 1, from.getDate());
            minYear= b.jy ;
        }
        else{
             minYear = new Date(from).getFullYear();
        }
      }

      if(!isNaN( to.getTime() )){
          if(lanq){
            var b = dateConverterFactory.toJalaali(to.getFullYear(), to.getMonth() + 1, to.getDate());
            maxYear= b.jy ;
          }
          else{
             maxYear = new Date(to).getFullYear();
          }
      }
      for (var i = minYear; i <= maxYear; i++) {
        yearsList.push(i);
      }

      return yearsList;
    };
  })

.factory('dateConverterFactory',function()
    {


        var factory = {};
        // a function for converting javascript datetime to c# datetime for handeling date on server
        factory.convertToCSharpDateTime = function(date){
           var day = date.getDay();        // yields day
           var month = date.getMonth();    // yields month
           var year = date.getFullYear();  // yields year
           var hour = date.getHours();     // yields hours 
           var minute = date.getMinutes(); // yields minutes
           var second = date.getSeconds(); // yields seconds
           // After this construct a string with the above results as below
           var time = day + "/" + month + "/" + year + " " + hour + ':' + minute + ':' + second;  
           return time;
        }

        factory.convertToServerDate = function(comingDate){
            
            if(comingDate == ""){
                return "";
            }
           var date = new Date(comingDate); 
           var day = date.getDate();        
           var month = date.getMonth() + 1;    
           var year = date.getFullYear();
           var correctFormat = month+'/'+day+'/'+year ;
           return correctFormat ; 
        }

        factory.jalaliToday = function()
        {
            var today = new Date();
            var todayDate = today.getDate();
            var todayMonth = today.getMonth() + 1;
            var todayYear = today.getFullYear();
            return factory.toJalaali(todayYear,todayMonth,todayDate);
        };

        factory.strigify = function(dateObject)
        {
            var jd="",jm="";
            if(dateObject.jd <= 9) {
                jd = "0" + dateObject.jd;
            }
            else
                jd=dateObject.jd;
            if(dateObject.jm <= 9) {
                jm = "0" + dateObject.jm;
            }
            else
                jm=dateObject.jm;

            return dateObject.jy+'/' + jm + '/' + jd;
        }
        factory.editDateNumbers= function(dateObject)
        {
            
            var date = dateObject.split('/');
            
            if(date[2] <=9 && date[2].length != 2) {
                date[2] = "0" + date[2];
            }
            else
                date[2]=date[2];
            if( date[1] <=9 && date[1] != 2) {
                date[1] = "0" + date[1];
            }
            else
                date[1]=date[1];

            return date;
        }


        /*
         Converts a Gregorian date to Jalaali.
         */
        factory.toJalaali = function(gy, gm, gd) {
            return day2jalali(georgian2day(gy, gm, gd))
        };

        /*
         Converts a Jalaali date to Gregorian.
         */
        factory.toGregorian = function(jy, jm, jd) {
            return day2georgian(jalali2day(jy, jm, jd))
        };


        /*
         Converts a date of the Jalaali calendar to the Julian Day number.

         @param jy Jalaali year (1 to 3100)
         @param jm Jalaali month (1 to 12)
         @param jd Jalaali day (1 to 29/31)
         @return Julian Day number
         */
        function jalali2day(jy, jm, jd) {
            var r = jalCal(jy)
            return georgian2day(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
        }

        /*
         Converts the Julian Day number to a date in the Jalaali calendar.

         @param jdn Julian Day number
         @return
         jy: Jalaali year (1 to 3100)
         jm: Jalaali month (1 to 12)
         jd: Jalaali day (1 to 29/31)
         */
        function day2jalali(jdn) {
            var gy = day2georgian(jdn).gy // Calculate Gregorian year (gy).
                , jy = gy - 621
                , r = jalCal(jy)
                , jdn1f = georgian2day(gy, 3, r.march)
                , jd
                , jm
                , k

            // Find number of days that passed since 1 Farvardin.
            k = jdn - jdn1f
            if (k >= 0) {
                if (k <= 185) {
                    // The first 6 months.
                    jm = 1 + div(k, 31)
                    jd = mod(k, 31) + 1
                    return  { jy: jy
                        , jm: jm
                        , jd: jd
                    }
                } else {
                    // The remaining months.
                    k -= 186
                }
            } else {
                // Previous Jalaali year.
                jy -= 1
                k += 179
                if (r.leap === 1)
                    k += 1
            }
            jm = 7 + div(k, 30)
            jd = mod(k, 30) + 1
            return  { jy: jy
                , jm: jm
                , jd: jd
            }
        }

        /*
         Calculates the Julian Day number from Gregorian or Julian
         calendar dates. This integer number corresponds to the noon of
         the date (i.e. 12 hours of Universal Time).
         The procedure was tested to be good since 1 March, -100100 (of both
         calendars) up to a few million years into the future.

         @param gy Calendar year (years BC numbered 0, -1, -2, ...)
         @param gm Calendar month (1 to 12)
         @param gd Calendar day of the month (1 to 28/29/30/31)
         @return Julian Day number
         */
        function georgian2day(gy, gm, gd) {
            var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
                + div(153 * mod(gm + 9, 12) + 2, 5)
                + gd - 34840408
            d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
            return d
        }

        /*
         Calculates Gregorian and Julian calendar dates from the Julian Day number
         (jdn) for the period since jdn=-34839655 (i.e. the year -100100 of both
         calendars) to some millions years ahead of the present.

         @param jdn Julian Day number
         @return
         gy: Calendar year (years BC numbered 0, -1, -2, ...)
         gm: Calendar month (1 to 12)
         gd: Calendar day of the month M (1 to 28/29/30/31)
         */
        function day2georgian(jdn) {
            var
                j,
                i,
                gd,
                gm,
                gy;

            j = 4 * jdn + 139361631
            j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
            i = div(mod(j, 1461), 4) * 5 + 308
            gd = div(mod(i, 153), 5) + 1
            gm = mod(div(i, 153), 12) + 1
            gy = div(j, 1461) - 100100 + div(8 - gm, 6)
            return  {
                gy: gy,
                gm: gm,
                gd: gd
            }
        }

        function div(a, b) {
            return ~~(a / b)
        }

        function mod(a, b) {
            return a - ~~(a / b) * b
        }


        /*
         Checks whether a Jalaali date is valid or not.
         */
        function isValidJalaaliDate(jy, jm, jd) {
            return  jy >= -61 && jy <= 3177 &&
                jm >= 1 && jm <= 12 &&
                jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
        }

        /*
         Is this a leap year or not?
         */
        function isLeapJalaaliYear(jy) {
            return jalCal(jy).leap === 0
        }

        /*
         Number of days in a given month in a Jalaali year.
         */
        function jalaaliMonthLength(jy, jm) {
            if (jm <= 6) return 31
            if (jm <= 11) return 30
            if (isLeapJalaaliYear(jy)) return 30
            return 29
        }

        /*
         This function determines if the Jalaali (Persian) year is
         leap (366-day long) or is the common year (365 days), and
         finds the day in March (Gregorian calendar) of the first
         day of the Jalaali year (jy).

         @param jy Jalaali calendar year (-61 to 3177)
         @return
         leap: number of years since the last leap year (0 to 4)
         gy: Gregorian year of the beginning of Jalaali year
         march: the March day of Farvardin the 1st (1st day of jy)
         @see: http://www.astro.uni.torun.pl/~kb/Papers/EMP/PersianC-EMP.htm
         @see: http://www.fourmilab.ch/documents/calendar/
         */
        function jalCal(jy) {
            // Jalaali years starting the 33-year rule.
            var breaks =  [ -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
                    , 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178
                ]
                , bl = breaks.length
                , gy = jy + 621
                , leapJ = -14
                , jp = breaks[0]
                , jm
                , jump
                , leap
                , leapG
                , march
                , n
                , i;

            if (jy < jp || jy >= breaks[bl - 1])
                throw new Error('Invalid Jalaali year ' + jy);

            // Find the limiting years for the Jalaali year jy.
            for (i = 1; i < bl; i += 1) {
                jm = breaks[i];
                jump = jm - jp;
                if (jy < jm)
                    break;
                leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
                jp = jm
            }
            n = jy - jp;

            // Find the number of leap years from AD 621 to the beginning
            // of the current Jalaali year in the Persian calendar.
            leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
            if (mod(jump, 33) === 4 && jump - n === 4)
                leapJ += 1

            // And the same in the Gregorian calendar (until the year gy).
            leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150

            // Determine the Gregorian date of Farvardin the 1st.
            march = 20 + leapJ - leapG

            // Find how many years have passed since the last leap year.
            if (jump - n < 6)
                n = n - jump + div(jump + 4, 33) * 33
            leap = mod(mod(n + 1, 33) - 1, 4)
            if (leap === -1) {
                leap = 4
            }

            return  { leap: leap
                , gy: gy
                , march: march
            }
        }
        factory.changeMonth = function(date,numOfMonthToAdd)
        {
            var garDate = factory.toGregorian(date.jy,date.jm,20);
            var standard_date = new Date(garDate.gy,garDate.gm,garDate.gd);
            console.log("changing Month Log :")
            console.log(garDate.gy,garDate.gm,garDate.jd);
            standard_date.setMonth(standard_date.getMonth() + numOfMonthToAdd);
            return factory.toJalaali(standard_date.getFullYear(),standard_date.getMonth(),standard_date.getDate());
        }
        factory.changeDay = function(date,numOfDayToAdd)
        {
            var day = jalali2day(date.jy,date.jm,date.jd);
            day = day + numOfDayToAdd;
            var JalaliDate = day2jalali(day);
            return JalaliDate;
        }

        factory.isValidJalaliDate=function(jy, jm, jd) {
            return  jy >= -61 && jy <= 3177 &&
                jm >= 1 && jm <= 12 &&
                jd >= 1 && jd <= jalaaliMonthLength(jy, jm)
        }
        factory.monthLength = function (jy,jm)
        {
            if (jm <= 6) return 31
            if (jm <= 11) return 30
            if (isLeapJalaaliYear(jy)) return 30
            return 29
        }


        return factory;
    })