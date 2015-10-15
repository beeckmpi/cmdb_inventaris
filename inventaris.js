// Dabatabases
Adressen = new Mongo.Collection('Adressen');
Entiteiten = new Mongo.Collection('Entiteiten');
Functies = new Mongo.Collection('Functies');
Hardware = new Mongo.Collection('Hardware');
Personen = new Meteor.Collection('Personen');
Teams = new Mongo.Collection('Teams');
Types = new Mongo.Collection('Types');
Prullenbak = new Mongo.Collection('Prullenbak');
//Client
if (Meteor.isClient) {
  Meteor.subscribe("Entiteiten");
  Meteor.subscribe("Adressen");
  Meteor.subscribe("Functies");
  Meteor.subscribe("Hardware");
  Meteor.subscribe("Teams");
  Meteor.subscribe("Types");
  Meteor.subscribe("Prullenbak");
  Template.Start.onRendered(function(){
    var radio = $("#changeView input[type='radio']:checked").attr('id');    
    if (radio === 'AllesRadio'){
      $('#HardwareTable, #PersoneelTable').css('display', '');
    } else if (radio == 'HardwareRadio'){
      $('#HardwareTable').css('display', '');
      $('#PersoneelTable').css('display', 'none');
    } else if (radio == 'PersoneelRadio'){
      $('#HardwareTable').css('display', 'none');
      $('#PersoneelTable').css('display', '');
    }
    $('#changeView input[type="radio"]').on('change', function(event){
      var radio = $("#changeView input[type='radio']:checked").attr('id');
      Session.set("defaultShow", radio);
      if (radio === 'AllesRadio'){
        $('#HardwareTable, #PersoneelTable').css('display', '');
      } else if (radio === 'HardwareRadio'){
        $('#HardwareTable').css('display', '');
        $('#PersoneelTable').css('display', 'none');
      } else if (radio === 'PersoneelRadio'){
        $('#HardwareTable').css('display', 'none');
        $('#PersoneelTable').css('display', '');
      }
    });
  });
  Template.Start.events({
    'keyup input#SearchInput': function(event){
      var searchText = event.target.value;
      var aantal = $('#aantal option:selected').val();
      Session.set("searchValue", searchText);
      Session.set("searchCount", aantal);
    }, 
    'change #aantal': function(event){
      var searchText = $('#SearchInput').val();
      var aantal = $('#aantal option:selected').val();
      console.log(aantal);
      Session.set("searchValue", searchText);
      Session.set("searchCount", aantal);
    }
  });
  Template.PersoonView.events({
    'click .removeHardware': function(event){
      $this = $(event.target);
      var hardwareId = $this.data('hardwareid');
      var userId = $this.data('userid');
      Meteor.call('hardwareVerwijderen', userId, hardwareId);
    },
    'click .remove': function(event){
      if (confirm('Bent u zeker dat u deze persoonsgegevens wil verwijderen')){
        $this = $(event.target);
        var userId = $this.data('userid');
        Meteor.call('removeUser', userId);
      }
    }
  });
  Template.PersonenToevoegen.events({
    'submit #personenToevoegen': function(event){
      var data = $('#personenToevoegen').serializeJSON();
      data.Geboortedatum = new Date(data.Geboortedatum);
      Meteor.call("persoonToevoegen", data);
      $('#personenToevoegen input, #personenToevoegen select').val('');
      return false;
    }, 
    'change #Functie': function(event){      
      var functie = $('#Functie option:selected').val();
      var functieItem = Functies.findOne({Functie: functie});
      $('#Functiecode, input[name="Functiecode"]').val(functieItem.Functiecode);
    }, 
    'change #Adres': function(event){      
      var adres = $('#Adres option:selected').val();
      var adresItem = Adressen.findOne({Adres: adres});
      $('#Adrescode, input[name="Adrescode"]').val(adresItem.Adrescode);
      $('#Gebouwnummer, input[name="Gebouwnummer"]').val(adresItem.Gebouwnummer);
      $('#Netwerkcode, input[name="Netwerkcode"]').val(adresItem.Netwerkcode);
    }
  });
  Template.PersonenLijst.events({
    'keyup input#searchBox': function(event){
      $('.fc-search-trigger').trigger('click');      
      if (event.target.value == ''){
        $('.fc-search-clear').trigger('click');
      }
    }
  });
  Template.PersonenBewerken.events({
    'submit #personenBewerken': function(event){
      var data = $('#personenBewerken').serializeJSON();
      data.Geboortedatum = new Date(data.Geboortedatum);
      data.Vlimpersnummer = parseInt(data.Vlimpersnummer);
      var id = data.id;
      Meteor.call("persoonBewerken", id, data);
      return false;
    },
    'change #Functie': function(event){      
      var functie = $('#Functie option:selected').val();
      var functieItem = Functies.findOne({Functie: functie});
      $('#Functiecode, input[name="Functiecode"]').val(functieItem.Functiecode);
    }, 
    'change #Adres': function(event){      
      var adres = $('#Adres option:selected').val();
      var adresItem = Adressen.findOne({Adres: adres});
      $('#Adrescode, input[name="Adrescode"]').val(adresItem.Adrescode);
      $('#Gebouwnummer, input[name="Gebouwnummer"]').val(adresItem.Gebouwnummer);
      $('#Netwerkcode, input[name="Netwerkcode"]').val(adresItem.Netwerkcode);
    }
  });
  Template.HardwareView.events({
    'click .remove': function(event){
      if (confirm('Bent u zeker dat u dit wil verwijderen')){
        $this = $(event.target);
        var hardwareId = $this.data('hardwareid');
        Meteor.call('removeHardware', hardwareId);
      }
    }
  });
  Template.HardwareToevoegenAanDB.events({
    'submit #hardwareToevoegen': function(event, template){
      var data = $('#hardwareToevoegen').serializeJSON();
      data.Garantie = new Date(data.Garantie);
      Meteor.call('hardwareToevoegenAan', data);
      $('#hardwareToevoegen input[type="text"], #hardwareToevoegen input[type="date"], #hardwareToevoegen select').val('');
      return false;
    }
  });
  
  Template.HardwareToevoegenAan.events({
    'keyup input#TagnummerSearch': function(event){
      var searchTag = $('#TagnummerSearch').val();
      Meteor.call('getHardware', searchTag);      
    },
    'click .addHardware': function(event){
      $this = $(event.target);
      var hardwareId = $this.data('hardwareid');
      var userId = $this.data('userid');
      console.log('hardwareId: '+hardwareId+' userId: '+userId);
      Meteor.call('hardwareToevoegen', userId, hardwareId);
    },
    'submit #hardwareToevoegen': function(event, template){
      var data = $('#hardwareToevoegen').serializeJSON();
      data.Garantie = new Date(data.Garantie);
      Meteor.call('hardwareToevoegenAan', data);
      $('#hardwareToevoegen input[type="text"], #hardwareToevoegen input[type="date"], #hardwareToevoegen select').val('');
      return false;
    }
  });
  Template.UploadCSV.events({
    'submit #uploadCSV': function(event, template){    
      event.preventDefault();
      var type = $('#typeUpload option:selected').val();
      var amount = 0;
      Papa.parse(template.find('#uploadCSVFile').files[0], {
          header: true,
          dynamicTyping: true,
          workers: true,
          step: function(results, parser) {
            Meteor.call("uploaden", results.data, type);
            console.log("Row errors:", results.errors);
            amount = amount+1;
          },
          error: function(error, File){
            console.log(error);
            $('#uploadCSV input, #uploadCSV select').val('');
            $('#foutboodschap').html(error);
            $('#uploadError').css('display','inherit');
          },
          complete: function(results) {
            console.log(results);            
            $('#uploadCSV input, #uploadCSV select').val('');
            $('#aantalUploads').html(amount);
            $('#type').html(type);
            $('#uploadComplete').css('display','inherit');
          },
          skipEmptyLines: true
      });
    }
  });
  
  Template.Start.helpers({
    messages: function() {   
      var amount = parseInt(Session.get("searchCount"));   
      if (Session.get("searchValue")) {
        var searchTerm = Session.get("searchValue");        
        Meteor.subscribe("personenSearch");
        var searchTerm = new RegExp(searchTerm, 'i');
        var personen = Personen.find(
          {           
            $or: 
            [
              {Naam:{$regex: searchTerm}}, 
              {Voornaam:{$regex: searchTerm}}, 
              {Vlimpersnummer:{$regex: searchTerm}},
              {Adrescode:{$regex: searchTerm}}
            ]      
          }, 
          {
            sort: {Naam: 1}, 
            limit: amount
          }).fetch();        
        var hardware = Hardware.find({$or: [{Tagnummer: {$regex:searchTerm, $options: 'i'}}, {Serienummer: {$regex: searchTerm, $options: 'i'}}, {Productnaam: {$regex: searchTerm, $options: 'i'}}, {Type: {$regex: searchTerm, $options: 'i'}}, {Entiteit: {$regex: searchTerm, $options: 'i'}}]}, {sort:{Tagnummer: 1}, limit: amount}).fetch();
        hardware.forEach(function(hardw, key){
          hardw.Garantie = moment(hardw.Garantie).format('DD-MM-YYYY');
          if (hardw.Garantie == '01-01-1970'){
            hardw.Garantie= "NA";
          }
        });
        var data = {personen: personen, hardware: hardware};
        var radio = $("#changeView input[type='radio']:checked").attr('id');    
        if (radio === 'AllesRadio'){
          $('#HardwareTable, #PersoneelTable').css('display', '');
        } else if (radio == 'HardwareRadio'){
          $('#HardwareTable').css('display', '');
          $('#PersoneelTable').css('display', 'none');
        } else if (radio == 'PersoneelRadio'){
          $('#HardwareTable').css('display', 'none');
          $('#PersoneelTable').css('display', '');
        }
        return data;        
      } else {
        return Personen.find({}, {sort: {Naam: 1}, limit: amount});
      }
    },
    defaultShow: function(){
      return Session.get('defaultShow');
    },
    defaultAmount: function(){
      return Session.get('searchCount');
    },
    checked: function(optionText, selectedValue){
      if(optionText === selectedValue){
        return 'checked';
      }
    },
    active: function(optionText, selectedValue){
      if(optionText === selectedValue){
        return 'active';
      }
    }
  });
  
  Template.PersonenToevoegen.helpers({
    adressen: function(){
      return Adressen.find({}, {sort: {'Adres':1}});
    },
    functies: function(){
      return Functies.find({}, {sort: {'Functie':1}});
    },
    teams: function(){
      return Teams.find({}, {sort: {'teams':1}});
    }
  });
  Template.PersonenBewerken.helpers({
     personen: function() {
      Meteor.subscribe("personen");
    },
    adressen: function(){
      return Adressen.find({}, {sort: {'Adres':1}});
    },
    functies: function(){
      return Functies.find({}, {sort: {'Functie':1}});
    },
    teams: function(){
      return Teams.find({}, {sort: {'teams':1}});
    },
    select: function(optionText, selectedValue){
      if(optionText === selectedValue){
        return 'selected';
      }
    }
  });
  Template.PersonenLijst.helpers({
    
  });
  Template.PersoonView.helpers({    
    personen: function() {
      Meteor.subscribe("personen");
    },
    equals: function(v1, v2) {
        return (v1 === v2);
    }
  });
  Template.HardwareView.helpers({
    equals: function(v1, v2) {
        return (v1 === v2);
    }, 
    nempty: function(value) {
        return (value != '');
    }
  });
  Template.HardwareToevoegenAan.helpers({
    gevondenTags: function(){
      return Session.get('foundTags');
    }
  });
  Template.HardwareToevoegen.helpers({
    entiteiten: function(){
      return Entiteiten.find({}, {sort: {'Entiteit': 1}});
    },
    types: function(){
      return Types.find({}, {sort: {'Types': 1}});
    },
  });
  Template.HardwareBewerken.helpers({
     entiteiten: function(){
      return Entiteiten.find({}, {sort: {'Entiteit': 1}});
    },
    types: function(){
      return Types.find({}, {sort: {'Types': 1}});
    },
    select: function(optionText, selectedValue){
      if(optionText === selectedValue){
        return 'selected';
      }
    }
  });
  PersonenFilter = new Meteor.FilterCollections(Personen, {
    name:'personen',
    template: 'PersonenLijst',
    pager: {
      options: [50, 25, 20, 15, 10],
      itemsPerPage: 15,
      currentPage: 1,
      showPages: 10,
    },
    sort: {
      order: ['desc', 'asc'],
      defaults: [
        ['Naam', 'asc']
      ]
    },
    filters: {
      "Naam": {
        title: 'Naam',
        operator: ['$regex', 'i'],
        condition: '$and',
        searchable: 'required'
      },
      "Team": {
        title: 'Team',
        operator: ['$regex', 'i'],
        condition: '$and',
        searchable: 'optional'
      },
    }
  });
}


//Server
if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.FilterCollections.publish(Personen, {
    name: 'personen',
  });
  Meteor.publish("Hardware", function(){
    return Hardware.find();
  });
  Meteor.publish("Entiteiten", function(){
    return Entiteiten.find();
  });
  Meteor.publish("Functies", function(){
    return Functies.find();
  });
  Meteor.publish("Adressen", function(){
    return Adressen.find();
  });
  Meteor.publish("Teams", function(){
    return Teams.find();
  });
  Meteor.publish("Types", function(){
    return Types.find();
  });
  Meteor.publish("Prullenbak", function(){
    return Prullenbak.find();
  });
  Meteor.publish("personenSearch", function(){
    return Personen.find();
  });
  Meteor.publish("search", function(searchValue) {
    if (!searchValue) {
      return Personen.find({});
    }
    var searchTerm = new RegExp(searchValue, 'i');
    var cursor = Personen.find(
      {
        $or: 
        [
          {Naam:{$regex: searchTerm}}, 
          {Voornaam:{$regex: searchTerm}}, 
          {Vlimpersnummer:{$regex: searchTerm}},
          {Adrescode:{$regex: searchTerm}}
        ]
      }
    );
    return cursor;
  });
}


