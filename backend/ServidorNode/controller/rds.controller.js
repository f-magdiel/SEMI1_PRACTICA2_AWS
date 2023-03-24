// se manda a llamar las credenciales de Mysql
const aws_keys = require('../helpers/aws_keys')
var AWS = require('aws-sdk')
const rek = new AWS.Rekognition(aws_keys.rekognition)
require('dotenv').config()
const CryptoJS = require('crypto-js');

const mysql = require('mysql2/promise');
let UsuarioLogueado = 0
class Database {
  constructor(config) {
    this.pool = mysql.createPool(config);
  }

  async query(sql, values) {
    const conn = await this.pool.getConnection();
    try {
      const [rows] = await conn.query(sql, values);
      return rows;
    } catch (err) {
      console.error(err);
    } finally {
      conn.release();
    }
  }

  async close() {
    await this.pool.end();
  }
}
 
const connection = new Database({
  host: process.env.HOST_DB,
  user: process.env.USER_DB,
  password: process.env.PASSWORD_DB,
  database: process.env.DATABASE_DB,
});

//Para cifrar la contraseña
function encryptPassword(password) {
  return CryptoJS.MD5(password).toString();
}

const Descripcion = async (base64) =>{
  var imagen = base64
  let response = ""
  var params = {
    Image: {
      Bytes: Buffer.from(imagen, 'base64'), // se manda la imagen en bytes.
    },
    Attributes: ['ALL'], // Para que se muestren todos los atributos en la deteccion de cara. Como filtros.
  }
  const data = await rek.detectFaces(params).promise()
  let nuevo = data.FaceDetails[0]
  if (nuevo.Gender.Value === "Male"){
    response = "Hombre"
  }else if (nuevo.Gender.Value === "Female"){
    response = "Mujer"
  }
  response += "   " + (nuevo.AgeRange.Low).toString() + " años - " + (nuevo.AgeRange.High).toString()  + " años"
  if (nuevo.Smile.Value){
    response += "   Sonriendo"
  }
  if (nuevo.Eyeglasses.Value){
    response += "   Usa Lentes"
  }
  if (nuevo.Sunglasses.Value){
    response += "   Usa Lentes de Sol"
  }
  if (nuevo.Beard.Value){
    response += "   Tiene Barba"
  }
  if (nuevo.Mustache.Value){
    response += "   Tiene Bigote"
  }
  if (nuevo.EyesOpen.Value){
    response += "   Tiene los Ojos Abiertos"
  }
  if (nuevo.MouthOpen.Value){
    response += "   Tiene la Boca Abierta"
  }
  if (nuevo.Emotions[0] === "SURPRISED"){
    response += "   Sorprendido"
  }else if (nuevo.Emotions[0] === "FEAR"){
    response += "   Miedo"
  }else if (nuevo.Emotions[0] === "SAD"){
    response += "   Triste"
  }else if (nuevo.Emotions[0] === "CONFUSED"){
    response += "   Confundido"
  }else if (nuevo.Emotions[0] === "HAPPY"){
    response += "   Feliz"
  }else if (nuevo.Emotions[0] === "ANGRY"){
    response += "   Enojado"
  }else if (nuevo.Emotions[0] === "CALM"){
    response += "   Calmado"
  }else if (nuevo.Emotions[0] === "DISGUSTED"){
    response += "   Disgustado"
  }
  return response
  
}

const NuevoUsuario = async (req, res) => {
  let body = req.body //body.user, body.name, body.password, body.base64, body.namefoto
  console.log(body)
  const ExisteUsuario = await BuscarUsuario(body.user)
  let verificacion = VerificacionExisteUsuario(ExisteUsuario[0].Cont)
  if (verificacion == false){
    const newpass = encryptPassword(body.password)
    insertar = await insertarNuevoUser(body.user, body.name, newpass)
    const url = await saveImagePerfil(body.namefoto, body.base64)
    const idUs = await ObtenerIdUsuario(body.user)
    const detalles = await Descripcion(body.base64)
    insertarFotoPerfil(url.Location, idUs[0].idUser, detalles)
    res.json({ mensaje: 'Insertado exitosamente', status: true })
  }else if (verificacion == true){
    res.json({ mensaje: 'Ya existe el usuario', error: "ya existe", status: false })
  }else{
    res.json({ mensaje: 'Error', error: ExisteUsuario, status: false })
  }
}

const Login = async (req, res) => {
  UsuarioLogueado = 0
  let body = req.body
  const newpass = encryptPassword(body.pass)
  const ExisteUsuario = await ExistesUsuario(body.user, newpass)
  let verificacion = VerificacionExisteUsuario(ExisteUsuario[0].Cont)
  if (verificacion == true){
    const Credenciales = await CredencialesUsuario(body.user, newpass)
    UsuarioLogueado = Credenciales[0].idUser
    console.log("Login entrada")
    res.json({ login: true, idUsuario: UsuarioLogueado })
  }else{
    res.json({ login: false, idUsuario: UsuarioLogueado })
  }
}

const PaginaInicio = async (req, res) => {
  const DatosUsuarios = await DatosUsuario()
  const FotoPerfil = await DatosFotoPerfil()
  console.log('Datos Enviados Dashboard')
  console.log({ username: DatosUsuarios[0].username, nombre: DatosUsuarios[0].nombre, urlFoto: FotoPerfil[0].urlPerfil, detalles: FotoPerfil[0].detalles })
  res.json({ username: DatosUsuarios[0].username, nombre: DatosUsuarios[0].nombre, urlFoto: FotoPerfil[0].urlPerfil, detalles: FotoPerfil[0].detalles })
}

const DatosCredenciales = async (req, res) => {
  const DatosUsuaris = await DatosUsuarioss()
  const FotoPerfil = await DatosFotoPerfil()
  console.log('Datos Enviados Dashboard')
  console.log({ username: DatosUsuaris[0].username, nombre: DatosUsuaris[0].nombre, pass: DatosUsuaris[0].pass ,urlFoto: FotoPerfil[0].urlPerfil, detalles: FotoPerfil[0].detalles })
  res.json({ username: DatosUsuaris[0].username, nombre: DatosUsuaris[0].nombre,pass: DatosUsuaris[0].pass, urlFoto: FotoPerfil[0].urlPerfil, detalles: FotoPerfil[0].detalles })
}

const CerrarSesion = (req, res) =>{
  let body = req.body
  if (body.Saliste == true){
    UsuarioLogueado = 0
    res.json({ SesionCerrada: true})
  }else{
    res.json({ SesionCerrada: false})
  }
  
}

const ActualizacionDatos = async(req, res) =>{
  let body = req.body
  const Actualizar = await ActualizarDatos(body.user, body.name)
  res.json({ dato_actualizado: true})
}

const ActualizacionFotoPerfil = async(req,res)=>{
  let body = req.body
  const url = await saveImagePerfil(body.namefoto, body.base64)
  const actualizado2 = await ActualizarFoto()
  const detalles = await Descripcion(body.base64)
  insertarFotoPerfil(url.Location, UsuarioLogueado, detalles)
  res.json({ actualizado: true, locacion: url.Location})
}

const ObtenerAlbumes = async (req, res) =>{
  const datos = await ObtenerAlbum()
  //console.log(datos)
  res.json(datos)
}

const mandarFotosPerfil = async (req, res) =>{
  const datos = await mandarPerfil()
  //console.log(datos)
  res.json({ fotosPerfil: datos})
}

const mandarFotosPublicaciones = async (req, res) =>{
  const datos = await ObtenerAlbumFotos()
  //console.log("datos")
  //console.log(datos)
  let datos1 =[]

   
  for (var i = 0; i < datos.length; i++){
   
    const datos11 = await mandarpublicaciones(datos[i].idAlbum)
    
    
    if (datos11.length === 0){
      datos1.push({album:datos[i].nameAlbum, fotos: ["Vacio"]})
      //datos1.push(["Vacio"])
    }else{
      datos1.push({album:datos[i].nameAlbum, fotos: datos11})
      //datos1.push(datos11)
    }
  }
 
  for (var i = 0; i < datos1.length; i++){
    console.log(datos1[i])
  }
  res.json({ fotosPublicaciones: datos1 })
}

/*
const insertarAlbumNuevos = async (req, res) =>{
  let body = req.body
  insertar = await insertarNuevoAlbum(body.name)
  res.json({ AlbumIngresado: true})
}
*/

const insertarAlbumNuevos = async (name) =>{
  insertar = await insertarNuevoAlbum(name)
  res.json({ AlbumIngresado: true})
}

const insertarFotoNueva = async (req, res) =>{
  let body = req.body //body.idAlbum body.base64 body.namefoto
  const etiquetas = await detectarEtiquetas(body.base64)
  console.log("etiquetas")
  console.log(etiquetas)
  for (let i = 0; i < etiquetas.length; i++) {
    const ExisteAlbum = await BuscarAlbum(etiquetas[i])
    console.log(ExisteAlbum)
    let verificacion = VerificacionExisteAlbum(ExisteAlbum[0].Cont)
    if (verificacion == false){
      const a = await insertarAlbumNuevos(etiquetas[i]);
      const url = await saveImagePublicaciones(body.namefoto, body.base64)
      const a1 = await ObteneridAlbum(etiquetas[i])
      insertarFotoenAlbum(url.Location, a1, body.name, body.descrip)
    }else if (verificacion == true){
      const url = await saveImagePublicaciones(body.namefoto, body.base64)
      const a1 = await ObteneridAlbum(etiquetas[i])
      insertarFotoenAlbum(url.Location, a1, body.namefoto, body.descrip)
    }
  }
  res.json({ fotoIngresada: true})
}

const ModificarAlbum = async (req, res) =>{
  let body = req.body //body.idAlbum body.name
  const url = await ActualizarAlbum(body.name, body.idAlbum)
  res.json({ dato_actualizado: true})
}

const EliminarAlbum = async (req, res)=>{
  let body = req.body
  console.log(body)
  const url = await EliminarFotosAlbum(body.idAlbum)
  if (1 == 1){
    const url1 = await EliminarAlbumCs(body.idAlbum)
    console.log(url1)
  }
  res.json({ AlbumEliminado: true})
}

function VerificacionExisteUsuario(dato){
  if (typeof dato === 'number'){
    if (dato == 0){
      return false
    }else{
      return true
    }
  }
  return false
}

function VerificacionExisteAlbum(dato){
  if (typeof dato === 'number'){
    if (dato == 0){
      return false
    }else{
      return true
    }
  }
  return false
}


const detectarEtiquetas = async (base64) => {
  let albumes = []
  var imagen = base64
  var params = {
    Image: {
      Bytes: Buffer.from(imagen, 'base64'),
    },
    MaxLabels: 6, // cosas o similitudes que aparecen en la imagen
  }
  const data = await rek.detectLabels(params).promise();
  let etiquetas = data.Labels
  etiquetas.forEach(element => {
    albumes.push(element.Name)
  });
  return albumes
}

const saveImagePublicaciones = async (id, base64) =>{
  var id = id
  var foto = base64
  //carpeta y nombre que quieran darle a la imagen
  var cadena = 'Fotos_Publicadas/' + id// fotos -> se llama la carpeta UBICACION
  //se convierte la base64 a bytes
  let buff = new Buffer.from(foto, 'base64')

  var s3 = new AWS.S3(aws_keys.s3) // se crea una variable que pueda tener acceso a las caracteristicas de S3

  const params = {
    Bucket: 'practica1-g3-imagenes', // nombre
    Key: cadena, // Nombre de ubicacion
    Body: buff, // Imagen enn bytes
    ContentType: 'image', // tipo de contenido
  }
  const response = await s3.upload(params).promise()

  return response
}

const saveImagePerfil = async (id, base64) =>{
  var id = id
  var foto = base64
  console.log(id)
  //carpeta y nombre que quieran darle a la imagen
  var cadena = 'Fotos_Perfil/' + id // fotos -> se llama la carpeta UBICACION
  //se convierte la base64 a bytes
  console.log(cadena)
  let buff = new Buffer.from(foto, 'base64')

  var s3 = new AWS.S3(aws_keys.s3) // se crea una variable que pueda tener acceso a las caracteristicas de S3

  const params = {
    Bucket: 'practica1-g3-imagenes', // nombre
    Key: cadena, // Nombre de ubicacion
    Body: buff, // Imagen enn bytes
    ContentType: 'image', // tipo de contenido
  }
  const response = await s3.upload(params).promise()

  return response
}

const BuscarUsuario = async (user) => {
  querys = 'SELECT COUNT(idUser) AS Cont FROM Usuario WHERE username = "' + user + '"'
  const response = await connection.query(querys)
  return response
}

const BuscarAlbum = async (nombre) => {
  querys = 'SELECT COUNT(idAlbum) AS Cont FROM Album WHERE nameAlbum = "' + nombre + '"'
  const response = await connection.query(querys)
  return response
}

const ObteneridAlbum = async (nombre) => {
  querys = 'SELECT idAlbum FROM Album WHERE nameAlbum = "' + nombre + '"'
  const response = await connection.query(querys)
  return response
}

const ObtenerIdUsuario = async(user) => {
  querys = 'SELECT idUser FROM Usuario WHERE username = "' + user + '"'
  const response = await connection.query(querys)
  return response
}

const insertarNuevoUser = async (user, name, password) => {
  const response = await connection.query(
    'INSERT INTO Usuario (`username`, `nombre`, `pass`) VALUES (?, ?, ?)',
    [user,name,password])
  return response
}

const insertarFotoenAlbum = (url, idAlbum) => {
  connection.query(
    'INSERT INTO FotoPublicada (`urlPost`, `idAlbum`) VALUES (?, ?)',
    [url, idAlbum])
}

const insertarFotoPerfil = (url, idAlbum, detalles) => {
  connection.query(
    'INSERT INTO FotoPerfin (`urlPerfil`, `activo` ,`idUser`, `detalles`) VALUES (?, ?, ?, ?)',
    [url,1,idAlbum,detalles])
}

const ExistesUsuario = async(user, pass) =>{
  querys = 'SELECT COUNT(idUser) AS Cont FROM Usuario WHERE username = "' + user + '" AND pass = "' + pass + '"'
  const response = await connection.query(querys)
  return response
}

const DatosUsuario = async() =>{
  querys = 'SELECT username, nombre FROM Usuario WHERE idUser = "' + UsuarioLogueado + '"'
  const response = await connection.query(querys)
  return response
}

const DatosUsuarioss = async() =>{
  querys = 'SELECT username, nombre, pass FROM Usuario WHERE idUser = "' + UsuarioLogueado + '"'
  const response = await connection.query(querys)
  return response
}

const DatosFotoPerfil = async() =>{
  querys = 'SELECT urlPerfil, detalles FROM FotoPerfin WHERE idUser = "' + UsuarioLogueado + '" AND activo = 1'
  const response = await connection.query(querys)
  return response
}

const CredencialesUsuario = async(user, pass) =>{
  querys = 'SELECT idUser FROM Usuario WHERE username = "' + user + '" AND pass = "' + pass + '"'
  const response = await connection.query(querys)
  return response
}

const ActualizarDatos = async(user,name) =>{
  querys = 'UPDATE Usuario SET username = "'+ user +'", nombre = "' + name + '" WHERE idUser = "' + UsuarioLogueado +'"'
  const response = await connection.query(querys)
  return response
}

const ActualizarFoto = async() =>{
  querys = 'UPDATE FotoPerfin SET activo = 0 WHERE activo = 1 AND idUser = "' + UsuarioLogueado + '"'
  const response = await connection.query(querys)
  return response
}

const ObtenerAlbum = async() =>{
  querys = 'SELECT idAlbum, nameAlbum FROM Album WHERE idUser = "' + UsuarioLogueado + '"'
  const response = await connection.query(querys)
  return response
}

const mandarPerfil = async() =>{
  querys = 'SELECT urlPerfil FROM FotoPerfin WHERE idUser = "' + UsuarioLogueado + '"'
  const response = await connection.query(querys)
  return response
}

const mandarpublicaciones = async(variable) =>{
  querys = 'SELECT urlPost FROM FotoPublicada WHERE idAlbum = "' + variable + '"'
  const response = await connection.query(querys)
  return response
}

const ObtenerAlbumFotos = async() =>{
  querys = 'SELECT idAlbum,nameAlbum FROM Album WHERE idUser = "' + UsuarioLogueado + '"'
  const response = await connection.query(querys)
  return response
}

const insertarNuevoAlbum = async (name) => {
  const response = await connection.query(
    'INSERT INTO Album (`nameAlbum`, `idUser`) VALUES (?, ?)',
    [name,UsuarioLogueado])
  return response
}

const ActualizarAlbum = async(name,idAlbum) =>{
  querys = 'UPDATE Album SET nameAlbum = "'+ name +'" WHERE idAlbum = "' + idAlbum +'" AND idUser = "' + UsuarioLogueado + '"'
  const response = await connection.query(querys)
  return response
}

const EliminarFotosAlbum = async(idAlbum) =>{
  querys = 'DELETE FROM FotoPublicada WHERE idAlbum = "' + idAlbum + '"'
  const response = await connection.query(querys)
  return response
}

const EliminarAlbumCs = async(idAlbum) =>{
  querys = 'DELETE FROM Album WHERE idAlbum = "' + idAlbum + '"'
  const response = await connection.query(querys)
  return response
}

module.exports = {
  NuevoUsuario,
  Login,
  PaginaInicio,
  ActualizacionDatos,
  ActualizacionFotoPerfil,
  ObtenerAlbumes,
  insertarAlbumNuevos,
  insertarFotoNueva,
  ModificarAlbum,
  EliminarAlbum,
  CerrarSesion,
  DatosCredenciales,
  mandarFotosPerfil,
  mandarFotosPublicaciones,
}
