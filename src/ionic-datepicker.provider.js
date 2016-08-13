angular.module('ionic-datepicker.provider', [])


  .provider('ionicDatePicker', function () {


    var config = {

     
      templateType: 'popup',
      setLabel: 'Set',
      todayLabel: 'Today',
      closeLabel: 'Close',
      inputDate: new Date(),
      mondayFirst: true,
      from : new Date(2010,1,1),
      to : new Date(2050,1,1),
      showTodayButton: false,
      closeOnSelect: false,
      disableWeekdays: [],
      lanq: true,   // true for persian calendar and false for georgian calendar
      
      weeksList: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
      monthsList: ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"],
      
    };

    if (localStorage.getItem('calendarType') != 'shamsi') {
      config.lanq = false;
      config.weeksList = ["S", "M", "T", "W", "T", "F", "S"];
      config.monthsList = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
    }

    this.configDatePicker = function (inputObj) {
      angular.extend(config, inputObj);
    };

    this.$get = ['$rootScope', '$ionicPopup', '$ionicModal', 'IonicDatepickerService', function ($rootScope, $ionicPopup, $ionicModal, IonicDatepickerService, dateFactory) {

      var provider = {};

      var $scope = $rootScope.$new();
      $scope.today = resetHMSM(new Date()).getTime();
      $scope.disabledDates = [];

      //Reset the hours, minutes, seconds and milli seconds
      function resetHMSM(currentDate) {
        currentDate.setHours(0);
        currentDate.setMinutes(0);
        currentDate.setSeconds(0);
        currentDate.setMilliseconds(0);
        return currentDate;
      }

      //Previous month
      $scope.prevMonth = function () {
        if ($scope.mainObj.lanq) {
          var foo = georgian2day($scope.currentDate.getFullYear(), $scope.currentDate.getMonth() + 1, $scope.currentDate.getDate());
          var boo = dayToShamsi(foo);
          if (boo.jm == 1) {
            boo.jy += -1;
            boo.jm = 12;
          }
          else {
            boo.jm += -1;
          }
          var soo = shamsiToDay(boo.jy, boo.jm, 1);
          var coo = dayToGeorgian(soo);

          $scope.currentDate = new Date(coo.gy, coo.gm, 1);
          $scope.currentMonth = $scope.mainObj.monthsList[soo.jm - 1];
          $scope.currentYear = soo.jy;

          refreshDateList($scope.currentDate);
        }
        else {
          if ($scope.currentDate.getMonth() === 1) {
            $scope.currentDate.setFullYear($scope.currentDate.getFullYear());
          }
          $scope.currentDate.setMonth($scope.currentDate.getMonth() - 1);
          $scope.currentMonth = $scope.mainObj.monthsList[$scope.currentDate.getMonth()];
          $scope.currentYear = $scope.currentDate.getFullYear();
          refreshDateList($scope.currentDate);
        }
      };

      //Next month
      $scope.nextMonth = function () {
        if ($scope.mainObj.lanq) {
          var foo = georgian2day($scope.currentDate.getFullYear(), $scope.currentDate.getMonth() + 1, $scope.currentDate.getDate());
          var boo = dayToShamsi(foo);
          if (boo.jm == 12) {
            boo.jy += 1;
            boo.jm = 1;
          }
          else {
            boo.jm = boo.jm +1;
          }
          var soo = shamsiToDay(boo.jy, boo.jm, 1);
          var coo = dayToGeorgian(soo);

          $scope.currentDate = new Date(coo.gy, coo.gm, 1);
          $scope.currentMonth = $scope.mainObj.monthsList[soo.jm - 1];
          $scope.currentYear = soo.jy;

          refreshDateList($scope.currentDate);
        }
        else {
          if ($scope.currentDate.getMonth() === 11) {
            $scope.currentDate.setFullYear($scope.currentDate.getFullYear());
          }
          $scope.currentDate.setDate(1);
          $scope.currentDate.setMonth($scope.currentDate.getMonth() + 1);
          $scope.currentMonth = $scope.mainObj.monthsList[$scope.currentDate.getMonth()];
          $scope.currentYear = $scope.currentDate.getFullYear();
          refreshDateList($scope.currentDate);
        }
      };

      //Date selected

      $scope.dateSelected = function (selectedDate) {

        if (!selectedDate || Object.keys(selectedDate).length === 0) return;
        $scope.selctedDateEpoch = selectedDate.epoch;

        if ($scope.mainObj.closeOnSelect) {
          $scope.mainObj.callback($scope.selctedDateEpoch);
          if ($scope.mainObj.templateType.toLowerCase() == 'popup') {
            $scope.popup.close();
          } else {
            closeModal();
          }
        }
      };

      //Set today as date for the modal
      $scope.setIonicDatePickerTodayDate = function () {
        var today = new Date();
        refreshDateList(new Date());
        $scope.selctedDateEpoch = resetHMSM(today).getTime();
        if ($scope.mainObj.closeOnSelect) {
          $scope.mainObj.callback($scope.selctedDateEpoch);
          closeModal();
        }
      };

      //Set date for the modal
      $scope.setIonicDatePickerDate = function () {
        $scope.mainObj.callback($scope.selctedDateEpoch);
        closeModal();
      };




      function chekJalaliDate(jy) {
        if (jy > 1800) {
          return false;
        }
        else {
          return true;
        }
      };




      function div(a, b) {
        return ~~(a / b)
      }

      function mod(a, b) {
        return a - ~~(a / b) * b
      }

      function shamsiToDay(jy, jm, jd) {
        var r = jalCal(jy)
        return georgian2day(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
      }

      function georgian2day(gy, gm, gd) {
        var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
          + div(153 * mod(gm + 9, 12) + 2, 5)
          + gd - 34840408
        d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
        return d
      }

      function jalCal(jy) {
        // Jalaali years starting the 33-year rule.
        var breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210
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

        return {
          leap: leap
          , gy: gy
          , march: march
        }
      }

      function dayToGeorgian(jdn) {
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
        return {
          gy: gy,
          gm: gm,
          gd: gd
        }
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
      function dayToShamsi(jdn) {
        var gy = dayToGeorgian(jdn).gy // Calculate Gregorian year (gy).
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
            return {
              jy: jy
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
        return {
          jy: jy
          , jm: jm
          , jd: jd
        }
      }



      //Setting the disabled dates list.
      function setDisabledDates(mainObj) {
        if (!mainObj.disabledDates || mainObj.disabledDates.length === 0) {
          $scope.disabledDates = [];
        } else {
          $scope.disabledDates = [];
          angular.forEach(mainObj.disabledDates, function (val, key) {
            val = resetHMSM(new Date(val));
            $scope.disabledDates.push(val.getTime());
          });
        }
      }

      //Refresh the list of the dates of a month
      function refreshDateList(currentDate) {
        if ($scope.mainObj.lanq) {
          currentDate = resetHMSM(currentDate);
          $scope.currentDate = angular.copy(currentDate);

          var firstDate = new Date();
          var lastDate = new Date();
          var shamsiObj = {};

          //current date is jalali and know we should change start date
          var geoDay = georgian2day($scope.currentDate.getFullYear(), $scope.currentDate.getMonth() + 1, $scope.currentDate.getDate());
          shamsiObj = dayToShamsi(geoDay);
          $scope.currentDate.shamsiDate = shamsiObj;
          var dateStartVar = shamsiToDay(shamsiObj.jy, shamsiObj.jm, 1);
          var dateEndVar = dateStartVar + jalaaliMonthLength(shamsiObj.jy, shamsiObj.jm) - 1;
          var dateStartObj = dayToGeorgian(dateStartVar);
          var dateEndObj = dayToGeorgian(dateEndVar);
          firstDay = new Date(dateStartObj.gy, dateStartObj.gm - 1, dateStartObj.gd);
          lastDay = new Date(dateEndObj.gy, dateEndObj.gm - 1, dateEndObj.gd);


          $scope.monthsList = [];
          if ($scope.mainObj.monthsList && $scope.mainObj.monthsList.length === 12) {
            $scope.monthsList = $scope.mainObj.monthsList;
          } else {
            $scope.monthsList = IonicDatepickerService.monthsList;
          }
          
          $scope.yearsList = IonicDatepickerService.getYearsList($scope.mainObj.from, $scope.mainObj.to,$scope.mainObj.lanq);

          $scope.dayList = [];

          var tempDate, disabled;
          $scope.firstDayEpoch = resetHMSM(new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate())).getTime();
          $scope.lastDayEpoch = resetHMSM(new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate())).getTime();

          $scope.tempFirst = $scope.firstDayEpoch;
          $scope.tempLast = $scope.lastDayEpoch;

          for (var i = $scope.tempFirst; i <= $scope.tempLast; i += 86400000) {
            tempDate = new Date(i);
            disabled = (tempDate.getTime() < $scope.fromDate) || (tempDate.getTime() > $scope.toDate) || $scope.mainObj.disableWeekdays.indexOf(tempDate.getDay()) >= 0;

            $scope.dayList.push({
              date: tempDate.getDate(),
              month: tempDate.getMonth(),
              year: tempDate.getFullYear(),
              day: tempDate.getDay(),
              epoch: tempDate.getTime(),
              disabled: disabled
            });
          }


          //To set saterday as the first day of the week.
          var firstDayMonday = ($scope.dayList[0].day + 1) % 7;
          // firstDayMonday = (firstDayMonday == -2) ? 5 : firstDayMonday;
          // firstDayMonday = (firstDayMonday == -1) ? 6 : firstDayMonday;

          for (var j = 0; j < firstDayMonday; j++) {
            $scope.dayList.unshift({});
          }

          for (var i = firstDayMonday; i < $scope.dayList.length; i++) {
            $scope.dayList[i].date = i - firstDayMonday + 1;
          }


          $scope.rows = [0, 7, 14, 21, 28, 35];
          $scope.cols = [0, 1, 2, 3, 4, 5, 6];
          $scope.currentMonth = $scope.mainObj.monthsList[shamsiObj.jm - 1];
          $scope.currentYear = shamsiObj.jy;
          $scope.currentMonthSelected = angular.copy($scope.currentMonth);
          $scope.currentYearSelected = angular.copy($scope.currentYear);
          $scope.currentDaySelected = angular.copy(shamsiObj.jd);
          $scope.year = $scope.currentYearSelected;
          $scope.numColumns = 7;
        }
        else {
          currentDate = resetHMSM(currentDate);
          $scope.currentDate = angular.copy(currentDate);

          var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDate();
          var lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

          $scope.monthsList = [];
          if ($scope.mainObj.monthsList && $scope.mainObj.monthsList.length === 12) {
            $scope.monthsList = $scope.mainObj.monthsList;
          } else {
            $scope.monthsList = IonicDatepickerService.monthsList;
          }
          $scope.yearsList = IonicDatepickerService.getYearsList($scope.mainObj.from, $scope.mainObj.to,$scope.mainObj.lanq);

          $scope.dayList = [];

          var tempDate, disabled;
          $scope.firstDayEpoch = resetHMSM(new Date(firstDay)).getTime();
          $scope.lastDayEpoch = resetHMSM(new Date(lastDay)).getTime();

          for (var i = firstDay; i <= lastDay; i++) {
            tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            disabled = (tempDate.getTime() < $scope.fromDate) || (tempDate.getTime() > $scope.toDate) || $scope.mainObj.disableWeekdays.indexOf(tempDate.getDay()) >= 0;

             if(tempDate.toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1] == 'GMT+0430 (Iran Daylight Time)')
             {
               i = tempDate.setHours(0,0,0,0);
               tempDate = new Date(tempDate);
             }
            $scope.dayList.push({
              date: tempDate.getDate(),
              month: tempDate.getMonth(),
              year: tempDate.getFullYear(),
              day: tempDate.getDay(),
              epoch: tempDate.getTime(),
              disabled: disabled
            });
          }

          //To set Monday as the first day of the week.
          var firstDayMonday = $scope.dayList[0].day - $scope.mainObj.mondayFirst;
          firstDayMonday = (firstDayMonday < 0) ? 6 : firstDayMonday;

          for (var j = 0; j < firstDayMonday; j++) {
            $scope.dayList.unshift({});
          }

          $scope.rows = [0, 7, 14, 21, 28, 35];
          $scope.cols = [0, 1, 2, 3, 4, 5, 6];

          $scope.currentMonth = $scope.mainObj.monthsList[currentDate.getMonth()];
          $scope.currentYear = currentDate.getFullYear();
          $scope.currentMonthSelected = angular.copy($scope.currentMonth);
          $scope.currentYearSelected = angular.copy($scope.currentYear);
          $scope.numColumns = 7;
        }
      }

      //Month changed
      $scope.monthChanged = function (month) {
        if($scope.mainObj.lanq){
        var monthNumber = $scope.monthsList.indexOf(month);
        var a = georgian2day($scope.currentDate.getFullYear(), $scope.currentDate.getMonth() + 1, $scope.currentDate.getDate());
        var b = dayToShamsi(a);
        var x = shamsiToDay(b.jy, monthNumber, b.jd);
        var y = dayToGeorgian(x);
        $scope.currentDate.setMonth(y.gm);
        refreshDateList($scope.currentDate);
        }
        else{
            var monthNumber = $scope.monthsList.indexOf(month);
        $scope.currentDate.setMonth(monthNumber);
        refreshDateList($scope.currentDate);
        }
      };

      //Year changed
      $scope.yearChanged = function (year) {
        if($scope.mainObj.lanq){
        var a = georgian2day($scope.currentDate.getFullYear(), $scope.currentDate.getMonth() + 1, $scope.currentDate.getDate());
        var b = dayToShamsi(a);
        var x = shamsiToDay(parseInt(year), b.jm, b.jd);
        var y = dayToGeorgian(x);
        $scope.currentDate.setFullYear(y.gy);
        refreshDateList($scope.currentDate);
        }
        else{
           $scope.currentDate.setFullYear(year);
           refreshDateList($scope.currentDate);
        }
      };

      //Setting up the initial object
      function setInitialObj(ipObj) {
        $scope.mainObj = angular.copy(ipObj);
       
        $scope.selctedDateEpoch = resetHMSM($scope.mainObj.inputDate).getTime();
        var d = new Date($scope.selctedDateEpoch);
        var selDate = georgian2day(d.getFullYear(), d.getMonth() + 1, d.getDate());

        $scope.showObj = dayToShamsi(selDate);
        $scope.year = $scope.showObj.jy;
        if ($scope.mainObj.weeksList && $scope.mainObj.weeksList.length === 7) {
          $scope.weeksList = $scope.mainObj.weeksList;
        } else {
          $scope.weeksList = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        }
        if ($scope.mainObj.mondayFirst) {
          $scope.weeksList.push($scope.mainObj.weeksList.shift());
        }
        $scope.disableWeekdays = $scope.mainObj.disableWeekdays;

        refreshDateList($scope.mainObj.inputDate);
        setDisabledDates($scope.mainObj);
      }

      $ionicModal.fromTemplateUrl('lib/Persian-Ionic-Datepicker/src/ionic-datepicker-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.$on('$destroy', function () {
        $scope.modal.remove();
      });

      function openModal() {
        $scope.modal.show();
      }

      function closeModal() {
        $scope.modal.hide();
      }

      $scope.closeIonicDatePickerModal = function () {
        closeModal();
      };
      

      //Open datepicker popup
      provider.openDatePicker = function (ipObj) {
        var buttons = [];
      
         if(localStorage.getItem('calendarType')!='shamsi'){
          ipObj.lanq = false;
          $scope.jl = false;
        }
        else{
          ipObj.lanq = true;
          $scope.jl = true;
        }
        $scope.mainObj = angular.extend({}, config, ipObj);
        if ($scope.mainObj.from) {
          $scope.fromDate = resetHMSM(new Date($scope.mainObj.from)).getTime();
        }
        if ($scope.mainObj.to) {
          $scope.toDate = resetHMSM(new Date($scope.mainObj.to)).getTime();
        }

        if (ipObj.disableWeekdays && config.disableWeekdays) {
          $scope.mainObj.disableWeekdays = ipObj.disableWeekdays.concat(config.disableWeekdays);
        }
        setInitialObj($scope.mainObj);

        if (!$scope.mainObj.closeOnSelect) {
          buttons = [{
            text: $scope.mainObj.setLabel,
            type: 'button_set',
            onTap: function (e) {
              $scope.mainObj.callback($scope.selctedDateEpoch);
            }
          }];
        }

        if ($scope.mainObj.showTodayButton) {
          buttons.push({
            text: $scope.mainObj.todayLabel,
            type: 'button_today',
            onTap: function (e) {
              var today = new Date();
              refreshDateList(new Date());
              //$scope.selctedDateEpoch = resetHMSM(today).getTime();
              $scope.setIonicDatePickerTodayDate();
              if (!$scope.mainObj.closeOnSelect) {
                e.preventDefault();
              }
            }
          });
        }

        buttons.push({
          text: $scope.mainObj.closeLabel,
          type: 'button_close',
          onTap: function (e) {
            console.log('ionic-datepicker popup closed.');
          }
        });

        if ($scope.mainObj.templateType.toLowerCase() == 'popup') {
          $scope.popup = $ionicPopup.show({
            templateUrl: 'lib/Persian-Ionic-Datepicker/src/ionic-datepicker-popup.html',
            scope: $scope,
            cssClass: 'ionic_datepicker_popup',
            buttons: buttons
          });
        } else {
          openModal();
        }
      };

      return provider;

    }];

  })
