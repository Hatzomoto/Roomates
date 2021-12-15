const axios = require('axios');
const {v4: uuidv4} = require('uuid');
const fs = require('fs');
const { send } = require('./correo');

const nuevoRoommate = async () => {
    try{
        const {data} = await axios.get('https://randomuser.me/api');
        const usuario = data.results[0];
        const user = {
            id: uuidv4().slice(30),
            nombre:`${usuario.name.first} ${usuario.name.last}`,
            email: usuario.email,
            debe: Number(),
            recibe: Number(),
        }

        return user;
    }catch(e){
        throw e;
    }
}

const GuardarRoommate = (usuario) => {

    const usuariosJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf8'));
    usuariosJSON.roommates.push(usuario);
    fs.writeFileSync('roommates.json', JSON.stringify(usuariosJSON));

}

const postGasto = (nuevoGasto, jsonroommates, jsongastos) => {

    let participantes = jsonroommates.roommates.map((e) => e.nombre);
    
    let correos = jsonroommates.roommates.map((f) => f.email);
    console.log(correos)
    let gasto = {
        id: uuidv4().slice(30),
        roommate: nuevoGasto.roommate,
        descripcion: nuevoGasto.descripcion,
        monto: nuevoGasto.monto,
        participantes,
    };

    jsongastos.gastos.push(gasto);

    fs.writeFileSync("gastos.json", JSON.stringify(jsongastos));

    jsonroommates.roommates = jsonroommates.roommates.map((b) => {

        if (b.nombre == nuevoGasto.roommate) {
            
            b.recibe += ((nuevoGasto.monto)/jsonroommates.roommates.length);

        }else {
            
            b.debe += ((nuevoGasto.monto)/jsonroommates.roommates.length);

        }
        
        fs.writeFileSync("roommates.json", JSON.stringify(jsonroommates));
    });

    send(correos, nuevoGasto, nuevoGasto).then(() => {
        console.log('Correo enviado a los roommates')
    }).catch((e) => {
        console.log('No se pudo enviar correo a los roommates', e)
    })
}

const putGasto = ( cambioGasto, jsonroommates, jsongastos ) => {

    let principal;
    let monto;
    let participantes;
    let cantidad;
    let nuevoMonto = cambioGasto.monto;

    jsongastos.gastos = jsongastos.gastos.map((b) => {
        if( b.id == cambioGasto.id){

            principal = b.roommate
            monto = b.monto
            participantes = b.participantes.filter((f) => f !== b.roommate)
            cantidad = b.participantes.length
            b. descripcion = cambioGasto.descripcion
            b.monto = cambioGasto.monto

        }
        return b;
    });

    fs.writeFileSync("gastos.json", JSON.stringify(jsongastos));

    jsonroommates.roommates = jsonroommates.roommates.map((e) => {

        if( e.nombre == principal){
            e.recibe -= (monto/cantidad);
            e.recibe += (nuevoMonto/cantidad);
        }else {
            participantes.forEach((f) => {
                if( f == e.nombre ){
                    e.debe -= (monto/cantidad);
                    e.debe += (nuevoMonto/cantidad);
                }
            })
        }

        fs.writeFileSync("roommates.json", JSON.stringify(jsonroommates));
    });
} 

const deleteGasto = ( id, jsonroommates, jsongastos ) => {

    let key = jsongastos.gastos.find( e => e.id == id);
    
    jsongastos.gastos = jsongastos.gastos.filter((b) => b.id !== id);
    fs.writeFileSync("gastos.json", JSON.stringify(jsongastos));

    jsonroommates.roommates = jsonroommates.roommates.map((e) => {

        if( e.nombre == key.roommate){
            e.recibe -= (key.monto/key.participantes.length)
        }else {
            key.participantes.filter((f) => f !== key.roommate).forEach((g) => {
                if( g == e.nombre ){
                    e.debe -= (key.monto/key.participantes.length)
                }
            })
        }
        fs.writeFileSync("roommates.json", JSON.stringify(jsonroommates));
    })
}

module.exports = { nuevoRoommate, GuardarRoommate, postGasto, putGasto, deleteGasto };