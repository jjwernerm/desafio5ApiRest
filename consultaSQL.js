const { Pool } = require('pg');
const  format  = require('pg-format');

// Uso un objeto de configuración con las credenciales de postgres y mi DB
const pool = new Pool ({
  host: 'postgresql-joa.alwaysdata.net',
  user: 'joa',
  password: 'Developer123.',
  database: 'joa_joyas',
  port: 5432,
  allowExitOnIdle: true // Le indico a PostgreSQL que cierre la conexión luego de cada consulta
});

const joyas = async ({ limits = 10, order_by = "id_ASC", page = 1}) => {
    if (page <= 0) {
        throw new Error('No existe página 0');
    } else {    
        const [campo, direccion] = order_by.split("_");
        const offset = (page - 1) * limits;
        const formattedQuery = format('SELECT * FROM inventario order by %s %s LIMIT %s OFFSET %s', campo, direccion, limits, offset);
        pool.query(formattedQuery);
        const { rows: inventario } = await pool.query(formattedQuery);
        return inventario;
    }
};

const joyas_HATEOAS = (inventario) => {
    const results = inventario.map((i) => {
        return {
            name: i.nombre,
            href: `/inventario/inventarios/${i.id}`,
        }
    }).slice(0, 4);
    const totalJoyas = inventario.length;
    let stockTotal = inventario.map(i => i.stock).reduce((prev, curr) =>prev + curr, 0);
    const HATEOAS = {
        totalJoyas,
        stockTotal,
        results
    }
    return HATEOAS;
};

const filtros_joyas = async ({ precio_min, precio_max, categoria, metal }) => {
    
    let filtros = []
    const values = []
    
    const agregarFiltro = (campo, comparador, valor) => {
        values.push(valor)
        const { length } = filtros
        filtros.push(`${campo} ${comparador} $${length + 1}`)
    }
    
    if (precio_min) agregarFiltro('precio', '>=', precio_min)
    if (precio_max) agregarFiltro('precio', '<=', precio_max)
    if (categoria) agregarFiltro('categoria', '=', categoria)
    if (metal) agregarFiltro('metal', '=', metal)
    let consulta = "SELECT * FROM inventario"
    
    if (filtros.length > 0) {
        filtros = filtros.join(" AND ")
        consulta += ` WHERE ${filtros}`
    }
    
    const { rows: inventario } = await pool.query(consulta, values)
    return inventario
}

module.exports = { joyas, joyas_HATEOAS, filtros_joyas }