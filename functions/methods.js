//Methods
Meteor.methods({
  searchEverything: function(searchTerm){
    if (isNaN(searchTerm)){
      var personen = Personen.find({}, {sort:{Naam: 1}, limit: 25}).fetch();
    } else {
      if(searchTerm.length != 7){
        var searchTermN = (7-searchTerm.length);
        var start = Math.pow(10, searchTermN);
        var extra = start-1;
        start = searchTerm.toString()+start.toString().substr(1);
        extra = searchTerm.toString()+''+extra.toString();
        var hardware = Hardware.find({Tagnummer: {$gte: parseInt(start), $lte: parseInt(extra)}}, {sort:{Tagnummer: 1}, limit: 25}).fetch();
      } else {
        var hardware = Hardware.find({Tagnummer: parseInt(searchTerm)}, {sort:{Tagnummer: 1}, limit: 25}).fetch();
      }
      hardware.forEach(function(hardw, key){
        hardw.Garantie = moment(hardw.Garantie).format('DD-MM-YYYY');
        if (hardw.Garantie == '01-01-1970'){
          hardw.Garantie= "NA";
        }
      });
    }
  },
  persoonToevoegen: function(data){
      Personen.insert(data, function( error, result) { 
        if ( error ) {
          $('#foutboodschap').html(error);
          $('#persoonMislukt').css('display','inherit');
          console.log ( error ); 
        } //info about what went wrong
        if ( result ) { //the _id of new object if successful
          var data = Personen.findOne({_id: result});
          $('#persoonBoodschap').html(data.Voornaam+ ' '+ data.Naam);
          $('#persoonGelukt').css('display','inherit');
        }
      });
  },
  persoonBewerken: function(id, data){
    Personen.update({_id: id}, {$set: data}, function(error, result){
      if ( error ) {
          $('#foutBewerkenboodschap').html(error);
          $('#persoonBewerkenMislukt').css('display','inherit');
          console.log ( error ); 
        } //info about what went wrong
        if ( result ) { //the _id of new object if successful
          var data = Personen.findOne({_id: id});
          $('#persoonBewerkenBoodschap').html(data.Voornaam+ ' '+ data.Naam);
          $('#persoonBewerkenGelukt').css('display','inherit');
        }
    });
  },
  uploaden: function(data, type){
    if (type=="personen"){
      data[0]['Geboortedatum'] = new Date(data[0]['Geboortedatum']);
      data[0]['Vlimpersnummer'] = data[0]['Vlimpersnummer'].toString();
      Personen.insert(data[0]);
    } else if (type=="hardware"){
      data[0]['Garantie'] = new Date(data[0]['Garantie']);
      data[0]['user'] = {NaamEntiteitscode: data[0]['Naam-Entiteitscode'], VoornaamEntiteitsnaam: data[0]['Voornaam-Entiteitsnaam'], GebruikersID: data[0]['GebruikersID']};
      delete data[0]['Naam-Entiteitscode'];
      delete data[0]['Voornaam-Entiteitsnaam'];
      delete data[0]['GebruikersID'];
      data[0]['Tagnummer'] = data[0]['Tagnummer'].toString();
      data[0]['status'] = 'InDienst';
      Hardware.insert(data[0]);
    } else if (type=="tablets"){
      data[0]['user'] = {NaamEntiteitscode: data[0]['NaamEntiteitscode'], VoornaamEntiteitsnaam: data[0]['VoornaamEntiteitsnaam'], Vlimpersnummer: data[0]['Vlimpersnummer']};
      delete data[0]['NaamEntiteitscode'];
      delete data[0]['VoornaamEntiteitsnaam'];
      delete data[0]['Vlimpersnummer'];
      data[0]['Tagnummer'] = data[0]['Tagnummer'].toString();
      data[0]['status'] = 'InDienst';
      data[0]['Type'] = 'TABLET';
      var extra = [];
      for (var key in data[0]){        
        if (key != '' && key != 'user' && key != 'Tagnummer' && key != 'Status' && key != 'Type' && key != 'Productnaam' && key != 'Entiteit' && key != 'Tagnummer' && key != 'Serienummer' && key != 'Status' && key != 'Opmerking'){
          extra.push({naam: key, waarde: data[0][key]});
          delete data[0][key];
        }
      };
      data[0]['extra'] = extra;
      Hardware.insert(data[0]);
    } else if (type=="teams"){
      Teams.insert(data[0]);
    } else if (type=="adressen"){
      Adressen.insert(data[0]);
    } else if (type=="functies"){
      Functies.insert(data[0]);
    } else if (type=="entiteiten"){
      Entiteiten.insert(data[0]);
    } else if (type=="types"){
      Types.insert(data[0]);
    }
  },
  connectPersoonHardware: function(){    
    try {
      Hardware.find().forEach(function(value, key){
        var Naam = value.user.NaamEntiteitscode;   
        Naam = Naam.toUpperCase(); 
        var persoon = Personen.findOne({'Naam': Naam, 'Voornaam': value.user.VoornaamEntiteitsnaam});
        if(persoon != undefined){
          console.log(persoon.Vlimpersnummer);
          value.user['Vlimpersnummer'] = persoon.Vlimpersnummer;
          Hardware.update({_id: value._id}, value);                
        }
      });
    } catch(e){
      throw e;
    }   
    try {
      Personen.find().forEach(function(value, key){  
        Hardware.find({'user.Vlimpersnummer': value.Vlimpersnummer}).forEach(function(hardware, key2){
          var Vlimpersnummer = hardware.user.Vlimpersnummer;
          delete hardware.user;
          console.log(Vlimpersnummer);
          Personen.update({Vlimpersnummer: Vlimpersnummer}, {$addToSet: {Hardware: hardware}});
        });
      });
    } catch(e){
      throw e;
    }    
  },
  personenLijst: function(){
    return Personen.find().limit(50);    
  },
  removePersonen: function(userID){
    var persoon = Personen.findOne({_id: userID});
    persoon.TypeP = 'Personen';
    Prullenbak.insert(persoon);
    Personen.remove({_id: userID}, function(error){
      if (error) return error;
      return 'ok';
    });
  },
  removeAll: function(type){
    if (type=='Personen'){
      Personen.remove({});
    } else if (type=="Hardware") {
      Hardware.remove({});
    }    
  },
  getHardware: function(searchTerm){
    if(searchTerm.length != 7){
      var searchTermN = (7-searchTerm.length);
      var start = Math.pow(10, searchTermN);
      var extra = start-1;
      start = searchTerm.toString()+start.toString().substr(1);
      extra = searchTerm.toString()+''+extra.toString();
      var hardware = Hardware.find({Tagnummer: {$gte: parseInt(start), $lte: parseInt(extra)}}, {sort:{Tagnummer: 1}, limit: 5}).fetch();
    } else {
      var hardware = Hardware.find({Tagnummer: parseInt(searchTerm)}, {sort:{Tagnummer: 1}, limit: 5}).fetch();
    }
    hardware.forEach(function(hardw, key){
      hardw.Garantie = moment(hardw.Garantie).format('DD-MM-YYYY');
      if (hardw.Garantie == '01-01-1970'){
        hardw.Garantie= "NA";
      }
    });
    Session.set('foundTags', hardware);
    return false;
  },
  hardwareVerwijderen: function(userID, hardwareID){
    var hardware = Hardware.findOne({_id: hardwareID});
    var persoon = Personen.findOne({_id: userID});
    if(hardware.user != undefined) delete hardware.user; 
    if(hardware.history != undefined) delete hardware.history;
    Personen.update({_id: userID},{$pull: {Hardware: {Tagnummer: hardware.Tagnummer, Serienummer: hardware.Serienummer}}, $addToSet: {oldHardware:hardware}}, function(error, result){
      if (error) {
        console.log(error);
      } 
      console.log(result);
    });
    Hardware.update({_id: hardwareID}, {$set: {user: {}}, $push:{history:{NaamEntiteitscode:persoon.Naam, VoornaamEntiteitsnaam: persoon.Voornaam, Vlimpersnummer:persoon.Vlimpersnummer}}}, function(error, result){
      if (error) {
        console.log(error);
      }
      console.log(result);
    });
  }, 
  removeHardware: function(hardwareID){
    var hardware = Hardware.findOne({_id: hardwareID});
    hardware.TypeP = 'Hardware';
    console.log(hardware);
    Prullenbak.insert(hardware, function( error, result) { 
      if ( error ) {
        console.log(error);    
      }
    });
    Hardware.remove({_id: hardwareID}, function(error){
      if (error) return error;
      console.log('removed: '+ hardwareID);
      Router.go('/');
    });
  },
  hardwareToevoegen: function(userID, hardwareID){
    var hardware = Hardware.findOne({_id: hardwareID});
    var old_user = hardware.user;
    var persoon = Personen.findOne({_id: userID});
    delete hardware.user; delete hardware.history;
    Personen.update({_id: userID}, {$addToSet: {Hardware:hardware}}, function(error, result){
      if (error) {
        console.log(error);
      } 
      console.log(result);
    });
    Personen.update({Vlimpersnummer: old_user.Vlimpersnummer},{$pull: {Hardware: {Tagnummer: hardware.Tagnummer, Serienummer: hardware.Serienummer}}, $addToSet: {oldHardware:hardware}}, function(error, result){
      if (error) {
        console.log(error);
      } 
      console.log(result);
    });
    Hardware.update({_id: hardwareID}, {$set: {user: {NaamEntiteitscode:persoon.Naam, VoornaamEntiteitsnaam: persoon.Voornaam, Vlimpersnummer:persoon.Vlimpersnummer}}, $push:{history:old_user}}, function(error, result){
      if (error) {
        console.log(error);
      }
      console.log(result);
    });
  }, 
  hardwareToevoegenAan: function(data){
    console.log(data);
    if (data.userid){
      var userID = data.userid;         
      var persoon = Personen.findOne({_id: userID});      
      data.user = {NaamEntiteitscode:persoon.Naam, VoornaamEntiteitsnaam: persoon.Voornaam, Vlimpersnummer:persoon.Vlimpersnummer};  
    }   
    Hardware.insert(data, function( error, result) { 
      if ( error ) {
        $('#foutboodschap').html(error);
        $('#hardwareMislukt').css('display','inherit');
        console.log ( error ); 
      } //info about what went wrong
      if ( result ) { //the _id of new object if successful        
        var data = Hardware.findOne({_id: result});
        Personen.update({_id: userID}, {$addToSet: {Hardware:data}}, function(error, result){
          if (error) {
            console.log(error);
          } 
          console.log(result);
        });        
        $('#hardwareBoodschap').html(data.Tagnummer);        
        if (data.user) {
          $('#username').html(data.user['VoornaamEntiteitsnaam']+ ' ' + data.user['NaamEntiteitscode']);
        }
        $('#hardwareGelukt').css('display','inherit');
      }
    });
  }
});