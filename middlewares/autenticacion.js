/*jshint esversion: 6 */

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// =================================================
// Verificar token
// =================================================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();
        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
    });
};

// =================================================
// Verificar admin
// =================================================
exports.verificaAdmin = function(req, res, next) {
    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token inválido - no es administrador',
            errors: { message: 'No es administrador, petición denegada' }
        });
    }
};

// =================================================
// Verificar admin ou mesmo usuario
// =================================================
exports.verificaAdmin_o_MismoUsuario = function(req, res, next) {
    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token inválido - no es administrador o mismo usuario',
            errors: { message: 'No es administrador o mismo usuario, petición denegada' }
        });
    }
};