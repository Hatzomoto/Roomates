const http = require('http');
const fs = require('fs');
const url = require("url");
const {v4: uuidv4} = require('uuid');
const {nuevoRoommate,GuardarRoommate,postGasto, putGasto, deleteGasto} = require('./funciones');


http
    .createServer((req, res) => {

        let gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
        let roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf8"));

        if (req.url == '/' && req.method == 'GET') {
            res.setHeader('content-type', 'text/html');
            res.end(fs.readFileSync('index.html', 'utf8'));
        }

        if (req.url.startsWith('/roommate') && req.method == 'POST') {
            nuevoRoommate().then(async (usuario) => {
                GuardarRoommate(usuario);
                res.statusCode = 201;
                res.end(JSON.stringify(usuario));
            }).catch(e => {
                res.statusCode = 500;
                res.end();
                console.log('Error en el registro de un nuevo Roommate random', e);
            });
        }

        if (req.url.startsWith('/roommates') && req.method == 'GET') {
            res.setHeader('content-type', 'application/json');
            res.end(fs.readFileSync('roommates.json', 'utf8'));
        }

        if (req.url.startsWith('/gastos') && req.method == 'GET') {
            res.setHeader('content-type', 'application/json');
            res.end(fs.readFileSync('gastos.json', 'utf8'));
        }

        if (req.url.startsWith('/gasto') && req.method == 'POST') {
            let body;
            req.on("data", (payload) => {
                body = JSON.parse(payload);
            });

            req.on("end", () => {
                try{
                    postGasto(body, roommatesJSON, gastosJSON)
                    res.statusCode = 201;
                    res.end();
                }catch (e) {
                    console.log(e)
                    res.end();
                }
                
            });
        }

        if (req.url.startsWith("/gasto?id=") && req.method == "PUT") {
            const {id} = url.parse(req.url, true).query;
            let body;
            req.on("data", (payload) => {
                body = JSON.parse(payload);
                body.id = id;
            });

            req.on("end", () => {
                try{
                    putGasto(body, roommatesJSON, gastosJSON);
                    res.statusCode = 200;
                    res.end();
                }catch (e) {
                    console.log('problemas al modificar gasto', e)
                    res.end();
                }
            });
        }

        if (req.url.startsWith("/gasto?id=") && req.method == "DELETE") {
            try{
                const {id} = url.parse(req.url, true).query;
                deleteGasto(id, roommatesJSON, gastosJSON);
                res.statusCode = 200;
                res.end();
            }catch (e) {
                console.log('Problemas al intentar eliminar gasto', e)
                res.end();
            }
        }

    }).listen(3000, () => console.log('Server OK'))