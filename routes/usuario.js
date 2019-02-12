/*jshint esversion: 6 */

// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
// var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

var Usuario = require('../models/usuario');

const usuariosPorPagina = 5;

// =====================================
// Obter todos os datos dos usuarios
// =====================================

app.get('/', (req, res, next) => {

    var pagina = Number(req.query.pagina || 1);

    if (pagina <= 0) {
        pagina = 1;
    }

    Usuario.find({}, 'nombre email img role google')
        .skip(usuariosPorPagina * (pagina - 1))
        .limit(usuariosPorPagina)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando el usuario',
                        errors: err

                    });
                }

                Usuario.count({}, (err, cantidad) => {
                    var paginas = Math.trunc(cantidad / usuariosPorPagina);

                    if (cantidad % usuariosPorPagina != 0) {
                        paginas = paginas + 1;
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        cantidad: cantidad,
                        paginas: paginas
                    });
                });
            });
});

// =================================================
// Actualizar un usuario
// =================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe ningún usuario con el id ${id}`,
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: err
                });
            }

            usuarioGardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGardado
            });
        });
    });
});

// =================================================
// Crear un novo usuario
// =================================================
//app.post('/', mdAutenticacion.verificaToken, (req, res) => {
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGardado,
            usuarioToken: req.usuario
        });
    });
});

// =================================================
// Borrar un usuario por el ID
// =================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;