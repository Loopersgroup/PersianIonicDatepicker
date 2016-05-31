angular.module('ionic-datepicker.service', [])

  .service('IonicDatepickerService', function () {

    this.monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    this.getYearsList = function (from, to,lanq) {
      
     var minYear = 1390;
     var maxYear = 1420; 
     if(!lanq){
       minYear = 2010;
       maxYear = 2050; 
     }
      var yearsList = [];
      
      // minYear = from ? new Date(from).getFullYear() : minYear;
      // maxYear = to ? new Date(to).getFullYear() : maxYear;

      for (var i = minYear; i <= maxYear; i++) {
        yearsList.push(i);
      }

      return yearsList;
    };
  });
