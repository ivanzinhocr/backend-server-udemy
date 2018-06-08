/*jshint esversion: 6 */

// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

var Medico = require('../models/medico');

const usuariosPorPagina = 5;

// =====================================
// Obter todos os datos dos médicos
// =====================================

app.get('/', (req, res, next) => {

    var pagina = Number(req.query.pagina || 1);

    if (pagina <= 0) {
        pagina = 1;
    }

    Medico.find({})
        .skip(usuariosPorPagina * (pagina - 1))
        .limit(usuariosPorPagina)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando los medicos',
                        errors: err

                    });
                }

                Medico.count({}, (err, cantidad) => {
                    var paginas = Math.trunc(cantidad / usuariosPorPagina);

                    if (cantidad % usuariosPorPagina != 0) {
                        paginas = paginas + 1;
                    }

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        paginas: paginas
                    });
                })
            });
});

// =================================================
// Actualizar un médico
// =================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar el médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe ningún médico con el id ${id}`,
                errors: { message: 'No existe un médico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.hospital = body.hospital;

        medico.save((err, medicoGardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el médico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGardado
            });
        });
    });
});

// =================================================
// Crear un novo médico
// =================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGardado,
            usuarioToken: req.usuario
        });
    });
});

// =================================================
// Borrar un médico por el ID
// =================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con ese id',
                errors: { message: 'No existe un médico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;