const { response } = require('express');
const { Producto } = require('../models');


const obtenerProductos = async(req, res = response ) => {

    const { limite = 0, desde = 0 } = req.query;
    const query = { estado: true, disponible: {$gt:0} };

    const [ total, productos ] = await Promise.all([
        Producto.countDocuments(query),
        Producto.find(query)
            .populate('usuario', 'nombre')
            .populate('categoria', 'nombre')
            .skip( Number( desde ) )
            .limit(Number( limite ))
    ]);

    res.json({
        total,
        productos
    });
}

const obtenerProducto = async(req, res = response ) => {

    const { id } = req.params;
    const producto = await Producto.findById( id )
                            .populate('usuario', 'nombre')
                            .populate('categoria', 'nombre');

    res.json( producto );

}

const crearProducto = async(req, res = response ) => {

    try {
        const { estado, usuario, ...body } = req.body;

    const productoDB = await Producto.findOne({ nombre: body.nombre });

    if ( productoDB ) {
        return res.status(400).json({
            msg: `El producto ${ productoDB.nombre }, ya existe`
        });
    }

    // Generar la data a guardar
    const data = {
        ...body,
        nombre: body.nombre.toUpperCase(),
        usuario: req.usuario._id
    }

    const producto = new Producto( data );

    // Guardar DB
    await producto.save();

    res.status(201).json({
        producto,
        msg:"Producto creado exitosamente"
    });
    } catch (error) {
       res.status(400).json({
        msg:"Error al crear el producto"
       }) 
    }

    

}

const actualizarProducto = async( req, res = response ) => {

    try {
        const { id } = req.params;
        const { estado, usuario, ...data } = req.body;

        if(!data.precio || !data.nombre || !data.descripcion || !data.categoria) {
            return res.status(400).json({
                msg: 'los campos nombre, precio, descripcion y categoria no pueden estar vacios'
            })
        } // corregir esta linea
    
        if( data.nombre ) {
            data.nombre  = data.nombre.toUpperCase();
        }
    
        data.usuario = req.usuario._id;
    
        const producto = await Producto.findByIdAndUpdate(id, data, { new: true });
    
        return res.status(200).json({
            producto,
            msg:'Producto editado correctamente'
        });
        

    } catch (error) {
        return res.status(400).json({msg:'Error al crear el producto'})
    }
}
   

const borrarProducto = async(req, res = response ) => {
    try {

        const { id } = req.params;

        const producto = await Producto.findById(id)

        if (producto.estado === false) {
            return res.status(400).json({
                msg: "Este producto ya ha sido borrado"
            })
        }
    const productoBorrado = await Producto.findByIdAndUpdate( id, { estado: false }, {new: true });

    return res.status(200).json({
        msg:"Producto eliminado Exitosamente",
        productoBorrado
    })
    } catch (error) {
        res.status(400).json({
            msg: "Error al eliminar consulte al administrador"
        })
    }
}




module.exports = {
    crearProducto,
    obtenerProductos,
    obtenerProducto,
    actualizarProducto,
    borrarProducto
}