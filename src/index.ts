import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Context } from "hono";
import * as mysql from 'mysql';

let koneksi = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '',
  database : 'data_murid'
})

koneksi.connect(err => {
  if(err) {
    console.log('Koneksi ke database error : ', err.stack);
    return;
  }else{
    console.log('Terkoneksi ke database');
  }
});

const app = new Hono()

app.get('/', (c : Context) => {
  return c.text('Hello Hono')
})

// Menampilkan data berupa json
app.get('/murid', async (c : Context) => {
  return new Promise((resolve, reject) => {
    koneksi.query('SELECT * FROM murid', (error, result) => {
      if(error){
        reject(c.json({error : 'Error fetching murid'}, 500));
        return;
      }
      console.log('Data Murid :', result)
      resolve(c.json({murid : result}, 200));
    })
  })
});

app.post('/murid', async(c : Context) => {
  try{
    const {Nama, NIK, Tempat_Lahir, Tanggal_Lahir} = await c.req.json();
    const result = await addDataMurid(Nama, NIK, Tempat_Lahir, Tanggal_Lahir);
    return c.json({message : "Murid Berhasil ditambahkan"}, 201)
  } catch (error) {
    return c.json({error : "Murid Tidak Berhasil Ditambahkan"}, 500)
  }
});

const addDataMurid = (Nama : String, NIK : String, Tempat_Lahir : String, Tanggal_Lahir : Date) : Promise<any> => {
  return new Promise((resolve, reject) => {
    const queryTambah = 'INSERT INTO murid (Nama, NIK, Tempat_Lahir, Tanggal_Lahir) VALUES (?,?,?,?)'
    koneksi.query(queryTambah, [Nama, NIK, Tempat_Lahir, Tanggal_Lahir], (error, result) => {
      if(error){
        reject(error)
      }else{
        resolve(result)
      }
    });
  });
}

serve(app)
console.log('Server berjalan di http://localhost:3000')




