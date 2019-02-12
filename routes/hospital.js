/*jshint esversion: 6 */

// Requires
var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
var app = express();

var Hospital = require('../models/hospital');

const hospitalesPorPagina = 5;

// =====================================
// Obter todos os datos dun hospital
// =====================================

app.get('/:id', (req, res) => {

    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consultar el hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un hospital con el id' + id,
                    errors: { message: 'No existe un hospital con el id ' + id }
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

// =====================================
// Obter todos os datos dos hospitais
// =====================================

app.get('/', (req, res, next) => {

    var pagina = Number(req.query.pagina || 1);
    var elementosPagina = Number(req.query.elementosPagina || hospitalesPorPagina);

    if (pagina <= 0) {
        pagina = 1;
    }

    Hospital.find({})
        .skip(elementosPagina * (pagina - 1))
        .limit(elementosPagina)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando los hospitales',
                        errors: err

                    });
                }

                Hospital.count({}, (err, cantidad) => {
                    var paginas = Math.trunc(cantidad / elementosPagina);

                    if (cantidad % elementosPagina != 0) {
                        paginas = paginas + 1;
                    }

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        paginas: paginas,
                        cantidad: cantidad
                    });
                });
            });
});

// =================================================
// Actualizar un hospital
// =================================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al consultar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `No existe ningún hospital con el id ${id}`,
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;

        hospital.save((err, hospitalGardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGardado
            });
        });
    });
});

// =================================================
// Crear un novo hospital
// =================================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        //usuario: req.usuario._id
    });

    hospital.save((err, hospitalGardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGardado,
            usuarioToken: req.usuario
        });
    });
});

// =================================================
// Borrar un hospital por el ID
// =================================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        Hospital.count({}, (err, cantidad) => {
            var paginas = Math.trunc(cantidad / elementosPagina);

            if (cantidad % elementosPagina != 0) {
                paginas = paginas + 1;
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalBorrado,
                paginas: paginas
            });
        });
    });
});

module.exports = app;