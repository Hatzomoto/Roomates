const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user: 'javascriptnode123@gmail.com',
        pass: 'javascript123', 
    },
});

const send = async (correos, comprador, monto ) => {
    let mailOptions = {
        from : 'javascriptnode123@gmail.com',
        to : ['javascriptnode123@gmail.com'].concat(correos),
        subject : `¡Nuevo gasto registrado!`,
        html : `<h3>Anuncio: ${comprador.roommate} ha registrado un nuevo gasto de $${monto.monto}. <br/> Para revisar los detalles, ingresa a nuestra página web</h3>`
    };

    try{
        const result = await transporter.sendMail(mailOptions);
        return result;
    }catch (e) {
        throw e;
    }
}

module.exports = { send };