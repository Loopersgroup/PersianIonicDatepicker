angular.module('ionic-datepicker.service', [])

  .service('IonicDatepickerService', function (dateFactory) {

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
            var b = dateFactory.toJalaali(from.getFullYear(), from.getMonth() + 1, from.getDate());
            minYear= b.jy ;
        }
        else{
             minYear = new Date(from).getFullYear();
        }
      }

      if(!isNaN( to.getTime() )){
          if(lanq){
            var b = dateFactory.toJalaali(to.getFullYear(), to.getMonth() + 1, to.getDate());
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
  });
