const $=n=>document.querySelector(n),$$=n=>document.querySelectorAll(n),$$$=(n,c,e)=>n.addEventListener(c,e);function iniciarApp(){buscarPorFecha()}function buscarPorFecha(){const n=$("#fecha");$$$(n,"input",(n=>{const c=n.target.value;window.location=`?fecha=${c}`}))}$$$(document,"DOMContentLoaded",(function(){iniciarApp()}));