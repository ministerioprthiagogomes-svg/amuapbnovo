
import React,{useEffect,useState} from "react"

const API=import.meta.env.VITE_API_URL||"http://localhost:3000"

export default function App(){
 const [drivers,setDrivers]=useState([])

 useEffect(()=>{
  fetch(API+"/drivers")
  .then(r=>r.json())
  .then(setDrivers)
 },[])

 return (
  <div style={{fontFamily:"Arial",padding:40}}>
   <h1>AMUAPB Painel</h1>
   <h2>Motoristas</h2>
   {drivers.map(d=>(
    <div key={d.id}>
      {d.nome} - {d.id}
    </div>
   ))}
  </div>
 )
}
