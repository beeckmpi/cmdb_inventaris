// Router
var OnBeforeActions;

OnBeforeActions = {
  loginRequired : function(route, asd, pause) {
    if (!Meteor.userId()) {
      this.render('login');
    } else {
      this.next();
    }
  },
};
Router.onBeforeAction(OnBeforeActions.loginRequired);
Router.route('/', function() {
  this.render('Start');
});
Router.route('/login', function() {
  this.render('login');
});
Router.route('/uploadCSV', function() {
  this.render('UploadCSV');
});
Router.route('/afmelden', function() {
  Meteor.logout();
  Router.go('/');
});
Router.route('/personen/toevoegen', function() {
  this.render('PersonenToevoegen');
});
Router.route('/personen/bewerken/:id', function() {
  var persoon = Personen.findOne({
    _id : this.params.id
  });
  if (persoon.Geboortedatum != undefined && persoon.Geboortedatum != '') {
    persoon.Geboortedatum = moment(persoon.Geboortedatum).format('YYYY-MM-DD');
  }
  console.log(persoon);
  this.render('PersonenBewerken', {
    data : persoon
  });
});
Router.route('/personen/lijst', function() {
  this.render('PersonenLijst');
});
Router.route('/personen/view/:id', function() {
  Meteor.subscribe("Personen");
  Meteor.subscribe("search");
  var persoon = Personen.findOne({
    _id : this.params.id
  });
  if (persoon != undefined) {
    if (persoon.Geboortedatum && persoon.Geboortedatum != '') {
      persoon.Geboortedatum = moment(persoon.Geboortedatum).format('DD-MM-YYYY');
      if (persoon.Geboortedatum == '01-01-1970') {
        persoon.Geboortedatum = "NA";
      }
    }
    if (persoon.Hardware) {
      var hardware = persoon.Hardware;
      hardware.forEach(function(value, key) {
        if (value.Garantie && value.Garantie != '') {
          value.Garantie = moment(value.Garantie).format('DD-MM-YYYY');
          if (value.Garantie == '01-01-1970') {
            value.Garantie = "NA";
          }
        };
      });
      persoon.Hardware = hardware;
    }
  } else {
    persoon = {};
  }
  $('.tooltip').tooltip({
    position : 'Verwijder de hardware',
    placement : 'right'
  });
  this.render('PersoonView', {
    data : persoon
  });
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
  var persoon = Personen.findOne({
    _id : this.params.id
  });
  this.render('HardwareToevoegenAan', {
    data : persoon
  });
});

Router.route('/hardware/bewerken/:id', function() {
  var hardware = Hardware.findOne({
    _id : this.params.id
  });
  if (hardware != undefined) {
    if (hardware.Garantie != '01-01-1970') {
      hardware.Garantie = moment(hardware.Garantie).format('YYYY-MM-DD');
    }
    if (hardware.extra != undefined) {
      var extra = hardware.extra;
      extra.forEach(function(value, key) {
        if (extra[key]['naam'] == 'datum' || extra[key]['naam'] == 'OntvangenOp') {
          extra[key]['waarde'] = moment(extra[key]['waarde'], 'DD-MM-YYYY').format('YYYY-MM-DD');
        }
      });
      hardware.extra = extra;
    }
    this.render('HardwareBewerken', {
      data : hardware
    });
  }
});
Router.route('/hardware/view/:id', function() {
  Meteor.subscribe("personenSearch");
  if (this.params.query) {
    $('#hardwareBewerkenGelukt').css('display','inherit');
  }
  var hardware = Hardware.findOne({
    _id : this.params.id
  });
  if (hardware != undefined) {
    var user = Personen.findOne({
      $or : [{
        Vlimpersnummer : String(hardware.user.Vlimpersnummer)
      }, {
        Vlimpersnummer : parseInt(hardware.user.Vlimpersnummer)
      }]
    });
    if (user != undefined){
      hardware.user_id = user._id;
    }
    hardware.Garantie = moment(hardware.Garantie).format('DD-MM-YYYY');
    switch (hardware.Status) {
      case "inDienst":
        hardware.Status = 'In dienst';
        break;
      case 'uitDienst':
        hardware.Status = 'Uit dienst';
        break;
      default:
        hardware.Status = 'Uit dienst';
    };
    if (hardware.Garantie == '01-01-1970') {
      hardware.Garantie = "NA";
    }
    this.render('HardwareView', {
      data : hardware
    });
  }
}, {
  name: 'hardware.view'
});
Router.route('/hardware/removeAll', function() {
  Meteor.call("removeAll", 'Hardware');
  this.render('PersonenToevoegen');
});
Router.route('/connectPersoonHardware', function() {
  Meteor.call("connectPersoonHardware");
  this.render('connectPersoonEnHardware');
}); 