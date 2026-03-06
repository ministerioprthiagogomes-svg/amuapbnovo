
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || "amuapb.db";
const FRONTEND_URL = process.env.FRONTEND_URL || "*";

app.use(cors({ origin: FRONTEND_URL === "*" ? true : FRONTEND_URL }));
app.use(express.json());

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");

db.prepare(`
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  nome TEXT,
  telefone TEXT,
  cidade TEXT,
  veiculo TEXT,
  placa TEXT,
  planoId TEXT,
  status TEXT,
  createdAt TEXT,
  updatedAt TEXT
)`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  nome TEXT,
  tipo TEXT,
  createdAt TEXT
)`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driverId TEXT,
  referencia TEXT,
  valor REAL,
  codigoPix TEXT,
  status TEXT,
  createdAt TEXT,
  paidAt TEXT
)`).run();

const PLAN_VALUES = { bronze:25, prata:35, ouro:50 };

function now(){ return new Date().toISOString() }

app.get("/health",(req,res)=>{
 res.json({status:"ok"})
})

app.get("/drivers",(req,res)=>{
 const rows = db.prepare("SELECT * FROM drivers").all()
 res.json(rows)
})

app.post("/drivers",(req,res)=>{
 const d=req.body
 const nowDate=now()
 db.prepare(`
 INSERT INTO drivers (id,nome,telefone,cidade,veiculo,placa,planoId,status,createdAt,updatedAt)
 VALUES (?,?,?,?,?,?,?,?,?,?)
 `).run(
 d.id,d.nome,d.telefone,d.cidade,d.veiculo,d.placa,d.planoId,"Ativo",nowDate,nowDate
 )
 res.json({ok:true})
})

app.get("/partners",(req,res)=>{
 res.json(db.prepare("SELECT * FROM partners").all())
})

app.post("/pix",(req,res)=>{
 const {driverId}=req.body
 const driver=db.prepare("SELECT * FROM drivers WHERE id=?").get(driverId)
 if(!driver) return res.status(404).json({error:"Motorista não encontrado"})
 const ref=new Date().toISOString().slice(0,7)
 const value=PLAN_VALUES[driver.planoId]||0
 const code=`PIX-AMUAPB-${driverId}-${ref}`
 res.json({codigo:code,valor:value})
})

app.get("/verificar",(req,res)=>{
 const {id}=req.query
 const driver=db.prepare("SELECT * FROM drivers WHERE id=?").get(id)
 if(!driver) return res.json({valid:false})
 res.json({valid:true,driver})
})

app.listen(PORT,()=>{
 console.log("Servidor rodando em http://localhost:"+PORT)
})
