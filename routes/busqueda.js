/*jshint esversion: 6 */

// Requires
var express = require('express');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// Inicializar variables
var app = express();

// =================================================
// Búsqueda por colección
// =================================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(regex);
            break;

        case 'medicos':
            promesa = buscarMedicos(regex);
            break;

        case 'hospitales':
            promesa = buscarHospitales(regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: `No existe la colección ${tabla}, las colecciones válidas son: usuarios, medicos y hospitales`,
                errors: { message: 'No existe la colección especificada' }
            });
    }

    promesa.then(datos => {
        res.status(200).json({
            ok: true,
            [tabla]: datos
        });
    });
});


// =================================================
// Búsqueda general
// =================================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(regex), buscarMedicos(regex), buscarUsuarios(regex)])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar los hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email img')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar los médicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img').or({ 'nombre': regex }, { 'email': regex })
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar los usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;