// Router

Router.route('/', function () {
  this.render('Start');
});
Router.route('/uploadCSV', function () {
  this.render('UploadCSV');
});
Router.route('/personen/toevoegen', function() {
  this.render('PersonenToevoegen');
});
Router.route('/personen/bewerken/:id', function() {
  var persoon = Personen.findOne({_id: this.params.id});
  if (persoon.Geboortedatum && persoon.Geboortedatum != ''){
    persoon.Geboortedatum = moment(persoon.Geboortedatum).format('YYYY-MM-DD');
  } 
  console.log(persoon);
  this.render('PersonenBewerken', {data: persoon});
});
Router.route('/personen/lijst', function() {  
  this.render('PersonenLijst');
});
Router.route('/personen/view/:id', function() {  
  Meteor.subscribe("Personen");
  Meteor.subscribe("search");
  var persoon = Personen.findOne({_id: this.params.id});  
  if (persoon != undefined){
    if (persoon.Geboortedatum && persoon.Geboortedatum != ''){
      persoon.Geboortedatum = moment(persoon.Geboortedatum).format('DD-MM-YYYY');
      if (persoon.Geboortedatum == '01-01-1970'){
        persoon.Geboortedatum = "NA";
      }
    }  
    if (persoon.Hardware){
      var hardware = persoon.Hardware;
      hardware.forEach(function(value, key){
        if (value.Garantie && value.Garantie != ''){
          value.Garantie = moment(value.Garantie).format('DD-MM-YYYY');
          if (value.Garantie == '01-01-1970'){
            value.Garantie= "NA";
          }
        };
      });
      persoon.Hardware = hardware;
    }    
  } else {
    persoon = {};
  }  
  $('.tooltip').tooltip({position: 'Verwijder de hardware', placement: 'right'});
  this.render('PersoonView', {data: persoon});
});
Router.route('/locatie/toevoegen', function() {
  this.render('LocatieToevoegen');
});
Router.route('/personeel/removeAll', function() {
   Meteor.call("removeAll", 'Personen');
   this.render('PersonenToevoegen');
});
Router.route('/hardware/toevoegen', function() {
   this.render('HardwareToevoegenAanDB');
});
Router.route('/hardware/toevoegen/:id', function() {
   var persoon = Personen.findOne({_id: this.params.id});  
   this.render('HardwareToevoegenAan', {data: persoon});
});

Router.route('/hardware/bewerken/:id', function() {
   var hardware = Hardware.findOne({_id: this.params.id});
   if (hardware != undefined){
     console.log(hardware.Garantie);
     hardware.Garantie = moment(hardware.Garantie).format('YYYY-MM-DD');  
     console.log(hardware.Garantie);
     var extra = hardware.extra;
     extra.forEach(function(value, key){
       if (extra[key]['naam']=='datum' || extra[key]['naam']=='OntvangenOp'){                
         extra[key]['waarde'] = moment(extra[key]['waarde'], 'DD-MM-YYYY').format('YYYY-MM-DD');         
       }
     });
     hardware.extra = extra;
     this.render('HardwareBewerken', {data: hardware});
   }    
});
Router.route('/hardware/view/:id', function() {  
   var hardware = Hardware.findOne({_id: this.params.id});
   if (hardware != undefined){
     hardware.Garantie = moment(hardware.Garantie).format('DD-MM-YYYY');  
     if (hardware.Garantie == '01-01-1970'){
      hardware.Garantie = "NA";
     }
     this.render('HardwareView', {data: hardware});
   }
});
Router.route('/hardware/removeAll', function() {
   Meteor.call("removeAll", 'Hardware');
   this.render('PersonenToevoegen');
});
Router.route('/connectPersoonHardware', function() {   
   Meteor.call("connectPersoonHardware");
   this.render('connectPersoonEnHardware');   
});